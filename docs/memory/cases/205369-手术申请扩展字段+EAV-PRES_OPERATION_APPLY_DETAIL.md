# [205369] 手术申请单增加扩展字段（页面参数 + 细表 EAV）
> **文件名**：`205369-手术申请扩展字段+EAV-PRES_OPERATION_APPLY_DETAIL.md`


> 状态：`verified`
> 日期：2026-06-26
> 域：住院 / 手术申请
> 项目：漳州市医院
> 发布 tag：后端 `release-1.168.56`、医嘱前端 `release-1.168.39`；cis-common 仅 master

---

## 背景

手术申请单新增 5 个字段：术中是否备血、ABO/Rh 血型、酶免结果、术前医嘱；支持右侧工具栏引用检验/医嘱；ABO/Rh 从 LIS 视图自动带出。

---

## 运维配置（必做）

### 页面参数（显示 + 必填校验统一开关）

| 项 | 值 |
|----|-----|
| 配置入口 | 页面控制 / `$getPageControlMap` |
| **configId** | `130201`（手术申请单，与 `oper_date_default_empty` 等同页） |
| **key** | `operation_apply_extra_fields_flag` |
| **state** | `1` = 显示 5 字段，且字段 1–3（备血/ABO/Rh）保存时必填；`0` 或未配置 = 隐藏且不校验 |
| 代码变量 | `operationApplyExtraFieldsFlag` |

**读取位置（两处）：**

- `components/presManage/operationApplication.vue` → `getMenuCustom()`
- `components/operateManage/operateApplication.vue` → `getMenuCustom()`

```javascript
this.operationApplyExtraFieldsFlag = !$.zoe.isNullOrEmpty(map[configId].operation_apply_extra_fields_flag)
  && map[configId].operation_apply_extra_fields_flag.state * 1 === 1
```

### 引用功能

- **不受** `operation_apply_extra_fields_flag` 控制（路由始终可达；表单不可编辑时不写入）。
- 酶免结果：检验工具栏 `checkout` → `referenceCheckOutData` → 追加到 `enzymeImmunoResult`。
- 术前医嘱：医嘱工具栏 +「术前医嘱」勾选（用药方法含 `OR` 或 `手术`）→ `referenceMedicalOrderData` → 追加到 `preOperatePres`。

### LIS 血型视图（现场 DBA）

接口 `getLisOperationResult` 依赖视图 `zoeview.v_lis_operation_result`，**现场若无此视图需 DBA 创建**（见下文「数据库 / 视图」）。查无记录或 SQL 异常时接口返回空，不报错。

### cis-common

`medicalOrderData.vue` 改动在 npm 包 `onelink-web-cis-common`；项目分支需使用已包含该 commit 的包版本。

---

## 字段定义

| # | 界面标签 | formData / COL_NAME | 控件 | 必填（参数开） |
|---|---------|---------------------|------|----------------|
| 1 | 术中是否备血 | `intraopBloodPrepareFlag`、`intraopBloodPrepareName` | 下拉（复用 cutFlagData） | 是 |
| 2 | ABO血型 | `aboBloodType` | 下拉（未查/A/B/AB/O） | 是 |
| 3 | Rh血型 | `rhBloodType` | 下拉（未查/阴性/阳性） | 是 |
| 4 | 酶免结果 | `enzymeImmunoResult` | 文本 | 否 |
| 5 | 术前医嘱 | `preOperatePres` | 文本 | 否 |

---

## 数据库 / 存储（重要）

### 主表 **不需要** DDL

与 `gluValue`、`diabetesHistory` 等一致，**不走** `PRES_OPERATION_APPLY_MASTER` 增列，而是：

| 表 | 模式 | 说明 |
|----|------|------|
| `ZOEPRES.PRES_OPERATION_APPLY_DETAIL` | **EAV** | `OPERATION_APPLY_NO` + `COL_NAME` + `COL_VALUE` |
| `ZOEPRES.PRES_OPERATION_APPLY_MASTER` | 主表 | 仅 `operationMemo` 等少量列；**本次不改** |

保存时 `OperationApplyDetailServiceImpl.insertOperationApplyDetail` 将 `OperationApplyDetail` 实体反射为多条细表记录：`COL_NAME` = Java 属性名，`COL_VALUE` = 字符串值。

**本次 5 个 COL_NAME（与实体属性一致）：**

```
intraopBloodPrepareFlag
intraopBloodPrepareName
aboBloodType
rhBloodType
enzymeImmunoResult
preOperatePres
```

### 细表查询语法（验证 / 报表）

```sql
-- 按申请单号查扩展字段
SELECT d.COL_NAME, d.COL_VALUE
  FROM ZOEPRES.PRES_OPERATION_APPLY_DETAIL d
 WHERE d.OPERATION_APPLY_NO = :operationApplyNo
   AND d.COL_NAME IN (
         'intraopBloodPrepareFlag', 'intraopBloodPrepareName',
         'aboBloodType', 'rhBloodType',
         'enzymeImmunoResult', 'preOperatePres'
       );

-- 行转列示例（Oracle）
SELECT m.OPERATION_APPLY_NO,
       m.EVENT_NO,
       MAX(CASE WHEN d.COL_NAME = 'aboBloodType' THEN d.COL_VALUE END) AS abo_blood_type,
       MAX(CASE WHEN d.COL_NAME = 'rhBloodType' THEN d.COL_VALUE END) AS rh_blood_type,
       MAX(CASE WHEN d.COL_NAME = 'intraopBloodPrepareFlag' THEN d.COL_VALUE END) AS intraop_blood_prepare,
       MAX(CASE WHEN d.COL_NAME = 'enzymeImmunoResult' THEN d.COL_VALUE END) AS enzyme_immuno_result,
       MAX(CASE WHEN d.COL_NAME = 'preOperatePres' THEN d.COL_VALUE END) AS pre_operate_pres
  FROM ZOEPRES.PRES_OPERATION_APPLY_MASTER m
  LEFT JOIN ZOEPRES.PRES_OPERATION_APPLY_DETAIL d
    ON m.OPERATION_APPLY_NO = d.OPERATION_APPLY_NO
   AND d.COL_NAME IN (
         'intraopBloodPrepareFlag', 'intraopBloodPrepareName',
         'aboBloodType', 'rhBloodType', 'enzymeImmunoResult', 'preOperatePres'
       )
 WHERE m.EVENT_NO = :eventNo
 GROUP BY m.OPERATION_APPLY_NO, m.EVENT_NO;
```

> **说明**：若未来改为 `PRES_OPERATION_APPLY_MASTER` 物理列，才需要 `ALTER TABLE`；当前实现**无需**对业务表执行 DDL。

### LIS 血型视图 DDL（现场库，DBA 执行）

```sql
CREATE OR REPLACE VIEW zoeview.v_lis_operation_result AS
SELECT a.visit_type,
       a.patient_id,
       a.visit_no AS event_no,
       MAX(CASE WHEN b.item_code = '1434' THEN b.item_result END) AS ABO,
       MAX(CASE WHEN b.item_code = '1435' THEN b.item_result END) AS Rh,
       '' AS AMY,
       '' AS SQYZ
  FROM zoeods_lis.lab_report_master@zoehdc a
  JOIN zoeods_lis.lab_report_detail@zoehdc b ON a.bill_no = b.bill_no
 WHERE b.item_code IN ('1434', '1435')
   AND a.report_time >= SYSDATE - 15
   AND a.visit_type IN ('1', '2')
 GROUP BY a.visit_type, a.patient_id, a.visit_no;
```

后端查询（`OperationApplyMasterDao.getLisOperationResult`）：

```sql
SELECT ABO AS "aboBloodType", Rh AS "rhBloodType"
  FROM zoeview.v_lis_operation_result
 WHERE event_no = #{eventNo}
   AND ROWNUM = 1;
```

---

## 涉及仓库 / 文件

| 仓库 | 关键文件 |
|------|----------|
| `onelink-micro-pres-fj-common` | `OperationApplyDetail.java`、`OperationApplyServiceImpl.getLisOperationResult`、`OperationApplyController`、`OperationApplyMasterDao.xml` |
| `onelink-web-pres-fj-common` | `operateApplication.vue`、`operationApplication.vue`、`presMenu*.vue`、`OperationApply.js` |
| `onelink-web-cis-common` | `medicalOrderData.vue`（术前医嘱过滤） |

---

## 引用路由要点

- menuId `130807`（手术申请）：`presMenu` 的 `referenceInspectionData` 按 `type` 分流 → `referenceCheckOutData` / `referenceMedicalOrderData`。
- `doMessageCallback` 增加 `referenceCheckOutData`（`checkoutData.sendRefrenceMsg` 直发）。
- `operationApplication.vue` 挂 `window.presOrderData`，实现上述两个接收方法。

---

## release 合并注意

- `release-1.168` 全量 merge 易冲突，本次采用 **cherry-pick** 功能 commit。
- pres 前端 `operateApplication.vue` / `operationApplication.vue` 与 release 分支需手工合并，保留 release 原有逻辑 + 本需求字段块。

---

## 测试要点

1. 未配页面参数 → 5 字段不显示，保存无新必填报错。
2. `operation_apply_extra_fields_flag=1` → 显示字段；备血/ABO/Rh 保存必填。
3. 有 LIS 视图数据 → 新建单 ABO/Rh 自动带出；无视图/无数据 → 为空不报错。
4. 引用检验 → 酶免结果追加；引用术前医嘱过滤 → 术前医嘱追加。
5. 保存后重开 → 细表 `COL_NAME` 回显正确。

---

## 关联 case

- [202235](2026-06-operationApply-date-default-empty-pageParam.md) — 同页 configId=130201 页面参数模式
- [202860](2026-06-operationApply-status-sync-platoon.md) — 手术申请主表/记录表
- [204961](2026-06-operation-entrust-pres-only-main-name.md) — 手术申请系统参数 vs 页面参数区分
