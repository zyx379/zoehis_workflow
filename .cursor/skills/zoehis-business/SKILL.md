---
name: zoehis-business
description: >
  ZOEHIS business rules and table flows: pool tables (POOL → RECORD), master-detail
  patterns, prepay charge/refund/consume, outpatient/inpatient symmetry (_OUTP_/_INP_),
  drug dispense, prescription, billing flows, charge/deduction, refund/return.
  Use when designing DB changes, verifying business constraints, checking table
  relationships, understanding data flows, or validating pool→record transitions.
  Keywords: 业务, 池表, 主细表, 预交金, 摆药, 收费, 退费, 表结构, 数据流,
  POOL, RECORD, MASTER, DETAIL, 处方, 医嘱, 医保, 库存, 结算
---

# ZOEHIS 业务规则与表结构

福建通用 HIS 核心业务模式：池表流转、主细表、预交金、门诊/住院对称。

## 核心模式

### 参数体系（系统参数 vs 页面参数）

改动涉及开关/配置时，**先识别参数类型**，再决定实现方式（详见 Rule `zoehis-sys-param`）：

| 类型 | API | 用途 | 示例 |
|------|-----|------|------|
| **系统参数** | `$getSysParamList` / `getSysParams` | 全局配置、跨页面共享、后端 SQL 联动 | `return_drug_new_valid_hours` |
| **页面参数** | `$getPageControlMap(configId)` | 单页面开关/默认值 | `oper_date_default_empty` |

**判断原则：**
1. 多页面/接口共用 → 系统参数
2. 仅单页面行为控制 → 页面参数
3. 首次使用前先查原页面已有参数体系，与同页面其他 flag 保持一致

### 页面参数实现模式（三步固定）

```javascript
// 1. data() 声明变量
operDateDefaultEmptyFlag: null,

// 2. $getPageControlMap 回调中读取（configId 与页面已有调用一致）
const map = await this.$getPageControlMap('130201')
const cfg = map['130201'] || {}
this.operDateDefaultEmptyFlag = !$.zoe.isNullOrEmpty(cfg.oper_date_default_empty)
  && cfg.oper_date_default_empty.state * 1 === 1

// 3. 使用处三元条件
operationDate: this.operDateDefaultEmptyFlag ? '' : t
```

- Key 命名：**snake_case**，与代码变量 camelCase 对应
- 运维需在对应 configId 下配置 key，state=1 生效

### 池表模式

```
业务数据 → 池表(POOL)新增 → 执行后产生记录(RECORD) → 删除池表数据
```

| 业务环节 | 池表 | 记录表 | 触发 |
|----------|------|--------|------|
| 门诊摆药 | `APP_OUTP_LAY_DRUG_POOL` | `APP_OUTP_LAY_DRUG_RECORDS` | 取药执行 |
| 住院摆药 | `APP_INP_LAY_DRUG_POOL` | `APP_INP_LAY_DRUG_RECORDS` | 取药执行 |
| 门诊单据 | `APP_OUTP_APPLY_SHEET_POOL` | `APP_OUTP_APPLY_SHEET` | 单据执行 |
| 住院单据 | `APP_INP_APPLY_SHEET_POOL` | `APP_INP_APPLY_SHEET` | 单据执行 |
| 住院申请 | `PRES_APPLY_RECORDS_POOL` | — | 医嘱申请 |

**关键约束：** 执行后必须删池表并产生正式记录。

### 主细表模式

```
主表(_MASTER): 单据级（患者、科室、总金额、状态）
细表(_DETAIL): 明细级（项目、数量、单价）
```

| 业务 | 主表 | 细表 |
|------|------|------|
| 门诊处方 | `PRES_OUTP_PRES_MASTER` | `PRES_OUTP_PRES_DETAIL` |
| 门诊结算 | `CHA_OUTP_SETTLE_MASTER` | `CHA_OUTP_SETTLE_DETAIL` |
| 退药 | `APP_RETURN_DRUG_MASTER` | `APP_RETURN_DRUG_DETAIL` |

### 预交金扣费模式

```
充值: CHA_*_PREPAY_RECORD (新增) + CHA_*_PREPAY_ACCT (更新余额)
消费: CHA_*_PREPAY_ACCT (更新扣减) + CHA_*_CONSUME_MASTER (新增流水)
退费: CHA_*_PREPAY_ACCT (更新退回)
```

**关键约束：** 扣费必须记消费流水；退费必须退回预交金。

### 费用审核/结算操作人分离

同一 SQL 同时维护「业务标志」与「操作人」时：
- 结算/冲销/取消锁定 → **只改标志**，不改操作人（operator 传 null）
- 手工审核 → 同时更新标志和操作人
- MyBatis 实现：`<if test="operator != null and operator != ''"> FEE_AUDIT_OPERATOR = #{operator} </if>`
- 涉及表：`PAT_IN_HOSPITAL.FEE_AUDIT_OPERATOR`、`PAT_ADMISSION_RECORD.FEE_AUDIT_OPERATOR`

### 门诊/住院对称

表名通过 `_OUTP_` / `_INP_` 区分，业务逻辑一致：

| 业务 | 门诊表 | 住院表 |
|------|--------|--------|
| 摆药池 | `APP_OUTP_LAY_DRUG_POOL` | `APP_INP_LAY_DRUG_POOL` |
| 预交金记录 | `CHA_OUTP_PREPAY_RECORD` | `CHA_INP_PREPAY_RECORD` |
| 预交金账户 | `CHA_OUTP_PREPAY_ACCT_MAST` | `CHA_INP_PREPAY_ACCT` |
| 费用明细 | `CHA_OUTP_CHARGE_DETAIL` | `CHA_INP_CHARGE_DETAIL` |
| 结算 | `CHA_OUTP_SETTLE_MASTER` | `CHA_INP_SETTLE_MASTER` |
| 医保结算 | `INS_OUTP_SETTLE_MASTER` | `INS_INP_SETTLE_MASTER` |

## 门诊处方数据流

```
挂号 → 保存处方 → 发送 → 取药/扣费 → 结算 → 结账
      PRES_OUTP_PRES_MASTER/DETAIL
      发送→ APP_OUTP_LAY_DRUG_POOL + APP_OUTP_APPLY_SHEET_POOL
      取消发送→ 删POOL
      取药→ 删POOL + APP_OUTP_LAY_DRUG_RECORDS + 扣预交金 + 消费流水
```

## 住院医嘱数据流

```
新开 → 发送 → 校对 → 申请 → 执行（取药/扣费）
              PRES_APPLY_RECORDS_POOL → 摆药池+单据池

停嘱：医生停嘱→PRES_INP_PRES_RECORD_STOP + 护士审核→删STOP
作废：更新状态
重整：PRES_INP_PRES_RECORD_RESET
```

## 数据库表命名

- 前缀：`COM_` 公共 / `PAT_` 患者 / `CHA_` 收费 / `PRES_` 处方 / `APP_` 申请 / `APT_` 预约 / `INS_` 医保 / `DIC_` 字典
- 门诊/住院：`_OUTP_` / `_INP_`
- 后缀：`_MASTER` / `_DETAIL` / `_POOL` / `_RECORD` / `_DICT`
- 全部大写+下划线

## 核心表速查

**患者：** PAT_BASIC_INFO, PAT_IN_HOSPITAL, PAT_OUTP_PATIENT_CLINIC_INFO
**处方：** PRES_OUTP_PRES_MASTER/DETAIL, PRES_INP_PRES_RECORD, PRES_APPLY_RECORDS_POOL
**摆药：** APP_*_LAY_DRUG_POOL/RECORDS, APP_*_APPLY_SHEET_POOL
**收费：** CHA_*_PREPAY_*, CHA_*_CHARGE_DETAIL, CHA_*_SETTLE_MASTER, INS_*_SETTLE_MASTER
**字典：** DIC_DRUG_DICT, DIC_BED_DICT, DIC_PAY_MODE_DICT, DIC_CLINIC_ITEM_DICT
**退药：** APP_RETURN_DRUG_MASTER/DETAIL

## 业务校验清单

改动后（Step 7 自检）：
- [ ] 池表：执行后是否删 POOL 并写 RECORD？
- [ ] 主细表：MASTER/DETAIL 是否成对？
- [ ] 预交金：扣费是否同时记 CONSUME 流水？退费是否退回账户？
- [ ] 门诊/住院：是否误用 `_OUTP_` / `_INP_` 表？
- [ ] 发送/校对：是否满足「先发送再入池」等业务前置？

## 关联

- **编排 Skill**：[zoehis-ai-dev](../zoehis-ai-dev/SKILL.md) — 全栈功能改造时由此编排
- **前端 Skill**：[zoehis-frontend](../zoehis-frontend/SKILL.md)
- **后端 Skill**：[zoehis-backend](../zoehis-backend/SKILL.md)
- **参数规范**：[.cursor/rules/zoehis-sys-param.mdc](../../../.cursor/rules/zoehis-sys-param.mdc) — 系统参数 vs 页面参数
- **数据流详情**：[patterns/his-business-patterns.md](patterns/his-business-patterns.md)
- **工作流**：[docs/workflow.md](../../../docs/workflow.md)
