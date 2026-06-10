# [202226] 选择病人弹窗单病种与费用审核标识同时显示

> 状态：`retest-pending`（2026-06-10 修正仓库：cis-common）  
> 日期：2026-06-06（首修，改错仓）/ 2026-06-10（定位 cis-common + 补修）

---

## 背景

- **需求**：单病种显示「单」、费用审核显示「费」，两者同时满足时应并排展示
- **页面/菜单**：读卡条「选择病人」弹窗（住院收费等）
- **实际调用链**（charge 侧）：
  - `onelink-web-his-charge-fj-common` 页面 → `onelinkReadCardStrip`（npm/路径：`@zoesoft.com.cn/onelink-web-cis-common/...`）
  - → `onelinkPatientList.vue`（**正确改点**）
- **误改仓库**：`onelink-web-his-charge-fj-common/static/plugins/all-common-business/`（旧 ReadCardPatient / YSK·DaLian bundle，**非 charge 主路径**）

## 问题 / 目标

费用审核后列表只见红色「费」，绿色「单」不显示。

## 根因与正确做法

### 真根因（cis-common）

`onelink-web-cis-common/components/onelinkReadCard/onelinkPatientList.vue` 使用 **`v-else-if`**：

```vue
<span v-if="item.feeAuditFlag==1">费</span>
<span v-else-if="item.diseaseCode">单</span>  <!-- 费审核后永远进不来 -->
```

`feeAuditFlag==1` 与 `diseaseCode` 同时成立时，**逻辑互斥**，只显示「费」。  
列宽 `auditFlag` 已为 75px，**不是**裁切问题。

### 误路径（charge bundle，2026-06-06 首修）

`all-common-business` 内 YSK/DaLian `patientList` 已是独立 `v-if`；首修只做了列宽/wrap，**对 charge 使用 onelinkReadCardStrip 的场景无效**，故测试仍失败。

### 正确改法（2026-06-10）

**仓库**：`onelink-web-cis-common`  
**文件**：`components/onelinkReadCard/onelinkPatientList.vue`

1. 在院 / 出院两处 `td_auditFlag`：`v-else-if` → 两个独立 `v-if`
2. 用 `icon_patient_audit_wrap`（`inline-flex` + `gap`）包裹
3. 无标识时仍显示 `-`：`feeAuditFlag!=1 && !diseaseCode`

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| 无 | — | 纯前端；列表接口需返回 `diseaseCode`、`feeAuditFlag` |

## 测试要点

1. 住院结算等页（如 `inpatientSettlement.vue`）→ 读卡「选择病人」
2. 出院列表 → 单病种且已费用审核 → 同时见红「费」+ 绿「单」
3. **勿只验 charge 包**：需发布/联调 **cis-common**（或 charge 依赖的 cis-common 版本）

## 关联 commit

- 误修：`[202226]…` → `onelink-web-his-charge-fj-common`（all-common-business bundle）
- 正修：待提交 → `onelink-web-cis-common` `onelinkPatientList.vue`

## 可复用结论

- charge 的 `nuxt.config` **merge 了 cis-common**；读卡条优先查 **`onelinkReadCardStrip` → onelinkPatientList**
- 改读卡/选择病人前：**先 grep 页面 import 的是 cis-common 还是 all-common-business**
- 「费审核后单消失」+ **`v-else-if`** → 逻辑互斥，先于 CSS 排查
- 双标识 case 若改 bundle 无效 → 立刻查 cis-common `onelinkPatientList.vue`

## 升格建议

- [x] workflow：Step 2 读卡需求先查 import 链
- [x] skill：`common-patterns.md` §1.10
- [ ] rule
- [x] 保留并更新本 case
