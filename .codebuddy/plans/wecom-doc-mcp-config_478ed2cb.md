---
name: wecom-doc-mcp-config
overview: 在 dev/mcp/ 下新建 wecom-doc-mcp/ 文件夹，内置 mcp.json，内容为之前提供的企业微信文档 API 模式机器人 streamableHTTP 配置（type 用标准 streamableHTTP）。不修改 .codebuddy/mcp.json，由用户自行粘入 IDE。
todos:
  - id: create-wecom-mcp-json
    content: 新建 dev/mcp/wecom-doc-mcp/mcp.json 写入 streamableHTTP 配置
    status: completed
---

## 用户需求

在 `dev/mcp/` 下新增 `wecom-doc-mcp/` 文件夹，并在其中放置企业微信文档 MCP 的配置文件。

## 产品概述

将企业微信官方「API 模式机器人」的 streamableHTTP MCP 配置以独立文件形式收纳在 `dev/mcp/wecom-doc-mcp/mcp.json`，与现有 `zoe-his-mcp/`、`mcp.json.example` 的组织方式保持一致，便于团队共享与手动接入 IDE。

## 核心功能

- 新建 `dev/mcp/wecom-doc-mcp/` 目录
- 新建 `mcp.json`，内含「企业微信文档」单个 MCP server 条目（type 用标准 `streamableHTTP`，url 带 apikey）
- 不修改任何已有文件（包括 `.codebuddy/mcp.json` 与 `dev/skills/wecom-doc-knowledge/` 四个文件）
- 用户自行将 json 内容复制到 IDE 的 MCP 设置中生效

## Tech Stack Selection

- 配置格式：标准 MCP `mcp.json`（JSON），streamableHTTP 传输类型
- 目录约定：沿用 `dev/mcp/` 下「每个 MCP 一个独立文件夹」的组织方式（参考 `zoe-his-mcp/`）

## Implementation Approach

在 `dev/mcp/wecom-doc-mcp/` 新建 `mcp.json`，内容为用户提供的企业微信文档 streamableHTTP 配置，仅将 `type` 由 `streamable-http` 修正为标准 `streamableHTTP`（无中划线，IDE 兼容性更好）。不触碰 `.codebuddy/mcp.json`，由用户手动粘贴到 IDE MCP 配置使其生效。该文件为纯配置新增，无代码逻辑、无依赖、无构建步骤。

## Implementation Notes

- 仅新增一个 json 文件，不修改任何已存在文件，blast radius 为零
- `apikey` 为真实凭证，文件生成后会是 git untracked 状态；本轮不处理 `.gitignore`，但交付时需提醒用户勿提交含 apikey 的文件
- 配置名「企业微信文档」与 `dev/skills/wecom-doc-knowledge/SKILL.md` 中描述的「企业微信 API 模式机器人」MCP 对应，保持命名一致

## Architecture Design

无架构变更。仅按现有 `dev/mcp/` 约定新增一个配置文件夹，结构与 `zoe-his-mcp/`（含自身配置/代码）平级。

## Directory Structure

```
dev/mcp/
└── wecom-doc-mcp/
    └── mcp.json   # [NEW] 企业微信文档 MCP 配置。内含单个 server 条目「企业微信文档」，type=streamableHTTP，url 带 apikey。用户手动复制到 IDE MCP 设置生效。
```