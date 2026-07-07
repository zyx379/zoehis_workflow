# [******] 追溯码使用记录查询

> **文件名**：`追溯码使用记录查询+traceCodeUsageQuery-医保追溯.md`（禅道号未知，省略前缀）
> 状态：`verified`（V1 漳州二院 release-1.166 已 cherry-pick；V2 master 已 push）
> 日期：2026-06-15 ~ 2026-06-30
> 域：医保 / 药库追溯
> 页面：医保维护 → 追溯码使用记录查询
> 仓库：`onelink-web-his-charge-fj-common` + `onelink-micro-charge-fj-common`

---

## 改造记录

| 阶段 | 日期 | 说明 |
|------|------|------|
| V1 初版 | 2026-06-15 ~ 2026-06-23 | 新增查询页、高级过滤、导出、调拨/拆零；release-1.166 cherry-pick |
| V2 界面改造 | 2026-06-30 | 药品代码下拉、有效标志/使用状态语义拆分、调拨 TYPE 5/6、防重复调拨 |

---

## 涉及文件

| 层 | 路径 |
|----|------|
| 页面 | `pages/insurance/healthMaintainManage/traceCodeUsageQuery.vue` |
| API | `api/charge-service/drug/DrugRetraceInfo.js`、`api/charge-service/dict/Drug.js`（V2 `getDrugList`） |
| Controller | `DrugRetraceInfoController` → `/getTraceCodeUsageRecordList`、`/transferTraceCode`、`/dismantleTraceCode` |
| Service/Dao | `DrugRetraceInfoService`、`DrugRetraceInfoDao`、`DrugRetraceInfoDao.xml` |
| POJO | `DrugBarcodeUseInfo`（`validFlag` / `useStatus` 等查询字段） |

## 涉及表

| 表 | 用途 |
|----|------|
| `DRU_DRUG_BARCODE_USED_RECORD` | 主查询表 `t` |
| `DIC_DRUG_DICT` | 药品名称/规格/单位 |
| `DIC_DEPT_DICT` | 库存单元名称（`store_code` → `dept_name`） |
| `DRU_DRUG_STORE` | 失效时间子查询 |
| `DIC_BUSINESS_UNIT_DICT` | 医药公司 |

---

## V1 初版（查询页 + 调拨拆零）

### 业务约定

| 项 | 约定 |
|----|------|
| 使用状态（V1） | `DRU_DRUG_BARCODE_USED_RECORD.VALID_FLAG`：`0`=未使用，`1`=已使用；查询参数 `useStatus` |
| 操作类型展示 | 前端 `OP_TYPE_MAP`：1 入库 / 2 出库 / 3 摆药 / 4 退药（不依赖后端 `typeName` 截断） |
| 追溯码列 | 全量展示，不截断 16 位 |
| 调拨 | 仅改 `valid_flag` + 插入出入库类型记录，**不走**完整 `DRU_DRUG_IO_MASTER` 单据流 |
| 拆零 | 调用已有 `addRecordByBarcode`，单选未使用记录 |

### 查询 SQL 要点（`getTraceCodeUsageRecordList`）

- `useStatus`：`0`/`1` 分别过滤 `valid_flag`；空=不过滤（V2 去掉硬编码 `valid_flag='1'`）
- 扩展过滤：`drugName`、`batchNumber`、`boxCode`、`keeper`、`company`、`scanFlag`、入库/失效日期区间等
- 分页：Controller 入参 `DrugBarcodeUseInfo` + `docNo` + `dismantleQueryFlag` + `Page`

### V1 生产踩坑

**1. 日期 `false` 导致 500（traceId `f8b3d0532caff73e`）**

- 根因：`zoehis-date-picker` 清空传 `false`，后端 `Date` 反序列化失败
- 修复：`normalizeDateParam()`，`false`/空 → `null`

**2. 库存单元查不到数据（traceId `d3a550c62995ca13`）**

- 根因：SQL `dept_name` 精确匹配与字典不一致；`getDeptList({ param })` 嵌套错误；曾误传 `storeName` 未传 `storeCode`
- 修复：前端只传 `storeCode`；`v-model` 绑定 `deptCode`；SQL `storeCode` 优先，名称兜底 `instr(#{storeName}, dd.dept_name)=1`

**3. 分页/横向滚动条消失**

- 根因：对 `zoehis-table` 内部做 flex `/deep/` 覆盖
- 正确做法：`class="content_table"` 直接挂 `zoehis-table`；高度 `calc(100% - 42px - 86px)`；禁止父级 flex + overflow 深度改写表格内部

### V1 发布

| 仓 | 方式 | 说明 |
|----|------|------|
| 后端 master | `4f547ed225` | 未知项目 |
| 前端 master | `3e4b1223` | tag `release-0.0.1376` |
| 后端 release-1.166 | cherry-pick 4 commit | tip `d25a6fd8e1`，tag **`release-1.166.143`** |
| 前端 release-1.166 | cherry-pick 9 commit | tip `e5dbaa74`，tag **`release-1.166.48`** |

**cherry-pick 注意**：首 commit `604baf6bbb` bundled 无关接口，冲突时**只保留追溯码相关方法/SQL**。

---

## V2 界面改造（有效标志 / TYPE 语义 / 调拨 5/6）

### 业务约定（最终）

| 项 | 约定 |
|----|------|
| 有效标志 | `VALID_FLAG`：0 无效 / 1 有效；入参/出参 `validFlag` |
| 使用状态 | 按 `TYPE`：1/5/6=未使用(0)，2/3/4=已使用(1)；入参/出参 `useStatus` |
| 药品代码 | 前端 `Drug.getDrugList` 下拉单选；SQL `drug_code =` 精确匹配 |
| 调拨写入 | 源库存单元 TYPE **6**（调拨出库）；目标库存单元 TYPE **5**（调拨入库） |
| 调拨前置校验 | `valid_flag=1` 且 TYPE∈{1,5,6}；**同 barcode + 源 store_code 不得已有 TYPE=6** |
| TYPE=1 操作时间 | 调拨时 **不修改** TYPE=1 记录的 `operated_time`（仅 `updateTraceCodeValidFlag`） |
| TYPE=5/6 源行 | 调拨更新源行仍走 `updateTraceCodeUsageStatus`（含操作时间） |
| 操作类型展示 | 前端 `OP_TYPE_MAP` 补 5 调拨入库、6 调拨出库 |

### V2 生产踩坑

**1. 同科室可重复调拨**

- 根因：调拨后 TYPE 仍为 1/5/6 → 使用状态仍「未使用」；`valid_flag` 仍为 1
- 修复：`countTraceCodeTransferOut(barcode, storeCode)`，已存在 TYPE=6 则抛错

**2. TYPE=1 操作时间被改写**

- 初版批量 `updateType1OperatedTime`；**最终** TYPE=1 仅 `updateTraceCodeValidFlag`，不改 `operated_time`

**3. 药品下拉数据源**

- `Drug.getDrugClinic` 需 patientId，不适用；采用 `Drug.getDrugList`（`itemType=0` + 分页），参考 `drugPriceAdjust.vue`

### V2 发布（master）

| 仓 | commit | 说明 |
|----|--------|------|
| 后端 | `c5976e88c9` | 界面改造主功能 |
| 前端 | `43238ab7` | 界面改造主功能 |
| 后端 | `dfc60f6118` | TYPE1 不改时间 + 同科室防重复调拨 |

无医院关键词 → 未 merge release-1.166/1.168。

---

## 测试要点

1. 默认当月操作时间，查询有数据
2. 库存单元下拉选带院区后缀名称能查到记录
3. 有效标志 / 使用状态 过滤与列表列独立（V2）
4. 药品下拉精确查（V2）
5. 高级过滤抽屉条件生效
6. 表格底部分页、横向滚动条正常
7. 调拨后产生 TYPE 5+6；TYPE=1 的 `operated_time` 不变（V2）
8. 同追溯码同库存单元第二次调拨 → 接口拒绝（V2）
9. 拆零：有效且 TYPE 未使用单条
10. 导出 Excel 列与列表一致

## 可复用结论

1. **医保维护列表页 + `zoehis-table` + 双行筛选**：`content_table` 挂表格本体 + `calc(100% - 42px - 标题高)`，勿 flex 深度覆盖表格内部
2. **科室下拉 vs 列表展示名不一致**：库存类过滤优先 **`storeCode`**；名称兜底用 `instr` 前缀匹配
3. **`Dept.getDeptList` 传参扁平**，禁止 `{ param: { ... } }` 嵌套
4. **日期范围入参**：`zoehis-date-picker` 清空可能为 `false`，提交前转 `null`
5. **使用状态按 TYPE 计算时**，不能单靠 `valid_flag` 限制调拨；需 TYPE=6 等业务痕迹二次校验
6. **调拨类写操作**：明确哪些 TYPE 允许改 `operated_time`，TYPE=1 入库记录通常保持原入库时间
7. **无读卡页药品下拉**：用 `Drug.getDrugList`，勿用 `getDrugClinic`
8. **无医院关键词 commit 合并 release-1.166**：按追溯相关 commit cherry-pick，勿全量 merge master

## 关联

- Rule：`zoehis-git-branch`（release-1.166 / release-0.0 打 tag）
- Skill：`zoehis-git-ops`（未知项目 `release-0.0.{max+1}` on master）
- 参考页：`traceableCodeUploadManage.vue`、`insuranceMedicalInventory.vue`

## 升格建议

- [ ] skill — 「zoehis-table 列表页布局」短 pattern（content_table + calc 高度）
- [ ] skill — cherry-pick 到 release 时 bundled commit 冲突取舍
- [x] rule — 未知项目 `release-0.0` tag（已写入 `zoehis-git-ops` / `zoehis-git-branch`）
