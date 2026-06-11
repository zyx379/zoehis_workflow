# 短期记忆（需求进行中）

> **生命周期短**：仅服务当前需求；交付闭环后删除，不进入 index。  
> 长期可复用结论 → Step 12 写入 [../cases/](../cases/) 并更新 [../index.md](../index.md)。

---

## 适用内容

| 类型 | 示例 | 何时写 |
|------|------|--------|
| 需求分析 | 代码地图、调用链、待确认点 | Step 4 |
| Spec 草稿 | 改造计划、表/接口清单 | Step 5 |
| 排查笔记 | 非生产 trace 的本地定位记录 | Bug 修复 Step 2–4 |
| 外部编辑器交接 | Trae/CodeBuddy 初步线索汇总 | 接手 Cursor 前 |

## 不适用（应直接进长期）

- 已验证、可跨需求复用的做法 → `cases/`
- 规范升格 → workflow / skill / rule

---

## 命名与模板

- 文件：`{禅道号}-{slug}.md`（例：`203042-referral-reason-dict.md`）
- 模板：[\_template.md](_template.md)

## 清理（Step 12 后）

1. 将 **已验证** 条目提炼进 `cases/YYYY-MM-<slug>.md`
2. 更新 `index.md`
3. **删除** 本目录对应该需求的短期文件
4. 进度清单注明「短期记忆已清理」

Agent **不得** 把短期记忆全文复制进 alwaysApply Rule。
