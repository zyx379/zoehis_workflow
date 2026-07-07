# [202860] 手术导航排台登记后手术申请记录状态未同步
> **文件名**：`202860-手术导航排台登记状态同步+PRES_OPERATION_APPLY_RECORD.md`


> 状态：`verified`  
> 日期：2026-06-11  
> 域：住院 / 手术

---

## 背景

- **需求**：手术导航排台/完成后，手术申请记录状态仍显示「送手术室」
- **页面/菜单**：住院医嘱 → 手术申请；手术导航
- **仓库**：`onelink-micro-charge-fj-common`（修复）；`onelink-web-pres-fj-common`（入口页面）
- **文件**：
  - `OperationRecordServiceImpl.java` — `updateOperationPlatoon` / `syncOperationApplyStatus`
  - `pages/operateManage/operationNavigation.vue` — 排台/登记 API 调用
  - `components/presManage/operationApplication.vue` — 已开申请单列表

## 问题 / 目标

手术导航界面已完成排台或登记，但手术申请侧状态仍停留在「送手术室」（5），未变为「已排台」（6）或「已完成」（7）。

## 根因与正确做法

**根因**：手术申请存在 **主表 + 记录表** 双写，发送/撤销流程会同步两表，但 **排台/登记**（`updateOperationPlatoon`）只更新了主表。

| 流程 | 主表 `PRES_OPERATION_APPLY_MASTER` | 记录表 `PRES_OPERATION_APPLY_RECORD` |
|------|-------------------------------------|--------------------------------------|
| 发送（pres） | ✅ `OPERAT_APPLY_STATUS_CODE` | ✅ `OPERATION_APPLY_STATUS_CODE` |
| 撤销（charge） | ✅ `updateApplyStatusByApplyNo` | ✅ `updateOperationApplyRecordStatus` |
| 排台/登记（charge，修复前） | ✅ | ❌ 缺失 |

**修复**：在 `OperationRecordServiceImpl.updateOperationPlatoon` 排台/登记分支，用 `syncOperationApplyStatus` 同时更新两表：

```java
private void syncOperationApplyStatus(OperationRecord operationRecord,
                                      String operatApplyStatusCode) throws Exception {
    if (ValidUtil.isEmptyOrNull(operationRecord.getOperateApplyNo())) {
        return;
    }
    this.updateApplyStatusByApplyNo(operationRecord.getOperateApplyNo(), operatApplyStatusCode);
    if (ValidUtil.isNotEmptyAndNull(operationRecord.getEventNo())) {
        this.updateOperationApplyRecordStatus(operationRecord.getEventNo(),
                String.valueOf(operationRecord.getOperateApplyNo()),
                operatApplyStatusCode);
    }
}
```

状态值域（`OperateEelecApplyStatusEnum`）：5=送手术室，6=已排台，7=已完成。

列表展示：`OperationApply.getOperationApplys` 读 **主表** `OPERAT_APPLY_STATUS_CODE`；记录表不同步会导致依赖 RECORD 的查询/报表与主表不一致。

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| `PRES_OPERATION_APPLY_MASTER` | UPDATE | `OPERAT_APPLY_STATUS_CODE` ← 6/7 |
| `PRES_OPERATION_APPLY_RECORD` | UPDATE | `OPERATION_APPLY_STATUS_CODE` ← 6/7 |
| `OperationRecord.updateOperationPlatoon` | POST | charge-service，排台 status=2 / 登记 status=3 |

## 测试要点

### MCP 造数（测试库）

**场景：模拟修复前不一致状态（可选前置）**

```sql
-- 将某已送手术室申请单的记录表故意置为 5，主表置为 6，用于复现旧问题（测试库）
UPDATE ZOEPRES.PRES_OPERATION_APPLY_MASTER
   SET OPERAT_APPLY_STATUS_CODE = '6'
 WHERE OPERATION_APPLY_NO = :operationApplyNo;

UPDATE ZOEPRES.PRES_OPERATION_APPLY_RECORD
   SET OPERATION_APPLY_STATUS_CODE = '5'
 WHERE OPERATION_APPLY_NO = :operationApplyNo
   AND EVENT_NO = :eventNo;
```

**验证 SELECT（排台/登记后两表应一致）**

```sql
SELECT m.OPERATION_APPLY_NO,
       m.OPERAT_APPLY_STATUS_CODE AS master_status,
       r.OPERATION_APPLY_STATUS_CODE AS record_status
  FROM ZOEPRES.PRES_OPERATION_APPLY_MASTER m
  JOIN ZOEPRES.PRES_OPERATION_APPLY_RECORD r
    ON m.OPERATION_APPLY_NO = r.OPERATION_APPLY_NO
   AND m.EVENT_NO = r.EVENT_NO
 WHERE m.OPERATION_APPLY_NO = :operationApplyNo;
-- 预期：master_status = record_status（排台后均为 6，登记后均为 7）
```

### 界面步骤

1. 住院患者：手术申请 → 发送（状态=送手术室）
2. 手术导航 → 未排台 → 排台成功
3. 回到手术申请 → 已开申请单显示 **已排台**
4. 手术导航 → 已排台 → 登记/完成
5. 手术申请 → 显示 **已完成**

## 关联 commit

- `[202860]【漳州市医院】手术导航排台登记后同步手术申请记录状态`
- Tag：`onelink-micro-charge-fj-common` → `release-1.168.87`

## 可复用结论

- 手术申请 **MASTER + RECORD** 双表状态须成对维护；新增 charge/pres 侧状态变更时，对照 send/revoke/platoon 是否两表都更新
- 手术导航业务在 **charge-service**（`OperationRecordServiceImpl`），不在 pres-service
- 全量 merge `release-1.168` 易冲突，交付时优先 **cherry-pick** 单 commit

## 升格建议

- [ ] 无需升格，保留 case 即可
