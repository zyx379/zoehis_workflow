# 归档目录

优化 workflow / skill / rule 前，将**修改前**的文件复制到：

```
archive/YYYY-MM-DD/
├── workflow.md
├── （相关 .mdc 或 SKILL 片段）
└── CHANGELOG.md   # 本次为何归档、改了什么
```

仅作历史快照，**不参与** Agent 自动加载；当前生效版本始终在 `docs/workflow.md` 与 `.cursor/`。
