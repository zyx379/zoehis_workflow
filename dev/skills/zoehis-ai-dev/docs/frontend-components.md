# onelinkUI 组件API文档

> 来源：zoehisUI.js 编译产物 + 项目实际使用提取

---

## 一、Input 输入框

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| disabled | 是否禁用 | Boolean | true/false | false |
| error-tip | 错误提示的内容，为空时不显示 | String | - | "" |
| ime-mode | 设置是否允许用户激活输入中文、韩文、日文等的输入法状态 | String | auto/normal/active/inactive/disabled | disabled |
| max-length | 最大输入长度 | Number | - | - |
| min-error-width | 错误提示的最小宽度 | String/Number | - | - |
| placeholder | 默认显示的提示文字 | String | - | - |
| readonly | 原生属性，是否只读 | Boolean | true/false | false |
| show-word-limit | 是否显示输入字数统计（需配合max-length使用） | Boolean | true/false | false |
| type | 输入框类型 | String | text/password/textarea | text |
| v-model | 绑定值 | String/Number | - | - |
| width | 输入框宽度 | String/Number | - | 115 |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| focus | 焦点定位的方法 | - |
| blur | 失去焦点的方法 | - |
| select | 选中输入框内容的方法 | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| blur | 失去焦点事件 | vue事件 |
| change | 值改变事件 | 当前v-model的值 |
| clear | 点击清空按钮事件 | - |
| focus | 获得焦点事件 | vue事件 |
| input | 输入事件 | 当前v-model的值 |

---

## 二、InputNumber 计数器

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| controls | 是否使用控制按钮 | Boolean | true/false | true |
| controls-position | 控制按钮位置 | String | right | - |
| disabled | 是否禁用 | Boolean | true/false | false |
| error-tip | 错误提示的内容 | String | - | "" |
| max | 设置计数器允许的最大值 | Number | - | Infinity |
| min | 设置计数器允许的最小值 | Number | - | -Infinity |
| min-error-width | 错误提示的最小宽度 | String/Number | - | - |
| placeholder | 默认显示的提示文字 | String | - | - |
| precision | 数值精度 | Number | - | 0 |
| step | 计数器步长 | Number | - | 1 |
| v-model | 绑定值 | Number | - | - |
| width | 输入框宽度 | String/Number | - | 115 |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| focus | 焦点定位的方法 | - |
| blur | 失去焦点的方法 | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| blur | 失去焦点事件 | vue事件 |
| change | 值改变事件 | 当前v-model的值 |
| focus | 获得焦点事件 | vue事件 |

---

## 三、Select 选择器（单选）

### 属性（44个）

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| align | 设置弹出窗的位置 | String | left/center/right | left |
| before-clear | 清空前回调方法，若返回false则阻止清空 | Function() | - | - |
| before-select | 选中前回调方法，若返回false则阻止选中 | Function(val,rowdata) | - | - |
| clearable | 是否启用清空功能 | Boolean | true/false | true |
| clickselect | 模糊搜索时，单击的时候文字全选 | Boolean | true/false | true |
| defaultfirst | 下拉框中是否默认选中第一行 | Boolean | true/false | true |
| delay-time | 后端延时搜索的时间（ms） | String/Number | - | 200 |
| detailBoxHeight | 详细明细窗口的高度 | String/Number | - | 300 |
| disabled | 是否禁止操作 | Boolean | true/false | false |
| dropdown-max-width | 下拉弹出框的最大宽度 | String/Number | - | 800 |
| dropdown-width | 下拉弹出框的最小宽度 | String/Number | - | - |
| error-tip | 错误提示的内容 | String | - | "" |
| filterable | 是否可以搜索 | Boolean | true/false | false |
| filter-field | 前端需要匹配的字段 | Array | - | [名称,代码,拼音码,五笔码] |
| filter-method | 自定义过滤方法（主要用于分页） | Function(query) | - | - |
| filter-row-data | 展开下拉框时过滤前端的数据 | Function(query,item) | - | - |
| iconFont | 自定义输入框的图标样式 | String | - | "z_dropD_form" |
| ime-mode | 设置是否允许激活输入法状态 | String | auto/disabled等 | disabled |
| is-focus-dropdown | 聚焦是否显示下拉框 | Boolean | true/false | true |
| itemcode | 下拉选项的ID名称 | String | - | id |
| itemkey | 下拉选项的:key值 | String | - | itemcode的值 |
| itemtext | 下拉选项的Text名称 | String | - | text |
| max-height | 下拉框最大高度 | String/Number | - | - |
| min-error-width | 错误提示的最小宽度 | String/Number | - | - |
| no-clear-blur | 焦点离开后是否不清空输入的数据 | Boolean | true/false | false |
| no-match-text | 匹配无结果时显示的文字 | String | - | 查无数据 |
| noselect | 下拉列表是否禁止选中 | Boolean | true/false | false |
| num-String | 是否支持数字定位 | String | - | - |
| placeholder | 默认显示的提示文字 | String | - | - |
| popperClass | Select下拉框的类名 | String | - | - |
| prevent-over-id | 设置弹出框将要插入的容器ID | String | - | - |
| priorSort | 是否启用优先排序规则 | Boolean | true/false | true |
| render-show-data | 自定义输入框的显示内容 | Function(item) | - | - |
| selectdata | select组件的所有数据（必填） | Array | - | [] |
| showDetailFunc | 鼠标移动到行数据显示详细数据 | Function(item) | - | - |
| showDetailItemName | 点击行数据箭头显示详细数据的字段名 | String | - | "" |
| show-refresh-bt | 是否显示刷新按钮 | Boolean | true/false | false |
| show-text-none | text值为空值是否直接显示空 | Boolean | true/false | false |
| textColor | 输入框文本显示颜色 | String | - | '' |
| textvalue.sync | 下拉框的text值（已弃用） | String/Number | - | - |
| uiType | 样式类型 | String | rectangle/simple | - |
| virtual-scroll | 是否开启虚拟视窗功能 | Boolean | true/false | true |
| v-model | 下拉框的code值（必填） | String/Number | - | - |
| width | select组件的宽度 | String/Number | - | 115 |

### 方法（7个）

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| focus | 焦点定位的方法 | - |
| getSelected | 获取下拉框选中的数据 | - |
| getText | 获取下拉框的文本 | - |
| hide | 下拉列表隐藏的方法 | - |
| scrollMove | 定位滚动条的位置 | {top:Number,left:Number} |
| setTextColor | 设置字体颜色 | color字符串如"#000" |
| resetTextColor | 重置字体颜色 | - |

### 事件（10个）

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| change | 监听值改变事件 | 当前v-model的值，当前选中行的值 |
| clear | 用户点击清空按钮时触发 | - |
| clickicon | 点击图标事件 | e |
| detailShow | 详细明细窗口显示时触发 | 当前选中行的值 |
| refresh-bt-click | 刷新按钮点击事件 | - |
| scroll-after | 滚动条滚动事件 | 当前过滤的数据query，当前下拉框vm对象 |
| scroll-to-bottom | 滚动条快要滚到底触发（分页用） | query, vm对象 |
| scroll-to-top | 滚动条快要滚到顶触发（分页用） | query, vm对象 |
| selected | 选中事件（无论值是否改变都会触发） | 当前v-model的值，当前选中行的值 |
| visible-change | 下拉框显示/隐藏的事件 | 显示隐藏标识，自身的vm对象 |

### Slot

| Slot名称 | 说明 |
|---------|------|
| customItem | 自定义下拉选项的显示内容，参数：itemData为当前选项的数据 |

---

## 四、MultipleSelect 多选选择器

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| collapse-tags | 折叠Tag | Boolean | true/false | false |
| disabled | 是否禁用 | Boolean | true/false | false |
| filterable | 是否可搜索 | Boolean | true/false | false |
| itemcode | 下拉选项的ID名称 | String | - | id |
| itemtext | 下拉选项的Text名称 | String | - | text |
| placeholder | 占位符 | String | - | 请选择 |
| selectdata | 数据源 | Array | - | [] |
| v-model | 绑定值（数组） | Array | - | - |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| clear | 清空选中数据 | - |
| getSelected | 获取选中的数据 | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| change | 值改变事件 | 当前选中的值数组 |

---

## 五、Radio 单选框

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| disabled | 是否禁用 | Boolean | true/false | false |
| label | Radio的value值 | String/Number/Boolean | - | - |
| name | 原生name属性 | String | - | - |
| v-model | 绑定值 | String/Number/Boolean | - | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| change | 绑定值变化时触发的事件 | 选中的Radio label值 |

---

## 六、Checkbox 复选框

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| checked | 当前是否勾选（v-model） | Boolean | true/false | false |
| disabled | 是否禁用 | Boolean | true/false | false |
| indeterminate | 设置indeterminate状态，只负责样式控制 | Boolean | true/false | false |
| label | 选中状态的值 | String/Number/Boolean | - | - |
| name | 原生name属性 | String | - | - |
| true-label | 选中时的值 | String/Number | - | - |
| false-label | 没有选中时的值 | String/Number | - | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| change | 当绑定值变化时触发的事件 | 更新后的值 |

---

## 七、Switch 开关

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| active-color | switch打开时的背景色 | String | - | #409EFF |
| active-text | switch打开时的文字描述 | String | - | - |
| disabled | 是否禁用 | Boolean | true/false | false |
| inactive-color | switch关闭时的背景色 | String | - | #C0CCDA |
| inactive-text | switch关闭时的文字描述 | String | - | - |
| v-model | 绑定值 | Boolean | true/false | false |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| change | switch状态发生变化时的回调函数 | 新状态的值 |

---

## 八、Slider 滑块

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| disabled | 是否禁用 | Boolean | true/false | false |
| max | 最大值 | Number | - | 100 |
| min | 最小值 | Number | - | 0 |
| show-input | 是否显示输入框 | Boolean | true/false | false |
| show-stops | 是否显示间断点 | Boolean | true/false | false |
| step | 步长 | Number | - | 1 |
| v-model | 绑定值 | Number | - | 0 |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| change | 值改变时触发 | 新值 |

---

## 九、DatePicker 日期选择器

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| align | 对齐方式 | String | left/center/right | left |
| clearable | 是否显示清除按钮 | Boolean | true/false | true |
| disabled | 是否禁用 | Boolean | true/false | false |
| editable | 文本框可输入 | Boolean | true/false | true |
| end-placeholder | 范围选择时结束日期的占位内容 | String | - | - |
| format | 显示在输入框中的格式 | String | - | yyyy-MM-dd |
| picker-options | 当前时间日期选择器特有的选项 | Object | - | {} |
| placeholder | 非范围选择时的占位内容 | String | - | - |
| popper-class | DatePicker下拉框的类名 | String | - | - |
| range-separator | 选择范围时的分隔符 | String | - | '-' |
| start-placeholder | 范围选择时开始日期的占位内容 | String | - | - |
| type | 显示类型 | String | year/month/date/dates/week/datetime/datetimerange/daterange/monthrange | date |
| value-format | 绑定值的格式 | String | - | - |
| v-model | 绑定值 | Date/String | - | - |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| focus | 使input获取焦点 | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| blur | 当input失去焦点时触发 | 组件实例 |
| change | 用户确认选定的值时触发 | 组件绑定值 |
| focus | 当input获得焦点时触发 | 组件实例 |

---

## 十、TimePicker 时间选择器

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| align | 对齐方式 | String | left/center/right | left |
| clearable | 是否显示清除按钮 | Boolean | true/false | true |
| disabled | 是否禁用 | Boolean | true/false | false |
| editable | 文本框可输入 | Boolean | true/false | true |
| format | 显示在输入框中的格式 | String | - | HH:mm:ss |
| is-range | 是否为时间范围选择 | Boolean | true/false | false |
| placeholder | 非范围选择时的占位内容 | String | - | - |
| picker-options | 当前时间日期选择器特有的选项 | Object | - | {} |
| range-separator | 选择范围时的分隔符 | String | - | '-' |
| v-model | 绑定值 | Date/String | - | - |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| focus | 使input获取焦点 | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| blur | 当input失去焦点时触发 | 组件实例 |
| change | 用户确认选定的值时触发 | 组件绑定值 |
| focus | 当input获得焦点时触发 | 组件实例 |

---

## 十一、Cascader 级联选择器

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| clearable | 是否可清空 | Boolean | true/false | false |
| disabled | 是否禁用 | Boolean | true/false | false |
| expand-trigger | 次级菜单的展开方式 | String | click/hover | click |
| filterable | 是否可搜索选项 | Boolean | true/false | false |
| options | 可选项数据源 | Array | - | [] |
| placeholder | 输入框占位文本 | String | - | 请选择 |
| props | 配置选项 | Object | - | - |
| show-all-levels | 输入框中是否显示选中值的完整路径 | Boolean | true/false | true |
| v-model | 选中项绑定值 | Array | - | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| change | 当选中节点变化时触发 | 选中节点的值 |

---

## 十二、Form 表单

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| disabled | 是否禁用该表单内的所有组件 | Boolean | true/false | false |
| inline | 行内表单模式 | Boolean | true/false | false |
| label-position | 表单域标签的位置 | String | right/left/top | right |
| label-width | 表单域标签的宽度 | String | - | - |
| model | 表单数据对象 | Object | - | - |
| rules | 表单验证规则 | Object | - | - |
| size | 用于控制该表单域的组件尺寸 | String | medium/small/mini | - |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| validate | 整个表单进行校验的方法 | Function(callback: Function(boolean, object)) |
| validateField | 对部分表单字段进行校验的方法 | Function(props: array \| string, callback: Function(errorMessage: string)) |
| resetFields | 对整个表单进行重置 | Function() |
| clearValidate | 移除表单项的校验结果 | Function(props: array \| string) |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|

---

## 十三、Upload 上传

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| accept | 接受上传的文件类型 | String | - | - |
| action | 必选，上传的地址 | String | - | - |
| auto-upload | 是否在选取文件后立即进行上传 | Boolean | true/false | true |
| data | 上传时附带的额外参数 | Object | - | - |
| disabled | 是否禁用 | Boolean | true/false | false |
| drag | 是否启用拖拽上传 | Boolean | true/false | false |
| file-list | 上传的文件列表 | Array | - | [] |
| headers | 设置上传的请求头部 | Object | - | - |
| limit | 最大允许上传个数 | Number | - | - |
| list-type | 文件列表的类型 | String | text/picture/picture-card | text |
| multiple | 是否支持多选文件 | Boolean | true/false | - |
| name | 上传的文件字段名 | String | - | file |
| show-file-list | 是否显示已上传文件列表 | Boolean | true/false | true |
| with-credentials | 支持发送cookie凭证信息 | Boolean | true/false | false |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| on-preview | 点击文件列表中已上传的文件时的钩子 | file |
| on-remove | 文件列表移除文件时的钩子 | file, fileList |
| on-success | 文件上传成功时的钩子 | response, file, fileList |
| on-error | 文件上传失败时的钩子 | err, file, fileList |
| on-progress | 文件上传时的钩子 | event, file, fileList |
| on-change | 文件状态改变时的钩子 | file, fileList |
| on-exceed | 文件超出个数限制时的钩子 | files, fileList |

---

## 十四、Autocomplete 输入推荐

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| clearable | 是否可清空 | Boolean | true/false | false |
| debounce | 获取输入建议的去抖延时 | Number | - | 300 |
| disabled | 是否禁用 | Boolean | true/false | false |
| fetch-suggestions | 返回输入建议的方法 | Function(queryString, callback) | - | - |
| placeholder | 输入框占位文本 | String | - | - |
| popper-class | Autocomplete下拉框的类名 | String | - | - |
| prefix-icon | 输入框头部图标 | String | - | - |
| suffix-icon | 输入框尾部图标 | String | - | - |
| trigger-on-focus | 是否在输入框focus时显示建议 | Boolean | true/false | true |
| value-key | 输入建议对象中用于显示的键名 | String | - | value |
| v-model | 必填，输入框绑定值 | String | - | - |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| focus | 使input获取焦点 | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| select | 点击选中建议项时触发 | 选中建议项 |
| change | 在Input值改变时触发 | value |

---

## 十五、ColorPicker 颜色选择器

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| alpha | 是否支持透明度选择 | Boolean | true/false | false |
| disabled | 是否禁用 | Boolean | true/false | false |
| predefine | 预定义颜色 | Array | - | - |
| show-alpha | 是否支持透明度选择 | Boolean | true/false | false |
| v-model | 绑定值 | String | - | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| change | 当绑定值变化时触发 | 当前值 |

---

## 十六、DateEditor 日期编辑器

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| disabled | 是否禁用 | Boolean | true/false | false |
| format | 显示格式 | String | - | yyyy-MM-dd |
| placeholder | 占位文本 | String | - | - |
| v-model | 绑定值 | String/Date | - | - |

---

## 十七、MonthPicker 月份选择器

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| disabled | 是否禁用 | Boolean | true/false | false |
| format | 显示格式 | String | - | yyyy-MM |
| placeholder | 占位文本 | String | - | - |
| v-model | 绑定值 | String | - | - |

---

## 十八、QuarterPicker 季度选择器

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| disabled | 是否禁用 | Boolean | true/false | false |
| format | 显示格式 | String | - | yyyy-Q |
| placeholder | 占位文本 | String | - | - |
| v-model | 绑定值 | String | - | - |

---

## 使用示例

### Input 输入框

```

---

# 数据展示组件

---

## 十九、Table 表格（zoehis-table）

> 核心数据展示组件，功能丰富，支持虚拟滚动、列拖拽、过滤、分组、导出Excel等

### 属性（54个）

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| data | 表格数据 | Array | - | [] |
| configs | 列配置数组 | Array | - | [] |
| keycode | 行唯一标识字段（必填） | Array/String | - | - |
| checkbox | 是否显示复选框（左固定） | Boolean | true/false | false |
| checkboxfixed | 复选框是否左固定 | Boolean | true/false | - |
| checkboxWidth | 复选框宽度 | String | - | '50px' |
| checkboxDisabled | 是否全部禁用复选框 | Boolean | true/false | - |
| checkStrictly | 复选框是否跟父节点严格关联（分组时有效） | Boolean | true/false | false |
| indexflag | 是否显示序号列 | Boolean | true/false | false |
| indexfixed | 序号是否左固定 | Boolean | true/false | - |
| indexWidth | 序号列宽度 | String | - | '50px' |
| operateflag | 是否显示操作列 | Boolean | true/false | false |
| operatefixed | 操作列是否右固定 | Boolean | true/false | - |
| operateWidth | 操作列宽度 | String | - | '100px' |
| operateAlign | 操作列文本对齐方式 | String | left/center/right | 'left' |
| operateHtml | 操作列渲染函数 | Function | - | - |
| operateText | 操作列标题 | String | - | - |
| pageflag | 是否显示分页 | Boolean | true/false | false |
| pageParam | 分页参数 | Object | - | {total:0, page:1, pageSize:30} |
| stripArr | 分页每页条数选项 | Array | - | [10,20,30,40] |
| isSetStrip | 分页组件是否显示每页条数 | Boolean | true/false | true |
| showtotal | 是否显示分页总数 | Boolean | true/false | true |
| showSummary | 是否显示合计行 | Boolean | true/false | - |
| summaryMethod | 合计行回调方法 | Function | - | - |
| summaryClassName | 合计行自定义className | String | - | '' |
| spanMethod | 合并行/合并组方法 | Function | - | - |
| mergeflag | 是否进行分组 | Boolean | true/false | - |
| mergeRowOperate | 分组时是否保留操作列 | Boolean | true/false | false |
| mergeAccordion | 分组切换是否只显示一个（手风琴） | Boolean | true/false | false |
| mergeIcon | 分组是否显示切换按钮 | Boolean | true/false | true |
| sortAttr | 自定义排序字段集合 | Array | - | [] |
| doSortFunc | 自定义排序回调 | Function | - | - |
| combSort | 组合排序（true时前端默认排序失效） | Boolean | true/false | false |
| renderAttr | 自定义渲染字段 | Array | - | [] |
| renderHtml | 自定义渲染HTML函数 | Function | - | - |
| doFilterFunc | 自定义过滤器 | Function | - | - |
| filterflag | 是否启用过滤弹窗 | Boolean | true/false | false |
| filterConfig | 过滤配置 | Object | - | - |
| hideColumnFlag | 是否启用隐藏列功能 | Boolean | true/false | false |
| dragFlag | 是否允许列拖动 | Boolean | true/false | - |
| showAllCheckboxFlag | 是否显示全选复选框 | Boolean | true/false | true |
| selectNum | 是否显示当前选中几条 | Boolean | true/false | - |
| boxborder | 是否显示表格上下边框 | Boolean | true/false | true |
| rowClassName | 行自定义class | Function/String | - | - |
| thClassName | 表头th自定义class | String | - | - |
| resetScoll | data改变时是否重置滚动条 | Boolean | true/false | true |
| supportkey | 是否支持上下快捷键 | Boolean | true/false | - |
| autoRowHeight | 行高是否按内容撑开 | Boolean | true/false | false |
| dblclickShowChild | 双击是否切换显示子元素 | Boolean | true/false | true |
| zoomable | 是否可缩放 | Boolean | true/false | false |
| zoomFactor | 缩放系数 | Number | - | 0.02 |
| minZoom | 最小缩放比 | Number | - | 0.5 |
| maxZoom | 最大缩放比 | Number | - | 2 |
| swapRowFlag | 是否使用交换行（右固定） | Boolean | true/false | false |
| swapRowfixed | 交换行是否右固定 | Boolean | true/false | true |
| swapRowWidth | 交换行宽度 | String | - | '120px' |
| userBehavior | 是否本地存储用户行为 | Boolean | true/false | false |
| userFilterTemp | 是否开启用户过滤模板 | Boolean | true/false | false |
| dealFormat | 是否默认处理成后端需要的格式 | Boolean | true/false | true |
| excelVersion | 导出Excel兼容版 | String | compatible/default | 'default' |
| beforeRowClick | 行点击前回调 | Function | - | - |
| beforeSelect | 复选前回调 | Function | - | - |
| beforeSelectAll | 全选前回调 | Function | - | - |
| operatorList | 过滤操作符列表 | Array | - | [{id:'=',text:'模糊查询'}] |
| samefilter | 过滤条件能否选择多个相同列名 | Boolean | true/false | true |
| keyStorage | 键值存储 | String | - | '' |

### 核心 API 方法（给使用者调用）

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| toggleAllRowSelection | 全选或清空全选 | flag: Boolean |
| toggleRowSelection | 切换某行选中状态 | row: Object, selected: Boolean |
| toggleMultiRowSelection | 切换多行选中状态 | multiRow: Array, selected: Boolean |
| inverseSelection | 反选复选框 | - |
| setCurrentRow | 设定某行为高亮选中行 | row: Object（不传则取消高亮） |
| getCurrentRow | 获取当前选中行 | - |
| getSelectArr | 获取复选框选中的值 | disabledFlag: Boolean |
| getSelectFlag | 获取某行是否勾选 | data: Object/String |
| getData | 获取当前表格数据 | - |
| insertBefore | 在某行前插入数据 | newRow, curRow, isCheckFlag |
| insertAfter | 在某行后插入数据 | newRow, curRow, isCheckFlag |
| deleteRow | 删除表格数据 | data: Array/Object/Number |
| editRow | 修改某行数据 | curRow: Object/Number, newRow: Object |
| doFilterData | 更新过滤行信息 | fn: Function(row) => Boolean |
| scrollSpecCol | 滚动到指定列 | curCol: dataItemCode值 |
| getConfigs | 获取最新列配置 | - |
| setRowDisabled | 设置行复选框不可点击 | row: Number/Object/Array, disabled: Boolean |
| setMergeRowFlag | 设置分组行展开/收起 | data, isShow: Boolean |
| getMergeRowFlag | 获取分组行展开/收起状态 | data |
| toggleMergeByIndex | 按索引切换分组展开/收起 | show: Boolean, index: Number |
| openFilter | 打开过滤弹窗 | clearFlag: Boolean |
| closeFilter | 关闭过滤弹窗 | - |
| clearFilterList | 清空过滤数据 | - |
| initFilterSelectVal | 初始化某字段下拉值 | dataItemCode: String |
| getFixedFormatData | 处理成后端需要的格式 | conditions |
| clearSortState | 清除当前排序状态 | - |
| getCombSortMap | 获取组合排序数据 | - |
| setCombSortMap | 设置组合排序状态 | sortArr, triggerEvent |
| setZoom | 设置缩放比例 | size: Number (0.5~2) |
| comTableMove | 设置滚动条位置 | obj: {left, top} |
| tableToExcel | 导出Excel | excelData, fileName, worksheet, tableConfig |
| getExcelHead | 获取Excel表头 | config |
| resetVirtualState | 重置虚拟视窗状态 | options: {clearCacheRows: Boolean} |
| scrollToMiddle | 将行移动到视窗中间 | row |
| getTemplateData | 获取过滤模板信息 | - |

### 事件（22个）

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| row-click | 行点击 | row, event, rowIndex, params |
| row-dblclick | 行双击 | row, event, rowIndex, params |
| col-click | 列点击 | {row, column, event, index} |
| col-dblclick | 列双击 | {row, column, event, index} |
| row-contextmenu | 行右键 | data, event |
| row-keydown | 键盘上下键选中行 | {row, rowIndex}, event |
| select | 复选框选中变化 | selectList, row, rowIndex, {parentRow}, event |
| select-all | 全选/取消全选 | selectedList, val: Boolean |
| select-num | 已选条数变化 | val |
| operate-click | 操作列点击 | event, row, rowIndex, params |
| swap-row-click | 交换行点击 | event, row, rowIndex, direction |
| change-page | 当前页码变化 | val |
| change-strip | 每页显示条数变化 | val |
| change | 表格数据变化 | val |
| zoomTable | 表格缩放 | curZoom |
| drop-change | 拖拽列交换后 | configs |
| confirm-filter | 确认过滤 | filterData |
| close-filter | 关闭过滤弹窗 | - |
| comb-sort-change | 组合排序变化 | sortArr: [{key, sort}] |
| sort-change | 自定义排序变化 | columnConfig, 'up'/'down' |
| default-sort-change | 默认前端排序变化 | columnConfig, 'up'/'down' |
| scrollafter | 滚动后事件 | e |

### ZoehisTableTd 子组件属性

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| row | 当前行数据 | Object | - |
| column | 当前列配置 | Object | - |
| rowIndex | 行索引 | Number | - |
| currentIndex | 当前行真实索引（虚拟滚动） | Number | - |
| columnIndex | 列索引 | Number | - |
| spanMethod | 合并单元格方法 | Function | - |
| autoRowHeight | 自动行高 | Boolean | false |

### ZoehisTableSummary 子组件属性

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| summaryList | 合计行数据列表 | Array | - |
| summaryClassName | 合计行自定义className | String | - |

---

## 二十、zoehis-table-plus 增强表格

> 基于 zoehis-table 封装的业务增强表格，来自 `@zoesoft.com.cn/onelink-web-his-common`

### 属性

继承 zoehis-table 所有属性，额外增加：

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| tab-id | 表格标识ID | String | - |
| menu-id | 菜单ID | String | - |
| api-list | 数据接口方法 | Function/Object | - |
| row-style | 行样式回调 | Function | - |

### 事件

继承 zoehis-table 所有事件。

---

## 二十一、Tag 标签（zoehis-tag）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| type | 标签类型 | String | plain/success/info/warning/danger | 'plain' |
| theme | 主题 | String | default/dark/light | 'default' |
| color | 自定义颜色 | String | - | '' |
| backgroundColor | 自定义背景色 | String | - | '' |
| customClass | 自定义类名 | String | - | '' |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| click | 点击标签 | event |

---

## 二十二、Badge 徽章（zoehis-badge）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| value | 显示值 | String/Number | - | '' |
| type | 类型 | String | primary/success/warning/danger/info | 'primary' |
| max | 最大值，超过显示{max}+ | String/Number | - | '' |
| hidden | 是否隐藏 | Boolean | true/false | false |

---

## 二十三、Progress 进度条（zoehis-progress）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| percentage | 百分比（必填，0~100） | Number/String | 0~100 | 0 |
| status | 状态 | String | success/exception/warning | - |
| strokeWidth | 进度条宽度 | Number | - | 12 |
| textInside | 百分比是否显示在进度条内 | Boolean | true/false | false |
| showText | 是否显示百分比文字 | Boolean | true/false | true |
| color | 进度条颜色 | String | - | '' |
| circle | 是否为环形进度条 | Boolean | true/false | false |
| visible | 是否显示（用于进度弹窗） | Boolean | true/false | false |
| zindex | 层级 | String | - | - |
| spinner | 是否显示加载动画 | Boolean | true/false | false |
| progressPopup | 是否为弹窗进度条 | Boolean | true/false | false |

---

## 二十四、Popover 弹出框（zoehis-popover）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| trigger | 触发方式 | String | hover/click/focus | 'hover' |
| placement | 出现位置 | String | top/top-start/top-end/bottom/bottom-start/bottom-end/left/left-start/left-end/right/right-start/right-end | 'right' |
| width | 宽度 | Number/String | - | '' |
| height | 高度 | Number/String | - | '' |
| offsetX | X轴偏移 | Number/String | - | '' |
| offsetY | Y轴偏移 | Number/String | - | '' |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| show | 显示弹出框 | - |
| hide | 隐藏弹出框 | - |

---

## 二十五、Tree 树形控件（zoehis-tree）

### 属性（28个）

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| data | 树形数据 | Array | - | - |
| props | 配置选项（映射字段名） | Object | - | {children:'children', label:'', id:'id', pid:'pid', noleaf:''} |
| propMap | 属性映射 | Object | - | - |
| showcheckbox | 是否显示复选框 | Boolean | true/false | false |
| showhalfcheckbox | 是否显示半选复选框 | Boolean | true/false | false |
| checkstrictly | 父子节点是否不关联 | Boolean | true/false | false |
| highlightcurrent | 是否高亮当前选中节点 | Boolean | true/false | true |
| defaultcheckedkeys | 默认勾选的节点key | Array | - | - |
| defaultexpandedkeys | 默认展开的节点key | Array | - | - |
| defaultexpandall | 是否默认展开所有节点 | Boolean | true/false | false |
| autoexpandparent | 展开子节点时是否自动展开父节点 | Boolean | true/false | true |
| expandonclicknode | 点击节点是否展开 | Boolean | true/false | false |
| checkedclicknode | 点击节点是否勾选 | Boolean | true/false | false |
| expandselected | 选中节点是否展开 | Boolean | true/false | false |
| expandselectedchild | 选中节点是否展开子节点 | Boolean | true/false | true |
| currentnodekey | 当前选中节点的key | String/Number | - | - |
| lazy | 是否懒加载子节点 | Boolean | true/false | false |
| load | 懒加载回调 | Function(node, resolve) | - | - |
| emptytext | 空数据文字 | String | - | '暂无数据' |
| filterNodeMethod | 自定义过滤方法 | Function(value, data, node) | - | - |
| beforenodeselect | 选中前回调 | Function(data, node) | - | - |
| draggable | 是否可拖拽 | Boolean | true/false | false |
| editable | 是否可编辑 | Boolean | true/false | false |
| allowDrag | 判断节点能否拖拽 | Function(node) | - | - |
| allowDrop | 拖拽放置判断 | Function(draggingNode, dropNode, type) | - | - |
| indent | 缩进距离 | Number | - | 22 |
| renderhtml | 自定义节点内容 | Function(h, {node, data, store}) | - | - |
| uiType | 样式类型 | String | default/... | 'default' |
| expandIcon | 展开图标 | String | - | 'z_zhankai-1_normal' |
| collapseIcon | 收缩图标 | String | - | 'z_shouqi-1_normal' |

### 方法（22个）

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| filter | 对树节点进行筛选 | value: String |
| getCheckedNodes | 获取勾选的节点数组 | leafOnly: Boolean |
| getCheckedKeys | 获取勾选的节点key数组 | leafOnly: Boolean |
| getHalfCheckedNodes | 获取半选节点数组 | - |
| getHalfCheckedKeys | 获取半选节点key数组 | - |
| setCheckedNodes | 设置勾选的节点 | nodes: Array, leafOnly: Boolean |
| setCheckedKeys | 设置勾选的节点key | keys: Array, leafOnly: Boolean |
| getCurrentSelected | 获取当前选中节点 | - |
| setCurrentSelected | 通过key设置选中节点 | keys |
| setUnselected | 取消当前选中节点 | - |
| appendNode | 追加子节点 | data, parentData |
| removeNode | 删除节点 | data, flag |
| updateNode | 更新节点数据 | data, newData |
| expandNodeByKey | 通过key展开节点 | keys: Array |
| collapseNodeByKey | 通过key收缩节点 | keys: Array |
| getTreeData | 获取拖动后的数据结构 | - |
| updateTreeData | 更新源数据 | arr: Array |
| getNodeE | 获取选中节点DOM元素 | - |
| getNodeKey | 获取节点key值 | node, index |

### 事件（9个）

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| nodeselect | 节点选中 | nodeData, node |
| nodeexpand | 节点展开 | nodeData, node, flag |
| nodecollapse | 节点收缩 | nodeData, node, flag |
| update:data | 源数据更新 | arr |
| node-drag-start | 拖拽开始 | draggingNode, event |
| node-drag-enter | 拖拽进入目标 | draggingNode, dropNode, event |
| node-drag-leave | 拖拽离开目标 | draggingNode, dropNode, event |
| node-drag-end | 拖拽结束 | draggingNode, dropNode, dropType, event |
| node-drop | 拖拽放置成功 | draggingNode, dropNode, dropType, event |

---

## 二十六、Collapse 折叠面板（zoehis-collapse）

### ZoehisCollapse 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| accordion | 是否手风琴模式 | Boolean | true/false | false |
| value | 当前激活的面板（v-model） | Array/String/Number | - | [] |
| border | 是否显示边框 | Boolean | true/false | true |
| uiType | 样式类型 | String | - | '' |
| indent | 缩进 | String | - | - |

### ZoehisCollapseItem 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| title | 面板标题 | String | - | - |
| name | 面板唯一标识 | String/Number | - | _uid |
| height | 面板高度 | Number/String | - | - |
| indent | 缩进 | String | - | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| change | 激活项变化 | value |

---

## 二十七、Timeline 时间线（zoehis-timeline）

### ZoehisTimeline 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| reverse | 是否倒序 | Boolean | true/false | false |
| showTimeFlag | 是否显示时间 | Boolean | true/false | true |
| format | 时间格式 | String | - | 'yyyy-MM-dd HH:mm:ss' |

### ZoehisTimelineItem 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| title | 标题 | String | - | - |
| timestamp | 时间戳 | Number/String | - | - |
| format | 时间格式（覆盖父组件） | String | - | - |
| showTimeFlag | 是否显示时间 | Boolean | true/false | true |

---

## 二十八、Descriptions 描述列表（zoehis-descriptions）

### ZoehisDescriptions 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| title | 标题 | String | - | '' |
| column | 一行显示几项 | Number | - | 3 |
| labelBold | 标签是否加粗 | Boolean | true/false | false |
| textBold | 内容是否加粗 | Boolean | true/false | false |
| size | 尺寸 | String | default/medium/small/mini | 'default' |
| colon | 是否显示冒号 | Boolean | true/false | true |
| paddingBottom | 底部内边距 | Number/String | - | '' |

### ZoehisDescriptionsItem 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| label | 标签文本 | String | - | '' |
| labelClassName | 标签自定义类名 | String | - | '' |
| contentClassName | 内容自定义类名 | String | - | '' |
| labelStyle | 标签自定义样式 | Object | - | {} |
| contentStyle | 内容自定义样式 | Object | - | {} |

---

## 二十九、Empty 空状态（zoehis-empty）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| image | 图片 | String/Component | - | 默认空状态图 |
| imageHeight | 图片高度 | String | - | '' |
| description | 描述文字 | String | - | '暂无数据' |
| uiType | 样式类型 | String | - | '' |

---

## 三十、List 列表（zoehis-list）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| editable | 是否可编辑 | Boolean | true/false | false |
| grid | 是否网格模式 | Boolean | true/false | false |
| column | 列数（grid模式生效） | Number | - | 4 |
| bordered | 是否显示边框 | Boolean | true/false | true |
| showIcon | 是否显示图标 | Boolean | true/false | true |
| icon | 右侧图标 | String | - | 'z_youjiantou_normal' |
| mode | 模式 | String | sample/card | 'sample' |
| size | 尺寸 | String | default/small | 'default' |
| bgcolor | 是否显示背景色 | Boolean | true/false | false |
| gutter | 间距 | Number/String | - | - |
| gutterSide | 间距是否作用到容器 | Boolean | true/false | true |
| checkbox | 是否显示选择框 | Boolean | true/false | false |
| editIcon | 编辑图标 | String | - | 'z_qingchu_normal' |
| editIconClassName | 编辑图标样式类名 | String | - | '' |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| getCkeckedList | 获取已选择项列表 | - |
| toggleAllRowSelection | 全选或清空 | flag: Boolean |
| toggleMultiRowSelection | 切换多行选中状态 | rows, selected |
| toggleRowSelection | 切换某行选中状态 | row, selected |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| clickItem | 点击列表项 | data, code, index |
| clickIcon | 点击图标 | data, code, index |
| clickEditIcon | 点击编辑图标 | code, event, data |

### ZoehisListItem 属性

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 标题 | String | '' |
| data | 数据 | Object/Array | - |
| code | 唯一标识 | String/Number | '' |
| editIconClickEn | 编辑图标点击回调 | Function | null |

### ZoehisListItemMeta 属性

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 标题 | String | '' |
| description | 描述 | String | '' |

---

## 三十一、Steps 步骤条（zoehis-steps）

### ZoehisSteps 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| active | 当前激活步骤 | Number | - | - |
| space | 每个step的间距 | Number/String | - | - |
| direction | 方向 | String | horizontal/vertical | 'horizontal' |
| alignCenter | 是否居中对齐 | Boolean | true/false | false |
| simple | 是否简洁模式 | Boolean | true/false | false |
| finishStatus | 已完成步骤的状态 | String | wait/process/finish/error/success | 'finish' |
| processStatus | 当前步骤的状态 | String | wait/process/finish/error/success | 'process' |
| showHeader | 是否显示头部 | Boolean | true/false | false |

### ZoehisStep 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| title | 标题 | String | - | - |
| icon | 图标 | String | - | - |
| description | 描述 | String | - | - |
| status | 状态 | String | wait/process/finish/error/success | - |
| header | 头部内容 | String | - | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| change | active改变时触发 | newVal, oldVal |

---

## 三十二、StatusCard 状态卡片（zoehis-status-card）

### 属性

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| data | 状态卡片数据 | Array | - |
| uiType | 样式类型 | String | '' |

---

## 三十三、Divider 分割线（zoehis-divider）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| direction | 方向 | String | horizontal/vertical | 'horizontal' |
| position | 插槽位置 | String | left/center/right | 'left' |

---

## 三十四、Calendar 日历（zoehis-calendar）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| value | 绑定值 | Date/String/Number | - | - |
| range | 日期范围 | Array | - | - |
| firstDayOfWeek | 周起始日 | Number | 1~7 | 1 |
| isHeader | 是否显示头部 | Boolean | true/false | true |
| headerType | 头部按钮组位置 | String | left/center/right | 'center' |
| weeks | 替换表头文字 | Array | - | - |

---

## 三十五、Scrollbar 滚动条（zoehis-scrollbar）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| native | 是否使用原生滚动条 | Boolean | true/false | false |
| wrapStyle | 父容器style | Object/Array/String | - | - |
| wrapClass | 父容器class | String | - | - |
| viewStyle | 滚动区域style | String | - | - |
| viewClass | 滚动区域class | String | - | - |
| noresize | 容器尺寸不变化时优化性能 | Boolean | true/false | false |
| delayTime | 滚动事件触发延迟(ms) | Number | - | 30 |
| tag | 生成元素标签 | String | - | 'div' |
| verticalbar | 一直显示竖向滚动条 | Boolean | true/false | false |
| size | 尺寸 | String | default/small | 'default' |
| width | 滚动条宽度 | Number/String | - | '' |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| move | 设置滚动位置 | {top, left} |
| update | 更新滚动条大小 | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| scrollafter | 滚动后事件 | wrap元素 |
| scrollresize | 滚动条重新设置 | - |

---

## 三十六、BackTop 回到顶部（zoehis-back-top）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| visibilityHeight | 滚动高度达到此值才出现 | Number | - | 0 |
| target | 触发滚动的对象选择器 | String | - | 'html' |
| right | 距离右边距(px) | String | - | '79' |
| bottom | 距离底部距离(px) | String | - | '116' |
| isDown | 是否显示回到底部按钮 | Boolean | true/false | true |
| position | 定位方式 | String | fixed/absolute | 'absolute' |
| zIndex | 层级 | String | - | '100' |
| isRAF | 是否使用动画效果 | Boolean | true/false | true |
| customClass | 自定义类名 | String | - | '' |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| topClick | 点击回到顶部 | - |
| bottomClick | 点击回到底部 | - |

---

## 数据展示组件使用示例

### zoehis-table 基本用法

```vue
<template>
  <div>
    <zoehis-table
      ref="table"
      :data="tableData"
      :configs="configs"
      :checkbox="true"
      :pageflag="true"
      :page-param="pageParam"
      keycode="id"
      @row-click="handleRowClick"
      @select="handleSelect"
      @change-page="handlePageChange"
    ></zoehis-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableData: [],
      pageParam: { total: 0, page: 1, pageSize: 30 },
      configs: [
        { dataItem: 'name', dataItemText: '姓名', width: '120px' },
        { dataItem: 'age', dataItemText: '年龄', width: '80px' },
        { dataItem: 'gender', dataItemText: '性别', width: '80px' }
      ]
    }
  },
  methods: {
    handleRowClick(row, event, rowIndex) {
      console.log('点击行:', row)
    },
    handleSelect(selectList, row) {
      console.log('选中:', selectList)
    },
    handlePageChange(page) {
      this.pageParam.page = page
      this.loadData()
    },
    // 调用表格方法
    getSelected() {
      return this.$refs.table.getSelectArr()
    },
    clearSelection() {
      this.$refs.table.toggleAllRowSelection(false)
    }
  }
}
</script>
```

---

# 基础组件

---

## 三十七、Button 按钮（zoehis-button）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| type | 按钮类型 | String | default/primary/features/plain/plainPrimary | 'default' |
| size | 按钮尺寸 | String | normal/small/big | 'normal' |
| icon | 图标（目前只针对底部按钮） | String | - | - |
| keyboard | 快捷键数字 | String/Number | - | - |
| disabled | 是否禁用 | Boolean | true/false | false |
| shrinkLevel | 收起优先级（配合按钮组超出隐藏） | Number/String | - | 1 |
| width | 按钮宽度 | Number/String | - | '' |
| label | 按钮标签 | Number/String | - | '' |
| circle | 是否为圆形图标按钮 | Boolean | true/false | false |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| focus | 聚焦按钮 | - |
| getDisabled | 获取是否禁用状态 | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| clickenter | 鼠标进入按钮 | evt |
| focus | 获得焦点 | evt |
| blur | 失去焦点 | evt |

> 注：按钮的 click 事件为原生DOM事件，直接绑定即可。

---

## 三十八、ButtonGroup 按钮组（zoehis-button-group）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| activedLabel | 激活按钮的标签 | Number/String | - | '' |
| type | 按钮组类型 | String | - | '' |
| direction | 排列方向 | String | horizontal/vertical | 'horizontal' |
| overType | 超出时显示样式 | String | dots/more | 'dots' |
| overflag | 是否启用超出隐藏 | Boolean | true/false | false |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| init | 重新计算超出隐藏 | - |
| getSlotMaps | 获取所有slot信息 | - |
| getOverList | 获取超出部分的按钮数据 | - |
| showButtonMask | 显示超出按钮弹窗 | e |
| hideOver | 隐藏弹窗 | - |
| showOver | 显示弹窗 | - |

---

## 三十九、Func 功能按钮（zoehis-func）

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| tableToExcel | 导出Excel | excelData(必填), fileName, worksheet, tableConfig(必填,含dataItemName/dataItemCode) |

---

# 导航组件

---

## 四十、Menu 菜单项（zoehis-menu）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| label | 菜单标识值 | Any | - | - |
| text | 菜单显示文本 | Any | - | - |
| disabled | 是否禁用 | Boolean | true/false | false |
| closeable | 是否显示关闭图标 | Boolean | true/false | false |
| iconClass | 关闭图标类名 | String | - | - |
| uiType | UI类型 | String | - | - |
| badgeFlag | 是否显示徽标 | Boolean | true/false | - |
| badgeType | 徽标类型 | String | - | - |
| badgeValue | 徽标值 | String/Number | - | '' |
| badgeMax | 徽标最大值 | String/Number | - | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| menuClick | 菜单点击 | label, oldLabel |
| closeIconClick | 关闭图标点击 | label |

---

## 四十一、MenuGroup 菜单组（zoehis-menu-group）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| value | v-model绑定值 | Any | - | - |
| activeName | 激活的菜单名 | Any | - | - |
| type | 样式类型 | String | style1/style2/style3/style4/style5/style6 | 'style1' |
| disabled | 是否禁用 | Boolean | true/false | false |
| hover | 是否使用hover效果 | Boolean | true/false | false |
| closeable | 是否显示关闭按钮 | Boolean | true/false | false |
| beforeClick | 点击前回调（返回false阻止选中） | Function | - | - |
| menuList | 菜单列表数据 | Array | - | [] |
| itemtext | 菜单列表中文本字段名 | String | - | 'itemtext' |
| itemcode | 菜单列表中编码字段名 | String | - | 'itemcode' |
| iconClass | 关闭图标名称 | String | - | 'z_close_normal02' |
| badgeFlag | 是否显示徽标 | Boolean | true/false | - |
| badgeType | 徽标类型 | String | - | '' |
| badgeMax | 徽标最大值 | String/Number | - | - |
| collapsible | 是否启用菜单收缩 | Boolean | true/false | false |
| uiType | UI类型 | String | default/onelink | 'default' |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| init | 重新计算收缩/超出隐藏 | - |
| getSlotMaps | 获取插槽信息 | - |
| setReplaceMenu | 设置替换菜单值 | val |
| selectReplaceMenu | 替换下拉框选中后处理 | label |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| change | 值变化 | value, oldValue |
| closeIconClick | 关闭图标点击 | label |

---

## 四十二、VerticalMenu 竖向菜单（zoehis-vertical-menu）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| value | v-model绑定值 | Object | - | {} |
| data | 菜单数据（每项含configId和items） | Array | - | [] |
| noShrink | 收缩菜单栏 | Boolean | true/false | true |
| beforeClick | 点击前回调（返回false阻止） | Function | - | - |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| handleFirstMenuClick | 点击一级菜单 | configId |
| handleSecondMenuClick | 点击二级菜单 | configId, noClick |
| getFixflag | 获取菜单栏是否伸缩 | - |
| setFixflag | 设置菜单栏伸缩状态 | flag: Boolean |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| click | 点击二级菜单 | data, configId |
| change | 选中菜单变化 | data |
| fix-change | 伸缩按钮点击 | menuFixFlag: Boolean |

---

## 四十三、NavMenu 导航菜单（zoehis-nav-menu）

### ZoehisNavMenu 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| defaultActive | 当前激活菜单的index | String | - | '' |
| collapse | 是否水平折叠收起 | Boolean | true/false | false |
| collapseTransition | 是否开启折叠动画 | Boolean | true/false | true |
| collapsible | 是否启用菜单收缩 | Boolean | true/false | true |
| multicolor | 是否启用双色图标 | Boolean | true/false | false |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| toggleEvn | 折叠/展开菜单 | - |
| open | 打开指定子菜单 | index |
| close | 关闭指定子菜单 | index |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| collapseChange | 折叠状态变化 | collapseFlag: Boolean |
| change | 菜单项选中变化 | val, title |
| select | 菜单项被选中 | index, keyPath, title |
| open | 子菜单展开 | index, keyPath |
| close | 子菜单收起 | index, keyPath |

### ZoehisSubmenu 属性

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| index | 唯一标识 | String | '' |
| icon | 图标类名 | String | '' |
| paddingLeft | 左内边距 | Number/String | '' |

### ZoehisMenuItem 属性

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| index | 唯一标识 | String | '' |
| icon | 图标类名 | String | '' |
| paddingLeft | 左内边距 | Number/String | '' |

---

## 四十四、Tab 标签页（zoehis-tab）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| itemcode | 列表项唯一标识字段名 | String | - | 'configId' |
| itemtext | 列表项文本字段名 | String | - | 'menuName' |
| currentId | 当前激活标签ID | String | - | '' |
| tabList | 标签列表数据 | Array | - | [] |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| getItemById | 获取当前标签项 | - |
| hideContext | 隐藏右键菜单 | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| tab-click | 点击标签 | item, currentItem |
| tab-close | 关闭标签 | item |
| context-click | 右键菜单点击 | item, code(close/closeAll/closeOther) |

---

## 四十五、Dropdown 下拉菜单（zoehis-dropdown）

### ZoehisDropdown 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| trigger | 触发方式 | String | hover/click | 'hover' |
| menuAlign | 菜单对齐方式 | String | end/start | 'end' |
| type | 菜单类型 | String | - | - |
| size | 尺寸 | String | - | - |
| splitButton | 是否为分裂按钮 | Boolean | true/false | - |
| hideOnClick | 点击菜单项后是否隐藏 | Boolean | true/false | true |
| disabled | 是否禁用 | Boolean | true/false | false |
| uiType | UI类型 | String | - | '' |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| show | 显示下拉菜单 | - |
| hide | 隐藏下拉菜单 | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| visible-change | 显示/隐藏状态变化 | val: Boolean |
| command | 菜单项被点击 | command, instance |
| click | 下拉菜单区域被点击 | - |

### ZoehisDropdownItem 属性

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| command | 指令值 | Any | - |
| disabled | 是否禁用 | Boolean | - |
| divided | 是否显示分割线 | Boolean | - |

---

# 反馈组件

---

## 四十六、Dialog 对话框（zoehis-dialog）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| visible | 控制显示/隐藏（v-model） | Boolean | true/false | false |
| title | 弹窗标题（空字符串则不显示标题栏） | String | - | '提示' |
| width | 弹窗宽度 | Number/String | - | 420 |
| height | 弹窗高度 | Number/String | - | 235 |
| modal | 是否显示遮罩 | Boolean | true/false | true |
| modalAppendToBody | 遮罩是否插入body | Boolean | true/false | false |
| closeOnClickModal | 点击遮罩是否关闭 | Boolean | true/false | false |
| closeOnPressEscape | 按ESC是否关闭 | Boolean | true/false | true |
| beforeClose | 关闭前回调 | Function(hide, flag) | - | - |
| supportdrag | 是否支持拖拽 | Boolean | true/false | true |
| resizable | 是否支持缩放 | Boolean | true/false | false |
| minWidth | 缩放时最小宽度 | Number | - | 200 |
| minHeight | 缩放时最小高度 | Number | - | 200 |
| appendToBody | 是否插入body | Boolean | true/false | false |
| bodyscroll | 内容部分是否需要滚动条 | Boolean | true/false | false |
| newscrollbar | 是否使用新版滚动条 | Boolean | true/false | false |
| positionStyle | 初始化位置 | Object | - | {} |
| alwaysInitPosition | 每次打开都初始化位置 | Boolean | true/false | false |
| native | 是否原生弹窗 | Boolean | true/false | false |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| show | 显示弹窗 | - |
| hide | 隐藏弹窗 | cancel: Boolean |
| open | 打开弹窗（Popup mixin） | options |
| close | 关闭弹窗（Popup mixin） | - |
| scrollMove | 滚动条位置移动 | left, top |
| initStyle | 初始化弹窗位置 | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| open | 弹窗打开 | - |
| close | 弹窗关闭 | - |
| headerclose | 头部关闭按钮点击 | - |
| visible-change | visible变化 | Boolean |

---

## 四十七、Drawer 抽屉（zoehis-drawer）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| visible | 控制显示/隐藏（v-model） | Boolean | true/false | - |
| title | 标题 | String | - | '' |
| direction | 打开方向 | String | ltr/rtl/ttb/btt | 'rtl' |
| size | 抽屉尺寸 | String | - | '260px' |
| modal | 是否显示遮罩 | Boolean | true/false | true |
| mask | 是否挡住后面内容（白色遮罩） | Boolean | true/false | true |
| wrapperClosable | 点击遮罩是否关闭 | Boolean | true/false | false |
| closeOnPressEscape | 按ESC是否关闭 | Boolean | true/false | false |
| showClose | 是否显示关闭按钮 | Boolean | true/false | true |
| withHeader | 是否显示头部 | Boolean | true/false | true |
| appendToBody | 是否插入body | Boolean | true/false | true |
| destroyOnClose | 关闭时是否销毁内部元素 | Boolean | true/false | false |
| beforeClose | 关闭前回调 | Function(hide) | - | - |
| customClass | 自定义类名 | String | - | '' |
| resizable | 是否支持缩放 | Boolean | true/false | false |
| minSize | 缩放时最小尺寸 | Number | - | 100 |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| hide | 隐藏抽屉 | cancel: Boolean |
| closeDrawer | 关闭抽屉 | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| open | 抽屉打开 | - |
| close | 抽屉关闭 | - |
| opened | 打开动画结束 | - |
| closed | 关闭动画结束 | - |

---

## 四十八、MessageBox 消息弹框（zoehis-message-box）

> 通常通过编程方式调用：`this.$msgbox()` / `this.$alert()` / `this.$confirm()`

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| visible | 控制显示/隐藏 | Boolean | true/false | false |
| size | 弹窗尺寸 | String | small/large | '' |
| iconType | 提示图标 | String | success/error/question/warn | '' |
| modal | 是否显示遮罩 | Boolean | true/false | true |
| closeOnClickModal | 点击遮罩是否关闭 | Boolean | true/false | false |
| closeOnPressEscape | 按ESC是否关闭 | Boolean | true/false | true |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| hide | 关闭弹窗 | - |
| setSendManagerFlag | 设置发送管理员按钮是否可点击 | isTrue: Boolean |

### 编程式调用示例

```js
// 确认弹框
this.$confirm('确定删除吗？', '提示', {
  iconType: 'question'
}).then(() => {
  // 确认
}).catch(() => {
  // 取消
})

// 提示弹框
this.$alert('操作成功', '提示', {
  iconType: 'success'
})

// 消息弹框
this.$msgbox({
  title: '提示',
  message: '内容',
  iconType: 'warn',
  showCancelButton: true
})
```

---

## 四十九、Spinner 加载动画（zoehis-spinner）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| percentage | 百分比值（0~100） | Number/String | 0~100 | 0 |
| error | 是否为错误状态 | Boolean | true/false | false |
| type | 类型 | String | loading/... | '' |
| color | 自定义颜色 | String | - | '' |

---

## 五十、ProgressPopup 进度弹窗（zoehis-progress-popup）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| visible | 显示/隐藏（支持.sync） | Boolean | true/false | false |
| total | 总数 | Number | - | 100 |
| doneValue | 已处理值 | Number | - | 0 |
| errorValue | 处理失败值 | Number | - | 0 |
| doneState | 完成时的文本描述 | String | - | - |
| doingState | 正在执行的文本描述 | String | - | - |
| waitState | 未开始时的文本描述 | String | - | - |
| loading | 是否为纯loading状态 | Boolean | true/false | - |
| decimal | 百分比是否保留一位小数 | Boolean | true/false | - |
| closeable | 完成时是否显示关闭按钮 | Boolean | true/false | - |
| color | 进度条颜色 | String | - | - |
| mask | 是否显示透明遮罩 | Boolean | true/false | true |
| zindex | 层级 | String | - | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| close | 关闭按钮点击 | - |
| error-link | 点击查看错误链接 | - |

---

# 布局组件

---

## 五十一、Container 容器（zoehis-container）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| direction | 子元素排列方向 | String | vertical/horizontal | 自动检测 |

---

## 五十二、Header 头部（zoehis-header）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| height | 头部高度 | String | - | '40px' |
| uiType | 类型 | String | - | 'default' |
| showArrow | 是否显示分割按钮 | Boolean | true/false | true |
| isPartition | 是否使用分割 | Boolean | true/false | false |
| draggable | 是否可拖动 | Boolean | true/false | false |
| activeSize | 响应尺寸 | String | - | '25px' |
| minLeft | 最小距离限制 | Number | - | 35 |
| minRight | 最小距离限制 | Number | - | 35 |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| drag | 拖动时触发 | finalSize: String |
| iconClick | 图标点击 | iconStatus: Number |

---

## 五十三、Footer 底部（zoehis-footer）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| height | 底部高度 | String | - | '50px' |
| uiType | 类型 | String | - | 'default' |
| showArrow | 是否显示分割按钮 | Boolean | true/false | true |
| isPartition | 是否使用分割 | Boolean | true/false | false |
| draggable | 是否可拖动 | Boolean | true/false | false |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| drag | 拖动时触发 | finalSize: String |
| iconClick | 图标点击 | iconStatus: Number |

---

## 五十四、Aside 侧边栏（zoehis-aside）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| width | 侧边栏宽度 | String | - | '200px' |
| direction | 分割线位置 | String | left/right | 'right' |
| uiType | 类型 | String | - | 'default' |
| showArrow | 是否显示分割按钮 | Boolean | true/false | true |
| isPartition | 是否使用分割 | Boolean | true/false | false |
| draggable | 是否可拖动 | Boolean | true/false | false |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| drag | 拖动时触发 | finalSize: String |
| iconClick | 图标点击 | iconStatus: Number |

---

## 五十五、Row 行布局（zoehis-row）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| gutter | 栅格间隔 | Number | - | 0 |
| gutterSide | 是否保留两边间隔 | Boolean | true/false | false |
| type | 类型 | String | single/multiple | '' |
| labelSuffix | 标签后缀 | String | - | '：' |
| labelWidth | 标签宽度 | String | - | '' |
| justify | flex布局justify-content | String | - | '' |
| textAlign | 文本对齐方式 | String | - | '' |
| labelAlign | 标签对齐方式 | String | - | '' |
| labelStyle | 标签自定义样式 | Object | - | {} |

---

## 五十六、Col 列布局（zoehis-col）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| span | 栅格占据列数 | Number | - | 24 |
| order | 栅格排序 | Number/String | - | 0 |
| offset | 栅格左侧间隔格数 | Number | - | 0 |
| textAlign | 文本对齐方式 | String | - | '' |
| labelAlign | 标签对齐方式 | String | - | '' |

---

## 五十七、ColItem 列项（zoehis-col-item）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| label | 标签文本 | String | - | '' |
| labelSuffix | 标签后缀 | String | - | 继承父Row |
| labelWidth | 标签宽度 | String | - | 继承父Row |
| required | 是否必填 | Boolean | true/false | - |
| line | 是否当做横线 | Boolean | true/false | - |
| labelStyle | 自定义label样式 | Object | - | {} |

---

## 五十八、Page 分页（zoehis-page）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| stripArr | 可选条目数组 | Array | - | [10,20,30,40] |
| stripCount | 总条数 | Number | - | - |
| current_page | 当前页码（支持.sync） | Number | - | 1 |
| set_strip | 当前每页条数（支持.sync） | Number | - | 10 |
| isSetStrip | 是否显示条数设置 | Boolean | true/false | true |
| showtotal | 是否显示总数 | Boolean | true/false | true |
| nonetotal | 无总数概念（只留翻页） | Boolean | true/false | false |
| beforeClick | 跳页前回调（返回true才允许） | Function | - | '' |
| unitText | 单位文字 | String | - | '条' |
| zoomable | 是否支持缩放 | Boolean | true/false | false |
| keys | 快捷键配置 | Object | - | {pre:'',preText:'',next:'',nextText:''} |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| prevPage | 上一页 | - |
| nextPage | 下一页 | - |
| toHome | 首页 | - |
| toEnd | 末页 | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| changePage | 页码变化 | submitPage: Number |
| changeStrip | 每页条数变化 | setStrip: Number |

---

## 五十九、Partition 分区（zoehis-partition）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| mode | 类型 | String | vertical/horizontal | 'vertical' |
| normalSize | 默认尺寸 | Array | - | ['50%','50%'] |
| activeSize | 响应尺寸 | Array | - | ['calc(100% - 35px)','35px'] |
| showArrow | 是否显示按钮 | Boolean | true/false | true |
| value | 按钮响应值（支持.sync） | Boolean | true/false | false |
| lineDirection | 分割线样式区别 | Boolean | true/false | false |
| draggable | 是否支持拖动 | Boolean | true/false | false |
| minLeft | 最小向左/上拖动距离 | Number | - | 30 |
| minRight | 最小向右/下拖动距离 | Number | - | 35 |
| iconCls | 自定义按钮class | String | - | '' |
| lineClass | 分割线自定义class | String | - | '' |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| toggleEn | 切换显示/隐藏 | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| input | value变化 | val: Boolean |
| dragstop | 拖动结束 | curSize: Array |

---

## 六十、PageLayout 页面布局（zoehis-page-layout）

### 属性

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| border | 是否显示边框 | Boolean | true |
| mainSplitFlag | 主区域是否分隔 | Boolean | false |
| singleLeftAsideFlag | 左侧边栏单栏 | Boolean | false |
| singleRightAsideFlag | 右侧边栏单栏 | Boolean | false |
| headerStyle | 头部样式 | Object/String | {} |
| leftAsideStyle | 左侧边栏样式 | Object/String | {} |
| rightAsideStyle | 右侧边栏样式 | Object/String | {} |
| mainStyle | 主区域样式 | Object/String | {} |
| footerStyle | 底部样式 | Object/String | {} |

---

## 六十一、BasePageLayout 基础页面布局（zoehis-base-page-layout）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| type | 布局类型 | String/Number | - | '1' |
| mainSplitFlag | 主区域是否分隔 | Boolean | true/false | false |
| singleLeftAsideFlag | 左侧边栏单栏 | Boolean | true/false | false |
| singleRightAsideFlag | 右侧边栏单栏 | Boolean | true/false | false |
| headerStyle | 头部样式 | Object/String | - | {} |
| leftAsideStyle | 左侧边栏样式 | Object/String | - | {} |
| rightAsideStyle | 右侧边栏样式 | Object/String | - | {} |
| mainStyle | 主区域样式 | Object/String | - | {} |
| footerStyle | 底部样式 | Object/String | - | {} |

---

# 其他组件

---

## 六十二、Transfer 穿梭框（zoehis-transfer）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| searchflag | 是否显示搜索区 | Boolean | true/false | - |
| searchParam | 检索区参数配置 | Object | - | {} |
| delayTime | 输入框延时 | String/Number | - | - |
| leftTitle | 左边标题 | String | - | - |
| rightTitle | 右边标题 | String | - | - |
| uiType | UI样式 | String | rectangle/... | - |
| rightDisbaled | 右箭头不可点击 | Boolean | true/false | - |
| leftDisbaled | 左箭头不可点击 | Boolean | true/false | - |
| leftWidth | 左侧宽度 | String | - | - |
| rightWidth | 右侧宽度 | String | - | - |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| setSearchValue | 设置搜索区值 | val |
| searchFocus | 聚焦搜索区输入框 | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| search-input | 检索区input | val |
| search-change | 检索区change | val |
| right-click | 右箭头点击 | e |
| left-click | 左箭头点击 | e |

---

## 六十三、DraggableResizable 可拖拽调整大小（zoehis-draggable-resizable）

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| active | 是否激活 | Boolean | true/false | false |
| draggable | 是否可拖动 | Boolean | true/false | true |
| resizable | 是否可调整大小 | Boolean | true/false | true |
| w | 初始宽度 | Number | - | 200 |
| h | 初始高度 | Number | - | 200 |
| minw | 最小宽度 | Number | - | 50 |
| minh | 最小高度 | Number | - | 50 |
| x | 初始X坐标 | Number | - | 0 |
| y | 初始Y坐标 | Number | - | 0 |
| z | z-index值 | String/Number | - | 'auto' |
| handles | 可拖拽方向手柄 | Array | - | [tl,tm,tr,mr,br,bm,bl,ml] |
| axis | 拖动轴限制 | String | x/y/both | 'both' |
| grid | 对齐网格 | Array | - | [1,1] |
| parent | 是否限制在父元素内 | Boolean | true/false | false |
| maximize | 是否支持最大化 | Boolean | true/false | false |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| fillParent | 最大化填充父元素 | e |
| changePos | 改变位置 | left, top |
| reviewDimensions | 检查修正尺寸 | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| activated | 组件被激活 | 组件实例 |
| deactivated | 组件取消激活 | - |
| resizing | 正在调整大小 | 组件实例 |
| resizestop | 调整大小结束 | 组件实例 |
| dragging | 正在拖动 | 组件实例 |
| dragstop | 拖动结束 | 组件实例 |

---

## 六十四、ManuallyInput 手工输入组件（zoehis-manually-input）

> 支持手工输入日期，含日期校正、快捷键等功能

### 属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| value | 绑定值 | String/Object | - | - |
| mode | 日期模式 | String | normal/range | 'normal' |
| format | 日期格式 | String | - | 'yyyy-MM-dd' |
| hasTime | 是否包含时分秒 | Boolean | true/false | false |
| disabled | 是否禁用 | Boolean | true/false | false |
| readonly | 是否只读 | Boolean | true/false | false |
| clearable | 是否可清空 | Boolean | true/false | true |
| rangeedit | 是否范围编辑 | Boolean | true/false | false |
| endDateOver | 是否以23:59:59结尾 | Boolean | true/false | false |
| showclose | 是否显示关闭按钮 | Boolean | true/false | false |
| showErrorTip | 是否显示错误提示 | Boolean | true/false | false |
| errorTip | 错误提示内容 | String | - | '' |
| width | 输入框宽度 | String/Number | - | 0 |
| placeholder | 占位文字 | String | - | '请输入' |
| beforeClick | 点击前回调 | Function | - | - |

### 方法

| 方法名称 | 说明 | 参数 |
|---------|------|------|
| focus | 聚焦 | - |
| setDateTime | 设置时间 | date, endDate |
| adjustDate | 校正日期字符串 | dateStr |
| ejectValue | 抛出值（触发input/change） | - |

### 事件

| 事件名称 | 说明 | 回调参数 |
|---------|------|---------|
| input | 值变化 | inputVal 或 {startDate, endDate} |
| change | 值变化（校正后） | adjustDate(inputVal), mode |
| clear | 清空 | - |
| enter | 回车 | - |
| focus | 聚焦 | - |
| blur | 失焦 | value, inputVal |
| skipAction | 数字输入跳转下一位 | curInfo |

---

## zoehisUI.js 完整组件清单

> 以下为 zoehisUI.js 中注册的所有 Zoehis* 组件（共90+个），按类别整理：

### 表单组件（18个）
Input, InputNumber, Select, MultipleSelect, Radio, Checkbox, Switch, Slider, DatePicker, TimePicker, Cascader, Form, FormItem, Upload, Autocomplete, ColorPicker, DateEditor, MonthPicker, QuarterPicker

### 数据展示组件（18个）
Table, TableTd, TableSummary, Tag, Badge, Progress, ProgressPopup, Popover, Tree, TreeNode, Collapse, CollapseItem, Empty, Timeline, TimelineItem, Descriptions, DescriptionsItem, List, ListItem, ListItemMeta, Steps, Step, StatusCard, Divider, Calendar, Scrollbar, BackTop

### 基础组件（3个）
Button, ButtonGroup, Func

### 导航组件（7个）
Menu, MenuGroup, VerticalMenu, NavMenu, Submenu, MenuItem, Tab

### 反馈组件（5个）
Dialog, Drawer, MessageBox, Spinner, ProgressPopup

### 布局组件（9个）
Container, Header, Footer, Aside, Row, Col, ColItem, Page, Partition, PageLayout, BasePageLayout

### 其他组件（3个）
Transfer, DraggableResizable, ManuallyInput, RowSearch(空壳), Dropdown, DropdownItem, DropdownMenu, Bar(内部)

### zoehis-tree 基本用法

```vue
<template>
  <zoehis-tree
    ref="tree"
    :data="treeData"
    :props="treeProps"
    showcheckbox
    highlightcurrent
    defaultexpandall
    @nodeselect="handleNodeSelect"
    @nodeexpand="handleNodeExpand"
  ></zoehis-tree>
</template>

<script>
export default {
  data() {
    return {
      treeData: [
        { id: 1, label: '一级 1', children: [
          { id: 4, label: '二级 1-1' }
        ]},
        { id: 2, label: '一级 2', children: [
          { id: 5, label: '二级 2-1' },
          { id: 6, label: '二级 2-2' }
        ]}
      ],
      treeProps: { children: 'children', label: 'label', id: 'id' }
    }
  },
  methods: {
    handleNodeSelect(nodeData, node) {
      console.log('选中节点:', nodeData)
    },
    getCheckedKeys() {
      return this.$refs.tree.getCheckedKeys()
    }
  }
}
</script>
```vue
<template>
  <div>
    <!-- 基本用法 -->
    <zoehis-input v-model="inputValue" placeholder="请输入内容"></zoehis-input>
    
    <!-- 禁用状态 -->
    <zoehis-input v-model="inputValue" disabled></zoehis-input>
    
    <!-- 密码框 -->
    <zoehis-input v-model="password" type="password" placeholder="请输入密码"></zoehis-input>
    
    <!-- 带错误提示 -->
    <zoehis-input v-model="inputValue" error-tip="输入内容不正确"></zoehis-input>
    
    <!-- 限制输入长度 -->
    <zoehis-input v-model="inputValue" :max-length="20" show-word-limit></zoehis-input>
  </div>
</template>
```

### Select 选择器

```vue
<template>
  <div>
    <!-- 基本用法 -->
    <zoehis-select v-model="value" :selectdata="selectdata"></zoehis-select>
    
    <!-- 可搜索 -->
    <zoehis-select v-model="value" :selectdata="selectdata" filterable></zoehis-select>
    
    <!-- 禁用状态 -->
    <zoehis-select v-model="value" :selectdata="selectdata" disabled></zoehis-select>
    
    <!-- 自定义字段名 -->
    <zoehis-select 
      v-model="value" 
      :selectdata="selectdata" 
      itemcode="code"
      itemtext="name"
    ></zoehis-select>
    
    <!-- 虚拟滚动（大数据量） -->
    <zoehis-select 
      v-model="value" 
      :selectdata="bigData" 
      :virtual-scroll="true"
      @scroll-to-bottom="loadMore"
    ></zoehis-select>
  </div>
</template>

<script>
export default {
  data() {
    return {
      value: '',
      selectdata: [
        { id: 1, text: '选项一' },
        { id: 2, text: '选项二' },
        { id: 3, text: '选项三' }
      ]
    }
  }
}
</script>
```

### Form 表单

```vue
<template>
  <zoehis-form :model="form" :rules="rules" ref="form">
    <zoehis-form-item label="用户名" prop="username">
      <zoehis-input v-model="form.username"></zoehis-input>
    </zoehis-form-item>
    <zoehis-form-item label="密码" prop="password">
      <zoehis-input v-model="form.password" type="password"></zoehis-input>
    </zoehis-form-item>
    <zoehis-form-item>
      <zoehis-button type="primary" @clickenter="submitForm">提交</zoehis-button>
    </zoehis-form-item>
  </zoehis-form>
</template>

<script>
export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 提交表单
        }
      })
    }
  }
}
</script>
```
