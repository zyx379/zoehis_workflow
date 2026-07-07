# 业务规则速查表

> 从长期 cases 中抽取的高频业务规则，供 Agent Step 1/4/7 快速查阅。  
> 每条规则附相关 case 链接，细节以 case 正文为准。

## 更新机制

- **自动更新**（Step 12）：每次需求交付后，Agent 判断是否更新本文件（见 [workflow.md §Step 12](../workflow.md)）
  - 新业务规则 → 新增一行到对应分类
  - 既有规则新场景 → 追加 case 链接
  - 纯 UI/样式/文案改动 → 不更新
- **定期优化**（双周/月度）：检查重复/冲突条目、合并相似规则、删除已失效规则
- **升格后**：规则已升格到 rule/skill 时，在速查表中标注「详见 xxx」

## 检索优先级

Agent Step 4 需求分析时按以下顺序检索：

1. **本文件** → 确认业务约束（「能不能这么做」「有什么限制」）
2. **index.md 反向索引** → 按表名/页面路由找到相关 case
3. **具体 case 文件** → 获取实现细节和踩坑记录

---

## 参数体系

| 规则 | 说明 | 相关 case |
|------|------|-----------|
| **系统参数 vs 页面参数** | 全局配置/跨页面共享 → `$getSysParamList`；单页面开关/默认值 → `$getPageControlMap(configId)` | [202235](cases/202235-手术申请预计手术时间默认为空+oper_date_default_empty-pageParam.md) |
| **有效期类需求模式** | 系统参数（0=关闭）+ SQL 过滤 + 执行入口二次校验 | [202238](cases/202238-新开退药单24小时有效期+return_drug_new_valid_hours-APP_RETURN.md)、[202505](cases/202505-配药池释放库存跳过有效期+release_stock_skip_valid_check.md) |
| **系统参数 jsonl 提交** | 参数种子与功能代码分 commit；标题 `[*111111*]增加系统参数【英文名】【禅道号】` | [202238](cases/202238-新开退药单24小时有效期+return_drug_new_valid_hours-APP_RETURN.md) |
| **页面参数新增模式** | data 声明 → getPageControlMap 回调赋值 → **所有写入点**三元条件（新开、类别变更等）；key 用 snake_case | [202235](cases/202235-手术申请预计手术时间默认为空+oper_date_default_empty-pageParam.md)、[202235 闭环](cases/202235-手术申请空日期NPE闭环+operationDate-send-NPE.md) |

---

## 费用与结算

| 规则 | 说明 | 相关 case |
|------|------|-----------|
| **费用审核人与结算人分离** | 结算类流程只改 `FEE_AUDIT_FLAG`（锁定标志），不改 `FEE_AUDIT_OPERATOR`（审核人） | [201737](cases/201737-结算不变更费用审核人+FEE_AUDIT_OPERATOR-settle.md) |
| **updateFeeAuditFlag 用途** | 预出院+医保预结算场景用于**费用锁定**，不是重新做费用审核 | [201737](cases/201737-结算不变更费用审核人+FEE_AUDIT_OPERATOR-settle.md) |

---

## 池表与库存

| 规则 | 说明 | 相关 case |
|------|------|-----------|
| **配药池释放库存** | 参数 `release_stock_skip_valid_check=1` 时跳过 `VALID_END_TIME` 校验，仍保留状态过滤 | [202505](cases/202505-配药池释放库存跳过有效期+release_stock_skip_valid_check.md) |
| **摆药单回退连带** | 回退时一并回退同 presNo、同 applyTime、`oneSelfDrugFlag==2`（无需提药）的行 | [203177](cases/203177-摆药回退连带无需提药+docOderQuery-oneSelfDrugFlag.md) |
| **库存预警口径** | 参数 `dru_the_warn_use_distributable_stock=1` 时预警判断与耗量比用 `DRU_DRUG_DIST_STORE.distributable_quantity`；`0`/空为 `Dru_Drug_Store.quantity` 账面库存 | [205101](cases/205101-库存预警可分配库存口径+distributableQuantity-theWarn.md) |

---

## 手术与医嘱

| 规则 | 说明 | 相关 case |
|------|------|-----------|
| **手术申请 MASTER+RECORD 双表同步** | 发送/撤销/排台/登记等所有状态变更，须同时更新主表和记录表 | [202860](cases/202860-手术导航排台登记状态同步+PRES_OPERATION_APPLY_RECORD.md) |
| **手术状态码** | 5=送手术室，6=已排台，7=已完成（`OperateEelecApplyStatusEnum`） | [202860](cases/202860-手术导航排台登记状态同步+PRES_OPERATION_APPLY_RECORD.md) |
| **手术申请单参数体系** | 手术申请相关开关统一走页面参数 `$getPageControlMap(configId='130201')` | [202235](cases/202235-手术申请预计手术时间默认为空+oper_date_default_empty-pageParam.md) |
| **手术申请空日期全链路** | 页面参数允许 `operationDate` 为空时：父新开 + 子 `operationClassSelect` + 后端 `send`/嘱托医嘱均须 null 防护 | [202235 闭环](cases/202235-手术申请空日期NPE闭环+operationDate-send-NPE.md) |
| **手术申请嘱托医嘱命名** | 名称模板 `shou_shen_zhu_tuo_pres_name`（`{3}`=主手术名）；是否拼接附加手术由 `shou_shen_zhu_tuo_pres_only_main` 控制（`1`=仅主手术，默认 `0`）；住院 `createOperateEntrustPres` | [204961](cases/204961-手术嘱托医嘱仅主手术名+shou_shen_zhu_tuo_pres_only_main.md) |
| **父子组件 formData 同步** | 子组件独立修改的字段（如 API 回填），父组件保存时需手动从 `ref` 取最新值 | [202858](cases/202858-手术申请术前诊断方位同步+preopDiags-operationApplication.md) |

---

## 患者与读卡

| 规则 | 说明 | 相关 case |
|------|------|-----------|
| **不要默认患者** | `dept-patient-tree` 的 `:firstTreeNode` 改为 `false` | [201533](cases/201533-住院非医疗收费不默认患者+nonMedicalCost-dept-patient-tree.md) |
| **出院病人主管医生** | 优先取 `PAT_IN_HOSPITAL.director_doctor_code`，fallback 到 `PAT_ADMISSION_RECORD` | [203174](cases/203174-出院病人主管医生+PAT_IN_HOSPITAL-directorDoctor.md) |
| **读卡组件 import 链** | 改读卡/选择病人前，先 grep 页面 import 的是 `cis-common` 还是 `all-common-business` | [202226](cases/202226-选择病人弹窗费单标识+onelinkPatientList-cis-common.md) |
| **预约渠道补查** | 读卡条 `patientData` 无 `apptWay` 时，用 `OutpApptRecord.get({ eventNo })` 补查 | [203283](cases/203283-门诊诊病预约渠道显示+APPT_WAY-healthDisplay.md) |

---

## 处方与药品

| 规则 | 说明 | 相关 case |
|------|------|-----------|
| **退药单有效期** | 新开退药单有效期由 `return_drug_new_valid_hours` 控制（默认 24h），参数 0 关闭 | [202238](cases/202238-新开退药单24小时有效期+return_drug_new_valid_hours-APP_RETURN.md) |
| **特殊病种开方** | 分发表 + 白名单前缀（实时 SQL）均允许开方，不必依赖一键分发同步 | [202240](cases/202240-特殊病种白名单前缀匹配+checkDiseaseLimit-whiteList.md) |
| **红处方代办人** | cis-common `poisonousHempPrescription.vue` 通过 `outpInpCode` 区分门诊/住院，改一处即可 | [203305](cases/203305-红处方代办人职工下拉+poisonousHempPrescription-staff.md) |
| **医嘱打印签章** | `value` + `id`(staffNo) + `signatureImage` 三件套；长期医嘱护士优先 `checkNurseCode` | [202227](cases/202227-医嘱打印护士电子签名+presPrint-checkNurse.md) |

---

## 仓库与代码定位

| 规则 | 说明 | 相关 case |
|------|------|-----------|
| **同一 businessId 可能多入口** | 须用菜单路由区分，不能单靠 businessId grep | [203170](cases/203170-煎药确认申请单重制打印次数+DispenseReset-cooking.md) |
| **「重制」类需求** | 优先查 `*DispenseReset.vue`（药库 `hospatientDispensManage` / `outpatientDispensManage`） | [203170](cases/203170-煎药确认申请单重制打印次数+DispenseReset-cooking.md) |
| **住院手术申请仓库** | `onelink-web-pres-fj-common`（处方前端），非 `onelink-web-outp-fj-common`（门诊前端） | [202235](cases/202235-手术申请预计手术时间默认为空+oper_date_default_empty-pageParam.md) |
| **手术导航业务位置** | 在 **charge-service**（`OperationRecordServiceImpl`），不在 pres-service | [202860](cases/202860-手术导航排台登记状态同步+PRES_OPERATION_APPLY_RECORD.md) |
| **员工下拉自动带出** | 先确认 `findStaffUserByPage` 返回字段；不足则扩 `StaffDao.xml`，勿假设 API 已有 | [203305](cases/203305-红处方代办人职工下拉+poisonousHempPrescription-staff.md) |

---

## 发布与 Git

| 规则 | 说明 | 相关 case |
|------|------|-----------|
| **release 合并策略** | 全量 merge 易冲突时，优先 **cherry-pick** 单 commit | 多个 case |
| **cis-common 发布** | 无 release 分支与 tag，仅 push master | workflow §10.1 |
| **误打 tag 处理** | 用下一序号 tag 指向含修复的 commit，以新 tag 发布 | [201533](cases/201533-住院非医疗收费不默认患者+nonMedicalCost-dept-patient-tree.md) |
