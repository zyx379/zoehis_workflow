/**
 * 查询追踪日志工具（RPC/Feign/参数/普通日志）
 */
import { ToolResult } from '../types.js';
export declare function queryTraceLogs(args: {
    traceId: string;
    serviceName?: string;
    keyword?: string;
    logLevel?: string[];
}, logType: 'dubbo' | 'param' | 'normal'): Promise<ToolResult>;
export declare function queryRpcLog(args: {
    traceId: string;
    serviceName?: string;
    keyword?: string;
}): Promise<ToolResult>;
export declare function queryParamLog(args: {
    traceId: string;
    serviceName?: string;
    keyword?: string;
}): Promise<ToolResult>;
export declare function queryNormalLog(args: {
    traceId: string;
    serviceName?: string;
    keyword?: string;
    logLevel?: string[];
}): Promise<ToolResult>;
//# sourceMappingURL=query-trace-logs.d.ts.map