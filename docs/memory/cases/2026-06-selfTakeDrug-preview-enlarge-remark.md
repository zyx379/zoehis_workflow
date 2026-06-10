# [202510] 自助机取药凭证预览放大与备注

> 状态：`verified`  
> 日期：2026-06-10  
> 域：收费 / 自助取药

---

## 背景

- **需求**：自助机取药凭证预览调大显示，底部增加备注「无需取票，请核对姓名和取票号，等待叫名字即可」
- **页面/菜单**：自助取药（selfTakeDrug）
- **仓库**：`onelink-web-his-charge-fj-common`
- **文件**：`pages/charge/prePayManage/selfTakeDrug.vue`

## 问题 / 目标

预览区域原尺寸偏小（`max-width: 850px`、`height: 60vh`），标题 14px，自助机屏幕阅读不便；无取票提示文案。

## 根因与正确做法

纯 UI 改造，预览由 `loadPreviewContent` → `getHtmlDocument` 加载票据 HTML 到 iframe，不涉及后端。

- 预览时给 `.card-slot` 加 `card-slot--preview`：`95vw` / `72vh`
- 预览标题、关闭按钮用 `clamp` 响应式字号
- 在 `.preview-content` 下方新增 `.preview-remark` 固定栏（`flex-shrink: 0`），样式与顶部 alert 一致

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| Bill.getHtmlDocument | 只读 | 预览 HTML，未改 |
| SHOW_PATIENT_QUEUE | 只读 | 票据模板 businessId，未改 |

## 测试要点

- MCP 造数：无（纯 UI）
- 界面步骤：读卡/扫码触发预览 → 确认区域变大 → 确认底部备注文案 → 关闭预览恢复占位图

## 关联 commit

- `[202510]【漳州二院】将自助机取药凭证预览调大显示并增加备注提示`
- tag：`release-1.166.41`（onelink-web-his-charge-fj-common）

## 可复用结论

- 自助机 kiosk 页面字号/容器优先用 `clamp` + `vh/vw`，避免固定 px
- 预览容器内 iframe 下方加说明栏时，父级用 `flex-direction: column`，备注 `flex-shrink: 0`
- release 分支全量 merge 易冲突时，对单 commit 用 `cherry-pick`

## 升格建议

- [ ] workflow
- [ ] skill / patterns
- [ ] rule
- [x] 无需升格，保留 case 即可

**说明**：常规前端 UI 微调，无新业务模式。
