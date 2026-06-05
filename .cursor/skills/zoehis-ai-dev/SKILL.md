---
name: zoehis-ai-dev
description: >-
  Fujian common HIS (fj-common) full-stack dev: Nuxt/Vue + Spring/MyBatis.
  Use for new features, code review, DB/SQL, outpatient/inpatient/charge/drug flows.
  Follow .cursor/rules and docs/workflow.md step-by-step with progress checklist.
---

# ZOEHIS AI 开发（fj-common）

福建通用 HIS 聚合工作区。命名、风格、业务、表结构、Git 由 **`.cursor/rules/zoehis-*.mdc`** 自动约束；本 Skill 负责工作流与参考资料。

## 工作区子仓库

| 仓库 | 域 |
|------|-----|
| onelink-web-outp-fj-common | 门诊前端 |
| onelink-web-pres-fj-common | 处方前端 |
| onelink-web-his-charge-fj-common | 收费前端 |
| onelink-web-his-drug-fj-common | 药库前端 |
| onelink-web-his-fj-component | 公共组件 |
| onelink-micro-pres-fj-common | 处方服务 |
| onelink-micro-charge-fj-common | 收费服务 |
| onelink-micro-optimus-fj-common | 基础服务 |
| onelink-micro-insurance-fj-ybcommon | 医保服务 |

## 何时使用

- 新功能 / 页面改造 / Bug 修复（改代码）
- 规范检查、表结构/SQL、业务流程咨询
- **不用于** 生产 traceId 排查 → 用个人 Skill `his-log-diagnosis`

## 必须遵守的工作流

**必须**按 **[docs/workflow.md](../../../docs/workflow.md)** 执行，逐步勾选汇报「需求处理进度」清单（Step 0–12），不得跳步。

要点：spec 门禁 → 实现 → 业务校验 → AI 审查 → 人审 → Git 交付 → Step 11 测试库造数 → **Step 12 经验沉淀**（[docs/memory](../../../docs/memory/README.md)）。新需求前可检索 `docs/memory/index.md`。

**硬约束：** 业务流程不清时列待确认点，禁止编造表名/接口/流程。

## 默认行为（交付闭环）

以下两项**默认执行**，**无需**在交付时再向用户确认「是否 push / 是否打包编译 / 是否写经验」。

### 1. 提交后 → 编译（自动）

- 用户已触发 Git 交付（如「审查通过，提交并发布」、或已给出 commit 并明确要求 push/发布）时：按 Step 10 完成 **push master → merge 项目分支 → 打 tag** 后，**直接结束交付**，不再追问是否编译。
- 各子仓库 GitLab CI 由 **tag / release 分支** 自动触发打包（前端常见 `npm run generate` + Push to Platform；后端 Maven 等）。
- 最终回复**直接列出**各改动仓的 **tag 号**（示例：`收费前端 tag：release-1.168.23`）；仅 push master、未打发布 tag 时注明「未打发布 tag，无发布流水线」。
- `release-*` 与 master 差异大、**全量 merge 冲突**时：优先对目标 commit **cherry-pick** 到项目分支，勿强行解全仓冲突。

### 2. 默认沉淀一次经验（Step 12）

- 每次需求交付闭环后**默认**写一条经验（除非纯一次性文案等无可复用点，须在进度清单注明「无沉淀」）。
- 使用 [cases/_template.md](../../../docs/memory/cases/_template.md) 新建 `docs/memory/cases/YYYY-MM-<slug>.md`，并更新 [docs/memory/index.md](../../../docs/memory/index.md)。
- **无需**用户另说「沉淀经验」「写 memory」。

## 输出要求

1. 涉及子仓库与文件清单（前/Api/Controller/Service/Dao.xml）
2. 涉及表及增删改（池表→记录）
3. 业务校验点
4. 审查通过后 Git 交付（逐仓）：push master；可选关键词 merge + 项目分支 tag+1
5. Step 11：MCP 测试库造数（Rule `zoehis-test-data`）
6. Step 12：可复用经验写入 `docs/memory/cases/`（见 memory/README）

## 技术栈

- 前端：Nuxt 2 + Vue 2.6 + zoehis-* + Vuex + SCSS scoped
- 后端：Spring Boot 2.3 + JDK 11 + MyBatis `*Dao.xml` + 达梦/Oracle
- 基础设施：Dubbo + Nacos + ZK；Maven api/pojo/service

## 参考资料（按需 Read）

| 文件 | 用途 |
|------|------|
| [docs/workflow.md](../../../docs/workflow.md) | **最终版执行工作流（必读）** |
| [docs/memory/README.md](../../../docs/memory/README.md) | 工作经验记忆库与定期优化归档 |
| [patterns/his-business-patterns.md](patterns/his-business-patterns.md) | 门诊/住院表级数据流 |
| [patterns/common-patterns.md](patterns/common-patterns.md) | 通用代码模式 |
| [examples/full-stack-example.md](examples/full-stack-example.md) | 全栈示例骨架 |
| [docs/frontend-components.md](docs/frontend-components.md) | zoehis 组件（改 UI 时） |
| [docs/ai-dev-setup-workflow.md](../../../docs/ai-dev-setup-workflow.md) | 配置总览与 Rule/Skill 说明 |

## 关联 Rules

- `.cursor/rules/zoehis-naming.mdc`
- `.cursor/rules/zoehis-code-style.mdc`
- `.cursor/rules/zoehis-business.mdc`
- `.cursor/rules/zoehis-db-tables.mdc`
- `.cursor/rules/zoehis-git-branch.mdc`
- `.cursor/rules/zoehis-test-data.mdc`
- `.cursor/rules/zoehis-code-review.mdc`
