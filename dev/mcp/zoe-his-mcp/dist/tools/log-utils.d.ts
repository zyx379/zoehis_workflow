/**
 * 日志工具函数
 * 复用主项目的 logUtils.ts 逻辑
 */
import { ApiClient, LogQueryResult } from '../api-client.js';
import { LogQueryParam, AnalyzedLogInfo, LogEvidence, RedisConfig } from '../types.js';
export interface LogApiOptions {
    projectId: string;
    apiBaseUrl?: string;
    apiToken?: string;
    apiLogPath?: string;
    redisConfig?: RedisConfig;
}
export declare function createLogApiClient(options: LogApiOptions): Promise<ApiClient | null>;
export declare function buildBaseLogQuery(args: {
    traceId?: string;
    serviceName?: string;
    logLevel?: string[];
    pageSize?: string;
    pageNum?: string;
    indexvalue: string;
    logType: string;
    keyword?: string;
    sqlId?: string;
}): LogQueryParam;
export declare function buildSqlLogQuery(args: {
    traceId: string;
    sqlId?: string;
    logLevel?: string[];
    pageNum?: string;
    pageSize?: string;
}): LogQueryParam;
export declare function normalizeLogEvidence(log: AnalyzedLogInfo): LogEvidence;
export declare function summarizeEvidence(logs: AnalyzedLogInfo[], limit?: number): LogEvidence[];
export declare function formatLogResult(result: LogQueryResult, logType: string): string;
//# sourceMappingURL=log-utils.d.ts.map