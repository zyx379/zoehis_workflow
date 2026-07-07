---
name: zoehis-daily-report
description: >
  根据 fj-common 多仓库工作区中今天的 Git 提交记录，自动生成格式化的工作日报。
  遍历 9 个子仓库，提取当前用户当天的 commit，按需求归类输出为 "1、... 2、..." 的日报格式。
  Triggers: 日报, 生成日报, 今天做了什么, worklog, daily report, 工作总结
---

# ZOEHIS 日报生成器

## 用途

遍历 fj-common 聚合工作区的 9 个 Git 子仓库，提取**今天**的提交记录，自动汇总为格式化的工作日报。

## 触发条件

用户说以下关键词时触发：
- "生成今天的日报"
- "今天做了什么"
- "日报"
- "worklog / daily report"
- "工作总结"

## 工作区子仓库列表

> **定位方法**：所有子仓库均位于工作区根目录 `{workspaceRoot}/` 下。
> **禁止**用 Glob `**/{repo-name}/**` 搜索子仓库（会返回空）。应直接 `cd {workspaceRoot}/{repo-name}` 进入。

| 序号 | 仓库名 | 简称 | 实际路径 |
|------|--------|------|----------|
| 1 | onelink-web-outp-fj-common | 门诊前端 | `{workspaceRoot}/onelink-web-outp-fj-common/` |
| 2 | onelink-web-pres-fj-common | 医嘱前端 | `{workspaceRoot}/onelink-web-pres-fj-common/` |
| 3 | onelink-web-his-charge-fj-common | 收费前端 | `{workspaceRoot}/onelink-web-his-charge-fj-common/` |
| 4 | onelink-web-his-drug-fj-common | 药库前端 | `{workspaceRoot}/onelink-web-his-drug-fj-common/` |
| 5 | onelink-web-his-fj-component | 公共组件 | `{workspaceRoot}/onelink-web-his-fj-component/` |
| 6 | onelink-micro-pres-fj-common | 医嘱后端 | `{workspaceRoot}/onelink-micro-pres-fj-common/` |
| 7 | onelink-micro-charge-fj-common | 收费服务 | `{workspaceRoot}/onelink-micro-charge-fj-common/` |
| 8 | onelink-micro-optimus-fj-common | 基础服务 | `{workspaceRoot}/onelink-micro-optimus-fj-common/` |
| 9 | onelink-micro-insurance-fj-ybcommon | 医保服务 | `{workspaceRoot}/onelink-micro-insurance-fj-ybcommon/` |

## 执行步骤

### Step 1：获取当前 Git 用户名

```bash
git config user.name
```

用于过滤当前用户的提交（避免混入他人 commit）。若获取失败，则不过滤作者，获取全部今日提交。

### Step 2：遍历各仓库提取今日提交

对每个子仓库执行（PowerShell）：

```powershell
cd <仓库路径>
# 获取今天 00:00 到现在的提交，格式：hash|author|message
git log --since="today 00:00" --until="tomorrow 00:00" --author="<当前用户名>" --format="%h|%an|%s" --no-merges
```

- `--no-merges`：排除 merge commit，避免重复
- 若当前用户名为空，去掉 `--author` 参数

### Step 3：解析 Commit 信息

本项目 commit 标题规范：
```
[禅道号]【项目名称】需求标题
```

从 `%s`（subject）中提取：
- **禅道号**：`[\d+]` 或 `[-]`
- **项目名称**：`【(.*?)】`
- **需求标题**：`】` 之后的部分

### Step 4：去重与归类

1. **同一需求跨多仓**：若多个仓库的 commit 属于同一项目（【项目名称】相同），合并为一条日报项
2. **同一需求多次提交**：同一仓库同一需求的多个 commit，只保留最新一条（或合并描述）
3. **排除纯系统参数提交**：标题含 `BizSysParam.jsonl`、`增加系统参数` 的，视用户需求决定是否保留（默认保留但标注为"系统参数配置"）

### Step 5：生成日报

输出格式（严格按用户要求的编号格式）：

```
1、【项目名称1】需求标题1（涉及：门诊前端、医嘱后端）
2、【项目名称2】需求标题2（涉及：收费前端、收费服务）
3、系统参数配置：增加系统参数【参数名】（涉及：收费服务）
```

若当天无提交：
```
今天暂无 Git 提交记录。
```

## 输出示例

```
1、【漳州市医院】退药申请列表增加批号字段展示（涉及：药库前端、基础服务）
2、【漳州二院】出院带药取药方式优化（涉及：医嘱前端、医嘱后端）
3、系统参数配置：增加系统参数【LAY_DRUG_RETURN_FLAG】（涉及：收费服务）
```

## 边界处理

| 场景 | 处理 |
|------|------|
| 仓库不在本地 / 非 Git 仓库 | 跳过，不报错 |
| 今天无提交 | 输出"今天暂无提交记录" |
| commit 不规范（无【项目】格式） | 原样保留标题，项目名标为"其他" |
| 跨天提交（如昨晚 23:00） | 只取今天 00:00 之后的，不跨天 |
| 多个 commit 同一需求 | 合并为一条，列举涉及仓库 |

## 快速执行（脚本方式）

运行已封装的 PowerShell 脚本：

```powershell
# 方式 1：AI Agent 直接执行
& .cursor/skills/zoehis-daily-report/scripts/generate-daily-report.ps1

# 方式 2：指定工作区路径
& .cursor/skills/zoehis-daily-report/scripts/generate-daily-report.ps1 -WorkspaceRoot "D:\zoe_work_space\fj-common"
```

脚本自动：
1. 读取当前 `git config user.name` 作为作者过滤
2. 遍历 9 个子仓库
3. 解析 commit 标题、去重、按项目归类
4. 输出 `1、... 2、...` 格式的日报

## 关联

- **工作流**：`docs/workflow.md` — 日报可用于 Step 12 经验沉淀时的当日工作回顾
- **Git 规范**：`zoehis-git-ops` — commit 标题格式直接影响日报解析质量

