# 创建 GitHub 开源仓库 zoehis_workflow 并推送（需先 gh auth login）
# 用法：在 fj-common 根目录 PowerShell 执行 .\scripts\publish-github.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "请先安装 GitHub CLI: https://cli.github.com/"
}

gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "请先登录 GitHub： gh auth login" -ForegroundColor Yellow
    exit 1
}

if (git remote get-url origin 2>$null) {
    Write-Host "已存在 origin：$(git remote get-url origin)"
} else {
    gh repo create zoehis_workflow `
        --public `
        --description "ZOEHIS Cursor AI workflow: rules, skills, memory for fj-common multi-repo workspace" `
        --source=. `
        --remote=origin `
        --push
    exit $LASTEXITCODE
}

# 已有远程时直接推送（仓库：https://github.com/zyx379/zoehis_workflow）
if (-not (git remote get-url origin 2>$null)) {
    git remote add origin https://github.com/zyx379/zoehis_workflow.git
}

git push -u origin master
Write-Host "完成: https://github.com/$(gh api user -q .login)/zoehis_workflow" -ForegroundColor Green
