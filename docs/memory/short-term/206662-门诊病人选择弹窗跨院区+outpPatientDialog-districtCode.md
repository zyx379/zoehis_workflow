# [206662] 门诊病人选择弹窗科室支持跨院区

> **文件名**：`206662-门诊病人选择弹窗跨院区+outpPatientDialog-districtCode.md`  
> **短期记忆**：需求进行中临时文件；Step 12 沉淀长期 case 后 **删除本文件**。  
> 日期：2026-07-08  
> 状态：`spec-confirmed`

---

## 需求摘要

- **任务类型**：功能改造
- **禅道 / 项目**：206662 / 漳州市医院
- **页面 / 菜单**：门诊医技治疗文书 → 「选择病人」弹窗（左侧门诊病人科室列表，右侧病人列表）

## 代码地图（Step 4 产出）

| 仓库 | 路径 | 角色（页面/API/Service/SQL） | 置信度 |
|------|------|------------------------------|--------|
| onelink-web-cis-common | `components/patient/outpPatientDialog.vue` | 门诊病人选择弹窗（左侧科室树 + 右侧病人列表）；读取页面参数；调用科室/病人接口 | 高 |
| onelink-web-cis-common | `api/webapi-service/sys/dept/DeptDict.js` | 前端科室字典 API 封装：`findListByPage` | 高 |
| onelink-web-cis-common | `api/pres-service/pres/Presctrl.js` | 前端历史病人 API 封装：`historicalPatient` | 高 |
| onelink-micro-optimus-fj-common | `DeptDictController.findListByPage` / `DeptDictService.findListByPage` / `DeptDictDao.xml` | 后端科室字典分页；`districtCode` 非空则按院区过滤 | 高 |
| onelink-micro-pres-fj-common | `PrescribeController.historicalPatient` / `PrescribeServiceImpl.historicalPatient` / `PrescribeRecordDao.xml` | 后端历史病人查询；`districtFlag='0'` 时忽略当前院区 | 高 |

### 调用关系（文字或箭头）

```
门诊医技治疗文书页面（或其他使用 outpPatientDialog 的页面）
  → outpPatientDialog.vue
    ├─ getOutDeptList()
    │   → DeptDict.findListByPage({ deptAttribute: 3, districtCode: 当前院区, ... })
    │     → DeptDictController.findListByPage
    │       → DeptDictService.findListByPage → DeptDictDao.xml
    │         → ZOEDICT.DIC_DEPT_DICT（ districtCode 非空则 and t.DISTRICT_CODE = ? ）
    └─ getOutHosGridData()
        → Presctrl.historicalPatient({ deptOrdoctor, deptOrdoctorFlag: '1', ... })
          → PrescribeController.historicalPatient
            → PrescribeServiceImpl.historicalPatient
              → 若 districtFlag='0' 则 districtCode=null，否则取 header 院区
              → PrescribeRecordDao.xml
```

## 需求分析要点

- **业务域**：门诊 / 读卡选病人 / 科室字典
- **参数体系（系统 / 页面 / 无）**：**页面参数**。`outpPatientDialog.vue` 已在 `mounted()` 中通过 `$getPageControlMap(configId)` 读取页面参数（现有 `dept_checkBox_flag`、`outLog_flag`），新增一个 flag 即可按菜单独立控制。
- **数据流（表、池表、流水）**：只读字典表 `ZOEDICT.DIC_DEPT_DICT` 与门诊就诊记录；无池表/流水写入。
- **参考 case**：
  - [202226](docs/memory/cases/202226-选择病人弹窗费单标识+onelinkPatientList-cis-common.md)：选择病人弹窗改点需在 **cis-common**。
  - [201533](docs/memory/cases/201533-住院非医疗收费不默认患者+nonMedicalCost-dept-patient-tree.md)：涉及 `dept-patient-tree` 的页面参数/默认行为。

## 记忆库命中（全部）

- [本地] docs/memory/cases/202226-选择病人弹窗费单标识+onelinkPatientList-cis-common.md — 禅道#202226 — 改读卡/选择病人前优先确认改点在 `cis-common` 的 `onelinkPatientList.vue`，避免改错 bundle。
- [本地] docs/memory/cases/201533-住院非医疗收费不默认患者+nonMedicalCost-dept-patient-tree.md — 禅道#201533 — 涉及科室病人树 `dept-patient-tree` 的默认选中行为，可复用「页面参数 vs 写死」的判断思路。
- [在线] 无命中。

## MCP 字段核验（按需）

- **已核对 `ZOEDICT.DIC_DEPT_DICT` 查询逻辑**：`findListByPage` 中 `<if test="params.districtCode != null and params.districtCode != ''"> and t.DISTRICT_CODE = #{params.districtCode} </if>`。若前端不传 `districtCode` 或传空字符串，SQL 不限制院区。
- **已核对 `historicalPatient` 跨院区能力**：`PrescribeServiceImpl.historicalPatient` 中 `if (YesOrNoEnum.noFlag.getStatus().equals(districtFlag)) { districtCode = null; }`，`noFlag.status = "0"`。前端传 `districtFlag: '0'` 即可忽略当前院区。
- **已核对 `districtName` 返回**：`DeptDictDao.xml` 的 `translate` 片段含 `(SELECT DICT.DISTRICT_NAME ... ) "districtName"`，`findListByPage` 已 join，前端可直接用于树节点后缀。
- 其他字段均从现有源码确认。

## 待确认问题（Step 4 遗留 → Step 5 已澄清）

| # | 问题 | 结论 |
|---|------|------|
| 1 | 参数名 `outp_patient_cross_district_flag` 是否可接受？ | ✅ **接受** |
| 2 | 页面参数 vs 系统参数？ | ✅ **页面参数**（与同组件 `dept_checkBox_flag` / `outLog_flag` 一致） |
| 3 | 触发弹窗的菜单 configId？ | ⚠️ **未确定**（运行时 `$getCurMenuCom().id`；运维在目标菜单下配置即可，无需改代码） |
| 4 | 跨院区时树节点是否显示院区后缀？ | ✅ **显示**（参考 `onelinkPatientList.vue` 的 `deptName(districtName)` 格式） |
| 5 | 跨院区时 `districtFlag: '0'` 传病人接口？ | ✅ **确认**（后端 `PrescribeServiceImpl.historicalPatient` 已实现） |

## Spec（Step 5 填写，确认后作为 Cursor 实现依据）

> 与本文档同一文件；**禁止**另建 spec 文件。子章节标题一律**中文**。

### 改造计划

**目标**：门诊病人选择弹窗（`outpPatientDialog.vue`）支持通过**页面参数**控制是否跨院区查询科室树与病人列表；默认行为不变（仍按当前登录院区过滤）。

**范围边界**：
- ✅ 仅改 `onelink-web-cis-common` 公共组件，**不改后端**（科室/病人接口已具备跨院区能力）。
- ✅ 参数开启后，所有引用 cis-common 版弹窗的菜单均生效（含收费 `feesList` / `feesListBatch` 等）。
- ✅ **同步改造**：`onelink-web-pres-fj-common/components/patientManage/outpPatientDialog.vue`（用户 spec 确认时要求同步）
- ❌ 不新增系统参数 jsonl（纯页面参数，无种子数据 commit）。

#### 涉及子仓库

- [x] onelink-web-cis-common：`outpPatientDialog.vue` 增加页面参数读取、条件传参、树节点院区后缀展示
- [x] onelink-web-pres-fj-common：`components/patientManage/outpPatientDialog.vue` 同步上述逻辑

#### 文件清单

| 仓库 | 路径 | 改动类型 |
|------|------|----------|
| onelink-web-cis-common | `components/patient/outpPatientDialog.vue` | 新增 `crossDistrictFlag`；`mounted` 读页面参数；`getOutDeptList` / `getOutHosGridData` 条件传参；`treeRender` 显示院区后缀 |
| onelink-web-pres-fj-common | `components/patientManage/outpPatientDialog.vue` | 同上（pres 本地副本同步） |

#### 数据库

| 表名 | 操作 | 说明（池表/主细/流水） |
|------|------|----------------------|
| 无 | — | 只读 `ZOEDICT.DIC_DEPT_DICT`（科室树）与门诊就诊记录（病人列表）；无写入 |

#### 参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `outp_patient_cross_district_flag` | **页面参数** | state=0（关闭） | state=1 时：科室树不传 `districtCode`；病人列表传 `districtFlag: '0'`；树节点显示 `deptName(districtName)` |

**运维配置方式**：
- configId = 打开弹窗时当前菜单的 `$getCurMenuCom().id`（组件内自动获取，与现有 `dept_checkBox_flag` 相同机制）。
- 目标菜单「门诊医技治疗文书」的 configId 需现场查菜单表确认后，在该 configId 下新增 key `outp_patient_cross_district_flag`，state=1。

#### 实现细节

**1. data 新增**

```javascript
crossDistrictFlag: false  // 页面参数 outp_patient_cross_district_flag，state=1 时为 true
```

**2. mounted() 读取页面参数**（与现有 flag 并列）

```javascript
this.crossDistrictFlag = !$.zoe.isNullOrEmpty(map[configId].outp_patient_cross_district_flag)
  && map[configId].outp_patient_cross_district_flag.state * 1 === 1
```

**3. getOutDeptList() 条件传参**

| crossDistrictFlag | districtCode 传参 |
|-------------------|-------------------|
| false（默认） | `this.$getDeptCom(window).districtCode`（保持现状） |
| true | 不传该字段（或传 `''`），SQL 不加院区过滤 |

**4. getOutHosGridData() 条件传参**

| crossDistrictFlag | districtFlag 传参 |
|-------------------|-------------------|
| false（默认） | 不传（后端取 header 院区） |
| true | `'0'`（后端 `districtCode = null`，跨院区查病人） |

**5. treeRender() 院区后缀**（仅 crossDistrictFlag=true 时）

参考 `onelinkPatientList.vue`：

```javascript
// crossDistrictFlag=true 且有 districtName 时
return `<span>${data.deptName}(${data.districtName})</span>`
// 否则保持原样 `<span>${data.deptName}</span>`
```

`districtName` 已由 `DeptDictDao.xml` 的 `translate` 片段返回，无需后端改动。

**6. 默认选中行为**

跨院区后科室树条目增多，仍默认选中第一条非根节点（与现状一致）；用户可通过关键字检索缩小范围。

#### 数据流变更

```
outpPatientDialog.vue（弹窗打开时）
  ├─ mounted()：
  │   configId = $getCurMenuCom().id
  │   → $getPageControlMap(configId)
  │   → 解析 crossDistrictFlag（outp_patient_cross_district_flag.state=1）
  │
  ├─ getOutDeptList()：
  │   DeptDict.findListByPage({ deptAttribute: 3, ... })
  │   ├─ crossDistrictFlag=false → districtCode = 当前院区
  │   └─ crossDistrictFlag=true  → 不传 districtCode → 返回全部院区科室
  │
  ├─ treeRender()：
  │   └─ crossDistrictFlag=true → 显示「科室名(院区名)」
  │
  └─ getOutHosGridData()：
      Presctrl.historicalPatient({ deptOrdoctor, deptOrdoctorFlag: '1', ... })
      ├─ crossDistrictFlag=false → 不传 districtFlag（header 院区过滤）
      └─ crossDistrictFlag=true  → districtFlag: '0'（忽略院区）
```

#### 测试计划

| 场景 | 参数 | 预期 |
|------|------|------|
| 参数关闭（默认） | state=0 或未配置 | 科室树/病人列表仅当前院区，树节点无院区后缀 |
| 参数开启 | state=1 | 科室树含多院区科室，节点显示 `科室(院区)`，病人列表含跨院区数据 |
| 关键字检索 | 开启 + 输入科室名 | 跨院区科室可被检索到 |
| 选中科室查病人 | 开启 + 选某院区科室 | 右侧病人列表正常加载 |
| 其他菜单未配参数 | 未配置 | 行为与改造前一致 |

#### 待确认问题

1. ~~参数名~~ → 已确认 `outp_patient_cross_district_flag`
2. ~~参数类型~~ → 已确认页面参数
3. **configId**：「门诊医技治疗文书」菜单 id 需运维/现场确认后配置（不阻塞开发）
4. ~~树节点院区后缀~~ → 已确认显示
5. ~~pres 本地副本是否需同步~~ → ✅ **已同步**（用户 spec 确认时要求）

## 外部编辑器交接（可选）

见文末「Cursor 交接块」。

## 人工审核意见（选填）

> Step 9 人工审查时由用户填写；有内容时 Step 6 须纳入改造范围。

（留空）
