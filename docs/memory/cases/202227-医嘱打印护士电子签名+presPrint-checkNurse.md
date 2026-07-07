# [202227] 医嘱打印护士电子签名
> **文件名**：`202227-医嘱打印护士电子签名+presPrint-checkNurse.md`


> 状态：`verified`  
> 日期：2026-06-06  
> 域：住院 / 医嘱

---

## 背景

- **需求**：【漳州市医院】医嘱打印（长期、临时）护士列与医生一样显示电子签章
- **页面/菜单**：护理医嘱 → 医嘱打印 `/presManage/presPrint`
- **仓库**：`onelink-web-pres-fj-common`、`onelink-micro-pres-fj-common`
- **文件**：`mixin/pagePresPrintMixin.js`、`InpPresPrintServiceImpl.java`

## 问题 / 目标

长期医嘱「执行护士」列绑定 `execOperatorName` 时，前端只取 `firstExecNurseCode` 设签章 `id`；长期医嘱通常仅有 `checkNurseCode`（校对护士），导致护士列只显示姓名、无签章图。医生列 `presDoctor` 在分支外统一处理故正常。

## 根因与正确做法

1. **前端 LiuZhouShiRmyy**：`checkNurse`/`checkNurseName` 与 `presDoctor` 同级提前写入 `id`；长期 `execOperatorName` 在 `firstExecNurseCode` 为空时回退 `checkNurseCode`。
2. **前端 Pizhou（default）**：补 `hasSignStaff` 参数及护士/停嘱护士签章 `id`（release 分支参数顺序为 `skinTestDisplayNoBrackets` 首位）。
3. **后端 getPresPrintRecord**：长期打印中 `checkNurse` 在 `saveValueAndId` 后被 `staffInfoPicList` 逻辑覆盖为纯文本，应删除二次覆盖。
4. **前置条件**：页面参数 `show_ca_sign_picture=1`；`StaffSignaturePicture.getCaSignPicture` 能取到护士签章图。

## 涉及表 / 接口

| 表/接口 | 操作 | 说明 |
|---------|------|------|
| StaffSignaturePicture.getCaSignPicture | 读 | 员工签章图 base64 |
| Print.getPrintPresLongList / getPrintPresTempList | 读 | 含 checkNurseCode 等 |
| InpPresPrintServiceImpl.getPresPrintRecord | 读 | 服务端打印（可选路径） |

## 测试要点

- 长期/临时医嘱预览与打印：执行护士/校对护士列显示签章图
- 「查看签名」含住院校对类记录
- release 与 master 参数顺序：`$packageTemplateDataProject(skinTestDisplayNoBrackets, ...)`

## 关联 commit

- `[202227]【漳州市医院】医嘱打印护理显示电子签名（长期、临时）`

## 可复用结论

- 医嘱打印签章：`value` + `id`（staffNo）+ `signatureImage` 三件套；字段必须与票据模板绑定列一致。
- 长期医嘱护士优先 `checkNurseCode`，勿假定 `firstExecNurseCode` 必有值。
- release-1.168 与 master 差异大时用 **cherry-pick** 单 commit，勿全量 merge。

## 升格建议

- [ ] workflow
- [ ] skill / patterns
- [ ] rule
- [x] 无需升格，保留 case 即可

**说明**：单点打印签章逻辑，case 检索即可。
