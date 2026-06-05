# [201533] 住院非医疗项目收费打开不默认患者

> 状态：`verified`  
> 日期：2026-06-05  
> 域：收费 / 住院

---

## 背景

- **需求**：打开「住院非医疗项目收费」页面时不要默认选中患者
- **页面/菜单**：住院护士站 → 费用管理 → 住院非医疗项目收费（卫材）；路由 `/charge/billingFeeManage/nonMedicalCost`
- **仓库**：`onelink-web-his-charge-fj-common`
- **文件**：`pages/charge/billingFeeManage/nonMedicalCost.vue`

## 问题 / 目标

进入页面后左侧 `dept-patient-tree` 因 `:firstTreeNode="true"` 自动选中第一个床位，联动读卡条带出患者并加载单据；需改为进入时空白，由护士手动选患者或读卡。

## 根因与正确做法

- **根因**：`dept-patient-tree` 的 `firstTreeNode` 为 true 时，树加载后会 `selectFirstTree` 选中第一个子节点，触发 `@nodeSelect` → `cardStrip.refresh` → `readCardSuc`。
- **做法**：将 `:firstTreeNode="true"` 改为 `:firstTreeNode="false"` 即可（本需求**不需**页面参数 `select_first_tree_node`，与禅道 136645 的 `documentDeduction.vue` 参数化方案区分）。
- **参考**：136645 在 `documentDeduction.vue` 用 `firstTreeNode` 数据项 + `$getPageControlMap(select_first_tree_node)`；同类「不要默认患者」若院方无多院差异，直接写死 `false` 更简单。

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| — | — | 纯前端，无表/SQL |

## 测试要点

- 界面步骤：住院 `outpInpCode=2`、非单病人模式打开页面 → 病人树无选中、读卡条无患者、主细表为空；手动点选患者后正常加载。
- MCP 造数：无

## 关联 commit

- `[201533]【漳州市医院】住院非医疗项目收费，打开不要默认患者`
- 发布 tag：`release-1.168.23`（`onelink-web-his-charge-fj-common`）

## 可复用结论

- 住院页「不要默认患者」：查 `dept-patient-tree` 的 `:firstTreeNode`，改为 `false`。
- 发布：`【漳州市医院】` → `release-1.168`；与 master 差距大时 **cherry-pick** 单 commit，避免全量 merge 多文件冲突。
- 误打 tag（merge 未完成）时：用下一序号 tag（如 `.23`）指向含修复的 commit，以新 tag 发布。

## 升格建议

- [x] skill（默认提交后编译、默认 Step 12 沉淀）
- [ ] workflow
- [ ] rule
- [ ] 无需升格，保留 case 即可

**说明**：skill 已补充交付默认行为；本 case 保留作页面改造检索。
