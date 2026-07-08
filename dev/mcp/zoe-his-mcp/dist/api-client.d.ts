/**
 * API 客户端 - 用于调用日志平台
 * 复用主项目的 api-client.ts 逻辑
 */
import { ApiClientConfig, LogQueryParam, AnalyzedLogInfo } from './types.js';
export interface LogQueryResult {
    total: number;
    logs: AnalyzedLogInfo[];
}
export declare class ApiClient {
    private config;
    private token?;
    constructor(config: ApiClientConfig);
    setToken(token: string): void;
    getLogs(params: LogQueryParam): Promise<LogQueryResult>;
    private buildUrl;
    private buildHeaders;
    private parseResponse;
}
//# sourceMappingURL=api-client.d.ts.map