# [203170] 煎药确认申请单重制打印次数控制

> 状态：`verified`
> 日期：2026-06-11
> 域：药库 / 处方重制

---

## 背景

- **需求**：票据 `CHINESE_COOKING_CONFIRM_APPLY_INP` / `CHINESE_COOKING_CONFIRM_APPLY_OUTP`（煎药确认申请单），在**处方重制**时可选择打印次数，由页面参数控制
- **项目**：漳州二院
- **页面/菜单**：药库 → 住院/门诊处方重制

## 问题 / 目标

- 重打代煎单时，运维可配置是否显示「重制次数」输入框，按次数顺序多次打印
- 默认关闭（`state=0`），行为与改造前一致（打印 1 次）

## 根因与正确做法

### 错误做法（已回退）

Step 4 仅按票据业务 ID `CHINESE_COOKING_CONFIRM_APPLY_*` grep，误改 **pres 前端煎药管理页**：

| 误改文件 | 说明 |
|----------|------|
| `onelink-web-pres-fj-common/.../chineseCookingSure.vue` | 煎药确认，非「处方重制」入口 |
| `onelink-web-pres-fj-common/.../chineseCookingQuery.vue` | 煎药查询补打，非本次菜单 |

同一票据 ID 在 **药库处方重制** 与 **pres 煎药管理** 均有使用，须用**菜单路由**区分，不能单靠 businessId。

### 正确仓库与页面

| 路由 | 文件 | 票据 / 入口 |
|------|------|-------------|
| `/his-drug-web/hospatientDispensManage/inpatientDispenseReset` | `inpatientDispenseReset.vue` | checkbox `12` → `CHINESE_COOKING_CONFIRM_APPLY_INP` |
| `/his-drug-web/outpatientDispensManage/outpatientDispenseReset` | `outpatientDispenseReset.vue` | 代煎单 flag `6` → `CHINESE_COOKING_CONFIRM_APPLY_OUTP` |

**仓库**：`onelink-web-his-drug-fj-common`（药库前端）

### 实现要点

**页面参数**（非系统参数）：

- key：`cooking_print_repeat_count`
- 读取：`getMenuCustom()` → `$getPageControlMap(configId)`
- 变量：`cookingPrintRepeatCount`

**住院**（`inpatientDispenseReset.vue`）：

- `specialDeptCode == 6` 时显示「重制次数」`zoehis-input-number`（1–99）
- `newPrintFun(..., repeatCount)`，case `12` 传入 `getCookingRepeatCount()`
- Promise 链顺序调用 `odtprinter.print`，打印后 `loopCount = 1`

**门诊**（`outpatientDispenseReset.vue`）：

- 与已有 `loop_count_falg` 并存；UI 条件：`(loopCountFalg || cookingPrintRepeatCount) && detpType=='6'`
- `newPrintFun(flag=6)` 启用时按 `loopCount` 顺序打印（勿用并行 for + 异步，易乱序）

## 仓库识别

| 仓库 | 是否涉及 |
|------|----------|
| `onelink-web-his-drug-fj-common` | ✅ 正确 |
| `onelink-web-pres-fj-common` | ❌ 误改已 revert |

**判断依据**：需求描述「重制」+ 用户给定路由 `inpatientDispenseReset` / `outpatientDispenseReset` → 药库前端；pres 煎药页为业务流程另一入口。

## 涉及表 / 接口

| 类型 | 说明 |
|------|------|
| 页面控制（configId=对应重制菜单） | 运维配置 `cooking_print_repeat_count`，state=1 |
| 打印 | `Laydrugrecords.getTemplateAndId` + `$printOptionEve` + `odtprinter.print` |

## 测试要点

1. 配置 `cooking_print_repeat_count=1`
2. **住院重制**：勾选「住院中药代煎单」→ 输入次数 → 重制 → 顺序出 N 份
3. **门诊重制**：勾选「代煎单」→ 同上
4. 关闭参数 → 不显示次数框，仍打印 1 份
5. 确认 pres 煎药确认/查询页**无**本次改动

## 关联 commit / tag

| 仓库 | master | release-1.166 | tag |
|------|--------|---------------|-----|
| onelink-web-his-drug-fj-common | `03ac334d` | cherry-pick `4356269b` | `release-1.166.28` |
| onelink-web-pres-fj-common | revert `9dd3e22c` | merge revert | `release-1.166.22` |

## 可复用结论

1. **同一 businessId 可能多入口**：代码地图须写清**菜单路由 + 子仓库**，grep businessId 不足
2. **「重制」类需求**优先查 `*DispenseReset.vue`（药库 `hospatientDispensManage` / `outpatientDispensManage`）
3. **页面参数模式**：data 声明 → `getMenuCustom`/`pageParameters` 读 map → UI/打印逻辑三元或 repeatCount
4. **多次 odtprinter.print**：Promise 链串行，禁止 for 循环内不 await 并发打
5. **门诊重制**已有 `loop_count_falg` 时可复用 `loopCount` UI，新 param 与之 OR 即可

## 升格建议

- [x] cases — 本文件
- [ ] skill `zoehis-code-map` — 可增加「businessId 多入口 → 查 DispenseReset + 菜单路由」检查项
- [ ] rule — 无需单独 rule
