# [206301] 入院登记/住院信息修改选择主管医生同步医疗组
> **文件名**：`206301-入院登记主管医生同步医疗组+hospitalizationForm-clinicGroup.md`


> 状态：`verified`
> 日期：2026-07-03
> 域：收费 / 住院登记

---

## 背景

- **需求**：入院登记、住院信息修改界面，选择住院主管医生后自动同步医疗组（住院医生责任组）及主任医生
- **项目**：[206301]【漳州二院】
- **仓库**：`onelink-web-his-charge-fj-common`
- **核心组件**：`components/common/hospitalizationForm.vue`（入院登记 page-type=3、住院信息修改 page-type=1 共用）

## 根因

- 已有 `clinicGroupChange`：选医疗组 → 清空主管/主任医生
- 已有 `getParentGroupCodeListDataAjax(1)`：按员工号查医疗组并选第一个、带出主任医生，但 **无调用点**
- 主管医生下拉仅有 `@visible-change`，缺少 `@selected`

## 实现

1. 主管医生 `zoehis-select` 增加 `@selected="directorDoctorChange"`
2. `directorDoctorChange`：
   - `staffByClinicGroupFlag===true` 时 return（页面参数，医疗组→医生模式）
   - 主管医生为空 → 清空医疗组、主任、`parentClinicGroupData`
   - 否则 `getParentGroupCodeListDataAjax(1)`
3. **`setFormData` 不触发同步**，避免修改界面回显被覆盖

## 页面参数

| key | configId | 说明 |
|-----|----------|------|
| `staffByClinicGroupFlag` | 420104 入院登记 / 420105 住院信息修改 | =1 时主管医生按医疗组筛选，跳过反向同步；漳州二院现场未维护，默认 0 |

## 参考

- 入科界面 `inDepartment.vue` 的 `directorDoctorChange` 依赖 `selectRow.clinicGroupCode`；本组件主管医生来自科室员工接口，宜用 `getGroupListByStaffNo` 查询

## 交付

- master：`b313ed26`
- release-1.166：cherry-pick（全量 merge 有多文件冲突）
- tag：`release-1.166.50`

## 测试要点

- 入院登记：选主管医生 → 医疗组 + 主任自动填充；换人随动；清空/无组时字段清空
- 住院信息修改：回显不变；改主管医生后医疗组/主任同步
