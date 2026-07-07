# [205101] 库存预警可分配库存口径调整
> **文件名**：`205101-库存预警可分配库存口径+distributableQuantity-theWarn.md`


> 状态：`verified`
> 日期：2026-06-25
> 域：药库 / 库存预警

---

## 背景

- **需求**：库存预警判断由账面库存改为可用（可分配）库存；列表在库存列后展示「可用库存」；库存与上期耗量比分子改为预警口径库存
- **项目**：【苏颂】（无 release-1.166/1.168 关键词 → master `release-0.0.*` tag）
- **页面/菜单**：药库 → 库存预警（`pages/stockBillManage/earlyWarning.vue`）
- **仓库**：`onelink-micro-charge-fj-common`（后端 + 系统参数）；`onelink-web-his-drug-fj-common`（前端列）

## 调用链

```
earlyWarning.vue (filterData → getMainGridData)
  → Drug.theWarn API (/charge-service/api/dict/drug/theWarn)
    → DrugManagerController.theWarn
      → DrugManagerServiceImpl.theWarn
        → DrugManagerDao.theWarn (SQL)
          ← Dru_Drug_Store.quantity + DRU_DRUG_DIST_STORE.distributable_quantity
```

## 改法

### 系统参数（兼容其他医院）

| 参数名 | 默认值 | 说明 |
|--------|--------|------|
| `dru_the_warn_use_distributable_stock` | `0` | `1`=预警判断与耗量比用可分配库存；`0`/空=账面库存（原逻辑） |

### 库存口径

| 字段 | 来源 | 含义 |
|------|------|------|
| `quantity` / `allQuantity` | `Dru_Drug_Store.quantity` 汇总 | 账面库存（本单元/全院） |
| `distributableQuantity` / `allDistributableQuantity` | `DRU_DRUG_DIST_STORE.distributable_quantity` 汇总 | 可分配/可用库存 |

后端在 `theWarn` 入口读取参数后抽象：

```java
boolean useDistributableStock = "1".equals(druTheWarnUseDistributableStock);
Double warnStock = useDistributableStock ? distributableQuantity : quantity;
Double warnAllStock = useDistributableStock ? allDistributableQuantity : allQuantity;
```

所有预警类型（最低/最高/标准/库存为0/全院最低/耗量及 `consumptionFlag` 分支）及 `inventoryToPrevious` 均改用 `warnStock` / `warnAllStock`。

### 后端改动（2 文件 + jsonl）

1. **DrugManagerServiceImpl.theWarn**：恢复 `distributableQuantity` 读取；新增 `allDistributableQuantity`；预警逻辑统一走 `warnStock`/`warnAllStock`
2. **DrugManagerDao.xml**：新增 `allDistributableQuantity` 子查询（全院可分配库存，含院区过滤、`INVALID_DATE>sysdate`）

### 前端改动

`earlyWarning.vue` `mainTableConfigs`：

- 在 `packQuantity`（库存数量）后插入 `distributableQuantityStr`，列名「可用库存」
- 原 sortNo:25「可分配库存数量」列 `validFlag` 改为 `0`（避免重复展示）
- `getMainGridData` 已有 `$drugUnitConversion(data[i], 2)` 生成 `distributableQuantityStr`，无需改数据处理

## 数据流

```
参数=0：预警判断 quantity/allQuantity → 与原行为一致
参数=1：预警判断 distributableQuantity/allDistributableQuantity
前端：无论参数值，均展示账面库存 + 可用库存两列
```

## Git 交付

| 仓库 | 步骤 | commit |
|------|------|--------|
| onelink-micro-charge-fj-common | master 功能 | `dc255a7357` `[205101]【苏颂】库存预警可分配库存口径调整` |
| onelink-micro-charge-fj-common | master 参数 | `8b72103ffb` `[*111111*]增加系统参数【dru_the_warn_use_distributable_stock】【205101】` |
| onelink-web-his-drug-fj-common | master 功能 | `aad2498f` `[205101]【苏颂】库存预警可分配库存口径调整` |
| onelink-micro-charge-fj-common | tag | `release-0.0.2702` 起含本次提交 |

## 踩坑

1. **分析阶段误判 SQL bug**：`distributableQuantity` 子查询中 `dds.store_code` 疑似未定义；实际交付未改该段，新增的是 `allDistributableQuantity` 独立子查询
2. **不宜硬切口径**：需求虽写「改为可用库存」，实现用系统参数开关，默认 `0` 保持账面库存，苏颂现场配 `1` 生效
3. **全院预警须成对**：`boomType=6` 全院最低限量除单元 `warnStock` 外，须同步 `allDistributableQuantity` 与 `warnAllStock`
4. **前端列复用**：`distributableQuantityStr` 列已存在（原靠后隐藏），改 sortNo 插入库存列后并禁用旧列即可，不必新字段

## 测试要点

1. 参数 `dru_the_warn_use_distributable_stock=0`：预警结果与改前一致（账面库存口径）
2. 参数 `=1`：最低/最高/标准/零库存/全院最低/耗量预警均按可分配库存判断；耗量比分子为可分配库存
3. 列表「库存数量」与「可用库存」两列均有值；`$drugUnitConversion` 换算显示正确
4. 全院最低限量：参数=1 时对比 `allDistributableQuantity`

## 关联

- [202505] 配药池释放库存 — 同药库域、`DRU_DRUG_DIST_STORE` 可分配库存概念
- Rule `zoehis-sys-param.mdc` — 参数 jsonl 单独 commit

## 可复用结论

- 库存预警后端入口 `DrugManagerServiceImpl.theWarn`；账面/可分配口径用 `warnStock` 抽象，避免各 `boomType` 分支重复改
- 可用库存 = `DRU_DRUG_DIST_STORE.distributable_quantity` 按 store+batch 汇总；前端 flag=2 的 `$drugUnitConversion` 即同口径展示
- 跨医院需求优先「系统参数 + 默认原逻辑」，而非直接替换 `quantity`

## 升格建议

- [ ] workflow
- [ ] skill / patterns（可补充 common-patterns § 库存预警口径切换）
- [ ] rule
- [x] 无需升格，保留 case + business-rules 速查即可
