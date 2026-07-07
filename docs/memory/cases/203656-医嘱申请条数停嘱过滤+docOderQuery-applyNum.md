# [203656] 医嘱申请条数与详情不一致（Oracle applyNum 停嘱过滤）
> **文件名**：`203656-医嘱申请条数停嘱过滤+docOderQuery-applyNum.md`


> 状态：`verified`  
> 日期：2026-06-22  
> 域：住院 / 医嘱 / 收费

---

## 背景

- **需求**：左侧病人树 `applyNum` 与右侧医嘱申请详情条数不一致
- **页面/菜单**：医嘱申请（`docOderQuery.vue` + `deptPatientTreeNew.vue`）
- **仓库**：`onelink-micro-charge-fj-common`
- **文件**：`PatInHostipalDao.xml` → `getInHospitalPatientTree` 的 `applyNum` 子查询

## 问题 / 目标

Oracle 环境下树节点显示条数偏多（如 9 条），点击后右侧详情「查无数据」。达梦版此前已修复，Oracle 默认 SQL 未同步。

## 根因与正确做法

`PatInHostipalDao.xml` 中 `getInHospitalPatientTree` 按 `databaseId` 分两套 SQL：

- **达梦版**（`databaseId="dm"`）：`applyNum` 子查询含停嘱时间过滤
- **Oracle 默认版**：缺少该过滤，统计了停嘱后无效的申请池记录

修复：在 Oracle 版 `applyNum` 子查询 `pool.PRES_APPLY_STATUS = '0'` 之后，插入与达梦版相同的停嘱过滤：

```sql
and ((record.pres_status_code = '7' and ((trunc(record.stop_pres_time) <= trunc(pool.exec_time) and pool.exec_time <= record.stop_pres_time)
or (trunc(record.stop_pres_time) = trunc(pool.exec_time) and pool.freq_sub_no <= record.last_day_exec_times and trunc(record.begin_exec_time) != trunc(record.stop_pres_time))
or (trunc(record.begin_exec_time) = trunc(record.stop_pres_time) and pool.exec_time <= record.stop_pres_time))) or record.pres_status_code <> '7')
```

**注意**：MyBatis 多库 SQL 改动时，达梦与 Oracle 分支需成对核对，避免只改一侧。

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| `PRES_APPLY_RECORDS_POOL` | SELECT | 申请池，`EXEC_TIME`、`FREQ_SUB_NO`、`PRES_APPLY_STATUS` |
| `PRES_INP_PRES_RECORD` | SELECT | 医嘱记录，`PRES_STATUS_CODE`、`STOP_PRES_TIME`、`BEGIN_EXEC_TIME`、`LAST_DAY_EXEC_TIMES` |
| `InPatient.getInHospitalPatientTree` | API | charge-service，返回树 `applyNum` |
| `Query.getInpPresApplyList` | API | pres-service，右侧详情列表 |

## 测试要点

- Oracle 环境打开医嘱申请页，选有 `applyNum` 的患者
- 左侧条数与右侧详情行数一致
- 重点：已停嘱（`pres_status_code='7'`）且执行时间超出停嘱范围的申请不计入条数

## 关联 commit

- `[203656]【漳州市医院】医嘱申请条数展示与页面展示不一致问题系停嘱时间与执行时间问题【公共模块需求】`
- Tag：`release-1.168.93`（`onelink-micro-charge-fj-common`）

## 可复用结论

- `PatInHostipalDao.xml` 树统计 SQL 有 dm / Oracle 双份实现，停嘱相关过滤须两侧同步
- 停嘱过滤逻辑：`pres_status_code='7'` 时按 `stop_pres_time` 与 `pool.exec_time`、`freq_sub_no`、`last_day_exec_times` 组合判断

## 升格建议

- [ ] workflow
- [ ] skill / patterns
- [x] rule
- [ ] 无需升格，保留 case 即可

**说明**：可考虑在 `zoehis-backend` 或 code-review 中增加「MyBatis databaseId 双份 SQL 改动须核对 dm/Oracle 对称性」检查项。
