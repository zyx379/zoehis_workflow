# [202510] 自助机取药凭证预览放大与备注
> **文件名**：`202510-自助机取药凭证预览放大+selfTakeDrug-preview-remark.md`


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

**第一轮**：仅放大外层容器与标题/备注，iframe 内票据仍默认比例。

**第二轮（反馈仍偏小）**：
- `enlargePreviewHtml` + `onPreviewIframeLoad`：注入 `zoom: 2`、字号 `1.2em`
- `self-service-container--preview`：预览区 flex 撑满，`card-slot--preview` 宽 `98vw`
- `previewScale: 2` 集中维护倍率

**共同**：
- 预览时给 `.card-slot` 加 `card-slot--preview`
- 预览标题、关闭按钮用 `clamp` 响应式字号
- `.preview-remark` 底部固定提示栏

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| Bill.getHtmlDocument | 只读 | 预览 HTML，未改 |
| SHOW_PATIENT_QUEUE | 只读 | 票据模板 businessId，未改 |

## 测试要点

- MCP 造数：无（纯 UI）
- 界面步骤：读卡/扫码触发预览 → 确认区域变大 → 确认底部备注文案 → 关闭预览恢复占位图

## 关联 commit

- `[202510]【漳州二院】将自助机取药凭证预览调大显示并增加备注提示`（两轮）
- tag：`release-1.166.43`（onelink-web-his-charge-fj-common，第二轮 cherry-pick 发布）

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

## 返工记录

### 2026-06-15 预览放大过大（二次返工）

- **反馈**：票据还是被放大太多；希望单独跑页面看效果
- **根因**：`f9433a20` 将 `onPreviewIframeLoad` 倍率硬编码为 2.5，且叠加 `body font-size: 16px` + 元素 `1.15em`，与 `zoom` 叠乘
- **修复**：`previewScale` 降为 1.3；`onPreviewIframeLoad` 仅 `html { zoom }` + `body { margin: 0 }`，去掉字号叠加
- **验证路径**：`/charge/prePayManage/selfTakeDrug`（白名单，可独立 dev 访问）
- **交付**：tag `release-1.166.47`（`previewScale: 1.3`）
