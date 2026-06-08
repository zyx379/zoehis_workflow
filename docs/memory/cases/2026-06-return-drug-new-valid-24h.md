# [202238] 新开退药单 24 小时有效期

> 状态：`verified`（代码+发布；MCP 造数因 JDBC 连接失败未执行）  
> 日期：2026-06-06  
> 域：收费 / 住院退药

---

## 背景

- **需求**：新开状态（`return_drug_status_code=0`）的退药单有效期 24 小时，超时不可执行且列表不展示
- **项目**：【漳州二院】→ `release-1.166`
- **仓库**：`onelink-micro-charge-fj-common`（仅后端，无前端改动）

## 问题 / 目标

退药单长期滞留「新开」，药房/病区仍可查询并执行，需按开单时间限制有效期。

## 根因与正确做法

- **表**：`ZOEAPPLY.APP_RETURN_DRUG_MASTER`（主表），`APP_RETURN_DRUG_DETAIL`（细表）
- **状态**：`RETURN_DRUG_STATUS_CODE`，`'0'` = 新开（`ReturnApplyStatusEnum.newApply`）
- **时间字段**：`APPLY_TIME`（开单时间）
- **改法**：
  1. 系统参数 `return_drug_new_valid_hours`（默认 24；0 或空 = 不限制，兼容其他医院）
  2. 列表/树/消息 SQL 增加过滤：非新开 **或** `apply_time >= sysdate - N 小时`
  3. 执行入口 `returnInpRefund` 增加 `checkReturnDrugNewApplyValid`，超时抛 `RETURN_DRUG_NEW_APPLY_EXPIRED`

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| `APP_RETURN_DRUG_MASTER` | SELECT 过滤 | `ReturnDrugMasterDao.xml` 各 list/tree/message |
| `/api/charge/refund/inp/getMaster` | 查询 | `InpRefundServiceImpl.getMaster` |
| `/api/charge/refund/inp/masterTree` | 树 | `InpRefundServiceImpl.masterTree` |
| `returnInpRefund` | 执行校验 | 超时阻断 |
| `ChargeBizSysParam.jsonl` | 参数种子 | `return_drug_new_valid_hours=24` |

## 测试要点

### MCP 造数（测试库，MCP 恢复后执行）

```sql
-- 1. 确认参数
SELECT param_english_name, param_value FROM com_biz_sys_param WHERE param_english_name = 'return_drug_new_valid_hours';

-- 2. 造一条超时新开单（apply_time 25 小时前）
UPDATE zoeapply.app_return_drug_master
   SET apply_time = sysdate - 25/24, return_drug_status_code = '0'
 WHERE return_drug_no = '<测试单号>';

-- 3. 验证：列表应查不到；执行应报 10010
SELECT return_drug_no, return_drug_status_code, apply_time
  FROM zoeapply.app_return_drug_master
 WHERE return_drug_status_code = '0'
   AND apply_time >= sysdate - numtodsinterval(24, 'HOUR');
```

### 界面步骤

1. 住院退药新开页面（如 `deptRefundDrugNew.vue`）→ 确认超过 24h 的新开单不在列表/树中
2. 若直接调执行接口，应提示新开退药单已超过有效小时数
3. 参数改为 `0` 后，过期新开单应恢复可见（回归兼容）

## 关联 commit / tag

- master 功能：`65b83c9bd9` — `[202238]【漳州二院】新开状态下的退药单有效期为24小时`
- master 参数：`db783ffa1d` — `[*111111*]增加系统参数【return_drug_new_valid_hours】【202238】`（creator/checker: zhouyanxi）
- release-1.166：revert 旧提交后 cherry-pick 上述两 commit
- tag：`release-1.166.126`（`.124`/`.125` 为标题错误版本，已废弃）

## 可复用结论

- 退药主表为 `APP_RETURN_DRUG_MASTER`，非退费主表 `CHA_*`
- 有效期类需求优先 **系统参数 + SQL 过滤 + 执行二次校验**，参数 0 关闭限制
- **系统参数 jsonl 与功能分 commit**；参数标题固定 `[*111111*]增加系统参数【英文名】【禅道号】`
- 【漳州二院】→ `release-1.166`；master 与 release 差异大时 **cherry-pick** 功能 commit，参数 commit 可合并 jsonl 双方行

## 升格建议

- [ ] workflow
- [x] skill / patterns（已写入 `common-patterns.md` §1.5、§1.6 与 SKILL §1.1）
- [ ] rule
- [ ] 无需升格，保留 case 即可
