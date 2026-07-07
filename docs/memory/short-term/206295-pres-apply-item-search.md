# [206295] 短期记忆 — 医嘱申请页新增医嘱内容检索框

> **短期记忆**：需求进行中临时文件；Step 12 沉淀长期 case 后 **删除本文件**。  
> 日期：2026-07-03  
> 状态：`implemented`（待 Step 9 人工审查）

---

## 需求摘要

- **任务类型**：功能修改
- **禅道 / 项目**：206295 / 【漳州二院】
- **页面 / 菜单**：医嘱处理 → **医嘱申请** tab（`presHandle.vue` → `applyDoctorAdvice.vue`）
- **核心诉求**：在医嘱申请列表「医嘱内容」列表头新增关键字检索框，交互与行为参考同页 **医嘱查询** tab（`docOderQuery.vue`）
- **截图线索**：红框标注「医嘱查询」tab 的检索框位置；箭头指向医嘱申请表格「医嘱内容」列头，文字「新增检索框，参考医嘱查询页面」

---

## 代码地图（Step 4 产出）

| 仓库 | 路径 | 角色 | 置信度 |
|------|------|------|--------|
| onelink-web-pres-fj-common | pages/presHandle/presHandle.vue | 医嘱处理主页面：tab 切换（label=2 医嘱申请、label=5 医嘱查询） | 高 |
| onelink-web-pres-fj-common | components/presHandle/applyDoctorAdvice.vue | **改动主文件**：医嘱申请 UI + 列表查询逻辑 | 高 |
| onelink-web-pres-fj-common | components/presManage/docOderQuery.vue | **参考实现**：`presItemSearch` 输入框 + `query` 入参 | 高 |
| onelink-web-pres-fj-common | api/pres-service/pres/Apply.js | 前端 API：`getInPatientPrescribes` | 高 |
| onelink-web-pres-fj-common | api/pres-service/pres/Query.js | 参考 API：`getPrescribeRecord`（已支持 `query`） | 高 |
| onelink-micro-pres-fj-common | web/.../ApplyPrescribeController.java | 后端入口：`/pres/apply/getInPatientPrescribes`（**当前无 query 参数**） | 高 |
| onelink-micro-pres-fj-common | service/.../ApplyPrescribeServiceImpl.java | 组装 param Map 调用 Dao（**需透传 query**） | 高 |
| onelink-micro-pres-fj-common | resources/mappings/.../PresApplyRecordsDao.xml | `getInPatientPrescribes` SQL（Oracle + dm 双份，**需加 query 条件**） | 高 |
| onelink-micro-pres-fj-common | resources/mappings/.../PrescribeRecordDao.xml | 参考：`getPrescribeRecord` 的 `query` 过滤（ITEM_NAME + SPELL_CODE + WBZX_CODE） | 高 |

### 调用关系

```
presHandle.vue (activeMenu=2)
  → applyDoctorAdvice.vue
    → thead「医嘱内容」列头新增 zoehis-input (presItemSearch)
    → getInPatientPrescribes() 组装 searchParam + query
      → Apply.js::getInPatientPrescribes
        → ApplyPrescribeController.getInPatientPrescribes
          → ApplyPrescribeServiceImpl.getInPatientPrescribes
            → PresApplyRecordsDao.getInPatientPrescribes
              → PRES_APPLY_RECORDS_POOL a + PRES_INP_PRES_RECORD b (+ 关联表)

参考（医嘱查询 tab，activeMenu=5）：
docOderQuery.vue
  → presItemSearch → Query.getPrescribeRecord({ query })
    → PrescribeRecordDao.getPrescribeRecord（已有 query 条件）
```

### 记忆库命中（本地）

- [本地] [docs/memory/cases/203656-医嘱申请条数停嘱过滤+docOderQuery-applyNum.md](../cases/203656-医嘱申请条数停嘱过滤+docOderQuery-applyNum.md) — 禅道#203656 — 同域「医嘱申请」+ `docOderQuery.vue`；Oracle/dm 双份 SQL 须成对维护
- [本地] [docs/memory/cases/203177-摆药回退连带无需提药+docOderQuery-oneSelfDrugFlag.md](../cases/203177-摆药回退连带无需提药+docOderQuery-oneSelfDrugFlag.md) — 禅道#203177 — 医嘱处理页 `docOderQuery.vue` 回退逻辑

### MCP 字段核验

- Step 4 不涉及 MCP 字段核验（检索字段已从已读 SQL 确认：`b.ITEM_NAME`、药品字典 `SPELL_CODE`/`WBZX_CODE`）
- 实现前 Cursor 可用 `get_table_schema` 复核 `PRES_INP_PRES_RECORD.ITEM_NAME`、`DIC_DRUG_DICT.SPELL_CODE`

---

## 需求分析要点

### 业务域

- 住院 / 医嘱处理 / 医嘱申请（护士站申请摆药/诊疗执行）

### 参考实现差异（已读源码）

| 项 | docOderQuery（医嘱查询） | applyDoctorAdvice（医嘱申请，现状） |
|----|--------------------------|-------------------------------------|
| 检索框位置 | thead `.pres_content` 列头内 `zoehis-input` | thead `.td_item` 仅文字「医嘱内容」 |
| data 变量 | `presItemSearch: ""` | **无** |
| 触发方式 | Enter / clear → `changeSearchPresDate` → `refreshEve` | — |
| API | `Query.getPrescribeRecord`，入参 `query: this.presItemSearch` | `Apply.getInPatientPrescribes`，**无 query** |
| 后端 SQL | `PrescribeRecordDao` 已有 `query` 条件 | `PresApplyRecordsDao.getInPatientPrescribes` **无 query 条件** |

**docOderQuery 检索框模板（约 177–182 行）：**

```vue
<th class="pres_content left_padding">
  {{ $t('clinicalProfession.adviceContent','医嘱内容') }}
  <i>
    <zoehis-input v-model="presItemSearch" width="180"
      :placeholder="$t('clinicalProfession.searchPlace','请输入关键字搜索')"
      @clear="changeSearchPresDate" @keyup.enter.native="changeSearchPresDate">
    </zoehis-input>
  </i>
</th>
```

**applyDoctorAdvice 现状（约 175–176 行）：**

```vue
<th class="td_item">{{$t('clinicalProfession.adviceContent','医嘱内容')}}</th>
```

### 参数体系

- **无新增系统参数 / 页面参数**（需求未要求开关；默认全医院生效，与医嘱查询一致）
- 若漳州二院要求仅本院生效，可 Step 5 再议是否加 `$getPageControlMap` 开关

### 数据流

- 只读查询过滤，不涉及池表写、预交金、流水
- 主表：`PRES_APPLY_RECORDS_POOL`（申请池）
- 关联：`PRES_INP_PRES_RECORD`（医嘱记录，含 `ITEM_NAME`）
- 药品拼音：关联 `DIC_DRUG_DICT`（`SPELL_CODE`、`WBZX_CODE`）

### 建议实现方案（Step 5 spec 草案）

1. **前端** `applyDoctorAdvice.vue`
   - 在 thead「医嘱内容」列头复制 docOderQuery 检索框 UI
   - `data` 增加 `presItemSearch: ''`
   - `getInPatientPrescribes` 组装参数时增加 `query: this.presItemSearch`
   - Enter / clear 触发 `handleRefresh`（或独立方法调 `getInPatientPrescribes`）
   - 切换病人/树勾选时清空 `presItemSearch`（对齐 docOderQuery 在 `treeNodeSelect` 等处清空逻辑）

2. **后端** `ApplyPrescribeController` / `ApplyPrescribeService(Impl)`
   - 方法签名增加 `String query`
   - `param.put("query", query)`

3. **SQL** `PresApplyRecordsDao.xml`
   - Oracle 默认 + `databaseId="dm"` 两处 `getInPatientPrescribes` 均增加 query 条件
   - 参考 `PrescribeRecordDao` 模式：`b.ITEM_NAME like` + 药品 `SPELL_CODE`/`WBZX_CODE`（子查询或 join，与现有 SQL 风格一致）
   - **成对维护 dm/Oracle**（见 case 203656）

4. **不改** `Apply.js`（POST body 自动透传新字段）

---

## Spec（Step 5 — 待用户确认）

> 复杂度：**Standard**（2 子仓库；前端 1 组件 + 后端接口/SQL）

### 待确认问题 — 默认结论（对齐医嘱查询 tab）

| # | 问题 | **默认方案** | 依据 |
|---|------|-------------|------|
| 1 | 非药品拼音检索 | **与医嘱查询一致**：药品走 `DIC_DRUG_DICT`（名称+拼音+五笔）；非药品走 `DIC_CLINIC_ITEM_DICT`（名称+拼音+五笔）；兜底 `b.ITEM_NAME` | `PrescribeRecordDao.xml` 8751–8775 行 `getPrescribeRecord` 已有实现 |
| 2 | 触发时机 | **Enter + 清空** 触发查询；输入过程不实时搜 | `docOderQuery.vue` `@keyup.enter.native` + `@clear` |
| 3 | 中药过滤 | **按当前行 `b.ITEM_NAME` 过滤**（明细级）；不做整方聚合特殊逻辑 | 申请列表每行对应 pool+record 明细，与查询页一致 |
| 4 | 页面参数开关 | **不加**；全医院生效 | 需求未要求；与医嘱查询一致 |

若以上默认方案无异议，回复「**spec 确认**」后进入 Step 6 实现。

---

## 改造计划

### 涉及子仓库

- [ ] `onelink-web-pres-fj-common`：医嘱申请页 UI + 传参
- [ ] `onelink-micro-pres-fj-common`：接口透传 `query` + SQL 过滤（Oracle + dm）

### 文件清单

| 仓库 | 路径 | 改动类型 |
|------|------|----------|
| onelink-web-pres-fj-common | `components/presHandle/applyDoctorAdvice.vue` | 列头检索框、`presItemSearch`、传参、清空逻辑 |
| onelink-micro-pres-fj-common | `.../ApplyPrescribeController.java` | 入参增加 `String query` |
| onelink-micro-pres-fj-common | `.../ApplyPrescribeService.java`（api 接口） | 方法签名增加 `query` |
| onelink-micro-pres-fj-common | `.../ApplyPrescribeServiceImpl.java` | 透传 `param.put("query", query)` |
| onelink-micro-pres-fj-common | `.../PresApplyRecordsDao.xml` | `getInPatientPrescribes` Oracle + dm 增加 query 条件 |

**不改：** `api/pres-service/pres/Apply.js`（POST 自动透传新字段）

### 数据库

| 表名 | 操作 | 说明 |
|------|------|------|
| `PRES_APPLY_RECORDS_POOL` | SELECT 条件扩展 | 只读过滤，无写 |
| `PRES_INP_PRES_RECORD` | SELECT 条件扩展 | `b.ITEM_NAME` / `b.ITEM_CODE` |
| `DIC_DRUG_DICT` | SELECT 子查询 | 药品名/拼音/五笔 |
| `DIC_CLINIC_ITEM_DICT` | SELECT 子查询 | 诊疗项名/拼音/五笔 |

无 DDL、无新表。

### 参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| — | — | — | **无新增**系统/页面参数 |

### 数据流变更

```
用户输入 presItemSearch → Enter/clear
  → applyDoctorAdvice.getInPatientPrescribes({ ...searchParam, query })
    → ApplyPrescribeController(query)
      → PresApplyRecordsDao.getInPatientPrescribes
        → WHERE 增加 query 过滤（药品字典 / 诊疗字典 / ITEM_NAME）
```

### 前端改动要点（applyDoctorAdvice.vue）

1. **模板**：`th.td_item` 内嵌 `zoehis-input`，复制 docOderQuery 样式（width=180、placeholder 国际化 key `clinicalProfession.searchPlace`）
2. **data**：`presItemSearch: ''`
3. **方法**：
   - `changePresItemSearch()` → 调 `handleRefresh()`（等同 docOderQuery 的 `changeSearchPresDate` → `refreshEve`）
   - `getInPatientPrescribes` 组装 `p` 时增加 `query: this.presItemSearch`
4. **清空时机**：`treeCheckboxChange` 切换勾选病人时 `this.presItemSearch = ''`（对齐 docOderQuery 换树节点清空）

### 后端改动要点

1. **Controller / Service / Impl**：全链路增加 `String query` 参数，`param.put("query", query)`
2. **PresApplyRecordsDao.xml**：在 Oracle 默认与 `databaseId="dm"` 两处 `getInPatientPrescribes` 的 `ORDER BY` 前插入（复制 `PrescribeRecordDao.getPrescribeRecord` 8751–8775 行逻辑，别名 `t` → `b`）：

```xml
<if test="params.query != null and params.query != ''">
    AND (EXISTS (SELECT 1 FROM ZOEDICT.DIC_DRUG_DICT dd
        WHERE dd.DRUG_CODE = b.ITEM_CODE AND (dd.DRUG_NAME LIKE ...))
    OR EXISTS (SELECT 1 FROM ZOEDICT.DIC_CLINIC_ITEM_DICT cl
        WHERE cl.CLINIC_ITEM_CODE = b.ITEM_CODE AND (cl.CLINIC_ITEM_NAME LIKE ...))
    OR b.item_name LIKE '%'||#{params.query}||'%')
</if>
```

3. **dm/Oracle 成对维护**（case 203656 约束）

### 验收标准

1. 医嘱处理 → 医嘱申请 tab，「医嘱内容」列头可见关键字输入框
2. 输入关键字按 **Enter** 后，列表仅展示匹配记录（在当前药品/非药品、日期等筛选条件下）
3. **清空**输入框后恢复全量
4. placeholder、Enter/clear 触发方式与医嘱查询 tab 一致
5. 切换左侧树勾选病人时，检索关键字自动清空
6. 药品：支持名称/拼音/五笔；非药品：支持诊疗项名称/拼音/五笔
7. 中药明细行按该行药名可检索到

### 测试要点

- 漳州二院测试库：选有申请记录的患者，分别测药品名、拼音首字母、非药品诊疗项
- 切换药品/非药品 radio 后检索仍生效
- 清空、换病人后列表与关键字状态正确
- Oracle / 达梦环境 SQL 均能执行（双份 XML）

### Git 交付（审查后）

- Commit 标题：`[206295]【漳州二院】医嘱申请页面新增医嘱检索框`
- 关键词 `【漳州二院】` → merge `release-1.166` + 项目分支 tag+1

---

## 外部编辑器交接

Trae/CodeBuddy Step 0–4 已完成；见本文 + 下方 Cursor 交接块。

## 人工审核意见（选填）

> Step 9 人工审查时由用户填写；有内容时 Step 6 须纳入改造范围。

（留空）
