# [204008] 手术导航术前/术中用药时间默认为空且允许为空（页面参数控制）
> **文件名**：`204008-手术导航用药时间默认为空+drug_time_default_empty-pageParam.md`


> 状态：`verified`
> 日期：2026-06-24（初版 pop）；2026-06-30（扩展列表）
> 域：住院 / 手术
---

## 背景

- **需求**：手术导航界面，通过页面参数 `drug_time_default_empty` 控制「术前用药时间」「术中用药时间」在 **pop 弹窗** 与 **列表列**（已排台内联编辑 / 全部只读）默认为空，完成/保存时允许为空- **页面/菜单**：住院 → 手术导航
- **仓库**：`onelink-web-pres-fj-common`（仅前端）
- **文件**：`pages/operateManage/operationNavigation.vue`

## 问题 / 目标

- 原逻辑（pop）：`showApplyDetail()` 打开可编辑 pop 时 `recordData = Object.assign({}, rowData)`，沿用列表行已有用药时间
- 原逻辑（列表）：`getMainData()` 直接使用接口返回的 `beforeOperateDrugTime` / `operateDrugTime`，参数未覆盖列表展示
- 目标：同一参数 state=1 时 pop 与列表均不显示/不回显原值；完成时不强制填写
## 根因与正确做法

### 参数体系

手术导航（configId=**530101**）开关类配置统一走 **`$getPageControlMap`**，与 `defaultTodayFlag`、`showCompleteSurgeryFlag` 等同文件参数一致。  
**不走** `$getSysParamList`（参见 [202235](2026-06-operationApply-date-default-empty-pageParam.md)）。

### 改动模式

**初版（pop，3 处）** — 与 [202235](2026-06-operationApply-date-default-empty-pageParam.md) 相同：

1. **`data()` 声明** `drugTimeDefaultEmptyFlag`
2. **`pageParameters()` 读取**（configId=530101）`drug_time_default_empty`
3. **`showApplyDetail()`** — `Object.assign` 后清空两字段

**扩展（列表，2026-06-30）** — 抽取公共方法，在数据赋值入口统一清空：

```js
applyDrugTimeDefaultEmpty(item) {
  if (this.drugTimeDefaultEmptyFlag) {
    item.beforeOperateDrugTime = ''
    item.operateDrugTime = ''
  }
  return item
}
```

| 调用点 | 作用 |
|--------|------|
| `getMainData()` | 每行 `operationRecord` 赋入 `data[i]` 后调用 → 已排台（`configsThree` 内联 slot）/ 全部（`configsFive` 只读列）列表默认空 |
| `pageParameters()` | 参数加载后若 `mainData` 已有数据，补清一次（消除首屏与参数加载竞态） |
| `showApplyDetail()` | 改用 `applyDrugTimeDefaultEmpty(this.recordData)`，行为与初版一致 |

**列表列分布**：`configsTwo`（未排台）**不含**用药时间列；仅 `configsThree` + `configsFive` 需覆盖。
### 校验与后端

- **`checkTime()` / `operationArrange()`**：已是条件校验（`!$.zoe.isNullOrEmpty(...)` 才校验），**无需改动**即可「允许为空」
- **`checkComplete()`**：不含用药时间必填校验
- **后端**：未改。前端传 `''` 时 Dao 仍会更新，Oracle 空串等同 NULL，可清空已有值
### 参数 key 决策

采用单一 key **`drug_time_default_empty`** 同时控制术前/术中（需求对称、运维简单）。

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| 页面控制表 (configId=530101) | 运维配置 | `drug_time_default_empty`，state=1 生效 |
| `PRES_OPERATION_RECORD` | 间接更新 | `BEFORE_OPERATE_DRUG_TIME` / `OPERATE_DRUG_TIME`，经 `updateOperationPlatoon` |
| `OperationRecord.updateOperationPlatoon` | 前端 API | 完成/保存时提交 `recordData` |

## 测试要点

1. state=0 或未配置 → pop / 列表均显示接口原值
2. state=1 → pop 打开、已排台列表内联、全部 tab 只读列均为空
3. state=1 → 不填用药时间点保存/完成成功
4. 手动填写用药时间 → 先后关系/范围校验仍生效
## 关联 commit

| 阶段 | master | tag (release-1.166) |
|------|--------|------------------------|
| 初版 pop | `720a4135` | `release-1.166.28` |
| 扩展列表 | `2218b2de` | `release-1.166.31` |
## 可复用结论

1. **手术导航页面（configId=530101）开关类需求 → `$getPageControlMap`**，与 [202860](2026-06-operationApply-status-sync-platoon.md) 同页
2. **「默认为空」类需求**：在**赋值入口**（`showApplyDetail`、`getMainData`）条件清空，抽取 `applyXxxDefaultEmpty` 复用 pop 与列表；而非改校验逻辑3. **先查现有校验是否已为条件校验**；若已是「非空才校验」，通常无需为「允许为空」再加代码
4. **页面参数 vs 系统参数**：单页 UI 行为 → 页面参数；跨页/后端 SQL → 系统参数（见 Rule `zoehis-sys-param`）

## 关联 case

- [202235 手术申请预计手术时间默认为空](2026-06-operationApply-date-default-empty-pageParam.md) — 同模式，configId=130201
- [202860 手术导航排台状态同步](2026-06-operationApply-status-sync-platoon.md) — 同页面 configId=530101

## 升格建议

- [ ] skill / patterns — 可与 202235 合并为「页面参数默认为空」通用模式
- [ ] workflow — 无需
- [ ] rule — 已有 `zoehis-sys-param`
