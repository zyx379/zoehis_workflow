# SPEC: 离线日志导出前端（Offline Log Export UI）

**版本**: v0.1 (draft) ｜ **日期**: 2026-07-10 ｜ **关联**: `his-log-diagnosis` / `docs/排查/现场离线排查流程.md` 分支 B

> 本文件为设计草稿，定义「现场断外网」场景下，由现场工程师自助导出离线排查包（bundle）的前端工具规格。落地实现前需先确认文末开放问题。

---

## 1. 背景与目标

现场**断外网**时，`zoe-his-mcp`（直连/linx）与 GitLab 均不可达，`his-log-diagnosis` 退化为纯代码推演（分支 B），**日志链路全失**。本工具提供一个**部署在现场内网/运维电脑上的前端界面**，在断网环境下由现场工程师自助导出一份**自包含的离线排查包（bundle）**，带回后 Agent 在本地工作区直接摄入分析，复用现有 Step 1–6 链路。

**两大硬需求（来自用户）**
1. **版本号**：导出包必须包含现场**各服务的 tag/release 号**（对应 `SKILL.md:65` 的 `git diff master..release-*` 门禁）。
2. **全量应用日志内容**：导出包必须足以支撑**离线全量应用日志排查**——即 HTTP/RPC/SQL/param/normal 五类日志（对齐 `mcp-tools.md` 的 `query_log/query_rpc_log/query_sql_log/query_param_log/query_normal_log`），而非仅报错片段。

### 与现有能力的映射

| 现有组件 | 在线（分支 A） | 本工具（断网） |
|----------|----------------|----------------|
| 日志检索 | `zoe-his-mcp` `query_*_log` 查 ES 索引 | 前端直连现场 ES，按相同 `log-profiles.json` 索引拉取 |
| 代码定位 | `get_code` 本地优先 → GitLab 回退 | 本地 clone（release 分支须预先同步） |
| 版本/发布分支 | 用户口头提供 | bundle 内置 `versions[]`，自动喂给 release diff |
| 业务验证 | `query_business_data` SQL | 现场执行 `verify-*.sql` 回填结果 |

索引定义同源：`dev/mcp/zoe-his-mcp/log-profiles.json`（`onelink`: `log-http*`；`legacy` 南安/莆田: `log-req*`）。

---

## 2. 非目标（Out of Scope）

- 不做 SQL 执行/业务数据验证（分支 B 禁止，仍由现场回填 `verify-*.sql` 结果）。
- 不替代 `zoe-his-mcp` 在线诊断；联网时优先走分支 A。
- 不在前端内嵌大模型推理。

---

## 3. 关键概念 / 词汇

| 术语 | 含义 |
|------|------|
| bundle | 一次导出的自包含目录/zip，含 manifest + 日志 + 版本清单 |
| profile | 医院日志平台差异配置（复用 `dev/mcp/zoe-his-mcp/log-profiles.json`：`onelink`/`legacy` 等） |
| tagSet | 现场各微服务当前发布 tag/release 号清单（需求1） |
| full log | HTTP/RPC/SQL/param/normal 五类原始日志行（需求2） |

---

## 4. 功能需求

### FR-1 连接与 profile 选择
- 前端可配置 ES 地址（现场日志平台，通常为内网 `http://<es-host>:9200` 或日志网关）。
- 提供 **profile 下拉**，选项来自内置 `log-profiles.json`（onelink/nasyy/fjpt…），切换后自动套用对应 `indices`（如 `log-http*` vs `log-req*`）与 `architecture`（legacy 需 `timestamp`+`filterParamet`）。
- 提供「探活」按钮，调用 `/health` 类接口确认 ES 可达（对应 `SKILL.md:27` Step 0 门禁）。

### FR-2 检索条件（对齐 MCP 入参）

| 字段 | 对应 MCP | 说明 |
|------|----------|------|
| traceId | 所有 `query_*_log` | 必填或选填（见 FR-5 全量模式） |
| serviceName | `query_log`/`query_rpc_log` | 可选 |
| sqlId | `query_sql_log` | 可选 |
| keyword | `query_rpc_log`/`query_param_log`/`query_normal_log` | 可选 |
| logLevel | `query_normal_log` | 默认 `ERROR,WARN`，可扩 `INFO` |
| 时间窗 | `defaultTimeRangeDays` | 默认 3 天，legacy 需 `timestamp` |

### FR-3 版本号采集（需求1 — 硬约束）
- 提供「采集版本」按钮，通过以下任一方式获取**各服务 tagSet**：
  - 现场运维提供 `kubectl get deploy -o yaml | grep image:` / 镜像 tag；
  - 或读取现场 `deploy` 清单 / `docker ps --format`；
  - 或手动录入（提供表格表单：服务名 → tag/release 号）。
- **导出时 `tagSet` 为必填项**，缺失则禁止导出并高亮提示。
- `manifest.json` 中 `versions[]` 字段结构：`{ service, tag, gitBranch, commitSha? }`。

### FR-4 日志导出（需求2 — 硬约束）
- 点击「导出」后，按所选 profile 的 `indices` **逐类拉取**以下五类日志：
  1. HTTP（`log-http*` / `log-req*`）
  2. RPC/Dubbo（`log-dubbo*`）
  3. SQL（`log-sql*`）
  4. param（`log-param*`）
  5. normal（`log-normal*`，按 logLevel）
- 每类输出为结构化 JSONL（一行一文档），字段保持与 MCP 返回对齐：`serviceName, traceId, url, method, status, requestParam, sqlId, sqlText, errorMessage, timestamp, logLevel`。
- **全量保证**：除按 traceId 精确检索外，提供「全量模式（FR-5）」。

### FR-5 全量导出模式（断网前的兜底）
- 当**无 traceId** 或选「全量」时，按 `serviceName + 时间窗 + logLevel(含INFO)` 拉取，确保离线可覆盖「现场只给了现象/报错截图、无 traceId」的分支 B 场景。
- 为避免体积爆炸：全量模式默认仅含 `ERROR+WARN`，提供「含 INFO」开关与大小预估（MB）提示。

### FR-6 Bundle 结构与 manifest
导出为 zip，结构：
```
offline-bundle-<hospital>-<yyyymmdd-HHMM>/
  manifest.json          # 元信息 + tagSet + profile + 检索条件 + 生成时间
  logs/
    http.jsonl
    rpc.jsonl
    sql.jsonl
    param.jsonl
    normal.jsonl
  versions.json          # = manifest.versions 冗余副本，便于单独核对
  README.txt             # 带回后如何交给 Agent 的说明
```
`manifest.json` 字段：
```json
{
  "tool": "offline-log-export",
  "version": "0.1",
  "generatedAt": "2026-07-10T16:17:00+08:00",
  "hospital": "nasyy",
  "profile": "legacy",
  "query": { "traceId": "...", "serviceName": "...", "timeRangeDays": 3, "logLevel": ["ERROR","WARN"] },
  "versions": [
    { "service": "zoe-split-charge-service", "tag": "release-1.168", "gitBranch": "release-1.168", "commitSha": "a1b2c3d" }
  ],
  "logCounts": { "http": 12, "rpc": 5, "sql": 30, "param": 8, "normal": 3 }
}
```

### FR-7 离线摄入（Agent 侧，配套 SKILL.md 改动）
- `his-log-diagnosis/SKILL.md` 新增「离线日志摄入」段：当提供 `offline-bundle` 路径时，用 Read/Grep 解析 `logs/*.jsonl`，复用 Step 1–4 链路（HTTP→RPC→SQL→param→normal）。
- **版本号用途**：Step 5 代码定位时，用 `manifest.versions[].gitBranch` 作为 `git diff master..<该release>` 的目标分支，无需再向用户追问发布分支（`SKILL.md:65`）。
- Step 6 SQL 验证改为「现场执行 `verify-*.sql` 回填」模式（需求2 仅提供日志，不提供库查询）。

---

## 5. 技术约束

- **纯前端 / 本地运行**：建议 Electron 或静态 SPA + 本地 Node 代理（避免浏览器 CORS 直连 ES）。断网环境必须可离线启动（无 CDN 依赖）。
- **零外网依赖**：bundle 内不含任何需回传服务器的内容；仅现场本地 ES/日志网关交互。
- **字段对齐 MCP**：`logs/*.jsonl` 字段名与 `mcp-tools.md` 返回对齐，降低 Agent 摄入解析成本。
- **profile 同源**：`log-profiles.json` 与 `zoe-his-mcp` 共用同一份，避免差异漂移。

---

## 6. 验收标准

| # | 标准 |
|---|------|
| AC-1 | 断网环境下，前端可连接现场 ES 并探活成功 |
| AC-2 | 导出 bundle 的 `manifest.versions` **非空**，缺版本号时导出被拦截 |
| AC-3 | bundle 含全部五类 `logs/*.jsonl`，字段与 MCP 对齐 |
| AC-4 | 全量模式（无 traceId）可产出足以支撑分支 B 的日志 |
| AC-5 | Agent 读 bundle 后能自动跑通 Step 1–4 并引用 `versions[].gitBranch` 做 release diff |

---

## 7. 待确认 / 开放问题

1. **现场日志存储形态**：是直连 ES，还是经日志网关/自研接口？决定前端取数层实现。
2. **版本号来源**：现场能否提供标准化接口（k8s/docker/部署平台 API）自动采集，还是只能手动录入？
3. **技术栈偏好**：Electron 桌面端 vs 内网静态页 + 本地代理？
4. **bundle 体积上限**：全量含 INFO 时可能很大，是否需要自动分卷/采样？

---

## 8. 后续衔接

- 实现后，需在 `SKILL.md` 增加「离线日志摄入」段（FR-7），并在 `docs/排查/现场离线排查流程.md` 的分流确认表中把「断外网 + 有 bundle」列为新前置条件。
- 现有 `scripts/verify-package-spec.sql`、`scripts/verify-presno-param.sql` 改造为「现场执行 → 回填结果」模式，配合 FR-7 的 Step 6。

*版本：2026-07-10 | 关联：`dev/skills/his-log-diagnosis/SKILL.md`、`docs/排查/现场离线排查流程.md`*
