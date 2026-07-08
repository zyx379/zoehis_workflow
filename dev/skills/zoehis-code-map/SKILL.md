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

## 子仓库定位（关键）

> **所有子仓库均位于工作区根目录下**（如 `d:\zoe_work_space\fj-common\onelink-web-pres-fj-common`）。
> **禁止**用 Glob `**/{repo-name}/**` 搜索子仓库（会返回空）。
> **正确方式**：直接 `LS {workspaceRoot}/{repo-name}/` 或 `Read {workspaceRoot}/{repo-name}/pages/...`。

| 仓库 | 域 | 实际路径 |
|------|-----|----------|
| onelink-web-outp-fj-common | 门诊前端 | `{workspaceRoot}/onelink-web-outp-fj-common/` |
| onelink-web-pres-fj-common | 医嘱前端 | `{workspaceRoot}/onelink-web-pres-fj-common/` |
| onelink-web-his-charge-fj-common | 收费前端 | `{workspaceRoot}/onelink-web-his-charge-fj-common/` |
| onelink-web-his-drug-fj-common | 药库前端 | `{workspaceRoot}/onelink-web-his-drug-fj-common/` |
| onelink-web-his-fj-component | 公共组件 | `{workspaceRoot}/onelink-web-his-fj-component/` |
| onelink-web-cis-common | CIS 公共组件 | `{workspaceRoot}/onelink-web-cis-common/` |
| onelink-micro-pres-fj-common | 医嘱后端 | `{workspaceRoot}/onelink-micro-pres-fj-common/` |
| onelink-micro-charge-fj-common | 收费服务 | `{workspaceRoot}/onelink-micro-charge-fj-common/` |
| onelink-micro-optimus-fj-common | 基础服务 | `{workspaceRoot}/onelink-micro-optimus-fj-common/` |
| onelink-micro-insurance-fj-ybcommon | 医保服务 | `{workspaceRoot}/onelink-micro-insurance-fj-ybcommon/` |

## 收集顺序（按优先级）

> **线索优先原则**：必须严格按以下顺序执行，**禁止跳过线索直接 Glob 搜索**。
> 每一步必须产出明确结论后才能进入下一步。

### 0. 提取线索（必做，第一步）

从 prompt 模板中提取所有可用线索，按优先级排序：

| 优先级 | 线索来源 | 示例 | 直接动作 |
|--------|----------|------|----------|
| **P0** | **已知线索**（git 标题/commit 信息） | `[XXX]【福州市第一总院】医嘱申请条数展示与页面展示不一致问题系停嘱时间与执行时间问题` | 提取关键词 → 直接 Grep 定位 |
| **P1** | **需求描述中的页面/功能名** | `医嘱申请`、`停嘱时间` | 映射到子仓库 → 直接 Read 对应文件 |
| **P2** | **截图/报错信息** | 截图中的组件名、URL、接口名 | 直接定位对应 Vue/JS/Dao.xml |
| **P3** | **疑似线索** | 用户提供的表名、接口名 | 直接 Read 验证 |
| **P4** | **禅道号/项目名** | `203656`、`漳州市医院` | 检索记忆库找类似 case |
| **P5** | **路径约定** | `pages/{camelCase}/`、`api/{kebab-service}/` | 按约定路径直接 Read |
| **P6** | **定向 Grep** | 类名/方法名/路由 | 小范围 Grep（带仓库前缀） |
| **P7** | **Codegraph（可选）** | 符号名明确时 | `codegraph_explore` 补全调用链 |
| **P8** | **MCP 字段核验（按需）** | 涉及表名/SQL 列时 | `get_table_schema` 核验 |

**关键规则**：
- **P0 线索必须首先处理**。git 标题中通常包含：问题现象 + 根因关键词 + 涉及模块，可直接定位到具体文件
- **禁止在 P0-P4 有可用线索时，使用 Glob `**/{repo-name}/**` 搜索子仓库**（会返回空且浪费时间）
- 子仓库定位：直接 `LS {workspaceRoot}/{repo-name}/` 或 `Read {workspaceRoot}/{repo-name}/...`

### 1. 长期记忆

Read `docs/memory/index.md`，按页面/表/禅道/关键词找相关 `cases/`

### 2. 用户线索

开场模板中的已知路径、接口名、截图、报错

### 3. 路径约定（见 `zoehis-naming` Rule）

- 页面 `pages/{camelCase}/`、`components/{同名}/`
- API `api/{kebab-service}/.../{PascalCase}.js`
- 后端 `Controller → Service → Dao → *Dao.xml`

### 4. 定向搜索

Grep 类名/方法名/路由/`baseUrl`/`dictName`（小范围，带仓库前缀）

### 5. Read 关键文件

仅读 Step 2 候选清单，不整文件通读大 Service

### 6. Codegraph（可选）

索引就绪且符号名明确时，可 `codegraph_explore` 补全调用链；**非强制**

### 7. MCP 字段核验（按需，Cursor Step 4）

代码地图涉及**表名、拟改 SQL 列、Dao.xml 字段、实体/DTO 属性**且未从已读源码确认时：
- 调用 MCP `zoe-his-mcp` → **`get_table_schema(tableNamePattern)`**
- 以返回**真实列名**写入短期记忆「数据库」表或「需求分析要点」
- 在回复中摘要：`已核对 <表名>：字段 xxx, yyy, ...`
- 纯前端、不涉及表/SQL → 注明「Step 4 不涉及 MCP 字段核验」
- 外部分析（Trae/CodeBuddy）无法调 MCP 时标「待 Cursor Step 4 MCP 核验」，**禁止**猜测列名写入 spec

## 必须输出（写入短期记忆）

### 文件命名（硬约束）

| 项 | 规则 | 示例 |
|----|------|------|
| **短期记忆** | `{禅道号}-{功能描述}+{关键索引}.md` | `206295-医嘱申请条数+docOderQuery-停嘱时间.md` |
| **文档 H1** | `# [禅道号] {功能描述}` | `# [206295] 医嘱申请条数展示与停嘱时间过滤` |
| **唯一性** | 同一禅道号进行中只保留一个 short-term；Step 5 spec 写在同一文件 `## Spec` 节 | — |

1. **短期记忆**：按上表命名，模板见 `docs/memory/short-term/_template.md`
2. **禁止**创建 `dev/skills/{禅道号}-*/`（Rule `zoehis-no-ticket-skill`）

**Agent 会话标题**：用**中文**写需求简称，写在 short-term 文档 H1 或「需求摘要」节，**不要**另建 Skill 文件。

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

### MCP 字段核验（按需）
- 已核对表 / 关键字段摘要，或「不涉及」
```

短期记忆文件末栏须含 **「人工审核意见（选填）」**（模板 `_template.md`），供 Step 9 用户填写。

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

- 未读文件、未 MCP 核验就编造 Controller 路径或 SQL 列名
- 把猜测写进长期 `cases/`（未验证只放短期记忆 + 标待确认）
- 用全库无差别 Grep 替代 index/case 检索
