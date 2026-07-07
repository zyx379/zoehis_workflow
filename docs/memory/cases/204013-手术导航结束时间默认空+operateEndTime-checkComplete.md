# [204013] 手术导航手术结束时间默认为空且登记时必填
> **文件名**：`204013-手术导航结束时间默认空+operateEndTime-checkComplete.md`


> 状态：`verified`
> 日期：2026-06-24
> 域：住院 / 手术

---

## 背景

- **需求**：手术结束时间打开已排台详情时默认为空；登记（含上下条完成）时必填，保存时非必填
- **页面/菜单**：住院 → 手术导航（已排台 tab）
- **仓库**：`onelink-web-pres-fj-common`（仅前端）
- **文件**：`pages/operateManage/operationNavigation.vue`

## 问题 / 目标

- 原逻辑：`showApplyDetail()` 已排台分支若 `operateEndTime` 为空则赋值为 `operateTime`；`checkComplete()` 无条件校验结束时间必填
- 目标：打开 pop 时结束时间为空；`completeApply(0)` 保存允许空；`type != 0` 登记/完成时必填

## 根因与正确做法

### 改动点（4 处）

1. **删除默认赋值**（`showApplyDetail` 已排台分支）：不再 `operateEndTime = operateTime`
2. **`checkComplete(type)`**：`type != 0` 时才校验 `operateEndTime` 非空（覆盖登记 type=1 及上下条 type=2/3）
3. **`completeApply`**：传入 `type`；维护 `completeType` 控制模板必填星号（`completeType != 0`）
4. **`checkTime`**：术中用药与结束时间范围校验增加 `operateEndTime` 非空条件，避免保存时结束时间为空误拦

### 与 204008 差异

- 204008 用药时间走**页面参数** `drug_time_default_empty`；本需求**无页面参数**，直接改默认与校验逻辑
- 本需求涉及**条件必填**（保存 vs 登记），需 `checkComplete(type)` 与 `completeType` 联动

### 后端

- 未改后端。`PRES_OPERATION_RECORD.OPERATE_END_TIME`（MCP 核验 `NULLABLE=Y`）
- 接口 `OperationRecord.updateOperationPlatoon`，`saveFlag=1` 时允许结束时间为空

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| `PRES_OPERATION_RECORD` | 间接更新 | `OPERATE_END_TIME`，经 `updateOperationPlatoon` |
| `OperationRecord.updateOperationPlatoon` | 前端 API | 保存/登记提交 `recordData` |

## 测试要点

1. 已排台 → 打开详情 → 手术结束时间为空（不随开始时间填充）
2. 结束时间为空 → 点「保存」→ 成功
3. 结束时间为空 → 点「登记」→ 提示不能为空
4. 填写结束时间 → 登记成功
5. 有术中用药、结束时间为空 → 保存不误拦

## 关联 commit

- master: `f2be186c` `[204013]【漳州二院】手术结束时间默认为空且登记时必填`
- release-1.166: merge master
- tag: `release-1.166.29`

## 可复用结论

1. **手术导航已排台 pop**：`completeApply` 的 `type` 语义 — `0=保存`，`1=登记`，`2/3=上下条完成登记`；条件校验用 `type != 0` 与 `checkTime` 对齐
2. **「默认为空」**：在赋值入口（`showApplyDetail`）去掉默认填充，而非仅改校验
3. **「保存可空、登记必填」**：`checkComplete(type)` + 模板 `completeType` 星号；注意 `checkTime` 中依赖结束时间的分支需加非空守卫

## 关联 case

- [204008 术前术中用药时间默认为空](2026-06-operationNav-drug-time-default-empty-pageParam.md) — 同页面，参数控制默认为空
- [202860 手术导航排台状态同步](2026-06-operationApply-status-sync-platoon.md) — 同页 `updateOperationPlatoon`
