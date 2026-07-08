---
name: zoehis-ai-dev
description: >
  ZOEHIS full-stack workflow orchestrator. Use for complete feature delivery spanning
  multiple layers (frontend + backend + DB + business). Automatically delegates to
  domain-specific skills: zoehis-frontend (pages/components/API layer), zoehis-backend
  (controllers/services/DAO), zoehis-business (pool tables/prepay/flows), zoehis-git-ops
  (commit/merge/tag). Follows docs/workflow.md step-by-step with progress checklist.
  Triggers: 新功能, 改造, 全栈, 端到端, 需求开发, Bug修复, 功能开发, 功能改造
---

# ZOEHIS AI 开发编排器

福建通用 HIS 聚合工作区。命名、风格、业务、表结构、Git 由 **`dev/rules/zoehis-*.mdc`** 约束（Cursor 经 `.cursor/rules` 联接自动加载）。

**本 Skill 是编排器**，收到需求后：
1. 按 `docs/workflow.md` 逐步执行
2. Step 2 代码定位后，**按需 Read 领域 Skill**（不提前全部加载）

## 工作区子仓库

> **定位方法**：所有子仓库均位于工作区根目录 `{workspaceRoot}/` 下（如 `d:\zoe_work_space\fj-common\onelink-web-pres-fj-common`）。
> **禁止**用 Glob `**/{repo-name}/**` 搜索子仓库（会返回空）。应直接 `LS {workspaceRoot}/{repo-name}/` 或 `Read {workspaceRoot}/{repo-name}/...` 访问。

| 仓库 | 域 | 实际路径 |
|------|-----|----------|
| onelink-web-outp-fj-common | 门诊前端 | `{workspaceRoot}/onelink-web-outp-fj-common/` |
| onelink-web-pres-fj-common | 医嘱前端 | `{workspaceRoot}/onelink-web-pres-fj-common/` |
| onelink-web-his-charge-fj-common | 收费前端 | `{workspaceRoot}/onelink-web-his-charge-fj-common/` |
| onelink-web-his-drug-fj-common | 药库前端 | `{workspaceRoot}/onelink-web-his-drug-fj-common/` |
| onelink-web-his-fj-component | 公共组件 | `{workspaceRoot}/onelink-web-his-fj-component/` |
| onelink-web-cis-common | CIS 公共组件（npm 包；**Git 仅 push master**） | `{workspaceRoot}/onelink-web-cis-common/` |
| onelink-micro-pres-fj-common | 医嘱后端 | `{workspaceRoot}/onelink-micro-pres-fj-common/` |
| onelink-micro-charge-fj-common | 收费服务 | `{workspaceRoot}/onelink-micro-charge-fj-common/` |
| onelink-micro-optimus-fj-common | 基础服务 | `{workspaceRoot}/onelink-micro-optimus-fj-common/` |
| onelink-micro-insurance-fj-ybcommon | 医保服务 | `{workspaceRoot}/onelink-micro-insurance-fj-ybcommon/` |

## 领域 Skill 按需加载策略

**核心原则：** 不在收到需求时立即加载所有 Skill。Step 2 代码定位后，按改动文件类型加载对应 Skill：

| Step 2 定位结果 | 加载的 Skill（Read） |
|----------------|---------------------|
| Step 4 需求分析 | `zoehis-code-map` |
| Step 4 记忆召回=在线/全部 | `ima-knowledge`（全局 `~/.cursor/skills/ima-knowledge/`） |
| Step 12 经验沉淀 + IMA 同步 | `ima-knowledge` |
| 仅前端文件（pages/、components/、api/） | `zoehis-frontend` |
| 仅后端文件（Controller/Service/Dao/Dao.xml） | `zoehis-backend` + `zoehis-business` |
| 仅改 SQL/Dao.xml 且无业务变更 | `zoehis-backend` |
| 前端 + 后端 | `zoehis-frontend` + `zoehis-backend` + `zoehis-business` |
| 涉及表结构变更 | 所有以上 + `zoehis-business` |
| Step 10 Git 交付 | `zoehis-git-ops` |
| Step 7 业务校验 | `zoehis-business` |
| Step 8 AI 代码审查 | `dev/rules/zoehis-code-review.mdc` |

## 强制工作流（不可跳步）

**必须**按 **[docs/workflow.md](../../../docs/workflow.md)** 执行，逐步汇报进度清单。

```
 0. 任务分流（功能/Bug/生产排查）
 1. 需求理解（业务域、数据流、待确认点）
 2. 代码定位（文件清单 + 子仓库清单）→ 按需加载领域 Skill
 3. Git 同步（各子仓库 master pull）
 4. 需求分析（代码地图 + 记忆库；Skill zoehis-code-map）
 5. 产出 spec + 用户确认（复杂需求门禁）
 6. 最小实现
 7. 业务校验（池表/流水/预交金）
 8. AI 局部审查（异常风险 + 幻觉/SQL MCP 核验）
 9. 等待人工审查
10. Git 交付（push → merge → tag）
11. MCP 测试库造数 + 验证
12. 经验沉淀（长期 cases + 清理 short-term 与需求 Skill）
13. 会话收尾（Usage 查看 token；Agent 汇报范围统计）
```

**硬约束：** 业务流程不清时列待确认点，禁止编造表名/接口/流程。

## 复杂度分流

Agent 在 Step 0 判定后输出：

| 复杂度 | 条件 | 流程 |
|--------|------|------|
| **Trivial** | 单文件、不改逻辑、不涉及 DB | 0→6→9→10（Skip 4–5） |
| **Standard** | 单仓库、不改 DB 表、逻辑清晰 | 全流程，Skip 5 spec（Step 4 可合并到 Step 2） |
| **Complex** | 跨仓库 / 改 DB / 跨多接口 / 业务不明确 | 全流程（含 Step 4 代码地图 + Step 5 spec 门禁） |

## 默认行为（交付闭环）

### 1. 提交后 → 编译（自动）

- 用户已触发 Git 交付时，按 Step 10 完成后直接回报各仓 **tag 号**，不追问是否编译
- GitLab CI 由 tag/release 分支自动触发打包
- `release-*` 冲突优先 `cherry-pick`
- **`onelink-web-cis-common`**：仅 push master，不 merge/tag，不参与项目分支编译

### 2. cherry-pick 后格式审核（强制）

解决冲突后、`git add` 前，确认无残留冲突标记、括号匹配、缩进一致、语法无误。

### 3. 系统参数单独提交（硬约束）

`*BizSysParam.jsonl` 不得与功能代码同一 commit。详见 `zoehis-git-ops`。

### 4. 默认沉淀一次经验（Step 12）

交付闭环后默认写/更新长期 case，更新 `docs/memory/index.md`。

**命名与唯一性（硬约束）：**

1. **同一禅道号只保留一个 case 文件**；后续改造、补丁、返工在原文档追加「改造记录」章节，**禁止**同禅道号再建新文件
2. **文件名用中文 + 禅道号前缀（有则必填）**：`{禅道号}-{功能描述}+{关键索引}.md`  
   - 无禅道号时省略前缀：`{功能描述}+{关键索引}.md`  
   - **文档 H1**：`# [禅道号] {功能描述}`，与文件名「功能描述」一致  
   - 示例：`206301-入院登记主管医生同步医疗组+hospitalizationForm-clinicGroup.md`

**写入前**：Read `docs/memory/index.md`，按禅道号检索；已存在 → 更新原文件；不存在 → 新建。

### 5. Step 4/5 短期记忆与 Spec（硬约束）

Step 4 代码地图与 Step 5 spec **共用同一 short-term 文件**（详见 workflow Step 4.3 / 5）：

| 项 | 规则 | 示例 |
|----|------|------|
| **文件名** | `{禅道号}-{功能描述}+{关键索引}.md` | `206295-医嘱申请条数+docOderQuery-停嘱时间.md` |
| **文档 H1** | `# [禅道号] {功能描述}` | `# [206295] 医嘱申请条数展示与停嘱时间过滤` |
| **唯一性** | 同一禅道号进行中只保留一个 short-term；spec 写在 `## Spec` 节 | — |
| **Spec 子标题** | 全部中文（改造计划、涉及子仓库、文件清单…） | 见 `short-term/_template.md` |

Skill：`zoehis-code-map`（Step 4 写入）；Step 12 删除 short-term 及 `dev/skills/{禅道号}-*/`（经 `.cursor/skills` 联接）。

## 输出要求

1. 涉及子仓库与文件清单
2. 涉及表及增删改
3. 业务校验点
4. 审查通过后 Git 交付（逐仓）
5. MCP 测试库造数
6. 可复用经验写入 `docs/memory/cases/`；清理 `docs/memory/short-term/` 及对应 `dev/skills/{禅道号}-*/` 需求 Skill

## 技术栈

- 前端：Nuxt 2 + Vue 2.6 + zoehis-* + Vuex + SCSS scoped
- 后端：Spring Boot 2.3 + JDK 11 + MyBatis `*Dao.xml` + 达梦/Oracle
- 基础设施：Dubbo + Nacos + ZK；Maven api/pojo/service

## 参考资料

| 文件 | 用途 | 按需加载 |
|------|------|---------|
| [docs/workflow.md](../../../docs/workflow.md) | **最终版执行工作流（必读）** | 始终 |
| [../zoehis-frontend/SKILL.md](../zoehis-frontend/SKILL.md) | 前端组件/Vue/API 层 | Step 2 判定前端改动 |
| [../zoehis-backend/SKILL.md](../zoehis-backend/SKILL.md) | 后端 Controller/Service/DAO/XML/Maven | Step 2 判定后端改动 |
| [../zoehis-business/SKILL.md](../zoehis-business/SKILL.md) | 业务模式/池表/主细/预交金 | Step 2/7 判定涉及业务 |
| [../zoehis-git-ops/SKILL.md](../zoehis-git-ops/SKILL.md) | Git 提交/分支/tag | Step 10 Git 交付 |
| [docs/memory/README.md](../../../docs/memory/README.md) | 工作经验记忆库 | Step 12 |
| [patterns/his-business-patterns.md](patterns/his-business-patterns.md) | 门诊/住院表级数据流（保留引用） | Step 1/7 |
| [patterns/common-patterns.md](patterns/common-patterns.md) | 通用代码模式（保留引用） | Step 6 |
| [../zoehis-code-map/SKILL.md](../zoehis-code-map/SKILL.md) | Step 4 代码地图 / 需求分析 | Step 4 或 Complex |
| [examples/full-stack-example.md](examples/full-stack-example.md) | 全栈示例骨架 | Step 5 spec |
| [docs/frontend-components.md](docs/frontend-components.md) | zoehis 组件 API（保留引用） | 前端改动时 |

## 关联 Rules

- `dev/rules/zoehis-naming.mdc`
- `dev/rules/zoehis-code-style.mdc`
- `dev/rules/zoehis-business.mdc`
- `dev/rules/zoehis-db-tables.mdc`
- `dev/rules/zoehis-sys-param.mdc`
- `dev/rules/zoehis-git-branch.mdc`
- `dev/rules/zoehis-test-data.mdc`
- `dev/rules/zoehis-code-review.mdc`
