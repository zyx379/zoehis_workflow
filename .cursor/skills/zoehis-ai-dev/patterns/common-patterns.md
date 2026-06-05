# ZOEHIS 通用设计模式

> 本文件为骨架，所有设计模式需要后续从实际代码中投喂补充。

---

## 一、已确认的模式

### 1.1 前端API层模式（来源：Laycall.js）

```
模式：ES6 Class + 构造函数注入
- 模块级 baseUrl 常量
- export default class 导出
- constructor(config) 注入 $httpVue
- 方法签名：method(query, config)
- 请求方式：this.$httpVue().post(url, query, config)
```

### 1.2 前端Mixin模式（来源：printMixins.js）

```
模式：纯方法对象
- export default { methods: { ... } }
- 方法名使用 $ 前缀
- 依赖全局对象（window.eedjs, window.userInfo）
- 依赖Vue实例注入方法（this.$comGetId 等）
- Promise .then().catch() 链式调用
- 可选回调 callback && callback()
```

### 1.3 前端Nuxt配置合并模式（来源：nuxt.config.js）

```
模式：三层配置合并
- 第一层：@zoesoft.com.cn/onelink-client-core/nuxt.config（核心包默认）
- 第二层：本项目自定义配置
- 第三层：@zoesoft.com.cn/onelink-web-cis-common/nuxt.config（CIS通用）
- 合并函数：customConfigMerge()
```

### 1.4 后端Maven多模块模式（来源：pom.xml）

```
模式：api/pojo/service 三层分离
- api：对外接口定义（Feign Client）
- pojo：数据对象（Entity/DTO/VO）
- service：业务实现（Controller/Service/Dao + Dao.xml）
- 版本管理：${revision} + flatten-maven-plugin
```

---

## 二、待投喂

以下内容需要后续从实际代码中补充：

- [ ] 前端列表页模式（表格 + 搜索 + 分页的标准写法）
- [ ] 前端树形结构模式
- [ ] 前端表单页模式
- [ ] 前端弹窗模式
- [ ] 前端路由配置模式
- [ ] 前端权限控制模式
- [ ] 后端Controller写法模式
- [ ] 后端Service写法模式
- [ ] 后端Dao写法模式
- [ ] 后端Entity/DTO/VO写法模式
- [ ] MyBatis Dao.xml 写法模式
- [ ] 后端统一响应格式
- [ ] 后端异常处理模式
- [ ] 后端缓存使用模式
- [ ] 后端Dubbo RPC调用模式
- [ ] 后端Feign远程调用模式
- [ ] 后端定时任务模式
