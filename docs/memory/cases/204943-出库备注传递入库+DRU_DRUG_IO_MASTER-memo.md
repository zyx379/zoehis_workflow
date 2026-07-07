# [204943] 出库备注传递到入库可见
> **文件名**：`204943-出库备注传递入库+DRU_DRUG_IO_MASTER-memo.md`


> 状态：`verified`
> 日期：2026-06-24
> 域：药库 / 出入库

---

## 背景

- **需求**：药库出库管理新开单据填写备注后，发送产生的入库单在药库入库管理中应能看到相同备注
- **项目**：【漳州二院】→ `release-1.166`
- **页面/菜单**：药库出库管理（`outStoreNew.vue`）→ 药库入库管理（`inStoreQuery.vue`）
- **仓库**：`onelink-micro-charge-fj-common`（后端单行）；前端已有 memo 列，无需改动

## 根因

`DRU_DRUG_IO_MASTER` 表与 `DrugIoMaster.memo` 字段已存在；出库新开保存备注正常。出库发送时 `DrugStoreServiceImpl.operatorStatus("send")` 创建对应入库单 `newMas`（`io_flag='I'`），未复制 `mas.getMemo()`。

## 改法

`DrugStoreServiceImpl.java` 创建入库单处（`newMas.setSendDeptCode` 之后）：

```java
newMas.setMemo(mas.getMemo());
```

## 数据流

```
出库新开 memo → insert DRU_DRUG_IO_MASTER (io_flag='O')
    ↓ 发送
operatorStatus → newMas (io_flag='I') + setMemo(mas.getMemo())
    ↓
入库查询 getAllInBills → getIoMasterByStatus (t.memo) → inStoreQuery memo 列
```

## Git 交付

| 步骤 | 结果 |
|------|------|
| master | `25c17af58d` `[204943]【漳州二院】出库备注传递到入库可见` |
| release-1.166 | cherry-pick `f906eec146`（全量 merge 冲突多，未用 merge） |
| tag | `release-1.166.141` |

## 复用提示

- 出入库一体化产生对方单据时，检查主表字段是否需从源单复制（memo、配送科室等）
- 列表已查字段但界面无数据 → 先查「创建下游单据」逻辑，再查 SQL/前端列
