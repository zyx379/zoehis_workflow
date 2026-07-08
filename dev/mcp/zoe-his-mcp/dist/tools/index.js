/**
 * 工具注册中心
 */
import { queryLog } from './query-log.js';
import { querySqlLog } from './query-sql-log.js';
import { queryRpcLog, queryParamLog, queryNormalLog } from './query-trace-logs.js';
import { queryBusinessData } from './query-business-data.js';
import { getTableSchema } from './get-table-schema.js';
import { getCode, listCodeRepositories, discoverGitlabProjectsTool } from './get-code.js';
import { queryTraceByMsgid } from './query-trace-by-msgid.js';
export async function executeTool(toolName, args, context) {
    console.log(`[MCP] Executing tool: ${toolName}`, JSON.stringify(args, null, 2));
    switch (toolName) {
        case 'query_log':
            return queryLog(args);
        case 'query_sql_log':
            return querySqlLog(args);
        case 'query_trace_by_msgid':
            return queryTraceByMsgid(args);
        case 'query_rpc_log':
            return queryRpcLog(args);
        case 'query_param_log':
            return queryParamLog(args);
        case 'query_normal_log':
            return queryNormalLog(args);
        case 'query_business_data':
            return queryBusinessData(args);
        case 'get_table_schema':
            return getTableSchema(args);
        case 'get_code':
            return getCode(args);
        case 'list_code_repositories':
            return listCodeRepositories();
        case 'discover_gitlab_projects':
            return discoverGitlabProjectsTool();
        default:
            return { success: false, error: `未知工具: ${toolName}` };
    }
}
export * from './query-log.js';
export * from './query-sql-log.js';
export * from './query-trace-logs.js';
export * from './query-business-data.js';
export * from './get-table-schema.js';
//# sourceMappingURL=index.js.map