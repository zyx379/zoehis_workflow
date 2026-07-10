param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('rescan', 'sync')]
    [string]$Action
)

$ErrorActionPreference = 'Stop'

# Workspace root: dev/skills/zoehis-git-ops -> up 3 levels = fj-common
$skillDir      = $PSScriptRoot
$workspaceRoot = (Resolve-Path (Join-Path $skillDir '..\..\..')).Path
$manifestPath  = Join-Path $skillDir 'repos-manifest.json'

function Get-OriginUrl {
    param([string]$repoDir)
    $configPath = Join-Path $repoDir '.git\config'
    if (-not (Test-Path $configPath)) { return $null }
    $inOrigin = $false
    foreach ($line in (Get-Content $configPath)) {
        if ($line -match '\[remote\s+"origin"\]') { $inOrigin = $true; continue }
        if ($line -match '^\[') { $inOrigin = $false }
        if ($inOrigin -and $line -match '^\s*url\s*=\s*(.+)') {
            return $Matches[1].Trim()
        }
    }
    return $null
}

switch ($Action) {
    'rescan' {
        # Re-memory: scan all subdirs under workspace that contain .git, record name + origin URL
        $repos = @()
        foreach ($d in (Get-ChildItem -Path $workspaceRoot -Directory)) {
            if (Test-Path (Join-Path $d.FullName '.git')) {
                $repos += [PSCustomObject]@{
                    name = $d.Name
                    url  = Get-OriginUrl $d.FullName
                }
            }
        }
        $repos | ConvertTo-Json -Depth 3 | Set-Content -Path $manifestPath -Encoding UTF8
        Write-Host '[rescan] remembered' $repos.Count 'repos ->' $manifestPath
        foreach ($r in $repos) {
            Write-Host '  -' $r.name $r.url
        }
    }

    'sync' {
        # Sync: read manifest, auto git clone any repo missing locally
        if (-not (Test-Path $manifestPath)) {
            Write-Host '[sync] manifest missing, run rescan first...'
            & $PSCommandPath -Action rescan
        }
        $repos   = Get-Content $manifestPath -Encoding UTF8 | ConvertFrom-Json
        $cloned  = 0
        $skipped = 0
        foreach ($r in $repos) {
            $target = Join-Path $workspaceRoot $r.name
            if (Test-Path $target) {
                Write-Host '[sync] exists:' $r.name '(skip)'
                $skipped++
                continue
            }
            if (-not $r.url) {
                Write-Warning ('[sync] repo ' + $r.name + ' has no clone URL, skip')
                continue
            }
            Write-Host '[sync] missing, cloning:' $r.name '->' $r.url
            git -C $workspaceRoot clone $r.url $r.name
            $cloned++
        }
        Write-Host '[sync] done: cloned' $cloned ', already exist' $skipped
    }
}
