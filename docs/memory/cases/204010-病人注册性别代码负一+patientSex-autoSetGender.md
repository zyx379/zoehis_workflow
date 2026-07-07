# [204010] 病人注册性别代码 -1 修复
> **文件名**：`204010-病人注册性别代码负一+patientSex-autoSetGender.md`


> 状态：`verified`  
> 日期：2026-06-22  
> 域：收费 / 病人注册

---

## 背景

- **需求**：漳州市医院开启「身份证解析性别」后，病人注册产生性别代码 `-1` 的非法数据
- **页面/菜单**：病人注册（门诊/住院通用，`patientInfoForm.vue`）
- **仓库**：`onelink-micro-optimus-fj-common`、`onelink-web-his-charge-fj-common`
- **文件**：
  - `CommonUtilService.java` — `getDefaultDict()` `case "SEX"`
  - `patientInfoForm.vue` — `setDefaultData()`

## 问题 / 目标

- 新建病人时 `patientSex` 被写成 `-1`，性别名称翻译为空
- 目标：开启 `auto_set_gender_from_id_card` 时初始化性别为空；输入身份证后再解析；字典翻译正确

## 根因与正确做法

### 根因 1（后端）

`getDefaultDict()` 的 `case "SEX"` 误用 `dictName("DIC_COUNTRY_DICT")`（国家字典），应改为 `"SEX"`（`ZOEDICT.DIC_BASIC_DICT`，值 0/1/2/9）。

### 根因 2（前端）

`setDefaultData()` 中 `if (this.autoSetGenderFromIdCard)` 逻辑**写反**：参数开启（从身份证解析）时反而取 `SEX` 系统参数默认值；漳州市医院 `SEX` 参数为 `-1`（表示空），被写入 `patientSex`。

### 正确做法

```javascript
// 开启身份证解析性别时，初始化不取默认性别
if (!this.autoSetGenderFromIdCard) {
  const sexKey = data[3].key
  if (!$.zoe.isNullOrEmpty(sexKey) && sexKey !== '-1') {
    // 赋值 patientSex / patientSexName
  }
}
```

身份证 blur/change 时 `autoSetGenderFromIdCard` 为 true 的解析逻辑保持不变。

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| `ZOEDICT.DIC_BASIC_DICT` | SELECT | `DICT_NAME='SEX'` |
| `/util/commonUtil/getDefaultDictList` | 查询 | 返回各字典默认 key/value |
| 页面参数 `auto_set_gender_from_id_card` | 读取 | `$getPageControlMap`，state=1 开启身份证解析 |

## 测试要点

- **开启参数**：新建注册 → 性别为空，无 `-1`；输入身份证 → 自动男/女
- **关闭参数**：新建注册 → 取 `SEX` 系统参数默认（跳过 `-1`）
- 性别下拉显示名称正常（男/女）

## 关联 commit

- `[204010]【漳州市医院】病人注册性别代码-1修复`（optimus + charge-web）

## 可复用结论

- `getDefaultDict` 各 `case` 的 `dictName` 必须与 `DIC_BASIC_DICT.DICT_NAME` 一致，勿复制粘贴错字典名
- 页面参数「从身份证解析性别」与「初始化取默认性别」互斥：开启前者时 `setDefaultData` 跳过 `SEX` 默认值
- `SEX` 系统参数 `-1` 表示空，写入 `patientSex` 前须过滤

## 升格建议

- [ ] workflow
- [ ] skill / patterns
- [ ] rule
- [x] 无需升格，保留 case 即可

**说明**：与 [204009 联系人电话](2026-06-contact-phone-validation.md) 同组件 `patientInfoForm.vue`，参数体系不同（页面参数 vs 无新参数）。
