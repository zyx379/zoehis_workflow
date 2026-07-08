# .cursor — Cursor 运行时入口（非源文件）

本目录 **不存放** Rule/Skill 源文件，仅作 Cursor 加载入口。

| 路径 | 类型 | 说明 |
|------|------|------|
| `rules/` | **目录联接** → `dev/rules/` | 勿删、勿在此单独改内容 |
| `skills/` | **目录联接** → `dev/skills/` | 同上 |
| `mcp.json` | **本地生成** | 从 `dev/mcp/mcp.json.example` 复制，已 gitignore |

**源文件与多编辑器说明** → 见 [`dev/README.md`](../dev/README.md)。

clone / pull 后若 `rules`、`skills` 不存在：

```powershell
.\scripts\link-cursor-dev.ps1
```
