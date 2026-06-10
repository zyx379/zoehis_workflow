# [202505] 配药池参数可无效未结算摆药单并释放库存

> 状态：`verified`
> 日期：2026-06-08
> 域：药库 / 摆药

---

## 背景

- **需求**：配药池增加参数可无效未结算摆药单并释放库存。释放库存按钮提示「单据还未过有效期」，增加参数可放开限制
- **项目**：【漳州二院】→ `release-1.166`
- **页面/菜单**：库存查询 → 配药池（`pages/stockBillManage/storeQuery/index.vue`）
- **仓库**：`onelink-micro-charge-fj-common`（后端）；前端仅调用已有 API，无需改动

## 调用链（Codegraph + Shell 定位）

```
前端: pages/stockBillManage/storeQuery/index.vue
  → inventoryReleaseEve() → $api.Store.releaseOutpDrugStore()
API: api/charge-service/dict/drug/Store.js::releaseOutpDrugStore
  → POST /charge-service/api/dict/drug/store/releaseOutpDrugStore
后端: DrugStoreController.releaseOutpDrugStore
  → DrugStoreServiceImpl.releaseOutpDrugStore()
    → BackPackageManageDao.findInvalidOutpLayDrugPoolsByApplys()
      → SQL: APP_OUTP_LAY_DRUG_POOL WHERE VALID_END_TIME < sysdate
异常: BILL_STATUS_NO_NEW_OR_NO_VALIDITY（「单据还未过有效期」）
```

## 改法

### 系统参数

| 参数名 | 默认值 | 说明 |
|--------|--------|------|
| `release_stock_skip_valid_check` | `0` | 1=跳过有效期校验；0/空=保持原逻辑 |

### 后端改动（4 文件 + jsonl）

1. **SystemParmEnum.java**：新增 `RELEASE_STOCK_SKIP_VALID_CHECK` 枚举
2. **DrugStoreServiceImpl.releaseOutpDrugStore**：读取参数，`skipValidCheck = "1".equals(...)`
3. **BackPackageManageDao.java**：方法增加 `@Param("skipValidCheck") boolean skipValidCheck`
4. **BackPackageManageDao.xml**：`VALID_END_TIME < sysdate` 包在 `<if test="skipValidCheck == false">` 内（含 union 零价药分支）

### 数据流

- 参数关闭：仅查 `VALID_END_TIME < sysdate` 的摆药池记录 → 原行为
- 参数开启：跳过有效期条件，仍保留 `LAY_DRUG_STATUS_CODE in ('1','9')` 状态过滤 → 释放库存走原有 `outpLayDrugPool()` 池→归档逻辑

## Git 交付

| 步骤 | 内容 |
|------|------|
| master 功能 | `f8f931f7fc` `[202505]【漳州二院】配药池增加参数可无效未结算摆药单并释放库存` |
| master 参数 | `961ef94ada` `[*111111*]增加系统参数【release_stock_skip_valid_check】【202505】` |
| release-1.166 | cherry-pick 上述 2 commit（全量 merge 冲突多，用 cherry-pick） |
| jsonl 冲突 | 保留双方参数行（gcp + release_stock） |
| tag | `release-1.166.127` |

## 踩坑

1. **Codegraph 自然语言**：「配药池」「释放库存」首次 `codegraph_explore` 无结果；改用 API 方法名 `releaseOutpDrugStore`、`getLayPoolInfo` + Shell `Select-String` 定位
2. **Cursor commit 标题**：`git commit -m` / `filter-branch` 在 Windows Agent 环境易污染标题；改用 `git commit-tree` + `-F .git/COMMIT_MSG_*.txt`（UTF-8 无 BOM）
3. **jsonl 追加**：PowerShell `Add-Content` 可能乱码；用 `[System.IO.File]::AppendAllText(..., UTF8Encoding(false))` 或 Write 工具写单行
4. **release merge**：`release-1.166` 全量 merge master 冲突 40+ 文件 → 改 cherry-pick 本次 2 commit

## 测试要点

1. 参数 `release_stock_skip_valid_check=0`：未过期摆药单点释放库存 → 仍提示「单据还未过有效期」
2. 参数 `=1`：未过期摆药单可释放库存成功
3. 参数未配置/空：与 0 一致，兼容其他医院

## 关联

- [202238] 退药有效期 — 同类「系统参数 + 执行二次校验」模式（`common-patterns` §1.6）
- Rule `zoehis-sys-param.mdc` — 参数 jsonl 单独 commit

## 升格建议

- [x] `common-patterns.md` §1.9 配药池释放库存跳过有效期
- [x] `zoehis-git-ops` Windows commit-tree 交付技巧
