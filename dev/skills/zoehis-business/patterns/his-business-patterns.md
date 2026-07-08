# ZOEHIS HIS业务模式

> 以下内容从实际业务文档中提取。

---

## 一、门诊处方数据流（来源：门诊住院业务流程-后台表结构.docx）

数据流以 **门诊处方主表PRES_OUTP_PRES_MASTER + 门诊处方细表PRES_OUTP_PRES_DETAIL** 为轴。

```
挂号 → 保存处方 → 发送处方 → 取药/扣费 → 结算 → 结账

挂号:  PAT_OUTP_PATIENT_CLINIC_INFO (新增)
退号:  PAT_OUTP_PATIENT_CLINIC_INFO (状态→作废)

保存处方:
  PRES_OUTP_PRES_MASTER (新增/更新)
  PRES_OUTP_PRES_DETAIL (新增/更新)
  中药处方附加表 (新增/更新，仅中药)

发送处方:
  APP_OUTP_LAY_DRUG_POOL (新增)        ← 产生摆药池
  APP_OUTP_APPLY_SHEET_POOL (新增)     ← 产生单据池
  PRES_OUTP_PRES_MASTER (状态→已发送)

取消发送:
  APP_OUTP_LAY_DRUG_POOL (删除)
  APP_OUTP_APPLY_SHEET_POOL (删除)
  PRES_OUTP_PRES_MASTER (状态→新开)

取药/扣费:
  APP_OUTP_LAY_DRUG_POOL (删除)        ← 消耗摆药池
  APP_OUTP_LAY_DRUG_RECORDS (新增)     ← 产生摆药记录
  药品库存表 (更新)
  药品账页表 (新增)
  CHA_OUTP_PREPAY_ACCT_MAST (更新)     ← 扣预交金
  CHA_OUTP_CONSUME_MASTER (新增)       ← 消费流水

单据执行:
  APP_OUTP_APPLY_SHEET_POOL (删除)     ← 消耗单据池
  APP_OUTP_APPLY_SHEET (新增)          ← 产生单据
  CHA_OUTP_CHARGE_DETAIL (插入)        ← 费用明细
  CHA_OUTP_CONSUME_MASTER (新增)       ← 消费流水

退药退费:
  APP_RETURN_DRUG_MASTER/DETAIL (新增/更新)
  APP_RETURN_MASTER/DETAIL (新增/更新)
  CHA_OUTP_CHARGE_DETAIL (更新/插入)
  CHA_OUTP_PREPAY_ACCT_MAST (更新)     ← 退回预交金

结算:
  CHA_OUTP_SETTLE_MASTER/DETAIL (新增)
  INS_OUTP_SETTLE_MASTER/DETAIL (新增)  ← 医保结算
  CHA_OUTP_PREPAY_RECORD (新增/更新)
  CHA_OUTP_PREPAY_ACCT_MAST (更新)

结账:
  CHA_OPERATOR_ACCOUNT_OPERATE (新增)
  CHA_OUTP_ACCOUNT_MASTER (新增)
  CHA_OUTP_ACCOUNT_PREPAY_DETL (新增)
  CHA_OUTP_ACCOUNT_INVOICE_DETL (新增)
```

## 二、住院医嘱数据流（来源：门诊住院业务流程-后台表结构.docx）

数据流以 **住院医嘱记录表PRES_INP_PRES_RECORD** 为轴。

```
新开 → 发送 → 校对 → 申请 → 执行（取药/扣费）
                  ↓
              停嘱（医生停嘱 → 护士审核）
              作废
              重整

新开医嘱:
  PRES_INP_PRES_RECORD (新增)
  临时医嘱 + 检验检查 → PRES_INP_CHECK_ELEC_RECORD / PRES_INP_INSPE_ELEC_RECORD (新增)

发送医嘱:
  PRES_INP_PRES_RECORD (状态→已发送)
  PRES_DRUG_ADDITION_DETAIL (新增)      ← 药品附加费
  皮试药品 → 产生皮试单据

取消发送/回退:
  PRES_INP_PRES_RECORD (状态→新开)
  PRES_DRUG_ADDITION_DETAIL (删除)
  皮试单据 (删除)

校对医嘱:
  PRES_INP_PRES_RECORD (状态→已校对)
  PRES_APPLY_RECORDS_POOL (新增)       ← 产生申请记录池
  临时医嘱 → 自动调用医嘱申请

医嘱申请:
  PRES_APPLY_RECORDS_POOL → APP_INP_LAY_DRUG_POOL (摆药池)
  PRES_APPLY_RECORDS_POOL → APP_INP_APPLY_SHEET_POOL (单据池)
  临时医嘱: PRES_INP_PRES_RECORD (状态→在执行)

停嘱医嘱:
  医生停嘱:
    PRES_INP_PRES_RECORD (更新停嘱医生、停嘱时间、状态)
    PRES_INP_PRES_RECORD_STOP (新增)
  护士审核:
    PRES_INP_PRES_RECORD (更新停嘱操作人、操作时间)
    PRES_INP_PRES_RECORD_STOP (删除)

作废医嘱:
  PRES_INP_PRES_RECORD (更新状态)

重整医嘱:
  PRES_INP_PRES_RECORD (更新)
  PRES_INP_PRES_RECORD_RESET (新增)
```

## 三、核心数据流转模式（来源：门诊住院业务流程-后台表结构.docx）

### 3.1 池表模式

系统大量使用"池表"作为中间缓冲：

```
业务数据 → 池表(POOL) → 执行后产生记录(RECORD) → 删除池表数据

示例（摆药）:
  发送处方 → APP_OUTP_LAY_DRUG_POOL (新增)
  取药执行 → APP_OUTP_LAY_DRUG_RECORDS (新增) + APP_OUTP_LAY_DRUG_POOL (删除)

示例（单据）:
  医嘱申请 → APP_INP_APPLY_SHEET_POOL (新增)
  单据执行 → APP_INP_APPLY_SHEET (新增) + APP_INP_APPLY_SHEET_POOL (删除)
```

### 3.2 主细表模式

所有核心业务数据都采用主表+细表的结构：

```
主表(_MASTER): 记录单据级别的信息（患者、科室、总金额、状态等）
细表(_DETAIL): 记录明细级别的信息（具体项目、数量、单价等）

示例（处方）:
  PRES_OUTP_PRES_MASTER (处方主表)
  PRES_OUTP_PRES_DETAIL (处方细表)

示例（结算）:
  CHA_OUTP_SETTLE_MASTER (结算主表)
  CHA_OUTP_SETTLE_DETAIL (结算细表)
```

### 3.3 预交金扣费模式

门诊和住院都通过预交金账户进行费用扣减：

```
充值: CHA_*_PREPAY_RECORD (新增) + CHA_*_PREPAY_ACCT (更新)
消费: CHA_*_PREPAY_ACCT (更新) + CHA_*_CONSUME_MASTER (新增)
退费: CHA_*_PREPAY_ACCT (更新，退回)
```

### 3.4 门诊/住院对称模式

门诊和住院的业务流程高度对称，表名通过 `_OUTP_` / `_INP_` 区分：

| 业务 | 门诊表 | 住院表 |
|------|--------|--------|
| 摆药池 | `APP_OUTP_LAY_DRUG_POOL` | `APP_INP_LAY_DRUG_POOL` |
| 摆药记录 | `APP_OUTP_LAY_DRUG_RECORDS` | `APP_INP_LAY_DRUG_RECORDS` |
| 单据池 | `APP_OUTP_APPLY_SHEET_POOL` | `APP_INP_APPLY_SHEET_POOL` |
| 单据 | `APP_OUTP_APPLY_SHEET` | `APP_INP_APPLY_SHEET` |
| 预交金记录 | `CHA_OUTP_PREPAY_RECORD` | `CHA_INP_PREPAY_RECORD` |
| 预交金账户 | `CHA_OUTP_PREPAY_ACCT_MAST` | `CHA_INP_PREPAY_ACCT` |
| 费用明细 | `CHA_OUTP_CHARGE_DETAIL` | `CHA_INP_CHARGE_DETAIL` |
| 结算 | `CHA_OUTP_SETTLE_MASTER` | `CHA_INP_SETTLE_MASTER` |
| 医保结算 | `INS_OUTP_SETTLE_MASTER` | `INS_INP_SETTLE_MASTER` |

---

## 四、待投喂

- [ ] 处方/医嘱的完整状态值定义
- [ ] 各状态之间的合法流转路径
- [ ] 医保对接的详细流程
- [ ] 打印业务流程
- [ ] 库存管理的详细流程
