# 全栈开发示例

> 本文件为骨架，需要后续从实际完成的开发案例中投喂补充。

---

## 一、已有需求文档

### 1.1 住院摆药按病区模式下增加床位位置（楼层）子节点过滤

来源：`ai_dev_space/住院摆药病人树.md`

**需求摘要：**
- 住院摆药页面"按病区"模式下，左侧树为扁平一级结构
- 需增加"床位位置"作为病区子节点，支持按楼层过滤

**涉及文件：**
| 层级 | 文件 |
|------|------|
| 前端页面 | `onelink-web-his-drug-fj-common/pages/hospatientDispensManage/hospitalDispens.vue` |
| 前端API | `onelink-web-his-drug-fj-common/api/charge-service/dispensing/inp/Dispensing.js` |
| 后端Controller | `onelink-micro-charge-fj-common` 下的 Controller |
| 后端Service | `onelink-micro-charge-fj-common` 下的 Service |
| 后端DAO | `onelink-micro-charge-fj-common` 下的 DAO |
| 后端Mapper | `onelink-micro-charge-fj-common` 下的 Dao.xml |
| 后端实体 | `onelink-micro-charge-fj-common` 下的 Pojo |

**涉及数据库表：**
- `DIC_DEPT_DICT`（科室字典）
- `DIC_BED_DICT`（床位字典）
- `DIC_BASIC_DICT`（基础字典，FLOOR_INDEX_DICT）
- `APP_INP_LAY_DRUG_POOL`（摆药池）
- `PAT_IN_HOSPITAL`（在院患者）

<!-- TODO: 待实际开发完成后，补充完整的前后端代码实现 -->

---

## 二、待投喂

以下内容需要后续补充：

- [ ] 上述需求的完整前后端代码实现
- [ ] 更多全栈开发案例
- [ ] 每个案例的：需求描述、涉及文件、数据库设计、代码实现、关键决策、踩坑记录
