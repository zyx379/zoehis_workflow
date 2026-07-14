# fj-common — Agent 指引

福建通用 HIS **多仓库聚合工作区**（10 个独立 Git 子仓库，根目录无 Git）。

## 开发（改代码）

1. **每次需求按步骤执行：** [docs/workflow.md](docs/workflow.md)（最终版 + 开场模板）
2. 遵守 `dev/rules/zoehis-*.mdc`（Cursor 经 `.cursor/rules` 联接加载；含 Step 8、系统参数规范 `zoehis-sys-param`）
3. 使用 Skill **zoehis-ai-dev**（`dev/skills/`，经 `.cursor/skills` 联接）；Step 4 代码地图用 **zoehis-code-map**
4. 配置说明：[docs/ai-dev-setup-workflow.md](docs/ai-dev-setup-workflow.md)
5. **多设备同步**：[docs/multi-device-sync.md](docs/multi-device-sync.md)（GitHub 配置仓）
6. **多编辑器协作**：[docs/multi-editor-cursor-collab.md](docs/multi-editor-cursor-collab.md)（Trae/CodeBuddy → Cursor）

## 生产排查

| 场景 | 文档 |
|------|------|
| MCP / traceId 可达 | Skill **`dev/skills/his-log-diagnosis`** + MCP **`zoe-his-mcp`**（`dev/mcp/zoe-his-mcp/`，workflow 分支 A） |
| **现场库不可达** | [docs/排查/现场离线排查流程.md](docs/排查/现场离线排查流程.md)（分支 B，只读代码逻辑分析，验证前不改代码） |

> **子仓库路径**：所有后端代码均在本地子目录（如 `onelink-micro-charge-fj-common/`），排查时直接 Read/Grep，不要误判为"代码不在本地"。完整映射见 Skill `zoehis-code-map`。

## Git 约定摘要

- 实现期：只改代码 + master pull，不提交
- **提交标题：** `[禅道号/需求号]【项目名称】需求标题`
- **禁止** commit 含 `Co-authored-by: Cursor` / `cursoragent@cursor.com`（见 Rule `zoehis-git-branch`）
- 人审后：「审查通过，提交并 push」→ 各仓 push master
- 「审查通过，提交并发布」→ push master → 按 commit 关键词 merge（【漳州二院】→ release-1.166；【漳州市医院】→ release-1.168）→ **项目分支** tag 最大值 +1；**无需再确认**是否编译，直接回报 tag 号（CI 自动打包）
- **`onelink-web-cis-common`**：push master 后，**在 master 打 `release-1.0.{max+1}` tag**（默认 release-1.0 系列，不打医院 release-* 分支）；2026-07-13 用户明确覆盖旧「仅 push master」规则（曾误改 release-0.0，同日纠正）
- 交付后 **默认** Step 12 写 `docs/memory/cases/`（见 Skill **zoehis-ai-dev**）

## 测试造数

- Step 11（默认跳过）：MCP **`zoe-his-mcp`**（`dev/mcp/zoe-his-mcp/`）在**测试库** INSERT/UPDATE 造数 + SELECT 验证（见 `docs/workflow.md`）

## 工作经验记忆库

- **长期**：[docs/memory/cases/](docs/memory/cases/) + index — **开发交付** Step 12 沉淀  
- **短期**：[docs/memory/short-term/](docs/memory/short-term/) — Step 4–5 分析/spec；交付后删除  
- **排查类**（分支 A/B）：召回见 workflow「排查类共用约定」；纯排查 **不写 cases**；可复用模式 → `his-log-diagnosis/cases.md`
