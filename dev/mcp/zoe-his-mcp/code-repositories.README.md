# code-repositories.json 配置说明

## 核心原则（灵活分析，禁止臆测仓库名）

各医院 GitLab 仓库**命名不统一**，例如南安收费结算并非 `onelink-micro-charge-fj-nasyy`，而是：

`http://gitlab.zoesoft.com.cn/fj-nasyy/zoe-optimus-nasyy`

排查时应根据 **日志多线索** 选仓库，而不是套用公司库 `onelink-micro-*-fj-common` 的命名规则。

## 路径规则

| 场景 | GitLab 根路径 | 仓库列表 |
|------|---------------|----------|
| 未在 `projectPrefixes` 登记 | `http://gitlab.zoesoft.com.cn/onelink/fj-common` | `default` |
| 已登记项目（如 nasyy） | `http://gitlab.zoesoft.com.cn/fj-nasyy` | **仅**该项目数组中的显式 `repositoryUrl` |

**不再**做「替换前缀 + 自动改仓库名」。

## 仓库条目字段

| 字段 | 说明 |
|------|------|
| `repositoryUrl` | 完整 GitLab 地址（必填） |
| `servicePatterns` | 日志 `serviceName`、URL 片段 |
| `packagePatterns` | Java 包名，如 `com.zoe.optimus.service.dict` |
| `sqlIdPatterns` | Dao/方法名片段 |
| `notes` | 人工备注，便于后人维护 |

## 匹配优先级（get_code）

1. `sqlIdPatterns` / `packagePatterns`（权重高）
2. `servicePatterns` / `urlPath`
3. 仅 1 个仓库时兜底

## 不确定仓库名时

1. `list_code_repositories` — 看已配置列表  
2. `discover_gitlab_projects` — 调 GitLab API 列举 `fj-nasyy` 分组下项目（需 `GITLAB_TOKEN`）  
3. 将确认后的 URL 写入 `code-repositories.json`

## 南安市医院（nasyy）已验证

| 场景 | 仓库 |
|------|------|
| 医保拆服务 / `zoe-split-insurance-service` / 2203A | `http://gitlab.zoesoft.com.cn/fj-fy/zoe-split-insurance-fj` |
| 住院结算 / 预交金 / `zoe-split-charge-service` | `http://gitlab.zoesoft.com.cn/fj-nasyy/zoe-optimus-nasyy` |

### 应用日志（旧架构）

南安为**旧架构**，MCP 使用 `log-profiles.json` 中 `nasyy` 配置：

- HTTP/请求：`log-req*`（非 `log-http*`）
- 必带 `timestamp`（startDate/endDate）
- `filterParamet` 含 `sortColumns` 等，**不用**新架构 `searchType/searchValue`

其他模块按实际 GitLab 项目名逐条补充，勿批量猜测。
