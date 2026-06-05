# GitHub 推送失败排查（国内网络）

仓库：[zyx379/zoehis_workflow](https://github.com/zyx379/zoehis_workflow)

## 现象

```text
fatal: unable to access 'https://github.com/zyx379/zoehis_workflow.git/':
Failed to connect to github.com port 443 ... Could not connect to server
```

**原因：** 本机到 `github.com:443` 的 HTTPS 被墙或公司网络拦截；**不是**仓库地址错误。

---

## 方案 A：SSH 走 443 端口（推荐，已在本机预配）

GitHub 提供 `ssh.github.com:443`，多数网络下比 HTTPS 更稳定。

### 1. SSH 配置（`~/.ssh/config`）

```sshconfig
Host github.com
  Hostname ssh.github.com
  Port 443
  User git
```

### 2. 生成密钥（若无）

```powershell
ssh-keygen -t ed25519 -C "你的邮箱" -f $env:USERPROFILE\.ssh\id_ed25519
```

### 3. 公钥添加到 GitHub

复制 `id_ed25519.pub` 内容 → [GitHub SSH Keys](https://github.com/settings/keys) → New SSH key

### 4. 改远程并推送

```powershell
cd d:\zoe_work_space\fj-common
git remote set-url origin git@github.com:zyx379/zoehis_workflow.git
ssh -T git@github.com          # 首次：输入 yes，应看到 Hi zyx379!
git push -u origin master
```

---

## 方案 B：HTTPS + 本地代理（Clash / V2Ray）

若已开代理（常见端口 `7890`）：

```powershell
git config --global http.https://github.com.proxy http://127.0.0.1:7890
git config --global https.https://github.com.proxy http://127.0.0.1:7890

git remote set-url origin https://github.com/zyx379/zoehis_workflow.git
git push -u origin master
```

取消代理：

```powershell
git config --global --unset http.https://github.com.proxy
git config --global --unset https.https://github.com.proxy
```

---

## 方案 C：换网络

手机热点 / 家用宽带再试 `git push`。

---

## 验证

```powershell
# HTTPS 是否通
Test-NetConnection github.com -Port 443

# SSH 443 是否通（方案 A）
Test-NetConnection ssh.github.com -Port 443
```

---

*远程地址二选一即可：*

- HTTPS：`https://github.com/zyx379/zoehis_workflow.git`
- SSH：`git@github.com:zyx379/zoehis_workflow.git`（配合上方 config）
