# Workflow / Skill / Rule 优化日志

记录从经验库**升格**或**归档**的操作，便于追溯。

---

## 格式

```markdown
### YYYY-MM-DD — <标题>
- **触发**：月度回顾 / 单次需求升格 / 人工修正
- **来源 case**：（链接，可无）
- **变更**：
  - workflow：…
  - skill：…
  - rule：…
- **归档**：`archive/YYYY-MM-DD/`（如有）
- **确认人**：
```

---

## 记录

### 2026-06-05 — 根目录 Meta Git 初始化（多设备同步）

- **触发**：继续多设备 GitHub 同步任务
- **变更**：
  - 新增根目录 `README.md`、`.gitignore`
  - `git init` + 首 commit（25 文件，不含 onelink-*）
  - 待用户添加 remote 并 push
- **确认人**：团队

### 2026-06-05 — Skill 默认交付行为 + 首条 case

- **触发**：需求 201533 住院非医疗项目收费不默认患者
- **变更**：
  - `zoehis-ai-dev` SKILL：默认提交后编译（不确认）、默认 Step 12 沉淀
  - `workflow.md` Step 10/12、`AGENTS.md` 同步
  - 新增 `cases/2026-06-nonMedicalCost-no-default-patient.md`，更新 `index.md`

### 2026-06-05 — 初始化经验记忆库

- **触发**：搭建 memory 目录与 workflow Step 12
- **变更**：
  - 新增 `docs/memory/`（README、index、cases 模板、optimization-log、archive）
  - workflow Step 12 经验沉淀
- **确认人**：团队

### 2026-06-08 — 系统参数规范升格 + 业务知识强化

- **触发**：月度回顾 / 近期 6 个 case 的经验提炼
- **来源 case**：202238（系统参数提交）/ 202235（页面参数模式）/ 201737（费用审核分离）
- **变更**：
  - rule：新建 `zoehis-sys-param.mdc`（系统参数 vs 页面参数区分 + jsonl 提交规范）
  - rule：增强 `zoehis-business.mdc`（费用审核/结算分离 + 有效期模式）
  - skill：增强 `zoehis-business/SKILL.md`（参数体系 + 页面参数三步模式）
  - skill：增强 `zoehis-git-ops/SKILL.md`（关联 sys-param rule）
  - patterns：`common-patterns.md` 新增 §1.7（页面参数模式）+ §1.8（费用审核/结算分离）
  - workflow：Step 1 增加参数体系识别；Step 6 增加参数专项要点
  - AGENTS.md：补充 sys-param rule 引用
  - 新增 case：`2026-06-dispense-pool-release-skip-valid-check.md`（202505）
- **确认人**：团队

### 2026-06-10 — 读卡 bundle 双标识排查升格（202226 复测）

- **触发**：202226 首修后测试仍失败，prompt1 排查任务
- **来源 case**：[cases/2026-06-patientList-disease-fee-audit-icons.md](cases/2026-06-patientList-disease-fee-audit-icons.md)
- **变更**：
  - skill：`zoehis-ai-dev/patterns/common-patterns.md` 新增 §1.10 读卡 bundle 列宽模式
  - case：更正根因（YSK HTML 表遗漏），补修 CSS 说明
  - index：202226 关键词增加 READ_CARD_VERSION
- **确认人**：团队
