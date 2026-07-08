param(
    [string]$WorkspaceRoot = (Resolve-Path "$PSScriptRoot\..\..\..\.."),
    [string]$Author = ((git config user.name 2>$null) -replace "\r|\n", "").Trim()
)

$repos = @(
    @{ Name = "门诊前端"; Path = "onelink-web-outp-fj-common" },
    @{ Name = "医嘱前端"; Path = "onelink-web-pres-fj-common" },
    @{ Name = "收费前端"; Path = "onelink-web-his-charge-fj-common" },
    @{ Name = "药库前端"; Path = "onelink-web-his-drug-fj-common" },
    @{ Name = "公共组件"; Path = "onelink-web-his-fj-component" },
    @{ Name = "医嘱后端"; Path = "onelink-micro-pres-fj-common" },
    @{ Name = "收费服务"; Path = "onelink-micro-charge-fj-common" },
    @{ Name = "基础服务"; Path = "onelink-micro-optimus-fj-common" },
    @{ Name = "医保服务"; Path = "onelink-micro-insurance-fj-ybcommon" }
)

$allCommits = @()

foreach ($repo in $repos) {
    $repoPath = Join-Path $WorkspaceRoot $repo.Path
    if (-not (Test-Path $repoPath)) { continue }
    if (-not (Test-Path (Join-Path $repoPath ".git"))) { continue }

    $gitArgs = @('-C', $repoPath, 'log', '--since=midnight', "--format=%h|%s", '--no-merges')
    if ($Author) { $gitArgs += @('--author', $Author) }

    $output = & git @gitArgs 2>$null
    if (-not $output) { continue }

    foreach ($line in $output) {
        $parts = $line.Split("|", 2)
        if ($parts.Length -lt 2) { continue }
        $allCommits += [PSCustomObject]@{
            RepoShort = $repo.Name
            Hash = $parts[0].Trim()
            Subject = $parts[1].Trim()
        }
    }
}

if ($allCommits.Count -eq 0) {
    Write-Host "今天暂无 Git 提交记录。" -ForegroundColor Yellow
    exit 0
}

$items = @{}
foreach ($c in $allCommits) {
    $subject = $c.Subject
    if ($subject -match '^\[(.+?)\]【(.+?)】(.+)$') {
        $project = $matches[2]
        $title = $matches[3].Trim()
        $key = $project + "|" + $title
    } else {
        $project = "其他"
        $title = $subject
        $key = $title
    }
    if (-not $items.ContainsKey($key)) {
        $items[$key] = [PSCustomObject]@{
            Project = $project
            Title = $title
            Repos = [System.Collections.Generic.HashSet[string]]::new()
        }
    }
    $items[$key].Repos.Add($c.RepoShort) | Out-Null
}

Write-Host ""
Write-Host "========== 今日工作日报 ==========" -ForegroundColor Cyan
Write-Host ""
$index = 1
foreach ($entry in $items.Values) {
    $repoList = ($entry.Repos -as [string[]]) -join "、"
    if ($entry.Project -eq "其他") {
        Write-Host "$index、$($entry.Title)（涉及：$repoList）"
    } else {
        Write-Host "$index、【$($entry.Project)】$($entry.Title)（涉及：$repoList）"
    }
    $index++
}
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
