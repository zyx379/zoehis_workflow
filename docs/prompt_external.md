# Trae / CodeBuddy 开场模板（Step 0–4 初步需求分析）

> **范围**：只做任务分流 → 需求理解 → 代码定位 → **需求分析（代码地图）**。  
> **不做**：Git pull、改代码、spec 最终确认、commit/push。  
> 完整流程与 Cursor 分工见 [multi-editor-cursor-collab.md](multi-editor-cursor-collab.md)。

---

## 复制给 Agent（Trae / CodeBuddy）

```text
请按 docs/prompt_external.md 与 docs/workflow.md 的 Step 0–4 执行，逐步汇报进度。
禁止改代码、禁止 git pull/commit/push。

【任务类型】功能改造 / Bug 修复
【需求描述】
（页面/菜单、期望行为、验收标准）

【已知线索】（可空）
- 页面/文件/接口：
- 截图或报错：

【禅道&项目】
[禅道号]【项目名称】

【记忆召回机制（本地/在线/全部）】
全部

【约束】
- 只输出初步分析，最终 spec 与实现在 Cursor 完成
- 遵守 .cursor/rules/zoehis-*.mdc（Read 仓库内文件，不要猜测表名/接口）
- Step 4 按 .cursor/skills/zoehis-code-map/SKILL.md 产出代码地图
- 按【记忆召回机制】选项检索记忆库（见下方说明）
- 分析结果写入 docs/memory/short-term/{禅道号}-{功能描述}+{关键索引}.md
```

**记忆召回机制说明：**
- **本地**：仅检索 `docs/memory/` 本地 case 文件
- **在线**：仅检索 IMA 知识库（MCP `ima-knowledge`；Skill `~/.cursor/skills/ima-knowledge/`）
- **全部**（默认）：本地 + IMA 知识库，按禅道号/关键词去重，标注来源 `[本地]` / `[在线]`

---

## 进度清单（外部分析 Agent 汇报）

```
外部分析进度:
- [ ] 0. 任务分流（功能 / Bug；生产排查请改 his-log-diagnosis，不走本模板）
- [ ] 1. 需求理解（业务域、参数体系、数据流、待确认点）
- [ ] 2. 代码定位（子仓库 + 候选文件清单）
- [ ] 4. 需求分析（代码地图 + 记忆库命中 + 待确认）
- [ ] 交接. 输出 Cursor 交接块
```

（Step 3 Git 同步、Step 5+ 由 Cursor 执行。）

---

## Step 4 输出要求

Read Skill：` .cursor/skills/zoehis-code-map/SKILL.md`

必须包含：

1. **代码地图表**（仓库、路径、角色、置信度）
2. **调用关系**（页面 → API → 后端 → 表）
3. **记忆库命中**（按【记忆召回机制】选项输出，格式见下方）
4. **待确认问题**（业务不清、低置信度路径）
5. 写入 `docs/memory/short-term/{禅道号}-{功能描述}+{关键索引}.md`（H1 中文标题；含末栏「人工审核意见（选填）」；Step 5 spec 同文件）
6. **表/SQL 字段**：外部分析不调 MCP；存疑时标「待 Cursor Step 4 MCP get_table_schema」

**禁止**：编造表名、SQL 列名、接口 URL。

### 记忆库命中输出格式（按召回机制选项）

**选项 = 本地：**
```markdown
### 记忆库命中（本地）
- [本地] docs/memory/cases/xxx.md — 禅道#XXXXX — 一句可复用结论
- [本地] docs/memory/cases/yyy.md — 禅道#YYYYY — 一句可复用结论
```

**选项 = 在线：**
```markdown
### 记忆库命中（在线）
- [在线] IMA note_id: XXXXX — 禅道#XXXXX — 一句可复用结论
- [在线] IMA note_id: YYYYY — 禅道#YYYYY — 一句可复用结论
```

**选项 = 全部（默认）：**
```markdown
### 记忆库命中（全部）
- [本地] docs/memory/cases/xxx.md — 禅道#XXXXX — 一句可复用结论
- [在线] IMA note_id: YYYYY — 禅道#YYYYY — 一句可复用结论
- [本地+在线] 禅道#ZZZZZ — 本地与在线均有，优先本地
```

---

## Cursor 交接块（分析结束时必须输出）

复制以下块，在 Cursor 新对话中粘贴（配合 workflow 开场模板）：

```text
【来自 Trae/CodeBuddy 初步分析 — 请在 Cursor 从 Step 5 继续】

【禅道&项目】
[禅道号]【项目名称】

【短期记忆文件】
docs/memory/short-term/xxx.md

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

## 与 Cursor 开场模板拼接示例

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

*外部分析 ≠ 最终方案；spec 确认与改码仅在 Cursor。*
