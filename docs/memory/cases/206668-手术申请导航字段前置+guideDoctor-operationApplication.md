# [206668] 手术导航字段前置到手术申请单（页面参数 + EAV）

&gt; **文件名**：`206668-手术申请导航字段前置+guideDoctor-operationApplication.md`
&gt; 状态：`implemented`（待人工审查）
&gt; 日期：2026-07-06
&gt; 域：住院 / 手术申请 / 手术导航
&gt; 禅道 / 项目：206668 / 漳州二院（交付 merge `release-1.166`）

---

## 背景

- **需求**：将手术导航「手术详情」弹窗中的 5 项字段（指导医生1/会诊医生1/会诊医生2/教授专家/实习观摩其他）提前到手术申请单填写，全部非必填，通过页面参数控制显示
- **页面/菜单**：
  - 住院：医嘱 → 手术申请（`operationApplication.vue` → `operateApplication.vue`，configId `130201`）
  - 门诊手术登记（pres 路径）：`operateRegister.vue` / `operateManage.vue` → 共用 `operateApplication.vue`（`outpOrHos=1`，configId `130201`）
  - 不在范围：门诊诊病 `operationApply.vue`（configId `140104`）、滨海版 `operationApplyBHContent.vue`
  - 消费端：手术导航 `operationNavigation.vue`（configId `530101`）
- **仓库**：
  - `onelink-web-pres-fj-common`（前端 UI）
  - `onelink-micro-pres-fj-common`（后端 EAV + 发送写记录）
  - `onelink-micro-charge-fj-common`（不改，导航 update/列已存在）

## 问题 / 目标

### 字段清单（与导航现有 `recordData` 字段名一致）

| # | 界面标签 | code 字段 | name 字段（下拉） | 控件 |
|---|---------|-----------|------------------|------|
| 1 | 指导医生1 | `guideDoctorCode1` | `guideDoctorName1` | 职工下拉 |
| 2 | 会诊医生1 | `guideDoctorCode2` | `guideDoctorName2` | 职工下拉 |
| 3 | 会诊医生2 | `guideDoctorCode3` | `guideDoctorName3` | 职工下拉 |
| 4 | 教授/专家 | `expertPersonnel` | — | 文本 |
| 5 | 实习/观摩/其他人员 | `watchOtherPersonnel` | — | 文本 |

&gt; **命名说明**：`guideDoctorCode2/3` 在导航 UI 上分别标注为「会诊医生1/2」，属历史命名，申请单侧应**沿用同一字段名**以保持与 `PRES_OPERATION_RECORD`、导航回显一致。

### 业务目标

- 让相关人员在**开申请单阶段**即可录入指导/会诊医生等信息，而非等到导航弹窗
- **全部非必填**
- 通过**页面参数**控制显示（未配置/关闭则不显示、不校验）

## 根因与正确做法

### 参数体系

| 项 | 值 |
|----|------|
| 类型 | **页面参数**（单页开关，与 205369/202235 一致） |
| configId | `130201`（手术申请单，含住院与 pres 门诊登记） |
| key | `operation_apply_nav_guide_fields_flag`（勿与 `operation_apply_extra_fields_flag` 混用） |
| state | `1` = 显示 5 字段；`0`/未配 = 隐藏且不校验 |
| 代码变量 | `operationApplyNavGuideFieldsFlag` |
| 必填 | **无** |

### 数据流

1. **保存申请单**：8 个 EAV 项（3 组 code+name + 2 文本）写入 `PRES_OPERATION_APPLY_DETAIL`
2. **发送/审核通过生成记录**：`createOperateRecord` 从 `mergeDetailToMaster1` 合并后的 map 取值，写入 `PRES_OPERATION_RECORD` 对应列
3. **手术导航**：继续读写 `PRES_OPERATION_RECORD`；申请单已填值应在打开弹窗时**自动回显**（依赖步骤 2 同步）
4. **导航侧二次修改**：仍走 charge `update`，与现网一致；以记录表为准

### 与 205369 差异

| 维度 | 205369 | 206668 |
|------|--------|--------|
| 存储 | EAV 细表 | 同左 + **同步手术记录主表** |
| 必填 | 参数开时部分必填 | **全部非必填** |
| 页面参数 key | `operation_apply_extra_fields_flag` | 新 key |
| charge 仓 | 不涉及 | 消费端不变（列已存在） |

## 代码地图

| 仓库 | 路径 | 角色 |
|------|------|------|
| pres 前端 | `components/operateManage/operateApplication.vue` | 手术申请表单主体 UI、`getMenuCustom` 读页面参数、`formData` 保存字段 |
| pres 前端 | `components/presManage/operationApplication.vue` | 住院医嘱手术申请父页，引用 `operate-application`；需同步读参（与 205369 一致） |
| pres 前端 | `pages/operateManage/operateRegister.vue` / `operateManage.vue` | 门诊 `outpOrHos=1` 复用 `operateApplication`，随主组件生效 |
| pres 前端 | `pages/operateManage/operationNavigation.vue` | 字段**现状**所在页（弹窗 + 列表列）；发送后回显依赖 `PRES_OPERATION_RECORD` |
| pres 前端 | `api/pres-service/pres/OperationApply.js` | 保存/查询申请单 API（`baseUrl=/pres-service/api/pres/operationApply/`） |
| pres 后端 | `entity/operation/OperationApplyDetail.java` | EAV 细表实体，反射写入 `PRES_OPERATION_APPLY_DETAIL` |
| pres 后端 | `service/operation/impl/OperationApplyDetailServiceImpl.java` | `insertOperationApplyDetail` EAV 批量插入 |
| pres 后端 | `service/operation/impl/OperationApplyServiceImpl.java` | `mergeDetailToMaster1`、`createOperateRecord`（发送生成手术记录） |
| pres 后端 | `mappings/prescribe/operation/OperateRecordDao.xml` | `insert` → `ZOEPRES.PRES_OPERATION_RECORD`（**当前不含** GUIDE_DOCTOR 列） |
| pres 后端 | `entity/operation/OperateRecord.java` | 手术记录实体（**当前不含** guideDoctor 属性） |
| charge 后端 | `mappings/dict/operation/OperationRecordDao.xml` | 导航排台/登记 `update` 写 `GUIDE_DOCTOR_CODE_1/2/3`、`EXPERT_PERSONNEL`、`WATCH_OTHER_PERSONNEL` |
| charge 后端 | `service/operation/impl/OperationRecordServiceImpl.java` | 导航保存组装 `guideDoctorCode*` / `expertPersonnel` / `watchOtherPersonnel` |

### 调用关系

```
手术申请单 operateApplication.vue
  → OperationApply.save (pres-service)
  → OperationApplyServiceImpl.save
  → OperationApplyDetailServiceImpl.insertOperationApplyDetail
  → ZOEPRES.PRES_OPERATION_APPLY_DETAIL (EAV: COL_NAME/COL_VALUE)

手术申请发送 createOperateRecord (pres-service)
  → mergeDetailToMaster1(主表 + 细表 EAV)
  → OperateRecordDao.insert
  → ZOEPRES.PRES_OPERATION_RECORD  （★ 需扩展：写入 guide 字段）

手术导航 operationNavigation.vue
  → charge-service OperationRecord 查询/更新
  → OperationRecordDao.xml update/select
  → ZOEPRES.PRES_OPERATION_RECORD (GUIDE_DOCTOR_CODE_*, EXPERT_PERSONNEL, WATCH_OTHER_PERSONNEL)
```

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| `PRES_OPERATION_APPLY_DETAIL` | 写 | EAV COL_NAME：`guideDoctorCode1`~`3`、`guideDoctorName1`~`3`、`expertPersonnel`、`watchOtherPersonnel`；无 DDL |
| `PRES_OPERATION_RECORD` | 写 | insert 时写入上述列（列已存在，无 DDL）；导航 update 逻辑不变 |

## 文件清单

| 仓库 | 路径 | 改动类型 |
|------|------|----------|
| pres 前端 | `components/operateManage/operateApplication.vue` | 表单项、formData、init/清空、`getMenuCustom`(130201) |
| pres 前端 | `components/presManage/operationApplication.vue` | `getMenuCustom` 读参（与 205369 一致） |
| pres 后端 | `OperationApplyDetail.java` | +8 属性 |
| pres 后端 | `OperationApplyMaster.java` | +8 属性（createOperateRecord 用） |
| pres 后端 | `OperationApplyServiceImpl.java` | `createOperateRecord` 赋值 guide/expert/watch |
| pres 后端 | `OperateRecord.java` | +guide/expert/watch 属性 |
| pres 后端 | `OperateRecordDao.xml` | insert 补 `GUIDE_DOCTOR_CODE_*`、`EXPERT_PERSONNEL`、`WATCH_OTHER_PERSONNEL` |

## 测试要点

1. **住院**：参数关/开、保存回显、发送后导航回显、导航改后不刷申请单
2. **门诊登记**（`operateRegister`，configId 130201）：同上
3. 全部字段空值可保存、发送，无必填报错
4. 参数关时行为与现网一致

## 关联

- [205369 手术申请扩展字段](cases/205369-手术申请扩展字段+EAV-PRES_OPERATION_APPLY_DETAIL.md) — 直接复用：configId=130201 页面参数 + `OperationApplyDetail` EAV + 双读参模式
- [202235 手术申请预计手术时间默认为空](cases/202235-手术申请预计手术时间默认为空+oper_date_default_empty-pageParam.md) — 手术申请开关统一 `$getPageControlMap('130201')`
- [204008 手术导航用药时间默认为空](cases/204008-手术导航用药时间默认为空+drug_time_default_empty-pageParam.md) — 手术导航 configId=530101 页面参数模式
- [202860 手术导航排台登记状态同步](cases/202860-手术导航排台登记状态同步+PRES_OPERATION_APPLY_RECORD.md) — 导航业务在 charge-service；`PRES_OPERATION_RECORD` 与申请主表通过 `OPERATE_APPLY_NO` 关联

## 可复用结论

1. **手术申请 EAV + 手术记录同步模式**：字段既走 EAV 细表存申请单，又在发送时同步到 `PRES_OPERATION_RECORD` 主表供导航消费；适用于「申请单前置录入 + 导航消费」类需求
2. **页面参数双读参模式**：`operationApplication.vue` 父组件 + `operateApplication.vue` 子组件均需 `getMenuCustom` 读页面参数（与 205369 一致）
3. **字段命名沿用导航侧**：即使 UI 标签不同（如会诊医生 vs guideDoctor），也沿用导航/记录表已有字段名，确保回显一致
4. **charge 仓不动原则**：若导航消费端列已存在且 update 逻辑正常，仅改 pres 侧 insert 即可，无需动 charge 仓

## 升格建议

- [ ] workflow — 手术申请 EAV + 手术记录同步标准流程
- [x] skill — `zoehis-policy-doc6` / 手术申请扩展字段模式补充（与 205369 合并整理）
- [ ] rule — 导航消费端列已存在时仅改 pres 侧的不动 charge 原则
- [ ] 无需升格，保留 case 即可
