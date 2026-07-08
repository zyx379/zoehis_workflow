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

### 1.5 系统参数 jsonl 单独提交模式

```
约束：
- 功能代码与 *BizSysParam.jsonl 分两个 commit
- 参数 commit 标题：`[*111111*]增加系统参数【paramEnglishName】【禅道号】`（`[*111111*]` 固定，勿写真实禅道号）
- creatorName / checkerName / creatorCode = 需求负责人（**本工作区默认 `zhouyanxi`**；禁止 `zoehis-ai`）

master 顺序：
  1. push 功能 commit
  2. push 参数 commit

项目分支：
  - 功能：cherry-pick 功能 commit
  - 参数：cherry-pick 参数 commit（或与 release 参数批量 merge，jsonl 保留双方行）
```

### 1.6 退药新开单有效期模式（来源：202238）

```
表：APP_RETURN_DRUG_MASTER（RETURN_DRUG_STATUS_CODE=0 新开，APPLY_TIME 开单时间）
参数：return_drug_new_valid_hours（0/空=不限制）
实现：SQL 列表过滤 + returnInpRefund 执行前 checkReturnDrugNewApplyValid
异常：RETURN_DRUG_NEW_APPLY_EXPIRED (10010)
```

### 1.7 页面参数模式（来源：202235）

```
模式：data 声明 → $getPageControlMap 回调赋值 → 使用处三元条件
适用：单页面开关/默认值控制（非跨页面共享配置）
步骤：
  1. data() 声明变量（如 operDateDefaultEmptyFlag: null）
  2. $getPageControlMap(configId) 回调中读取 key
  3. 使用处用三元条件：flag ? '' : defaultValue
关键区分：
  - 系统参数 $getSysParamList → 全局配置、后端 SQL 联动
  - 页面参数 $getPageControlMap(configId) → 单页面行为控制
页面参数 key 命名：snake_case（如 oper_date_default_empty）
```

### 1.8 费用审核/结算操作人分离模式（来源：201737）

```
场景：同一 SQL 同时维护业务标志与操作人
原则：
  - 结算/冲销/取消锁定 → 只改标志（如 FEE_AUDIT_FLAG），operator 传 null
  - 手工审核 → 同时更新标志和操作人（operator 传真实值）
涉及表：PAT_IN_HOSPITAL、PAT_ADMISSION_RECORD
实现：MyBatis SQL 中 operator 非空时才更新 FEE_AUDIT_OPERATOR
    <if test="operator != null and operator != ''">
      FEE_AUDIT_OPERATOR = #{operator}
    </if>
```

### 1.9 配药池释放库存跳过有效期模式（来源：202505）

```
页面：onelink-web-his-drug-fj-common/pages/stockBillManage/storeQuery/index.vue
API：Store.js::releaseOutpDrugStore / getLayPoolInfo
后端：DrugStoreServiceImpl.releaseOutpDrugStore
SQL：BackPackageManageDao.findInvalidOutpLayDrugPoolsByApplys
表：APP_OUTP_LAY_DRUG_POOL（VALID_END_TIME、LAY_DRUG_STATUS_CODE）
参数：release_stock_skip_valid_check（0/空=不跳过，1=跳过 VALID_END_TIME 条件）
异常：BILL_STATUS_NO_NEW_OR_NO_VALIDITY（单据还未过有效期）
实现：系统参数 + SQL 条件分支（无列表过滤，仅执行入口）
定位技巧：Codegraph 搜方法名 releaseOutpDrugStore 比搜中文「配药池」更准
```

### 1.10 读卡「选择病人」双标识模式（来源：202226）

```
场景：单病种「单」+ 费用审核「费」需并排；审核后只见「费」
先定仓库（Step 2 必做）：
  charge 页面多数：
    import onelinkReadCardStrip from '@zoesoft.com.cn/onelink-web-cis-common/.../onelinkReadCardStrip.vue'
    → onelinkPatientList.vue（onelink-web-cis-common）← 主改点
  少数旧页：
    AllCommonBusiness.umd.min.js → YSK/DaLian patientList（charge 仓 static/plugins）

cis-common 根因（高频）：
  onelinkPatientList.vue 使用 v-else-if(diseaseCode)，与 feeAuditFlag 互斥
改法：两处 td_auditFlag 模板改为独立 v-if + icon_patient_audit_wrap

bundle 路径根因（次路径）：
  YSK HTML 表 td 列宽 + overflow:hidden 裁切（非 v-else-if）
  dalian：zoehis-table itemWidth ≥52px

排查顺序：页面 import 链 → v-if/v-else-if → 列宽/overflow
发布：cis-common 与 charge 可能分仓打包，改 cis 后需确认 charge 依赖版本
```

---

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
