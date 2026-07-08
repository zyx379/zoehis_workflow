# Link dev/rules, dev/skills into .cursor/; sync MCP config from dev/mcp/.
# After clone/pull, run from repo root: .\scripts\link-cursor-dev.ps1

param(
    [string]$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'
Set-Location $WorkspaceRoot

$links = @(
    @{ Name = 'rules';  Source = 'dev\rules' },
    @{ Name = 'skills'; Source = 'dev\skills' }
)

foreach ($link in $links) {
    $cursorPath = Join-Path '.cursor' $link.Name
    $targetPath = Join-Path $WorkspaceRoot $link.Source

    if (-not (Test-Path $targetPath)) {
        throw "Source not found: $targetPath"
    }

    if (Test-Path $cursorPath) {
        $item = Get-Item $cursorPath -Force
        if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
            Write-Host "Link exists, skip: $cursorPath"
            continue
        }
        throw "Path exists and is not a link: $cursorPath"
    }

    New-Item -ItemType Junction -Path $cursorPath -Target $targetPath | Out-Null
    Write-Host "Created: $cursorPath -> $targetPath"
}

$mcpExample = Join-Path $WorkspaceRoot 'dev\mcp\mcp.json.example'
$mcpTarget = Join-Path $WorkspaceRoot '.cursor\mcp.json'
if (Test-Path $mcpExample) {
    if (-not (Test-Path $mcpTarget)) {
        Copy-Item $mcpExample $mcpTarget
        Write-Host "Created: .cursor/mcp.json from dev/mcp/mcp.json.example"
    } else {
        Write-Host "Skip: .cursor/mcp.json already exists (merge dev/mcp/mcp.json.example manually if needed)"
    }
} else {
    Write-Host "Skip: dev/mcp/mcp.json.example not found"
}

Write-Host "Done. Cursor loads rules/skills from .cursor/ (junction to dev/)."
