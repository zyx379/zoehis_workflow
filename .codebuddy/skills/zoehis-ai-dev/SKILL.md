---
name: zoehis-ai-dev
description: >
  ZOEHIS full-stack workflow orchestrator for CodeBuddy. Use for feature delivery spanning
  frontend + backend + DB + business in the fj-common multi-repo workspace. Automatically
  references .cursor/rules/ and .cursor/skills/ for domain knowledge. Follows docs/workflow.md
  step-by-step. Default scope in CodeBuddy: Step 0-4 external analysis (output Cursor handoff
  block); extends to full workflow when user explicitly requests implementation in CodeBuddy.
  Triggers: 新功能, 改造, 全栈, 端到端, 需求开发, Bug修复, 功能开发, 功能改造, 代码地图, 需求分析
---

# ZOEHIS AI 开发编排器（CodeBuddy 版）

福建通用 HIS 聚合工作区。命名、风格、业务、表结构、Git 由 **`@.cursor/rules/zoehis-*.mdc`** 自动约束。

**本 Skill 是编排器**，收到需求后：
1. 按 `docs/workflow.md` 逐步执行
2. Step 2 代码定位后，**按需 Read 领域 Skill**（不提前全部加载）
3. **默认只做 Step 0-4**（外部分析），输出 Cursor 交接块
4. 用户明确要求「在 CodeBuddy 改代码/提交」时，可执行完整 Step 0-13

## 工作区子仓库

| 仓库 | 域 |
|------|-----|
| onelink-web-outp-fj-common | 门诊前端 |
| onelink-web-pres-fj-common | 医嘱前端 |
| onelink-web-his-charge-fj-common | 收费前端 |
| onelink-web-his-drug-fj-common | 药库前端 |
| onelink-web-his-fj-component | 公共组件 |
| onelink-web-cis-common | CIS 公共组件（npm 包；Git 仅 push master） |
| onelink-micro-pres-fj-common | 医嘱后端 |
| onelink-micro-charge-fj-common | 收费服务 |
| onelink-micro-optimus-fj-common | 基础服务 |
| onelink-micro-insurance-fj-ybcommon | 医保服务 |

## CodeBuddy 默认模式：外部分析（Step 0-4）

> 参考 `docs/prompt_external.md`

**禁止**：改代码、git pull/commit/push、spec 最终确认。

### 进度清单

```
外部分析进度:
- [ ] 0. 任务分流（功能 / Bug；生产排查请改 his-log-diagnosis，不走本模板）
- [ ] 1. 需求理解（业务域、参数体系、数据流、待确认点）
- [ ] 2. 代码定位（子仓库 + 候选文件清单）
- [ ] 4. 需求分析（代码地图 + 记忆库命中 + 待确认）
- [ ] 交接. 输出 Cursor 交接块
```

### Step 4 代码地图

Read `@.cursor/skills/zoehis-code-map/SKILL.md`

必须输出：
1. **代码地图表**（仓库、路径、角色、置信度）
2. **调用关系**（页面 → API → 后端 → 表）
3. **记忆库命中**（index/cases 链接与一句可复用结论）
4. **待确认问题**（业务不清、低置信度路径）
5. 写入 `docs/memory/short-term/{禅道号}-{slug}.md`（含末栏「人工审核意见（选填）」）
6. 表/SQL 字段存疑时标「待 Cursor Step 4 MCP get_table_schema」（外部分析不调 MCP）

**禁止**：编造表名、SQL 列名、接口 URL。

### Cursor 交接块（分析结束时必须输出）

```text
【来自 CodeBuddy 初步分析 — 请在 Cursor 从 Step 5 继续】

【禅道&项目】
[禅道号]【项目名称】

【短期记忆文件】
docs/memory/short-term/xxx.md

【代码地图摘要】
| 仓库 | 路径 | 角色 | 置信度 |
（粘贴表格）

【调用关系】
（一行或箭头图）

【记忆库命中】
- case 链接 + 结论

【待确认（请 Cursor spec 前澄清或标注假设）】
1. ...

【建议复杂度】Trivial / Standard / Complex

【下一步】
请在 Cursor 完善 spec（Step 5），等我确认后实现。
```

---

## 扩展模式：完整工作流（用户明确要求时）

若用户说「在 CodeBuddy 完成全部流程」或「不用 Cursor，直接改」，则执行完整 Step 0-13：

```
 0. 任务分流（功能/Bug/生产排查）
 1. 需求理解（业务域、数据流、待确认点）
 2. 代码定位（文件清单 + 子仓库清单）→ 按需加载领域 Skill
 3. Git 同步（各子仓库 master pull）
 4. 需求分析（代码地图 + 记忆库；Read @.cursor/skills/zoehis-code-map/SKILL.md）
 5. 产出 spec + 用户确认（复杂需求门禁）
 6. 最小实现
 7. 业务校验（池表/流水/预交金）
 8. AI 局部审查（异常风险 + 幻觉/SQL MCP 核验；Read @.cursor/rules/zoehis-code-review.mdc）
 9. 等待人工审查
10. Git 交付（push → merge → tag）
11. MCP 测试库造数 + 验证
12. 经验沉淀（长期 cases + 清理 short-term）
13. 会话收尾
```

### 领域 Skill 按需加载策略

| Step 2 定位结果 | 加载的 Skill / Rule |
|----------------|---------------------|
| Step 4 需求分析 | `@.cursor/skills/zoehis-code-map/SKILL.md` |
| 仅前端文件 | `@.cursor/skills/zoehis-frontend/SKILL.md` |
| 仅后端文件 | `@.cursor/skills/zoehis-backend/SKILL.md` + `@.cursor/skills/zoehis-business/SKILL.md` |
| 前端 + 后端 | `@.cursor/skills/zoehis-frontend/SKILL.md` + `@.cursor/skills/zoehis-backend/SKILL.md` + `@.cursor/skills/zoehis-business/SKILL.md` |
| Step 10 Git 交付 | `@.cursor/skills/zoehis-git-ops/SKILL.md` |
| Step 7 业务校验 | `@.cursor/skills/zoehis-business/SKILL.md` |
| Step 8 AI 审查 | `@.cursor/rules/zoehis-code-review.mdc` |

### 复杂度分流

| 复杂度 | 条件 | 流程 |
|--------|------|------|
| **Trivial** | 单文件、不改逻辑、不涉及 DB | 0→6→9→10（Skip 4-5） |
| **Standard** | 单仓库、不改 DB 表、逻辑清晰 | 全流程，Skip 5 spec（Step 4 可合并到 Step 2） |
| **Complex** | 跨仓库 / 改 DB / 跨多接口 / 业务不明确 | 全流程（含 Step 4 代码地图 + Step 5 spec 门禁） |

---

## 关联 Rules（按需 Read）

- `@.cursor/rules/zoehis-naming.mdc`
- `@.cursor/rules/zoehis-code-style.mdc`
- `@.cursor/rules/zoehis-business.mdc`
- `@.cursor/rules/zoehis-db-tables.mdc`
- `@.cursor/rules/zoehis-sys-param.mdc`
- `@.cursor/rules/zoehis-git-branch.mdc`
- `@.cursor/rules/zoehis-test-data.mdc`
- `@.cursor/rules/zoehis-code-review.mdc`

## 参考资料

| 文件 | 用途 | 按需加载 |
|------|------|---------|
| `docs/workflow.md` | **最终版执行工作流（必读）** | 始终 |
| `docs/prompt_external.md` | CodeBuddy 外部分析模板 | 默认模式 |
| `@.cursor/skills/zoehis-code-map/SKILL.md` | Step 4 代码地图 | Step 4 或 Complex |
| `@.cursor/skills/zoehis-frontend/SKILL.md` | 前端组件/Vue/API 层 | 前端改动 |
| `@.cursor/skills/zoehis-backend/SKILL.md` | 后端 Controller/Service/DAO/XML | 后端改动 |
| `@.cursor/skills/zoehis-business/SKILL.md` | 业务模式/池表/主细/预交金 | 业务改动 |
| `@.cursor/skills/zoehis-git-ops/SKILL.md` | Git 提交/分支/tag | Step 10 |
| `docs/memory/README.md` | 工作经验记忆库 | Step 12 |
