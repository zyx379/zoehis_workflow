/**
 * 医保 msgid → traceId → 全链路日志一键查询
 */
import { querySqlLog } from './query-sql-log.js';
import { queryLog } from './query-log.js';
import { queryRpcLog, queryParamLog, queryNormalLog } from './query-trace-logs.js';

function pickSummary(logs, limit = 5) {
    if (!Array.isArray(logs))
        return [];
    return logs.slice(0, limit).map(log => ({
        traceId: log.traceId || log.originalLog?.traceId,
        logLevel: log.logLevel,
        serviceName: log.serviceName || log.originalLog?.serviceName,
        timestamp: log.timestamp || log.originalLog?.timestamp || log.originalLog?.['@timestamp'],
        reqUrl: log.reqUrl || log.rpcUrl,
        errorClass: log.errorClass,
        errorMessage: log.errorMessage,
        sqlId: log.sqlId,
        message: log.message,
    }));
}

export async function queryTraceByMsgid(args) {
    const msgid = args.msgid?.trim();
    if (!msgid) {
        return { success: false, error: 'msgid 不能为空' };
    }
    const sqlType = args.sqlType || 'INSERT';
    const pageSize = args.pageSize || '10';

    // 1. 用 msgid 在 SQL INSERT 日志中定位 traceId
    const sqlLookup = await querySqlLog({ msgid, sqlType, pageSize });
    if (!sqlLookup.success) {
        return {
            success: false,
            error: `未通过 msgid 找到 SQL 日志: ${sqlLookup.error}`,
            data: { msgid, sqlType, step: 'resolve_traceId' },
        };
    }
    const traceId = sqlLookup.data?.traceId;
    if (!traceId) {
        return {
            success: false,
            error: `已找到 SQL 日志但未解析出 traceId，请检查日志平台字段映射`,
            data: { msgid, sqlLookup: sqlLookup.data, step: 'resolve_traceId' },
        };
    }

    // 2. 用 traceId 拉全链路（并行，单类失败不阻断）
    const chainOpts = { traceId, serviceName: args.serviceName, keyword: args.keyword };
    const [httpRes, sqlRes, rpcRes, paramRes, normalRes] = await Promise.all([
        queryLog(chainOpts).catch(e => ({ success: false, error: e.message })),
        querySqlLog({ traceId, sqlId: args.sqlId, pageSize: args.sqlPageSize || '30' }).catch(e => ({ success: false, error: e.message })),
        queryRpcLog(chainOpts).catch(e => ({ success: false, error: e.message })),
        queryParamLog(chainOpts).catch(e => ({ success: false, error: e.message })),
        queryNormalLog({ ...chainOpts, logLevel: args.logLevel }).catch(e => ({ success: false, error: e.message })),
    ]);

    return {
        success: true,
        data: {
            msgid,
            traceId,
            resolveStep: {
                sqlType,
                matchedSqlCount: sqlLookup.data?.totalCount ?? 0,
                sampleSqlLogs: (sqlLookup.data?.sqlLogs || []).slice(0, 3),
            },
            chain: {
                http: httpRes.success
                    ? { totalCount: httpRes.data?.totalCount, logs: pickSummary(httpRes.data?.logs) }
                    : { error: httpRes.error },
                sql: sqlRes.success
                    ? { totalCount: sqlRes.data?.totalCount, sqlLogs: (sqlRes.data?.sqlLogs || []).slice(0, 10) }
                    : { error: sqlRes.error },
                rpc: rpcRes.success
                    ? { totalCount: rpcRes.data?.totalCount, logs: pickSummary(rpcRes.data?.logs) }
                    : { error: rpcRes.error },
                param: paramRes.success
                    ? { totalCount: paramRes.data?.totalCount, logs: pickSummary(paramRes.data?.logs) }
                    : { error: paramRes.error },
                normal: normalRes.success
                    ? { totalCount: normalRes.data?.totalCount, logs: pickSummary(normalRes.data?.logs) }
                    : { error: normalRes.error },
            },
        },
    };
}
