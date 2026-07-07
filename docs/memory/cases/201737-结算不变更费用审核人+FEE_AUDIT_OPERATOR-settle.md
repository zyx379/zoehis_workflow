# [201737] 结算时不变更费用审核人
> **文件名**：`201737-结算不变更费用审核人+FEE_AUDIT_OPERATOR-settle.md`


> 状态：`verified`  
> 日期：2026-06-08  
> 域：住院 / 收费 / 医保

---

## 背景

- **需求**：住院结算（含医保预结算/冲销）时，不应把 `PAT_IN_HOSPITAL`、`PAT_ADMISSION_RECORD` 的 `FEE_AUDIT_OPERATOR` 覆盖为结算人
- **页面/菜单**：住院收费结算、医保预结算
- **仓库**：`onelink-micro-charge-fj-common`、`onelink-micro-insurance-fj-ybcommon`
- **文件**：
  - `PatientVisitInfoDao.xml` / `InsurManageDao.xml` — `updateAdmissionFeeAuditFlag`、`updateHosptalFeeAuditFlag`
  - `FuZhouNationalInsuranceInpService.java` 等医保结算尾点
  - `InpInvoiceManageServiceImpl.java` — 医保已冲销

## 问题 / 目标

预出院流程下，医保预结算成功后会调用 `updateFeeAuditFlag(eventNo, "1", operator)` 锁定费用；取消/冲销时传 `"0"`。原 SQL 同时更新 `FEE_AUDIT_FLAG` 与 `FEE_AUDIT_OPERATOR`，导致费用审核人变成结算员而非原审核护士。

## 根因与正确做法

- **根因**：`updateFeeAuditFlag` 的 MyBatis SQL 无条件写 `FEE_AUDIT_OPERATOR = #{operator}`，结算链路传入的是当前操作员（结算人）
- **做法**：
  1. SQL 改为 `operator` 非空时才更新 `FEE_AUDIT_OPERATOR`
  2. 结算/冲销/取消费用锁定等链路传 `null` 作 operator
  3. 手工费用审核接口 `InPatientController.updateFeeAuditFlag` 仍传真实 operator，行为不变

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| PAT_IN_HOSPITAL | UPDATE | FEE_AUDIT_FLAG 可随结算锁定变化；FEE_AUDIT_OPERATOR 仅手工审核时更新 |
| PAT_ADMISSION_RECORD | UPDATE | 同上 |
| updateFeeAuditFlag | Service | 收费 + 医保共用 |

## 测试要点

- MCP 造数：找已费用审核（FEE_AUDIT_FLAG=1、FEE_AUDIT_OPERATOR=护士A）的在院病人，记录审核人
- 界面步骤：
  1. 护士 A 完成费用审核，确认两表 `FEE_AUDIT_OPERATOR` 为 A
  2. 收费员 B 做医保预结算/出院结算
  3. 结算后 `FEE_AUDIT_OPERATOR` 仍为 A（不为 B）
  4. 取消医保结算/冲销后，审核人仍不变

## 关联 commit

- `[201737]【漳州市医院】结算时不变更费用审核人`

## 可复用结论

- 同一 SQL 若同时维护「业务标志」与「操作人」，结算类流程应区分：只改标志、不改操作人
- `updateFeeAuditFlag` 在预出院+医保预结算场景用于**费用锁定**，不是重新做费用审核

## 升格建议

- [ ] workflow
- [ ] skill / patterns
- [x] rule
- [ ] 无需升格，保留 case 即可

**说明**：可考虑在 `zoehis-business.mdc` 补充「费用审核人与结算人分离」一句
