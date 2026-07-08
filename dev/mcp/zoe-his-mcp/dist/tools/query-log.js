/**
 * 查询日志工具
 */
import { createLogApiClient, buildBaseLogQuery, formatLogResult, getLogProfile } from './log-utils.js';
import { getEnvConfig } from '../config.js';
export async function queryLog(args) {
    try {
        const { projectConfig, redisConfig } = getEnvConfig();
        if (!projectConfig?.apiBaseUrl) {
            return { success: false, error: '未配置 API 基础地址，请设置 ZOE_API_BASE_URL 环境变量' };
        }
        const apiClient = await createLogApiClient({
            projectId: projectConfig.id,
            apiBaseUrl: projectConfig.apiBaseUrl,
            apiToken: projectConfig.apiToken,
            apiLogPath: projectConfig.apiLogPath,
            redisConfig,
        });
        if (!apiClient) {
            return { success: false, error: '无法创建 API 客户端，请检查配置' };
        }
        const projectCode = projectConfig.id;
        const profile = getLogProfile(projectCode);
        const queryParam = buildBaseLogQuery({
            pageSize: '20',
            indexvalue: profile.indices?.http || 'log-http*',
            logType: profile.logTypes?.http || 'http',
            logKind: 'http',
            traceId: args.traceId,
            serviceName: args.serviceName,
        }, projectCode);
        let result = await apiClient.getLogs(queryParam);
        // 旧架构主索引 log-req* 无结果时，再试 log-http*（兼容）
        if (result.logs.length === 0 && profile.architecture === 'legacy') {
            const fallback = {
                ...queryParam,
                indexvalue: 'log-http*',
                logType: 'http',
            };
            result = await apiClient.getLogs(fallback);
        }
        if (result.logs.length === 0) {
            const indexHint = profile.indices?.http || 'log-http*';
            return {
                success: false,
                error: `未找到 traceId="${args.traceId}" 的日志（index=${indexHint}，architecture=${profile.architecture || 'onelink'}）`,
            };
        }
        return {
            success: true,
            data: {
                traceId: args.traceId,
                totalCount: result.total,
                logs: result.logs,
                formatted: formatLogResult(result, 'HTTP'),
            }
        };
    }
    catch (error) {
        console.error('queryLog error:', error);
        return { success: false, error: error.message };
    }
}
//# sourceMappingURL=query-log.js.map