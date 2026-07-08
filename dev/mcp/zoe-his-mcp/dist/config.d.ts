/**
 * MCP Server 配置
 * 从环境变量或配置文件读取
 */
import { ProjectConfig, DataSourceConfig, RedisConfig } from './types.js';
export declare const SERVER_CONFIG: {
    name: string;
    version: string;
};
export declare function getEnvConfig(): {
    projectConfig?: ProjectConfig;
    dataSourceConfig?: DataSourceConfig;
    redisConfig?: RedisConfig;
};
export declare const TOOL_DEFINITIONS: ({
    type: string;
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                traceId: {
                    type: string;
                    description: string;
                };
                serviceName: {
                    type: string;
                    description: string;
                };
                sqlId?: undefined;
                keyword?: undefined;
                logLevel?: undefined;
                sql?: undefined;
                description?: undefined;
                dataSourceId?: undefined;
                tableNamePattern?: undefined;
            };
            required: string[];
        };
    };
} | {
    type: string;
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                traceId: {
                    type: string;
                    description: string;
                };
                sqlId: {
                    type: string;
                    description: string;
                };
                serviceName?: undefined;
                keyword?: undefined;
                logLevel?: undefined;
                sql?: undefined;
                description?: undefined;
                dataSourceId?: undefined;
                tableNamePattern?: undefined;
            };
            required: string[];
        };
    };
} | {
    type: string;
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                traceId: {
                    type: string;
                    description: string;
                };
                serviceName: {
                    type: string;
                    description: string;
                };
                keyword: {
                    type: string;
                    description: string;
                };
                sqlId?: undefined;
                logLevel?: undefined;
                sql?: undefined;
                description?: undefined;
                dataSourceId?: undefined;
                tableNamePattern?: undefined;
            };
            required: string[];
        };
    };
} | {
    type: string;
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                traceId: {
                    type: string;
                    description: string;
                };
                serviceName: {
                    type: string;
                    description: string;
                };
                keyword: {
                    type: string;
                    description: string;
                };
                logLevel: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
                sqlId?: undefined;
                sql?: undefined;
                description?: undefined;
                dataSourceId?: undefined;
                tableNamePattern?: undefined;
            };
            required: string[];
        };
    };
} | {
    type: string;
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                sql: {
                    type: string;
                    description: string;
                };
                description: {
                    type: string;
                    description: string;
                };
                dataSourceId: {
                    type: string;
                    description: string;
                };
                traceId?: undefined;
                serviceName?: undefined;
                sqlId?: undefined;
                keyword?: undefined;
                logLevel?: undefined;
                tableNamePattern?: undefined;
            };
            required: string[];
        };
    };
} | {
    type: string;
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: {
                tableNamePattern: {
                    type: string;
                    description: string;
                };
                traceId?: undefined;
                serviceName?: undefined;
                sqlId?: undefined;
                keyword?: undefined;
                logLevel?: undefined;
                sql?: undefined;
                description?: undefined;
                dataSourceId?: undefined;
            };
            required: string[];
        };
    };
})[];
//# sourceMappingURL=config.d.ts.map