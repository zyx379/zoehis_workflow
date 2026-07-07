# 205368 短期记忆 — 需求分析 / spec

> **短期记忆**：需求进行中临时文件；Step 12 沉淀长期 case 后 **删除本文件**。  
> 日期：2026-07-02  
> 状态：`implemented`（前端仅药品字典+开单界面，待 Step 9 人工审查）

---

## 需求摘要

- **任务类型**：功能修改（纯 UI 文本替换）
- **禅道 / 项目**：205368 / 漳州二院
- **页面 / 菜单**：
  1. 医嘱开单弹窗（西药/中成药药品选择）
  2. 药品字典维护页面（药品信息录入、审核、栏目维护）
  3. 药库/门诊发药查询等使用药品标识的公共组件
- **核心诉求**：
  1. 药品字典开单里面药品标识涉及“高危”的需要改成“高警示”。
  2. 药品字典里面“高危药品”改成“高警示药品”。

---

## 代码地图（Step 4 产出）

### 代码地图表

| 仓库 | 路径 | 角色（页面/API/Service/SQL） | 置信度 |
|------|------|------------------------------|--------|
| onelink-web-pres-fj-common | components/presManage/drug.vue | 医嘱西药/中成药开单弹窗：药品标签“高危”、系统参数注释、方法注释 | 高 |
| onelink-web-pres-fj-common | components/presManage/westernPrescribe.vue | 医嘱开立逻辑：注释“查询高危药品”“前置高危药品警示” | 高 |
| onelink-web-pres-fj-common | components/presManage/westernPrescribeNew.vue | 医嘱开立逻辑（新版）：注释同 westernPrescribe.vue | 高 |
| onelink-web-pres-fj-common | pages/presManage/emergencyDocOderQuery.vue | 急诊医嘱查询：参数注释“高危药品提示方式/提示” | 高 |
| onelink-web-pres-fj-common | layouts/menuFrame/ordinary.vue | 住院护士站菜单配置：“高危药品管理”菜单名 | 高 |
| onelink-web-pres-fj-common | api/webapi-service/dict/drug/DrugDict.js | 药品字典 API 注释“根据药品编码获取对应的名称及其高危药品等级” | 高 |
| onelink-web-outp-fj-common | components/outpatientTreatment/pres/newItemSelect.vue | 门诊处方药品选择弹窗：标签“高危”、参数/方法注释 | 高 |
| onelink-web-outp-fj-common | components/outpatientTreatment/pres/drug.vue | 门诊药品标签展示：`<zoehis-tag>高危</zoehis-tag>` | 高 |
| onelink-web-outp-fj-common | components/outpatientTreatment/presModule.vue | 门诊处方模块：注释“查询高危药品”“前置高危药品警示” | 高 |
| onelink-web-outp-fj-common | api/webapi-service/dict/drug/DrugDict.js | 门诊药品字典 API 注释 | 高 |
| onelink-web-his-drug-fj-common | pages/drugDictionaryManage/drugInformation.vue | 药品字典信息维护（旧版）：复选框标签“高危药品”、字段注释 | 高 |
| onelink-web-his-drug-fj-common | pages/drugDictionaryManage/drugInformationNew.vue | 药品字典信息维护（新版）：复选框标签“高危药品”、字段注释、动态字段 dataItemName | 高 |
| onelink-web-his-drug-fj-common | pages/drugDictionaryManage/medicineMaintainNew.vue | 药品字典栏目维护：动态字段 dataItemName“高危药品” | 高 |
| onelink-web-his-drug-fj-common | pages/drugDictionaryManage/drugDictAudit.vue | 药品字典审核：列表表头 dataItemName“高危药品” | 高 |
| onelink-web-his-drug-fj-common | pages/outpatientDispensManage/outpPresQuery.vue | 门诊发药查询：查询条件下拉“高危药品” | 高 |
| onelink-web-his-drug-fj-common | pages/stockBillManage/earlyWarning.vue | 库存预警：列表表头“高危标识” | 高 |
| onelink-web-his-drug-fj-common | components/outpatientTreatment/drug.vue | 药库门诊治疗药品标签：`<zoehis-tag>高危</zoehis-tag>` | 高 |
| onelink-web-cis-common | components/projectCom/drug.vue | CIS 公共药品组件：标签“高危”/ title“高警示药标志” | 高 |
| onelink-web-cis-common | components/antibacterialManage/antibactDrugUseDialog.vue / antibactDrugUseDialogNew.vue | 抗菌药物使用 dialog：注释“高危药品提示方式” | 高 |
| onelink-web-cis-common | mixin/common/cdss/zoeCdss.js / aiCdss.js | CDSS 拦截类型数组值“高危药品” | 高 |
| onelink-web-cis-common | components/outp/cdss/cdssControl.vue | 门诊 CDSS：拦截类型数组值“高危药品” | 高 |
| onelink-micro-optimus-fj-common | web/dict/drug/HighRiskDrugClassController.java | 高危药品分类 Controller：类/方法注释 | 中 |
| onelink-micro-optimus-fj-common | service/dict/drug/HighRiskDrugClassService.java | 高危药品分类 Service：方法注释 | 中 |
| onelink-micro-optimus-fj-common | entity/dict/drug/HighRiskDrugClass.java | 高危药品分类实体：字段/类注释 | 中 |
| onelink-micro-optimus-fj-common | dao/dict/drug/HighRiskDrugClassDao.java | 高危药品分类 Dao：接口注释 | 中 |
| onelink-micro-optimus-fj-common | resources/mappings/service/dict/drug/HighRiskDrugClassDao.xml | 高危药品分类 SQL：XML 注释 | 中 |
| onelink-micro-optimus-fj-common | web/dict/drug/DrugDictController.java | 药品字典 Controller：Swagger 字段注释“高危药标志” | 中 |
| onelink-micro-optimus-fj-common | service/dict/drug/DrugDictService.java | 药品字典 Service：业务注释 | 中 |
| onelink-micro-optimus-fj-common | entity/dict/drug/DrugDict.java | 药品字典实体：字段注释“高危药标志/高危药品分类/等级” | 中 |
| onelink-micro-optimus-fj-common | resources/mappings/service/dict/drug/DrugDictDao.xml | 药品字典 SQL：注释 | 中 |
| onelink-micro-pres-fj-common | model/vo/DrugDictVO.java | 医嘱药品字典 VO：字段注释 | 中 |
| onelink-micro-pres-fj-common | dict/entity/prescribe/PrescribeRecord.java | 医嘱记录实体：字段注释 | 中 |
| onelink-micro-pres-fj-common | dict/entity/comm/PresFuncProfilesEnum.java | 功能枚举：注释 | 中 |
| onelink-micro-pres-fj-common | service/enums/PresBizSysParamEnum.java | 业务系统参数枚举：注释 | 中 |
| onelink-micro-pres-fj-common | service/checkout/impl/PhysicCheckoutServiceImpl.java / MainCheckoutServiceImpl.java | 医嘱校验实现：注释/提示 | 中 |
| onelink-micro-charge-fj-common | model/vo/DrugDictVO.java | 收费药品字典 VO：字段注释 | 中 |
| onelink-micro-charge-fj-common | dict/comm/dict/DrugToxicPropertyDictEnum.java | 毒理属性枚举：注释 | 中 |
| onelink-micro-charge-fj-common | dict/web/drug/DrugStoreController.java | 药库 Controller：注释 | 中 |
| onelink-micro-charge-fj-common | dict/service/prescribe/impl/RegisterManagerServiceImpl.java | 挂号服务：注释 | 中 |
| onelink-micro-charge-fj-common | dict/service/inpatient/impl/PatientBaseInfoServiceImpl.java | 住院患者服务：注释 | 中 |
| onelink-micro-charge-fj-common | resources/mappings/dispensing/OutpDispensingCheckDao.xml | 门诊发药核对 SQL：注释 | 中 |

### 调用关系

```
【医嘱开单弹窗】
components/presManage/drug.vue
  → api/webapi-service/dict/drug/DrugDict.js::getDrugHighRiskLevel
    → onelink-micro-optimus-fj-common::DrugDictController
      → DrugDictService → DrugDictDao → DrugDictDao.xml (DIC_DRUG_DICT + DIC_HIGH_RISK_DRUG_CLASS)

【药品字典维护】
pages/drugDictionaryManage/drugInformationNew.vue / drugInformation.vue
  → api/webapi-service/dict/drug/DrugDict.js
    → onelink-micro-optimus-fj-common::DrugDictController
      → DrugDictService → DrugDictDao → DrugDictDao.xml

【公共药品组件】
onelink-web-cis-common/components/projectCom/drug.vue
  被 onelink-web-pres-fj-common / onelink-web-outp-fj-common / onelink-web-his-drug-fj-common 多处引用
```

---

## 需求分析要点

- **业务域**：医嘱 / 门诊 / 药库 / 药品字典维护
- **参数体系（系统 / 页面 / 无）**：
  - 涉及页面参数 `PRES_HIGH_RISK_DRUG_SHOW_TYPE`（药品开单弹窗高危药品显示方式），参数编码/值保持不变，仅前端注释/展示文本改“高警示”。
  - 涉及页面参数 `pres_high_risk_drug_tips_ways`（高危药品提示方式），同样不改编码/值。
- **数据流（表、池表、流水）**：
  - 数据表：`DIC_DRUG_DICT`（字段 `HIGH_RISK_FLAG`、`HIGH_RISK_DRUG_CLASS_CODE`、`HIGH_WARNING_DRUG_CLASSIFICATION` 等）
  - 关联字典表：`DIC_HIGH_RISK_DRUG_CLASS`（高危药品分类字典）
  - **本次不改表字段名/枚举值**，只改前端展示文本与后端注释文本。
- **参考 case**：
  - 本地 `docs/memory/index.md` 中无直接相关 case。
  - IMA 知识库因 `knowledge_base_id` 为空无法检索，待 Cursor Step 4 可补查或跳过。

---

## 待确认问题

1. **后端注释是否纳入本次修改？**  
   需求描述只提及“界面”与“药品字典”展示文本，后端 Controller/Service/Entity/Dao.xml 中的“高危药品”注释是否一并替换为“高警示药品”，需产品/用户确认。建议：注释同步替换，避免前后端术语不一致。

2. **字段名/参数编码是否保持不变？**  
   现有数据库字段 `HIGH_RISK_FLAG`、`HIGH_RISK_DRUG_CLASS_CODE` 及前端属性 `highRiskFlag`、`highRiskDrugClassCode` 等建议保持不变，仅改展示文本。若用户要求连字段名一起改，则 scope 会大幅扩大（需改表、改 SQL、改 DTO、改接口），需重新评估。

3. **菜单名“高危药品管理”是否改“高警示药品管理”？**  
   layouts/menuFrame/ordinary.vue 中住院护士站菜单名为“高危药品管理”，其下子菜单为麻醉卡/红处方。该菜单是否属于“药品字典里面”的范畴需确认；建议同步改为“高警示药品管理”。

4. **CDSS 拦截类型“高危药品”是否改“高警示药品”？**  
   onelink-web-cis-common 中 CDSS 数组 `rationalityInterceptType` 包含“高危药品”，该值用于与后端返回的拦截类型做匹配。修改前需确认后端对应值是否同步变更，避免匹配失败。

5. **漳州二院是否为独立配置？**  
   部分字段标签通过动态栏目（`dataItemName`）配置，若漳州二院有独立配置库，可能需要同步更新配置数据；代码层仅改默认值。

---

## Spec（Step 5 填写，确认后作为 Cursor 实现依据）

### 改造策略

- **前端展示文本**：将所有药品相关“高危”替换为“高警示”，“高危药品”替换为“高警示药品”。
- **字段/属性/参数编码**：保持不变（`highRiskFlag`、`HIGH_RISK_FLAG`、`PRES_HIGH_RISK_DRUG_SHOW_TYPE` 等）。
- **后端**：仅同步替换注释/文档中的“高危药品”为“高警示药品”，不改动接口 URL、方法名、表字段名。
- **排除项**：新冠“高危地区/高危地域”、感染“高危因素”等非药品文本不改。

### 涉及子仓库

- [ ] onelink-web-pres-fj-common：医嘱开单弹窗及菜单
- [ ] onelink-web-outp-fj-common：门诊处方药品选择
- [ ] onelink-web-his-drug-fj-common：药品字典维护、发药查询、库存预警
- [ ] onelink-web-cis-common：公共药品组件、CDSS 拦截类型
- [ ] onelink-micro-optimus-fj-common：药品字典/高危分类后端注释
- [ ] onelink-micro-pres-fj-common：医嘱相关后端注释
- [ ] onelink-micro-charge-fj-common：收费/药库相关后端注释

### 文件清单（前端重点）

| 仓库 | 路径 | 改动类型 |
|------|------|----------|
| onelink-web-pres-fj-common | components/presManage/drug.vue | 标签文本 + 注释 |
| onelink-web-pres-fj-common | components/presManage/westernPrescribe.vue | 注释 |
| onelink-web-pres-fj-common | components/presManage/westernPrescribeNew.vue | 注释 |
| onelink-web-pres-fj-common | pages/presManage/emergencyDocOderQuery.vue | 注释 |
| onelink-web-pres-fj-common | layouts/menuFrame/ordinary.vue | 菜单名 |
| onelink-web-pres-fj-common | api/webapi-service/dict/drug/DrugDict.js | 注释 |
| onelink-web-outp-fj-common | components/outpatientTreatment/pres/newItemSelect.vue | 标签文本 + 注释 |
| onelink-web-outp-fj-common | components/outpatientTreatment/pres/drug.vue | 标签文本 |
| onelink-web-outp-fj-common | components/outpatientTreatment/presModule.vue | 注释 |
| onelink-web-outp-fj-common | api/webapi-service/dict/drug/DrugDict.js | 注释 |
| onelink-web-his-drug-fj-common | pages/drugDictionaryManage/drugInformation.vue | 复选框标签 + 注释 |
| onelink-web-his-drug-fj-common | pages/drugDictionaryManage/drugInformationNew.vue | 复选框标签 + 注释 + dataItemName |
| onelink-web-his-drug-fj-common | pages/drugDictionaryManage/medicineMaintainNew.vue | dataItemName |
| onelink-web-his-drug-fj-common | pages/drugDictionaryManage/drugDictAudit.vue | 表头 dataItemName |
| onelink-web-his-drug-fj-common | pages/outpatientDispensManage/outpPresQuery.vue | 下拉选项文本 |
| onelink-web-his-drug-fj-common | pages/stockBillManage/earlyWarning.vue | 表头文本 |
| onelink-web-his-drug-fj-common | components/outpatientTreatment/drug.vue | 标签文本 |
| onelink-web-cis-common | components/projectCom/drug.vue | 标签文本 |
| onelink-web-cis-common | components/antibacterialManage/antibactDrugUseDialog*.vue | 注释 |
| onelink-web-cis-common | mixin/common/cdss/zoeCdss.js / aiCdss.js | 数组值（需确认后端匹配） |
| onelink-web-cis-common | components/outp/cdss/cdssControl.vue | 数组值（需确认后端匹配） |

### 数据库

| 表名 | 操作 | 说明 |
|------|------|------|
| DIC_DRUG_DICT | 不改结构 | 字段 `HIGH_RISK_FLAG` / `HIGH_RISK_DRUG_CLASS_CODE` / `HIGH_WARNING_DRUG_CLASSIFICATION` 保持 |
| DIC_HIGH_RISK_DRUG_CLASS | 不改结构 | 表名/字段名保持；如需改中文展示，通过前端/配置实现 |

### 参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| PRES_HIGH_RISK_DRUG_SHOW_TYPE | 页面参数 | - | 不改编码/值，仅前端注释与展示文本改“高警示” |
| pres_high_risk_drug_tips_ways | 页面参数 | - | 同上 |

### 数据流变更

无数据流变更，纯展示文本替换。

---

## 外部编辑器交接

```text
【来自 Trae/CodeBuddy 初步分析 — 请在 Cursor 从 Step 5 继续】

【禅道&项目】
205368【漳州二院】

【短期记忆文件】
docs/memory/short-term/205368-gaojingshi.md

【代码地图摘要】
| 仓库 | 路径 | 角色 | 置信度 |
| onelink-web-pres-fj-common | components/presManage/drug.vue | 医嘱开单弹窗药品标签/参数 | 高 |
| onelink-web-pres-fj-common | layouts/menuFrame/ordinary.vue | 菜单“高危药品管理” | 高 |
| onelink-web-outp-fj-common | components/outpatientTreatment/pres/newItemSelect.vue | 门诊药品选择标签 | 高 |
| onelink-web-his-drug-fj-common | pages/drugDictionaryManage/drugInformation*.vue | 药品字典维护页字段标签 | 高 |
| onelink-web-his-drug-fj-common | pages/drugDictionaryManage/medicineMaintainNew.vue / drugDictAudit.vue | 动态字段/表头 | 高 |
| onelink-web-cis-common | components/projectCom/drug.vue | 公共药品组件标签 | 高 |
| onelink-web-cis-common | mixin/common/cdss/*.js | CDSS 拦截类型值 | 高 |
| 后端三仓 | */dict/drug/*HighRisk* / DrugDict* | 注释文本 | 中 |

【调用关系】
页面 → api/webapi-service/dict/drug/DrugDict.js → DrugDictController → DrugDictService → DrugDictDao → DIC_DRUG_DICT/DIC_HIGH_RISK_DRUG_CLASS

【记忆库命中】
- 本地 docs/memory/index.md：无直接相关 case。
- IMA 知识库：knowledge_base_id 为空，未检索成功。

【待确认（请 Cursor spec 前澄清或标注假设）】
1. 后端注释是否同步替换？
2. 字段名/参数编码是否保持不变？
3. 菜单名“高危药品管理”是否改“高警示药品管理”？
4. CDSS 拦截类型“高危药品”是否改“高警示药品”？需确认后端匹配值。
5. 漳州二院是否有独立动态栏目配置需要同步更新？

【建议复杂度】Standard（跨 4+ 前端仓 + 3 后端仓，纯文本替换）

【下一步】
请在 Cursor 完善 spec（Step 5），等我确认后实现。
```

---

## 人工审核意见（选填）

> Step 9 人工审查时由用户填写；有内容时 Step 6 须纳入改造范围。

（留空）
