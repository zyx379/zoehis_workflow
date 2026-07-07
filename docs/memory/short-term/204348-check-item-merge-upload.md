# 204348 短期记忆 — 上传费用明细时检查类项目不能进行合并上传

> **短期记忆**：需求进行中临时文件；Step 12 沉淀长期 case 后 **删除本文件**。  
> 日期：2026-07-02  
> 状态：`spec-confirmed`

---

## 需求摘要

- **任务类型**：功能改造
- **禅道 / 项目**：204348 / 【漳州二院】
- **页面 / 菜单**：
  - 住院：住院医保管理 → 费用上传 / 住院批量医保费用上传（`hospitInsuranceManage.vue`、`hospitInsuranceBatch.vue`、`financialLiftManage.vue`）
  - 门诊：门诊医保管理 → 门诊费用明细上传（`outpFinancialLiftManage.vue`、`outpInsuranceManage.vue`）
- **需求描述**：门诊/住院医保费用明细上传时，检查类项目不参与合并上传，需按原始明细逐条上传。

---

## 代码地图（Step 4 产出）

### 住院侧

| 仓库 | 路径 | 角色（页面/API/Service/SQL） | 置信度 |
|------|------|------------------------------|--------|
| onelink-web-his-charge-fj-common | `pages/insurance/healthMaintainManage/hospitInsuranceManage.vue` | 住院医保管理页面：点击「费用上传」调用 `uploadDetails()` | 高 |
| onelink-web-his-charge-fj-common | `pages/insurance/healthMaintainManage/hospitInsuranceBatch.vue` | 批量住院医保费用上传：循环调用 `presReportedReqHos()` | 高 |
| onelink-web-his-charge-fj-common | `pages/insurance/healthMaintainManage/financialLiftManage.vue` | 住院财务提升管理：费用明细上传入口 | 高 |
| onelink-web-his-charge-fj-common | `components/insurance/projectCom/medicalInsurBase.vue` | 医保组件底座，根据 `insuranceInterface` 路由到具体医保组件 | 高 |
| onelink-web-his-charge-fj-common | `components/insurance/projectCom/national/nationaInsurance.vue` | 国家医保组件（漳州二院使用），`presReportedReqHos` 调用 `interfaceId='459'` | 高 |
| onelink-micro-charge-fj-common | `service/insurance/web/InsurManagerController.java` | 医保统一接口 `/api/insur/insurManager/insurInterface` | 高 |
| onelink-micro-charge-fj-common | `service/insurance/service/insurinterface/InsurManagerServiceImpl.java` | 按 `insuranceInterface` 路由，国家医保通过 Feign 调 insurance 服务 | 高 |
| onelink-micro-charge-fj-common | `service/feign/InsurInterfaceClient.java` | Feign 客户端：`/inner/insurForeign/insurInterface` | 高 |
| onelink-micro-insurance-fj-ybcommon | `service/insur/web/open/InsuranceOpenController.java` | insurance 服务对外入口，透传至工厂类 | 高 |
| onelink-micro-insurance-fj-ybcommon | `service/insur/service/factory/InsurInterfaceFactoryService.java` | 医保接口工厂：反射调用 `FuZhouNationalInsuranceInpService` | 高 |
| onelink-micro-insurance-fj-ybcommon | `service/insur/service/nationalInsurance/fuzhou/FuZhouNationalInsuranceInpService.java` | **核心**：住院费用上传请求 `inpTradeSendCostRequest()`，读取合并参数并查询费用明细 | 高 |
| onelink-micro-insurance-fj-ybcommon | `service/insur/service/inp/InpChargeDetailService.java` | 住院费用明细 Service，封装 4 种合并查询 | 高 |
| onelink-micro-insurance-fj-ybcommon | `resources/insur/inp/InpChargeDetailDao.xml` | **核心**：4 种合并上传 SQL（Oracle + 达梦各 4 个） | 高 |

### 门诊侧

| 仓库 | 路径 | 角色（页面/API/Service/SQL） | 置信度 |
|------|------|------------------------------|--------|
| onelink-web-his-charge-fj-common | `pages/insurance/healthMaintainManage/outpFinancialLiftManage.vue` | 门诊费用明细上传入口 | 高 |
| onelink-web-his-charge-fj-common | `components/insurance/projectCom/national/nationaInsurance.vue` | 国家医保组件，`outpInsurFeeDetailUpload` 调用 `interfaceId='941'` | 高 |
| onelink-micro-insurance-fj-ybcommon | `service/insur/service/nationalInsurance/fuzhou/FuZhouNationalInsuranceOutpService.java` | **核心**：门诊费用上传请求 `outpTradeSendCostRequest()` | 高 |
| onelink-micro-insurance-fj-ybcommon | `service/insur/service/outp/OutpInsurTransferDetailService.java` | 门诊费用明细 Service，`getNewOutpInsurItems()` 合并门诊项目 | 高 |
| onelink-micro-insurance-fj-ybcommon | `resources/insur/outp/OutpInsurTransferDetailDao.xml` | **核心**：门诊合并 SQL `getNewOutpInsurItems`（按项目合并，含 `clinicItemClassCode`） | 高 |

### 调用关系（文字或箭头）

```
住院医保管理页面 (hospitInsuranceManage.vue)
  ↓ getMI(insuranceInterface) + handleInsurBusiness(params, 'uploadDetails'/'presReportedReqHos')
nationaInsurance.vue (interfaceId='459')
  ↓ $api.InsurManager.insurInterface(data)
InsurManagerController.insurInterface()
  ↓ Feign /inner/insurForeign/insurInterface
InsuranceOpenController.insurInterface()
  ↓ InsurInterfaceFactoryService.insurInterface()
    ↓ 反射调用 FuZhouNationalInsuranceInpService.inpTradeSendCostRequest()
      ↓ InpChargeDetailService.getMerge*()  ← 合并参数 insur_fee_upload_merge_un_apply_no
        ↓ InpChargeDetailDao.xml 合并 SQL

门诊费用上传页面 (outpFinancialLiftManage.vue)
  ↓ nationaInsurance.vue (interfaceId='941')
  ↓ $api.InsurManager.insurInterface(data)
InsurManagerController.insurInterface()
  ↓ Feign /inner/insurForeign/insurInterface
InsuranceOpenController.insurInterface()
  ↓ InsurInterfaceFactoryService.insurInterface()
    ↓ 反射调用 FuZhouNationalInsuranceOutpService.outpTradeSendCostRequest()
      ↓ OutpInsurTransferDetailService.getNewOutpInsurItems()
        ↓ OutpInsurTransferDetailDao.xml getNewOutpInsurItems
```

---

## 需求分析要点

- **业务域**：医保 / 全国医保 / 门诊+住院费用明细上传 / 漳州二院使用福州国家医保服务类。
- **核心逻辑（住院）**：
  - `FuZhouNationalInsuranceInpService.inpTradeSendCostRequest()` 通过系统参数 `insur_fee_upload_merge_un_apply_no` 控制是否合并上传：
    - `0`/空：不合并（`getInpFuZhouInpChargeDetail`）
    - `1`：`getMergeInpInpChargeDetailOtherNoApplyNo`（药品按单据号，诊疗不按单据号）
    - `2`：`getMergeInpCInpChargeDetailNoApplyNo`（不包含申请单号合并）
    - `3`：`getMergeInpCInpChargeDetailApplyNo(..., "0")`（都按单据号合并）
    - `4`：`getMergeInpCInpChargeDetailApplyNo(..., "1")`（按天合并）
  - 合并 SQL 对 `priceItemCode`、`priceItemName`、`unit`、`price`、`clinicItemClassCode` 等字段 GROUP BY，对 `quantity`/`cost` 求和，实现多条相同项目合并为一条上传。
- **核心逻辑（门诊）**：
  - `FuZhouNationalInsuranceOutpService.outpTradeSendCostRequest()` 调用 `OutpInsurTransferDetailService.getNewOutpInsurItems()`。
  - `getNewOutpInsurItems()` 对应的 SQL `getNewOutpInsurItems` 对 `priceItemCode`、`priceItemName`、`unit`、`price`、`clinicItemClassCode` 等字段 GROUP BY，对 `quantity`/`cost` 求和，实现门诊多条相同项目合并为一条上传。
- **检查类项目识别（已确认）**：
  - `CLINIC_ITEM_CLASS_CODE`（诊疗项目类别代码）首字母为 **`E`** 表示检查类（漳州二院现场确认）。
  - 门诊/住院费用明细字段名均为 `clinicItemClassCode`，源表分别为 `zoecharge.cha_outp_charge_detail.clinic_item_class_code` 和 `zoecharge.cha_inp_charge_detail.clinic_item_class_code`。
- **参数体系（已确认）**：
  - 现有系统参数 `insur_fee_upload_merge_un_apply_no` 控制住院合并模式。
  - **新增系统参数**：`insur_fee_upload_check_item_no_merge`，`1` 表示检查类项目不合并，`0`/空保持原合并逻辑。
- **数据流（表）**：
  - 门诊源表：`zoecharge.cha_outp_charge_detail`
  - 住院源表：`zoecharge.cha_inp_charge_detail`
  - 医保上传记录：`zoeinsur.ins_outp_transfer_detail` / `zoeinsur.ins_inp_transfer_detail`
  - 合并记录：`zoeinsur.ins_transfer_merge_detail`（上传应答后写入）
- **参考 case**：`docs/memory/index.md` 未检索到「合并上传 / 检查类项目」相关 case。

### MCP 字段核验（外部分析阶段未调 MCP）

- 涉及表/字段已从上文源码确认：
  - `zoecharge.cha_outp_charge_detail.clinic_item_class_code`
  - `zoecharge.cha_inp_charge_detail.clinic_item_class_code`
  - `zoeinsur.ins_outp_transfer_detail`
  - `zoeinsur.ins_inp_transfer_detail`
  - `zoeinsur.ins_transfer_merge_detail`
- 待 Cursor Step 4 用 MCP `get_table_schema` 复核以下表真实列名（防止方言/版本差异）：
  - `zoecharge.cha_outp_charge_detail`
  - `zoecharge.cha_inp_charge_detail`
  - `zoeinsur.ins_transfer_merge_detail`
  - `zoedict.dic_item_class_dict`

---

## 已确认问题

1. **生效范围**：门诊 + 住院均需改造。
2. **检查类前缀**：`CLINIC_ITEM_CLASS_CODE` 首字母为 `E`。
3. **参数控制**：新增系统参数 `insur_fee_upload_check_item_no_merge`。
4. **合并模式覆盖**：住院 4 种合并模式（`1/2/3/4`）全部支持检查类项目不合并。
5. **医保版本**：漳州二院使用福州国家医保服务类（`FuZhouNationalInsuranceInpService` / `FuZhouNationalInsuranceOutpService`）。

## 已确认问题（补充）

6. **高值材料/组套**：检查类项目不涉及高值材料打包、组套上传场景，无需特殊处理。
7. **撤销/冲销一致性**：费用上传冲销逻辑无需同步调整。
8. **参数默认值**：新参数 `insur_fee_upload_check_item_no_merge` 默认关闭（`0`），漳州二院现场按需开启（`1`）。

---

## Spec（Step 5 填写，已确认，作为 Cursor 实现依据）

### 改造计划

#### 涉及子仓库
- `onelink-micro-insurance-fj-ybcommon`：核心改造。

#### 文件清单

| 仓库 | 路径 | 改动类型 |
|------|------|----------|
| onelink-micro-insurance-fj-ybcommon | `service/insur/service/nationalInsurance/fuzhou/FuZhouNationalInsuranceInpService.java` | 住院上传入口读取新增参数 `insur_fee_upload_check_item_no_merge`，并透传给合并查询 |
| onelink-micro-insurance-fj-ybcommon | `service/insur/service/inp/InpChargeDetailService.java` | 4 种合并方法新增 `checkItemNoMerge` 标志，透传给 DAO |
| onelink-micro-insurance-fj-ybcommon | `resources/insur/inp/InpChargeDetailDao.xml` | 修改 4 个合并查询 SQL（Oracle + 达梦共 8 处），检查类项目（`clinic_item_class_code like 'E%'`）按 `charge_detail_no` 分组 |
| onelink-micro-insurance-fj-ybcommon | `service/insur/service/nationalInsurance/fuzhou/FuZhouNationalInsuranceOutpService.java` | 门诊上传入口读取新增参数，并透传给门诊合并查询 |
| onelink-micro-insurance-fj-ybcommon | `service/insur/service/outp/OutpInsurTransferDetailService.java` | `getNewOutpInsurItems()` 新增 `checkItemNoMerge` 标志，透传给 DAO |
| onelink-micro-insurance-fj-ybcommon | `resources/insur/outp/OutpInsurTransferDetailDao.xml` | 修改 `getNewOutpInsurItems` SQL，检查类项目按 `charge_detail_no` 分组 |
| onelink-micro-insurance-fj-ybcommon | `resources/params/insuranceBizSysParam.jsonl` | 新增系统参数 `insur_fee_upload_check_item_no_merge` |

#### 数据库
- 无需新建表。
- 新增/更新 `com_biz_sys_param` 记录（通过 jsonl 导入）。

#### 参数

| 参数名 | 类型（系统参数/页面参数） | 默认值 | 说明 |
|--------|--------------------------|--------|------|
| `insur_fee_upload_check_item_no_merge` | 系统参数 | `0` | `1`：门诊/住院医保费用上传时，检查类项目（`CLINIC_ITEM_CLASS_CODE` 首字母 `E`）不参与合并，逐条上传；`0`/空：保持原合并逻辑 |

#### 数据流变更
- **住院**：
  - `inpTradeSendCostRequest()` 读取 `insur_fee_upload_check_item_no_merge`。
  - 若开启且 `insur_fee_upload_merge_un_apply_no` 为 `1/2/3/4`，调用合并查询时传入 `checkItemNoMerge=true`。
  - 合并 SQL 中，非检查类项目保持原有 GROUP BY 合并；检查类项目按 `charge_detail_no` 逐条返回，不汇总数量/金额。
- **门诊**：
  - `outpTradeSendCostRequest()` 读取 `insur_fee_upload_check_item_no_merge`。
  - 若开启，调用 `getNewOutpInsurItems()` 时传入 `checkItemNoMerge=true`。
  - 门诊合并 SQL 中，非检查类项目保持原有 GROUP BY 合并；检查类项目按 `charge_detail_no` 逐条返回，不汇总数量/金额。
- 上传应答后，`ins_transfer_merge_detail` 对检查类项目仅记录自身 `charge_detail_no`（无合并列表）。

#### 已确认
- 所有问题已确认，按上方改造计划实现。

---

## 外部编辑器交接

> 来自 Trae 初步分析 — 请在 Cursor 从 Step 5 继续。

- **短期记忆文件**：`docs/memory/short-term/204348-check-item-merge-upload.md`
- **建议复杂度**：Complex（涉及门诊+住院双入口、SQL 合并逻辑改造、Oracle + 达梦双版本）
- **下一步**：确认「仍待确认问题」后，按 Spec 实现。

---

## 人工审核意见（选填）

（留空）
