/**
 * 工具注册中心
 */
import { ToolResult } from '../types.js';
export interface ToolContext {
    projectId?: string;
    apiBaseUrl?: string;
    apiToken?: string;
    apiLogPath?: string;
}
export declare function executeTool(toolName: string, args: any, context?: ToolContext): Promise<ToolResult>;
export * from './query-log.js';
export * from './query-sql-log.js';
export * from './query-trace-logs.js';
export * from './query-business-data.js';
export * from './get-table-schema.js';
//# sourceMappingURL=index.d.ts.map