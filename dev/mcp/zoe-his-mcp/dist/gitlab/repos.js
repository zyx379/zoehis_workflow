/**
 * 代码仓库配置（按医院显式配置，不按命名规则臆测）
 *
 * 规则：
 * - 未在 projectPrefixes 登记 → 使用 default（公司库 onelink/fj-common）
 * - 已登记项目 → 仅使用该项目下显式配置的 repositoryUrl 列表
 * - 匹配时综合 serviceName、requestUrl、sqlId、Java 包名 等多线索打分
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getGitLabConfig as getGitLabConfigFromDevEnv } from '../load-dev-env.js';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
const GITLAB_HOST = 'gitlab.zoesoft.com.cn';
const DEFAULT_PREFIX = 'http://gitlab.zoesoft.com.cn/onelink/fj-common';

function readConfigFile() {
    const configPath = join(projectRoot, 'code-repositories.json');
    if (!existsSync(configPath)) {
        return { _meta: {}, default: [] };
    }
    return JSON.parse(readFileSync(configPath, 'utf-8'));
}

export function getRepositoryConfigMeta() {
    const all = readConfigFile();
    const meta = all._meta || {};
    return {
        defaultPrefix: meta.defaultPrefix || DEFAULT_PREFIX,
        projectPrefixes: meta.projectPrefixes || {},
    };
}

export function getGitLabConfig() {
    // 统一来源：dev-env.json（姓名默认等于 gitlab 用户名），回退 .env
    return getGitLabConfigFromDevEnv();
}

/**
 * 已登记项目 → 仅项目列表；未登记 → default
 * 不做「替换前缀 + 臆测仓库名」
 */
export function loadRepositories(projectCode) {
    const all = readConfigFile();
    const defaultRepos = all.default || [];

    if (!projectCode) {
        return defaultRepos;
    }

    const { projectPrefixes } = getRepositoryConfigMeta();
    const projectRepos = all[projectCode];

    if (Array.isArray(projectRepos) && projectRepos.length > 0) {
        return projectRepos;
    }

    if (projectPrefixes[projectCode]) {
        return [];
    }

    return defaultRepos;
}

export function getRepositorySourceInfo(projectCode) {
    const all = readConfigFile();
    const { defaultPrefix, projectPrefixes } = getRepositoryConfigMeta();
    const projectRepos = all[projectCode];

    if (Array.isArray(projectRepos) && projectRepos.length > 0) {
        return {
            projectCode,
            source: 'project',
            gitlabPrefix: projectPrefixes[projectCode] || defaultPrefix,
            count: projectRepos.length,
        };
    }

    if (projectPrefixes[projectCode]) {
        return {
            projectCode,
            source: 'projectPrefixOnly',
            gitlabPrefix: projectPrefixes[projectCode],
            count: 0,
            hint: '已在 projectPrefixes 登记但未配置仓库条目，请补充 code-repositories.json 或调用 discover_gitlab_projects',
        };
    }

    return {
        projectCode,
        source: 'default',
        gitlabPrefix: defaultPrefix,
        count: (all.default || []).length,
    };
}

function splitPatterns(value) {
    if (!value) return [];
    return String(value).split(',').map((p) => p.trim().toLowerCase()).filter(Boolean);
}

function countPatternHits(text, patterns) {
    const lower = (text || '').toLowerCase();
    let hits = 0;
    const matched = [];
    for (const pattern of patterns) {
        if (!pattern) continue;
        if (lower.includes(pattern) || (lower && pattern.includes(lower))) {
            hits++;
            matched.push(pattern);
        }
    }
    return { hits, matched };
}

/**
 * 多线索匹配仓库（灵活分析）
 */
export function matchRepository(repositories, hints = {}) {
    const {
        serviceName = '',
        requestUrl = '',
        sqlId = '',
        className = '',
        urlPath = '',
    } = hints;

    const cleanServiceName = (serviceName === 'undefined' || serviceName === 'null') ? '' : serviceName;
    const searchText = [cleanServiceName, requestUrl, urlPath, className, sqlId].filter(Boolean).join(' ').toLowerCase();

    if (repositories.length === 0) {
        return undefined;
    }

    let bestMatch;
    let bestScore = 0;
    let bestDetail = null;

    for (const repo of repositories) {
        const servicePatterns = splitPatterns(repo.servicePatterns);
        const packagePatterns = splitPatterns(repo.packagePatterns);
        const sqlIdPatterns = splitPatterns(repo.sqlIdPatterns);

        const serviceHit = countPatternHits(searchText, servicePatterns);
        const packageHit = countPatternHits(`${className} ${sqlId}`, packagePatterns);
        const sqlHit = countPatternHits(sqlId, sqlIdPatterns);

        const score = serviceHit.hits * 3 + packageHit.hits * 4 + sqlHit.hits * 5;

        if (score > bestScore) {
            bestScore = score;
            bestMatch = repo;
            bestDetail = {
                score,
                serviceMatched: serviceHit.matched,
                packageMatched: packageHit.matched,
                sqlIdMatched: sqlHit.matched,
            };
        }
    }

    if (bestMatch && bestScore > 0) {
        return { repo: bestMatch, matchDetail: bestDetail };
    }

    if (repositories.length === 1) {
        return {
            repo: repositories[0],
            matchDetail: { score: 0, fallback: 'onlyOneRepo' },
        };
    }

    return undefined;
}

/** 列出 GitLab 分组下项目（需 Token），用于不确定仓库名时 */
export async function discoverGitLabProjects(projectCode) {
    const { projectPrefixes } = getRepositoryConfigMeta();
    const groupPath = projectPrefixes[projectCode];
    if (!groupPath) {
        return { success: false, error: `项目 ${projectCode} 未配置 projectPrefixes` };
    }

    const { baseUrl, token } = getGitLabConfig();
    if (!token) {
        return { success: false, error: '未配置 GITLAB_TOKEN，无法列举分组项目' };
    }

    const pathFromUrl = groupPath.replace(/^https?:\/\/[^/]+\//, '');
    const encoded = encodeURIComponent(pathFromUrl);

    try {
        const url = `${baseUrl}/api/v4/groups/${encoded}/projects?per_page=100&include_subgroups=true&private_token=${token}`;
        const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!resp.ok) {
            const searchUrl = `${baseUrl}/api/v4/projects?search=${encodeURIComponent(pathFromUrl.split('/').pop())}&per_page=50&private_token=${token}`;
            const searchResp = await fetch(searchUrl, { signal: AbortSignal.timeout(15000) });
            if (!searchResp.ok) {
                return { success: false, error: `GitLab API HTTP ${resp.status}` };
            }
            const projects = await searchResp.json();
            return {
                success: true,
                data: {
                    projectCode,
                    groupPrefix: groupPath,
                    source: 'search',
                    projects: projects.map((p) => ({
                        name: p.name,
                        path: p.path_with_namespace,
                        webUrl: p.web_url,
                    })),
                },
            };
        }

        const projects = await resp.json();
        return {
            success: true,
            data: {
                projectCode,
                groupPrefix: groupPath,
                source: 'group',
                projects: projects.map((p) => ({
                    name: p.name,
                    path: p.path_with_namespace,
                    webUrl: p.web_url,
                })),
            },
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export function inferBranchFromTag(tag) {
    if (!tag) return '';
    if (tag.startsWith('release-0')) {
        return 'master';
    }
    const match = tag.match(/^(release-\d+\.\d+)/);
    if (match) {
        return match[1];
    }
    return '';
}
