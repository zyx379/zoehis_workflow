/**
 * 查询 SQL 日志工具
 */
import { createLogApiClient, buildSqlLogQuery, extractTraceIdFromLogs, filterLogsByMsgid } from './log-utils.js';
import { getEnvConfig } from '../config.js';

function mapSqlLog(log) {
    return {
        traceId: log.traceId || log.originalLog?.traceId || '',
        sqlId: log.sqlId || '',
        sql: log.sqlContent || log.sql || log.statement || log.query || log.originalLog?.sqlContent || log.originalLog?.sql || log.errorMessage || '',
        params: log.requestParams || log.params || log.bindParams || log.originalLog?.requestParam || log.originalLog?.params || '',
        duration: log.duration || '',
        resultCount: log.resultCount || '',
        tableName: log.tableName || '',
        timestamp: log.timestamp || log.originalLog?.timestamp || log.originalLog?.['@timestamp'] || '',
        errorClass: log.errorClass || '',
        errorMessage: log.errorMessage || '',
        serviceName: log.serviceName || log.originalLog?.serviceName || '',
    };
}

export async function querySqlLog(args) {
    try {
        const hasTraceId = !!args.traceId?.trim();
        const hasFilter = !!(args.filterParamet || args.msgid?.trim());
        if (!hasTraceId && !hasFilter) {
            return {
                success: false,
                error: '需提供 traceId，或 filterParamet / msgid（医保报文 ID）用于检索 SQL 日志',
            };
        }
        const { projectConfig, redisConfig } = getEnvConfig();
        if (!projectConfig?.apiBaseUrl) {
            return { success: false, error: '未配置 API 基础地址' };
        }
        const apiClient = await createLogApiClient({
            projectId: projectConfig.id,
            apiBaseUrl: projectConfig.apiBaseUrl,
            apiToken: projectConfig.apiToken,
            apiLogPath: projectConfig.apiLogPath,
            redisConfig,
        });
        if (!apiClient) {
            return { success: false, error: '无法创建 API 客户端' };
        }
        const queryParam = buildSqlLogQuery({
            traceId: args.traceId,
            sqlId: args.sqlId,
            msgid: args.msgid,
            sqlType: args.sqlType,
            filterParamet: args.filterParamet,
            pageNum: args.pageNum,
            pageSize: args.pageSize,
            serviceName: args.serviceName,
            logLevel: args.logLevel,
            timeRange: args.timeRange,
            timeRangeDays: args.timeRangeDays,
        }, projectConfig.id);
        let result = await apiClient.getLogs(queryParam);
        // 仅自定义 filterParamet 且未用 sqlFragment 时，做客户端 msgid 兜底过滤
        if (args.msgid?.trim() && args.filterParamet && !args.filterParamet?.sql?.sqlFragment) {
            const sqlType = args.sqlType || 'INSERT';
            const maxPages = parseInt(args.maxPages || '15', 10);
            let matched = filterLogsByMsgid(result.logs, args.msgid, sqlType);
            for (let p = 2; p <= maxPages && matched.length === 0; p++) {
                const pageParam = { ...queryParam, pageNum: String(p) };
                const pageResult = await apiClient.getLogs(pageParam);
                matched = filterLogsByMsgid(pageResult.logs, args.msgid, sqlType);
            }
            if (matched.length > 0) {
                result = { total: matched.length, logs: matched };
            }
        }
        // 精确 sqlId 无结果时，回退为仅 traceId 查询并在客户端按方法名模糊匹配
        if (result.logs.length === 0 && args.sqlId && hasTraceId) {
            const fallbackParam = buildSqlLogQuery({ traceId: args.traceId }, projectConfig.id);
            const fallbackResult = await apiClient.getLogs(fallbackParam);
            const needle = args.sqlId.toLowerCase();
            const matched = fallbackResult.logs.filter(log => {
                const sqlId = (log.sqlId || log.originalLog?.sqlId || '').toLowerCase();
                return sqlId.includes(needle) || needle.includes(sqlId.split('.').pop() || '');
            });
            if (matched.length > 0) {
                result = { total: matched.length, logs: matched };
            }
        }
        if (result.logs.length === 0) {
            const hint = args.msgid
                ? `msgid="${args.msgid}"`
                : (args.filterParamet ? 'filterParamet 条件' : `traceId="${args.traceId}"`);
            return {
                success: false,
                error: args.sqlId
                    ? `未找到 sqlId="${args.sqlId}" 的 SQL 日志（${hint}）`
                    : `未找到 SQL 日志（${hint}）`,
            };
        }
        const resolvedTraceId = extractTraceIdFromLogs(result.logs) || args.traceId || '';
        const sqlLogs = result.logs.map(mapSqlLog);
        return {
            success: true,
            data: {
                traceId: resolvedTraceId,
                msgid: args.msgid || '',
                sqlId: args.sqlId || '',
                totalCount: sqlLogs.length,
                sqlLogs,
            },
        };
    }
    catch (error) {
        console.error('querySqlLog error:', error);
        return { success: false, error: error.message };
    }
}
