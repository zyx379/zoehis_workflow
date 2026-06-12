# 经验案例索引

> 新增 case 后在此追加一行。Agent 新需求前可先检索本表。

| 日期 | 禅道/需求 | 域 | 关键词 | 案例文件 | 已升格 |
|------|-----------|-----|--------|----------|--------|
| 2026-06-05 | 201533 | 收费/住院 | 非医疗收费、默认患者、firstTreeNode、dept-patient-tree | [cases/2026-06-nonMedicalCost-no-default-patient.md](cases/2026-06-nonMedicalCost-no-default-patient.md) | skill |
| 2026-06-06 | 202226 | 收费/读卡 | 选择病人、cis-common、onelinkPatientList、v-else-if、费单标识 | [cases/2026-06-patientList-disease-fee-audit-icons.md](cases/2026-06-patientList-disease-fee-audit-icons.md) | skill |
| 2026-06-06 | 202227 | 住院/医嘱 | 医嘱打印、电子签名、checkNurse、execOperatorName、pagePresPrintMixin | [cases/2026-06-presPrint-nurse-ca-sign.md](cases/2026-06-presPrint-nurse-ca-sign.md) | — |
| 2026-06-06 | 202235 | 住院/手术申请 | 预计手术时间、默认为空、页面参数、getPageControlMap、oper_date_default_empty | [cases/2026-06-operationApply-date-default-empty-pageParam.md](cases/2026-06-operationApply-date-default-empty-pageParam.md) | — |
| 2026-06-06 | 202238 | 收费/退药 | 退药单有效期、APP_RETURN_DRUG_MASTER、return_drug_new_valid_hours、参数单独提交 | [cases/2026-06-return-drug-new-valid-24h.md](cases/2026-06-return-drug-new-valid-24h.md) | skill |
| 2026-06-08 | 201737 | 住院/收费/医保 | 费用审核人、FEE_AUDIT_OPERATOR、结算、updateFeeAuditFlag、预出院 | [cases/2026-06-settle-no-overwrite-fee-audit-operator.md](cases/2026-06-settle-no-overwrite-fee-audit-operator.md) | — |
| 2026-06-08 | 202505 | 药库/摆药 | 配药池、释放库存、release_stock_skip_valid_check、VALID_END_TIME | [cases/2026-06-dispense-pool-release-skip-valid-check.md](cases/2026-06-dispense-pool-release-skip-valid-check.md) | skill |
| 2026-06-10 | 202510 | 收费/自助取药 | selfTakeDrug、取药凭证预览、preview-remark、kiosk | [cases/2026-06-selfTakeDrug-preview-enlarge-remark.md](cases/2026-06-selfTakeDrug-preview-enlarge-remark.md) | — |
| 2026-06-10 | 203042 | 门诊/转诊 | 双向转诊、TRANSFER_REASON、基本字典、转诊原因弹窗 | [cases/2026-06-referral-form-reason-dict-dialog.md](cases/2026-06-referral-form-reason-dict-dialog.md) | — |
| 2026-06-11 | 202240 | 门诊/医嘱/药库 | 特殊病种、白名单、checkDiseaseLimit、national_insur_code_prefix | [cases/2026-06-special-disease-white-list-match.md](cases/2026-06-special-disease-white-list-match.md) | — |
| 2026-06-11 | 203170 | 药库/处方重制 | 煎药确认申请单、CHINESE_COOKING_CONFIRM_APPLY、重制次数、cooking_print_repeat_count、DispenseReset | [cases/2026-06-cooking-confirm-apply-reset-print-count.md](cases/2026-06-cooking-confirm-apply-reset-print-count.md) | — |
| 2026-06-11 | 203177 | 住院/摆药回退 | 无需提药、batchBackResiLayOrBill、docOderQuery、applyInvalidReturn | [cases/2026-06-lay-drug-return-together-no-need-take.md](cases/2026-06-lay-drug-return-together-no-need-take.md) | — |
| 2026-06-11 | 203174 | 住院/病人管理 | 出院病人查询、主管医生、PAT_IN_HOSPITAL、getDischargeHospitalPat | [cases/2026-06-discharge-patient-director-doctor.md](cases/2026-06-discharge-patient-director-doctor.md) | — |
| 2026-06-12 | 203283 | 门诊/预约 | 预约渠道、APPT_WAY、channel_health、卫健委、OutpApptRecord.get | [cases/2026-06-outp-appt-way-health-display.md](cases/2026-06-outp-appt-way-health-display.md) | — |
| 2026-06-12 | 203305 | 门诊/住院/毒麻处方 | 红处方、代办人、findStaffUserByPage、StaffDao、poisonousHempPrescription | [cases/2026-06-red-prescription-agent-staff-select.md](cases/2026-06-red-prescription-agent-staff-select.md) | — |
| 2026-06-11 | 202860 | 住院/手术 | 手术导航、排台、登记、PRES_OPERATION_APPLY_RECORD、状态同步、updateOperationPlatoon | [cases/2026-06-operationApply-status-sync-platoon.md](cases/2026-06-operationApply-status-sync-platoon.md) | — |
| 2026-06-12 | 202857 | 住院/手术申请 | operat_apply_check_catalog_id、知情同意书、多模板类别、getPatEmrListByCatalogId | [cases/2026-06-operationApply-consent-multi-catalog.md](cases/2026-06-operationApply-consent-multi-catalog.md) | — |

---

## 反向索引：按表名

> Agent 定位到表名后，直接查有哪些相关 case。

| 表名 | 相关 case |
|------|-----------|
| `PAT_IN_HOSPITAL` | [201737](cases/2026-06-settle-no-overwrite-fee-audit-operator.md)、[202860](cases/2026-06-operationApply-status-sync-platoon.md)、[203174](cases/2026-06-discharge-patient-director-doctor.md) |
| `PAT_ADMISSION_RECORD` | [201737](cases/2026-06-settle-no-overwrite-fee-audit-operator.md)、[203174](cases/2026-06-discharge-patient-director-doctor.md) |
| `PRES_OPERATION_APPLY_MASTER` | [202860](cases/2026-06-operationApply-status-sync-platoon.md) |
| `PRES_OPERATION_APPLY_RECORD` | [202860](cases/2026-06-operationApply-status-sync-platoon.md) |
| `APP_RETURN_DRUG_MASTER` | [202238](cases/2026-06-return-drug-new-valid-24h.md) |
| `APP_RETURN_DRUG_DETAIL` | [202238](cases/2026-06-return-drug-new-valid-24h.md) |
| `APP_OUTP_LAY_DRUG_POOL` | [202505](cases/2026-06-dispense-pool-release-skip-valid-check.md) |
| `APT_OUTP_APPT_RECORD` | [203283](cases/2026-06-outp-appt-way-health-display.md) |
| `COM_SPECIAL_DISEASE_DRUG_CONFIG` | [202240](cases/2026-06-special-disease-white-list-match.md) |
| `COM_SPECIAL_DISEASE_DRUG_BLACK_CONFIGATION` | [202240](cases/2026-06-special-disease-white-list-match.md) |
| `COM_SPECIAL_DISEASE_DRUG_BLACK_CONFIG` | [202240](cases/2026-06-special-disease-white-list-match.md) |
| `DIC_DRUG_DICT` | [202240](cases/2026-06-special-disease-white-list-match.md) |
| `COM_STAFF_BASIC_INFO` | [203305](cases/2026-06-red-prescription-agent-staff-select.md) |
| `DIC_BASIC_DICT` (TRANSFER_REASON) | [203042](cases/2026-06-referral-form-reason-dict-dialog.md) |
| `ETPL_TEMPLATE_CLASS` | [202857](cases/2026-06-operationApply-consent-multi-catalog.md) |
| `COM_BIZ_SYS_PARAM` | [202238](cases/2026-06-return-drug-new-valid-24h.md)、[202505](cases/2026-06-dispense-pool-release-skip-valid-check.md) |

---

## 反向索引：按页面路由

> Agent 定位到页面路径后，直接查有哪些相关 case。

| 页面路由 / 菜单 | 相关 case |
|-----------------|-----------|
| `/charge/billingFeeManage/nonMedicalCost` | [201533](cases/2026-06-nonMedicalCost-no-default-patient.md) |
| `components/presManage/operationApplication.vue` | [202235](cases/2026-06-operationApply-date-default-empty-pageParam.md)、[202858](cases/2026-06-operationApply-preopDiag-sync.md) |
| `pages/operateManage/operationNavigation.vue` | [202860](cases/2026-06-operationApply-status-sync-platoon.md) |
| `pages/stockBillManage/storeQuery/index.vue` | [202505](cases/2026-06-dispense-pool-release-skip-valid-check.md) |
| `components/presManage/docOderQuery.vue` | [203177](cases/2026-06-lay-drug-return-together-no-need-take.md) |
| `pages/outpatientTreatment/main.vue` | [203283](cases/2026-06-outp-appt-way-health-display.md) |
| `pages/charge/prePayManage/selfTakeDrug.vue` | [202510](cases/2026-06-selfTakeDrug-preview-enlarge-remark.md) |
| `pages/presManage/presPrint` | [202227](cases/2026-06-presPrint-nurse-ca-sign.md) |
| `pages/patientManage/referralRegistration.vue` | [203042](cases/2026-06-referral-form-reason-dict-dialog.md) |
| `pages/charge/patientManage/dischargePatientInfo.vue` | [203174](cases/2026-06-discharge-patient-director-doctor.md) |
| `components/highRiskDrugManage/poisonousHempPrescription.vue` | [203305](cases/2026-06-red-prescription-agent-staff-select.md) |
| `hospatientDispensManage/inpatientDispenseReset` | [203170](cases/2026-06-cooking-confirm-apply-reset-print-count.md) |
| `outpatientDispensManage/outpatientDispenseReset` | [203170](cases/2026-06-cooking-confirm-apply-reset-print-count.md) |
| `components/onelinkReadCard/onelinkPatientList.vue` | [202226](cases/2026-06-patientList-disease-fee-audit-icons.md) |
