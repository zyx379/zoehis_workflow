# [202857] 手术申请知情同意书模板多类别校验

> 状态：`verified`  
> 日期：2026-06-12  
> 域：住院 / 手术申请

---

## 背景

- **需求**：系统参数 `operat_apply_check_catalog_id` 第一段（知情同意书类别）支持维护多个模板 ID，校验时任一满足即可
- **页面/菜单**：住院医嘱 → 手术申请
- **仓库**：`onelink-web-pres-fj-common`
- **文件**：`components/presManage/operationApplication.vue`

## 问题 / 目标

参数值如 `1206,1209;` 时，原逻辑将 `1206,1209` 整串作为单个 `catalogId` 传给 EMR 接口 `getPatEmrListByCatalogId`，导致校验失败。

## 根因与正确做法

**根因**：`catalogIdArr[0]` 未按逗号拆分，只支持单 ID。

**参数格式**（代码已约定）：
- `;` 分段：第 1 段 = 知情同意书类别，第 2 段 = 术前小结类别（可选）
- 第 1 段内 `,` 分隔多个知情同意书类别 ID

**修复**：循环调用 `getPatEmrListByCatalogId`，任一返回 `res.length >= operationTimes` 即 `consentsFlag = 1`。

```js
const consentCatalogIds = (this.catalogIdArr[0] || '')
  .split(',').map(s => s.trim()).filter(Boolean)
for (const catalogId of consentCatalogIds) {
  const res = await this.$api.EmrAdapter.callUnifiedInterface({ ... catalogId ... })
  if (res.length >= Number(obj.operationTimes)) {
    consentsFlag = 1
    break
  }
}
```

## 涉及表 / 接口

| 接口 | 说明 |
|------|------|
| `getPatEmrListByCatalogId`（EMR 第三方） | 按单个 catalogId 查患者文书；fj-common 无后端改动 |
| 系统参数 `operat_apply_check_catalog_id` | 运维改值即可，无需 jsonl |

## 测试要点

1. `1209;` 单 ID 回归
2. `1206,1209;` 仅有 1209 文书 → 通过
3. `1206,1209;` 均无 → 弹窗拦截
4. `1206,1209;1300` 术前小结逻辑不变

## 关联 commit / tag

- `[202857]【漳州二院】手术申请知情同意书模板支持多类别校验`
- Tag：`release-1.166.25`（`onelink-web-pres-fj-common`）

## 可复用结论

- 手术申请文书校验在 **`onelink-web-pres-fj-common/operationApplication.vue`**，非后端 Service；Trae 指向 cis-common `OPERATION_AGREE_CLASS_CODE` 为误定位
- `operat_apply_check_catalog_id`：`;` 分知情同意/术前小结，知情同意段内 `,` 分多类别
- 多 catalogId 场景：前端多次调 EMR 接口，无需改 `ETPL_TEMPLATE_CLASS` SQL
