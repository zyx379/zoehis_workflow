---
name: zoehis-backend
description: >
  ZOEHIS backend development: Spring Boot 2.3/MyBatis controllers, services, DAOs,
  Dao.xml SQL mappings, Java entity/DTO/VO, Maven multi-module (api/pojo/service).
  Use when adding REST endpoints, modifying business logic in Service layer, writing
  SQL in Dao.xml, creating Feign clients, handling Dubbo RPC, Maven dependency changes.
  Keywords: 后端, 接口, Controller, Service, DAO, SQL, XML, Dao.xml, Maven,
  Spring, MyBatis, Dubbo, Feign, Entity, DTO, VO, Java, Mapper
---

# ZOEHIS 后端开发

福建通用 HIS 后端开发规范。负责 Spring Boot + MyBatis 接口开发。

## 子仓库定位（关键）

> **所有子仓库均位于工作区根目录 `{workspaceRoot}/` 下**（如 `d:\zoe_work_space\fj-common\onelink-micro-pres-fj-common`）。
> **禁止**用 Glob `**/{repo-name}/**` 搜索子仓库（会返回空）。应直接 `LS {workspaceRoot}/{repo-name}/` 或 `Read {workspaceRoot}/{repo-name}/...` 访问。

后端子仓库：

| 仓库 | 域 | 实际路径 |
|------|-----|----------|
| onelink-micro-pres-fj-common | 医嘱后端 | `{workspaceRoot}/onelink-micro-pres-fj-common/` |
| onelink-micro-charge-fj-common | 收费服务 | `{workspaceRoot}/onelink-micro-charge-fj-common/` |
| onelink-micro-optimus-fj-common | 基础服务 | `{workspaceRoot}/onelink-micro-optimus-fj-common/` |
| onelink-micro-insurance-fj-ybcommon | 医保服务 | `{workspaceRoot}/onelink-micro-insurance-fj-ybcommon/` |

## 技术栈

- **框架**：Spring Boot 2.3 + MyBatis
- **语言**：JDK 11（部分 service 子模块 JDK 1.8）
- **构建**：Maven（`${revision}` + flatten-maven-plugin）
- **基础设施**：Dubbo RPC + Nacos + ZK
- **数据库**：达梦 / Oracle
- **缩进**：Java 4 空格

## Maven 多模块结构

```
{项目}/ (例: onelink-micro-charge-fj-common)
├── {项目}-api/      -- Feign Client 接口定义
├── {项目}-pojo/     -- Entity / DTO / VO
└── {项目}-service/  -- Controller + Service + Dao + Dao.xml
```

- **groupId**：`com.zoe.fjcommon`
- **基础包**：`com.zoe.optimus.service`
- **Controller 包**：`com.zoe.optimus.service.{业务域}.web.{子域}`
- **版本管理**：`${revision}` 统管 + flatten-maven-plugin 展开

## 分层调用链

```
Controller → Service → Dao (MyBatis interface) → Dao.xml (SQL)
```

### Controller

```java
@RestController
@RequestMapping("/{service}/api/{Module}")
public class ModuleController {
    @Autowired
    private ModuleService moduleService;
    
    @PostMapping("/queryList")
    public Result queryList(@RequestBody QueryDTO query) {
        return Result.success(moduleService.queryList(query));
    }
}
```

### Service

```java
@Service
public class ModuleService {
    @Autowired
    private ModuleDao moduleDao;
    
    public List<VO> queryList(QueryDTO query) {
        return moduleDao.selectByCondition(query);
    }
}
```

### Dao (MyBatis Interface)

```java
@Mapper
public interface ModuleDao {
    List<Entity> selectByCondition(QueryDTO query);
    
    int insert(Entity entity);
    
    int updateById(Entity entity);
}
```

### Dao.xml (SQL Mapping)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.zoe.optimus.service.{域}.dao.{子域}.ModuleDao">
  
  <resultMap id="BaseResultMap" type="com.zoe.optimus.service.{域}.pojo.{子域}.Entity">
    <id column="ID" property="id" jdbcType="VARCHAR"/>
    <result column="NAME" property="name" jdbcType="VARCHAR"/>
  </resultMap>
  
  <select id="selectByCondition" resultMap="BaseResultMap">
    SELECT * FROM TABLE_NAME WHERE 1=1
    <if test="name != null and name != ''">
      AND NAME = #{name}
    </if>
  </select>
  
</mapper>
```

- **路径**：`mappings/{业务域}/{子域}/*Dao.xml`（在 service 模块内 `src/main/java/` 下）
- **文件命名**：`*Dao.xml`（非 `*Mapper.xml`）
- 使用 `#{}` 而非 `${}` 防注入

## 常用注解

| 注解 | 位置 | 说明 |
|------|------|------|
| `@RestController` | Controller | REST 接口 |
| `@PostMapping` / `@GetMapping` | Controller 方法 | 路径映射 |
| `@RequestBody` | Controller 参数 | JSON 请求体 |
| `@Service` | Service 类 | 业务服务 |
| `@Autowired` | 字段/构造器 | 依赖注入 |
| `@Mapper` | Dao 接口 | MyBatis Mapper |
| `@FeignClient` | API 接口 | 远程调用 |
| `@Transactional` | Service 方法 | 事务 |

## 数据库注意事项

- **表名/列名全大写+下划线**，Java 实体小驼峰
- `resultMap` 中 column 必须与数据库列名一致（大小写以数据库为准）
- 达梦/Oracle：注意序列（`SEQ_*.NEXTVAL`）、日期函数、分页差异
- 动态 SQL `IN` 子句避免空集合导致 SQL 异常

## 跨服务调用

### Dubbo RPC（内部服务间）
```java
@DubboReference
private ModuleApi moduleApi;
```

### Feign（跨系统）
```java
@FeignClient(name = "service-name", path = "/api")
public interface ModuleClient {
    @PostMapping("/endpoint")
    Result method(@RequestBody DTO dto);
}
```

## 关联

- **编排 Skill**：[zoehis-ai-dev](../zoehis-ai-dev/SKILL.md) — 全栈功能改造时由此编排
- **前端 Skill**：[zoehis-frontend](../zoehis-frontend/SKILL.md)
- **业务 Skill**：[zoehis-business](../zoehis-business/SKILL.md) — 表结构、数据流、池表/预交金
- **工作流**：[docs/workflow.md](../../../docs/workflow.md)
- **代码模式**：[patterns/common-patterns.md](patterns/common-patterns.md)
