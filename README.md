# zoehis_workflow

福建通用 HIS（ZOEHIS）**Cursor AI 开发工作流**开源配置：workflow、Rule、Skill、经验记忆库。

适用于 **fj-common 类多仓库聚合工作区**（业务代码在独立 Git 仓，本仓只含 AI 配置）。

## 特性

- [docs/workflow.md](docs/workflow.md) — 需求处理 Step 0–12（含 Git 两阶段、MCP 测试造数、经验沉淀）
- `.cursor/rules/` — 命名、风格、业务、表结构、Git、审查、测试造数
- `.cursor/skills/zoehis-ai-dev/` — 全栈开发 Skill + 业务模式文档
- [docs/memory/](docs/memory/README.md) — 工作经验案例库与定期升格/归档

## 快速开始

```bash
git clone https://github.com/zyx379/zoehis_workflow.git
```

将 clone 内容放到本地 **fj-common 工作区根目录**（与 `onelink-*` 业务子仓库并列），详见 [docs/multi-device-sync.md](docs/multi-device-sync.md)。

Cursor 打开 **工作区根目录**，即可加载 `.cursor/rules` 与 Skill。

## 文档

| 文档 | 说明 |
|------|------|
| [docs/workflow.md](docs/workflow.md) | **每次需求必读** |
| [docs/multi-device-sync.md](docs/multi-device-sync.md) | 多设备 Git 同步 |
| [docs/ai-dev-setup-workflow.md](docs/ai-dev-setup-workflow.md) | Rule/Skill 配置说明 |
| [AGENTS.md](AGENTS.md) | Agent 入口 |

## 不包含

- 业务源码（`onelink-*`）
- API Key、MCP 密钥
- 生产排查个人 Skill（`his-log-diagnosis`）

## License

MIT — 见 [LICENSE](LICENSE)

## 贡献

- 改 workflow / rule 前请读 `docs/memory/README.md` 升格流程
- Commit 标题：`[禅道号/需求号]【项目名称】需求标题`（配置仓可用 `[-]【通用】…`）
