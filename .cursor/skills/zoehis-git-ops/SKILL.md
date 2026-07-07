---
name: zoehis-git-ops
description: >
  ZOEHIS Git delivery: commit, push, merge to release branches, cherry-pick, create
  tags. Use when committing code to master, pushing to remote, merging from master
  to release-1.166/1.168 branches, cherry-picking specific commits, tagging releases,
  or handling system parameter (jsonl) separate commits.
  Keywords: 提交, push, 合并, merge, 发布, release, tag, cherry-pick,
  commit, 推送, 打tag, 系统参数, jsonl
---

# ZOEHIS Git 交付

福建通用 HIS Git 操作规范。仅在 Step 10 Git 交付阶段触发。

## 工作区结构

10 个独立 Git 子仓库（根目录无 Git）。操作时须进入具体子仓库。

> **定位方法**：所有子仓库均位于工作区根目录 `{workspaceRoot}/` 下（如 `d:\zoe_work_space\fj-common\onelink-web-pres-fj-common`）。
> **禁止**用 Glob `**/{repo-name}/**` 搜索子仓库（会返回空）。应直接 `cd {workspaceRoot}/{repo-name}` 进入。

| 仓库 | 域 | 实际路径 | Step 10 备注 |
|------|-----|----------|--------------|
| onelink-web-outp-fj-common | 门诊前端 | `{workspaceRoot}/onelink-web-outp-fj-common/` | 可 merge + tag |
| onelink-web-pres-fj-common | 医嘱前端 | `{workspaceRoot}/onelink-web-pres-fj-common/` | 可 merge + tag |
| onelink-web-his-charge-fj-common | 收费前端 | `{workspaceRoot}/onelink-web-his-charge-fj-common/` | 可 merge + tag |
| onelink-web-his-drug-fj-common | 药库前端 | `{workspaceRoot}/onelink-web-his-drug-fj-common/` | 可 merge + tag |
| onelink-web-his-fj-component | 公共组件 | `{workspaceRoot}/onelink-web-his-fj-component/` | 可 merge + tag |
| **onelink-web-cis-common** | **CIS 公共组件（npm 包）** | `{workspaceRoot}/onelink-web-cis-common/` | **仅 10.1 push master；跳过 merge/tag** |
| onelink-micro-pres-fj-common | 医嘱后端 | `{workspaceRoot}/onelink-micro-pres-fj-common/` | 可 merge + tag |
| onelink-micro-charge-fj-common | 收费服务 | `{workspaceRoot}/onelink-micro-charge-fj-common/` | 可 merge + tag |
| onelink-micro-optimus-fj-common | 基础服务 | `{workspaceRoot}/onelink-micro-optimus-fj-common/` | 可 merge + tag |
| onelink-micro-insurance-fj-ybcommon | 医保服务 | `{workspaceRoot}/onelink-micro-insurance-fj-ybcommon/` | 可 merge + tag |

## 分支策略

| 分支 | 用途 |
|------|------|
| **master** | 所有功能开发；改前 `git checkout master && git pull origin master` |
| **release-*** | 项目发布分支；**禁止**直接改功能，仅 merge master |

## Step 10 三阶段

### 10.1 push master

```bash
cd <子仓库路径>
git checkout master
git pull origin master
git add <files>
git commit -m "[禅道号/需求号]【项目名称】需求标题"
git push origin master
```

- **多仓顺序**：先后端 service，再前端
- **commit 标题**：`[禅道号]【项目名称】需求标题`（无禅道号用 `[-]` 占位）
- 每步汇报 `git status`

**`onelink-web-cis-common` 例外：** 无 `release-*` 分支与 tag 序列；无论触发「提交并 push」或「提交并发布」，**只执行 10.1**，不 merge、不打 tag。回报注明「cis-common 已 push master，不参与项目分支编译」。

### 10.2 合并到项目分支

```bash
git checkout <项目分支>
git pull origin <项目分支>
git merge master
git push origin <项目分支>
git checkout master
```

**关键词 → 项目分支：**

| 提交关键词 | 项目分支 |
|-----------|----------|
| `【漳州市医院】` | `release-1.168` |
| `【漳州二院】` | `release-1.166` |

- 匹配优先最长关键词
- **无医院关键词（未知项目）**：**跳过 10.2 merge**（不合并 release-1.166/1.168）；在 **master** 上打 **`release-0.0.{max+1}`** tag 触发 CI 编译（见 10.3）
- 冲突优先 **cherry-pick** 本次 commit（而非全量 merge）
- **`onelink-web-cis-common` 跳过本步**

### 10.3 打 Tag（在项目分支或 master）

```bash
git checkout <项目分支>          # 已知医院项目
git pull origin <项目分支>
# 取当前分支最大 tag，版本号 +1
git tag <新版本号>
git push origin <新版本号>
git checkout master
```

**未知项目（commit 无 `【漳州市医院】` / `【漳州二院】` 等医院关键词）：**

```bash
git checkout master
git pull origin master
# 取全仓 release-0.0.* 最大序号 +1，例：release-0.0.1375 → release-0.0.1376
git tag release-0.0.<序号>
git push origin release-0.0.<序号>
```

- **已知医院**：在对应 **release-*** 分支上打 tag，格式 `release-1.168.x` / `release-1.166.x`（以该分支已有 tag 为准）
- **未知项目**：在 **master** 上打 tag，格式 **`release-0.0.{max+1}`**（全仓 `release-0.0.*` 序号最大值 +1）
- 每仓 tag 独立计算
- **`onelink-web-cis-common` 跳过本步**

## Windows / Cursor Agent 提交技巧

Cursor Agent 环境可能自动注入 `Co-authored-by: Cursor`，且 `git commit -m` / `filter-branch` 在 Windows 下易污染 commit 标题（cmd banner 乱入）。

**推荐：用 `commit-tree` + 消息文件**

```bash
# 1. 将标题写入 .git/COMMIT_MSG_*.txt（UTF-8 无 BOM，仅一行标题）
# 2. 功能代码已 git add 后：
tree=$(git write-tree)
parent=$(git rev-parse HEAD)
new=$(git commit-tree $tree -p $parent -F .git/COMMIT_MSG_FEATURE.txt)
git reset --hard $new

# 3. 参数 jsonl 单独一轮（同上，换 COMMIT_MSG_PARAM.txt）
```

- **禁止** `git filter-branch --msg-filter` + batch 脚本（Windows 易把 cmd 启动 banner 写入 message）
- **jsonl 追加**：用 Write 工具或 `[System.IO.File]::AppendAllText(..., UTF8Encoding($false))`，勿用 PowerShell `Add-Content` 默认编码
- push 前 `git log -1 --format=full` 核对标题；含 `Co-authored-by: Cursor` 时可用 `commit-tree` 重建

## cherry-pick 后格式审核（强制）

解决冲突后、`git add` 前，逐项确认：
- [ ] 无残留冲突标记（`<<<<<<<` / `=======` / `>>>>>>>`）
- [ ] 括号匹配正确（`{}` `()` 成对）
- [ ] 缩进与上下文一致
- [ ] 语法无误

## 系统参数单独提交（硬约束）

`ChargeBizSysParam.jsonl`（及同类 `*BizSysParam.jsonl`）**不得与功能代码同一 commit**：

1. **master**：功能 commit 先 push；参数 **单独 commit** 后 push
2. **commit 标题**：`[*111111*]增加系统参数【参数英文名】【禅道号】`
3. **作者/审核人**：`creatorName`、`checkerName`、`creatorCode` 填需求负责人姓名；**本工作区默认 `zhouyanxi`**（用户未另行指定时），禁止 `zoehis-ai`
4. **合并到项目分支**：参数 commit 可与 release 上其他参数变更一并 merge（jsonl 冲突时保留双方参数行）

## 用户触发语

| 触发语 | Agent 执行 |
|--------|-----------|
| **审查通过，提交并 push** | 仅 10.1（push master） |
| **审查通过，提交并发布** | 10.1 + 10.2 + 10.3（已知医院 merge release-* + 分支 tag；**未知项目** master 上 `release-0.0.{max+1}`） |
| **审查通过，合并到 release-1.166** | 10.1 + 合并到指定分支 |
| **只生成 commit message** | 仅起草，不执行 git |

## 关联

- **编排 Skill**：[zoehis-ai-dev](../zoehis-ai-dev/SKILL.md) — Git 交付在此触发
- **参数规范**：[.cursor/rules/zoehis-sys-param.mdc](../../../.cursor/rules/zoehis-sys-param.mdc) — 系统参数 vs 页面参数区分 + 提交标准
- **工作流**：[docs/workflow.md](../../../docs/workflow.md) — 完整 Step 10 流程
