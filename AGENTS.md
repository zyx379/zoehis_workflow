# fj-common — Agent 指引

福建通用 HIS **多仓库聚合工作区**（9 个独立 Git 子仓库，根目录无 Git）。

## 开发（改代码）

1. **每次需求按步骤执行：** [docs/workflow.md](docs/workflow.md)（最终版 + 开场模板）
2. 遵守 `.cursor/rules/zoehis-*.mdc`（含 Step 8：异常风险 + 幻觉 SQL 字段 MCP 查表）
3. 使用 Skill **zoehis-ai-dev**；代码定位优先 **Codegraph** MCP
4. 配置说明：[docs/ai-dev-setup-workflow.md](docs/ai-dev-setup-workflow.md)
5. **多设备同步**：[docs/multi-device-sync.md](docs/multi-device-sync.md)（GitHub 配置仓）

## 生产排查（traceId）

使用个人 Skill **his-log-diagnosis** + MCP `user-zoe-his-mcp`，验证前不改代码。

## Git 约定摘要

- 实现期：只改代码 + master pull，不提交
- **提交标题：** `[禅道号/需求号]【项目名称】需求标题`
- 人审后：「审查通过，提交并 push」→ 各仓 push master
- 「审查通过，提交并发布」→ push master → 按 commit 关键词 merge（【漳州二院】→ release-1.166；【漳州市医院】→ release-1.168）→ **项目分支** tag 最大值 +1；**无需再确认**是否编译，直接回报 tag 号（CI 自动打包）
- 交付后 **默认** Step 12 写 `docs/memory/cases/`（见 Skill **zoehis-ai-dev**）

## 测试造数

- Step 11：MCP `user-zoe-his-mcp` 在**测试库** INSERT/UPDATE 造数 + SELECT 验证（见 `docs/workflow.md`）

## 工作经验记忆库

- 目录：[docs/memory/](docs/memory/README.md) — 需求后 Step 12 写 case；定期回顾升格 workflow/skill/rule 并 **archive** 旧版
