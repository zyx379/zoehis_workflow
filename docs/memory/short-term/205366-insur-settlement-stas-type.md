# [205366] 短期记忆 — 结算清单上传 stas_type 节点取视图数据

> **Agent 会话标题（中文）**：结算清单上传 stas_type 节点取视图数据
> **日期**：2026-07-02
> **状态**：`implementing`（Step 5 完成，Step 6 已实现，待 Step 9 人工审查）
> **短期记忆**：需求进行中临时文件；Step 12 沉淀长期 case 后 **删除本文件**。

---

## 需求摘要

- **任务类型**：功能修改
- **禅道 / 项目**：205366 / 【漳州二院】
- **页面 / 菜单**：结算清单信息上传管理（`pages/insurance/healthMaintainManage/settlementRecordManage.vue`）
- **需求描述**：结算清单上传时，`setlinfo` 节点中的 `stas_type` 取视图 `zoeview.V_INSUR_SETTLEMENT_RECORD_MASTER` 的 `stas_type` 数据。

---

## 代码地图（Step 4 产出）

| 仓库 | 路径 | 角色（页面/API/Service/SQL） | 置信度 |
|------|------|------------------------------|--------|
| onelink-web-his-charge-fj-common | `pages/insurance/healthMaintainManage/settlementRecordManage.vue` | 结算清单信息上传管理页面（上传/批量上传/撤销入口） | 高 |
| onelink-web-his-charge-fj-common | `api/insurance-service/insur/InsurManager.js` | 前端调用医保服务 API | 高 |
| onelink-micro-insurance-fj-ybcommon | `service/service/nationalInsurance/fuzhou/FuZhouNationalInsurancePublicService.java` | 福州医保公共服务（漳州二院使用该服务类） | 高 |
| onelink-micro-insurance-fj-ybcommon | `service/resources/insur/InsurManageDao.xml` | 结算清单主表视图查询 SQL | 高 |
| onelink-micro-insurance-fj-ybcommon | `service/service/InsurManageService.java` | 医保公共服务，封装 `getInsurSettlementRecordMaster` | 高 |
| onelink-micro-insurance-fj-ybcommon | `service/service/InsurViewManageService.java` | 视图查询 Service 封装（同功能，不确定是否被福州服务使用） | 中 |
| onelink-micro-insurance-fj-ybcommon | `service/resources/insurView/InsurManageDao.xml` | 视图查询 DAO XML（同 SQL） | 中 |
| onelink-micro-insurance-fj-ybcommon | `service/service/nationalInsurance/xiaMen/XiaMenNationalInsurancePublicService.java` | 厦门医保公共服务（含同类 `stas_type` 处理代码） | 中 |

### 调用关系

```
settlementRecordManage.vue（结算清单上传管理页面）
  → InsurManager.js / API
    → InsurManageController
      → InsurManageService
        → 根据医保类型分发到 FuZhouNationalInsurancePublicService
          → insurSecurityFundSettleListInfoUploadRequest
            → insurManageService.getInsurSettlementRecordMaster(
                 insuranceMessage.getInsurEventNo(),
                 insuranceMessage.getInsurSettleNo(), null, null, null)
              → InsurManageDao.xml#getInsurSettlementRecordMaster
                → ZOEVIEW.V_INSUR_SETTLEMENT_RECORD_MASTER (SELECT *)
            → settlementRecordMasterParamPack(insurSettlementRecord)
              → put("stas_type", getItemValues(insurSettlementRecord, "stasType"))
            → data.put("setlinfo", insurSettlementRecordMaster)
```

---

## 需求分析要点

### 业务域
医保 / 全国医保 / 结算清单上传 / 漳州二院使用福州医保服务类。

### 参数体系
无新增/修改参数需求。

### 数据流
- 视图 `ZOEVIEW.V_INSUR_SETTLEMENT_RECORD_MASTER` → `InsurManageDao.xml#getInsurSettlementRecordMaster`（`resultType="hashmap"`）→ `InsurManageService` → `FuZhouNationalInsurancePublicService#settlementRecordMasterParamPack` → 构造 `setlinfo.stas_type`。
- 不涉及池表、主细表、预交金、流水变更。

### 记忆库命中（全部）
- [本地] 无直接匹配 case。
- [在线] 无直接匹配笔记。

### MCP 字段核验（外部分析无法调 MCP，标待 Cursor 核验）
- **待 Cursor Step 4 MCP 核验**：`ZOEVIEW.V_INSUR_SETTLEMENT_RECORD_MASTER` 中 `stas_type` 列的实际列名。
  - 当前代码使用 `CommonUtilServiceInsur.getItemValues(insurSettlementRecord, "stasType")` 取值。
  - 若视图列名为下划线 `stas_type`，则 MyBatis `resultType="hashmap"` 返回的 key 可能为 `stas_type`（或数据库方言转换后的大写下划线），当前 `stasType` key 会取空值。
  - **禁止猜测**：需调用 `user-zoe-his-mcp` → `get_table_schema("V_INSUR_SETTLEMENT_RECORD_MASTER")` 确认真实列名后，再决定改 key 为 `"stas_type"`、`"STAS_TYPE"` 还是其他。

---

## 待确认问题

1. **视图列名确认**：`ZOEVIEW.V_INSUR_SETTLEMENT_RECORD_MASTER` 中 `stas_type` 在数据库层的实际列名是什么？当前代码用 `stasType` 作为 Map key 是否正确？实际列名 stas_type；是
2. **影响范围**：漳州二院使用福州医保服务类，是否只需修改 `FuZhouNationalInsurancePublicService`？厦门服务类 `XiaMenNationalInsurancePublicService` 含完全同类代码，是否同步修复？
只改福州
3. **是否改视图定义**：若视图当前无 `stas_type` 列，是否需要 DBA 配合新增视图字段？还是仅改代码取数 key？

4. **状态更新请求是否受影响**：`insurSecurityFundSettleListInfoUpdateRequest`（4102 接口）中 `stas_type` 从 `insuranceMessage.getStasType()` 取，本次需求是否只涉及上传请求（setlinfo 节点），不涉及状态更新请求？是
5. **测试数据**：漳州二院现场是否有已上传/未上传的结算清单可用于验证 `stas_type` 取值？
无需验证
---

## Spec（Step 5 草稿，待 Cursor 确认/细化）

### 改造计划（初步）

本次为单仓库、单方法的小范围改动（Standard）。

**涉及子仓库**
- [x] onelink-micro-insurance-fj-ybcommon：修改福州医保公共服务中 `settlementRecordMasterParamPack` 的 `stas_type` 取值 key。

**文件清单**

| 仓库 | 路径 | 改动类型 |
|------|------|----------|
| onelink-micro-insurance-fj-ybcommon | `service/service/nationalInsurance/fuzhou/FuZhouNationalInsurancePublicService.java` | 修改 `settlementRecordMasterParamPack` 中 `stas_type` 取值 key |

**数据库**

| 表/视图名 | 操作 | 说明 |
|-----------|------|------|
| `ZOEVIEW.V_INSUR_SETTLEMENT_RECORD_MASTER` | 读 | 待 MCP 确认 `stas_type` 列名；可能无需改视图定义 |

**参数**
无。

**数据流变更**
```text
ZOEVIEW.V_INSUR_SETTLEMENT_RECORD_MASTER
  → InsurManageDao.xml#getInsurSettlementRecordMaster (SELECT *)
    → Map<String, Object>
      → FuZhouNationalInsurancePublicService#settlementRecordMasterParamPack
        → 修正 stas_type 取值 key
          → setlinfo.stas_type
```

**实现要点（待 Cursor 根据 MCP 结果确认）**
- 若 MCP 返回列名为 `STAS_TYPE`（下划线大写），则 Map key 为 `"STAS_TYPE"`，应改为：
  ```java
  insurSettlementRecordMaster.put("stas_type",
      CommonUtilServiceInsur.getItemValues(insurSettlementRecord, "STAS_TYPE"));
  ```
- 若 MCP 返回列名为 `stas_type`（下划线小写），则 Map key 为 `"stas_type"`。
- 若 MCP 返回列名为 `stasType`（小驼峰），则当前代码已正确，需进一步排查为何视图数据未生效。

**待确认问题（请 Cursor Step 5 前澄清）**
1. 视图 `V_INSUR_SETTLEMENT_RECORD_MASTER` 的 `stas_type` 列实际列名？
2. 是否同步修改 `XiaMenNationalInsurancePublicService` 中的同类代码？
3. 本次是否只改上传请求（setlinfo），不改状态更新请求（4102）？

---

## 外部编辑器交接

【来自 Trae/CodeBuddy 初步分析 — 请在 Cursor 从 Step 5 继续】

【禅道&项目】
205366【漳州二院】

【短期记忆文件】
docs/memory/short-term/205366-insur-settlement-stas-type.md

【代码地图摘要】
| 仓库 | 路径 | 角色 | 置信度 |
| onelink-web-his-charge-fj-common | pages/insurance/healthMaintainManage/settlementRecordManage.vue | 结算清单上传管理页面 | 高 |
| onelink-micro-insurance-fj-ybcommon | service/service/nationalInsurance/fuzhou/FuZhouNationalInsurancePublicService.java | 福州医保公共服务（漳州二院使用） | 高 |
| onelink-micro-insurance-fj-ybcommon | service/resources/insur/InsurManageDao.xml | 结算清单主表视图查询 SQL | 高 |
| onelink-micro-insurance-fj-ybcommon | service/service/nationalInsurance/xiaMen/XiaMenNationalInsurancePublicService.java | 厦门医保公共服务（同类代码） | 中 |

【调用关系】
```
settlementRecordManage.vue → InsurManager.js → InsurManageController → InsurManageService
  → FuZhouNationalInsurancePublicService#insurSecurityFundSettleListInfoUploadRequest
    → getInsurSettlementRecordMaster → ZOEVIEW.V_INSUR_SETTLEMENT_RECORD_MASTER
    → settlementRecordMasterParamPack → setlinfo.stas_type
```

【记忆库命中】
- 本地：无直接匹配 case
- 在线：无直接匹配笔记

【待确认（请 Cursor spec 前澄清或标注假设）】
1. 视图 `V_INSUR_SETTLEMENT_RECORD_MASTER` 中 `stas_type` 列的实际列名（需 MCP get_table_schema 确认）。
2. 是否同步修改厦门服务类中的同类代码。
3. 本次是否只改上传请求（setlinfo），不改状态更新请求（4102）。

【建议复杂度】Standard

【下一步】
请在 Cursor 完善 spec（Step 5），调用 MCP `get_table_schema` 确认视图列名后，进入 Step 6 实现。

---

## 人工审核意见（选填）

> Step 9 人工审查时由用户填写；有内容时 Step 6 须纳入改造范围。

（留空）
