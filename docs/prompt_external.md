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

【约束】
- 只输出初步分析，最终 spec 与实现在 Cursor 完成
- 遵守 .cursor/rules/zoehis-*.mdc（Read 仓库内文件，不要猜测表名/接口）
- Step 4 按 .cursor/skills/zoehis-code-map/SKILL.md 产出代码地图
- 检索 docs/memory/index.md 找类似 case
- 分析结果写入 docs/memory/short-term/{禅道号}-{slug}.md
```

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
3. **记忆库命中**（index/cases 链接与一句可复用结论）
4. **待确认问题**（业务不清、低置信度路径）
5. 写入 `docs/memory/short-term/{禅道号}-{slug}.md`

**禁止**：编造表名、SQL 列名、接口 URL；存疑时标「待 MCP get_table_schema」留给 Cursor。

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
