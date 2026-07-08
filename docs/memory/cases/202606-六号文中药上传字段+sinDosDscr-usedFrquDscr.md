# [202606] 六号文中药上传字段调整（sin_dos_dscr / used_frqu_dscr）

&gt; **文件名**：`202606-六号文中药上传字段+sinDosDscr-usedFrquDscr.md`
&gt; 状态：`verified`（规格已确认）
&gt; 日期：2026-07-06
&gt; 域：医保 / 收费 / 六号文
&gt; 禅道 / 项目：202606 / 【公共】

---

## 背景

- **需求**：六号文费用上传质控字段调整，中药的 `sin_dos_dscr`（单次剂量描述）和 `used_frqu_dscr`（使用频次描述）需按新规则上传
- **页面/菜单**：无前端改动；影响医保费用明细上传 `exp_content` 中两个字段
- **仓库**：
  - `onelink-micro-insurance-fj-ybcommon`（医保上传组装逻辑，主改）
  - `onelink-micro-charge-fj-common`（订单/费用明细 8 字段与医保对齐）

## 问题 / 目标

### 业务规则（需求原文）

| 上传字段 | 含义 | 中药原值 | 目标值 |
|----------|------|----------|--------|
| `sin_dos_dscr` | 单次剂量描述 | `一次{剂量}{单位}` | `一剂{剂量}{单位}` |
| `used_frqu_dscr` | 使用频次描述 | 频次字典医保码或 `freqName`（如 bid） | 中文描述，例：每日 2 次 → `1日1剂分2次` |

### 范围

- 仅 **中药**（`item_class_code` 以 `C` 开头 / `chnFlag=1`）
- 西药保持现有「一次…」与 `getUsedFrquDscr` 逻辑不变
- 门诊住院对称
- 医保侧与 charge 侧同步修改

### 已确认问题

| # | 问题 | 结论 |
|---|------|------|
| 1 | 非每日频次格式 | 暂按 `1日1剂分{freqTimes}次`（`freqTimes` 取 `DIC_PRES_FREQ_DICT.FREQ_TIMES`） |
| 2 | 「1日」是否固定 | **恒为 `1日1剂`** |
| 3 | 门诊是否对称 | **门诊住院对称** |
| 4 | charge SQL 是否同步 | **医保侧与 charge 侧同步修改** |
| 5 | Service 包 | **新架构 fuzhou** |
| 6 | 与 202606-002 冲突 | **中药按 `1日1剂分N次` 覆盖**，不依赖 `getUsedFrquDscr` 字典回退 |

## 根因与正确做法

### 实现规则

- `chnFlag=1` 或 `clinicItemClassCode`/`itemClassCode` 以 `C` 开头 → 中药
- `sin_dos_dscr`：`一剂{剂量}{单位}`
- `used_frqu_dscr`：`1日1剂分{freqTimes}次`（`freqTimes` 来自摆药/频次字典分子）
- 西药：保持 `"一次…"` + 原 `getUsedFrquDscr` 字典逻辑

### 代码地图

| 仓库 | 路径 | 角色 |
|------|------|------|
| insurance | `.../nationalInsurance/fuzhou/FuZhouNationalInsuranceOutpService.java` | 门诊费用上传组装 `sin_dos_dscr`、`used_frqu_dscr` |
| insurance | `.../nationalInsurance/fuzhou/FuZhouNationalInsuranceInpService.java` | 住院费用上传组装同上 |
| insurance | `.../nationalInsurance/fuzhou/FuZhouNationalInsurancePublicService.java` | `getUsedFrquDscr()`；价项处理含 `chnFlag`/`freqTimes` |
| insurance | `.../resources/insur/InsurManageDao.xml` | `getOutpLayDrugDosageInfo` / `getInpLayDrugDosageInfo` 提供 `chnFlag`、`freqTimes`、`freqInterval` |
| charge | `.../settle/impl/OrderSettleManagerServiceImpl.java` | `buildSinDosDscr()` 硬编码 `"一次"` |
| charge | `.../mappings/dict/settle/OrdersMasterDao.xml` | 订单摆药 SQL 拼接 `'一次'||dosage||unit` 为 `sinDosDscr`；含 `chnFlag` |
| charge | `.../mappings/dict/prepay/OutpChargeDetailDao.xml` | 费用缓存查询 `usedFrquDscr`（`insur_freq_code`） |

### 调用关系

```
住院/门诊中药处方（频次 freq_name、剂量 dosage）
  → 摆药 v_inp/outp_lay_drug（item_class_code C* → chnFlag=1）
  → 医保结算费用上传 FuZhouNationalInsuranceOutp/InpService
      → layInfoMap / item（dosage、freqName、chnFlag、freqTimes）
      → exp_content.sin_dos_dscr / used_frqu_dscr → 国家医保平台
  ↔ charge 订单 8 字段（OrderSettleManagerServiceImpl / OrdersMasterDao）
      → 第三方自助/订单明细与 insurance 上传值对齐
```

### 现状代码锚点

**医保上传 — 单次剂量（当前一律「一次」）**

- 门诊 `FuZhouNationalInsuranceOutpService` ~3500：`"一次" + dosage + dosageUnit`
- 住院 `FuZhouNationalInsuranceInpService` ~2729：同上

**医保上传 — 频次描述**

- `FuZhouNationalInsurancePublicService.getUsedFrquDscr()`：优先 `DIC_PRES_FREQ_DICT.insur_freq_code`，否则 `freqName`
- 中药在 PublicService 价项处理 ~750：`chnFlag=1` 时 `freqName` 被置为 `qd`（202606-002），与本次「1日1剂分N次」新规则冲突，需统一

**charge 侧**

- `buildSinDosDscr()` ~8775：`return "一次" + dosageStr + dosageUnitStr`
- `OrdersMasterDao.xml` 门诊/住院 lay 查询 ~288/356：SQL 字面量 `'一次'||dosage||unit`

**中药判定（已有字段）**

- `InsurManageDao.xml` `getOutp/InpLayDrugDosageInfo`：`decode(substr(item_class_code,1,1),'C','1','0') "chnFlag"`
- `OrdersMasterDao.xml` 同上 `chnFlag` + `freqTimes` / `freqInterval`

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| `DIC_PRES_FREQ_DICT` | 读 | `FREQ_TIMES`、`FREQ_INTERVAL`、`INSUR_FREQ_CODE` |
| `v_inp_lay_drug` / `v_outp_lay_drug` | 读 | 摆药视图，含 `item_class_code`、`dosage`、`dosage_unit` |
| `InsurManageDao.xml` | 改 | `getOutpLayDrugDosageInfo` / `getInpLayDrugDosageInfo` 已有 `chnFlag` |
| `OrdersMasterDao.xml` | 改 | `sinDosDscr` SQL 拼接中药改「一剂」 |
| `OutpChargeDetailDao.xml` | 改 | `usedFrquDscr` 中药 `1日1剂分N次` |

## 文件清单

| 仓库 | 路径 | 改动类型 |
|------|------|----------|
| insurance | `FuZhouNationalInsurancePublicService.java` | 新增 `isChnDrug`、`buildSinDosDscr`、`getUsedFrquDscr` 中药分支；价项处理写入 `chnFlag`/`freqTimes` |
| insurance | `FuZhouNationalInsuranceOutpService.java` | 调用 `buildSinDosDscr` |
| insurance | `FuZhouNationalInsuranceInpService.java` | 调用 `buildSinDosDscr` |
| charge | `OrderSettleManagerServiceImpl.java` | `buildSinDosDscr` 中药改「一剂」 |
| charge | `OrdersMasterDao.xml` | SQL `sinDosDscr` 中药 decode「一剂」 |
| charge | `OutpChargeDetailDao.xml` | SQL `usedFrquDscr` 中药 `1日1剂分N次` |

## 测试要点

1. 住院中药处方「每日 2 次」上传后 `used_frqu_dscr=1日1剂分2次`
2. 中药 `sin_dos_dscr` 前缀为「一剂」
3. 西药字段不变（保持「一次」+ 原频次逻辑）
4. charge 订单明细与 insurance 上传值一致
5. 门诊住院对称验证

## 可复用结论

1. **六号文中药字段双端对齐**：医保上传（insurance）与订单明细（charge）的 `sinDosDscr` / `usedFrquDscr` 必须同步修改，确保第三方自助与医保上传值一致
2. **中药判定统一口径**：`item_class_code` 以 `C` 开头 / `chnFlag=1`，SQL 用 `decode(substr(item_class_code,1,1),'C','1','0')`
3. **频次描述中药特殊规则**：`1日1剂分{freqTimes}次` 恒为「1日1剂」前缀，`freqTimes` 取频次字典分子

## 关联

- 禅道#202606 — 六号文批次
- Skill: `zoehis-policy-doc6` — 202606 批次、8 字段索引、charge/insurance 双端一致性
- `his5/dev/skills/zoehis-policy-doc6/reference.md` — 202606 提交索引与 medcWayDscr 双端对齐经验

## 升格建议

- [ ] workflow — 六号文字段改造双端对齐流程
- [x] skill — `zoehis-policy-doc6` 已有相关内容，可补充中药 sinDosDscr/usedFrquDscr 规则
- [ ] rule
- [ ] 无需升格，保留 case 即可
