# [194551] release-1.166 编译失败排查与分支回退
> **文件名**：`194551-release166编译失败分支回退+SettleRateTypeCheckParam-cherry-pick.md`


> 状态：`verified`  
> 日期：2026-07-02 ~ 2026-07-04  
> 域：Git 交付 / CI / 收费 charge + 基础 optimus

---

## 背景

漳州二院 **release-1.166** 在合并 **core 包升级**（`onelink.version` 1.0.14 → 1.0.18-SNAPSHOT）及 **[194551] 单据号 Long 改造** 后，GitLab CI 连续编译失败。多轮修复后仍出现 api/pojo/service 跨模块符号缺失，最终 **将 charge `release-1.166` 硬重置到 `e75c516eb5`（204348 后端 commit）**，打 tag **release-1.166.156** 恢复可编译基线。

## 时间线与 tag

| Tag | Commit | 说明 |
|-----|--------|------|
| .152 | `7a7fd05112` | cherry-pick 冲突语法修复（后被覆盖） |
| .153 | `4fdc4b36da` | 回退 master 独有依赖 + 补 `JedisIdempotentUtils` |
| .154 | `089d4a2e7b` | 194551 **377 文件**全量 sync master |
| .155 | `54745b8d4a` | 补 `SettleRateTypeCheckParam` pojo（仍可能有后续错误） |
| **.156** | **`e75c516eb5`** | **回退到 204348 稳定点**（放弃 core 升级 + 194551 系列） |

## 失败模式与根因

### 1. charge 有调用、optimus release 无 API

- **现象**：`getOutpInsurEventNo()`、`StaffDao.insertThirdSpecdiseasePrivileges` 等找不到符号
- **根因**：charge release cherry-pick 了 master 调用方，optimus release 尚未 merge 对应 Dao/实体
- **教训**：跨仓改造须 **charge + optimus release 同步** cherry-pick 或 merge，不能单仓先行

### 2. 部分 cherry-pick 194551（`-X theirs`）

- **现象**：271 文件冲突后语法破坏（`finally` without `try`、lambda 内混入 `else`）
- **根因**：release 与 master 分叉过大，部分文件 cherry-pick 产生不可编译合并结果
- **教训**：**禁止**对大改造用 `-X theirs` 部分 cherry-pick；要么整 commit 链，要么整目录从已知 good baseline 替换

### 3. 从 master 整文件恢复 → 引入 release 不存在依赖

- **现象**：`JedisIdempotentUtils`、`ShareChineseMedicineService`、`DruOneCodePassInMiddleDao` 等 master 独有类
- **根因**：单文件 checkout master 时带入 master 独有 import/调用
- **正确做法**：以 **release 当前 good commit**（如 `fca843f474`）为基线，仅按需补 **最小依赖文件**

### 4. 377 文件全量 sync master（194551）

- **现象**：BillDeduct / OutpApplySheet Long 类型仍报错；后又缺 `SettleRateTypeCheckParam`
- **根因**：
  - sync 范围是 194551 改造文件集，**不含**其他 master 已合入的关联 pojo（如 `[187183]` 的 `SettleRateTypeCheckParam`，commit `00ff130328`）
  - api 引用了 pojo 类，但 pojo 模块未同步 → `onelink-micro-charge-api` 编译失败
- **教训**：全量 sync 后须 **按编译错误补漏**，或 sync 前列出 **api 引用的全部 pojo/param 类** 做存在性校验

### 5. 最终决策：重置到已知 good commit

- **操作**：`git reset --hard e75c516eb5` + `git push --force-with-lease origin release-1.166` + tag `.156`
- **效果**：`onelink.version` 回到 **1.0.14-SNAPSHOT**；无 194551 Long 改造；CI 基于稳定功能点编译
- **代价**：core 1.0.18 升级与 194551 需 **另起计划**单独交付

## 排查命令（可复用）

```bash
# release 上某文件是否存在
git cat-file -e release-1.166:path/to/File.java && echo OK || echo MISSING

# 某类首次引入 commit
git log master --oneline -- "**/SettleRateTypeCheckParam*"

# reset 将丢弃的 commit 列表
git log e75c516..origin/release-1.166 --oneline
```

## 若再次交付 core 升级 / 194551

1. **optimus release 先** merge/cherry-pick 到与 master 调用方一致
2. **194551** 用 master 上 **完整 commit 链** cherry-pick，或 charge+optimus **同批次** sync
3. sync 后本地或 CI 全模块 `mvn compile`；api 报 `cannot find symbol` → 查 pojo 是否漏文件
4. **不要**在 release 上 `-X theirs` 部分解决大冲突
5. 若多轮仍失败：**回退到上一个 green tag**，分需求小步 cherry-pick

## 涉及仓库

| 仓库 | 分支 | 最终 HEAD |
|------|------|-----------|
| onelink-micro-charge-fj-common | release-1.166 | `e75c516eb5`（tag .156） |
| onelink-micro-optimus-fj-common | release-1.166 | （未随 charge 回退；注意跨仓版本匹配） |

> **注意**：charge 回退后 optimus release 若仍含较新 API，需确认 **依赖版本与接口** 仍与 charge `e75c516` 兼容；不兼容时 optimus 也需回退或 charge 单独对齐。

## 可复用结论

- release 落后 master 上千 commit 时，**全量 merge master 不可行**；应 **按 commit cherry-pick** 或 **reset 到 green tag**
- 跨模块编译错误 `cannot find symbol` in **api** → 优先查 **pojo 是否缺类**
- 大改造（类型变更 Integer→Long）必须 **charge + optimus 同步**，且关联 pojo/param 一并带入
- 修复多轮仍连锁失败 → **reset 到业务已验证 commit** 比继续 patch 更可靠

## 升格建议

- [ ] workflow — 可在 Step 10 增加「release 大改造失败回退」检查项
- [x] skill — 建议增补 `zoehis-git-ops` patterns：release 滞后 master 时的 cherry-pick/sync 边界
- [ ] rule
- [x] 保留 case 供 Agent Step 4 检索
