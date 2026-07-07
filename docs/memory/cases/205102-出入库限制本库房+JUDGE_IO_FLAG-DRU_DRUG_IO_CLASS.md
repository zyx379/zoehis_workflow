# [205102] 药库/药房出入库限制收货方/发货方不能为本库房
> **文件名**：`205102-出入库限制本库房+JUDGE_IO_FLAG-DRU_DRUG_IO_CLASS.md`


> 状态：`verified`（配置解决，未改代码）  
> 日期：2026-07-02  
> 域：药库 / 出入库

---

## 背景

- **需求**：药库/药房入库管理、药库/药房出库管理，各出入库类型需限制收货方/发货方不能为本库房。
- **项目**：【苏颂】
- **结论**：通过修改 `DRU_DRUG_IO_CLASS` 表配置解决，**未提交代码改动**。

## 问题 / 目标

入库新开弹框中发货方可选到当前科室（本库房），出库新开弹框中收货方可选到本库房，需要限制。

## 根因与正确做法

代码侧已通过 `DRU_DRUG_IO_CLASS.JUDGE_IO_FLAG` 控制是否允许收/发货方等于开单科室：

- `JUDGE_IO_FLAG = '1'`：允许收/发货方为本库房。
- `JUDGE_IO_FLAG ≠ '1'`：禁止收/发货方为本库房。

**前端过滤**：`inStoreNew.vue` / `outStoreNew.vue` 的 `filterRowData` 已按 `judgeIoFlag` 隐藏本库房选项。

**后端校验**：`DrugStoreServiceImpl.saveBillRecord()` 已按 `judgeIoFlag` 抛出异常。

**根因**：现场 `DRU_DRUG_IO_CLASS` 中部分普通出入库类型的 `JUDGE_IO_FLAG` 被配置为 `'1'`，或 `DEFAULT_RECEIVE_DISPATCH` 默认指向了本科室，导致前端可选、后端放行。

**解决方案**：现场 UPDATE 修正配置：

```sql
SELECT IO_CLASS_CODE, IO_CLASS_NAME, IO_FLAG, JUDGE_IO_FLAG, DEFAULT_RECEIVE_DISPATCH, VALID_FLAG
FROM ZOEDRUG.DRU_DRUG_IO_CLASS
WHERE VALID_FLAG = '1'
ORDER BY IO_FLAG, SORT_NO, IO_CLASS_CODE;
```

- 普通采购、调拨等类型：`JUDGE_IO_FLAG` 应置空或 `≠ '1'`。
- 例外类型（盘盈/盘亏 `06/07`、报损 `35`、调账 `48/49`、其他入出库 `18/33` 等）才允许 `'1'`。
- 同步检查 `DEFAULT_RECEIVE_DISPATCH`（`0/null` 不默认、`1` 默认发货方、`2` 默认收货方）是否与业务一致。

## 涉及表 / 接口

| 表 / 接口 | 操作 | 说明 |
|-----------|------|------|
| `ZOEDRUG.DRU_DRUG_IO_CLASS` | SELECT / UPDATE | 单据类型配置表，`JUDGE_IO_FLAG` 与 `DEFAULT_RECEIVE_DISPATCH` 控制是否允许本库房及默认值 |
| `DrugStoreServiceImpl.saveBillRecord()` | 已有校验 | `judgeIoFlag ≠ '1'` 时禁止 consignor/consignee = deptCode |
| `inStoreNew.vue` / `outStoreNew.vue` | 已有过滤 | `filterRowData` 按 `judgeIoFlag` 隐藏本库房 |

## 涉及文件（未改动，仅作为定位参考）

| 仓库 | 路径 | 说明 |
|------|------|------|
| onelink-web-his-drug-fj-common | `components/stockInOutManage/inStoreNew.vue` | 入库新开前端，`filterRowData` / `changeIoClass` |
| onelink-web-his-drug-fj-common | `components/stockInOutManage/outStoreNew.vue` | 出库新开前端，`filterRowData` / `ioClassChange` |
| onelink-micro-charge-fj-common | `.../DrugStoreServiceImpl.java` | 后端保存校验 |

## 关联 commit

- 无代码提交，通过现场配置解决。

## 测试要点

1. 普通采购/调拨类入库：发货方下拉无本库房；保存本库房被后端拦截。
2. 普通出库：收货方下拉无本库房。
3. 盘盈/盘亏/报损/调账等例外类型：仍可选自/发本库房。
4. 配置修正后，前端默认值不再把本库房带入收/发货方。

## 可复用结论

- 药库出入库自库房限制不是硬编码，而是由 `DRU_DRUG_IO_CLASS.JUDGE_IO_FLAG` 配置驱动。
- 遇到"可选到本库房"问题时，优先查表确认 `JUDGE_IO_FLAG` 与 `DEFAULT_RECEIVE_DISPATCH`，而非直接改代码。
- 代码侧的 `filterRowData` + `saveBillRecord` 双重校验已覆盖正常路径。

## 升格建议

- [ ] workflow
- [ ] skill / patterns
- [ ] rule
- [x] 无需升格，保留 case 即可
