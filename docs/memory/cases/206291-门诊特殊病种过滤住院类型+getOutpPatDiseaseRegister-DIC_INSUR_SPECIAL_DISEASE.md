# [206291] 门诊特殊病种过滤住院类型
> **文件名**：`206291-门诊特殊病种过滤住院类型+getOutpPatDiseaseRegister-DIC_INSUR_SPECIAL_DISEASE.md`

> 状态：`released`  
> 日期：2026-07-09  
> 域：门诊 / 医保 / 医嘱开单

---

## 背景

- **需求**：门诊特殊病种选择时，不能选择类型为住院的病种
- **项目**：【漳州市医院】→ `release-1.168`
- **页面**：门诊诊病 → 西药/中药开单特殊病种下拉

## 问题 / 目标

`getOutpPatDiseaseRegister` 查询病人已登记病种时，未按 `DIC_INSUR_SPECIAL_DISEASE.OUTP_INP_CODE` 过滤，住院类型病种会出现在门诊下拉中。

## 根因与正确做法

- **入口**：outp-web → pres `getOutpPatDiseaseRegister` → charge `PatientDiseaseRegisterInnerController.findList`
- **SQL**：`PatientDiseaseRegisterDao.xml` 的 `findList` 仅用子查询取名称，未排除 `OUTP_INP_CODE='2'`
- **遗漏点**：同 Controller 在 `insur_patient_is_exists_disease_code=1` 时会合并 `getDefaultDisease()`，该 SQL 也未过滤

**改造**：charge 仓单文件，两条 SQL 同步排除住院类型：

```sql
-- findList
AND NOT EXISTS (
  SELECT 1 FROM ZOEDICT.DIC_INSUR_SPECIAL_DISEASE dt
  WHERE dt.DISEASE_CODE = t.DISEASE_CODE AND dt.OUTP_INP_CODE = '2'
)

-- getDefaultDisease
AND (t.OUTP_INP_CODE IS NULL OR t.OUTP_INP_CODE IN ('0','1',''))
```

`IO_FLAG_DICT`：`0`全部、`1`门诊、`2`住院。

## 涉及表 / 接口

| 表/接口 | 说明 |
|---------|------|
| `ZOEPATIENT.PAT_PATIENT_DISEASE_REGISTER` | 病人已登记病种 |
| `ZOEDICT.DIC_INSUR_SPECIAL_DISEASE` | 特殊病种字典，`OUTP_INP_CODE` |
| `/inner/patientDiseaseRegister/findList` | charge Inner 接口 |
| `getOutpPatDiseaseRegister` | pres 对外接口 |

## 发布

| 项 | 值 |
|----|-----|
| master commit | `5df979ac16` |
| release-1.168 | cherry-pick `d56c69587f`（全量 merge 多文件冲突） |
| tag | `release-1.168.123` |

## 测试要点

1. 门诊开单特殊病种下拉不出现 `OUTP_INP_CODE='2'` 的病种
2. `insur_patient_is_exists_disease_code=1` 医保病人合并默认病种后仍无住院项
3. 住院 `saveDiseaseInfo` 不受影响（不走 findList）

## 可复用经验

- 门诊特殊病种下拉 = `findList` + 条件合并的 `getDefaultDisease`，改一处须查 InnerController 是否合并第二数据源
- charge 仓 merge `release-1.168` 易冲突，单 commit 优先 **cherry-pick**
- `findList` 当前仅门诊 Inner 调用，可在 SQL 层直接过滤（无需新增参数）
