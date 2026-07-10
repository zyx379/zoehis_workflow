# 经验案例索引

> 新增 case 后在此追加一行。Agent 新需求前可先检索本表。  
> **`IMA note_id` 列**：已上传 IMA 时填写 note_id；`—` 表示未上传。与 case 元数据 `IMA 已上传：yes` 双重防重复。

| 日期 | 禅道/需求 | 域 | 关键词 | 案例文件 | IMA note_id | 已升格 |
|------|-----------|-----|--------|----------|-------------|--------|
| 2026-06-05 | 201533 | 收费/住院 | 非医疗收费、默认患者、firstTreeNode、dept-patient-tree | [cases/201533-住院非医疗收费不默认患者+nonMedicalCost-dept-patient-tree.md](cases/201533-住院非医疗收费不默认患者+nonMedicalCost-dept-patient-tree.md) | `7476456556872574` | skill |
| 2026-06-06 | 202226 | 收费/读卡 | 选择病人、cis-common、onelinkPatientList、v-else-if、费单标识 | [cases/202226-选择病人弹窗费单标识+onelinkPatientList-cis-common.md](cases/202226-选择病人弹窗费单标识+onelinkPatientList-cis-common.md) | `7476479948512378` | skill |
| 2026-06-06 | 202227 | 住院/医嘱 | 医嘱打印、电子签名、checkNurse、execOperatorName、pagePresPrintMixin | [cases/202227-医嘱打印护士电子签名+presPrint-checkNurse.md](cases/202227-医嘱打印护士电子签名+presPrint-checkNurse.md) | `7476456636566654` | — |
| 2026-06-06 | 202235 | 住院/手术申请 | 预计手术时间、默认为空、页面参数、getPageControlMap、oper_date_default_empty | [cases/202235-手术申请预计手术时间默认为空+oper_date_default_empty-pageParam.md](cases/202235-手术申请预计手术时间默认为空+oper_date_default_empty-pageParam.md) | `7479841641224468` | — |
| 2026-06-06 | 202238 | 收费/退药 | 退药单有效期、APP_RETURN_DRUG_MASTER、return_drug_new_valid_hours、参数单独提交 | [cases/202238-新开退药单24小时有效期+return_drug_new_valid_hours-APP_RETURN.md](cases/202238-新开退药单24小时有效期+return_drug_new_valid_hours-APP_RETURN.md) | `7476480149833411` | skill |
| 2026-06-08 | 201737 | 住院/收费/医保 | 费用审核人、FEE_AUDIT_OPERATOR、结算、updateFeeAuditFlag、预出院 | [cases/201737-结算不变更费用审核人+FEE_AUDIT_OPERATOR-settle.md](cases/201737-结算不变更费用审核人+FEE_AUDIT_OPERATOR-settle.md) | `7476456754009169` | — |
| 2026-06-08 | 202505 | 药库/摆药 | 配药池、释放库存、release_stock_skip_valid_check、VALID_END_TIME | [cases/202505-配药池释放库存跳过有效期+release_stock_skip_valid_check.md](cases/202505-配药池释放库存跳过有效期+release_stock_skip_valid_check.md) | `7476479566829320` | skill |
| 2026-06-10 | 202510 | 收费/自助取药 | selfTakeDrug、取药凭证预览、preview-remark、kiosk | [cases/202510-自助机取药凭证预览放大+selfTakeDrug-preview-remark.md](cases/202510-自助机取药凭证预览放大+selfTakeDrug-preview-remark.md) | `7476456816926625` | — |
| 2026-06-10 | 203042 | 门诊/转诊 | 双向转诊、TRANSFER_REASON、基本字典、转诊原因弹窗 | [cases/203042-双向转诊表单优化+TRANSFER_REASON-referralForm.md](cases/203042-双向转诊表单优化+TRANSFER_REASON-referralForm.md) | `7476480019810922` | — |
| 2026-06-11 | 202240 | 门诊/医嘱/药库 | 特殊病种、白名单、checkDiseaseLimit、national_insur_code_prefix | [cases/202240-特殊病种白名单前缀匹配+checkDiseaseLimit-whiteList.md](cases/202240-特殊病种白名单前缀匹配+checkDiseaseLimit-whiteList.md) | `7476480221137830` | — |
| 2026-06-11 | 203170 | 药库/处方重制 | 煎药确认申请单、CHINESE_COOKING_CONFIRM_APPLY、重制次数、cooking_print_repeat_count、DispenseReset | [cases/203170-煎药确认申请单重制打印次数+DispenseReset-cooking.md](cases/203170-煎药确认申请单重制打印次数+DispenseReset-cooking.md) | `7476479407443423` | — |
| 2026-06-11 | 203177 | 住院/摆药回退 | 无需提药、batchBackResiLayOrBill、docOderQuery、applyInvalidReturn | [cases/203177-摆药回退连带无需提药+docOderQuery-oneSelfDrugFlag.md](cases/203177-摆药回退连带无需提药+docOderQuery-oneSelfDrugFlag.md) | `7476456963721862` | — |
| 2026-06-11 | 203174 | 住院/病人管理 | 出院病人查询、主管医生、PAT_IN_HOSPITAL、getDischargeHospitalPat | [cases/203174-出院病人主管医生+PAT_IN_HOSPITAL-directorDoctor.md](cases/203174-出院病人主管医生+PAT_IN_HOSPITAL-directorDoctor.md) | `7476456988889729` | — |
| 2026-06-12 | 203283 | 门诊/预约 | 预约渠道、APPT_WAY、channel_health、卫健委、OutpApptRecord.get | [cases/203283-门诊诊病预约渠道显示+APPT_WAY-healthDisplay.md](cases/203283-门诊诊病预约渠道显示+APPT_WAY-healthDisplay.md) | `7476479852041413` | — |
| 2026-06-12 | 203305 | 门诊/住院/毒麻处方 | 红处方、代办人、findStaffUserByPage、StaffDao、poisonousHempPrescription | [cases/203305-红处方代办人职工下拉+poisonousHempPrescription-staff.md](cases/203305-红处方代办人职工下拉+poisonousHempPrescription-staff.md) | `7476457043415692` | — |
| 2026-06-11 | 202860 | 住院/手术 | 手术导航、排台、登记、PRES_OPERATION_APPLY_RECORD、状态同步、updateOperationPlatoon | [cases/202860-手术导航排台登记状态同步+PRES_OPERATION_APPLY_RECORD.md](cases/202860-手术导航排台登记状态同步+PRES_OPERATION_APPLY_RECORD.md) | `7476457106331092` | — |
| 2026-06-12 | 202857 | 住院/手术申请 | operat_apply_check_catalog_id、知情同意书、多模板类别、getPatEmrListByCatalogId | [cases/202857-手术申请知情同意书多类别+operat_apply_check_catalog_id.md](cases/202857-手术申请知情同意书多类别+operat_apply_check_catalog_id.md) | `7476457135690571` | — |
| 2026-06-22 | 203656 | 住院/医嘱 | applyNum、停嘱时间、getInHospitalPatientTree、PatInHostipalDao、databaseId dm Oracle | [cases/203656-医嘱申请条数停嘱过滤+docOderQuery-applyNum.md](cases/203656-医嘱申请条数停嘱过滤+docOderQuery-applyNum.md) | `7476457169245284` | — |
| 2026-06-22 | 204009 | 收费/病人信息 | contactPhone、patientInfoForm、phoneEightLimit、checkPhoneFormat、blur校验 | [cases/204009-联系人电话位数校验+contactPhone-patientInfoForm.md](cases/204009-联系人电话位数校验+contactPhone-patientInfoForm.md) | `7476457194412198` | — |
| 2026-06-22 | 204010 | 收费/病人注册 | patientSex、-1、auto_set_gender_from_id_card、getDefaultDict、SEX字典 | [cases/204010-病人注册性别代码负一+patientSex-autoSetGender.md](cases/204010-病人注册性别代码负一+patientSex-autoSetGender.md) | `7476457223768131` | — |
| 2026-06-24 | 202235 | 住院/手术申请/临床路径 | operationDate、NPE、send、operationClassSelect、operateApplication、oper_date_default_empty | [cases/202235-手术申请空日期NPE闭环+operationDate-send-NPE.md](cases/202235-手术申请空日期NPE闭环+operationDate-send-NPE.md) | `7476457278295940` | business-rules |
| 2026-06-24 / 2026-06-30 | 204008 | 住院/手术导航 | drug_time_default_empty、applyDrugTimeDefaultEmpty、getMainData、beforeOperateDrugTime、operateDrugTime、operationNavigation、530101 | [cases/204008-手术导航用药时间默认为空+drug_time_default_empty-pageParam.md](cases/204008-手术导航用药时间默认为空+drug_time_default_empty-pageParam.md) | `7476457316043730` | — |
| 2026-06-24 | 204013 | 住院/手术导航 | operateEndTime、completeType、checkComplete、operationNavigation、登记必填 | [cases/204013-手术导航结束时间默认空+operateEndTime-checkComplete.md](cases/204013-手术导航结束时间默认空+operateEndTime-checkComplete.md) | `7476457341212926` | — |
| 2026-06-24 | 204943 | 药库/出入库 | memo、出库发送、入库单、DrugStoreServiceImpl、DRU_DRUG_IO_MASTER | [cases/204943-出库备注传递入库+DRU_DRUG_IO_MASTER-memo.md](cases/204943-出库备注传递入库+DRU_DRUG_IO_MASTER-memo.md) | `7476457374766303` | — |
| 2026-06-25 | 204961 | 住院/手术申请 | 嘱托医嘱、shou_shen_zhu_tuo_pres_only_main、主手术名称、OperationApplyServiceImpl | [cases/204961-手术嘱托医嘱仅主手术名+shou_shen_zhu_tuo_pres_only_main.md](cases/204961-手术嘱托医嘱仅主手术名+shou_shen_zhu_tuo_pres_only_main.md) | `7476457395739676` | business-rules |
| 2026-06-25 | 205099 | 门诊/住院/转诊 | 双向转诊、主管医生、findStaffUserByPage、referralRegistration、clinicDoctorCode | [cases/205099-双向转诊主管医生下拉+referralRegistration-clinicDoctor.md](cases/205099-双向转诊主管医生下拉+referralRegistration-clinicDoctor.md) | `7476457454457298` | — |
| 2026-06-26 | 205369 | 住院/手术申请 | 扩展字段、operation_apply_extra_fields_flag、酶免结果、PRES_OPERATION_APPLY_DETAIL、v_lis_operation_result | [cases/205369-手术申请扩展字段+EAV-PRES_OPERATION_APPLY_DETAIL.md](cases/205369-手术申请扩展字段+EAV-PRES_OPERATION_APPLY_DETAIL.md) | `7476479759766534` | — |
| 2026-06-10 | 202858 | 住院/手术申请 | 术前诊断、方位、preopDiags、operationApplication、父子组件同步 | [cases/202858-手术申请术前诊断方位同步+preopDiags-operationApplication.md](cases/202858-手术申请术前诊断方位同步+preopDiags-operationApplication.md) | `7476457454457298` | — |
| 2026-06-15 ~ 2026-06-30 | ****** | 医保/追溯码 | traceCodeUsageQuery、getTraceCodeUsageRecordList、有效标志、使用状态TYPE、调拨5/6、TYPE6防重复、zoehis-table布局、release-1.166 cherry-pick | [cases/追溯码使用记录查询+traceCodeUsageQuery-医保追溯.md](cases/追溯码使用记录查询+traceCodeUsageQuery-医保追溯.md) | — | — |
| 2026-06-25 | 205101 | 药库/库存预警 | theWarn、distributableQuantity、可用库存、dru_the_warn_use_distributable_stock、earlyWarning | [cases/205101-库存预警可分配库存口径+distributableQuantity-theWarn.md](cases/205101-库存预警可分配库存口径+distributableQuantity-theWarn.md) | — | — |
| 2026-07-02 | 205365 | 门诊/医保/单据扣费 | 特殊病种、诊疗、单据扣费、support_disease_limit_clinic_flag、COM_SPECIAL_DISEASE_CLINIC_CONFIG | [cases/205365-单据扣费特殊病种诊疗校验+support_disease_limit_clinic_flag.md](cases/205365-单据扣费特殊病种诊疗校验+support_disease_limit_clinic_flag.md) | — | — |
| 2026-07-02 | 205102 | 药库/出入库 | 出入库、收货方、发货方、JUDGE_IO_FLAG、DRU_DRUG_IO_CLASS、配置解决 | [cases/205102-出入库限制本库房+JUDGE_IO_FLAG-DRU_DRUG_IO_CLASS.md](cases/205102-出入库限制本库房+JUDGE_IO_FLAG-DRU_DRUG_IO_CLASS.md) | — | — |
| 2026-07-03 | 206301 | 收费/住院登记 | 主管医生、医疗组、hospitalizationForm、getParentGroupCodeListDataAjax、staffByClinicGroupFlag | [cases/206301-入院登记主管医生同步医疗组+hospitalizationForm-clinicGroup.md](cases/206301-入院登记主管医生同步医疗组+hospitalizationForm-clinicGroup.md) | — | — |
| 2026-07-02 | 204348 | 药库/字典 | 院内药品编码、internalDrugCode、select_internal_drug_code_flag、DIC_DRUG_DICT_EXTEND、getDrugInfoByTreeNode | [cases/204348-药品字典院内编码显示+internalDrugCode-DIC_DRUG_DICT_EXTEND.md](cases/204348-药品字典院内编码显示+internalDrugCode-DIC_DRUG_DICT_EXTEND.md) | — | — |
| 2026-07-04 | 194551/core | Git/CI | release-1.166、编译失败、cherry-pick、194551 Long、SettleRateTypeCheckParam、分支回退、release-1.166.156 | [cases/194551-release166编译失败分支回退+SettleRateTypeCheckParam-cherry-pick.md](cases/194551-release166编译失败分支回退+SettleRateTypeCheckParam-cherry-pick.md) | — | — |
| 2026-07-06 | 202606 | 医保/收费/六号文 | sin_dos_dscr、used_frqu_dscr、中药、一剂、1日1剂分N次、chnFlag、charge/insurance双端对齐 | [cases/202606-六号文中药上传字段+sinDosDscr-usedFrquDscr.md](cases/202606-六号文中药上传字段+sinDosDscr-usedFrquDscr.md) | — | — |
| 2026-07-06 | 206668 | 住院/手术申请/导航 | guideDoctor、expertPersonnel、watchOtherPersonnel、EAV、PRES_OPERATION_APPLY_DETAIL、页面参数130201、operateApplication、手术记录同步 | [cases/206668-手术申请导航字段前置+guideDoctor-operationApplication.md](cases/206668-手术申请导航字段前置+guideDoctor-operationApplication.md) | — | — |
| 2026-07-09 | 206291 | 门诊/医保/医嘱开单 | 特殊病种、OUTP_INP_CODE、getOutpPatDiseaseRegister、PatientDiseaseRegisterDao、getDefaultDisease | [cases/206291-门诊特殊病种过滤住院类型+getOutpPatDiseaseRegister-DIC_INSUR_SPECIAL_DISEASE.md](cases/206291-门诊特殊病种过滤住院类型+getOutpPatDiseaseRegister-DIC_INSUR_SPECIAL_DISEASE.md) | — | — |

---

## 反向索引：按表名

> Agent 定位到表名后，直接查有哪些相关 case。

| 表名 | 相关 case |
|------|-----------|
| `PAT_IN_HOSPITAL` | [201737](cases/201737-结算不变更费用审核人+FEE_AUDIT_OPERATOR-settle.md)、[202860](cases/202860-手术导航排台登记状态同步+PRES_OPERATION_APPLY_RECORD.md)、[203174](cases/203174-出院病人主管医生+PAT_IN_HOSPITAL-directorDoctor.md) |
| `PAT_ADMISSION_RECORD` | [201737](cases/201737-结算不变更费用审核人+FEE_AUDIT_OPERATOR-settle.md)、[203174](cases/203174-出院病人主管医生+PAT_IN_HOSPITAL-directorDoctor.md) |
| `PRES_OPERATION_APPLY_MASTER` | [202860](cases/202860-手术导航排台登记状态同步+PRES_OPERATION_APPLY_RECORD.md)、[205369](cases/205369-手术申请扩展字段+EAV-PRES_OPERATION_APPLY_DETAIL.md)、[206668](cases/206668-手术申请导航字段前置+guideDoctor-operationApplication.md) |
| `PRES_OPERATION_APPLY_DETAIL` | [205369](cases/205369-手术申请扩展字段+EAV-PRES_OPERATION_APPLY_DETAIL.md)、[206668](cases/206668-手术申请导航字段前置+guideDoctor-operationApplication.md) |
| `PRES_OPERATION_APPLY_RECORD` | [202860](cases/202860-手术导航排台登记状态同步+PRES_OPERATION_APPLY_RECORD.md) |
| `PRES_OPERATION_RECORD` | [202860](cases/202860-手术导航排台登记状态同步+PRES_OPERATION_APPLY_RECORD.md)、[204008](cases/204008-手术导航用药时间默认为空+drug_time_default_empty-pageParam.md)、[206668](cases/206668-手术申请导航字段前置+guideDoctor-operationApplication.md) |
| `APP_RETURN_DRUG_MASTER` | [202238](cases/202238-新开退药单24小时有效期+return_drug_new_valid_hours-APP_RETURN.md) |
| `APP_RETURN_DRUG_DETAIL` | [202238](cases/202238-新开退药单24小时有效期+return_drug_new_valid_hours-APP_RETURN.md) |
| `APP_OUTP_LAY_DRUG_POOL` | [202505](cases/202505-配药池释放库存跳过有效期+release_stock_skip_valid_check.md) |
| `APT_OUTP_APPT_RECORD` | [203283](cases/203283-门诊诊病预约渠道显示+APPT_WAY-healthDisplay.md) |
| `COM_SPECIAL_DISEASE_DRUG_CONFIG` | [202240](cases/202240-特殊病种白名单前缀匹配+checkDiseaseLimit-whiteList.md) |
| `COM_SPECIAL_DISEASE_DRUG_BLACK_CONFIGATION` | [202240](cases/202240-特殊病种白名单前缀匹配+checkDiseaseLimit-whiteList.md) |
| `COM_SPECIAL_DISEASE_DRUG_BLACK_CONFIG` | [202240](cases/202240-特殊病种白名单前缀匹配+checkDiseaseLimit-whiteList.md) |
| `DIC_DRUG_DICT` | [202240](cases/202240-特殊病种白名单前缀匹配+checkDiseaseLimit-whiteList.md)、[204348 院内药品编码](cases/204348-药品字典院内编码显示+internalDrugCode-DIC_DRUG_DICT_EXTEND.md) |
| `DIC_DRUG_DICT_EXTEND` | [204348 院内药品编码](cases/204348-药品字典院内编码显示+internalDrugCode-DIC_DRUG_DICT_EXTEND.md) |
| `COM_STAFF_BASIC_INFO` | [203305](cases/203305-红处方代办人职工下拉+poisonousHempPrescription-staff.md) |
| `DIC_BASIC_DICT` (TRANSFER_REASON) | [203042](cases/203042-双向转诊表单优化+TRANSFER_REASON-referralForm.md) |
| `ETPL_TEMPLATE_CLASS` | [202857](cases/202857-手术申请知情同意书多类别+operat_apply_check_catalog_id.md) |
| `COM_BIZ_SYS_PARAM` | [202238](cases/202238-新开退药单24小时有效期+return_drug_new_valid_hours-APP_RETURN.md)、[202505](cases/202505-配药池释放库存跳过有效期+release_stock_skip_valid_check.md)、[204961](cases/204961-手术嘱托医嘱仅主手术名+shou_shen_zhu_tuo_pres_only_main.md) |
| `PRES_APPLY_RECORDS_POOL` | [203656](cases/203656-医嘱申请条数停嘱过滤+docOderQuery-applyNum.md) |
| `PRES_INP_PRES_RECORD` | [203656](cases/203656-医嘱申请条数停嘱过滤+docOderQuery-applyNum.md)、[204961](cases/204961-手术嘱托医嘱仅主手术名+shou_shen_zhu_tuo_pres_only_main.md) |
| `DRU_DRUG_IO_MASTER` | [204943](cases/204943-出库备注传递入库+DRU_DRUG_IO_MASTER-memo.md) |
| `DRU_DRUG_IO_CLASS` | [205102](cases/205102-出入库限制本库房+JUDGE_IO_FLAG-DRU_DRUG_IO_CLASS.md) |
| `COM_SPECIAL_DISEASE_CLINIC_CONFIG` | [205365](cases/205365-单据扣费特殊病种诊疗校验+support_disease_limit_clinic_flag.md) |
| `DRU_DRUG_DIST_STORE` | [205101](cases/205101-库存预警可分配库存口径+distributableQuantity-theWarn.md) |
| `Dru_Drug_Store` | [205101](cases/205101-库存预警可分配库存口径+distributableQuantity-theWarn.md) |
| `DRU_DRUG_BARCODE_USED_RECORD` | [追溯码使用记录查询](cases/追溯码使用记录查询+traceCodeUsageQuery-医保追溯.md) |
| `DIC_DEPT_DICT` | [追溯码使用记录查询](cases/追溯码使用记录查询+traceCodeUsageQuery-医保追溯.md) |
| `DIC_PRES_FREQ_DICT` | [202606 六号文中药上传字段](cases/202606-六号文中药上传字段+sinDosDscr-usedFrquDscr.md) |

---

## 反向索引：按页面路由

> Agent 定位到页面路径后，直接查有哪些相关 case。

| 页面路由 / 菜单 | 相关 case |
|-----------------|-----------|
| `/charge/billingFeeManage/nonMedicalCost` | [201533](cases/201533-住院非医疗收费不默认患者+nonMedicalCost-dept-patient-tree.md) |
| `components/presManage/operationApplication.vue` | [202235](cases/202235-手术申请预计手术时间默认为空+oper_date_default_empty-pageParam.md)、[202235 闭环](cases/202235-手术申请空日期NPE闭环+operationDate-send-NPE.md)、[202858](cases/202858-手术申请术前诊断方位同步+preopDiags-operationApplication.md)、[204961](cases/204961-手术嘱托医嘱仅主手术名+shou_shen_zhu_tuo_pres_only_main.md)、[205369](cases/205369-手术申请扩展字段+EAV-PRES_OPERATION_APPLY_DETAIL.md)、[206668](cases/206668-手术申请导航字段前置+guideDoctor-operationApplication.md) |
| `components/operateManage/operateApplication.vue` | [202235 闭环](cases/202235-手术申请空日期NPE闭环+operationDate-send-NPE.md)、[205369](cases/205369-手术申请扩展字段+EAV-PRES_OPERATION_APPLY_DETAIL.md)、[206668](cases/206668-手术申请导航字段前置+guideDoctor-operationApplication.md) |
| `pages/operateManage/operationNavigation.vue` | [202860](cases/202860-手术导航排台登记状态同步+PRES_OPERATION_APPLY_RECORD.md)、[204008](cases/204008-手术导航用药时间默认为空+drug_time_default_empty-pageParam.md) |
| `pages/stockBillManage/storeQuery/index.vue` | [202505](cases/202505-配药池释放库存跳过有效期+release_stock_skip_valid_check.md)、[204348 院内药品编码参考](cases/204348-药品字典院内编码显示+internalDrugCode-DIC_DRUG_DICT_EXTEND.md) |
| `pages/drugDictionaryManage/medicineMaintain.vue` | [204348 院内药品编码](cases/204348-药品字典院内编码显示+internalDrugCode-DIC_DRUG_DICT_EXTEND.md) |
| `pages/stockBillManage/earlyWarning.vue` | [205101](cases/205101-库存预警可分配库存口径+distributableQuantity-theWarn.md) |
| `components/presManage/docOderQuery.vue` | [203177](cases/203177-摆药回退连带无需提药+docOderQuery-oneSelfDrugFlag.md)、[203656](cases/203656-医嘱申请条数停嘱过滤+docOderQuery-applyNum.md) |
| `components/common/deptPatientTreeNew.vue` | [203656](cases/203656-医嘱申请条数停嘱过滤+docOderQuery-applyNum.md) |
| `pages/outpatientTreatment/main.vue` | [203283](cases/203283-门诊诊病预约渠道显示+APPT_WAY-healthDisplay.md) |
| `pages/charge/prePayManage/selfTakeDrug.vue` | [202510](cases/202510-自助机取药凭证预览放大+selfTakeDrug-preview-remark.md) |
| `pages/presManage/presPrint` | [202227](cases/202227-医嘱打印护士电子签名+presPrint-checkNurse.md) |
| `pages/patientManage/referralRegistration.vue` | [203042](cases/203042-双向转诊表单优化+TRANSFER_REASON-referralForm.md) |
| `pages/charge/patientManage/dischargePatientInfo.vue` | [203174](cases/203174-出院病人主管医生+PAT_IN_HOSPITAL-directorDoctor.md) |
| `components/highRiskDrugManage/poisonousHempPrescription.vue` | [203305](cases/203305-红处方代办人职工下拉+poisonousHempPrescription-staff.md) |
| `hospatientDispensManage/inpatientDispenseReset` | [203170](cases/203170-煎药确认申请单重制打印次数+DispenseReset-cooking.md) |
| `outpatientDispensManage/outpatientDispenseReset` | [203170](cases/203170-煎药确认申请单重制打印次数+DispenseReset-cooking.md) |
| `components/onelinkReadCard/onelinkPatientList.vue` | [202226](cases/202226-选择病人弹窗费单标识+onelinkPatientList-cis-common.md) |
| `components/patient/registerFile/patientInfoForm.vue` | [204009](cases/204009-联系人电话位数校验+contactPhone-patientInfoForm.md) |
| `pages/patient/patientInfoManage/patientInfoUpdate.vue` | [204009](cases/204009-联系人电话位数校验+contactPhone-patientInfoForm.md) |
| `pages/insurance/healthMaintainManage/traceCodeUsageQuery.vue` | [追溯码使用记录查询](cases/追溯码使用记录查询+traceCodeUsageQuery-医保追溯.md) |
| `pages/charge/billingFeeManage_version2/documentDeductionV2.vue` / `comm/outpBillFeeMainTable.vue` | [205365](cases/205365-单据扣费特殊病种诊疗校验+support_disease_limit_clinic_flag.md) |
| `components/stockInOutManage/inStoreNew.vue` / `outStoreNew.vue` / `inStoreQuery.vue` / `outStoreQuery.vue` | [205102](cases/205102-出入库限制本库房+JUDGE_IO_FLAG-DRU_DRUG_IO_CLASS.md) |
