# [203283] 门诊诊病患者信息栏显示卫健委预约渠道
> **文件名**：`203283-门诊诊病预约渠道显示+APPT_WAY-healthDisplay.md`


> 状态：`released`  
> 日期：2026-06-12

---

## 背景

- **需求**：门诊诊病界面患者信息栏显示预约渠道，**仅** `APPT_WAY=channel_health`（卫健委）时展示「卫健委」标签
- **项目**：漳州二院
- **页面**：门诊诊病 `pages/outpatientTreatment/main.vue`（`#patientInfo` 插槽）
- **生效范围**：仅门诊诊病页，**不改** `cis-common` 公共读卡组件

## 实现要点

### 数据获取

读卡成功后的 `patientInfo` **不含** `apptWay`，需按挂号号二次查询：

| 项 | 值 |
|----|-----|
| 表 | `ZOEAPPT.APT_OUTP_APPT_RECORD` |
| 字段 | `APPT_WAY` → 前端 `apptWay`；`EVENT_NO` → `eventNo` |
| 接口 | `POST /charge-service/api/dict/reservation/outpApptRecord/get` |
| 入参 | `{ eventNo }` |

### 前端改动（仅 `onelink-web-outp-fj-common`）

1. **`api/charge-service/dict/reservation/OutpApptRecord.js`** — 新增 `get`
2. **`pages/outpatientTreatment/main.vue`**
   - `data.patientApptWay`
   - `readCardSuccessAfter` → `loadPatientApptWay(patientInfo)`
   - `cleanCardSuccess` → 清空 `patientApptWay`
   - `#patientInfo` 内读卡条上方/旁：`v-if="patientApptWay === 'channel_health'"` 显示「卫健委」
   - 样式类 `outp_appt_way_health_tag`（患者信息栏右上角绝对定位）

### 未采用方案

- **`#field-apptWay` + `selfFieldsConfig`**：依赖读卡页字段配置，且与 release 分支结构差异大；改为 `main.vue` 内独立标签更简单
- **改 `onelinkReadCardStrip.vue`**：会影响住院等全局场景，与本需求「仅门诊生效」冲突

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| `APT_OUTP_APPT_RECORD` | SELECT | `APPT_WAY`、`EVENT_NO` |
| `outpApptRecord/get` | POST | 按 `eventNo` 查预约记录 |

## 发布记录

| 分支 | Commit / Tag |
|------|----------------|
| master | `1d5ce898` |
| release-1.166 | `b8de178d`（cherry-pick） |
| Tag | **`release-1.166.19`** |

**release cherry-pick 注意**：`main.vue` 与 master 导入区不一致（release 无 `fwxtConfig`/`createMixin`/`OutpRegisterInfo` 等），冲突时**只追加** `OutpApptRecord` import 与 mixin 注册，勿整段带入 master 独有 import。

## 测试要点

1. 预约渠道为 `channel_health` 且已挂号患者读卡 → 患者信息栏见「卫健委」
2. 其他渠道（如 `channel_charge`）→ 不显示
3. 清卡 → 标签消失
4. 快速切换病人 → 异步回调校验 `eventNo`，避免串显

## 可复用结论

- 读卡条 `patientData` 无预约渠道时，用 **`OutpApptRecord.get({ eventNo })`** 补查，比 `getPatientAptRegRecord`（列表、无 `APPT_WAY`）更直接
- 「仅单页生效」的读卡条扩展：**改页面 `main.vue`**，不用 `cis-common` 内置字段
- release-1.166 与 master 的 `main.vue` 差异大，发布优先 **cherry-pick + 最小冲突解**

## 升格建议

- [ ] workflow
- [ ] skill
- [ ] rule
- [x] 保留本 case
