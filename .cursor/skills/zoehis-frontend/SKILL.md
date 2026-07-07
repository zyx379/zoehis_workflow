---
name: zoehis-frontend
description: >
  ZOEHIS frontend development: Nuxt/Vue 2.6 pages, zoehis-* components, API layer.
  Use when modifying Vue pages, creating UI components, fixing CSS/layout, adding form
  fields/buttons/tables, writing $httpVue API calls, using zoehis-select/zoehis-table/
  zoehis-input/etc. component APIs.
  Keywords: 前端, 页面, 组件, UI, 界面, 样式, 按钮, 表格, 输入框, API调用,
  弹窗, 对话框, 选择器, 表单, 布局, 树形, 菜单, 导航, Nuxt, Vue, SCSS
---

# ZOEHIS 前端开发

福建通用 HIS 前端开发规范与组件 API。负责 Vue 页面 / 组件 / API 调用层 / 样式。

## 子仓库定位（关键）

> **所有子仓库均位于工作区根目录 `{workspaceRoot}/` 下**（如 `d:\zoe_work_space\fj-common\onelink-web-pres-fj-common`）。
> **禁止**用 Glob `**/{repo-name}/**` 搜索子仓库（会返回空）。应直接 `LS {workspaceRoot}/{repo-name}/` 或 `Read {workspaceRoot}/{repo-name}/...` 访问。

前端子仓库：

| 仓库 | 域 | 实际路径 |
|------|-----|----------|
| onelink-web-outp-fj-common | 门诊前端 | `{workspaceRoot}/onelink-web-outp-fj-common/` |
| onelink-web-pres-fj-common | 医嘱前端 | `{workspaceRoot}/onelink-web-pres-fj-common/` |
| onelink-web-his-charge-fj-common | 收费前端 | `{workspaceRoot}/onelink-web-his-charge-fj-common/` |
| onelink-web-his-drug-fj-common | 药库前端 | `{workspaceRoot}/onelink-web-his-drug-fj-common/` |
| onelink-web-his-fj-component | 公共组件 | `{workspaceRoot}/onelink-web-his-fj-component/` |
| onelink-web-cis-common | CIS 公共组件（npm 包） | `{workspaceRoot}/onelink-web-cis-common/` |

## 技术栈

- **框架**：Nuxt 2 + Vue 2.6
- **API 风格**：Options API（非 Composition API）
- **组件**：`zoehis-*` 自研组件库（非 Element UI）
- **样式**：`<style lang="scss" scoped>`；路径别名 `~/`
- **状态管理**：Vuex（复用 `@zoesoft.com.cn/onelink-client-core/store`）
- **格式化**：Prettier（semi=false, singleQuote=true, 缩进 2 空格）

## 代码风格

```vue
<script type="text/ecmascript-6">
export default {
  props: {
    value: { type: String, required: true, default: '' }
  },
  data() { return {} },
  watch: { value(val) { this.$emit('input', val) } },
  methods: {}
}
</script>
<style lang="scss" scoped></style>
```

## API 文件模式

```javascript
const baseUrl = '/charge-service/api/Module/'
export default class ModuleApi {
  constructor(config) { this.$httpVue = config.$httpVue }
  /** @description 查询列表 */
  queryList(query, config) {
    return this.$httpVue().post(baseUrl + 'queryList', query, config)
  }
}
```

- 目录：`api/{kebab-service}/.../{PascalCase}.js`
- 构造函数注入 `$httpVue`
- JSDoc 注释方法
- Promise `.then().catch()` 链式调用（优先于 async/await）

## Mixin 模式

```javascript
export default { methods: { $methodName() { ... } } }
```
- 方法名 `$` 前缀
- 依赖全局对象（window.eedjs, window.userInfo）
- Promise 链式调用

## 页面/组件目录规范

```
pages/{camelCase}/          -- 页面目录
components/{同名}/          -- 组件目录（与页面同名）
api/{kebab-service}/.../{PascalCase}.js  -- API 文件
```

## zoehis-* 组件 API

详细组件 API 文档见 [docs/frontend-components.md](docs/frontend-components.md)。高频组件速查：

| 组件 | 用途 | 关键 Props |
|------|------|-----------|
| `zoehis-input` | 输入框 | v-model, type(text/password/textarea), max-length, error-tip, width |
| `zoehis-input-number` | 计数器 | v-model, min, max, step, precision |
| `zoehis-select` | 单选下拉 | v-model, :selectdata, itemcode, itemtext, filterable, virtual-scroll |
| `zoehis-multiple-select` | 多选下拉 | v-model(Array), :selectdata, collapse-tags, filterable |
| `zoehis-radio` | 单选框 | v-model, :label |
| `zoehis-checkbox` | 复选框 | v-model(Boolean), :label, :true-label, :false-label |
| `zoehis-switch` | 开关 | v-model(Boolean), active-text, inactive-text |
| `zoehis-date-picker` | 日期 | v-model, type(date/daterange/datetime), format |
| `zoehis-time-picker` | 时间 | v-model, format, is-range |
| `zoehis-form` | 表单 | :model, :rules, label-width |
| `zoehis-button` | 按钮 | type(default/primary/features/plain), size, disabled, :keyboard |
| `zoehis-button-group` | 按钮组 | :activedLabel, direction, overflag |
| `zoehis-table` | 表格（核心） | :data, :configs, keycode, checkbox, pageflag, :page-param, virtual-scroll |
| `zoehis-table-plus` | 增强表格 | 继承 table + tab-id, menu-id, :api-list |
| `zoehis-tree` | 树形 | :data, :props, showcheckbox, highlightcurrent, lazy, :load |
| `zoehis-dialog` | 对话框 | visible(.sync), title, width, modal, supportdrag |
| `zoehis-drawer` | 抽屉 | visible, title, direction(ltr/rtl), size |
| `zoehis-menu`/`zoehis-menu-group` | 菜单 | value, type, menuList |
| `zoehis-tab` | 标签页 | tabList, itemcode, itemtext, currentId |
| `zoehis-container`/`zoehis-header`/`zoehis-footer`/`zoehis-aside` | 布局 |
| `zoehis-row`/`zoehis-col`/`zoehis-col-item` | 栅格布局 | gutter, span, label, labelWidth |
| `zoehis-page` | 分页 | stripCount, current_page, set_strip |
| `zoehis-transfer` | 穿梭框 | searchflag, leftTitle, rightTitle |
| `zoehis-tag` | 标签 | type(plain/success/info/warning/danger) |
| `zoehis-scrollbar` | 滚动条 | native, wrapClass |
| `zoehis-empty` | 空状态 | description |
| `zoehis-collapse`/`zoehis-collapse-item` | 折叠面板 | accordion, name, title |
| `zoehis-descriptions`/`zoehis-descriptions-item` | 描述列表 | title, column, label, size |

## 关联

- **编排 Skill**：[zoehis-ai-dev](../zoehis-ai-dev/SKILL.md) — 全栈功能改造时由此编排
- **后端 Skill**：[zoehis-backend](../zoehis-backend/SKILL.md)
- **业务 Skill**：[zoehis-business](../zoehis-business/SKILL.md)
- **组件 API 详情**：[docs/frontend-components.md](docs/frontend-components.md)
- **工作流**：[docs/workflow.md](../../../docs/workflow.md)
- **经验记忆**：[docs/memory](../../../docs/memory/README.md)
