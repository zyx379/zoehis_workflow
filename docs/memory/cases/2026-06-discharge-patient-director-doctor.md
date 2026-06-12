# [203174] 出院病人查询主管医生取 PAT_IN_HOSPITAL 优先

> 状态：`verified`  
> 日期：2026-06-11  
> 域：住院 / 病人管理 / 随访

---

## 背景

- **需求**：出院病人查询/随访页面「主管医生」列应显示住院期间最新管床医生，而非入院登记时的医生
- **页面**：`dischargePatientInfo.vue`（出院病人查询/随访）
- **仓库**：`onelink-micro-pres-fj-common`
- **文件**：`PatientVisitInfoDaoRepeat.xml` → `getDischargeHospitalPat`

## 问题 / 目标

原 SQL 仅从 `PAT_ADMISSION_RECORD.director_doctor_code` 取主管医生；住院期间管床医生变更后，该字段可能滞后于 `PAT_IN_HOSPITAL.director_doctor_code`。

## 根因与正确做法

- **根因**：出院查询未关联在院主表，主管医生来源单一
- **做法**：
  1. 左外连接 `PAT_IN_HOSPITAL h`（`event_no`、`patient_id`）
  2. 员工姓名子查询使用 `nvl(h.director_doctor_code, a.director_doctor_code)`
  3. 主查询与 `union all` 婴儿段同步改造

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| PAT_IN_HOSPITAL | SELECT（左外连接） | 优先取 DIRECTOR_DOCTOR_CODE |
| PAT_ADMISSION_RECORD | SELECT | fallback |
| getDischargeHospitalPat | API | `/pres-service/api/patientManage/getDischargeHospitalPat` |

## 测试要点

- 找一名出院病人：`PAT_IN_HOSPITAL` 与 `PAT_ADMISSION_RECORD` 的 `DIRECTOR_DOCTOR_CODE` 不一致
- 出院病人查询页面「主管医生」列应显示 `PAT_IN_HOSPITAL` 对应医生姓名
- 两表一致时结果与改造前相同；婴儿行与母亲住院记录一致

## 关联 commit

- `[203174]【漳州市医院】出院病人查询主管医生取PAT_IN_HOSPITAL优先`
- master：`2d7a0a556`
- release-1.168 cherry-pick：`a2be8338b`
- tag：`release-1.168.52`

## 交付备注

- master → release-1.168 全量 merge 冲突多，改用 **cherry-pick** 单 commit
- 远程已有 `release-1.168.51`，本次打 tag **`release-1.168.52`**
