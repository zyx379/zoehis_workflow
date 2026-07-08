/**
 * 查询表结构工具
 * 从本地 SQLite 缓存或数据库获取表结构
 */
import { ToolResult } from '../types.js';
export declare function getTableSchema(args: {
    tableNamePattern: string;
}): Promise<ToolResult>;
//# sourceMappingURL=get-table-schema.d.ts.map