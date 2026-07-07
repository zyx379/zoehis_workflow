# [205367] 短期记忆 — 结算清单批量上传改为只提交勾选数据

> **Agent 会话标题（中文）**：结算清单批量上传改为只提交勾选数据
> **日期**：2026-07-02
> **状态**：`implementing`（Step 6 已实现，待 Step 9 人工审查）
> **短期记忆**：需求进行中临时文件；Step 12 沉淀长期 case 后 **删除本文件**。

---

## 需求摘要

- **任务类型**：功能修改
- **禅道 / 项目**：205367 / 漳州二院
- **页面 / 菜单**：结算清单信息上传管理（`/insurance/healthMaintainManage/settlementRecordManage`）
- **需求描述**：
  1. 门诊/住院结算清单信息**批量上传**目前会把整个界面的数据进行提交，需要改成勾选几个就提交几个。
  2. 排查**批量撤销**、**批量归档**是否也存在同样问题。

---

## 代码地图（Step 4 产出）

| 仓库 | 路径 | 角色（页面/API/Service/SQL） | 置信度 |
|------|------|------------------------------|--------|
| onelink-web-his-charge-fj-common | `pages/insurance/healthMaintainManage/settlementRecordManage.vue` | 结算清单信息上传管理页面（含批量上传/撤销/归档） | 高 |
| onelink-web-his-charge-fj-common | `api/insurance-service/insur/InsurManager.js` | 前端调用医保服务 API（已被页面引用） | 高 |
| onelink-micro-insurance-fj-ybcommon | `service/service/nationalInsurance/fuzhou/FuZhouNationalInsurancePublicService.java` | 福州医保公共服务（漳州二院使用，后端无需改动） | 高 |

### 调用关系

```
settlementRecordManage.vue
  ├── upLoadBatch() ──→ 错误：重新查询全部列表并上传
  ├── archiveBatch() ──→ 错误：全选时重新查询全部列表并归档
  ├── revokeBatch() ──→ 正确：使用 getSelectArr(false) 获取勾选数据
  └── settlementHisReq / settlementRevokeReq ──→ InsurManager.js
        → 后端医保服务（单条轮询）
```

---

## 需求分析要点

### 业务域
医保 / 结算清单上传管理 / 前端批量操作选择范围修正。

### 参数体系
无新增/修改参数需求。

### 数据流
- 前端表格勾选数据（`selectArr` / `getSelectArr(false)`）→ 轮询上传/撤销/归档 → 成功一条移除一条 → 全部完成后刷新列表。
- 不涉及池表、主细表、预交金、流水变更。

### 记忆库命中（全部）
- [本地] `docs/memory/short-term/205366-insur-settlement-stas-type.md` — 禅道#205366 — **同一页面**的 `stas_type` 取值问题；可复用结论：结算清单上传管理页面当前在漳州二院有多个改造点，改动集中在前端 `settlementRecordManage.vue` 与后端福州医保服务类。
- [在线] 无直接匹配笔记。

### MCP 字段核验
不涉及表/SQL 字段，无需 MCP 核验。

---

## 问题点定位

### 1. 批量上传 `upLoadBatch()`（存在问题）
**当前代码（约第 648–676 行）**：
```javascript
upLoadBatch() {
  this.upLoadData = [];
  const params = { ... };
  this.$api.InsurManager.getSettlementRecordManageList(params).then(data => {
    const checkItem = data.rows;
    checkItem.forEach((item) => {
      if ($.zoe.isNullOrEmpty(item.status) || item.status == "0" || item.status == "2") {
        this.upLoadData.push(item);
      }
    })
    // ...
  });
}
```
**问题**：完全没有读取表格勾选状态，而是重新按当前查询条件拉取 **pageSize=5000** 的全部数据，并上传所有 `status == 0 || status == 2` 的记录。

### 2. 批量归档 `archiveBatch(filterStatusFlag = true)`（存在问题）
**当前代码（约第 706–742 行）**：
```javascript
async archiveBatch(filterStatusFlag = true) {
  this.revokeData = [];
  const allSelected = this.mainTableData.length === this.$refs.mainTable.getSelectArr(false).length;
  let checkItemList = allSelected ? [] : this.$refs.mainTable.getSelectArr(false);
  if (allSelected || !filterStatusFlag) {
    const params = { ... };
    const list = await this.$api.InsurManager.getSettlementRecordManageList(params, {})
    checkItemList = list.rows
  }
  checkItemList.forEach((item) => {
    if (item.status == "1") {
      this.revokeData.push(item);
    }
  })
  // ...
}
```
**问题**：当用户点击表头全选（`allSelected == true`）或从上传成功后的自动归档入口进入（`filterStatusFlag == false`）时，会重新查询全部数据并归档所有 `status == 1` 的记录，而不是只归档用户勾选的数据。

### 3. 批量撤销 `revokeBatch()`（已正确使用勾选数据）
**当前代码（约第 762–773 行）**：
```javascript
revokeBatch() {
  this.revokeData = [];
  const checkItem = this.$refs.mainTable.getSelectArr(false)
  checkItem.forEach((item) => {
    if (item.status == "1" || item.status == "2") {
      this.revokeData.push(item);
    }
  })
  // ...
}
```
**结论**：批量撤销**不存在**该问题，已按勾选数据执行。

### 4. 其他批量操作排查

| 方法 | 数据来源 | 是否存在问题 | 说明 |
|------|----------|--------------|------|
| `upLoad()` 单条上传 | `getData()` 过滤 `checkboxFlag` | 否 | 只取勾选的第一条 |
| `archive()` 单条归档 | `getData()` 过滤 `checkboxFlag` | 否 | 只取勾选的第一条 |
| `revoke()` 单条撤销 | `getSelectArr(false)` | 否 | 只取勾选的第一条 |
| `revokeBatch()` 批量撤销 | `getSelectArr(false)` | 否 | 已正确 |
| `syncPlatformBatch()` 批量同步平台 | `getSelectArr(false)` | 否 | 已正确 |
| `printBatch()` 批量打印 | `getSelectArr(false)` | 否 | 已正确 |
| `downloadCompare()` 批量下载对比 | `getData()` 过滤 `checkboxFlag` | 否 | 等价于勾选数据 |
| `updateUnLoad()` 批量修改为未上传 | `getData()` 过滤 `checkboxFlag` | 否 | 等价于勾选数据 |

---

## 待确认问题

1. **批量上传的状态过滤是否保留？**
   - 当前逻辑会过滤 `status == 0 || status == 2` 的记录进行上传。
   - 改成勾选后，是否仍然只上传勾选记录中 `status == 0 || status == 2` 的数据？还是勾选什么就上传什么？
   - **建议**：保留状态过滤，避免重复上传已上传/已归档数据。
  保留状态过滤
2. **批量归档的状态过滤是否保留？**
   - 当前逻辑只归档 `status == 1`（已上传）的记录。
   - 改成勾选后，是否仍然只归档勾选记录中 `status == 1` 的数据？
   - **建议**：保留状态过滤，避免对未上传数据调用归档接口。
保留状态过滤
3. **自动归档入口是否需要同步修正？**
   - `settlementHisBatch` 上传成功后，若 `uploadAfterArchiveFlag` 为 true，会调用 `archiveBatch(false)`。
   - 此时 `filterStatusFlag == false`，当前代码会重新查询全部已上传数据并归档；这是否也需要改成只归档本次上传成功的数据？
   - **建议**：自动归档应只归档本次 `upLoadData` 中上传成功的记录，而不是全部。
自动归档应只归档本次
4. **分页场景下的勾选：**
   - 表格有分页，用户可能只勾选了当前页的部分行。`getSelectArr(false)` 只能获取当前页的勾选数据，这是否符合需求？
   - **建议**：符合"勾选几个就提交几个"的直观理解；若需跨页全选，应作为单独需求。
没有勾选保留原逻辑全选，如果有勾选则取选择数据
---

## Spec（Step 5 草稿，待 Cursor 确认/细化）

### 改造计划（初步）

本次为**单文件前端改动**（Trivial / Standard），可跳过 Step 5 详细 spec。

**涉及子仓库**
- [x] onelink-web-his-charge-fj-common：修改 `settlementRecordManage.vue` 中 `upLoadBatch`、`archiveBatch` 的数据来源。

**文件清单**

| 仓库 | 路径 | 改动类型 |
|------|------|----------|
| onelink-web-his-charge-fj-common | `pages/insurance/healthMaintainManage/settlementRecordManage.vue` | 修改 `upLoadBatch`、`archiveBatch` |

**数据库**
无。

**参数**
无。

**数据流变更**
```text
修改前：
用户点击批量上传/批量归档
  → 重新查询 pageSize=5000 全部数据
  → 过滤状态后全部上传/归档

修改后：
用户点击批量上传/批量归档
  → getSelectArr(false) 获取当前页勾选数据
  → 过滤状态后仅上传/归档勾选记录
```

**实现要点（待 Cursor 实现）**

#### 1. `upLoadBatch()` 改造
```javascript
upLoadBatch() {
  this.upLoadData = [];
  const checkItem = this.$refs.mainTable.getSelectArr(false);
  checkItem.forEach((item) => {
    if ($.zoe.isNullOrEmpty(item.status) || item.status == "0" || item.status == "2") {
      this.upLoadData.push(item);
    }
  });
  if (this.upLoadData.length > 0) {
    this.upLoadData = JSON.parse(JSON.stringify(this.upLoadData));
    this.settlementHisReq(false);
  } else {
    this.$messageBox.warn(this.$tc('common.nullTip2', 1, '当前没有数据'));
  }
}
```

#### 2. `archiveBatch(filterStatusFlag = true)` 改造
```javascript
async archiveBatch(filterStatusFlag = true) {
  this.revokeData = [];
  const checkItemList = this.$refs.mainTable.getSelectArr(false);
  checkItemList.forEach((item) => {
    if (item.status == "1") {
      this.revokeData.push(item);
    }
  });
  if (this.revokeData.length > 0) {
    this.revokeData = JSON.parse(JSON.stringify(this.revokeData));
    this.settlementRevokeReq(false, "1");
  }
}
```

#### 3. 自动归档入口（可选，建议同步修改）
在 `settlementHisBatch` 中，上传成功后调用 `archiveBatch(false)` 时，当前 `upLoadData` 已经轮询完成（为空）。若需自动归档本次上传的记录，需要在轮询开始前保留本次上传的列表副本，或在每条上传成功后立即归档。

**建议方案**：在 `upLoadBatch` / `upLoad` 调用前备份 `uploadSelectedData`，上传成功轮询结束后，用备份列表触发自动归档。

**待确认问题（请 Cursor Step 5 前澄清）**
1. 批量上传/归档是否保留 `status` 过滤？（建议保留）
2. 上传成功后的自动归档是否也需要改成只归档本次上传的记录？
3. 是否允许跨页勾选后批量操作？（当前 `getSelectArr(false)` 仅当前页）

---

## 外部编辑器交接

【来自 Trae/CodeBuddy 初步分析 — 请在 Cursor 从 Step 5 继续】

【禅道&项目】
205367【漳州二院】

【短期记忆文件】
docs/memory/short-term/205367-settlement-batch-select.md

【代码地图摘要】
| 仓库 | 路径 | 角色 | 置信度 |
| onelink-web-his-charge-fj-common | pages/insurance/healthMaintainManage/settlementRecordManage.vue | 结算清单上传管理页面 | 高 |
| onelink-web-his-charge-fj-common | api/insurance-service/insur/InsurManager.js | 医保服务前端 API | 高 |
| onelink-micro-insurance-fj-ybcommon | service/service/nationalInsurance/fuzhou/FuZhouNationalInsurancePublicService.java | 福州医保公共服务（后端无需改动） | 高 |

【调用关系】
```
settlementRecordManage.vue
  ├── upLoadBatch() ──→ 重新查询全部列表上传（需改）
  ├── archiveBatch() ──→ 全选时重新查询全部列表归档（需改）
  ├── revokeBatch() ──→ 已正确使用 getSelectArr(false)
  └── settlementHisReq / settlementRevokeReq ──→ InsurManager.js → 后端医保服务
```

【记忆库命中】
- [本地] `docs/memory/short-term/205366-insur-settlement-stas-type.md` — 禅道#205366 — 同一页面的 stas_type 取值问题。
- [在线] 无直接匹配笔记。

【待确认（请 Cursor spec 前澄清或标注假设）】
1. 批量上传/归档是否保留 `status` 状态过滤？
2. 上传成功后的自动归档是否也需要改成只归档本次上传的记录？
3. 是否允许跨页勾选后批量操作？

【建议复杂度】Trivial / Standard（单文件前端改动）

【下一步】
请在 Cursor 确认上述问题后，直接实现 Step 6（最小前端改动）。

---

## 人工审核意见（选填）

> Step 9 人工审查时由用户填写；有内容时 Step 6 须纳入改造范围。

（留空）
