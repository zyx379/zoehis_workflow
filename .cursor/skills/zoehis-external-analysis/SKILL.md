---
name: zoehis-external-analysis
description: >
  ZOEHIS external analysis agent for Trae/CodeBuddy. Executes workflow Step 0–4 only
  (task routing, requirement understanding, code location, code map). Outputs Cursor
  handoff block. Use when user wants preliminary analysis before Cursor implementation,
  or mentions 外部分析, Step 0-4, 初步分析, 交接给Cursor.
---

# ZOEHIS 外部分析（Trae / CodeBuddy 专用）

> **范围**：只做任务分流 → 需求理解 → 代码定位 → **需求分析（代码地图）**。  
> **禁止**：改代码、git pull/commit/push、spec 最终确认。  
> 完整流程与 Cursor 分工见 [multi-editor-cursor-collab.md](../../../docs/multi-editor-cursor-collab.md)。

## 何时使用

- 用户在 Trae / CodeBuddy 中发起需求初步分析
- 用户明确要求「外部分析」「Step 0-4」「交接给 Cursor」
- 生产排查 **不走本 Skill**（改走 `his-log-diagnosis` + MCP）

## 工作流（逐步执行并汇报）

```
外部分析进度:
- [ ] 0. 任务分流（功能 / Bug；生产排查请改 his-log-diagnosis）
- [ ] 1. 需求理解（业务域、参数体系、数据流、待确认点）
- [ ] 2. 代码定位（子仓库 + 候选文件清单）
- [ ] 4. 需求分析（代码地图 + 记忆库命中 + 待确认）
- [ ] 交接. 输出 Cursor 交接块
```

> Step 3 Git 同步、Step 5+ 由 Cursor 执行。

---

## Step 0 — 任务分流

| 类型 | 走本 Skill？ | 说明 |
|------|-------------|------|
| **功能改造** | ✅ | 新需求、增强 |
| **Bug 修复** | ✅ | 先复现/定位根因 |
| **生产排查** | ❌ | 改走 `his-log-diagnosis` + MCP `user-zoe-his-mcp` |

有 **traceId** 且目的是查生产 → 不走本 Skill。

---

## Step 1 — 需求理解

**必须输出：**

1. 任务类型（功能 / Bug）
2. 业务域：门诊 / 住院 / 收费 / 药库 / 医保 / 组件
3. 参数体系识别（新增/修改开关时必填）：
   - 系统参数 `$getSysParamList`？页面参数 `$getPageControlMap(configId)`？
   - 若已有同页面参数，保持同一体系
   - 不确定时列待确认点
4. 预期数据流（涉及哪些表、池表→记录、预交金/流水）
5. **待确认点**（业务不清时必填；禁止编造表名、接口、流程）

**硬约束：** 信息不足时只列问题，不开始改代码。

---

## Step 2 — 代码定位

**定位手段（按优先级）：**

1. **长期记忆**：Read `docs/memory/index.md`，按页面/表/关键词找 cases
2. 用户线索：页面名、截图、接口名、文件路径
3. 路径约定：

| 层级 | 路径模式 |
|------|----------|
| 页面 | `pages/{camelCase}/`、`components/{同名}/` |
| API | `api/{kebab-service}/.../{PascalCase}.js` |
| 后端 | `Controller → Service → Dao → *Dao.xml` |

4. **定向 Grep**：小范围符号、路由、`baseUrl`、`dictName`

**必须输出：**

- 将改动的 **子仓库清单**
- 拟改动 **文件清单**（前/Api/Controller/Service/Dao.xml）
- 若跨仓：说明调用关系

### 子仓库对照

> **定位方法**：所有子仓库均位于工作区根目录 `{workspaceRoot}/` 下。
> **禁止**用 Glob `**/{repo-name}/**` 搜索子仓库（会返回空）。应直接 `LS {workspaceRoot}/{repo-name}/` 访问。

| 仓库 | 域 | 实际路径 |
|------|-----|----------|
| onelink-web-outp-fj-common | 门诊前端 | `{workspaceRoot}/onelink-web-outp-fj-common/` |
| onelink-web-pres-fj-common | 医嘱前端 | `{workspaceRoot}/onelink-web-pres-fj-common/` |
| onelink-web-his-charge-fj-common | 收费前端 | `{workspaceRoot}/onelink-web-his-charge-fj-common/` |
| onelink-web-his-drug-fj-common | 药库前端 | `{workspaceRoot}/onelink-web-his-drug-fj-common/` |
| onelink-web-his-fj-component | 公共组件 | `{workspaceRoot}/onelink-web-his-fj-component/` |
| onelink-web-cis-common | CIS 公共组件（npm 包） | `{workspaceRoot}/onelink-web-cis-common/` |
| onelink-micro-pres-fj-common | 医嘱后端 | `{workspaceRoot}/onelink-micro-pres-fj-common/` |
| onelink-micro-charge-fj-common | 收费服务 | `{workspaceRoot}/onelink-micro-charge-fj-common/` |
| onelink-micro-optimus-fj-common | 基础服务 | `{workspaceRoot}/onelink-micro-optimus-fj-common/` |
| onelink-micro-insurance-fj-ybcommon | 医保服务 | `{workspaceRoot}/onelink-micro-insurance-fj-ybcommon/` |

**不确定涉及哪个仓 → 列出待确认点。**

---

## Step 4 — 需求分析

在 Step 2 候选清单基础上，建立 **代码地图** 与业务上下文。

**操作：**

1. 检索 `docs/memory/index.md` 与相关 cases
2. 验证调用链（页面 → API → Controller → Service → Dao → 表）
3. 识别参数体系（系统参数 / 页面参数 / 无）与数据流
4. **表/SQL 字段**：涉及表名或拟改列且未从源码确认时，标「待 Cursor Step 4 MCP get_table_schema」；**禁止**猜测列名（由 Cursor 调 MCP 核验）
5. **复杂需求**：写入 `docs/memory/short-term/{禅道号}-{功能描述}+{关键索引}.md`（H1 用中文标题；含末栏「人工审核意见（选填）」；命名见 `zoehis-code-map` Skill）
6. **简单需求**：在回复中说明「Step 4 与 Step 2 合并，跳过短期记忆文件」

**必须输出：**

- 代码地图表（仓库、路径、角色、**置信度**）
- 记忆库命中（case 链接 + 可复用结论）
- 待确认问题（低置信度路径、业务不清点）

**禁止**：编造表名、SQL 列名、接口 URL；存疑时标「待 MCP get_table_schema」留给 Cursor。

---

## 输出格式模板

分析完成后，按以下格式输出：

```markdown
## 外部分析结果

### 进度清单
（勾选已完成的步骤）

### 需求理解
- 类型：功能 / Bug
- 业务域：...
- 参数体系：...
- 数据流：...
- 待确认：...

### 代码定位
- 子仓库：...
- 文件清单：...

### 代码地图
| 仓库 | 路径 | 角色 | 置信度 |
|------|------|------|--------|

### 调用关系
（页面 → API → 后端 → 表）

### 记忆库命中
- case 链接 + 结论

### 待确认
1. ...
```

---

## Cursor 交接块（分析结束时必须输出）

复制以下块，供用户在 Cursor 新对话中粘贴：

```text
【来自 Trae/CodeBuddy 初步分析 — 请在 Cursor 从 Step 5 继续】

【禅道&项目】
[禅道号]【项目名称】

【短期记忆文件】
docs/memory/short-term/{禅道号}-{功能描述}+{关键索引}.md（或说明已合并到 Step 2）

【代码地图摘要】
| 仓库 | 路径 | 角色 | 置信度 |
（粘贴表格）

【调用关系】
（一行或箭头图）

【记忆库命中】
- case 链接 + 结论

【待确认（请 Cursor spec 前澄清或标注假设）】
1. ...

【建议复杂度】Trivial / Standard / Complex

【下一步】
请在 Cursor 完善 spec（Step 5），等我确认后实现。
```

---

## 与 Cursor 开场模板拼接

用户在 Cursor 中粘贴交接块后，配合以下模板：

```text
请严格按 docs/workflow.md 执行，逐步汇报进度清单。

【任务类型】功能改造
【需求描述】
（同前）

【已知线索】
（同前 + 下方交接块）

--- Cursor 交接块 ---
（粘贴上一节输出）
--- end ---

【约束】
- 外部分析已完成 Step 0–4，从 Step 5 spec 开始
- 复杂需求先出 spec 等我确认再改代码
- 实现期不要 commit/push
```

---

## 硬约束

- **禁止**改代码、git pull/commit/push
- **禁止**编造表名、SQL 列名、接口 URL
- 遵守 `.cursor/rules/zoehis-*.mdc`（Read 仓库内文件，不要猜测）
- 存疑时标「待 MCP get_table_schema」留给 Cursor
- 分析结果写入 `docs/memory/short-term/{禅道号}-{功能描述}+{关键索引}.md`（复杂需求；Step 5 spec 同文件 `## Spec` 节）
- 最终 spec 确认与改码仅在 Cursor 完成
