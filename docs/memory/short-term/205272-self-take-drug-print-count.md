# [205272] 漳州二院 — 自助机/窗口取药小票打印次数控制

> **Agent 会话标题（中文）**：自助机与窗口取药小票打印次数控制及免接单流程
> **短期记忆**：需求进行中临时文件；Step 12 沉淀长期 case 后 **删除本文件**。  
> 日期：2026-07-04  
> 状态：`spec-draft`

---

## 需求摘要

- **任务类型**：功能改造
- **禅道 / 项目**：205272 / 漳州二院
- **页面 / 菜单**：
  - 自助取药机页面 `SelfServicePharmacy`（菜单：自助取药 / selfTakeDrug）
  - 门诊摆药界面排号打印（`outpPresQuery.vue`、`outpatientDispenseReset.vue`）
  - 门诊结算后小票打印（`outpatientSettlement.vue`）

### 需求要点

1. **自助机要求打印小票，但是不走自动接单流程**。  
2. **前台窗口和自助机打印取药小票后记录打印次数**。  
3. **自助机限制只能打印一次；如果窗口已经打印过，自助机不再打印小票**。  
4. 前台打印小票的两处：
   - 收费系统门诊结算后的小票打印（`OUTP_SETTLE_VOUCHER_ONLY_ONE`）
   - 门诊摆药界面的排号打印（`OUTP_AUTO_ACCEPT_LAY_DRUG_QUEUE`）

### 已知线索中的三处票据业务 ID

| 需求中业务 ID | 代码中实际 businessId | 使用位置 |
|---|---|---|
| `SELF_TAKE_DRUG_VOUCHER` | `SELF_TAKE_DRUG_VOUCHER` | `selfTakeDrug.vue` 自助取药凭证打印 |
| `OUTP_AUTO_ACCEPT_LAY_DRUG_QUEUE` | `OUTP_AUTO_ACCEPT_LAY_DRUG_QUEUE` | `outpPresQuery.vue`、`outpatientDispenseReset.vue` 排号小票 |
| `OUTP_SETTLE_VOUCHER_ONLY_ONE` | `OUTP_SETTLE_VOUCHER_ONLY_ONE` / `OUTP_SETTLE_VOUCHER` | `outpatientSettlement.vue` 结算小票 |

---

## 代码地图（Step 4 产出）

| 仓库 | 路径 | 角色（页面/API/Service/SQL） | 置信度 |
|---|---|---|---|
| `onelink-web-his-charge-fj-common` | `pages/charge/prePayManage/selfTakeDrug.vue` | 自助取药机页面：读卡/扫码 → 解析卡号 → 预览/打印 `SELF_TAKE_DRUG_VOUCHER` | 高 |
| `onelink-web-his-charge-fj-common` | `api/charge-service/dict/patient/Manager.js` | 前端 API：磁条卡解析 `magneticCardAnalyse` | 高 |
| `onelink-web-his-charge-fj-common` | `api/charge-service/automatic/Jianhuidrugmachine.js` | 前端 API：记录打印信息 `savePrintInformation`、返回取药窗口 `sendPrescriptionInfo` | 高 |
| `onelink-web-his-charge-fj-common` | `pages/charge/costSettlementManage/outpatientSettlement.vue` | 门诊结算页面：结算成功后打印 `OUTP_SETTLE_VOUCHER_ONLY_ONE`（注释中曾调用 `savePrintInformation`） | 高 |
| `onelink-web-his-charge-fj-common` | `api/charge-service/dict/settle/SettleManage.js` | 前端 API：结算相关，含 `getOutpAutoAcceptBySettleNos` | 高 |
| `onelink-web-his-drug-fj-common` | `pages/outpatientDispensManage/outpPresQuery.vue` | 门诊摆药查询：打印排队号 `OUTP_AUTO_ACCEPT_LAY_DRUG_QUEUE` | 高 |
| `onelink-web-his-drug-fj-common` | `pages/outpatientDispensManage/outpatientDispenseReset.vue` | 门诊摆药重制：重打排队号 `OUTP_AUTO_ACCEPT_LAY_DRUG_QUEUE` | 高 |
| `onelink-web-his-drug-fj-common` | `pages/outpatientDispensManage/dispensingConfirmation.vue` | 门诊配药确认：打印处方/用药贴 `OUTP_AUTO_ACCEPT_LAY_DRUG_AllPRES` 等 | 高 |
| `onelink-web-his-drug-fj-common` | `pages/outpatientDispensManage/ordersManager.vue` | 门诊发药管理：标签打印完成后更新 `LABLE_PRINT_STATUS` | 中 |
| `onelink-web-his-drug-fj-common` | `api/charge-service/dict/automatic/Outpautomatic.js` | 前端 API：摆药窗口打印状态更新 `acceptOrderEndComplete` / `acceptOrderEndCompletes` | 高 |
| `onelink-micro-charge-fj-common` | `onelink-micro-charge-service/.../dict/web/patient/PatientManagerController.java` | 后端 Controller：磁条卡解析 `magneticCardAnalyse` | 高 |
| `onelink-micro-charge-fj-common` | `onelink-micro-charge-service/.../dict/web/automatic/OutpAutoDrugController.java` | 后端 Controller：病人签到 `checkInPatients`（当前自助机未调用） | 高 |
| `onelink-micro-charge-fj-common` | `onelink-micro-charge-service/.../dict/service/automatic/OutpAutoDrugServiceImpl.java` | 后端 Service：自助机签到逻辑；含 `usePublicMethodFlag` 公共方法分支 | 高 |
| `onelink-micro-charge-fj-common` | `onelink-micro-charge-service/.../dict/service/automatic/JianHuiDrugMachineServiceImpl.java` | 后端 Service：建麾自助发药机逻辑；含 `savePrintInformation` 记录打印次数 | 高 |
| `onelink-micro-charge-fj-common` | `onelink-micro-charge-service/.../open/InpSendDrugController.java` | 后端开放接口：自助机打印调用 `savePrintInformation` | 高 |
| `onelink-micro-charge-fj-common` | `onelink-micro-charge-service/.../dict/service/automatic/OutpAutomaticServiceImpl.java` | 后端 Service：摆药窗口排号打印状态更新 `acceptOrderEndCompletesNew` | 高 |
| `onelink-micro-charge-fj-common` | `onelink-micro-charge-service/.../mappings/dict/automatic/JianHuiDrugMachineDao.xml` | SQL：打印次数查询/新增/删除 `DRUG_PRESCRIPTION_COLLECTION_RECORD` | 高 |
| `onelink-micro-charge-fj-common` | `onelink-micro-charge-service/.../mappings/dict/automatic/OutpAutomaticDao.xml` | SQL：`DRU_OUTP_AUTO_ACCEPT_POOL` 打印状态更新/查询 | 高 |
| `onelink-micro-charge-fj-common` | `onelink-micro-charge-service/.../mappings/dict/automatic/OutpAutoMedicineDrugDao.xml` | SQL：`DRU_OUTP_AUTO_ACCEPT_POOL` 插入/更新 `PRINT_STATUS`、`LABLE_PRINT_STATUS`、`THIRD_PRINT_COUNT` | 高 |
| `onelink-micro-charge-fj-common` | `onelink-micro-charge-service/.../mappings/dict/drug/OutpAutoAcceptDao.xml` | SQL：`DRU_OUTP_AUTO_ACCEPT_POOL` 查询（含 `getOutpAutoAcceptBySettleNos`） | 高 |

### 调用关系

```
【自助机 SELF_TAKE_DRUG_VOUCHER】
selfTakeDrug.vue
  → Manager.magneticCardAnalyse  (PatientManagerController.magneticCardAnalyse)
  → printSelfTakeDrugVoucher()
      → $comGetId({businessId: 'SELF_TAKE_DRUG_VOUCHER'})
      → $printOptionEve → odtprinter.print
  （当前未调用 savePrintInformation，也未检查窗口是否已打印）

【摆药窗口排号 OUTP_AUTO_ACCEPT_LAY_DRUG_QUEUE】
outpPresQuery.vue / outpatientDispenseReset.vue
  → $comGetId({businessId: 'OUTP_AUTO_ACCEPT_LAY_DRUG_QUEUE'})
  → $printOptionEve → odtprinter.print
  （当前未调用 savePrintInformation）
  → 发药/配药流程中通过 Outpautomatic.acceptOrderEndCompletes
      → OutpAutomaticServiceImpl.acceptOrderEndCompletesNew
      → OutpAutomaticDao.updateQueueNoPrintStatusPool
      → 更新 DRU_OUTP_AUTO_ACCEPT_POOL.PRINT_STATUS = '1'

【门诊结算小票 OUTP_SETTLE_VOUCHER_ONLY_ONE】
outpatientSettlement.vue
  → printMesBox → printOutpSettleVoucher
      → $comGetId({businessId: 'OUTP_SETTLE_VOUCHER_ONLY_ONE'})
      → postGetSettleVoucherDocumentApi → $printOptionEve → odtprinter.print
  （注释中曾调用 // this.savePrintInformation(settleNos)，当前未启用）
```

---

## 需求分析要点

### 业务域

- 门诊 / 收费 / 药库（自助取药、摆药窗口、门诊结算）
- 涉及漳州二院自助机接入，需要区分「自助机打印」与「窗口打印」两种来源

### 参数体系（系统 / 页面 / 无）

- 当前未识别到新增系统参数或页面参数。
- `selfTakeDrug.vue` 通过 URL 参数 `usePublicMethodFlag` 控制是否走公共方法/自动接单分支。
- 建议 spec 阶段确认：是否需要新增系统参数控制「自助机打印次数限制开关」或「打印来源字典」。

### 数据流（表、池表、流水）

| 表 | 用途 | 当前状态 |
|---|---|---|
| `ZOEDRUG.DRU_OUTP_AUTO_ACCEPT_POOL` | 门诊发药接单池；字段 `PRINT_STATUS` 记录排号/标签打印状态，`LABLE_PRINT_STATUS` 记录标签打印状态，`THIRD_PRINT_COUNT` 预留第三方打印次数字段 | 已存在，高频使用 |
| `ZOEDRUG.DRUG_PRESCRIPTION_COLLECTION_RECORD` | 记录打印次数：patient_id、card_number、printing_time、person_printed、print_source（1自助机/2诊间/3收费处）、queue_number | 已存在，`savePrintInformation` 已封装 |
| `zoecharge.CHA_OUTP_SETTLE_MASTER` / `CHA_OUTP_CHARGE_DETAIL` | 结算主细表；结算号与摆药接单池通过 apply_no 关联 | 已存在 |

- 摆药窗口排号打印后，`DRU_OUTP_AUTO_ACCEPT_POOL.PRINT_STATUS` 会被更新为 `'1'`（通过 `acceptOrderEndCompletesNew`）。
- 自助机目前仅在前端直接打印，未记录到 `DRUG_PRESCRIPTION_COLLECTION_RECORD`。
- 门诊结算小票打印目前也未记录打印次数。

### 参考 case

- [本地] `docs/memory/cases/202510-自助机取药凭证预览放大+selfTakeDrug-preview-remark.md` — 禅道#202510 — 自助取药页面 `selfTakeDrug.vue` 及票据预览逻辑，已知 `SHOW_PATIENT_QUEUE` 为预览模板、`SELF_TAKE_DRUG_VOUCHER` 为打印模板。
- [在线] IMA 知识库未成功检索（默认知识库 ID 获取失败，详见下方说明）。

---

## 待确认问题

1. **自助机「不走自动接单流程」的实现范围**：当前 `selfTakeDrug.vue` 已不调用 `OutpAutoDrug.checkInPatients`，仅做前端打印。需求是否要求保留/新增一个后端接口用于查询是否已打印，还是仅在前端调用现有 `savePrintInformation`/`getPersonPrinted` 能力？
2. **门诊结算小票是否纳入「取药小票」打印次数**：需求描述中把门诊结算小票与摆药排号小票并列。`DRUG_PRESCRIPTION_COLLECTION_RECORD` 当前通过 `queue_number` 关联，结算小票无排队号时如何记录（是否用 settle_no 或 card_number 维度）？
3. **打印来源字典是否需要扩展**：`print_source` 当前注释为 `1.自助机 2.诊间 3.收费处`。窗口排号打印来源应取 `2` 还是 `3`？门诊结算小票来源应取 `3` 还是新增？
4. **打印次数校验维度**：按 `card_number + queue_number + 当天`（当前 `getPersonPrinted` 逻辑）是否足够？是否需要增加 `dept_code` 或 `patient_id` 维度？
5. **`THIRD_PRINT_COUNT` 字段用途**：`DRU_OUTP_AUTO_ACCEPT_POOL` 已存在 `THIRD_PRINT_COUNT`，是否为第三方/自助机打印次数预留？本次是否启用该字段，还是继续使用 `DRUG_PRESCRIPTION_COLLECTION_RECORD`？
6. **重打逻辑**：窗口排号重打、结算小票重打是否累计打印次数？自助机是否严格只允许一次（含打印失败）？
7. **数据一致性**：`DRU_OUTP_AUTO_ACCEPT_POOL.PRINT_STATUS` 与 `DRUG_PRESCRIPTION_COLLECTION_RECORD.person_printed` 可能分别由不同流程维护，是否需要统一以 `DRUG_PRESCRIPTION_COLLECTION_RECORD` 为准？

---

## Spec（Step 5 — 待用户确认后进入 Step 6）

### 代码核查补充（Cursor Step 4 复核）

| 发现 | 说明 |
|---|---|
| 自助机当前接口 | `selfTakeDrug.vue` 方法名 `checkInPatients`，实际调 `Manager.magneticCardAnalyse`；**未**调 `OutpAutoDrug.checkInPatients` |
| 后端 magneticCardAnalyse | `PatientManagerController.magneticCardAnalyse` 仅 `commonUtilService.magneticCard(cardId)` 解析卡号，**不返回** queueNo/windowNo |
| 现有只读查询 | `OutpAutoDrugDao.getAcceptData(cardId)` 已可据卡号查 `DRU_OUTP_AUTO_ACCEPT_POOL` 窗口/排队号（**无**自动接单） |
| 打印次数落库 | `JianHuiDrugMachineServiceImpl.savePrintInformation` + `DRUG_PRESCRIPTION_COLLECTION_RECORD`；维度 `card_number + queue_number + 当天` |
| 结算小票关联 | `queueNumber` 为空时，`getQueueNumberBySettleNos` 由 settle_no 反查 pool.queue_no |
| 摆药排号打印 | `outpPresQuery.vue` / `outpatientDispenseReset.vue` 打印成功**未**调 `savePrintInformation`；**未**调 `acceptOrderEndCompletes`（该接口在 `automaticOrdersNew.vue` 等配药流程） |
| THIRD_PRINT_COUNT | 代码 insert 含该字段，测试库 MCP 查 `DRU_OUTP_AUTO_ACCEPT_POOL` **无此列** → 本次不启用 |

### MCP 字段核验

- `DRU_OUTP_AUTO_ACCEPT_POOL`：已核验 `PRINT_STATUS`、`QUEUE_NO`、`PATIENT_ID`、`FRONT_WINDOW_NO`、`DEPT_CODE` 等（测试库 49 列）
- `DRUG_PRESCRIPTION_COLLECTION_RECORD`：测试库 MCP 返回 0 行（表可能未建或不在当前 schema）；字段以 `JianHuiDrugMachineDao.xml` 为准：`PATIENT_ID`、`CARD_NUMBER`、`PRINTING_TIME`、`PERSON_PRINTED`、`PRINT_SOURCE`、`QUEUE_NUMBER`

---

## 改造计划

### 目标行为（业务）

1. **自助机**：读卡/扫码 → 查已有接单池取窗口/排队号 → **不触发自动接单** → 打印前校验当日是否已打印 → 未打印则打 `SELF_TAKE_DRUG_VOUCHER` → 成功后记 1 次（来源=自助机）；**窗口/收费处已打印则自助机不再打印**。
2. **摆药窗口排号**：`OUTP_AUTO_ACCEPT_LAY_DRUG_QUEUE` 打印成功后记录次数（来源=诊间）；重打累计次数。
3. **门诊结算小票**：`OUTP_SETTLE_VOUCHER_ONLY_ONE` 打印成功后记录次数（来源=收费处）；通过 settle_no 关联 queue_no。

### 涉及子仓库

- [ ] `onelink-micro-charge-fj-common`：新增查询/校验接口；可选增强 `savePrintInformation` 前置校验
- [ ] `onelink-web-his-charge-fj-common`：`selfTakeDrug.vue`、`outpatientSettlement.vue`；API 扩展
- [ ] `onelink-web-his-drug-fj-common`：`outpPresQuery.vue`、`outpatientDispenseReset.vue`；新增 `Jianhuidrugmachine.js` API（或等价调用）

### 文件清单

| 仓库 | 路径 | 改动类型 |
|------|------|----------|
| onelink-micro-charge-fj-common | `.../automatic/JianHuiDrugMachineServiceImpl.java` | 新增 `querySelfTakeDrugVoucherInfo`；可选 `checkPrintedToday` |
| onelink-micro-charge-fj-common | `.../automatic/JianHuiDrugMachineController.java` | 暴露新查询接口 |
| onelink-micro-charge-fj-common | `.../automatic/JianHuiDrugMachineDao.java` + `JianHuiDrugMachineDao.xml` | 新增「当日是否已打印」查询 SQL；自助机 pool 查询（可复用/包装 `getAcceptData` 并加当天+科室过滤） |
| onelink-micro-charge-fj-common | `.../automatic/JianHuiDrugMachineService.java`（api 模块） | 接口声明 |
| onelink-web-his-charge-fj-common | `pages/charge/prePayManage/selfTakeDrug.vue` | 改调新查询接口；打印前校验；成功后 `savePrintInformation` |
| onelink-web-his-charge-fj-common | `pages/charge/costSettlementManage/outpatientSettlement.vue` | 结算小票打印成功后调用 `savePrintInformation` |
| onelink-web-his-charge-fj-common | `api/charge-service/automatic/Jianhuidrugmachine.js` | 新增 `querySelfTakeDrugVoucherInfo`（及可选 `checkPrintedToday`） |
| onelink-web-his-drug-fj-common | `pages/outpatientDispensManage/outpPresQuery.vue` | 排号打印成功后 `savePrintInformation` |
| onelink-web-his-drug-fj-common | `pages/outpatientDispensManage/outpatientDispenseReset.vue` | 重打排队号成功后 `savePrintInformation` |
| onelink-web-his-drug-fj-common | `api/charge-service/automatic/Jianhuidrugmachine.js` | **新增**（与 charge 仓同路径，供 drug 仓调用） |

### 数据库

| 表名 | 操作 | 说明 |
|------|------|------|
| `ZOEDRUG.DRUG_PRESCRIPTION_COLLECTION_RECORD` | INSERT（已有） | 打印次数唯一依据；`savePrintInformation` / `getPersonPrinted` |
| `ZOEDRUG.DRU_OUTP_AUTO_ACCEPT_POOL` | SELECT（已有） | 自助机只读查窗口/排队号；**不改** `THIRD_PRINT_COUNT` |
| 无 DDL | — | 不新建表、不改表结构 |

### 参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| （无新增） | — | — | 漳州二院专用改造，默认行为生效；若需兼容其他医院可后续加系统参数开关 |

### 后端接口设计（新增）

**`querySelfTakeDrugVoucherInfo`**（建议挂 `JianHuiDrugMachineController`）

- 入参：`cardId`（原始卡号/磁条）、`deptCode`（URL 传入科室，可选过滤）
- 逻辑：
  1. `commonUtilService.magneticCard(cardId)` 解析标准卡号
  2. 查 `DRU_OUTP_AUTO_ACCEPT_POOL`（包装 `getAcceptData`，**增加当天** + 科室过滤，取最新一条）
  3. 查 `DRUG_PRESCRIPTION_COLLECTION_RECORD`：`card_number + queue_number + 当天` 是否已有记录
- 出参：`patientId`、`cardId`、`windowNo`、`queueNo`、`deptName`、`deptCode`、`printedToday`（boolean）、`printable`（boolean，自助机=`!printedToday`）

**`savePrintInformation`**（已有，复用）

- 自助机：`printSource='1'`，传 `patientId`、`cardNumber`、`queueNumber`
- 摆药窗口：`printSource='2'`
- 收费结算：`printSource='3'`，传 `settleNos`（`queueNumber` 留空，走后端反查）

**可选：`countPrintedToday`** SQL

```sql
-- 仅查询，不递增
select count(1) from ZOEDRUG.DRUG_PRESCRIPTION_COLLECTION_RECORD t
 where t.card_number = #{cardNumber}
   and t.queue_number = #{queueNumber}
   and t.printing_time >= trunc(sysdate)
   and t.printing_time < trunc(sysdate) + 1
```

### 前端改造要点

#### 1. 自助机 `selfTakeDrug.vue`

- `checkInPatients()` 改为调 `Jianhuidrugmachine.querySelfTakeDrugVoucherInfo`（**不再**依赖 `Manager.magneticCardAnalyse` 返回 queueNo）
- `printedToday === true`：提示「取药凭证已在窗口/收费处打印，请勿重复打印」，关闭 loading，**不调用** `odtprinter.print`（预览仍可展示）
- 打印 `odtprinter.print` **成功**后：`savePrintInformation({ patientId, cardNumber: cardId, queueNumber: queueNo, printSource: '1' })`
- 打印失败：**不**记次数，允许用户再次尝试（直至成功记 1 次后阻断）

#### 2. 门诊结算 `outpatientSettlement.vue`

- 在 `postGetSettleVoucherDocumentApi` → `odtprinter.print` 成功分支（`printOutpSettleByOnlyOne` 路径）调用 `savePrintInformation`：
  - `settleNos`、`patientId`、`cardNumber`（当前患者卡号）、`printSource: '3'`
- 取消注释原 `// this.savePrintInformation(settleNos)` 并补全入参

#### 3. 摆药 `outpPresQuery.vue` / `outpatientDispenseReset.vue`

- `OUTP_AUTO_ACCEPT_LAY_DRUG_QUEUE` 打印成功后：
  - 从 `patientInfo` + 选中行 `queueNo`（或 SQL 票据返回数据）组装 `savePrintInformation`
  - `printSource: '2'`
- 重打仍调用 `savePrintInformation`（后端 `getPersonPrinted` 递增，>1 时删当天旧记录再插入 — **保持现有逻辑**）

### 数据流变更

```
【改造后 — 统一以 DRUG_PRESCRIPTION_COLLECTION_RECORD 为打印次数依据】

结算 OUTP_SETTLE_VOUCHER_ONLY_ONE
  → odtprinter.print 成功
  → savePrintInformation(settleNos, printSource=3)
  → getQueueNumberBySettleNos → 按 queue_no 写入 COLLECTION_RECORD

摆药排号 OUTP_AUTO_ACCEPT_LAY_DRUG_QUEUE
  → odtprinter.print 成功
  → savePrintInformation(cardNumber, queueNumber, printSource=2)

自助机 SELF_TAKE_DRUG_VOUCHER
  → querySelfTakeDrugVoucherInfo（只读 pool，不接单）
  → 若 printedToday → 提示并跳过打印
  → 否则 odtprinter.print 成功
  → savePrintInformation(printSource=1)

【DRU_OUTP_AUTO_ACCEPT_POOL.PRINT_STATUS】
  仍由配药/接单流程（acceptOrderEndCompletes 等）维护；本次不以其作为自助机拦截依据。
```

### 待确认问题 — 推荐假设（请逐项确认或修正）

| # | 问题 | **推荐假设（默认按此实现）** | 需您确认 |
|---|------|------------------------------|----------|
| 1 | 自助机不走自动接单 | **是**。不调用 `OutpAutoDrug.checkInPatients`；用新接口只读查 pool | ☐ |
| 2 | 结算小票是否纳入 | **是**。关联键：`settle_no` → `getQueueNumberBySettleNos` → `queue_number` | ☐ |
| 3 | print_source 取值 | **不扩展**：1=自助机，2=摆药窗口排号，3=收费处结算小票 | ☐ |
| 4 | 校验维度 | **沿用** `card_number + queue_number + 当天` | ☐ |
| 5 | THIRD_PRINT_COUNT | **不启用**；以 `DRUG_PRESCRIPTION_COLLECTION_RECORD` 为准 | ☐ |
| 6 | 重打 / 自助机次数 | 窗口&结算重打**累计**；自助机**仅允许成功打印 1 次/天/queue**；失败不计次、可重试至成功 | ☐ |
| 7 | 数据一致性 | **以 COLLECTION_RECORD 为唯一依据**；`PRINT_STATUS` 不参与自助机拦截 | ☐ |

**额外待确认（实现细节）：**

| # | 问题 | 推荐假设 |
|---|------|----------|
| 8 | 自助机 pool 查询范围 | 过滤 URL `deptCode` + **当天**接单数据；多条取 `OPERATED_TIME` 最新 |
| 9 | 无 pool 数据时 | 提示「暂无取药排队信息，请先至窗口/收费处办理」，不打印 |
| 10 | 已打印仍展示预览 | **是**（保持现有预览体验，仅跳过物理打印） |

### 测试要点（Step 11 前置）

1. 窗口排号打印 → 查 `DRUG_PRESCRIPTION_COLLECTION_RECORD` 有记录 `print_source=2`
2. 同一患者同日自助机读卡 → 提示已打印、不再出纸
3. 仅结算小票打印（未窗口排号）→ `settleNos` 反查 queue 记 `print_source=3` → 自助机 blocked
4. 自助机首次成功打印 → `print_source=1`；再次 blocked
5. 摆药重打 → `person_printed` 递增（或删旧插新，与现逻辑一致）

### 人工审核意见（选填）

（留空）

---

## 外部编辑器交接

【来自 Trae/CodeBuddy 初步分析 — 请在 Cursor 从 Step 5 继续】

【禅道&项目】205272【漳州二院】

【短期记忆文件】`docs/memory/short-term/205272-self-take-drug-print-count.md`

【代码地图摘要】见上文「代码地图」表格。

【调用关系】见上文调用关系箭头图。

【记忆库命中】
- [本地] `docs/memory/cases/202510-自助机取药凭证预览放大+selfTakeDrug-preview-remark.md` — 禅道#202510 — 自助取药页面 `selfTakeDrug.vue` 票据预览/打印模板结论。
- [在线] IMA 知识库默认 ID 获取失败，未检索到有效笔记。

【待确认（请 Cursor spec 前澄清或标注假设）】
1. 自助机不走自动接单流程是否只需保持现状（不调用 `OutpAutoDrug.checkInPatients`）？
2. 门诊结算小票是否纳入打印次数记录，关联键用 settle_no 还是 card_number？
3. `print_source` 取值是否需要扩展或调整？
4. 打印次数校验维度是否沿用 `card_number + queue_number + 当天`？
5. 是否启用 `DRU_OUTP_AUTO_ACCEPT_POOL.THIRD_PRINT_COUNT`？
6. 重打是否累计次数？自助机是否严格只打一次（含失败）？
7. 是否统一以 `DRUG_PRESCRIPTION_COLLECTION_RECORD` 为打印次数唯一依据？

【建议复杂度】Complex（跨前端 2 个仓库 + 后端 1 个仓库，涉及打印、接单池、结算、自助机公共方法多个域）。

【下一步】请在 Cursor 完善 spec（Step 5），等我确认后实现。

---

## MCP 字段核验

- 外部分析未调用 MCP；涉及表及字段已从上文读取的 Dao.xml / 实体类中确认：
  - `ZOEDRUG.DRU_OUTP_AUTO_ACCEPT_POOL`：`PRINT_STATUS`、`LABLE_PRINT_STATUS`、`THIRD_PRINT_COUNT`、`QUEUE_NO`、`PATIENT_ID`、`CARD_ID`、`FRONT_WINDOW_NO`、`DEPT_CODE`。
  - `ZOEDRUG.DRUG_PRESCRIPTION_COLLECTION_RECORD`：`PATIENT_ID`、`CARD_NUMBER`、`PRINTING_TIME`、`PERSON_PRINTED`、`PRINT_SOURCE`、`QUEUE_NUMBER`。
- 待 Cursor Step 4 通过 MCP `get_table_schema` 再次核验实际列名（尤其是 `DRUG_PRESCRIPTION_COLLECTION_RECORD` 是否在各客户库一致）。

---

## 人工审核意见（选填）

> Step 9 人工审查时由用户填写；有内容时 Step 6 须纳入改造范围。

（留空）
