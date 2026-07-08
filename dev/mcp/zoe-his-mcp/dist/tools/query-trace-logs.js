/**
 * 查询追踪日志工具（RPC/Feign/参数/普通日志）
 */
import { createLogApiClient, buildBaseLogQuery, getLogProfile } from './log-utils.js';
import { getEnvConfig } from '../config.js';
export async function queryTraceLogs(args, logType) {
    try {
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
        const projectCode = projectConfig.id;
        const profile = getLogProfile(projectCode);
        const indexMap = profile.indices || {
            dubbo: 'log-dubbo*',
            param: 'log-param*',
            normal: 'log-normal*',
        };
        const logTypes = profile.logTypes || {};
        const queryParam = buildBaseLogQuery({
            pageSize: '20',
            indexvalue: indexMap[logType] || `log-${logType}*`,
            logType: logTypes[logType] || (logType === 'dubbo' ? 'dubbo' : logType),
            logKind: logType,
            traceId: args.traceId,
            serviceName: args.serviceName,
            keyword: args.keyword,
            logLevel: args.logLevel,
        }, projectCode);
        const result = await apiClient.getLogs(queryParam);
        if (result.logs.length === 0) {
            return {
                success: false,
                error: `未找到 traceId="${args.traceId}" 的 ${logType} 日志`
            };
        }
        const typeNames = {
            'dubbo': 'RPC/Feign',
            'param': '业务参数',
            'normal': '普通',
        };
        return {
            success: true,
            data: {
                traceId: args.traceId,
                logType,
                typeName: typeNames[logType],
                totalCount: result.total,
                logs: result.logs,
            }
        };
    }
    catch (error) {
        console.error('queryTraceLogs error:', error);
        return { success: false, error: error.message };
    }
}
// 便捷导出函数
export function queryRpcLog(args) {
    return queryTraceLogs(args, 'dubbo');
}
export function queryParamLog(args) {
    return queryTraceLogs(args, 'param');
}
export function queryNormalLog(args) {
    return queryTraceLogs(args, 'normal');
}
//# sourceMappingURL=query-trace-logs.js.map