# 追溯码使用记录查询 — 短期分析

> **Agent 会话标题**: 追溯码使用记录查询功能开发  
> **禅道号**: `******`（未定，占位）  
> **项目名称**: 待确认  
> **日期**: 2026-06-15  
> **状态**: `spec-confirmed` → **实现完成（待 Step 9 人工审查）**

---

## 需求摘要

- **任务类型**: 新功能开发（纯查询页，只读 SELECT）
- **禅道 / 项目**: `******` / 待确认
- **页面 / 菜单**: 科室事务 → 追溯码使用记录查询  
- **页面路径（已确认）**: `onelink-web-his-charge-fj-common/pages/insurance/healthMaintainManage/traceCodeUsageQuery.vue`（**新建**）
- **原型 / 说明**:  
  - HTML: `追溯码使用记录查询.html`  
  - DOCX: `追溯码使用记录查询-功能说明.docx`

### 功能要点（原型 + 功能说明）

| 类别 | 内容 |
|------|------|
| 查询条件 | 操作时间（起止）、库存单元、药品代码（模糊）、药品追溯码（模糊）、操作类型、单据号（模糊）、医保就诊ID（精确）、医保结算ID（精确）、拆零标志（勾选仅查拆零） |
| 表格列 | 序号、库存单元、药品代码、药品名称、药品规格、追溯码、计量单位、操作类型、操作日期、单据号、医保就诊ID、医保结算ID、采购时间、失效时间 |
| 操作类型 | 1入库 / 2出库 / 3摆药 / 4退药（彩色标签；字典 `DRUG_BARCODE_OPERATE_TYPE`） |
| 交互 | 查询、重置；分页默认 500 条/页（可选 100/500/1000/2000/5000）；导出 Excel |
| UI 细节 | 追溯码超 18 字省略+title；失效时间距今天 ≤90 天红色；医保 ID 空显示「—」；拆零勾选联动查询 |

### Step 5 已确认决策

| # | 问题 | 确认结果 |
|---|------|----------|
| 1 | 禅道号 | `******`（占位，交付前替换） |
| 2 | 页面路径 | `onelink-web-his-charge-fj-common/pages/insurance/healthMaintainManage/traceCodeUsageQuery.vue` |
| 3 | 库存单元下拉 | **固定列表**（原型：全部 / 中心药房 / 门诊药房 / 急诊药房 / 静配中心；实现时写死 `storeCode` 映射，运维菜单配 URL） |
| 4 | 采购时间 | 取**入库记录**的 `operated_time`（`type='1'`，同追溯码/药品关联子查询，**不用** `DRU_DRUG_STORE.produce_date`） |
| 5 | 导出范围 | **当前查询条件全量**（非仅当前页）；导出前单独请求（`pageSize=total` 或专用无分页导出接口） |
| 6 | 全院查询 | **允许**；库存单元选「全部」时不传 `store_code` 条件 |

---

## 代码地图（Step 4 产出，已按确认项修正）

| 仓库 | 路径 | 角色 | 置信度 |
|------|------|------|--------|
| onelink-web-his-charge-fj-common | `pages/insurance/healthMaintainManage/traceCodeUsageQuery.vue`（**新建**） | 查询页面 | 高 |
| onelink-web-his-charge-fj-common | `pages/insurance/healthMaintainManage/traceableCodeUploadManage.vue` | 同目录追溯页参考（分页、DrugRetraceInfo） | 高 |
| onelink-web-his-charge-fj-common | `api/charge-service/drug/DrugRetraceInfo.js` | API 层（**新增方法**） | 高 |
| onelink-web-his-drug-fj-common | `pages/departWorkManage/drugBarcodeDismantleRecordManage.vue` | 追溯码 UI/布局参考（跨仓只读） | 中 |
| onelink-web-his-drug-fj-common | `pages/stockBillManage/inventoryQuery.vue` | `tableToExcel` 全量导出参考 | 中 |
| onelink-micro-charge-fj-common | `.../controller/api/drug/DrugRetraceInfoController.java` | Controller（**新增接口**） | 高 |
| onelink-micro-charge-fj-common | `.../service/drug/DrugRetraceInfoService.java` | Service | 高 |
| onelink-micro-charge-fj-common | `.../dao/drug/DrugRetraceInfoDao.java` | Dao | 高 |
| onelink-micro-charge-fj-common | `.../mappings/drug/DrugRetraceInfoDao.xml` | SQL（**新增分页查询**） | 高 |
| onelink-micro-charge-fj-common | `.../pojo/.../DrugBarcodeUseInfo.java` | 查询实体（扩展展示字段） | 高 |

### 调用关系

```
traceCodeUsageQuery.vue（charge 前端，healthMaintainManage 下新建）
  → api/charge-service/drug/DrugRetraceInfo.js.getTraceCodeUsageRecordList（新建）
  → DrugRetraceInfoController.getTraceCodeUsageRecordList
  → DrugRetraceInfoService
  → DrugRetraceInfoDao.xml（新 SQL，Page 分页）
  → ZOEDRUG.DRU_DRUG_BARCODE_USED_RECORD（主表 t）
     + ZOEDICT.DIC_DRUG_DICT（药品名称/规格/单位）
     + ZOEDICT.DIC_DEPT_DICT（库存单元名称）
     + ZOEDRUG.DRU_DRUG_STORE（失效时间 invalid_date，store_code+batch_number）
     + 子查询：同 barcode/drug 的 type=1 入库记录 operated_time → 采购时间
     + ZOEDICT.DIC_BASIC_DICT（操作类型 DRUG_BARCODE_OPERATE_TYPE）
```

### 与现有接口差异（重要）

已有 `getDrugBarcodeUseInfoList` **不满足本页需求**（无分页、无时间范围、无模糊、无拆零过滤、无采购/失效时间展示）。**新增专用接口**，勿改现有方法签名。

---

## 需求分析要点

- **业务域**: 药库追溯码查询；**前端落在 charge 医保维护域**（与同目录 `traceableCodeUploadManage.vue` 一致）
- **参数体系**: 无系统参数、无页面参数
- **数据流**: 只读 `DRU_DRUG_BARCODE_USED_RECORD`，`valid_flag='1'`
- **库存单元**: 固定下拉 + 允许「全部」查全院；默认当前科室名称对应项（实现时维护 code-name 映射表）
- **采购时间 SQL 要点**:  
  `(select min(r2.operated_time) from dru_drug_barcode_used_record r2 where r2.barcode=t.barcode and r2.drug_code=t.drug_code and r2.type='1' and r2.valid_flag='1') purchaseTime`（具体关联键实现时与产品再对齐 barcode 是否足够）
- **失效时间**: 仍关联 `DRU_DRUG_STORE.invalid_date`（用户未改此项）
- **导出**: 查询后另发请求拉全量（`pageNum=1, pageSize=total`）再 `tableToExcel`；总量过大时 Step 6 评估是否加后端导出

### 记忆库命中

| case | 可复用结论 |
|------|------------|
| 无直接 case | — |
| [202505](cases/2026-06-dispense-pool-release-skip-valid-check.md) | charge-service 后端改动模式 |
| 同目录 `traceableCodeUploadManage.vue` | healthMaintainManage 页面风格、DrugRetraceInfo、分页 |

### MCP 字段核验

- **状态**: ✅ 已复核（2026-06-15，MCP `get_table_schema` 测试库）

#### `DRU_DRUG_BARCODE_USED_RECORD`（主表）

| SQL 使用列 | MCP | 说明 |
|------------|-----|------|
| KEY_ID, DRUG_CODE, STORE_CODE, BARCODE | ✅ | 主键/查询/展示 |
| TYPE, OPERATED_TIME, VALID_FLAG | ✅ | 操作类型/时间/有效过滤 |
| IO_APPLY_NO, APPLY_NO | ✅ | 单据号 |
| BATCH_NUMBER | ✅ | 关联库存（可空，失效时间可能缺） |
| DISMANTLE_FLAG | ✅ | 拆零查询 |
| INSUR_EVENT_NO, INSUR_SETTLE_NO | ✅ | 医保 ID |

#### `DRU_DRUG_STORE`（失效时间）

| SQL 使用列 | MCP | 说明 |
|------------|-----|------|
| STORE_CODE + BATCH_NUMBER | ✅ | 关联键与现有 Dao 一致 |
| INVALID_DATE | ✅ | 失效时间；采购时间不用 PRODUCE_DATE |

#### `DIC_DRUG_DICT`

| SQL 使用列 | MCP |
|------------|-----|
| DRUG_NAME, DRUG_SPEC, DRUG_UNIT, PACKAGE_UNIT | ✅ |

**结论**: 实现 SQL 列名与测试库一致，无幻觉字段。原 `DRUG_BARCODE_USE_INFO` 表名错误，正确为 `DRU_DRUG_BARCODE_USED_RECORD`。

---

## Spec（Step 5 已确认，可作为 Step 6 实现依据）

### 涉及子仓库

- [x] `onelink-web-his-charge-fj-common`：新建 `traceCodeUsageQuery.vue` + `DrugRetraceInfo.js` 新方法
- [x] `onelink-micro-charge-fj-common`：新增分页查询接口 + SQL（可选全量导出同 SQL 无分页）

### 后端改造

1. **新增** `getTraceCodeUsageRecordList`（Controller/Service/Dao/XML）  
   - 入参: `startDate`, `endDate`, `storeCode`（空=全院）, `drugCode`, `barcode`, `type`, `docNo`（匹配 `io_apply_no` 或 `apply_no`）, `insurEventNo`, `insurSettleNo`, `dismantleFlag`, `Page`  
   - 主表 `t`: `valid_flag='1'`, `operated_time` 区间  
   - 模糊: `drug_code`, `barcode`, 单据号 `like`  
   - 拆零: 勾选时 `dismantle_flag='1'`  
   - 展示: `storeName`, `drugName`, `drugSpec`, `barcode`, 计量单位（拆零 `drug_unit` / 整盒 `package_unit`）, `typeName`, `operatedTime`, 单据号, `insurEventNo`, `insurSettleNo`  
   - **采购时间**: 入库子查询 `type='1'` 的 `operated_time`  
   - **失效时间**: `DRU_DRUG_STORE.invalid_date`  
   - 排序: `operated_time desc`

2. **导出支持**: 同一查询条件，`pageSize` 传总条数或 `exportFlag=1` 跳过分页上限（Step 6 择一）

### 前端改造

1. 新建 `pages/insurance/healthMaintainManage/traceCodeUsageQuery.vue`  
   - 参考 `traceableCodeUploadManage.vue`（`zoehis-table` + `pageflag` + `DrugRetraceInfo` mixin）  
   - `:strip-arr="[100,500,1000,2000,5000]"`，默认 500  
   - 库存单元固定 `selectdata`（含「全部」）  
   - 操作类型彩色标签、追溯码省略、失效 90 天红色、医保 ID 空「—」  
2. `DrugRetraceInfo.js` 新增 `getTraceCodeUsageRecordList`  
3. **导出**: 按当前条件二次请求全量 → `zoehisFunc.tableToExcel`  
4. **重置**: 当月日期 + 默认库存单元（当前科室对应项）

### 验收要点

- [ ] 6 项查询决策均满足（含全院、固定列表、入库采购时间、全量导出）
- [ ] 分页与表格列与原型一致
- [ ] 不影响 `getDrugBarcodeUseInfoList` 等现有接口

### Commit 标题（占位）

`[******]【项目名称】追溯码使用记录查询`

---

## 人工审核意见（选填）

> 2026-06-15 用户确认：禅道******；页面 charge/insurance/healthMaintainManage；库存单元固定列表；采购时间=入库operated_time；导出=查询条件全量；允许全院查询。
