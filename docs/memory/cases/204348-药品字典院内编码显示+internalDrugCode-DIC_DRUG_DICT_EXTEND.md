# [204348] 药品字典显示界面新增院内药品编码
> **文件名**：`204348-药品字典院内编码显示+internalDrugCode-DIC_DRUG_DICT_EXTEND.md`


> 状态：`verified`（漳州二院 release-1.166 已发布，charge tag **release-1.166.156** @ `e75c516eb5`）
> 日期：2026-07-02  
> 域：药库 / 字典维护

---

## 背景

- **需求**：药品字典**显示界面**（左侧树 + 右侧药品列表）新增 **院内药品编码** 列
- **数据来源**：`ZOEDICT.DIC_DRUG_DICT_EXTEND.INTERNAL_DRUG_CODE`
- **开关**：**页面参数** `$getPageControlMap(configId)`，key `select_internal_drug_code_flag`（state=1 显示列并查扩展表；与库存查询页命名一致）
- **仓库**：
  - 前端 `onelink-web-his-drug-fj-common` — `a798937a`
  - 后端 charge `onelink-micro-charge-fj-common` — `e75c516eb5`
  - 实体 optimus `onelink-micro-optimus-fj-common` — `00f43c55`（`DrugDict.internalDrugCode`）

## 涉及文件

| 层 | 路径 |
|----|------|
| 页面 | `pages/drugDictionaryManage/medicineMaintain.vue`（`medicineMaintainNew.vue` 若启用需对称改） |
| API | `api/charge-service/dict/Drug.js` → `getDrugInfoByTreeNode` |
| Controller | `DrugManagerController.getDrugInfoByTreeNode` |
| 入参 POJO | `DrugTreeParam.isSelectInternalDrugCodeFlag` |
| SQL | `DrugManagerDao.xml` → `getDrugInfoByTreeNode` |
| 返回实体 | optimus `DrugDict.internalDrugCode` |
| **参考** | `storeQuery/index.vue` + `DrugStoreDao.xml` 已有同字段子查询 |

## 实现要点

### 页面参数（三步）

1. `data()`：`isSelectInternalDrugCodeFlag: false`
2. `getPageControl()`：`map[configId].select_internal_drug_code_flag`，state==1 → true
3. flag 为 true：表格列 `internalDrugCode`；请求体带 `isSelectInternalDrugCodeFlag: true`

### 后端 SQL（条件子查询）

```xml
<if test="params.isSelectInternalDrugCodeFlag != null and params.isSelectInternalDrugCodeFlag == true">
(select te.INTERNAL_DRUG_CODE from ZOEDICT.DIC_DRUG_DICT_EXTEND te
 where b.drug_code = te.drug_code) "internalDrugCode",
</if>
```

- 参数关时不查扩展表，避免无谓 JOIN/子查询
- **不涉及**系统参数 jsonl

## 运维

- 药品字典维护菜单 configId 下配置 `select_internal_drug_code_flag`，state=1

## 测试要点

1. 参数关：列表无「院内药品编码」列，接口不返回 `internalDrugCode`
2. 参数开：列展示，值与 `DIC_DRUG_DICT_EXTEND.INTERNAL_DRUG_CODE` 一致
3. 无扩展记录药品：列空，不报错

## 关联 commit / tag

| 仓库 | Commit | Tag |
|------|--------|-----|
| charge | `e75c516eb5` | release-1.166.156 |
| drug 前端 | `a798937a` | （随 release-1.166 分支） |
| optimus | `00f43c55` | （随 release-1.166 分支） |

## 可复用结论

- 字典列表「按需查扩展表字段」= **页面参数 + 入参布尔 + MyBatis `<if>` 条件子查询**（对齐库存查询页）
- 跨仓：`DrugDict` 在 **optimus**，SQL/Controller 在 **charge**，页面在 **drug 前端**

## 升格建议

- [ ] workflow
- [ ] skill / patterns
- [x] rule — 已有 `zoehis-sys-param` 页面参数模式
- [x] 无需升格，保留 case 即可
