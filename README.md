# fj-common AI 配置仓

福建通用 HIS **聚合工作区**的 Cursor 配置（与 9 个业务子仓库分离）。

## 包含内容

| 路径 | 说明 |
|------|------|
| [docs/workflow.md](docs/workflow.md) | 需求处理工作流（Step 0–12） |
| [docs/memory/](docs/memory/README.md) | 工作经验记忆库 |
| [.cursor/rules/](.cursor/rules/) | 自动生效 Rule |
| [.cursor/skills/zoehis-ai-dev/](.cursor/skills/zoehis-ai-dev/SKILL.md) | 项目 Skill |
| [AGENTS.md](AGENTS.md) | Agent 入口 |

## 不包含

本仓库 **不跟踪** `onelink-*` 业务代码（各子目录独立 GitLab 仓库）。

## 多设备使用

1. 本机目录结构与业务仓 clone 方式见 [docs/multi-device-sync.md](docs/multi-device-sync.md)
2. 更新配置：`git pull origin master`
3. Cursor 打开 **fj-common 根目录** 作为工作区

## 业务开发

- 工作流：每次需求按 `docs/workflow.md` + 开场模板
- 提交标题：`[禅道号]【项目名称】需求标题`
- 生产排查：个人 Skill `his-log-diagnosis`（不在本仓）
