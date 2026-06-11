---
name: zoehis-code-map
description: >
  Build a requirement-phase code map for ZOEHIS fj-common: search memory index/cases,
  user clues, path conventions, and targeted grep/read. Use at workflow Step 4 (需求分析)
  before spec. Prefer over blind full-repo search. Triggers: 代码地图, 需求分析, 代码定位,
  线索汇总, Step 4
---

# ZOEHIS 代码地图（需求分析阶段）

在 **Step 4 需求分析** 为复杂需求或跨仓改动建立「代码地图」，供 Step 5 spec 与 Step 6 实现使用。

## 何时使用

- workflow Step 4（复杂需求必做；Standard 可简化为文件清单 + 一行调用关系）
- 外部编辑器（Trae/CodeBuddy）做初步分析时，按本 Skill 输出格式交接给 Cursor
- Codegraph 不可用或未索引时，**本 Skill 为首选**定位手段

## 收集顺序（按优先级）

1. **长期记忆**：Read `docs/memory/index.md`，按页面/表/禅道/关键词找相关 `cases/`
2. **用户线索**：开场模板中的已知路径、接口名、截图、报错
3. **路径约定**（见 `zoehis-naming` Rule）：
   - 页面 `pages/{camelCase}/`、`components/{同名}/`
   - API `api/{kebab-service}/.../{PascalCase}.js`
   - 后端 `Controller → Service → Dao → *Dao.xml`
4. **定向搜索**：Grep 类名/方法名/路由/`baseUrl`/`dictName`（小范围，带仓库前缀）
5. **Read 关键文件**：仅读 Step 2 候选清单，不整文件通读大 Service
6. **Codegraph（可选）**：索引就绪且符号名明确时，可 `codegraph_explore` 补全调用链；**非强制**

## 必须输出（写入短期记忆）

路径：`docs/memory/short-term/{禅道号}-{slug}.md`（模板见该目录 `_template.md`）

```markdown
## 代码地图

| 仓库 | 路径 | 角色 | 置信度 |
|------|------|------|--------|

### 调用关系
（页面 → API → 后端 → 表）

### 记忆库命中
- case 链接 + 可复用结论一句

### 待确认
- 低置信度路径、业务不清点
```

## 与 Step 2 的分工

| Step | 目的 | 深度 |
|------|------|------|
| **2 代码定位** | 快速列出候选仓库与文件 | 清单级 |
| **4 需求分析** | 验证调用链、参数体系、数据流、case 复用 | 地图级，含置信度 |

简单需求（Trivial/Standard）：Step 4 可合并为「Step 2 清单 + 一行数据流」，不写短期记忆文件。

## 常用模式速查

| 场景 | 搜索关键词 / 路径 |
|------|-------------------|
| 基本字典下拉 | `dictName`、`findList`、`DIC_BASIC_DICT`、字典维护页 |
| 页面参数 | `$getPageControlMap`、`configId` |
| 系统参数 | `$getSysParamList`、`BizSysParam.jsonl` |
| 池表流转 | `*_POOL`、对应 `*_RECORD` |
| 门诊/住院对称 | 同功能 `_OUTP_` / `_INP_` 成对检索 |

详细业务表流转：Read `zoehis-business` / `patterns/his-business-patterns.md`。

## 禁止

- 未读文件就编造 Controller 路径或 SQL 列名
- 把猜测写进长期 `cases/`（未验证只放短期记忆 + 标待确认）
- 用全库无差别 Grep 替代 index/case 检索
