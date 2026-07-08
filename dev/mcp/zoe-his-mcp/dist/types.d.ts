/**
 * MCP Server 类型定义
 * 与主项目 main/agent/types.ts 保持一致
 */
export interface ToolDefinition {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
}
export interface ToolCall {
    id?: string;
    name: string;
    arguments: Record<string, any>;
}
export interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
}
export interface QueryResult {
    columns: string[];
    rows: any[][];
    rowCount: number;
    executionTime: number;
}
export interface LogEvidence {
    traceId?: string;
    logType: string;
    level?: string;
    serviceName?: string;
    timestamp?: string;
    request?: string;
    method?: string;
    status?: string;
    errorClass?: string;
    errorMessage?: string;
    sqlId?: string;
    sql?: string;
    params?: string;
    duration?: string | number;
    parentId?: string;
    spanId?: string;
    kind?: string;
    className?: string;
    message?: string;
    paramName?: string;
    paramValue?: string;
    contentHash?: string;
}
export interface LogQueryParam {
    pageSize?: string;
    pageNum?: string;
    indexvalue?: string;
    logType?: string;
    serviceName?: string;
    canary?: string;
    traceId?: string;
    sqlId?: string;
    logLevel?: string[];
    timestamp?: {
        startDate?: string | null;
        endDate?: string | null;
    };
    filterParam?: any;
    filterParamet?: any;
}
export interface AnalyzedLogInfo {
    traceId?: string;
    logType?: string;
    logLevel?: string;
    serviceName?: string;
    timestamp?: string;
    reqUrl?: string;
    rpcUrl?: string;
    httpMethod?: string;
    httpStatus?: string;
    errorClass?: string;
    errorMessage?: string;
    sqlId?: string;
    sqlContent?: string;
    sql?: string;
    statement?: string;
    query?: string;
    requestParams?: string;
    params?: string;
    bindParams?: string;
    duration?: string | number;
    runTime?: string | number;
    parentId?: string;
    spanId?: string;
    kind?: string;
    className?: string;
    message?: string;
    paramName?: string;
    paramValue?: string;
    contentHash?: string;
    vueFile?: string;
    originalLog?: any;
    tableName?: string;
    resultCount?: string;
}
export interface ApiClientConfig {
    baseUrl: string;
    logPath?: string;
    authType: 'custom' | 'bearer';
    customHeaderName?: string;
}
export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
}
export interface DataSourceConfig {
    id: string;
    name: string;
    type: 'oracle' | 'dameng';
    host: string;
    port: number;
    serviceName?: string;
    sid?: string;
    schema?: string;
    username: string;
    password: string;
}
export interface ProjectConfig {
    id: string;
    name: string;
    apiBaseUrl?: string;
    apiToken?: string;
    apiLogPath?: string;
    apiTokenPath?: string;
    apiVersionPath?: string;
    redisHost?: string;
    redisPort?: number;
    redisPassword?: string;
    redisDb?: number;
    dataSourceId?: string;
}
//# sourceMappingURL=types.d.ts.map