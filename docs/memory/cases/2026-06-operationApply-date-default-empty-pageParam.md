# [202235] 手术申请单预计手术时间默认为空（页面参数控制）

> 状态：`verified`
> 日期：2026-06-06
> 域：住院 / 处方

---

## 背景

- **需求**：新建手术申请单时「预计手术时间」默认为空且必填，通过页面参数控制（默认行为不变）
- **页面/菜单**：住院医嘱 → 手术申请
- **仓库**：`onelink-web-pres-fj-common`
- **文件**：`components/presManage/operationApplication.vue`

## 问题 / 目标

- 原逻辑：`newOpenFun` 中 `operationDate: t`（默认服务器当前时间）
- 目标：通过页面参数 `oper_date_default_empty` 控制默认值为空

## 根因与正确做法

### 错误做法 1（已修正）

最初误用**系统参数** `$getSysParamList` + 参数名 `OPERAT_OPER_DATE_DEFAULT_EMPTY` 来控制。

### 错误做法 2（已修正）

最初改错仓库，改到了 `onelink-web-outp-fj-common`（门诊前端），实际手术申请单在 `onelink-web-pres-fj-common`（处方前端）。

### 正确做法

手术申请单的开关类配置统一走 **`$getPageControlMap(configId='130201')` 页面参数**路径，与同文件的 `planning_code_flag`、`accelerated_rehabilitation_code_flag` 保持一致。

**改动模式（3 处）：**

1. **`data()` 声明变量**：
   ```js
   operDateDefaultEmptyFlag: null, // 预计手术时间默认为空
   ```

2. **`$getPageControlMap` 回调中读取**：
   ```js
   this.operDateDefaultEmptyFlag = !$.zoe.isNullOrEmpty(map[configId].oper_date_default_empty) && map[configId].oper_date_default_empty.state * 1 === 1
   ```

3. **使用处条件判断**：
   - `newOpenFun`：`operationDate: this.operDateDefaultEmptyFlag ? '' : t`

### 关键区分

| 类型 | API | 用途 | 示例 |
|------|-----|------|------|
| **系统参数** | `$getSysParamList` | 全局配置、跨页面共享 | `OPERAT_EXPECT_OPERATION_TIME` |
| **页面参数** | `$getPageControlMap(configId)` | 单页面开关/默认值 | `oper_date_default_empty` |

**页面参数 key 命名风格**：snake_case，与代码变量 camelCase 对应。

## 仓库识别

| 仓库 | 域 | 是否涉及 |
|------|-----|---------|
| `onelink-web-pres-fj-common` | 处方前端（住院手术申请） | ✅ 正确仓库 |
| `onelink-web-outp-fj-common` | 门诊前端（门诊手术申请） | ❌ 非本次需求 |

**判断依据**：住院手术申请单在处方前端 `components/presManage/operationApplication.vue`，门诊手术申请在门诊前端。

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| 页面控制表 (configId=130201) | 需运维配置 | 新增 `oper_date_default_empty` 字段，state=1 生效 |

## 测试要点

- 运维在 configId=130201 中配置 `oper_date_default_empty` 的 state=1
- 新建手术申请单 → 预计手术时间为空 → 必填校验触发
- 不配置或 state=0 → 保持原逻辑（默认当前时间）

## 关联 commit

- master: `273fc29f` `[202235]【漳州二院】手术申请单预计手术时间默认为空（页面参数控制）`
- release-1.166: `1060443b` (cherry-pick)
- tag: `release-1.166.16`

## 可复用结论

1. **手术申请单页面（configId=130201）的开关类需求，统一走 `$getPageControlMap` 而非 `$getSysParamList`**
2. **页面参数新增模式固定**：data 声明 → getPageControlMap 回调赋值 → 使用处三元条件
3. **参数 key 命名 snake_case**，与现有 flag（如 `planning_code_flag`）保持一致风格
4. **仓库识别**：住院手术申请 → `onelink-web-pres-fj-common`；门诊手术申请 → `onelink-web-outp-fj-common`

## 升格建议

- [x] skill / patterns — 已沉淀为本 case，建议后续同类需求直接检索复用
- [ ] workflow — 可考虑在工作流 Step 1 增加「仓库识别」+「参数体系识别」检查项
- [ ] rule — 无需升格
