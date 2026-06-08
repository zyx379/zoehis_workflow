# [202226] 选择病人弹窗单病种与费用审核标识同时显示

> 状态：`verified`  
> 日期：2026-06-06  
> 域：收费 / 住院 / 读卡组件

---

## 背景

- **需求**：单病种显示「单」、费用审核显示「费」，两者同时满足时应并排展示
- **页面/菜单**：读卡条「选择病人」弹窗（住院/出院病人列表）
- **仓库**：`onelink-web-his-charge-fj-common`
- **文件**：`static/plugins/all-common-business/AllCommonBusiness.{umd,common,umd.min}.js`（`@zoesoft.com.cn/all-common-business` 编译产物）

## 问题 / 目标

费用审核后列表只见红色「费」，绿色「单」不显示；用户误以为逻辑互斥。

## 根因与正确做法

- **根因**：`packages/DaLian/patientList.vue`、`packages/YSK/patientList.vue` 模板已是两个独立 `v-if`（`feeAuditFlag==1` 与 `diseaseCode`），并非 `v-else-if`；但标识列 `itemWidth: 35px`，双圆标（各 18px）在 `overflow: hidden` 下被裁切，「单」被挡住。
- **改法**：
  1. `feeAuditFlag` 列宽 `35px` → `52px`
  2. 增加 `*_icon_patient_audit_wrap`（`inline-flex` + `gap`）包裹「费」「单」
  3. 同步改 `umd` / `common` / `umd.min` 三份 bundle

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| 无 | — | 纯前端展示；`diseaseCode`、`feeAuditFlag` 后端原已返回 |

## 测试要点

- MCP 造数：无（UI 布局修复）
- 界面步骤：打开带读卡「选择病人」的住院收费页 → 出院病人 → 选单病种且已费用审核患者 → 费用审核列应同时见红「费」+ 绿「单」

## 关联 commit

- `[202226]【漳州市医院】单病种的病人，前面会显示一个单的标识，费用审核后，会显示一个费的标识，要求要两个都显示`

## 可复用结论

- 选择病人弹窗标识在 `all-common-business` 的 `DaLian/patientList`、`YSK/patientList`，非业务页面内联
- 双标识「只显示一个」时先查列宽与 `overflow`，再查 `v-if` 是否互斥
- `release-*` 与 master 全量 merge 易冲突时，对目标 commit **cherry-pick** 到项目分支

## 升格建议

- [ ] workflow
- [ ] skill / patterns
- [x] rule
- [ ] 无需升格，保留 case 即可

**说明**：读卡 bundle 热修模式可记入 skill `common-patterns`（若多次出现）
