# 追溯码使用记录查询 V2 — 增量需求分析

> **Agent 会话标题**: 追溯码使用记录查询增量需求（V1.0 原型）  
> **禅道号**: `****`**（同原版占位）  
> **项目名称**: 待确认  
> **日期**: 2026-06-17  
> **状态**: `spec-confirmed`（P1+P2+P3 已实现，待 Step 9 人工审查）  
> **来源**: 2026-06-16 V1.0 原型 HTML + 功能说明 DOCX  
> **对比基准**: `trace-code-usage-query.md`（2026-06-15 spec）

---

## 增量需求摘要

对比现有 spec（2026-06-15）与新版原型（2026-06-16 V1.0），**新增以下需求**：

### 1. 新增查询条件


| 条件       | 说明                                                                          |
| -------- | --------------------------------------------------------------------------- |
| **使用状态** | Radio 单选：全部（默认）/ 未使用 / 已使用。`VALID_FLAG`：`0`未使用 / `1`已使用 |


### 2. 新增表格列（14 列 → 22 列）


| 新增列  | 字段          | 说明                        |
| ---- | ----------- | ------------------------- |
| 复选框  | —           | 全选/单选，橙色 accent-color     |
| 批号   | `lotNo`     | 对应 `BATCH_NUMBER`，小号字体    |
| 箱码   | `boxCode`   | 对应 `PACKAGE_BARCODE`，紫色文字 |
| 拆零标志 | `cflag`     | 标签：拆零/—                   |
| 仓管人员 | `keeper`    | 需确认来源                     |
| 医药公司 | `company`   | 需确认来源，超宽省略+title          |
| 扫入标识 | `scanFlag`  | 标签：系统导入/手工导入              |
| 使用状态 | `useStatus` | 标签：已使用/未使用（由 type 推导）     |


### 3. 新增功能


| 功能         | 说明                                                                        |
| ---------- | ------------------------------------------------------------------------- |
| **追溯码调拨**  | 仅"未使用"状态可选；勾选数据 → 选择调拨药房 → 确认；**需调用后端接口**                                 |
| **追溯码拆零**  | 新增操作；参考 `/his-drug-web/departWorkManage/drugBarcodeDismantleRecordManage` |
| **高级过滤抽屉** | 右侧滑出面板，支持 20+ 字段组合过滤                                                      |


**参考实现**：

- 调拨：参考出库管理界面 `/his-drug-web/stockInOutManage/outComingManage`
- 调拨类型字典：`DRU_DRUG_IO_CLASS_DIST.IS_SCAN_BARCODE=1`
- 拆零：参考追溯码拆零池录入 `/his-drug-web/departWorkManage/drugBarcodeDismantleRecordManage`

**已废除功能**：

- ~~调拨日志查询~~（用户确认废除）

### 4. 高级过滤抽屉字段


| 分类   | 字段                            |
| ---- | ----------------------------- |
| 基本信息 | 库存单元、药品代码、药品名称、药品规格、追溯码、批号、箱码 |
| 操作信息 | 操作类型、操作时间范围、单据号、医保就诊ID、医保结算ID |
| 入库信息 | 入库时间范围、失效时间范围                 |
| 其他   | 仓管人员、医药公司、拆零标志、扫入标识、使用状态      |


### 5. UI 细节变化


| 项      | 现有 spec | 新版             |
| ------ | ------- | -------------- |
| 追溯码截断  | 18 字    | **保留 V1 全量显示** |
| 采购时间列名 | 采购时间    | **入库时间**       |
| 拆零标志   | 查询条件勾选  | 表格列展示 + 过滤抽屉可选 |


---

## 代码地图


| 仓库                               | 路径                                                             | 角色                                             | 置信度 |
| -------------------------------- | -------------------------------------------------------------- | ---------------------------------------------- | --- |
| onelink-web-his-charge-fj-common | `pages/insurance/healthMaintainManage/traceCodeUsageQuery.vue` | **大幅修改**（新增列、调拨、拆零、过滤抽屉、复选框、使用状态）              | 高   |
| onelink-web-his-charge-fj-common | `api/charge-service/drug/DrugRetraceInfo.js`                   | 已有 `getTraceCodeUsageRecordList`，**新增调拨/拆零方法** | 高   |
| onelink-web-his-drug-fj-common   | `pages/stockInOutManage/outComingManage.vue`                   | **参考**：调拨业务逻辑                                  | 参考  |
| onelink-web-his-drug-fj-common   | `pages/departWorkManage/drugBarcodeDismantleRecordManage.vue`  | **参考**：拆零业务逻辑                                  | 参考  |
| onelink-micro-charge-fj-common   | `.../mappings/drug/DrugRetraceInfoDao.xml`                     | **修改 SQL**（新增查询字段+过滤条件）+ **新增调拨/拆零 SQL**       | 高   |
| onelink-micro-charge-fj-common   | `.../controller/api/drug/DrugRetraceInfoController.java`       | **新增接口**（调拨、拆零）                                | 高   |
| onelink-micro-charge-fj-common   | `.../service/drug/DrugRetraceInfoService.java`                 | **新增方法**（调拨、拆零）                                | 高   |


### 调用关系

```
查询：
traceCodeUsageQuery.vue
  → DrugRetraceInfo.js.getTraceCodeUsageRecordList（已有，扩展参数）
  → DrugRetraceInfoController.getTraceCodeUsageRecordList（已有，扩展入参）
  → DrugRetraceInfoDao.xml.getTraceCodeUsageRecordList（已有，扩展 SELECT 列+WHERE 条件）

调拨（新增）：
traceCodeUsageQuery.vue → 调拨弹窗
  → DrugRetraceInfo.js.transferTraceCode（新增）
  → DrugRetraceInfoController.transferTraceCode（新增）
  → DrugRetraceInfoService.transferTraceCode（新增）
  → DrugRetraceInfoDao.xml（新增 SQL：生成出库+入库记录）
  → 参考：outComingManage 出库管理逻辑
  → 字典：DRU_DRUG_IO_CLASS_DIST.IS_SCAN_BARCODE=1

拆零（新增）：
traceCodeUsageQuery.vue → 拆零弹窗
  → DrugRetraceInfo.js.dismantleTraceCode（新增）
  → DrugRetraceInfoController.dismantleTraceCode（新增）
  → DrugRetraceInfoService.dismantleTraceCode（新增）
  → DrugRetraceInfoDao.xml（新增 SQL：写入 DRU_DRUG_BARCODE_DISMANTLE_RECORD）
  → 参考：drugBarcodeDismantleRecordManage 拆零逻辑
```

### 记忆库命中


| case                           | 可复用结论             |
| ------------------------------ | ----------------- |
| 原版 `trace-code-usage-query.md` | 基础查询已实现，SQL 结构可复用 |
| 无直接调拨 case                     | —                 |


### MCP 字段核验（待 Cursor 执行）

以下字段需 MCP `get_table_schema` 核验：


| 字段                    | 疑似来源表                                                                           | 状态          |
| --------------------- | ------------------------------------------------------------------------------- | ----------- |
| `BATCH_NUMBER`（批号）    | `DRU_DRUG_BARCODE_USED_RECORD`                                                  | ✅ 现有 SQL 已用 |
| `PACKAGE_BARCODE`（箱码） | `DRU_DRUG_BARCODE_USED_RECORD`                                                  | ✅ insert 中有 |
| 仓管人员                  | `DRU_DRUG_BARCODE_USED_RECORD.OPERATOR`                                         | ✅ 已确认       |
| 扫入标识                  | `DRU_DRUG_BARCODE_USED_RECORD.FRONT_OPERATION_FLAG`                             | ✅ 已确认       |
| 使用状态                  | `DRU_DRUG_BARCODE_USED_RECORD.VALID_FLAG`                                       | ✅ 已确认       |
| 医药公司                  | `DIC_DRUG_DICT.PRODUCER_CODE` nvl `SUPPLIER_CODE`，中文对照 `DIC_BUSINESS_UNIT_DICT` | ✅ 已确认       |


---

## 待确认问题

（全部已确认，无遗留）

## 已确认问题

1. ~~**追溯码调拨** 是否需要后端接口？~~ → **已确认：需要后端接口**
2. ~~**调拨日志** 存储在哪里？是否需要新建表？~~ → **已确认：废除调拨日志功能**
3. **追溯码调拨参考实现**：出库管理界面 `/his-drug-web/stockInOutManage/outComingManage`
4. **出入库类型字典**：`DRU_DRUG_IO_CLASS_DIST.IS_SCAN_BARCODE=1`
5. **追溯码拆零参考实现**：追溯码拆零池录入 `/his-drug-web/departWorkManage/drugBarcodeDismantleRecordManage`
6. **仓管人员** → `DRU_DRUG_BARCODE_USED_RECORD.OPERATOR`（主表已有字段）
7. **扫入标识** → `DRU_DRUG_BARCODE_USED_RECORD.FRONT_OPERATION_FLAG`（`0`系统导入 / `1`手工导入）
8. **使用状态** → `DRU_DRUG_BARCODE_USED_RECORD.VALID_FLAG`（`0`未使用 / `1`已使用；**非** type 推导）
9. **医药公司** → `DIC_DRUG_DICT.PRODUCER_CODE` nvl `SUPPLIER_CODE`，中文对照 `DIC_BUSINESS_UNIT_DICT`
10. **追溯码显示** → 保留 V1 **全量显示**（不截断）
11. **分期** → **先做 P1**（查询扩展 + UI）；P2 调拨 / P3 拆零后续

---

## Spec（增量改造计划）

### 涉及子仓库

- [x] `onelink-web-his-charge-fj-common`：修改 `traceCodeUsageQuery.vue`
- [x] `onelink-micro-charge-fj-common`：扩展 SQL + 新增调拨/拆零接口

### 后端改造

#### A. 扩展 `getTraceCodeUsageRecordList` SQL

在现有 SQL 基础上，**新增 SELECT 列**：

```sql
t.batch_number "lotNo",              -- 批号
t.package_barcode "boxCode",         -- 箱码
t.dismantle_flag "dismantleFlag",    -- 拆零标志
t.operator "keeper",                 -- 仓管人员（主表 OPERATOR）
t.front_operation_flag "scanFlag",   -- 扫入标识（主表 FRONT_OPERATION_FLAG）
t.valid_flag "useStatus",            -- 使用状态（主表 VALID_FLAG，非 type 推导）
-- 医药公司：DIC_DRUG_DICT.PRODUCER_CODE nvl SUPPLIER_CODE，中文对照 DIC_BUSINESS_UNIT_DICT
(select nvl(bud.unit_name, '')
   from zoedict.dic_drug_dict dd
   left join zoedict.dic_business_unit_dict bud
     on bud.unit_code = nvl(dd.producer_code, dd.supplier_code)
  where dd.drug_code = t.drug_code
  and rownum = 1) "company"
```

**新增 WHERE 条件**：

```xml
<!-- 使用状态：valid_flag='1' 已使用，valid_flag='0' 未使用 -->
<if test="param.useStatus != null and param.useStatus == '0'.toString()">
    and t.valid_flag = '0'
</if>
<if test="param.useStatus != null and param.useStatus == '1'.toString()">
    and t.valid_flag = '1'
</if>
<!-- 高级过滤新增条件 -->
<if test="param.drugName != null and param.drugName != ''">
    and dt.drug_name like '%'||#{param.drugName}||'%'
</if>
<if test="param.spec != null and param.spec != ''">
    and dt.drug_spec like '%'||#{param.spec}||'%'
</if>
<if test="param.lotNo != null and param.lotNo != ''">
    and t.batch_number like '%'||#{param.lotNo}||'%'
</if>
<if test="param.boxCode != null and param.boxCode != ''">
    and t.package_barcode like '%'||#{param.boxCode}||'%'
</if>
<!-- 入库时间范围、失效时间范围 待确认是否需要后端过滤 -->
```

#### B. 追溯码调拨接口（已确认）

参考出库管理界面 `/his-drug-web/stockInOutManage/outComingManage`，出入库类型字典 `DRU_DRUG_IO_CLASS_DIST.IS_SCAN_BARCODE=1`：

- 新增 `transferTraceCode` 接口
- 入参：选中的追溯码列表（keyId/barcode/drugCode/storeCode）+ 调拨目标药房（targetStoreCode）
- 出参：成功/失败
- 业务逻辑：生成出库单（当前药房）+ 入库单（目标药房），更新 `DRU_DRUG_BARCODE_USED_RECORD`

#### C. 追溯码拆零接口（已确认）

参考追溯码拆零池录入 `/his-drug-web/departWorkManage/drugBarcodeDismantleRecordManage`：

- 新增 `dismantleTraceCode` 接口
- 入参：选中的追溯码（keyId/barcode/drugCode/storeCode）+ 拆零数量
- 出参：成功/失败
- 业务逻辑：写入 `DRU_DRUG_BARCODE_DISMANTLE_RECORD`，更新原记录状态

### 前端改造

1. **表格列扩展**：新增批号、箱码、拆零标志、仓管人员、医药公司、扫入标识、使用状态列
2. **使用状态 Radio**：查询条件第二行新增，联动查询
3. **复选框 + 全选**：表格首列，支持批量选择
4. **追溯码调拨弹窗**：仅"未使用"状态可用，选择调拨药房后确认，调用后端接口
5. **追溯码拆零弹窗**：输入拆零数量，调用后端接口
6. **高级过滤抽屉**：右侧滑出，20+ 字段组合过滤，应用后按钮橙色高亮
7. **底部按钮状态**：调拨/拆零按钮根据使用状态和勾选数据动态启用/禁用
8. **追溯码截断**：16 字（原 18 字）

### 验收要点

- [ ] 22 列表格与原型一致
- [ ] 使用状态筛选正确（`VALID_FLAG`：`0`未使用 / `1`已使用）
- [ ] 追溯码调拨仅对"未使用"状态可用，调用后端接口
- [ ] 追溯码拆零调用后端接口
- [ ] 高级过滤抽屉字段完整
- [ ] 不影响现有 `getDrugBarcodeUseInfoList` 等接口

### 复杂度评估

**Complex**（新增调拨/拆零后端接口 + 20+ 过滤字段 + 多列扩展）

---

## 人工审核意见（选填）

