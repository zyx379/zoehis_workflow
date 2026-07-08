#!/usr/bin/env node
/**
 * ZoeDevOps MCP Server
 * HIS智能运维诊断工具集
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { SERVER_CONFIG, TOOL_DEFINITIONS } from './config.js';
import { executeTool } from './tools/index.js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// 从 .env 文件加载环境变量（优先项目根目录，不依赖 process.cwd）
function loadEnvFile() {
    const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
    const envPath = join(projectRoot, '.env');
    if (existsSync(envPath)) {
        const content = readFileSync(envPath, 'utf-8');
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, value] = trimmed.split('=', 2);
                if (key && value !== undefined && !process.env[key]) {
                    process.env[key] = value;
                }
            }
        }
        console.error('Loaded environment variables from .env file');
    }
}
// 转换工具定义为 MCP 格式
function convertToMcpTools(definitions) {
    return definitions.map(def => ({
        name: def.function.name,
        description: def.function.description,
        inputSchema: def.function.parameters,
    }));
}
async function main() {
    // 加载环境变量
    loadEnvFile();
    console.error(`Starting ${SERVER_CONFIG.name} v${SERVER_CONFIG.version}...`);
    const server = new Server({
        name: SERVER_CONFIG.name,
        version: SERVER_CONFIG.version,
    }, {
        capabilities: {
            tools: {},
        },
    });
    // 注册工具列表处理器
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: convertToMcpTools(TOOL_DEFINITIONS),
        };
    });
    // 注册工具调用处理器
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        try {
            const result = await executeTool(name, args);
            if (result.success) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result.data, null, 2),
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `错误: ${result.error}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
        catch (error) {
            console.error(`[MCP] Tool execution error:`, error);
            return {
                content: [
                    {
                        type: 'text',
                        text: `执行失败: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    });
    // 启动服务器
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`${SERVER_CONFIG.name} is running on stdio`);
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map