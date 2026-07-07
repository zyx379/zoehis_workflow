# [202235] 手术申请预计手术时间为空 — 临床路径 NPE 与选类别自动填时间（闭环）
> **文件名**：`202235-手术申请空日期NPE闭环+operationDate-send-NPE.md`


> 状态：`verified`
> 日期：2026-06-24
> 域：住院 / 手术申请 / 临床路径
> 前置 case：[2026-06-operationApply-date-default-empty-pageParam.md](2026-06-operationApply-date-default-empty-pageParam.md)

---

## 背景

- **前置改造**（2026-06-06）：页面参数 `oper_date_default_empty`（configId=130201）使新建手术申请「预计手术时间」默认为空
- **问题 1**：临床路径发送时 `pres-service/api/pres/operationApply/send` HTTP 500，`NullPointerException`
- **问题 2**：参数开启后，选择手术类别「择期」(4) 仍自动填明天（子组件 `operationClassSelect`）

## 组件结构（必读）

| 层级 | 文件 | 职责 |
|------|------|------|
| 父页面 | `onelink-web-pres-fj-common/components/presManage/operationApplication.vue` | `newOpenFun` 默认空、`operDateDefaultEmptyFlag` 读取 |
| 子表单 | `onelink-web-pres-fj-common/components/operateManage/operateApplication.vue` | 手术类别下拉、`operationClassSelect` 择期自动 `setTime` |
| 后端 | `onelink-micro-pres-fj-common/.../OperationApplyServiceImpl.java` | `send()`、嘱托医嘱生成 |

**坑**：页面参数若只改父组件 `newOpenFun`，子组件选类别仍会回填时间；后端 `send` 若未 null 防护仍会 NPE。

## 根因

### 后端 NPE

`OperationApplyServiceImpl` 在 `send()` → `createOperateEntrustPres` / `createOutpOperateEntrustPres` 中直接 `detail.getOperationDate().getTime()`；`send()` 内 `DateUtil.isSameDay(detail.getOperationDate(), ...)` 同理。

### 前端自动填时间

`operateApplication.vue` → `operationClassSelect`：择期（`val == 4`）时 `this.$refs.keyfocus12.setTime(nextDay)`，未判断 `oper_date_default_empty`。

## 修复

### 后端 `OperationApplyServiceImpl.java`

1. `send()`：`detail.getOperationDate() != null && DateUtil.isSameDay(...)`
2. 住院/门诊嘱托医嘱：`Date operationDate = detail.getOperationDate() != null ? detail.getOperationDate() : sysDate`；null 时医嘱文案显示「今日」

### 前端 `operateApplication.vue`

1. `data()`：`operDateDefaultEmptyFlag: null`
2. `getMenuCustom()`：与同页其他 flag 一并读取 `oper_date_default_empty`
3. `operationClassSelect`：`if (val && val == 4 && !this.operDateDefaultEmptyFlag)` 才 `setTime`

## 业务说明

- 后端 fallback `sysDate` 仅保证发送不中断与嘱托文案；`operateRecord.setOperateTime(null)` 仍可为空
- 参数未配置或 `state=0`：保持原行为（新开默认当前时间、择期自动明天）

## 测试要点

1. configId=130201 配置 `oper_date_default_empty` state=1
2. 新开 → 预计手术时间为空；选手类别「择期」→ 仍为空
3. 临床路径 / 手术申请发送 → 无 500
4. state=0 → 新开有默认时间，择期自动明天

## 关联 commit / tag

| 仓 | 说明 | master | release-1.166 | tag |
|----|------|--------|---------------|-----|
| 页面参数（首改） | 新开默认空 | `273fc29f` | `1060443b` | `release-1.166.16` |
| 后端 | NPE 修复 | `5d7f8f70a` | `aa9eba082` | `release-1.166.37` |
| 前端 | 选类别不自动填 | `f116c6d0` | `20b08ebd` | `release-1.166.27` |

## 可复用结论

1. **页面参数允许字段为空 → 前后端全链路**：所有写入点（新开、类别变更、发送、生成医嘱）逐一排查
2. **父子组件**：父读参数时，子组件若也有同类逻辑须在 `getMenuCustom` 再读或 props 下发
3. **后端不能假设 save 校验已拦截 null**：临床路径等入口可能绕过前端必填
4. **release 冲突多 → cherry-pick** 单 commit

## 升格建议

- [x] `business-rules.md` — 手术申请空日期全链路
- [ ] rule/skill — 已有页面参数三步模式，无需重复升格
