# [206670] 取药接口 waitNumber 取值优化

> **Agent 会话标题（中文）**：门诊取药接口 waitNumber（等待人数）取值优化  
> **短期记忆**：需求进行中临时文件；Step 12 沉淀长期 case 后 **删除本文件**。  
> 日期：2026-07-09  
> 状态：`delivered`（master push + release-1.166 cherry-pick + tag release-1.166.171）  
> 来源：prompt_space/prompt1.md（外部编辑器初步分析，仅 Step 0–4；spec 与实现在 Cursor 完成）

---

## 需求摘要

- **任务类型**：功能改造（接口返回字段取值优化）
- **禅道 / 项目**：206670 / 漳州二院
- **需求描述**
  1. 排查推断返回下列「调用 HIS 取药接口」JSON 的是哪个接口：
     ```json
     {"code":"00000","data":[{"backWindowNo":"03","waitNumber":8,"windowNo":"窗口3",
       "presNo":58917842,"patientId":"6000957534","takeDrugTime":"",
       "takeDrugAddress":"西药房","deptCode":"2040100","queueNo":"T932"}],
      "message":"","error":"","traceId":"b5e0ad6d2aea9aa2","guide":""}
     ```
  2. 接口返回 `waitNumber` 字段取值优化（目标 SQL）：
     ```sql
     select count(distinct aaa.QUEUE_NO)
       from zoedrug.v_outp_auto_accept aaa
      where aaa.UP_SCREEN_TIME is null
        and aaa.OPERATED_TIME >= trunc(sysdate)
        and aaa.DEPT_CODE = 西药房科室编码
     ```
- **禁止**：改代码、git pull/commit/push（仅分析）；外部分析不调 MCP。

---

## 代码地图（Step 4 产出）

| 仓库 | 路径 | 角色（接口 / Service / SQL） | 置信度 |
|------|------|------------------------------|--------|
| `onelink-micro-charge-fj-common` | `.../dict/web/automatic/OutpMedicineController.java`（`@RequestMapping("/api/automatic/outpMedicineController")`） | 门诊自动接单/发药机接口集合（签到 `checkInPatients`、上屏 `sendCallMessage` 等）；候选返回取药 JSON 的接口簇 | 中 |
| `onelink-micro-charge-fj-common` | `.../dict/web/automatic/OutpAutoDrugController.java` / `OutpAutoAcceptPoolController.java` | 接单池/发药记录查询接口（响应含 `waitNumber`/`backWindowNo`/`queueNo` 等） | 中 |
| `onelink-micro-charge-fj-common` | `.../dict/service/automatic/WindowUtilServiceImpl.java` | `getWaitingNumber(windowNo,deptCode)`(L1268) 计算等待人数；`setWaitNumber`(L262/348/491) 写入接单池 | 高 |
| `onelink-micro-charge-fj-common` | `.../mappings/dict/automatic/OutpAutomaticDao.xml` → `getWaitNumber`(L1261) | **waitNumber 当前 SQL（核心改造点）** | 高 |
| `onelink-micro-charge-fj-common` | `.../mappings/dict/automatic/OutpAutoMedicineDrugDao.xml` → `getAutoAcceptInfo`(L745) | 取药信息返回（WAIT_NUMBER/queueNo/frontWindowNo/presNo/takeDrugAddress…） | 中 |
| `onelink-micro-charge-fj-common` | `.../mappings/dict/automatic/OutpAutomaticDao.xml`(L853) / `OutpAutoDrugDao.xml`(L285) | 读 `V_OUTP_AUTO_ACCEPT` / `DRU_OUTP_AUTO_ACCEPT_RECORDS` 的 `WAIT_NUMBER` 返回 | 中 |
| `onelink-micro-charge-fj-common` | `.../dispensing/entity/OutpAutoAccept.java` / `automatic/entity/OutpAutoAcceptPool.java` | 实体含 `waitNumber`/`backWindowNo`/`presNo`/`patientId`/`queueNo`/`deptCode`/`upScreenTime` 等 | 高 |
| `onelink-web-his-charge-fj-common` / `onelink-web-his-drug-fj-common` | `selfTakeDrug.vue` 等取药/叫号屏前端 | 调用取药接口、展示 `windowNo`/`takeDrugAddress`/`waitNumber` | 低（前端来源待确认） |

### 调用关系（后端）

```
【waitNumber 取值链路】
WindowUtilServiceImpl.getWaitingNumber(windowNo, deptCode)   [L1268]
   → OutpAutomaticDao.getWaitNumber(windowNo, deptCode, excludeDeptList)   [OutpAutomaticDao.xml L1261]
   → 计算后 outpAutoAcceptPool.setWaitNumber(...)   [写入 DRU_OUTP_AUTO_ACCEPT_POOL.WAIT_NUMBER]
        ↑ 接单（自动接单/签到）时写入；之后取药查询接口（getAutoAcceptInfo / OutpAutoDrugDao / OutpAutomaticDao）从
          DRU_OUTP_AUTO_ACCEPT_POOL / DRU_OUTP_AUTO_ACCEPT_RECORDS / V_OUTP_AUTO_ACCEPT 读 WAIT_NUMBER 返回前端

【取药信息返回（含 windowNo/backWindowNo/takeDrugAddress）】
OutpWindowDao.xml（窗口配置：windowNo=前缀+FRONT_WINDOW_NO、backWindowNo、takeDrugAddress=DEPT_LOCATION）
 + OutpAutoMedicineDrugDao.getAutoAcceptInfo（waitNumber/queueNo/presNo/patientId/takeDrugAddress）
 + DRU_OUTP_AUTO_ACCEPT_RECORDS.DOWN_SCREEN_TIME（takeDrugTime）
```

---

## 需求分析要点

### 业务域
- 门诊 / 药库（门诊发药自动接单、取药叫号屏 / 自助机取药）。漳州二院取药场景。

### 当前 waitNumber 计算口径（已读源码确认）
`OutpAutomaticDao.getWaitNumber`（L1261）：
```sql
select count(*) from (
  select p.PATIENT_ID
  from ZOEDRUG.DRU_OUTP_AUTO_ACCEPT_POOL p, zoepres.pres_outp_pres_master m
  where p.pres_no = m.pres_no
    [and m.APPLY_DEPT_CODE not IN (:waiting_count_exclude_apply_dept)]   -- 系统参数排除科室
    and p.UP_SCREEN_STATUS = 0          -- 未上屏
    and p.FRONT_WINDOW_NO = #{windowNo} -- 按【前台窗口】过滤
    and p.DEPT_CODE = #{deptCode}
    and p.OPERATED_TIME >= trunc(sysdate)
  group BY p.PATIENT_ID
)
```
- 计数单位：`count(distinct PATIENT_ID)`
- 数据源：`DRU_OUTP_AUTO_ACCEPT_POOL`（接单池），用 `UP_SCREEN_STATUS=0` 表示未上屏

### 需求目标口径（prompt 给定）
```sql
select count(distinct aaa.QUEUE_NO)
  from zoedrug.v_outp_auto_accept aaa
 where aaa.UP_SCREEN_TIME is null
   and aaa.OPERATED_TIME >= trunc(sysdate)
   and aaa.DEPT_CODE = 西药房科室编码
```
- 计数单位：`count(distinct QUEUE_NO)`
- 数据源：`zoedrug.V_OUTP_AUTO_ACCEPT`（视图，注释「获取窗口」）
- 未上屏判定：`UP_SCREEN_TIME is null`
- **不再按 FRONT_WINDOW_NO 过滤**（改为按科室整体）；**移除** `waiting_count_exclude_apply_dept` 排除逻辑

### 关键差异（改造影响）
| 维度 | 当前 | 目标 |
|------|------|------|
| 数据源 | `DRU_OUTP_AUTO_ACCEPT_POOL` | `V_OUTP_AUTO_ACCEPT`（视图） |
| 未上屏判定 | `UP_SCREEN_STATUS = 0` | `UP_SCREEN_TIME is null` |
| 过滤范围 | `FRONT_WINDOW_NO = windowNo` + `DEPT_CODE` | 仅 `DEPT_CODE`（去窗口化，全院/药房整体） |
| 计数单位 | `distinct PATIENT_ID` | `distinct QUEUE_NO` |
| 排除科室 | 有（`waiting_count_exclude_apply_dept`） | 无 |

### 参数体系
- 当前 waitNumber 受系统参数 `waiting_count_exclude_apply_dept`（ParamCacheUtil 读取）影响；改造后该参数可能失效/需评估。
- 不新增参数（待确认是否保留排除科室能力）。

### 数据流（表 / 视图）
| 对象 | 用途 |
|------|------|
| `ZOEDRUG.V_OUTP_AUTO_ACCEPT` | 视图（获取窗口）；需求目标 SQL 数据源；含 `QUEUE_NO`/`UP_SCREEN_TIME`/`OPERATED_TIME`/`DEPT_CODE` |
| `ZOEDRUG.DRU_OUTP_AUTO_ACCEPT_POOL` | 门诊发药接单池；`WAIT_NUMBER`/`UP_SCREEN_STATUS`/`FRONT_WINDOW_NO`/`DEPT_CODE` |
| `ZOEDRUG.DRU_OUTP_AUTO_ACCEPT_RECORDS` | 门诊摆药自动接单记录；`WAIT_NUMBER`/`UP_SCREEN_TIME`/`DOWN_SCREEN_TIME`(取药时间) |
| `ZOEDRUG.DRU_OUTP_FB_WINDOW_BINDING` / `DRUG_OUTP_MEDICINE_CONFIG` | 前后台窗口绑定 / 取药地址、窗口前缀 |

### 记忆库命中（本地）
- [本地] `docs/memory/short-term/205272-self-take-drug-print-count.md` — 禅道#205272 漳州二院取药域；确认 `DRU_OUTP_AUTO_ACCEPT_POOL` 含 `WAIT_NUMBER`、代码位于 `onelink-micro-charge-fj-common`，`OutpAutoAcceptDao.xml`/`WindowUtilServiceImpl` 等。
- [本地] `dev/skills/his-log-diagnosis/cases.md` CASE-002 — `OutpMedicineController.sendCallMessage` 上屏路径；**重要区分**：POOL 用 `UP_SCREEN_STATUS`，VIEW(`V_OUTP_AUTO_ACCEPT`) 用 `UP_SCREEN_TIME`；当前 `getWaitNumber` 基于 POOL，`getNoPrintPres` 基于 POOL。
- [本地] `docs/memory/cases/202510-自助机取药凭证预览放大+selfTakeDrug-preview-remark.md` — 禅道#202510 自助机取药页面 `selfTakeDrug.vue` 及票据逻辑。

---

## MCP 字段核验（Cursor Step 4 补充）

| 对象 | 结论 |
|------|------|
| `V_OUTP_AUTO_ACCEPT` | 视图为 `DRU_OUTP_AUTO_ACCEPT_POOL` ∪ `DRU_OUTP_AUTO_ACCEPT_RECORDS`（`TABLE_TYPE` 区分）；**不含** `UP_SCREEN_TIME` / `UP_SCREEN_STATUS` 列 |
| `DRU_OUTP_AUTO_ACCEPT_POOL` | 含 `UP_SCREEN_TIME`、`UP_SCREEN_STATUS`、`QUEUE_NO`、`DEPT_CODE`、`FRONT_WINDOW_NO`、`OPERATED_TIME`、`WAIT_NUMBER` 等 |
| 需求 SQL 修正 | 需求给定 `V_OUTP_AUTO_ACCEPT.UP_SCREEN_TIME` **在视图上不可用**；科室模式应查 **`DRU_OUTP_AUTO_ACCEPT_POOL`**，`UP_SCREEN_TIME IS NULL` + 仅 `DEPT_CODE` 过滤（语义等价于「接单池未上屏」） |

## 待确认问题（Step 5 更新）

1. ~~返回 JSON 端点~~ → **已定位**：`waitNumber` 在接单时由 `WindowUtilServiceImpl.getWaitingNumber` 计算并 `setWaitNumber` 写入 `DRU_OUTP_AUTO_ACCEPT_POOL`；取药 JSON（含 `backWindowNo`/`windowNo`/`takeDrugAddress`/`queueNo`）由自动接单/签到链路读 pool 返回。主入口之一：`OutpMedicineController.checkInPatients` → `OutpMachineService.checkInPatients`；漳州二院另有 `OutpAutoDrugController.checkInPatients`。
2. ~~去窗口化~~ → **人工审核已确认**：增加系统参数控制按窗口 / 按科室，**默认保持按窗口**（兼容其他医院）。
3. ~~列名核验~~ → 见上表；科室模式用 POOL 表，不用视图。
4. **`getWaitingNumber` 签名** → **保留** `(windowNo, deptCode)`；科室模式下 `windowNo` 不参与 SQL，避免改 6+ 处调用方。
5. **`OutpAutomaticServiceImpl` L1512** → **不同源**：该处 `waitNumber` 来自 `dayQueueService.getDayQueueNo`（儿童/柳州旧流程），**不在本次改造范围**；本次只改 `WindowUtilServiceImpl.getWaitingNumber` → `getWaitNumber` 链路。
6. **`count(distinct QUEUE_NO)` vs PATIENT_ID`** → 科室模式按需求用 `QUEUE_NO`；窗口模式保持 `PATIENT_ID` 不变。
7. **`waiting_count_exclude_apply_dept`** → **窗口模式保留**；科室模式不使用该排除逻辑（与需求 SQL 一致）。

---

## 改造计划（Spec）

### 涉及子仓库

- [x] `onelink-micro-charge-fj-common`：waitNumber 计算 SQL + Service 读参（**唯一代码仓**）
- [ ] 参数种子：`ChargeBizSysParam.jsonl`（**单独 commit**）

### 文件清单

| 仓库 | 路径 | 改动类型 |
|------|------|----------|
| onelink-micro-charge-fj-common | `.../mappings/dict/automatic/OutpAutomaticDao.xml` → `getWaitNumber` | 修改 SQL（`<choose>` 双分支） |
| onelink-micro-charge-fj-common | `.../dao/automatic/OutpAutomaticDao.java` | 方法增加 `statMode` 入参 |
| onelink-micro-charge-fj-common | `.../service/automatic/WindowUtilServiceImpl.java` → `getWaitingNumber` | 读取新系统参数并传入 Dao |
| onelink-micro-charge-fj-common | `.../params/ChargeBizSysParam.jsonl`（路径以实现时为准） | 新增参数种子 |

### 数据库

| 表/视图 | 操作 | 说明 |
|---------|------|------|
| `DRU_OUTP_AUTO_ACCEPT_POOL` | 只读 | 两种模式均查接单池；科室模式 `UP_SCREEN_TIME IS NULL` |
| `V_OUTP_AUTO_ACCEPT` | 不直接使用 | 视图无 `UP_SCREEN_TIME`，不采用需求原文视图 SQL |

### 参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `outp_wait_number_stat_mode` | 系统参数 | `0` | `0`=按**前台窗口**统计（现有逻辑）；`1`=按**药房科室**整体统计（漳州二院需求）。0/空兼容其他医院 |
| `waiting_count_exclude_apply_dept` | 系统参数（已有） | — | **仅 mode=0 时生效**；科室模式不参与过滤 |

**漳州二院运维配置**：`outp_wait_number_stat_mode=1`

### SQL 行为（`getWaitNumber`）

**mode=0（默认，现有逻辑不变）**

```sql
select count(*)
  from (
        select p.PATIENT_ID
          from ZOEDRUG.DRU_OUTP_AUTO_ACCEPT_POOL p,
               zoepres.pres_outp_pres_master m
         where p.pres_no = m.pres_no
           [waiting_count_exclude_apply_dept 排除开单科室]
           and p.UP_SCREEN_STATUS = 0
           and p.FRONT_WINDOW_NO = #{windowNo}
           and p.DEPT_CODE = #{deptCode}
           and p.OPERATED_TIME >= trunc(sysdate)
         group by p.PATIENT_ID
       )
```

**mode=1（漳州二院新口径）**

```sql
select count(distinct p.QUEUE_NO)
  from ZOEDRUG.DRU_OUTP_AUTO_ACCEPT_POOL p
 where p.UP_SCREEN_TIME is null
   and p.OPERATED_TIME >= trunc(sysdate)
   and p.DEPT_CODE = #{deptCode}
```

> 与需求差异说明：需求写 `V_OUTP_AUTO_ACCEPT`，经 MCP 核验视图无 `UP_SCREEN_TIME`；实现改查 POOL 表，业务语义一致（未上屏接单池记录）。

### 数据流变更

```
接单/分配窗口（WindowUtilServiceImpl L262/340/489/668/786/939）
  → getWaitingNumber(windowNo, deptCode)
      → 读 outp_wait_number_stat_mode
      → OutpAutomaticDao.getWaitNumber(windowNo, deptCode, excludeList, statMode)
  → setWaitNumber → DRU_OUTP_AUTO_ACCEPT_POOL.WAIT_NUMBER
  → 取药/签到接口读 pool 返回 JSON.waitNumber
```

- **无表结构变更**；不改 POOL→RECORD 流转
- **前端无改动**

### 待确认问题（实现前）

1. `ChargeBizSysParam.jsonl` 中 `creatorName`/`checkerName` 填哪位需求负责人？
2. 科室模式下 `UP_SCREEN_TIME IS NULL` 与窗口模式 `UP_SCREEN_STATUS = 0` 并存是否合理？（现场若两字段不同步，两种模式计数可能略有差异；若需统一可再议）

### 人工审核意见

> 根据窗口还是根据科室统计 增加一个参数控制吧

**已纳入 spec**：新增 `outp_wait_number_stat_mode`，默认 0 保持现网行为。

---

## 外部编辑器交接（供 Cursor 粘贴）

【来自 Trae/CodeBuddy 初步分析 — 请在 Cursor 从 Step 5 继续】

【禅道&项目】206670【漳州二院】

【短期记忆文件】`docs/memory/short-term/206670-取药接口waitNumber优化+getWaitNumber-V_OUTP_AUTO_ACCEPT.md`

【代码地图摘要】
| 仓库 | 路径 | 角色 | 置信度 |
| onelink-micro-charge-fj-common | WindowUtilServiceImpl.java (getWaitingNumber L1268) | waitNumber 计算 | 高 |
| onelink-micro-charge-fj-common | OutpAutomaticDao.xml → getWaitNumber (L1261) | waitNumber 当前 SQL（核心改造点） | 高 |
| onelink-micro-charge-fj-common | OutpAutoMedicineDrugDao.xml → getAutoAcceptInfo (L745) | 取药信息返回 | 中 |
| onelink-micro-charge-fj-common | OutpMedicineController.java | 取药接口簇（签到/上屏）候选端点 | 中 |

【调用关系】`getWaitingNumber` → `getWaitNumber`(SQL) → `setWaitNumber` 写 `DRU_OUTP_AUTO_ACCEPT_POOL.WAIT_NUMBER` → 取药查询接口读 WAIT_NUMBER 返回。

【记忆库命中】
- [本地] 205272 短期记忆 — 确认 WAIT_NUMBER 列与代码位置。
- [本地] his-log-diagnosis CASE-002 — POOL(UP_SCREEN_STATUS) vs VIEW(UP_SCREEN_TIME) 区分。
- [本地] 202510 case — 自助机取药页面。

【待确认（请 Cursor spec 前澄清或标注假设）】
1. 返回 JSON 的具体端点（见上文待确认 #1）。
2. waitNumber 是否去窗口化（按科室整体）。
3. MCP 核验 V_OUTP_AUTO_ACCEPT 列名。
4. getWaitingNumber 签名 windowNo 是否保留。
5. 是否仅改 getWaitNumber 一处（确认 OutpAutomaticServiceImpl L1512 同源）。
6. count(distinct QUEUE_NO) vs PATIENT_ID 口径。
7. waiting_count_exclude_apply_dept 参数去留。

【建议复杂度】Standard→Complex（单 SQL 改动，但语义从「按窗口」变「按科室」、计数单位与未上屏判定均变化，建议出 spec 确认）。

【下一步】请在 Cursor 完善 spec（Step 5），等我确认后实现。

---

## 人工审核意见（选填）

根据窗口还是根据科室统计 增加一个参数控制吧 → **已写入 Spec 参数 `outp_wait_number_stat_mode`**
