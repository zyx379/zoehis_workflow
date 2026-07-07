# [203177] 摆药单明细回退连带无需提药项目
> **文件名**：`203177-摆药回退连带无需提药+docOderQuery-oneSelfDrugFlag.md`


## 基本信息

| 字段 | 值 |
|------|-----|
| 禅道号 | 203177 |
| 项目 | 漳州市医院 |
| 域 | 住院医嘱 / 摆药单回退 |
| Tag | `onelink-web-pres-fj-common` → `release-1.168.36` |

## 需求摘要

医嘱处理 → 摆药单明细 tab 点「回退」时，除当前行外，一并回退同 **presNo（医嘱号）**、同 **applyTime**、且 **oneSelfDrugFlag==2（无需提药）** 的行。

## 实现要点

1. **前端** `docOderQuery.vue`：`getLayDrugReturnTogetherRows` 筛选连带行，按 `applyNo` 去重；多行走 `batchBackResiLayOrBill`。
2. **API** 须在 **pres 仓本地** `api/pres-service/pres/Query.js` 增加 `batchBackResiLayOrBill`（勿只改 cis-common，pres 仓有独立 API 文件）。
3. **后端** 已有 `PrescribeQueryController.batchBackResiLayOrBill`，无需改后端。
4. 仅 `type==1` 且 `activeMenu==1`（摆药单明细）生效；作废、单据明细逻辑不变。

## 发布注意

- `release-1.168` 全量 merge master 易冲突，用 **cherry-pick** 功能 commit。
- cis-common 无 `release-1.168` 分支，仅 push master 即可。

## 涉及文件

- `onelink-web-pres-fj-common/components/presManage/docOderQuery.vue`
- `onelink-web-pres-fj-common/api/pres-service/pres/Query.js`
- `onelink-web-cis-common/api/pres-service/pres/Query.js`（公共 API 同步）
