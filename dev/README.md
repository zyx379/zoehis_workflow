# dev — AI 编辑器配置源目录（Rule / Skill / MCP）

> **单一事实来源**：本目录为 fj-common 工作区 **Rule、Skill、MCP** 的 Git 跟踪源。  
> 各编辑器通过 **联接 / 引用路径 / MCP 注册** 挂载，**禁止**在多处维护副本。

---

## 0. 初始化 dev 环境（一条指令触发）

> 在任何编辑器对 AI 说「初始化 dev 环境」时，AI 按本节能自动完成三步：
> **一、同步 GitLab 仓库 → 二、挂载 AI 开发环境 → 三、注册 zoe-his-mcp 并验证**。
> 原则：单一事实来源是 `dev/`，**不复制 Rule/Skill 全文**到编辑器配置仓；不提交 `.env` / `node_modules` / `.cursor/mcp.json`；不改业务子仓库 `onelink-*`。

### 直接复制给 AI 的指令

```text
初始化 dev 环境（工作区根目录：D:\zoe_work_space\fj-common）：

一、同步 GitLab 仓库
- 配置仓（fj-common 根目录 git）：git pull origin master
- 业务子仓库（9 个 onelink-*，各自 GitLab）：对每个子仓库执行 git checkout master && git pull origin master

二、挂载 AI 开发环境（源目录均为 dev/，不要复制 Rule/Skill 全文到编辑器配置仓）
1. Read dev/README.md、docs/workflow.md、AGENTS.md
2. 按编辑器类型执行：
   - Cursor：运行 .\scripts\link-cursor-dev.ps1；确认 .cursor/rules、.cursor/skills 为联接且指向 dev/；确认 .cursor/mcp.json 含 zoe-his-mcp（入口 dev/mcp/zoe-his-mcp/dist/index.js）
   - Trae/CodeBuddy/Mimo：在对话中约定 Read dev/rules/zoehis-*.mdc 与 dev/skills/*/SKILL.md；功能开发交接给 Cursor
3. MCP：检查 dev/mcp/zoe-his-mcp/.env 是否存在；缺失则从 .env.example 说明需人工填写的项（GITLAB_TOKEN、ZOE_*_API_BASE_URL、ZOE_DB_* 等）；node_modules 缺失则 npm ci
4. 校验：能 Read dev/rules/zoehis-naming.mdc、dev/skills/zoehis-ai-dev/SKILL.md、docs/memory/index.md
5. 汇报挂载结果表（Rule / Skill / MCP 是否可达），不要改业务子仓库 onelink-*

三、注册 zoe-his-mcp 并验证
- 服务目录：D:\zoe_work_space\fj-common\dev\mcp\zoe-his-mcp
- 入口：dist/index.js，Node 建议 v20（见 dev/mcp/mcp.json.example）
- 复制并填写 .env（不提交 Git）：从 .env.example 生成 dev/mcp/zoe-his-mcp/.env，由人工补密钥
- Cursor 合并到 .cursor/mcp.json；其他编辑器按各自 MCP 配置格式填写
- 注册后用 get_table_schema 测一张表（如 DIC_DRUG_DICT）验证

【约束】单一事实来源：只改 dev/ 下源文件；勿提交 .env、node_modules、.cursor/mcp.json；业务流程不清列待确认点，禁止编造表名/接口。
```

### 各阶段细则

**一、同步 GitLab 仓库** — 见 [docs/multi-device-sync.md](../docs/multi-device-sync.md)
- 配置仓：根目录 `git pull origin master` + `.\scripts\link-cursor-dev.ps1`
- 业务子仓库（9 个 `onelink-*`）：分别 `cd <子仓库> && git checkout master && git pull origin master`

**二、挂载 AI 开发环境** — 详见 [§4 各编辑器如何挂载](#4-各编辑器如何挂载)。

**三、注册 zoe-his-mcp** — 见 [dev/mcp/README.md](mcp/README.md)。要点：

| 步骤 | 命令 / 操作 |
|------|------|
| 生成 .env | `copy dev\mcp\zoe-his-mcp\.env.example dev\mcp\zoe-his-mcp\.env`（人工补密钥，不提交） |
| 安装依赖 | `cd dev\mcp\zoe-his-mcp && npm ci` |
| Cursor 注册 | 合并 `dev/mcp/mcp.json.example` 到 `.cursor/mcp.json`（路径绝对化，Node v20） |
| 其他编辑器 | 按各自 MCP 格式填写（command 指向 `node` / `绝对路径/node.exe`，args 为 `dist/index.js` 绝对路径） |
| 验证 | 调 `get_table_schema('DIC_DRUG_DICT')`，能返回列名即注册成功 |

### 挂载结果表（汇报模板）

| 项 | 是否可达 | 说明 |
|----|----------|------|
| Rule（`dev/rules/zoehis-*.mdc`） | ✅ / ❌ | 联接指向 dev/ 或可直接 Read |
| Skill（`dev/skills/*/SKILL.md`） | ✅ / ❌ | 联接指向 dev/ 或可直接 Read |
| MCP（zoe-his-mcp） | ✅ / ❌ | `get_table_schema` 验证结果 |
| memory（`docs/memory/index.md`） | ✅ / ❌ | 校验 Read 成功 |

---

## 1. 目录结构

| 路径 | 内容 | 提交 Git |
|------|------|----------|
| `dev/rules/*.mdc` | 项目 Rule（命名、业务、Git、审查、测试造数等） | ✅ |
| `dev/skills/*/SKILL.md` | 项目 Skill（含 `zoehis-ai-dev`、`his-log-diagnosis` 等） | ✅ |
| `dev/mcp/zoe-his-mcp/` | HIS MCP 服务（日志、查表、测试库 SQL） | ✅（无 `.env`、`node_modules`） |
| `dev/mcp/mcp.json.example` | MCP 注册模板（Cursor / 兼容 JSON 的编辑器） | ✅ |
| `dev/mcp/README.md` | MCP 专项说明（`.env`、工具列表） | ✅ |

### Skill 目录

| Skill | 路径 | 何时 Read / 触发 |
|-------|------|------------------|
| **zoehis-ai-dev** | `dev/skills/zoehis-ai-dev/SKILL.md` | **编排入口**：全栈需求 Step 0–12，自动委派领域 Skill |
| **zoehis-code-map** | `dev/skills/zoehis-code-map/SKILL.md` | **Step 4** 需求分析、代码地图 + 记忆库检索 |
| **zoehis-external-analysis** | `dev/skills/zoehis-external-analysis/SKILL.md` | Trae / CodeBuddy **仅 Step 0–4**，输出 Cursor 交接块 |
| **zoehis-frontend** | `dev/skills/zoehis-frontend/SKILL.md` | 改 Vue 页面、组件、API 层、样式 |
| **zoehis-backend** | `dev/skills/zoehis-backend/SKILL.md` | 改 Controller / Service / DAO / Dao.xml |
| **zoehis-business** | `dev/skills/zoehis-business/SKILL.md` | 池表、主细表、预交金、门诊/住院对称等业务流 |
| **zoehis-git-ops** | `dev/skills/zoehis-git-ops/SKILL.md` | **Step 10** Git 提交、merge release、打 tag |
| **his-log-diagnosis** | `dev/skills/his-log-diagnosis/SKILL.md` | **生产排查**（traceId、日志/SQL 链路）；验证前不改代码 |
| **zoehis-daily-report** | `dev/skills/zoehis-daily-report/SKILL.md` | 生成当日工作日报（多仓 Git commit 汇总） |

> **禁止**按禅道号在 `dev/skills/` 下建临时 Skill（见 Rule `zoehis-no-ticket-skill`）。需求进行中只写 `docs/memory/short-term/`。

关联文档（不在 `dev/`，但配置时需 Read）：

| 路径 | 用途 |
|------|------|
| `docs/workflow.md` | **每次需求**完整工作流（Cursor 主战场） |
| `docs/prompt_external.md` | Trae / CodeBuddy **Step 0–4** 开场模板 |
| `docs/multi-editor-cursor-collab.md` | 多编辑器分工与交接 |
| `AGENTS.md` | 工作区 Agent 总入口 |

---

## 2. `.cursor` 要不要清掉？

| `.cursor` 下 | 能否删除 | 说明 |
|--------------|----------|------|
| `rules/`、`skills/` | **不能删** | 是指向 `dev/` 的**目录联接**，Cursor 靠此加载；删了要重新跑 `link-cursor-dev.ps1` |
| `mcp.json` | 保留本机 | 本地 MCP 注册，从 `dev/mcp/mcp.json.example` 生成，**不提交 Git** |
| `mcp.json.example` | 已移除 | 模板只在 `dev/mcp/mcp.json.example` |
| 曾在 `.cursor` 里的 Rule/Skill **实体文件** | 已迁走 | 现在 `dev/` 是唯一源；`.cursor` 里看到的即 `dev/` 内容（联接） |

旧机上的 `D:\code\ZoeDevOps_space\zoe-his-mcp` 确认新路径可用后可**手动删除**（迁移时已复制到 `dev/mcp/zoe-his-mcp/`）。

---

## 3. 初始化命令速查（手动 / 脚本版）

> AI 驱动的一键流程见 [§0 初始化 dev 环境](#0-初始化-dev-环境一条指令触发)。本段是等价的手动命令，适合直接在终端执行或排查时使用。

```powershell
cd D:\zoe_work_space\fj-common   # 工作区根目录，与 onelink-* 并列

# 1) Cursor：创建 rules/skills 联接 + 生成 mcp.json（若不存在）
.\scripts\link-cursor-dev.ps1

# 2) MCP 密钥（从旧机拷贝，勿提交 Git）
copy dev\mcp\zoe-his-mcp\.env.example dev\mcp\zoe-his-mcp\.env
# 编辑 .env：GITLAB_TOKEN、ZOE_*_API_BASE_URL、ZOE_DB_* 等

# 3) MCP 依赖（若 node_modules 缺失）
cd dev\mcp\zoe-his-mcp
npm ci
cd ..\..\..

# 4) Cursor：Settings → MCP 启用 zoe-his-mcp、ima-knowledge；改 env 后重启 MCP
```

---

## 4. 各编辑器如何挂载

**原则：只引用 `dev/` 路径，不把 Rule/Skill 全文复制进编辑器配置仓。**

| 编辑器 | Rule | Skill | MCP | 典型场景 |
|--------|------|-------|-----|----------|
| **Cursor** | `.cursor/rules` → `dev/rules`（联接，自动 alwaysApply） | `.cursor/skills` → `dev/skills` | `.cursor/mcp.json` ← `dev/mcp/mcp.json.example` | 实现、审查、Git、造数、沉淀 |
| **Cursor（生产排查）** | Read `dev/rules/zoehis-*.mdc` | Read **`dev/skills/his-log-diagnosis/SKILL.md`** | `zoe-his-mcp` / `zoe-his-linx-mcp` | traceId、日志链路 |
| **Trae** | Read `dev/rules/zoehis-*.mdc` 或联接 `.trae/rules` → `dev/rules` | Read `dev/skills/.../SKILL.md` | 在 Trae MCP 设置中注册，路径同 `dev/mcp/` | Step 0–4 初步分析 |
| **CodeBuddy** | Read `dev/rules/` | Read `dev/skills/` 或 `.codebuddy/skills/` | 同 Cursor JSON 结构，改绝对路径 | 企业内网、并行分析 |
| **Mimo**（及其他） | 系统提示中列出 `dev/rules/*.mdc` 让 Agent Read | 按需 Read `dev/skills/zoehis-code-map/SKILL.md` 等 | 若支持 MCP：注册 `dev/mcp/zoe-his-mcp/dist/index.js` | 轻量分析 / 辅助 |

**Trae / CodeBuddy 可选联接（与 Cursor 一致）：**

```powershell
# 在 fj-common 根目录（需先存在 dev/rules）
New-Item -ItemType Junction -Path ".trae\rules" -Target "$PWD\dev\rules" -Force
New-Item -ItemType Junction -Path ".codebuddy\skills\zoehis-ai-dev" -Target "$PWD\dev\skills\zoehis-ai-dev" -Force
```

内网穿透场景（福鼎、漳州二院等）：`linx/mcp/` 的 `ZOE_HIS_MCP_HOME` 指向  
`D:\zoe_work_space\fj-common\dev\mcp\zoe-his-mcp`。

---

## 5. 初始化指令汇总（指向 §0）

> 完整「初始化 dev 环境」指令（同步仓库 + 挂载 + 注册 MCP 并验证）已统一到 **[§0 初始化 dev 环境](#0-初始化-dev-环境一条指令触发)**，直接复制该段给任意编辑器 AI 即可，避免与 §0 分叉维护。


---

## 6. 按场景选用 Prompt（简版）

### 生产排查（traceId / 日志）

```text
请按 dev/skills/his-log-diagnosis/SKILL.md 与 docs/workflow.md 分支 A 执行。
MCP：zoe-his-mcp（dev/mcp/zoe-his-mcp/）；内网穿透用 zoe-his-linx-mcp（linx/mcp/）。
验证前不改代码；根因明确为代码缺陷时再输出改造 prompt。

【连接方式】直连 / 内网穿透
【项目】[医院/ ZOE_PROJECT_CODE]
【traceId】…
```

### Cursor — 全栈需求（主流程）

```text
请严格按 docs/workflow.md 执行，逐步汇报进度清单。
遵守 dev/rules/zoehis-*.mdc；编排 Skill zoehis-ai-dev；Step 4 用 dev/skills/zoehis-code-map/SKILL.md。
MCP：zoe-his-mcp（dev/mcp/zoe-his-mcp/），测试库造数见 dev/rules/zoehis-test-data.mdc。

【任务类型】功能改造 / Bug 修复
【需求描述】…
【禅道&项目】[禅道号]【项目名称】
```

### Trae / CodeBuddy / Mimo — 外部分析（Step 0–4）

```text
请按 docs/prompt_external.md 与 docs/workflow.md Step 0–4 执行。
禁止改代码、禁止 git pull/commit/push。
遵守 dev/rules/zoehis-*.mdc（Read 仓库内文件）；Step 4 按 dev/skills/zoehis-code-map/SKILL.md 产出代码地图。
分析写入 docs/memory/short-term/{禅道号}-{功能描述}+{关键索引}.md，结束时输出 Cursor 交接块。
```

### 仅挂载 MCP（任意编辑器）

```text
帮我在本机注册 zoe-his-mcp：
- 服务目录：{工作区}/dev/mcp/zoe-his-mcp
- 入口：dist/index.js，Node 建议 v20（见 dev/mcp/mcp.json.example）
- 复制并填写 .env（不提交 Git）
- Cursor 合并到 .cursor/mcp.json；其他编辑器按各自 MCP 配置格式填写
注册完成后用 get_table_schema 测一张表（如 DIC_DRUG_DICT）验证。
```

---

## 7. 编辑约定

| 操作 | 正确做法 |
|------|----------|
| 改 Rule | 编辑 `dev/rules/*.mdc` |
| 改 Skill | 编辑 `dev/skills/*/SKILL.md` 及子文档 |
| 改 MCP 服务 / 模板 | 编辑 `dev/mcp/zoe-his-mcp/`、`dev/mcp/mcp.json.example` |
| Cursor 生效 | 改 `dev/` 后无需复制；联接自动反映 |
| 其他编辑器 | 始终 Read `dev/` 路径；有联接则优先联接 |
| 禁止 | 在 `.cursor/rules` 单独维护与 `dev/` 不一致的副本；提交 `.env` |

---

## 8. 相关脚本

| 脚本 | 作用 |
|------|------|
| `scripts/link-cursor-dev.ps1` | 创建 `.cursor/rules`、`skills` 联接；生成 `.cursor/mcp.json` |

MCP 细节见 [mcp/README.md](mcp/README.md)。
