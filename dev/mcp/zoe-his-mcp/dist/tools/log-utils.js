/**
 * 日志工具函数
 * 复用主项目的 logUtils.ts 逻辑
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ApiClient } from '../api-client.js';
import { getFirstTokenFromRedis } from '../redis.js';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

function readLogProfiles() {
    const configPath = join(projectRoot, 'log-profiles.json');
    if (!existsSync(configPath)) {
        return { default: { architecture: 'onelink' } };
    }
    return JSON.parse(readFileSync(configPath, 'utf-8'));
}

/** 按 ZOE_PROJECT_CODE 取日志入参配置（南安 legacy / 默认 onelink） */
export function getLogProfile(projectCode) {
    const all = readLogProfiles();
    const base = all.default || {};
    const merged = (!projectCode || !all[projectCode])
        ? { ...base }
        : { ...base, ...all[projectCode] };
    const envArch = projectCode
        ? process.env[`ZOE_${projectCode}_LOG_ARCHITECTURE`]
        : undefined;
    if (envArch) {
        merged.architecture = envArch;
        const profileEntry = projectCode ? all[projectCode] : undefined;
        if (profileEntry?.requireTimestamp === undefined) {
            merged.requireTimestamp = envArch === 'legacy';
        }
    }
    return merged;
}

/** 莆田等：legacy 路径但 msgid SQL 须走 onelink 风格 filter（避免平台 NPE） */
function usesOnelinkSqlMsgidFilter(profile, args) {
    if (profile.legacySqlMsgidFilter !== 'onelink') {
        return false;
    }
    return !!(args.msgid?.trim() || args.filterParamet?.sql?.sqlFragment);
}

export function isLegacyLogProject(projectCode) {
    return getLogProfile(projectCode).architecture === 'legacy';
}

/** 旧架构 filterParamet（对齐南安日志平台 UI） */
export function buildLegacyFilterParamet(overrides = {}) {
    return {
        sortColumns: 'timestamp',
        sortOrder: '',
        runTime: '',
        ipAndPort: '',
        stack: '',
        ...overrides,
    };
}

/**
 * 旧架构日志查询体：必带 timestamp；filterParamet 用 sortColumns 等，不用 searchType/searchValue
 */
export function buildLegacyLogQuery(args, profile, logKind) {
    const indices = profile.indices || {};
    const logTypes = profile.logTypes || {};
    const days = args.timeRangeDays ?? profile.defaultTimeRangeDays ?? 3;
    const timestamp = args.timeRange ?? defaultLogTimestamp(days);
    return {
        pageSize: args.pageSize || '20',
        pageNum: args.pageNum || '1',
        indexvalue: args.indexvalue || indices[logKind] || `log-${logKind}*`,
        logType: args.logType || logTypes[logKind] || logKind,
        serviceName: args.serviceName || '',
        traceId: args.traceId || '',
        sqlId: args.sqlId || '',
        logLevel: args.logLevel || [],
        filterParamet: args.filterParamet ?? buildLegacyFilterParamet(),
        timestamp,
    };
}
export async function createLogApiClient(options) {
    let configToUse;
    let tokenToUse = options.apiToken;
    if (options.apiBaseUrl) {
        configToUse = {
            baseUrl: options.apiBaseUrl,
            logPath: options.apiLogPath,
            authType: 'custom',
            customHeaderName: 'onelinkToken',
        };
    }
    // 尝试从 Redis 获取 Token
    if (!tokenToUse && options.redisConfig) {
        tokenToUse = await getFirstTokenFromRedis(options.redisConfig) ?? undefined;
    }
    if (!configToUse)
        return null;
    const apiClient = new ApiClient(configToUse);
    if (tokenToUse) {
        apiClient.setToken(tokenToUse);
    }
    return apiClient;
}
export function buildBaseLogQuery(args, projectCode) {
    const profile = getLogProfile(projectCode);
    const logKind = args.logKind || args.logType || 'http';
    if (profile.architecture === 'legacy') {
        return buildLegacyLogQuery({
            ...args,
            indexvalue: args.indexvalue,
            logType: args.logType,
        }, profile, logKind);
    }
    const searchValue = args.keyword || args.sqlId || args.traceId || '';
    const filterParam = {
        searchType: '2',
        termChecked: !!args.sqlId,
        matchChecked: !args.sqlId,
        wildcardChecked: false,
        operator: args.sqlId ? 'AND' : '',
        value: args.sqlId || '',
        searchValue,
    };
    return {
        pageSize: args.pageSize || '20',
        pageNum: args.pageNum || '1',
        indexvalue: args.indexvalue,
        logType: args.logType,
        serviceName: args.serviceName || '',
        canary: '',
        traceId: args.traceId || '',
        sqlId: args.sqlId || '',
        logLevel: args.logLevel || [],
        filterParam,
        filterParamet: filterParam,
    };
}
/**
 * 医保 msgid 精确检索（对齐日志平台 UI：filterParamet.sql.sqlFragment + sqlType）
 * sqlFragment 匹配 INSERT 语句正文中的 msgid，可唯一定位医保交易日志。
 */
export function buildMsgidSqlFilter(msgid, sqlType = 'INSERT') {
    return {
        searchType: '2',
        matchChecked: true,
        wildcardChecked: false,
        sortColumns: 'timestamp',
        sortOrder: '',
        exClassName: '',
        exMsg: '',
        ipAndPort: '',
        resultCount: '',
        runTime: '',
        sql: {
            sqlType: sqlType || 'INSERT',
            sqlFragment: msgid.trim(),
        },
        stack: '',
    };
}
/** 默认查近 3 天，与 UI 时间范围一致时可传 timeRange 覆盖 */
export function defaultLogTimestamp(days = 3) {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
    };
}
export function buildSqlLogQuery(args, projectCode) {
    const profile = getLogProfile(projectCode);
    const hasMsgidLookup = !!(args.msgid?.trim() || args.filterParamet?.sql?.sqlFragment);
    const timestamp = args.timeRange ?? (hasMsgidLookup || profile.requireTimestamp
        ? defaultLogTimestamp(args.timeRangeDays ?? profile.defaultTimeRangeDays ?? 3)
        : undefined);

    if (profile.architecture === 'legacy') {
        if (usesOnelinkSqlMsgidFilter(profile, args)) {
            const filterParamet = args.filterParamet
                ?? (args.msgid ? buildMsgidSqlFilter(args.msgid, args.sqlType) : {});
            return {
                pageSize: args.pageSize || '20',
                pageNum: args.pageNum || '1',
                indexvalue: args.indexvalue || profile.indices?.sql || 'log-sql*',
                logType: args.logType || profile.logTypes?.sql || 'sql',
                serviceName: args.serviceName || '',
                traceId: args.traceId || '',
                sqlId: args.sqlId || '',
                logLevel: args.logLevel || [],
                filterParamet,
            };
        }
        const filterParamet = args.filterParamet
            ?? (args.msgid
                ? buildLegacyFilterParamet({
                    sql: {
                        sqlType: args.sqlType || 'INSERT',
                        sqlFragment: args.msgid.trim(),
                    },
                })
                : buildLegacyFilterParamet());
        return buildLegacyLogQuery({
            ...args,
            filterParamet,
            timeRange: timestamp,
            logKind: 'sql',
        }, profile, 'sql');
    }

    const filterParamet = args.filterParamet
        ?? (args.msgid ? buildMsgidSqlFilter(args.msgid, args.sqlType) : {});
    const query = {
        traceId: args.traceId || '',
        indexvalue: 'log-sql*',
        logType: 'sql',
        pageNum: args.pageNum || '1',
        pageSize: args.pageSize || '20',
        serviceName: args.serviceName || '',
        canary: '',
        sqlId: args.sqlId || '',
        logLevel: args.logLevel || [],
        filterParamet,
    };
    if (timestamp) {
        query.timestamp = timestamp;
    }
    return query;
}
/** 客户端过滤：日志正文含 msgid，优先 INSERT */
export function filterLogsByMsgid(logs, msgid, sqlType) {
    if (!Array.isArray(logs) || !msgid?.trim())
        return [];
    const needle = msgid.trim();
    const matched = logs.filter(log => JSON.stringify(log).includes(needle));
    if (!sqlType)
        return matched;
    const typed = matched.filter(log => (log.sqlType || '').toUpperCase() === sqlType.toUpperCase());
    return typed.length > 0 ? typed : matched;
}
/**
 * 从 SQL/HTTP 等日志记录中提取 traceId
 */
export function extractTraceIdFromLogs(logs) {
    if (!Array.isArray(logs))
        return null;
    for (const log of logs) {
        const traceId = log.traceId || log.originalLog?.traceId;
        if (traceId && String(traceId).trim()) {
            return String(traceId).trim();
        }
    }
    return null;
}
export function normalizeLogEvidence(log) {
    return {
        traceId: log.traceId || log.originalLog?.traceId,
        logType: log.logType || log.originalLog?.logType || '',
        level: log.logLevel,
        serviceName: log.serviceName,
        timestamp: log.timestamp || log.originalLog?.timestamp || log.originalLog?.['@timestamp'],
        request: log.reqUrl || log.rpcUrl,
        method: log.httpMethod,
        status: log.httpStatus,
        errorClass: log.errorClass,
        errorMessage: log.errorMessage,
        sqlId: log.sqlId,
        sql: log.sqlContent || log.sql || log.statement || log.query,
        params: log.requestParams || log.params || log.bindParams,
        duration: log.duration || log.runTime,
        parentId: log.parentId,
        spanId: log.spanId,
        kind: log.kind,
        className: log.className,
        message: log.message,
        paramName: log.paramName,
        paramValue: log.paramValue,
        contentHash: log.contentHash,
    };
}
export function summarizeEvidence(logs, limit = 10) {
    return logs.slice(0, limit).map(normalizeLogEvidence);
}
export function formatLogResult(result, logType) {
    const logs = result.logs;
    const total = result.total;
    if (logs.length === 0) {
        return `未找到 ${logType} 类型的日志`;
    }
    let output = `找到 ${total} 条 ${logType} 日志\n\n`;
    const errorLogs = logs.filter(l => {
        const level = (l.logLevel || '').toUpperCase();
        return level.includes('ERROR') || level.includes('WARN');
    });
    if (errorLogs.length > 0) {
        output += `其中 ${errorLogs.length} 条异常日志：\n\n`;
        errorLogs.slice(0, 5).forEach((log, index) => {
            output += `--- 异常 #${index + 1} ---\n`;
            output += `级别: ${log.logLevel}\n`;
            output += `服务: ${log.serviceName || '未知'}\n`;
            if (log.errorClass)
                output += `错误类型: ${log.errorClass}\n`;
            if (log.errorMessage)
                output += `错误信息: ${log.errorMessage}\n`;
            if (log.reqUrl)
                output += `请求URL: ${log.reqUrl}\n`;
            output += '\n';
        });
    }
    else {
        output += `未发现异常日志（ERROR/WARN）\n`;
        logs.slice(0, 3).forEach((log, index) => {
            output += `--- 日志 #${index + 1} ---\n`;
            output += `级别: ${log.logLevel}\n`;
            output += `服务: ${log.serviceName || '未知'}\n`;
            output += '\n';
        });
    }
    return output;
}
//# sourceMappingURL=log-utils.js.map