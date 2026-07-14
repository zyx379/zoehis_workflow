---
name: gitignore-wecom-mcp-json
overview: 在根目录 .gitignore 的「MCP 本地密钥与依赖」区块中新增 dev/mcp/wecom-doc-mcp/mcp.json 忽略规则，防止含真实 apikey 的配置文件被提交。
todos:
  - id: add-gitignore-entry
    content: 在 .gitignore 的 MCP 密钥分组下追加忽略 dev/mcp/wecom-doc-mcp/mcp.json
    status: completed
---

## 用户需求

在 `.gitignore` 中增加一行，忽略刚新建的 `dev/mcp/wecom-doc-mcp/mcp.json` 文件，避免其中包含的真实企业微信 apikey 被提交到 Git 仓库造成凭证泄露。

## 产品概述

对根目录 `.gitignore` 做最小改动，沿用已有的「MCP 本地密钥」忽略分组规则，将新的企业微信机器人配置文件纳入忽略范围。

## 核心功能

- 在 `.gitignore` 的 MCP 本地密钥分组下新增忽略条目 `dev/mcp/wecom-doc-mcp/mcp.json`
- 不修改 `mcp.json` 文件内容本身
- 改动后该文件从 git untracked 变为 ignored，验证无凭证泄露风险

## 技术栈

- 配置文件：Git `.gitignore`（纯文本，无构建/依赖）

## 实现方式

在 `d:\zoe_work_space\fj-common\.gitignore` 已有的「MCP 本地密钥与依赖」分组（第 25-28 行）末尾追加一行 `dev/mcp/wecom-doc-mcp/mcp.json`，与现有 `dev/mcp/zoe-his-mcp/.env` 等忽略条目保持同组、同风格。属于纯文本单行追加，无逻辑、无副作用。

## 实现说明

- 仅追加一行，blast radius 为零，不触碰任何其他文件
- 沿用现有分组注释，不新建分组，保持文件结构一致
- 不主动引入 `.example` 反忽略规则（用户仅要求忽略真实文件；若后续需团队共享模板可另议）
- 完成后建议用户执行 `git status` 确认 `dev/mcp/wecom-doc-mcp/mcp.json` 已从 untracked 变为 ignored（不再出现在待提交列表）

## 目录结构

```
fj-common/
└── .gitignore   # [MODIFY] 在「MCP 本地密钥与依赖」分组下新增 dev/mcp/wecom-doc-mcp/mcp.json 忽略行
```