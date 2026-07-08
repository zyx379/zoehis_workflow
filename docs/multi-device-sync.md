# 多设备同步：workflow / skill / rule / 记忆库

> 业务代码在 9 个子仓库；AI 配置在 **fj-common 根目录**。多设备要一致，需把根目录配置 **单独纳入 Git**（推荐）或 **独立配置仓**。

---

## 一、要同步什么、不同步什么

### 应提交到 GitHub（团队共享）

| 路径 | 内容 |
|------|------|
| `docs/workflow.md` | 最终版工作流 |
| `docs/ai-dev-setup-workflow.md` | 配置说明 |
| `docs/multi-device-sync.md` | 本文件 |
| `docs/memory/**` | 经验库（cases、index、archive、optimization-log） |
| `dev/rules/*.mdc` | 自动生效规则（**源文件**） |
| `dev/skills/**` | 项目 Skill（**源文件**） |
| `dev/mcp/zoe-his-mcp/` | HIS MCP 服务（**源目录**；`.env` 不提交） |
| `dev/mcp/mcp.json.example` | Cursor MCP 模板 |
| `scripts/link-cursor-dev.ps1` | clone 后创建 rules/skills 联接 + 生成 `.cursor/mcp.json` |
| `AGENTS.md` | 工作区 Agent 入口 |

### 不要提交（本机或私密）

| 路径 | 原因 |
|------|------|
| `onelink-*` | 各自已有 GitLab/Git，用原流程 pull |
| `.codegraph/` | 本地索引，可重建 |
| `.idea/` | IDE 个人配置 |
| `docs/prompt临时区` | 个人草稿（可选忽略） |
| API Key、MCP Token | 放 Cursor 用户设置或环境变量 |
| `~/.cursor/skills/his-log-diagnosis/` | 已迁入 **`dev/skills/his-log-diagnosis/`**，与配置仓同步 |

### 可选

| 路径 | 建议 |
|------|------|
| `.trae/` | 历史备份，可忽略或只读归档 |

---

## 二、推荐方案：根目录「配置仓」Meta Git（最简单）

在 `fj-common` 根目录 `git init`，用 `.gitignore` **排除** 9 个子仓库，只跟踪 AI 配置。

### 优点

- 与当前目录结构一致，Cursor 经 `.cursor/` 联接读 `dev/rules`、`dev/skills`
- 一台机器 `git pull` 即更新 workflow / rule / memory
- 与 9 个业务仓 **互不干扰**（子目录内仍各自 `git pull`）

### 首次在本机初始化（只需一次）

```powershell
cd d:\zoe_work_space\fj-common

git init
# 使用仓库根目录已提供的 .gitignore（排除 onelink-* 等）

git add AGENTS.md docs/ dev/ scripts/link-cursor-dev.ps1 .cursor/README.md
git status   # 确认没有出现 onelink-* 下的大量文件；勿提交 .cursor/rules、.cursor/skills（本地联接）

.\scripts\link-cursor-dev.ps1

git commit -m "[-]【通用】初始化 fj-common AI 配置仓（workflow/skill/rule/memory）"

# 在 GitHub/GitLab 新建空仓库，例如：zoehis_workflow
git remote add origin https://github.com/zyx379/zoehis_workflow.git
git branch -M master
git push -u origin master
```

### 第二台设备

```powershell
# 1. 照旧克隆/更新 9 个业务子仓库到同一父目录
# 2. 若整目录是从别处复制的，在 fj-common 根目录：
cd d:\zoe_work_space\fj-common
git clone https://github.com/zyx379/zoehis_workflow.git .
# 若目录非空，改为 clone 到临时目录再复制 .cursor、docs、AGENTS.md、.gitignore

git pull origin master
.\scripts\link-cursor-dev.ps1
```

之后每台机器日常：

```powershell
# 业务代码（各子仓库内）
cd onelink-web-his-charge-fj-common
git checkout master && git pull origin master

# AI 配置（fj-common 根目录）
cd d:\zoe_work_space\fj-common
git pull origin master
.\scripts\link-cursor-dev.ps1
```

---

## 三、备选方案：独立配置仓 + 手动/脚本同步

不想在 `fj-common` 根目录放 `.git` 时：

1. GitHub 仓库 `zoehis_workflow`，结构为：

   ```
   AGENTS.md
   dev/
   docs/
   scripts/link-cursor-dev.ps1
   scripts/link-cursor-dev.ps1
   .cursor/README.md
   ```

2. 每台机器用脚本拉取并覆盖到工作区根目录（PowerShell 示例）：

   ```powershell
   $cfgRepo = "$env:USERPROFILE\zoehis_workflow"
   $workspace = "d:\zoe_work_space\fj-common"
   git -C $cfgRepo pull
   Copy-Item -Recurse -Force "$cfgRepo\dev" "$workspace\dev"
   Copy-Item -Recurse -Force "$cfgRepo\docs" "$workspace\docs"
   Copy-Item -Force "$cfgRepo\AGENTS.md" "$workspace\AGENTS.md"
   Copy-Item -Force "$cfgRepo\scripts\link-cursor-dev.ps1" "$workspace\scripts\link-cursor-dev.ps1"
   & "$workspace\scripts\link-cursor-dev.ps1"
   ```

---

## 四、每台机器还要单独配置（不进 Git）

| 项 | 位置 | 说明 |
|----|------|------|
| Cursor MCP | `.cursor/mcp.json`（由 `dev/mcp/mcp.json.example` 生成） | `zoe-his-mcp`、`ima-knowledge`、`user-codegraph` |
| Codegraph 索引 | 工作区 `.codegraph/` | 每台 `codegraph init` 或自动重建 |
| DeepSeek / 其它 API Key | Cursor Models | 仅本机 UI |
| `his-log-diagnosis` | `dev/skills/his-log-diagnosis/` | 生产排查 Skill，随配置仓 pull |
| Maven / JDK 路径 | 本机环境 | 见 rule 中仅为参考 |

建议在团队文档或 `docs/mcp-setup-checklist.md` 中列 MCP 名称与必填环境变量名（**不写密钥值**）。

---

## 五、协作与冲突

| 场景 | 做法 |
|------|------|
| 改 workflow / rule | 在配置仓分支改 → PR/评审 → merge master |
| 新增 memory case | 直接 commit case + 更新 `index.md` |
| 升格 rule | 改 `dev/rules` + `optimization-log.md` + `archive/` 快照 |
| 与业务代码同一需求 | **两次提交**：子仓库 `[禅道]【项目】…`；配置仓 `[-]【通用】workflow：…` |

避免多人同时改同一 `.mdc`：大改前先 `git pull`。

---

## 六、分支策略（配置仓）

| 分支 | 用途 |
|------|------|
| `master` | 团队现行生效配置 |
| `feature/xxx` | 试验性 workflow，合并前在 Cursor 实测 |

配置仓 **不需要** release-1.166 等项目分支；与业务发布解耦。

---

## 七、检查清单（新设备就绪）

- [ ] 9 个子仓库已 clone 且能 `pull master`
- [ ] 配置仓已 `pull`（或 meta git 工作区完整）
- [ ] Cursor 打开文件夹为 **fj-common 根目录**
- [ ] MCP 已启用，测试库 `dataSourceId` 正确
- [ ] Codegraph 可用（可选）
- [ ] 已执行 `.\scripts\link-cursor-dev.ps1`（`.cursor/rules` 联接 `dev/rules`）
- [ ] 能读到 `docs/workflow.md`、`dev/rules/zoehis-*.mdc`（或 `.cursor/rules`）
- [ ] Skill `dev/skills/his-log-diagnosis` 可 Read（生产排查）

---

## 八、与记忆库的关系

- `docs/memory/cases/` **应进配置仓**，多设备共享经验。
- 定期「回顾升格」在任意设备执行，改完后 `commit + push`，其它设备 `pull` 即可。

---

*配置仓远程名：`zoehis_workflow`（GitHub 开源仓库）*
