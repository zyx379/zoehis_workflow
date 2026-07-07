# 项目级记忆（跨会话持久）

> 本文件是 MimoCode 系统级 `MEMORY.md` 的镜像，存放于项目仓库内，随 Git 版本管理。
> 每次新会话应 Read 本文件加载上下文。

## 项目上下文

福建通用 HIS（Hospital Information System）多仓库聚合工作区。包含 10 个独立 Git 子仓库（门诊/住院/收费/药库/医保/公共组件的前端+后端），工作区根目录无 Git。开发流程严格按 `docs/workflow.md` 13 步执行，外部分析仅做 Step 0–4。Cursor skills 在 `.cursor/skills/` 目录下。

## 规则

（暂无）

## 架构决策

（暂无）

## 已发现的持久知识

- **子仓库路径**：`{workspaceRoot}/onelink-{micro|web}-{domain}-fj-common/`；根目录无 Git，须进入子仓库操作
- **Skill 清单**：`.cursor/skills/` 包含 9 个 skill：`zoehis-ai-dev`、`zoehis-backend`、`zoehis-business`、`zoehis-code-map`、`zoehis-daily-report`、`zoehis-external-analysis`、`zoehis-frontend`、`zoehis-git-ops`、`202240-special-disease-white-list-match`
- **外部分析分工**：Trae/CodeBuddy 仅执行 Step 0–4，Cursor 从 Step 5 接手
- **Git 交付**：push master → 关键词 merge release-* → tag+1；`onelink-web-cis-common` 仅 push master
- **参数体系**：系统参数 `$getSysParamList` vs 页面参数 `$getPageControlMap(configId)`，jsonl 单独 commit
- **业务模式**：池表→记录、主细表、预交金扣费、门诊/住院 `_OUTP_`/`_INP_` 对称
- **经验沉淀**：交付后写 `docs/memory/cases/` + 更新 `index.md`；短期记忆交付后删除
