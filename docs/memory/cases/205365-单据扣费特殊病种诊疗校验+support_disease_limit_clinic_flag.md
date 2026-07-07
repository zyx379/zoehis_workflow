# [205365] 单据扣费特殊病种诊疗保存校验
> **文件名**：`205365-单据扣费特殊病种诊疗校验+support_disease_limit_clinic_flag.md`


> 状态：`verified`  
> 日期：2026-07-02  
> 域：门诊 / 医保 / 诊疗项目 / 单据扣费

---

## 背景

- **需求**：门诊诊疗没维护特殊病种，不允许对应特殊病种报销；有维护什么特殊病种，才能开什么特殊病种。
- **项目**：【漳州市医院】
- **范围**：门诊诊病开单已存在校验，本次新增 **单据扣费界面** 的保存校验。

## 问题 / 目标

单据扣费界面（`documentDeductionV2` → `outpBillFeeMainTable`）开单保存时，缺少对诊疗项目的特殊病种报销范围校验，需要与门诊诊病开单保持一致。

## 根因与正确做法

单据扣费走的是 `BillDeductServiceImpl.saveOutpBillApply`，原逻辑没有调用特殊病种诊疗配置校验。

**改造点**：

1. 前端 `outpBillFeeMainTable.vue` 在 `doNewSave` 保存前，按单据行 `diseaseCode` 分组，调用 `SpecialDiseaseClinicConfig.getClinicNotInDisease` 预校验。
2. 后端 `BillDeductServiceImpl.saveOutpBillApply` 增加兜底校验，防止绕过前端直接保存。
3. 复用现有系统参数 `support_disease_limit_clinic_flag`，**不新增参数**。

**校验口径**：

- 数据源：`ZOECOMM.COM_SPECIAL_DISEASE_CLINIC_CONFIG`
- 参数：`support_disease_limit_clinic_flag == '1'` 时开启
- 粒度：按**单据行** `diseaseCode`
- 范围：仅**诊疗项目**（不含药品、材料）
- 时机：保存时拦截

## 涉及表 / 接口

| 表 / 接口 | 操作 | 说明 |
|-----------|------|------|
| `ZOECOMM.COM_SPECIAL_DISEASE_CLINIC_CONFIG` | SELECT | 特殊病种诊疗配置主表 |
| `SpecialDiseaseClinicConfigController` | 复用 `getClinicNotInDisease` | 按病种+诊疗编码批量查询未维护项 |
| `APP_OUTP_APPLY_SHEET_POOL` | INSERT | 单据扣费保存后写入（校验在写入前） |

## 涉及文件

| 仓库 | 路径 | 改动 |
|------|------|------|
| onelink-web-his-charge-fj-common | `api/charge-service/dict/comm/SpecialDiseaseClinicConfig.js` | 新增 `getClinicNotInDisease` API |
| onelink-web-his-charge-fj-common | `pages/charge/billingFeeManage_version2/comm/outpBillFeeMainTable.vue` | `doNewSave` 保存前按病种分组校验 |
| onelink-micro-charge-fj-common | `service/service/deduct/impl/BillDeductServiceImpl.java` | `saveOutpBillApply` 后端兜底校验 |

## 关联 commit

- `[205365]【漳州市医院】单据扣费特殊病种诊疗保存校验`
  - `onelink-web-his-charge-fj-common`：`444f1da1`
  - `onelink-micro-charge-fj-common`：`03b0c26731`（`release-0.0.2714`）

## 测试要点

1. `support_disease_limit_clinic_flag = 0`：单据扣费可保存任意诊疗（兼容其他医院）。
2. `support_disease_limit_clinic_flag = 1`：
   - COM 表已维护病种 A + 诊疗 X → 保存成功。
   - 未维护诊疗 Y → 保存拦截，提示含病种名与诊疗名。
   - 单据行 `diseaseCode` 为空 → 不校验该行。
3. 绕过前端直接调 `saveOutpBillApply` 仍被后端拦截。

## 可复用结论

- 单据扣费与门诊诊病开单可共用同一套 `COM_SPECIAL_DISEASE_CLINIC_CONFIG` 校验。
- 特殊病种限制类需求优先复用 `support_disease_limit_clinic_flag`，避免新增参数。
- 前后端双校验：前端提示 + 后端兜底，防止接口被绕过。

## 升格建议

- [ ] workflow
- [ ] skill / patterns
- [ ] rule
- [x] 无需升格，保留 case 即可
