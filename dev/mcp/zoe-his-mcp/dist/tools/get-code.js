/**
 * 从 GitLab 拉取代码（不依赖本地工作区）
 */
import { getEnvConfig } from '../config.js';
import {
    getGitLabConfig,
    loadRepositories,
    matchRepository,
    inferBranchFromTag,
    getRepositorySourceInfo,
    discoverGitLabProjects,
} from '../gitlab/repos.js';

function extractProjectPath(repoUrl) {
    let projectPath = repoUrl;
    if (projectPath.startsWith('http')) {
        projectPath = projectPath.replace(/^https?:\/\/gitlab\.zoesoft\.com\.cn\//, '');
    }
    return projectPath.replace(/\//g, '%2F');
}

async function getFileContent(baseUrl, encodedProjectPath, token, filePath, branch, startLine, endLine, searchPattern) {
    const encodedFilePath = filePath.replace(/\//g, '%2F');
    let url = `${baseUrl}/api/v4/projects/${encodedProjectPath}/repository/files/${encodedFilePath}?ref=${branch}&private_token=${token}`;
    let response = await fetch(url);

    if (!response.ok) {
        const fallbackBranch = branch === 'main' ? 'master' : 'main';
        url = `${baseUrl}/api/v4/projects/${encodedProjectPath}/repository/files/${encodedFilePath}?ref=${fallbackBranch}&private_token=${token}`;
        response = await fetch(url);
    }

    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    const fullContent = Buffer.from(data.content, 'base64').toString('utf-8');
    const allLines = fullContent.split('\n');
    const totalLines = allLines.length;

    if (searchPattern) {
        const matched = [];
        const lowerPattern = searchPattern.toLowerCase();
        for (let i = 0; i < allLines.length; i++) {
            if (allLines[i].toLowerCase().includes(lowerPattern)) {
                const start = Math.max(0, i - 10);
                const end = Math.min(allLines.length, i + 11);
                if (matched.length > 0) matched.push('---');
                matched.push(`[匹配行 ${i + 1}，上下文 ${start + 1}-${end}]:`);
                matched.push(...allLines.slice(start, end));
            }
        }
        if (matched.length === 0) {
            return `在文件中未找到 "${searchPattern}"\n文件共 ${totalLines} 行`;
        }
        const result = matched.join('\n');
        return result.length > 8000 ? result.substring(0, 8000) + '\n... (已截断)' : result;
    }

    if (startLine !== undefined && endLine !== undefined) {
        const start = Math.max(1, startLine) - 1;
        const end = Math.min(totalLines, endLine);
        return allLines.slice(start, end).map((l, i) => `${start + i + 1}: ${l}`).join('\n');
    }

    const MAX_LINES = 300;
    if (totalLines > MAX_LINES) {
        const preview = allLines.slice(0, MAX_LINES).map((l, i) => `${i + 1}: ${l}`).join('\n');
        return preview + `\n\n⚠️ 文件共 ${totalLines} 行，仅显示前 ${MAX_LINES} 行。请用 startLine/endLine 或 searchPattern 缩小范围。`;
    }

    return allLines.map((l, i) => `${i + 1}: ${l}`).join('\n');
}

async function listRepositoryFiles(baseUrl, repoUrl, token, branch) {
    const encodedProjectPath = extractProjectPath(repoUrl);
    const triedBranches = [];
    let actualBranch = branch;

    const fetchTree = async (dirPath, useBranch) => {
        const encodedPath = dirPath.replace(/\//g, '%2F');
        const url = `${baseUrl}/api/v4/projects/${encodedProjectPath}/repository/tree?path=${encodedPath}&ref=${useBranch}&per_page=100&private_token=${token}`;
        const resp = await fetch(url);
        return resp.ok ? resp.json() : [];
    };

    const tryBranches = async (dirPath) => {
        let entries = await fetchTree(dirPath, branch);
        triedBranches.push(branch);
        if (entries.length === 0) {
            const fallback = branch === 'main' ? 'master' : 'main';
            entries = await fetchTree(dirPath, fallback);
            triedBranches.push(fallback);
            if (entries.length > 0) {
                actualBranch = fallback;
            }
        }
        return entries;
    };

    const rootEntries = await tryBranches('');
    const allFiles = rootEntries.filter((e) => e.type === 'blob').map((e) => e.path);
    const trees = rootEntries.filter((e) => e.type === 'tree').map((e) => e.path);

    for (const tree of trees.slice(0, 8)) {
        const entries = await tryBranches(tree);
        allFiles.push(...entries.filter((e) => e.type === 'blob').map((e) => e.path));
    }

    return { files: allFiles, triedBranches: [...new Set(triedBranches)], actualBranch };
}

export async function getCode(args) {
    try {
        const { projectConfig } = getEnvConfig();
        const projectCode = projectConfig?.id || process.env.ZOE_PROJECT_CODE || 'default';
        const gitlab = getGitLabConfig();

        if (!gitlab.token) {
            return {
                success: false,
                error: '未配置 GITLAB_TOKEN，请在 zoe-his-mcp/.env 中设置 GitLab Private Token',
            };
        }

        const repositories = loadRepositories(projectCode);
        if (repositories.length === 0) {
            const sourceInfo = getRepositorySourceInfo(projectCode);
            return {
                success: false,
                error: `项目 ${projectCode} 无代码仓库条目。${sourceInfo.hint || '请编辑 code-repositories.json 填写实际 repositoryUrl（勿臆测 onelink-micro-* 命名）'}`,
                data: { projectCode, gitlabPrefix: sourceInfo.gitlabPrefix },
            };
        }

        const cleanServiceName = (args.serviceName === 'undefined' || args.serviceName === 'null')
            ? undefined
            : args.serviceName;

        const sqlId = args.sqlId || '';
        const className = args.className || (sqlId.includes('.') ? sqlId.split('.').slice(0, -1).join('.') : '');

        const matchResult = matchRepository(repositories, {
            serviceName: cleanServiceName || '',
            requestUrl: args.requestUrl || args.urlPath || '',
            sqlId,
            className,
            urlPath: args.urlPath || '',
        });

        if (!matchResult) {
            return {
                success: false,
                error: `无法根据线索匹配仓库。请补充 serviceName/sqlId/urlPath，或 list_code_repositories / discover_gitlab_projects 确认实际仓库名`,
                data: {
                    hints: { serviceName: cleanServiceName, sqlId, className, urlPath: args.urlPath },
                    availableRepos: repositories.map((r) => ({ name: r.name, url: r.repositoryUrl })),
                },
            };
        }

        const repoConfig = matchResult.repo;
        const matchDetail = matchResult.matchDetail;

        let targetBranch = args.branch || '';
        if (!targetBranch && args.tag) {
            targetBranch = inferBranchFromTag(args.tag);
        }
        if (!targetBranch) {
            targetBranch = repoConfig.defaultBranch || gitlab.defaultBranch;
        }

        const encodedProjectPath = extractProjectPath(repoConfig.repositoryUrl);

        if (!args.filePath && (args.searchPattern || args.startLine !== undefined || args.endLine !== undefined)) {
            return {
                success: false,
                error: '使用 searchPattern/startLine/endLine 时必须指定 filePath。先不带 filePath 调用以获取文件列表。',
            };
        }

        if (args.filePath) {
            const lastSegment = args.filePath.split('/').pop() || '';
            const isDirectoryLike = args.filePath.endsWith('/') || !lastSegment.includes('.');
            if (isDirectoryLike) {
                return {
                    success: false,
                    error: `"${args.filePath}" 像是目录。请先 list 文件再指定具体 .java/.xml/.vue 路径。`,
                };
            }

            const content = await getFileContent(
                gitlab.baseUrl,
                encodedProjectPath,
                gitlab.token,
                args.filePath,
                targetBranch,
                args.startLine,
                args.endLine,
                args.searchPattern,
            );

            if (content === null) {
                return {
                    success: false,
                    error: `获取文件失败: ${args.filePath} (分支: ${targetBranch})`,
                };
            }

            return {
                success: true,
                data: {
                    serviceName: cleanServiceName || repoConfig.name,
                    repositoryName: repoConfig.name,
                    repositoryUrl: repoConfig.repositoryUrl,
                    matchDetail,
                    branch: targetBranch,
                    filePath: args.filePath,
                    content,
                },
            };
        }

        const { files, triedBranches, actualBranch } = await listRepositoryFiles(
            gitlab.baseUrl,
            repoConfig.repositoryUrl,
            gitlab.token,
            targetBranch,
        );

        if (files.length === 0) {
            return {
                success: false,
                error: `仓库 ${repoConfig.name} 未找到文件 (已尝试分支: ${triedBranches.join(', ')})`,
            };
        }

        const codeFiles = files.filter((f) => /\.(java|xml|vue|ts|js)$/i.test(f)).slice(0, 40);

        return {
            success: true,
            data: {
                serviceName: cleanServiceName || repoConfig.name,
                repositoryName: repoConfig.name,
                repositoryUrl: repoConfig.repositoryUrl,
                matchDetail,
                branch: actualBranch || targetBranch,
                files: codeFiles.length > 0 ? codeFiles : files.slice(0, 40),
                totalFiles: files.length,
                hint: '根据 sqlId/类名选择 filePath，再用 searchPattern 搜索方法体',
            },
        };
    } catch (error) {
        console.error('getCode error:', error);
        return { success: false, error: error.message };
    }
}

export async function listCodeRepositories() {
    const { projectConfig } = getEnvConfig();
    const projectCode = projectConfig?.id || process.env.ZOE_PROJECT_CODE || 'default';
    const repositories = loadRepositories(projectCode);
    const sourceInfo = getRepositorySourceInfo(projectCode);
    return {
        success: true,
        data: {
            projectCode,
            gitlabPrefix: sourceInfo.gitlabPrefix,
            configSource: sourceInfo.source,
            repositories: repositories.map((r) => ({
                name: r.name,
                repositoryUrl: r.repositoryUrl,
                servicePatterns: r.servicePatterns,
                packagePatterns: r.packagePatterns,
                sqlIdPatterns: r.sqlIdPatterns,
                notes: r.notes,
                defaultBranch: r.defaultBranch,
            })),
        },
    };
}

export async function discoverGitlabProjectsTool() {
    const { projectConfig } = getEnvConfig();
    const projectCode = projectConfig?.id || process.env.ZOE_PROJECT_CODE || 'default';
    return discoverGitLabProjects(projectCode);
}
