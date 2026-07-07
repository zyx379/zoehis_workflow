# [204009] 病人信息联系人电话位数校验
> **文件名**：`204009-联系人电话位数校验+contactPhone-patientInfoForm.md`


> 状态：`verified`  
> 日期：2026-06-22  
> 域：收费 / 病人信息

---

## 背景

- **需求**：病人信息修改页面，联系人电话号码增加位数校验
- **页面/菜单**：病人信息管理 → 病人信息修改（入院登记等同组件复用）
- **仓库**：`onelink-web-his-charge-fj-common`
- **文件**：`components/patient/registerFile/patientInfoForm.vue`（`patientInfoUpdate.vue` 引用该表单）

## 问题 / 目标

- 原逻辑：`contactPhone`、`contactTwoPhone`、`contactThreePhone` 为纯 `zoehis-input`，无 `error-tip` / blur 校验
- 本人 `phone` 已有 `phoneBlur` / `phoneChange` + 系统参数 `save_patient_info_check_phone`（`checkPhone`）控制
- 目标：三个联系人电话与本人电话规则一致（11 位手机 + 座机兜底），**blur 时校验**，**不新增系统参数**

## 根因与正确做法

### 实现要点

1. 三个字段各增 `:error-tip`、`show-error-tip`、`@blur`
2. 抽取 `getContactPhoneErrorMsg(phone)`，复用已有 `checkPhoneFormat` 与 `phoneEightLimit` 座机正则
3. `initErrorTip()` 同步清空三个联系人电话错误提示
4. **空值不校验**（联系人电话多为非必填）；有值时 blur 即校验，**不受** `checkPhone` 系统参数开关影响

### 校验规则（与本人电话一致）

```
长度 11 → $.zoe.isMobilePhone → checkPhoneFormat(/^(\+86)?1[3-9]\d{9}$/)
若仍失败且 phoneEightLimit=1 → 座机正则 ^([1-9]\d{6})$|^([1-9]\d{7})$|^(0\d{2,3}-[1-9]\d{6})$|^(0\d{2,3}-[1-9]\d{7})$
```

### 参考代码位置

| 能力 | 方法/参数 | 说明 |
|------|-----------|------|
| 本人电话 blur | `phoneBlur` / `phoneChange` | 受 `checkPhone` 控制 |
| 联系人电话 blur | `contactPhoneBlur` 等 | 直接校验，无参数开关 |
| 座机开关 | `phone_eight_limit` → `phoneEightLimit` | `getCertificateTypeParam` 读取 |
| 工具 | `$.zoe.isMobilePhone` | `onelink-web-cis-common` zoeUtil |

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| 无 DB 变更 | — | 纯前端校验 |
| `charge-service/api/dict/patient/base/info/updateContactsInfo` | 保存 | 病人信息修改保存联系人 |

## 测试要点

- MCP 造数：无（纯前端）
- 界面步骤：
  1. 打开病人信息修改，联系人电话输入不足 11 位后 blur → 提示格式错误
  2. 输入合法 11 位手机号 blur → 无错误
  3. 环境开启 `phone_eight_limit` 时，合法座机（如 `0596-1234567`）→ 通过
  4. 联系人 2、联系人 3 电话重复上述步骤
  5. 字段留空 blur → 不提示

## 关联 commit

- master：`730f17ac` — `[204009]【漳州市医院】病人信息-联系人电话号码增加位数校验`
- release-1.168：cherry-pick `5e7e988d`；tag **`release-1.168.30`**

## 可复用结论

- **病人信息表单统一入口**：门诊/住院登记与修改均用 `patientInfoForm.vue`，改联系人/电话类字段优先查此组件
- **复用本人电话校验**：新增电话类字段可抽 `getContactPhoneErrorMsg`，勿重复写正则；座机兜底看 `phoneEightLimit`
- **参数策略**：本人电话用系统参数 `save_patient_info_check_phone`；需求明确「直接加」的联系人字段可固定 blur 校验、不走新参数

## 升格建议

- [ ] workflow
- [ ] skill / patterns
- [x] rule（可选：`zoehis-frontend` 补充 patientInfoForm 电话校验模式）
- [x] 无需升格，保留 case 即可

**说明**：模式简单，case + 页面路由索引即可支撑后续检索。
