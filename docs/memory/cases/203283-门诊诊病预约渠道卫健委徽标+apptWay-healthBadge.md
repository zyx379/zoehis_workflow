# [203283] 门诊诊病预约渠道卫健委徽标显示 + 页面参数控制

> 禅道：203283 ｜ 项目：漳州二院 ｜ 类型：功能改造（UI + 参数）
> 关联短期记忆：`docs/memory/short-term/203283-门诊诊病预约渠道卫健委图标+apptWay-healthBadge.md`
> 前置改造：`cases/203283-门诊诊病预约渠道显示+APPT_WAY-healthDisplay.md`（仅单页文字展示，未下沉 cis-common）

## 背景

- 原改造（203283）在门诊诊病读卡条「传染史」字段位以纯文字"预约渠道: xxx"展示 `APPT_WAY=channel_health`（卫健委）。
- 部署版（release-1.166.19）曾用绝对定位标签 `outp_appt_way_health_tag` 遮挡患者余额，医院反馈"无图标 / 图标盖住余额"。
- 本次目标：红色文字徽标呈现，渲染在字段流（与余额同排、不遮挡）；并支持页面参数门控。

## 用户决策（确认点）

1. **apptWayName 作为标识显示**（非固定"卫健委"，由后端字典返回，如"卫健委"作文字）。
2. **仅卫健委渠道**（`apptWay === 'channel_health'`）渲染。
3. **页面参数控制**：显示开关 + 接口调用开关，均走门诊诊病**页面参数**（`$getPageControlMap(14)`，与同页 `register_btn_show` 等并列，configId=borderId=14）。

## 技术约束（关键结论）

- `OneLinkReadCardPatient` 为全局 UI 库组件，字段布局固定，**无法用 prop 追加新字段**。
- 读卡条注入自定义内容的唯一机制：`selfFieldsConfig` + `field-xxx` 插槽（只能覆盖已有内置字段，如 `field-onelink_infectionHistory`）。
- outp 通过路径 `@zoesoft.com.cn/onelink-web-cis-common/...` 引入读卡条 → 可在 cis-common 新建组件、outp 按路径 import 复用。
- "移入 cis-common 作正式字段"落地方式：**徽标组件由 cis-common 持有**，经已有 `field-onelink_infectionHistory` 插槽渲染于字段流（与余额同排，天然不遮挡）。

## 改动清单

| 仓库 | 文件 | 改动 |
|------|------|------|
| onelink-web-cis-common | `components/onelinkReadCard/onelinkApptWayHealthBadge.vue` | **新增** 红色文字徽标组件，props `apptWay`/`apptWayName`，`channel_health` 时渲染，文字=apptWayName |
| onelink-web-outp-fj-common | `pages/outpatientTreatment/main.vue` | import+注册徽标组件；`#field-onelink_infectionHistory` 插槽内用页面参数变量 `apptWayHealthShow` 门控渲染；删除旧 `.outp_appt_way_field` 样式 |
| onelink-web-outp-fj-common | `mixins/common/patientApptWayMixin.js` | `loadPatientApptWay` 用 `apptWayHealthShow` 控制是否调接口（false 跳过并清空） |
| onelink-web-outp-fj-common | `pages/outpatientTreatment/main.vue` `getMenuCustom()` | `borderId=14` 读取单一页面参数 `appt_way_health_show`（state=1 生效）写入 `apptWayHealthShow` |
| onelink-web-outp-fj-common | `mixins/sysParamsConst.js` | **已删除** 原误加系统参数（本需求为页面参数） |

## 页面参数（经 `$getPageControlMap(14)`，configId=borderId=14）

> 经 `zoehis-sys-param` 规则判定：本需求为**单页面（门诊诊病）行为控制** → 必须用**页面参数**，不能写系统参数。  
> **仅维护一个 key**（不再拆 show/query）。

| 参数 key（snake_case） | 默认 | 说明 |
|--------|------|------|
| `appt_way_health_show` | 未配置/state≠1 | state=1：调用 `OutpApptRecord.get` **且**显示徽标；关闭则不查不显 |

- 接入点：`main.vue` `getMenuCustom()` 的 `borderId = 14` 分支，通过 `mapId.appt_way_health_show.state == '1'` 读取。
- 运维在 **configId=14 的页面参数**下配置该 key、state=1 生效；**不写 `sys_param`、不写 `*BizSysParam.jsonl`**。
- 历史参数 `appt_way_health_query` 已废弃，勿再配置。
- 默认关闭（变量初始 `false`），兼容非卫健委医院。

## 数据流

```
读卡成功 → readCardSuccessAfter
  → loadPatientApptWay：若 apptWayHealthShow 为 false 直接 return（不调接口）
    → $api.OutpApptRecord.get → patientApptWay / patientApptWayName
  → 余额旁 #afterAvailableBalance（或历史 infectionHistory）插槽：
      v-if="apptWayHealthShow"
      <onelink-appt-way-health-badge :appt-way :appt-way-name/>
        → channel_health 时渲染红色文字（内容=apptWayName）
```

## 范围

- 仅门诊诊病页（`selfFieldsConfig` 仅此处配置），不影响住院等其他页。
- 不涉及表/SQL/新数据流；仅展示形态变更。

## 复用提示

- 后续若其他页面也要卫健委徽标：直接 `import onelinkApptWayHealthBadge`，配合该页 `field-xxx` 插槽，并用各自页面参数门控。
- 若需"非卫健委渠道也显示其他徽标"：在 `onelinkApptWayHealthBadge.vue` 扩展 `isHealth` computed（目前仅 channel_health）。

## 发布

### cis-common（onelink-web-cis-common）
- **规则变更（2026-07-13 用户明确）**：cis-common 默认按 `release-1.0` 系列打 tag（覆盖原"仅 push master 不打 tag"；中途曾误改 release-0.0，同日由用户纠正为 release-1.0）。
  - 已写入：`dev/skills/zoehis-git-ops/SKILL.md`（§仓库表 / §cis-common 默认 release-1 / §10.3）、`dev/skills/zoehis-ai-dev/SKILL.md`、`docs/memory/business-rules.md`、`AGENTS.md`。
  - cis-common 自身 `release-1.0.*` 序列（现网 max=3949），不打医院 `release-1.166/1.168` 分支 tag。
- **本次发布**：`git push origin master` → commit `1bc3eef89`（标题 `[203283]【漳州二院】门诊诊病预约渠道卫健委红色徽标组件`）；master 打 tag **`release-1.0.3950`** 并 push（CI 自动打包）。
  - 撤销记录：曾误打 `release-0.0.1`，已本地+远程删除；改打 `release-1.0.3950`（`release-1.0.*` 序列下一序号）。

### outp（onelink-web-outp-fj-common）
- **cis 依赖升级（2026-07-13）**：`package.json` 中 `@zoesoft.com.cn/onelink-web-cis-common` 由 `1.0.3938` 升到 `1.0.3950`（对齐 cis-common 本次发布的 `release-1.0.3950`）。
- **master 提交**：commit `3a53f070`，标题 `[203283]【漳州二院】门诊诊病预约渠道卫健委徽标显示 + 页面参数控制`（含 cis 升级 + 徽标组件注册 + 两个新系统参数 + `patientApptWayMixin` 接口开关），已 push master。
- **合并到项目分支**：全量 `git merge master` 会带入大量无关提交（冲突文件众多），**改用 cherry-pick 仅挑本次 commit**：
  - `git cherry-pick 3a53f070` → commit `26298199`，已 push `release-1.166`。
  - 解决 3 处冲突（`package.json` / `sysParamsConst.js` / `pages/outpatientTreatment/main.vue`），严格只保留本次改动，未把 master 其它参数 / `createMixin()` / `his-fj-component 0.0.237` 带入（保留 release-1.166 基线 `0.0.232`）。
- **打 Tag**：现网最大 `release-1.166.35` → 新建 **`release-1.166.36`**（打在 cherry-pick commit `26298199`）并推送，CI 自动打包。
- 注意：outp 依赖 cis-common 已发布的 `release-1.0.3950`（徽标组件路径 `@zoesoft.com.cn/onelink-web-cis-common/...`）。

### 参数（页面参数）
- 运维在 **configId=14 页面参数**下仅配置 `appt_way_health_show`，state=1 生效（查接口+显示一并开启；**非系统参数、非 `sys_param`、不写 jsonl**）。
- 原实现曾误用系统参数；后又拆成 show/query 两个页面参数，已收敛为**单一** `appt_way_health_show`（2026-07-14）。
