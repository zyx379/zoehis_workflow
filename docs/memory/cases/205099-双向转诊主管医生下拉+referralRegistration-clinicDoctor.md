# [205099] 双向转诊页面主管医生下拉选择
> **文件名**：`205099-双向转诊主管医生下拉+referralRegistration-clinicDoctor.md`


> 状态：`verified`
> 日期：2026-06-25
> 域：门诊 / 住院 / 双向转诊

---

## 背景

- **需求**：门诊和住院双向转诊登记页面，就诊医生/主管医生在保留默认值的同时，允许下拉搜索选择其他医生
- **项目**：[205099]【漳州二院】
- **页面/菜单**：双向转诊登记（门诊 + 住院）
- **仓库**：
  - `onelink-web-outp-fj-common` — 门诊转诊登记组件
  - `onelink-web-pres-fj-common` — 住院转诊登记组件

## 问题 / 目标

- 原逻辑：主管医生/就诊医生为 `<span>{{ modifyForm.doctorName }}</span>` 纯展示
- 目标：改为 `zoehis-select` 远程搜索全院职工；默认仍由 `getClinicTime()` 带出；仅 `isEdit=true` 时可改选；保存字段不变

## 根因与正确做法

### 待确认点（Step 4 已澄清）

1. **数据源**：全院职工，`CommonDict.findStaffUserByPage`，支持搜索 + 分页滚动
2. **门诊就诊医生**：与住院主管医生同步改造（同一组件 `outpInpCode` 区分 label）
3. **编辑态**：`:disabled="!modifyForm.isEdit"`
4. **保存编码**：`clinicDoctorCode` 对应 `STAFF_NO`，下拉 `itemcode="staffNo"`，`onDoctorChange` 写回 `doctorCode`/`doctorName`

### 前端改动模式（参考 case 203305 / `newHasExec.vue`）

| 项 | 实现 |
|----|------|
| API | `CommonDict.findStaffUserByPage` |
| 组件 | `zoehis-select` + `filter-method` + `@scroll-to-bottom` + `@visible-change` |
| 绑定 | `v-model="modifyForm.doctorCode"` + `:textvalue.sync="modifyForm.doctorName"` |
| 展示 | `:render-item="renderDoctorSel"` → `staffName/staffCode` |
| 默认 | `getClinicTime()` → 门诊 `clinicDoctorName/Code`，住院 `directorDoctorName/Code` |

### 默认值加载

```
getClinicTime()
  门诊: Manager.getPatientClinicInfo → clinicDoctorName / clinicDoctorCode
  住院: PatientManager.getAutoPatientInfo → directorDoctorName / directorDoctorCode
保存: PatReferralRecord.saveReferralRecord → clinicDoctorCode = modifyForm.doctorCode
```

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| `COM_STAFF_BASIC_INFO` | SELECT（经 findStaffUserByPage） | 员工下拉数据源 |
| `/charge-service/.../findStaffUserByPage` | 查询 | 无需扩 SQL（仅选医生姓名/工号） |
| `PatReferralRecord.saveReferralRecord` | 写 | `clinicDoctorCode` 字段不变 |

## 测试要点

1. 门诊/住院各打开转诊登记：默认带出医生 → 编辑态下拉搜索改选 → 保存 → 历史记录医生正确
2. 非编辑态下拉禁用
3. 未改选时 `clinicDoctorCode` 与默认值一致

## 关联 commit

| 仓库 | 分支/Tag | 说明 |
|------|----------|------|
| `onelink-web-outp-fj-common` | master `46dfc83b` | 门诊转诊登记主管医生下拉 |
| 同上 | release-1.166 `fe0f0fcf` | cherry-pick（release 与 master 基线差异，仅合入 doctorList 相关块） |
| 同上 | tag `release-1.166.23` | 项目发布 |
| `onelink-web-pres-fj-common` | master `1176be30` | 住院转诊登记主管医生下拉 |
| 同上 | release-1.166 merge | merge master 无冲突 |
| 同上 | tag `release-1.166.30` | 项目发布 |

## 可复用结论

1. **转诊医生下拉**：复用 203305 员工远程搜索模式；`doctorCode` 用 `staffNo` 与 `CLINIC_DOCTOR_CODE` 一致
2. **门诊/住院对称**：`referralRegistration.vue` 两处独立文件（outp / pres），改造模式相同
3. **release 合并**：outp `release-1.166` 与 master 基线差异大时，全量 merge 易冲突 → 单 commit **cherry-pick**；冲突时保留 release 既有块（如 `reasonSelectFlag`），仅合入 doctorList 相关改动
4. **Git 规范**：功能代码只在 **master** 开发提交；release 仅 merge/cherry-pick，不在 release 上手改业务逻辑

## 关联 case

- [203042](2026-06-referral-form-reason-dict-dialog.md) — 双向转诊原因弹窗（master）
- [203305](2026-06-red-prescription-agent-staff-select.md) — 员工下拉标准模式

## 升格建议

- [ ] skill / patterns — 员工下拉模式已在 203305；本 case 补充「转诊双页面 outp+pres」
- [ ] workflow — 无需
- [ ] rule — 无需
