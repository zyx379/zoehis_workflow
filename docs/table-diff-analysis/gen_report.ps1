$outputDir = 'D:\zoe_work_space\fj-common\docs\table-diff-analysis'

# Load table comments
$tableComments = @{}
Get-Content ($outputDir + '\table_comments.txt') -Encoding UTF8 | ForEach-Object {
    $idx = $_.IndexOf('|')
    if ($idx -gt 0) {
        $key = $_.Substring(0, $idx)
        $val = $_.Substring($idx + 1)
        $tableComments[$key] = $val
    }
}
Write-Host "Loaded comments: $($tableComments.Count)"

# Load old/new tables from previous scan
$pattern = '(?i)(?:FROM|JOIN|INTO|UPDATE|TABLE)\s+([A-Z0-9_]+\.[A-Z0-9_]+|[A-Z0-9_]+)'

$oldBase = 'D:\zoe_work_space\旧架构日常需求\fj-fd\zoe-optimus-fj-fd'
$stackBase = 'D:\zoe_work_space\政策性&共性改造集成专用\zoe-optimus-service-stack'
$newDirs = @(
    'D:\zoe_work_space\fj-common\onelink-micro-charge-fj-common',
    'D:\zoe_work_space\fj-common\onelink-micro-optimus-fj-common',
    'D:\zoe_work_space\fj-common\onelink-micro-pres-fj-common'
)

function AddTables($dir, $tableHash) {
    $files = Get-ChildItem -Path $dir -Filter '*.xml' -Recurse | Where-Object { $_.FullName -match 'mappings[/\\]' -and $_.FullName -notmatch 'target[/\\]' }
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $matches = [regex]::Matches($content, $pattern)
        foreach ($m in $matches) {
            $full = $m.Groups[1].Value.Trim().ToUpper()
            $tableName = ($full -split '\.')[-1]
            if ($tableName -match '^[A-Z][A-Z0-9_]*$' -and $tableName.Length -gt 3) {
                if (-not $tableHash.ContainsKey($tableName)) { $tableHash[$tableName] = @{ Count = 0; Schemas = @() } }
                $tableHash[$tableName].Count++
                if ($full -match '\.' -and $tableHash[$tableName].Schemas -notcontains $full) { $tableHash[$tableName].Schemas += $full }
            }
        }
    }
}

$oldTables = @{}
AddTables $oldBase $oldTables
AddTables $stackBase $oldTables

$newTables = @{}
foreach ($d in $newDirs) { AddTables $d $newTables }

Write-Host "Old tables: $($oldTables.Count)"
Write-Host "New tables: $($newTables.Count)"

$sqlKeywords = @('MAIN','DUAL','SYSDATE','ERR_MSG','TARGET_EVENTS','DEPT_DICT','DOCTOR_DICT','ORDER','MATERIAL_STORE_RECORD')
$onlyInNew = $newTables.Keys | Where-Object { -not $oldTables.ContainsKey($_) -and $sqlKeywords -notcontains $_ }
$onlyInOld = $oldTables.Keys | Where-Object { -not $newTables.ContainsKey($_) -and $sqlKeywords -notcontains $_ }

Write-Host "Only in new: $($onlyInNew.Count)"
Write-Host "Only in old: $($onlyInOld.Count)"

# Generate report
$report = ''
$report += "================================================================`r`n"
$report += "     Old vs New Architecture Table Diff Report (with comments)`r`n"
$report += "================================================================`r`n"
$report += "`r`n"
$report += "Old: zoe-optimus-fj-fd + zoe-optimus-service-stack`r`n"
$report += "New: onelink-micro-charge-fj-common + onelink-micro-optimus-fj-common + onelink-micro-pres-fj-common`r`n"
$report += "`r`n"
$report += "Old tables: $($oldTables.Count)`r`n"
$report += "New tables: $($newTables.Count)`r`n"
$report += "`r`n"

$report += "================================================================`r`n"
$report += "1. Only in NEW (old not used, new used): $($onlyInNew.Count) tables`r`n"
$report += "   Sorted by frequency descending`r`n"
$report += "================================================================`r`n"
$report += "Freq`tSchema.Table`tComment`r`n"
$report += "----`t-----------`t-------`r`n"

$onlyInNew | Sort-Object { $newTables[$_].Count } -Descending | ForEach-Object {
    $schemas = ($newTables[$_].Schemas -join ', ')
    $schemaStr = if($schemas) { $schemas } else { $_ }
    $comment = if ($tableComments[$_]) { $tableComments[$_] } else { '' }
    $report += "$($newTables[$_].Count)`t$schemaStr`t$comment`r`n"
}

$report += "`r`n"
$report += "================================================================`r`n"
$report += "2. Only in OLD (old used, new not used): $($onlyInOld.Count) tables`r`n"
$report += "   Sorted by frequency descending`r`n"
$report += "================================================================`r`n"
$report += "Freq`tSchema.Table`tComment`r`n"
$report += "----`t-----------`t-------`r`n"

$onlyInOld | Sort-Object { $oldTables[$_].Count } -Descending | ForEach-Object {
    $schemas = ($oldTables[$_].Schemas -join ', ')
    $schemaStr = if($schemas) { $schemas } else { $_ }
    $comment = if ($tableComments[$_]) { $tableComments[$_] } else { '' }
    $report += "$($oldTables[$_].Count)`t$schemaStr`t$comment`r`n"
}

$report | Out-File ($outputDir + '\table_diff_report_with_comments.txt') -Encoding UTF8
Write-Host 'Report saved'
