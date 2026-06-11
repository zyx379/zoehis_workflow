# [202860] 短期记忆 — 手术申请记录状态同步更新

> **短期记忆**：需求进行中临时文件；Step 12 沉淀长期 case 后 **删除本文件**。  
> 日期：2026-06-11  
> 状态：`implementing`

---

## 需求摘要

- **任务类型**：Bug 修复
- **禅道 / 项目**：[202860]【漳州市医院】
- **页面 / 菜单**：住院医嘱 → 手术申请；手术导航界面

## 问题描述

患者手术状态已经发生变化（手术导航界面排台、完成），但是手术申请记录的状态还是「送手术室」，没有同步改变。

## 代码地图（Step 4 产出）

| 仓库 | 路径 | 角色 | 置信度 |
|------|------|------|--------|
| onelink-web-pres-fj-common | `pages/operateManage/operationNavigation.vue` | 手术导航页面（排台/登记入口） | 高 |
| onelink-web-pres-fj-common | `components/presManage/operationApplication.vue` | 手术申请主页面（已开申请单列表） | 高 |
| onelink-web-pres-fj-common | `api/charge-service/dict/operation/OperationRecord.js` | 手术导航 API | 高 |
| onelink-micro-charge-fj-common | `OperationRecordServiceImpl.updateOperationPlatoon` | 排台/登记业务逻辑 | 高 |
| onelink-micro-charge-fj-common | `OperationRecordDao.xml` | 主表/记录表状态 UPDATE SQL | 高 |
| onelink-micro-pres-fj-common | `OperationApplyServiceImpl.send` | 发送时主表+记录表同步（对照） | 高 |

### 调用关系

```
operationNavigation.vue
  → OperationRecord.updateOperationPlatoon（排台 operateStatusCode=2 / 登记=3）
  → OperationRecordServiceImpl.updateOperationPlatoon
      → updateApplyStatusByApplyNo → PRES_OPERATION_APPLY_MASTER.OPERAT_APPLY_STATUS_CODE
      → （原缺失）updateOperationApplyRecordStatus → PRES_OPERATION_APPLY_RECORD.OPERATION_APPLY_STATUS_CODE

operationApplication.vue
  → OperationApply.getOperationApplys
  → OperationApplyMasterDao.getOperationApplys（读 MASTER 状态展示）
```

## 根因（Step 5）

- **发送/撤销**流程会同时更新 **主表 + 记录表**（pres send 调 `updateOperationApplyRecordStatus`；charge revoke 调 `updateApplyStatusByApplyNo` + `updateOperationApplyRecordStatus`）。
- **排台/登记**（`updateOperationPlatoon`）仅调用了 `updateApplyStatusByApplyNo` 更新 `PRES_OPERATION_APPLY_MASTER`，**未同步** `PRES_OPERATION_APPLY_RECORD`，导致记录表状态停留在「5-送手术室」。
- 状态值域（`OperateEelecApplyStatusEnum`）：5=送手术室，6=已排台，7=已完成。

## Spec（Step 5，实现依据）

### 改动范围

| 仓库 | 文件 | 改动 |
|------|------|------|
| onelink-micro-charge-fj-common | `OperationRecordServiceImpl.java` | 排台/登记时同步更新 RECORD 表 |

### 实现方案

在 `updateOperationPlatoon` 排台/登记分支，将原 `updateApplyStatusByApplyNo` 替换为私有方法 `syncOperationApplyStatus`：

1. 更新 `PRES_OPERATION_APPLY_MASTER.OPERAT_APPLY_STATUS_CODE`（6 或 7）
2. 更新 `PRES_OPERATION_APPLY_RECORD.OPERATION_APPLY_STATUS_CODE`（同值）
3. `operateApplyNo` 或 `eventNo` 为空时跳过（防 NPE）

**不改前端**；`saveFlag=1` 纯保存仍不触发状态变更（保持原逻辑）。

### 涉及表

| 表 | 字段 | 排台 | 登记 |
|----|------|------|------|
| PRES_OPERATION_APPLY_MASTER | OPERAT_APPLY_STATUS_CODE | 6 | 7 |
| PRES_OPERATION_APPLY_RECORD | OPERATION_APPLY_STATUS_CODE | 6 | 7 |

### 测试要点

1. 住院患者：手术申请 → 发送（状态=送手术室）
2. 手术导航 → 排台 → 回到手术申请，列表/详情状态=**已排台**
3. 手术导航 → 登记/完成 → 手术申请状态=**已完成**
4. MCP 验证：`PRES_OPERATION_APPLY_MASTER` 与 `PRES_OPERATION_APPLY_RECORD` 同申请单号状态一致

### 范围说明

- **住院**为主；门诊若走同一 `updateOperationPlatoon` 接口一并修复。
- 不涉及系统/页面参数。

## 外部编辑器交接

Trae/CodeBuddy 已完成 Step 0-4；Cursor 完成 Step 5 spec 并实现（Step 6）。
