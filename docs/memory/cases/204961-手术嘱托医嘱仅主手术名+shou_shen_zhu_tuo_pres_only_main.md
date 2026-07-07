# [204961] 手术申请嘱托医嘱只显示主手术名称
> **文件名**：`204961-手术嘱托医嘱仅主手术名+shou_shen_zhu_tuo_pres_only_main.md`


> 状态：`verified`（master 已 push；release 待合并）  
> 日期：2026-06-25  
> 域：住院 / 手术申请 / 嘱托医嘱

---

## 背景

- **需求**：住院手术申请发送后生成的嘱托医嘱 `itemName`，希望可配置为**只显示主手术名称**，不再拼接附加手术（operationName1~10）
- **项目**：【漳州二院】→ `release-1.166`（待 merge/tag）
- **仓库**：`onelink-micro-pres-fj-common`（仅后端，无前端改动）

## 问题 / 目标

即使已配置系统参数 `shou_shen_zhu_tuo_pres_name`（自定义「拟定于…」模板，`{3}`=主手术名称），`createOperateEntrustPres` 仍会在 `itemName` 后硬拼接 `+operationName1~10`，导致嘱托医嘱名称过长。

## 根因与正确做法

| 项 | 说明 |
|----|------|
| **入口** | `OperationApplyServiceImpl.send()` → `createOperateEntrustPres()`（**仅住院**） |
| **现有参数** | `shou_shen_zhu_tuo_pres_name`（文本，`String.format` 占位符 `{0}`~`{4}`） |
| **根因** | `setItemName` 在 format 之后无条件拼接 operationName1~10 |
| **改法** | 新增布尔系统参数 `shou_shen_zhu_tuo_pres_only_main`（默认 `"0"`）；`"1"` 时只 `setItemName(trim(itemName))` |

**门诊** `createOutpOperateEntrustPres`：**本次不改造**（用户确认）。

## 参数配置（漳州二院示例）

| 参数 | 值 | 说明 |
|------|-----|------|
| `shou_shen_zhu_tuo_pres_only_main` | `1` | 不拼接附加手术名称 |
| `shou_shen_zhu_tuo_pres_name` | （可选）含 `{3}` 的自定义模板 | 与 170868 原参数配合 |

占位符（`shou_shen_zhu_tuo_pres_name`）：`{0}`=日期文案、`{1}`=麻醉分类、`{2}`=部位、`{3}`=主手术名称、`{4}`=方位。

## 涉及文件

| 路径 | 改动 |
|------|------|
| `.../operation/impl/OperationApplyServiceImpl.java` | `createOperateEntrustPres` 读取 `shou_shen_zhu_tuo_pres_only_main` 分支拼接 |
| `params/PresBizSysParam.jsonl` | 新增参数种子（**单独 commit**） |

不涉及表结构变更；写入 `PRES_INP_PRES_RECORD.ITEM_NAME`。

## 测试要点

1. `shou_shen_zhu_tuo_pres_only_main=0`（或未配）：行为与改造前一致，含 `+附加手术名`
2. `=1`：住院手术申请发送后，嘱托医嘱名称仅主手术（按 `shou_shen_zhu_tuo_pres_name` 或默认「拟定于…」格式）
3. 门诊手术申请：行为不变
4. 临床路径发送：与住院手术申请相同入口，一并回归

## 关联 commit

| 类型 | commit | 说明 |
|------|--------|------|
| 功能 | `b0c6a9e77` | `[204961]【漳州二院】手术申请嘱托医嘱只显示主手术名称` |
| 参数 | `820d3d462` | `[*111111*]增加系统参数【shou_shen_zhu_tuo_pres_only_main】【204961】` |

## 可复用结论

1. **名称模板参数 ≠ 最终 itemName**：若代码在 format 后还有硬编码拼接，须单独开关或改拼接点
2. **手术申请嘱托命名走系统参数**（`ParamCacheUtil`），与页面参数 configId=130201 的 UI 开关分离
3. **布尔开关默认 `"0"`**，兼容未配置医院；jsonl 与功能代码分 commit

## 相关 case

- [202235 手术申请页面参数](2026-06-operationApply-date-default-empty-pageParam.md) — 页面参数 vs 系统参数区分
- [202235 闭环 NPE](2026-06-operationApply-send-null-date-npe.md) — 同 `OperationApplyServiceImpl` 嘱托医嘱生成

## 升格建议

- [x] `business-rules.md` — 手术申请嘱托医嘱命名参数
- [ ] rule/skill — 已有系统参数规范，无需重复
