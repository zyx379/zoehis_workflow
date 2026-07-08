# dev/mcp — Cursor MCP 配置与 zoe-his-mcp

## 结构

| 路径 | 说明 |
|------|------|
| `zoe-his-mcp/` | HIS 日志/查表/测试库 SQL MCP 服务（Node，`dist/index.js`） |
| `mcp.json.example` | Cursor MCP 配置模板（**源文件**） |
| `.env` | 本地密钥与数据源（**不提交 Git**，在 `zoe-his-mcp/.env`） |

## 首次 / clone 后

1. 仓库根目录执行 `.\scripts\link-cursor-dev.ps1`（创建 rules/skills 联接，并生成 `.cursor/mcp.json`）
2. 复制 `dev/mcp/zoe-his-mcp/.env`（若无则从旧机拷贝；含 `ZOE_*_API_BASE_URL`、`ZOE_DB_*`、`GITLAB_TOKEN` 等）
3. 若 `node_modules` 缺失：`cd dev/mcp/zoe-his-mcp && npm ci`
4. Cursor **Settings → MCP** 确认 `zoe-his-mcp` 已启用；改 env 后重启 MCP

## 编辑约定

- **改 MCP 服务代码/配置**：编辑 `dev/mcp/zoe-his-mcp/`
- **改 Cursor 注册项**：编辑 `dev/mcp/mcp.json.example`，再运行 `link-cursor-dev.ps1` 或手动合并到 `.cursor/mcp.json`
- **勿提交**：`.env`、`node_modules`

## 与 linx 穿透

内网穿透场景 `zoe-his-linx-mcp` 仍使用 `linx/mcp/`；将其 env **`ZOE_HIS_MCP_HOME`** 指向：

`D:\zoe_work_space\fj-common\dev\mcp\zoe-his-mcp`

## 常用工具

| 工具 | 用途 |
|------|------|
| `get_table_schema` | Step 4/8 表结构核验 |
| `query_business_data` | 测试库 SELECT 验证（Step 11） |
| `query_log` / `query_sql_log` | 生产 traceId 排查 |
| `get_code` | GitLab 读源码（排查） |
