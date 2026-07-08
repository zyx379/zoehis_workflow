/**
 * MCP Server 配置
 * 从环境变量或配置文件读取
 * 支持通过项目缩写（如 zzey）切换不同项目的配置（数据库和 API）
 */
export const SERVER_CONFIG = {
    name: 'zoe_his_mcp',
    version: '1.0.0',
};
// 项目名称映射表
const PROJECT_NAME_MAP = {
    'zzey': '中泽二附院',
    'zzdx': '郑州大学',
    'test': '测试环境',
    'seyy': '公司库',
    'nasyy': '南安市医院',
    'zzsyy': '漳州市医院',
};
// 根据项目缩写获取对应的数据库配置
function getProjectDbConfig(projectCode) {
    const prefix = `ZOE_DB_${projectCode}_`;
    const dbType = process.env[prefix + 'TYPE'];
    if (!dbType) {
        return null;
    }
    const defaultPort = dbType === 'oracle' ? 1521 : 5236;
    return {
        id: projectCode,
        name: process.env[prefix + 'NAME'] || projectCode,
        type: dbType,
        host: process.env[prefix + 'HOST'] || 'localhost',
        port: process.env[prefix + 'PORT'] ? parseInt(process.env[prefix + 'PORT']) : defaultPort,
        serviceName: process.env[prefix + 'SERVICE_NAME'],
        sid: process.env[prefix + 'SID'],
        schema: process.env[prefix + 'SCHEMA'],
        username: process.env[prefix + 'USERNAME'] || '',
        password: process.env[prefix + 'PASSWORD'] || '',
    };
}
// 从环境变量读取配置
export function getEnvConfig() {
    const projectCode = process.env.ZOE_PROJECT_CODE;
    if (!projectCode) {
        console.warn('[ZOE-MCP] 未设置 ZOE_PROJECT_CODE 环境变量');
        return {};
    }
    // 项目特定配置前缀
    const projectPrefix = `ZOE_${projectCode}_`;
    // 获取项目特定的配置，如 ZOE_zzey_API_BASE_URL，回退到通用配置
    const projectApiBaseUrl = process.env[projectPrefix + 'API_BASE_URL'] || process.env.ZOE_API_BASE_URL;
    const projectApiLogPath = process.env[projectPrefix + 'API_LOG_PATH'] || process.env.ZOE_API_LOG_PATH;
    const projectRedisHost = process.env[projectPrefix + 'REDIS_HOST'] || process.env.ZOE_REDIS_HOST;
    const projectRedisPort = process.env[projectPrefix + 'REDIS_PORT'] ? parseInt(process.env[projectPrefix + 'REDIS_PORT']) : 
                           (process.env.ZOE_REDIS_PORT ? parseInt(process.env.ZOE_REDIS_PORT) : undefined);
    const projectRedisPassword = process.env[projectPrefix + 'REDIS_PASSWORD'] || process.env.ZOE_REDIS_PASSWORD;
    const projectRedisDb = process.env[projectPrefix + 'REDIS_DB'] ? parseInt(process.env[projectPrefix + 'REDIS_DB']) : 
                         (process.env.ZOE_REDIS_DB ? parseInt(process.env.ZOE_REDIS_DB) : undefined);
    const projectConfig = {
        id: projectCode,
        name: PROJECT_NAME_MAP[projectCode] || process.env.ZOE_PROJECT_NAME || projectCode,
        apiBaseUrl: projectApiBaseUrl,
        apiToken: process.env[projectPrefix + 'API_TOKEN'] || process.env.ZOE_API_TOKEN,
        apiLogPath: projectApiLogPath,
        apiTokenPath: process.env.ZOE_API_TOKEN_PATH,
        apiVersionPath: process.env.ZOE_API_VERSION_PATH,
        redisHost: projectRedisHost,
        redisPort: projectRedisPort,
        redisPassword: projectRedisPassword,
        redisDb: projectRedisDb,
        dataSourceId: projectCode,
    };
    // 根据项目缩写获取数据源配置
    const dataSourceConfig = getProjectDbConfig(projectCode);
    let redisConfig;
    if (projectRedisHost) {
        redisConfig = {
            host: projectRedisHost,
            port: projectRedisPort || 6379,
            password: projectRedisPassword,
            db: projectRedisDb || 0,
        };
    }
    return { projectConfig, dataSourceConfig, redisConfig };
}
// 获取所有可用的项目列表
export function getAvailableProjects() {
    const projects = [];
    const envKeys = Object.keys(process.env);
    const dbTypeKeys = envKeys.filter(key => key.startsWith('ZOE_DB_') && key.endsWith('_TYPE'));
    
    for (const key of dbTypeKeys) {
        const projectCode = key.replace('ZOE_DB_', '').replace('_TYPE', '');
        projects.push({
            code: projectCode,
            name: PROJECT_NAME_MAP[projectCode] || projectCode,
            type: process.env[key],
        });
    }
    return projects;
}
// 工具定义
export const TOOL_DEFINITIONS = [
    {
        type: 'function',
        function: {
            name: 'query_log',
            description: '查询 HTTP 错误日志，根据 traceId 获取请求链路中的错误信息',
            parameters: {
                type: 'object',
                properties: {
                    traceId: {
                        type: 'string',
                        description: 'Trace ID，用于追踪请求链路'
                    },
                    serviceName: {
                        type: 'string',
                        description: '可选的服务名过滤'
                    },
                },
                required: ['traceId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'query_sql_log',
            description: '查询 SQL 执行日志。支持 traceId 精确查链路，或通过 filterParamet/msgid 在 SQL 日志中检索（如医保 INSERT 含 msgid 反查 traceId）',
            parameters: {
                type: 'object',
                properties: {
                    traceId: {
                        type: 'string',
                        description: 'Trace ID（与 filterParamet/msgid 二选一或组合使用）'
                    },
                    sqlId: {
                        type: 'string',
                        description: 'SQL ID / DAO 方法名，如 UserMapper.selectById'
                    },
                    msgid: {
                        type: 'string',
                        description: '医保报文 msgid；自动构造 filterParamet.sql={ sqlType, sqlFragment: msgid } 精确检索 INSERT 日志'
                    },
                    sqlType: {
                        type: 'string',
                        description: '与 msgid 配合，默认 INSERT（医保交易日志）'
                    },
                    filterParamet: {
                        type: 'object',
                        description: '日志平台高级过滤，如 { sql: { sqlType: "INSERT", sqlFragment: "H350602..." } }'
                    },
                    pageSize: {
                        type: 'string',
                        description: '分页大小，默认 20'
                    },
                    pageNum: {
                        type: 'string',
                        description: '页码，默认 1'
                    },
                },
                required: [],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'query_trace_by_msgid',
            description: '医保 msgid 一键全链路：先在 SQL INSERT 日志中定位 traceId，再查 HTTP/SQL/RPC/参数/普通日志',
            parameters: {
                type: 'object',
                properties: {
                    msgid: {
                        type: 'string',
                        description: '医保报文 msgid，如 H35060200042202605241039388855'
                    },
                    sqlType: {
                        type: 'string',
                        description: 'SQL 日志类型过滤，默认 INSERT'
                    },
                    serviceName: {
                        type: 'string',
                        description: '可选服务名过滤'
                    },
                    keyword: {
                        type: 'string',
                        description: '可选关键词'
                    },
                    sqlId: {
                        type: 'string',
                        description: '全链路 SQL 阶段可选 sqlId 过滤'
                    },
                    pageSize: {
                        type: 'string',
                        description: 'msgid 定位阶段返回条数，默认 10'
                    },
                    sqlPageSize: {
                        type: 'string',
                        description: '全链路 SQL 阶段条数，默认 30'
                    },
                    logLevel: {
                        type: 'array',
                        items: { type: 'string' },
                        description: '普通日志级别过滤'
                    },
                },
                required: ['msgid'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'query_rpc_log',
            description: '查询 RPC/Feign 调用链日志，定位下游服务调用',
            parameters: {
                type: 'object',
                properties: {
                    traceId: {
                        type: 'string',
                        description: 'Trace ID'
                    },
                    serviceName: {
                        type: 'string',
                        description: '可选的服务名过滤'
                    },
                    keyword: {
                        type: 'string',
                        description: '可选的关键词搜索'
                    },
                },
                required: ['traceId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'query_param_log',
            description: '查询业务参数日志，获取请求参数、配置项等信息',
            parameters: {
                type: 'object',
                properties: {
                    traceId: {
                        type: 'string',
                        description: 'Trace ID'
                    },
                    serviceName: {
                        type: 'string',
                        description: '可选的服务名过滤'
                    },
                    keyword: {
                        type: 'string',
                        description: '可选的关键词搜索'
                    },
                },
                required: ['traceId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'query_normal_log',
            description: '查询控制台/普通应用日志',
            parameters: {
                type: 'object',
                properties: {
                    traceId: {
                        type: 'string',
                        description: 'Trace ID'
                    },
                    serviceName: {
                        type: 'string',
                        description: '可选的服务名过滤'
                    },
                    keyword: {
                        type: 'string',
                        description: '可选的关键词搜索'
                    },
                    logLevel: {
                        type: 'array',
                        items: { type: 'string' },
                        description: '日志级别过滤，如 ["ERROR", "WARN"]'
                    },
                },
                required: ['traceId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'query_business_data',
            description: '执行只读 SQL 查询验证业务数据（仅支持 SELECT）',
            parameters: {
                type: 'object',
                properties: {
                    sql: {
                        type: 'string',
                        description: 'SQL 查询语句（仅 SELECT）'
                    },
                    description: {
                        type: 'string',
                        description: '查询目的描述'
                    },
                    dataSourceId: {
                        type: 'string',
                        description: '数据源 ID（可选，使用默认配置时可不传）'
                    },
                },
                required: ['sql', 'description'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_table_schema',
            description: '查询数据库表结构信息',
            parameters: {
                type: 'object',
                properties: {
                    tableNamePattern: {
                        type: 'string',
                        description: '表名或表名模式，如 PATIENT_INFO 或 PATIENT_%'
                    },
                },
                required: ['tableNamePattern'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_code',
            description: '从 GitLab 获取代码。按 serviceName、sqlId、urlPath、Java 包名等多线索匹配仓库（勿臆测仓库命名）',
            parameters: {
                type: 'object',
                properties: {
                    serviceName: {
                        type: 'string',
                        description: '日志中的服务名（可能与仓库名不一致，需结合 sqlId 判断）'
                    },
                    sqlId: {
                        type: 'string',
                        description: '如 com.zoe.optimus.service.dict.dao.prepay.InpPrepayRecordDao.getUnSettleUnReturnList'
                    },
                    className: {
                        type: 'string',
                        description: 'Java 全类名，可选；未传时从 sqlId 推断'
                    },
                    filePath: {
                        type: 'string',
                        description: '仓库内文件路径，如 src/main/java/.../FooService.java'
                    },
                    searchPattern: {
                        type: 'string',
                        description: '在指定文件内搜索关键字（方法名、类名、sqlId 片段）'
                    },
                    branch: {
                        type: 'string',
                        description: 'Git 分支，默认取仓库 defaultBranch'
                    },
                    tag: {
                        type: 'string',
                        description: '发布 tag，可推断分支如 release-1.168.28 -> release-1.168'
                    },
                    startLine: { type: 'number', description: '起始行' },
                    endLine: { type: 'number', description: '结束行' },
                    requestUrl: {
                        type: 'string',
                        description: 'HTTP 请求 URL，辅助匹配前端/网关仓库'
                    },
                    urlPath: {
                        type: 'string',
                        description: '接口路径，如 /dict/settle/settleManage/getCheckSettleState'
                    },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'list_code_repositories',
            description: '列出当前项目(ZOE_PROJECT_CODE)已配置的 GitLab 代码仓库及匹配模式',
            parameters: { type: 'object', properties: {} },
        },
    },
    {
        type: 'function',
        function: {
            name: 'discover_gitlab_projects',
            description: '列举项目 GitLab 分组下已有仓库（不确定仓库名时用，需 GITLAB_TOKEN）',
            parameters: { type: 'object', properties: {} },
        },
    },
];
//# sourceMappingURL=config.js.map