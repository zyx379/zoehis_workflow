/**
 * 查询表结构工具
 * 从本地 SQLite 缓存或数据库获取表结构
 */
import { getEnvConfig } from '../config.js';
import { queryBusinessData } from './query-business-data.js';
// 模拟表结构缓存（实际项目中应从 SQLite 读取）
const schemaCache = new Map();
export async function getTableSchema(args) {
    try {
        const { dataSourceConfig } = getEnvConfig();
        if (!dataSourceConfig) {
            return {
                success: false,
                error: '未配置数据源'
            };
        }
        const tableName = args.tableNamePattern.replace(/%/g, '');
        // 尝试从缓存获取
        const cached = schemaCache.get(tableName.toUpperCase());
        if (cached) {
            return {
                success: true,
                data: {
                    tableName,
                    fromCache: true,
                    schema: cached,
                }
            };
        }
        // 从数据库查询表结构
        let schemaSql;
        if (dataSourceConfig.type === 'oracle') {
            schemaSql = `
        SELECT 
          c.COLUMN_NAME,
          c.DATA_TYPE,
          c.DATA_LENGTH,
          c.NULLABLE,
          c.DATA_DEFAULT,
          cc.COMMENTS
        FROM ALL_TAB_COLUMNS c
        LEFT JOIN ALL_COL_COMMENTS cc ON c.TABLE_NAME = cc.TABLE_NAME AND c.COLUMN_NAME = cc.COLUMN_NAME
        WHERE c.TABLE_NAME = '${tableName.toUpperCase()}'
        ORDER BY c.COLUMN_ID
      `;
        }
        else {
            // 达梦
            schemaSql = `
        SELECT 
          c.COLUMN_NAME,
          c.DATA_TYPE,
          c.DATA_LENGTH,
          c.NULLABLE,
          c.DATA_DEFAULT,
          cc.COMMENTS
        FROM USER_TAB_COLUMNS c
        LEFT JOIN USER_COL_COMMENTS cc ON c.TABLE_NAME = cc.TABLE_NAME AND c.COLUMN_NAME = cc.COLUMN_NAME
        WHERE c.TABLE_NAME = '${tableName.toUpperCase()}'
        ORDER BY c.COLUMN_ID
      `;
        }
        const result = await queryBusinessData({
            sql: schemaSql,
            description: `查询表 ${tableName} 的结构`,
        });
        if (!result.success) {
            return result;
        }
        // 缓存结果
        schemaCache.set(tableName.toUpperCase(), result.data);
        return {
            success: true,
            data: {
                tableName,
                fromCache: false,
                schema: result.data,
            }
        };
    }
    catch (error) {
        console.error('Get table schema error:', error);
        return { success: false, error: error.message };
    }
}
//# sourceMappingURL=get-table-schema.js.map