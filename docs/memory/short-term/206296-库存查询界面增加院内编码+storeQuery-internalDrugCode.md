# [206296] 库存查询界面增加院内编码

> **文件名**：`206296-库存查询界面增加院内编码+storeQuery-internalDrugCode.md`  
> **短期记忆**：需求进行中临时文件；Step 12 沉淀长期 case 后 **删除本文件**。  
> 日期：2026-07-09  
> 状态：`analyzing`

---

## 需求摘要

- **任务类型**：功能修改
- **禅道 / 项目**：206296 / 漳州二院
- **页面 / 菜单**：药库前端 → 库存查询（`pages/stockBillManage/storeQuery/index.vue`）
- **需求描述**：库存查询界面增加院内编码列

---

## 代码地图（Step 4 产出）

| 仓库 | 路径 | 角色（页面/API/Service/SQL） | 置信度 |
|------|------|------------------------------|--------|
| `onelink-web-his-drug-fj-common` | `pages/stockBillManage/storeQuery/index.vue` | 库存查询主页面：读取页面参数 `select_internal_drug_code_flag`，控制列配置并透传给子表 | 高 |
| `onelink-web-his-drug-fj-common` | `pages/stockBillManage/storeQuery/module/drugCollectTable.vue` | 汇总表：动态插入 `internalDrugCode` 列，请求带 `isSelectInternalDrugCodeFlag` | 高 |
| `onelink-web-his-drug-fj-common` | `pages/stockBillManage/storeQuery/module/detailTable.vue` | 明细表：通过父组件 `configs` 接收列配置，请求带 `isSelectInternalDrugCodeFlag` | 高 |
| `onelink-web-his-drug-fj-common` | `api/charge-service/dict/drug/Store.js` | 前端 API：`getDrugStoreList` post 请求 | 高 |
| `onelink-micro-charge-fj-common` | `.../dict/web/drug/DrugStoreController.java` | Controller：`/getDrugStoreList` 接收 `isSelectInternalDrugCodeFlag` | 高 |
| `onelink-micro-charge-fj-common` | `.../dict/service/drug/impl/DrugStoreServiceImpl.java` | Service：透传参数到 DAO | 高 |
| `onelink-micro-charge-fj-common` | `.../mappings/dict/drug/DrugStoreDao.xml` | SQL：`getDrugStoreListCollect` / `getDrugStoreListDetail` 等按 flag 子查询 `DIC_DRUG_DICT_EXTEND.INTERNAL_DRUG_CODE` | 高 |
| `onelink-micro-optimus-fj-common` | `.../entity/dict/drug/DrugDict.java` | 实体：`internalDrugCode` 字段 | 高 |

### 调用关系

```
storeQuery/index.vue
  ├─→ drugCollectTable.vue ──→ Store.getDrugStoreList ──→ DrugStoreController.getDrugStoreList
  │                                                          ↓
  └─→ detailTable.vue     ──→ Store.getDrugStoreList ──→ DrugStoreServiceImpl.getDrugStoreList
                                                               ↓
                                                        DrugStoreDao.xml (getDrugStoreListCollect / getDrugStoreListDetail)
                                                               ↓
                                                        ZOEDICT.DIC_DRUG_DICT_EXTEND.INTERNAL_DRUG_CODE
```

---

## 需求分析要点

- **业务域**：药库 / 库存查询
- **参数体系（系统 / 页面 / 无）**：页面参数 `$getPageControlMap(configId)`，key 为 `select_internal_drug_code_flag`，state=1 时显示并查询院内编码列
- **数据流**：
  1. 页面加载时读取当前菜单 configId 下的 `select_internal_drug_code_flag`
  2. flag 为 true 时：
     - `index.vue` 向 `defaultConfigs` push `internalDrugCode` 列（明细表）
     - `drugCollectTable.vue` 在 `getTableData` 时动态 splice `internalDrugCode` 列（汇总表）
     - 两个子表请求均附加 `isSelectInternalDrugCodeFlag: true`
  3. 后端根据 flag 条件子查询 `ZOEDICT.DIC_DRUG_DICT_EXTEND.INTERNAL_DRUG_CODE`，返回 `internalDrugCode`
- **参考 case**：
  - [本地] `docs/memory/cases/204348-药品字典院内编码显示+internalDrugCode-DIC_DRUG_DICT_EXTEND.md` — 禅道#204348 — 药品字典页同字段实现，且明确说明「与库存查询页命名一致」，即库存查询页已实现页面参数 `select_internal_drug_code_flag`

### MCP 字段核验

不涉及新增表/列；`DIC_DRUG_DICT_EXTEND.INTERNAL_DRUG_CODE` 与 `DrugDict.internalDrugCode` 均已从现有源码确认，无需 MCP 核验。

---

## 关键发现

当前代码库中，**库存查询界面的院内编码显示功能已完整实现**，无需新增代码即可工作：

1. `storeQuery/index.vue` 已读取页面参数 `select_internal_drug_code_flag` 并控制列显隐
2. `drugCollectTable.vue`、`detailTable.vue` 已支持 `internalDrugCode` 列
3. 后端 `DrugStoreController` / `DrugStoreServiceImpl` / `DrugStoreDao.xml` 已按 flag 子查询扩展表并返回字段
4. 相关实体 `DrugDict.internalDrugCode` 已存在

---

## 待确认问题

1. **是否为重复需求？**  
   当前 master 代码已完整支持「库存查询界面增加院内编码」。请确认 206296 是否需要：
   - (a) 仅做页面参数配置即可生效（无需改代码）
   - (b) 修复现有实现的问题（如列名显示、查询条件缺失等）
   - (c) 在其它未实现的库存相关页面补充该字段

2. **列名显示**  
   `drugCollectTable.vue` 中 `internalDrugCode` 列默认名称为 `this.$t('common.internalDrugCode', 'internalDrugCode')`，回退值为英文。是否需要统一为中文「院内编码」或「院内药品编码」？

3. **是否需要按院内编码查询**  
   当前实现仅作为展示列，未在搜索区增加「院内编码」输入条件。需求是否包含查询过滤？

4. **发布范围**  
   若无需改代码，请确认漳州二院测试/生产环境的菜单页面参数是否已配置 `select_internal_drug_code_flag`（state=1）。

---

## Spec（Step 5 填写）

> 鉴于 Step 4 发现功能已完整实现，**建议先确认待确认问题后再决定是否进入 Step 6**。若确认为无需改代码，可直接关闭本需求；若确认需要修复/扩展，再补充本 Spec 章节。

### 改造计划（待定）

#### 涉及子仓库

- [ ] 待定

#### 文件清单

| 仓库 | 路径 | 改动类型 |
|------|------|----------|
| 待定 | 待定 | 待定 |

#### 数据库

不涉及新增表/列。

#### 参数

| 参数名 | 类型（系统参数/页面参数） | 默认值 | 说明 |
|--------|--------------------------|--------|------|
| `select_internal_drug_code_flag` | 页面参数 | state=0 关闭 | 库存查询菜单 configId 下配置，state=1 显示院内编码列 |

#### 数据流变更

无需变更（已实现）。

#### 待确认问题

见上文「待确认问题」。

---

## 外部编辑器交接

【来自 Trae/CodeBuddy 初步分析 — 请在 Cursor 从 Step 5 继续】

【禅道&项目】
206296【漳州二院】库存查询界面增加院内编码

【短期记忆文件】
docs/memory/short-term/206296-库存查询界面增加院内编码+storeQuery-internalDrugCode.md

【代码地图摘要】
| 仓库 | 路径 | 角色 | 置信度 |
|------|------|------|--------|
| onelink-web-his-drug-fj-common | pages/stockBillManage/storeQuery/index.vue | 主页面/页面参数读取 | 高 |
| onelink-web-his-drug-fj-common | pages/stockBillManage/storeQuery/module/drugCollectTable.vue | 汇总表列/请求 flag | 高 |
| onelink-web-his-drug-fj-common | pages/stockBillManage/storeQuery/module/detailTable.vue | 明细表列渲染 | 高 |
| onelink-web-his-drug-fj-common | api/charge-service/dict/drug/Store.js | 前端 API | 高 |
| onelink-micro-charge-fj-common | .../dict/web/drug/DrugStoreController.java | Controller | 高 |
| onelink-micro-charge-fj-common | .../dict/service/drug/impl/DrugStoreServiceImpl.java | Service | 高 |
| onelink-micro-charge-fj-common | .../mappings/dict/drug/DrugStoreDao.xml | SQL | 高 |
| onelink-micro-optimus-fj-common | .../entity/dict/drug/DrugDict.java | 实体字段 | 高 |

【调用关系】
storeQuery/index.vue → drugCollectTable.vue / detailTable.vue → Store.getDrugStoreList → DrugStoreController → DrugStoreServiceImpl → DrugStoreDao.xml → DIC_DRUG_DICT_EXTEND.INTERNAL_DRUG_CODE

【记忆库命中】
- [本地] docs/memory/cases/204348-药品字典院内编码显示+internalDrugCode-DIC_DRUG_DICT_EXTEND.md — 禅道#204348 — 药品字典页同字段实现，且明确库存查询页参数命名一致

【待确认（请 Cursor spec 前澄清或标注假设）】
1. 当前代码已完整实现该功能，206296 是否为重复需求、修复项还是扩展项？
2. drugCollectTable.vue 中 internalDrugCode 列回退名称为英文，是否需统一为中文？
3. 是否需要增加院内编码查询条件？
4. 生产环境页面参数是否已配置？

【建议复杂度】Trivial（功能已实现，可能仅需配置或微调）

【下一步】
请在 Cursor 与用户确认待确认问题，明确是否需要改代码；如需改代码，再完善 spec 并实现。

---

## 人工审核意见（选填）

> Step 9 人工审查时由用户填写；有内容时 Step 6 须纳入改造范围。

（留空）
