# [203042] 双向转诊表单优化
> **文件名**：`203042-双向转诊表单优化+TRANSFER_REASON-referralForm.md`


> 状态：`verified`  
> 日期：2026-06-10  
> 域：门诊 / 双向转诊

---

## 背景

- **需求**：摘要 placeholder 改为「输入病情摘要及下一步诊疗计划」；转诊原因参考省平台，基本字典选择后可编辑
- **页面**：转诊登记 `referralRegistration.vue`
- **仓库**：`onelink-web-outp-fj-common`

## 问题 / 目标

- 原摘要 placeholder 为「输入相关内容」，与需求标注不一致
- 原转诊原因依赖页面参数 `referral_reason_select_flag` 切换下拉/文本框，且内联下拉不符合省平台「选择」弹窗单选交互

## 根因与正确做法

- **摘要**：仅改 `diseaseDesc` textarea 的 `placeholder`
- **转诊原因**：
  - 数据源：`BasicDict.findList({ dictName: 'TRANSFER_REASON' })` → `ZOEDICT.DIC_BASIC_DICT`
  - 交互：原因文本框 + 右上角「选择」按钮 → `zoehis-dialog` + `zoehis-radio-group` → 确定写入 `modifyForm.reason`，文本框可继续编辑
  - 删除 `referral_reason_select_flag` 双模式逻辑
- **运维**：在基本字典维护配置 `TRANSFER_REASON` 六项（省平台标准原因）

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| DIC_BASIC_DICT (TRANSFER_REASON) | 运维维护 | 字典项，非代码种子 |
| PatReferralRecord.saveReferralRecord | 写 | `reason`、`diseaseDesc` 字段不变 |

## 测试要点

- 摘要 placeholder 文案
- 「选择」→ 弹窗单选 → 确定填入 → 可手工修改 → 保存回显
- 字典未配置时弹窗为空，仍可手工填写原因

## 关联 commit

- master：`606a5fc0` — `[203042]【漳州市医院】双向转诊表单优化`
- release-1.168：cherry-pick `6c95f371`（冲突：release 分支旧 `reasonSelectFlag` 块 vs master 转诊医生块，保留转诊医生 + 新原因交互）
- tag：`release-1.168.27`

**二次发布（样式+住院同步）：**
- outp master：`d36156e3` → tag `release-1.168.28`
- pres master：`8e373da6` → tag `release-1.168.35`

## 二次改造（2026-06-10）

- **弹窗样式**：`append-to-body` 导致 scoped 样式未生效；改为非 scoped 的 `.referral-reason-dialog-body`，每项独立 `div` + flex 布局，长文本换行对齐
- **pres 同步**：`onelink-web-pres-fj-common/components/patientManage/referralRegistration.vue`（住院转诊登记页 `referRegistration.vue` 引用）

**基本字典 + 弹窗单选 + 可编辑文本框**（比内联 `zoehis-select` 更贴近省平台）：

```javascript
this.$api.BasicDict.findList({ dictName: 'TRANSFER_REASON' }).then(data => {
  this.referralReason = data
})
```
