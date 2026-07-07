# [202240] 特殊病种白名单前缀匹配开方校验
> **文件名**：`202240-特殊病种白名单前缀匹配+checkDiseaseLimit-whiteList.md`


> 状态：`released`  
> 日期：2026-06-11  
> 域：门诊 / 医嘱 / 药库

---

## 背景

- **需求**：特殊病种用药维护白名单前缀后，门诊开方应与前缀匹配联动；不能只依赖「特殊病种药品分发」
- **项目**：【漳州二院】→ `release-1.166`
- **仓库**：`onelink-micro-pres-fj-common`（仅后端）

## 问题 / 目标

`checkDiseaseLimit` 仅查 `COM_SPECIAL_DISEASE_DRUG_CONFIG`。白名单前缀在 `COM_SPECIAL_DISEASE_DRUG_BLACK_CONFIGATION`，须执行「一键分发」才会写入分发配置；未分发时开方被误拦。

**目标**：分发配置 **或** 白名单前缀匹配（排除黑名单）→ 均允许开方。

## 根因与正确做法

- **开方入口**：`PrescribeServiceImpl.checkDiseaseLimit`（系统参数 `support_disease_limit_drug_flag` 开启时）
- **白名单逻辑**：复用 optimus `getDrugInClass` 规则——`DIC_DRUG_DICT.national_insur_code` 匹配 `COM_SPECIAL_DISEASE_DRUG_BLACK_CONFIGATION.NATIONAL_INSUR_CODE_PREFIX`，并排除 `COM_SPECIAL_DISEASE_DRUG_BLACK_CONFIG`
- **实现**：`PrescribeRecordDao.getDrugCodesMatchedByWhiteListPrefix`，在 Service 中与 `getConfigByDrugCodes` 结果合并为 `allowedDrugCodes`

## 涉及表 / 接口

| 表/接口 | 说明 |
|---------|------|
| `ZOECOMM.COM_SPECIAL_DISEASE_DRUG_CONFIG` | 特殊病种药品分发（原有校验） |
| `ZOECOMM.COM_SPECIAL_DISEASE_DRUG_BLACK_CONFIGATION` | 白名单国家医保编码前缀 |
| `ZOECOMM.COM_SPECIAL_DISEASE_DRUG_BLACK_CONFIG` | 黑名单药品（前缀匹配后仍排除） |
| `ZOEDICT.DIC_DRUG_DICT` | `national_insur_code` 前缀匹配 |
| `saveWesternMedicineAndApply` → `checkDiseaseLimit` | 开方校验链 |

## 发布

| 项 | 值 |
|----|-----|
| master commit | `394caa70c` |
| release-1.166 | cherry-pick `1a23ea3e3`（全量 merge 多文件冲突，改 cherry-pick） |
| tag | `release-1.166.31` |

## 测试要点

1. `support_disease_limit_drug_flag = 1`
2. 配置白名单前缀（如 `XN05`），**不**一键分发
3. 开方 `national_insur_code` 以此前缀开头的药品 → 应成功
4. 同药品加入黑名单 → 应拦截
5. 已在分发配置中的药品 → 仍应成功

## 可复用经验

- 特殊病种开方限制 = 分发表 + 白名单前缀（实时 SQL），不必依赖一键分发同步
- pres 仓 merge 到 `release-1.166` 易冲突，单 commit 优先 **cherry-pick**
- Windows Agent 提交用 `git-core\git.exe commit-tree` 避免 `Co-authored-by: Cursor` 注入
