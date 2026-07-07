# [203305] 红处方代办人下拉选择院内职工
> **文件名**：`203305-红处方代办人职工下拉+poisonousHempPrescription-staff.md`


> 状态：`verified`
> 日期：2026-06-12
> 域：门诊/住院 / 处方（cis-common 公用组件）

---

## 背景

- **需求**：红处方（麻醉和第一类精神药品处方笺）代办人姓名改为下拉选择院内职工，选中后自动带出性别、电话、身份证号；不影响手工录入
- **项目**：[203305]【漳州二院】
- **页面/菜单**：毒麻处方弹窗 → 代办人区域
- **仓库**：
  - `onelink-web-cis-common` — 前端组件
  - `onelink-micro-optimus-fj-common` — 员工分页查询 SQL

## 问题 / 目标

- 原逻辑：代办人姓名为 `zoehis-input` 纯手工录入
- 目标：姓名改为远程搜索职工下拉；选中后填充 `agentSexName`、`agentTelephone`、`agentIdCardNum`；姓名仍支持手工输入

## 根因与正确做法

### 待确认点（Step 4 已澄清）

1. **`findStaffUserByPage` 原返回字段不足**：仅含 `staffNo/staffName/staffCode/科室/职称` 等，**不含** `sexName`、`contactMethod`、`idCardNo`。需在 `StaffDao.xml` 的 `findStaffUserByPage` SELECT 中补充（字段来源 `COM_STAFF_BASIC_INFO.SEX_CODE/ID_CARD_NO/CONTACT_METHOD`，MCP 已核验表结构）。
2. **门诊/住院一次改造**：`poisonousHempPrescription.vue` 在 cis-common，通过 `outpInpCode` 区分，改一处即可。
3. **手工录入**：`zoehis-select` + `:textvalue.sync="modifyForm.agentName"`；性别/电话/身份证仍为 `zoehis-input` 可改。
4. **无代办人证件类型字段**：cis-common 旧版弹窗无此字段（pres 新版 `poisonousHempPrescriptionNew.vue` 才有），本次不涉及。

### 前端改动模式（参考 `newHasExec.vue`）

| 项 | 实现 |
|----|------|
| API | `CommonDict.findStaffUserByPage` |
| 组件 | `zoehis-select` + `filter-method` + `@scroll-to-bottom` + `@visible-change` |
| 内部值 | `v-model="agentStaffNo"`（不保存） |
| 保存值 | `:textvalue.sync="modifyForm.agentName"` |
| 选中回调 | `@change="onAgentStaffChange"` → 从 `staffUserList` 取 `sexName/contactMethod/idCardNo` 写入表单 |

### 后端改动

`onelink-micro-optimus-service/.../StaffDao.xml` → `findStaffUserByPage` 追加：

```sql
(select VALUE_NAME from zoedict.DIC_BASIC_DICT where dict_name='SEX' and VALUE_CODE=a.SEX_CODE and rownum=1) as "sexName",
a.ID_CARD_NO AS "idCardNo",
a.CONTACT_METHOD as "contactMethod"
```

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| `COM_STAFF_BASIC_INFO` | SELECT | `SEX_CODE`、`ID_CARD_NO`、`CONTACT_METHOD` |
| `/charge-service/.../findStaffUserByPage` | 查询 | 分页员工字典（改造后含性别/电话/身份证） |
| `PoisonousPrescription.savePoisonous` | 保存 | 仍写 `agentName/agentSexName/agentTelephone/agentIdCardNum`，无变更 |

## 测试要点

1. 门诊/住院各打开红处方弹窗，代办人下拉搜索职工并选中 → 性别/电话/身份证自动带出
2. 下拉输入非列表姓名 → 可保存
3. 自动带出后手工改性别/电话/身份证 → 保存重开数据正确
4. optimus 服务发布后接口返回含新字段（旧版 charge 未升 optimus 时选中无法带出）

## 关联 commit

| 仓库 | 分支/Tag | 说明 |
|------|----------|------|
| `onelink-micro-optimus-fj-common` | master `1b130e32` | `[203305]【漳州二院】红处方代办人下拉选择院内职工` |
| 同上 | release-1.166 `7953e911` | cherry-pick（全量 merge 在 `OutpAutoAcceptPool.java` 冲突） |
| 同上 | tag `release-1.166.13` | 项目发布 |
| `onelink-web-cis-common` | 本地未提交 | 审查后按项目策略跳过 Git；改动在 `poisonousHempPrescription.vue` |

## 可复用结论

1. **员工下拉 + 自动带出个人信息**：先确认 `findStaffUserByPage` 返回字段；不足则扩 `StaffDao.xml`，不要假设 API 已有 `sexName/telephone/certificateId`
2. **前端模板**：cis-common 内 `newHasExec.vue` 是标准员工远程搜索下拉模式
3. **保留手工录入**：姓名用 `textvalue.sync`；其余字段保持 `zoehis-input`
4. **仓库**：毒麻红处方公用弹窗 → `onelink-web-cis-common/components/highRiskDrugManage/poisonousHempPrescription.vue`（非 pres-fj-common 新版）
5. **release 合并**：optimus 全量 merge 易冲突 → 单 commit **cherry-pick** 到 `release-1.166`

## 升格建议

- [ ] skill / patterns — 员工下拉模式已在 `newHasExec.vue`；本 case 补充「API 字段不足需扩 SQL」
- [ ] workflow — 无需
- [ ] rule — 无需
