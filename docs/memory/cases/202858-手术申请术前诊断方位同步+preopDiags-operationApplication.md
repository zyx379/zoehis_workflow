# [202858] 手术申请保存时术前诊断未同步方位
> **文件名**：`202858-手术申请术前诊断方位同步+preopDiags-operationApplication.md`


> 状态：`verified`（含 2026-06-11 返工）  
> 日期：2026-06-10  
> 域：住院

---

## 背景

- **需求**：保存手术时产生的术前诊断未同步方位
- **页面/菜单**：住院医嘱 → 手术申请
- **仓库**：`onelink-web-pres-fj-common`
- **文件**：`components/presManage/operationApplication.vue`

## 问题 / 目标

保存手术申请单时，术前诊断（含方位信息）未传递给后端，导致已开具的手术申请单列表中术前诊断显示不完整（缺少方位）。

## 根因与正确做法

**根因**：父子组件数据同步是单向的。
- 子组件 `operateApplication.vue` 的 `getDiagnosisList()` 获取诊断后赋值 `this.formData.preopDiags = data`
- 父组件 `operationApplication.vue` 的 `watch.formData` 只做父→子单向同步（`this.$refs.opApplicationRef.formData = this.formData`）
- 父组件 `saveForm` 中 `const obj = Object.assign({}, this.formData)` 时，`obj.preopDiags` 始终为空数组 `[]`

**修复**：在 `saveForm` 中保存前从子组件取最新 `preopDiags` 赋值给 `obj`：
```js
const obj = Object.assign({}, this.formData);
// 从子组件同步术前诊断数据（子组件 getDiagnosisList 更新 preopDiags 后不会回同步到父组件）
obj.preopDiags = this.$refs.opApplicationRef.formData.preopDiags || [];
```

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| `OperationApply.save` | POST | 手术申请保存接口，接收 `preopDiags` 数组 |

## 测试要点

- 界面步骤：
  1. 进入住院医嘱 → 手术申请
  2. 录入术前诊断（含方位，如"右下"）
  3. 保存手术申请单
  4. 查看已开申请单列表，确认术前诊断显示完整（含方位）

## 关联 commit

- `[202858]【漳州二院】保存手术时产生的术前诊断未同步方位`
- `[202858]【漳州二院】手术申请列表术前诊断回显遗漏方位`（返工：getOperationApplys 拼接遗漏 diagDirectionCode）

## 返工记录（2026-06-11）

- **现象**：列表术前诊断仍缺方位（保存已正确）
- **根因**：`getOperationApplys()` 回显字符串未拼 `diagDirectionCode`
- **修复**：与子组件 `getDiagnosisList()` 一致：方位+部位+名称+说明

## 可复用结论

- 父子组件通过 `watch` 同步 `formData` 时，若子组件独立修改了 `formData` 的某个字段（如通过 API 获取后赋值），父组件保存时需手动从子组件 `ref` 取最新值
- 类似场景：子组件通过 API 获取数据回填表单字段，父组件保存时遗漏该字段
- **同一字段多处拼接展示**（保存 vs 列表回显）须逐一核对；修一处不代表另一处已对齐

## 升格建议

- [ ] 无需升格，保留 case 即可
