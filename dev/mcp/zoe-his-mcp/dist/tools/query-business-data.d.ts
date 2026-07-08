/**
 * 查询业务数据工具 - 执行只读 SQL
 */
import { ToolResult } from '../types.js';
export declare function queryBusinessData(args: {
    sql: string;
    description: string;
    dataSourceId?: string;
}): Promise<ToolResult>;
//# sourceMappingURL=query-business-data.d.ts.map