# Comprehensive table comment extraction script
# Priorities: 1) Javadoc <p>标题: 2) @ApiModel Chinese 3) Table name inference
$outputDir = 'D:\zoe_work_space\fj-common\docs\table-diff-analysis'

$allDirs = @(
    'D:\zoe_work_space\fj-common\onelink-micro-charge-fj-common',
    'D:\zoe_work_space\fj-common\onelink-micro-optimus-fj-common',
    'D:\zoe_work_space\fj-common\onelink-micro-pres-fj-common',
    'D:\zoe_work_space\旧架构日常需求\fj-fd\zoe-optimus-fj-fd',
    'D:\zoe_work_space\政策性&共性改造集成专用\zoe-optimus-service-stack'
)

# Also scan old architecture other projects
$oldDirs = @(
    'D:\zoe_work_space\旧架构日常需求\fj-pt\zoe-optimus-fjpt',
    'D:\zoe_work_space\旧架构日常需求\fj-mcgd\zoe-optimus-mcgd',
    'D:\zoe_work_space\旧架构日常需求\fj-nasyy\zoe-optimus-nasyy',
    'D:\zoe_work_space\政策性&共性改造集成专用\zoe-optimus-fj-fd',
    'D:\zoe_work_space\政策性&共性改造集成专用\zoe-optimus-fjpt',
    'D:\zoe_work_space\政策性&共性改造集成专用\zoe-optimus-mcgd',
    'D:\zoe_work_space\政策性&共性改造集成专用\zoe-optimus-nasyy'
)
$allDirs = $allDirs + $oldDirs

$tableComments = @{}
$badPatterns = @('翻译字段','门诊翻译','结果映射','通用查询映射结果','插入','批量插入','删除','新增项','拼音码过滤插叙','搜索条件')

function IsBadComment($c) {
    foreach ($p in $badPatterns) {
        if ($c -eq $p) { return $true }
    }
    if ($c -match '^(新增|插入|删除|批量|获取|查询|根据|通过|按|分页|搜索|更新)\S{0,5}$') { return $true }
    if ($c -match '^<(p|br)') { return $true }
    if ($c.Length -lt 3 -or $c.Length -gt 60) { return $true }
    return $false
}

# Step 1: Extract from Java entity classes
foreach ($dir in $allDirs) {
    if (-not (Test-Path $dir)) { continue }
    Write-Host "Scanning: $dir"
    $javaFiles = Get-ChildItem -Path $dir -Filter '*.java' -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'target[/\\]' }
    foreach ($file in $javaFiles) {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $tableNameMatch = $null

        # Extract table name from @TableName or @Table
        if ($content -match '@TableName') {
            $tableNameMatch = [regex]::Match($content, '@TableName\s*(?:\(\s*(?:value\s*=\s*)?)?["'']([^"'']+)["'']')
        }
        if (-not $tableNameMatch -or -not $tableNameMatch.Success) {
            if ($content -match '@Table\s*\(') {
                $tableNameMatch = [regex]::Match($content, '@Table\s*\(\s*(?:name\s*=\s*)?["'']([^"'']+)["'']')
            }
        }
        # Also check Javadoc @TableName
        if (-not $tableNameMatch -or -not $tableNameMatch.Success) {
            $tableNameMatch = [regex]::Match($content, '\*\s*@TableName\s+(\w+)')
        }

        if ($tableNameMatch -and $tableNameMatch.Success) {
            $fullTableName = $tableNameMatch.Groups[1].Value.ToUpper()
            $shortName = ($fullTableName -split '\.')[-1]
            $comment = $null

            # Priority 1: Javadoc <p>标题:
            $javadocMatch = [regex]::Match($content, '(?s)/\*\*\s*\*\s*<p>标题:\s*([^<]+?)</p>')
            if ($javadocMatch.Success) {
                $c = $javadocMatch.Groups[1].Value.Trim()
                if (-not (IsBadComment $c)) { $comment = $c }
            }

            # Priority 2: @ApiModel with Chinese description
            if (-not $comment) {
                $apiModelMatch = [regex]::Match($content, '@ApiModel\s*\(\s*(?:value\s*=\s*"[^"]*"\s*,\s*)?description\s*=\s*"([^"]+)"')
                if ($apiModelMatch.Success) {
                    $c = $apiModelMatch.Groups[1].Value.Trim()
                    if ($c -match '[\u4e00-\u9fff]' -and -not (IsBadComment $c)) { $comment = $c }
                }
            }

            # Priority 3: @ApiModel with Chinese value (not class name)
            if (-not $comment) {
                $apiModelMatch = [regex]::Match($content, '@ApiModel\s*\(\s*value\s*=\s*"([^"]+)"')
                if ($apiModelMatch.Success) {
                    $c = $apiModelMatch.Groups[1].Value.Trim()
                    if ($c -match '[\u4e00-\u9fff]' -and $c -notmatch '对象$' -and -not (IsBadComment $c)) { $comment = $c }
                }
            }

            # Priority 4: @ApiModel simple with Chinese
            if (-not $comment) {
                $apiModelMatch = [regex]::Match($content, '@ApiModel\s*\(\s*"([^"]+)"')
                if ($apiModelMatch.Success) {
                    $c = $apiModelMatch.Groups[1].Value.Trim()
                    if ($c -match '[\u4e00-\u9fff]' -and $c -notmatch '对象$' -and -not (IsBadComment $c)) { $comment = $c }
                }
            }

            # Priority 5: Class-level Javadoc first Chinese line
            if (-not $comment) {
                $javadocMatch2 = [regex]::Match($content, '(?s)/\*\*\s*\*?\s*([^\n*]*[\u4e00-\u9fff][^\n*]*)\s*\*')
                if ($javadocMatch2.Success) {
                    $c = $javadocMatch2.Groups[1].Value.Trim()
                    if ($c.Length -ge 3 -and $c.Length -le 50 -and -not (IsBadComment $c)) { $comment = $c }
                }
            }

            if ($comment) {
                if (-not $tableComments.ContainsKey($shortName)) {
                    $tableComments[$shortName] = $comment
                } elseif ($comment -match '[\u4e00-\u9fff]' -and $tableComments[$shortName] -notmatch '[\u4e00-\u9fff]') {
                    $tableComments[$shortName] = $comment
                }
            }
        }
    }
}

Write-Host "Java entity comments: $($tableComments.Count)"

# Step 2: Extract from XML mapping file comments (only good quality)
foreach ($dir in $allDirs) {
    if (-not (Test-Path $dir)) { continue }
    $xmlFiles = Get-ChildItem -Path $dir -Filter '*.xml' -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -match 'mappings[/\\]' -and $_.FullName -notmatch 'target[/\\]' }
    foreach ($file in $xmlFiles) {
        $head = Get-Content $file.FullName -TotalCount 30 -Encoding UTF8 -ErrorAction SilentlyContinue | Out-String
        $commentMatches = [regex]::Matches($head, '<!--\s*([\u4e00-\u9fff][^-]*?)\s*-->')
        foreach ($cm in $commentMatches) {
            $comment = $cm.Groups[1].Value.Trim()
            if (IsBadComment $comment) { continue }

            $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
            $tableMatches = [regex]::Matches($content, '(?i)(?:FROM|INTO|UPDATE)\s+([A-Z0-9_]+\.[A-Z0-9_]+)')
            foreach ($tm in $tableMatches) {
                $fullTableName = $tm.Groups[1].Value.ToUpper()
                $shortName = ($fullTableName -split '\.')[-1]
                if (-not $tableComments.ContainsKey($shortName)) {
                    $tableComments[$shortName] = $comment
                }
            }
            break
        }
    }
}

Write-Host "Total after XML: $($tableComments.Count)"

# Step 3: Table name inference for common patterns
$prefixMap = @{
    'CHA_' = '收费'; 'DRU_' = '药品'; 'DRUG_' = '药品'; 'PAT_' = '病人'; 'PRES_' = '处方'
    'COM_' = '公共'; 'DIC_' = '字典'; 'APP_' = '申请'; 'INS_' = '医保'; 'INSUR_' = '医保'
    'IMP_' = '数据迁移'; 'HS_' = '首页'; 'EMR_' = '病历'; 'CLN_' = '临床路径'
    'TMP_' = '临时'; 'MOB_' = '移动'; 'GCP_' = 'GCP'; 'MSG_' = '消息'
    'POR_' = '门户'; 'RUL_' = '规则'; 'ACT_' = '流程'; 'ETPL_' = '模板'
}

$suffixMap = @{
    '_DICT' = '字典'; '_CONFIG' = '配置'; '_RECORD' = '记录'; '_MASTER' = '主表'
    '_DETAIL' = '细表'; '_LOG' = '日志'; '_INFO' = '信息'; '_DIST' = '分发表'
    '_TEMPLATE' = '模板'; '_HISTORY' = '历史'; '_EXTEND' = '扩展表'
}

# Read the diff report to get table names that need comments
$reportFile = $outputDir + '\table_diff_report_with_comments.txt'
$reportContent = Get-Content $reportFile -Encoding UTF8
$tablesNeedingComments = @()
$inTableSection = $false

foreach ($line in $reportContent) {
    if ($line -match '^\d+\t') {
        $parts = $line -split '\t'
        if ($parts.Length -ge 3 -and $parts[2] -eq '') {
            $schemaTable = $parts[1]
            $shortName = ($schemaTable -split '\.')[-1]
            $tablesNeedingComments += $shortName
        }
    }
}

Write-Host "Tables needing comments: $($tablesNeedingComments.Count)"

foreach ($shortName in $tablesNeedingComments) {
    if ($tableComments.ContainsKey($shortName)) { continue }

    $inferred = ''
    # Try prefix
    foreach ($prefix in $prefixMap.Keys) {
        if ($shortName.StartsWith($prefix)) {
            $inferred = $prefixMap[$prefix]
            $rest = $shortName.Substring($prefix.Length)
            # Try suffix
            foreach ($suffix in $suffixMap.Keys) {
                if ($rest.EndsWith($suffix)) {
                    $inferred += $suffixMap[$suffix]
                    break
                }
            }
            break
        }
    }

    if ($inferred -and $inferred.Length -ge 4) {
        $tableComments[$shortName] = $inferred
    }
}

Write-Host "Total after inference: $($tableComments.Count)"

# Save
$lines = $tableComments.GetEnumerator() | Sort-Object Name | ForEach-Object {
    $_.Key + '|' + $_.Value
}
$lines | Out-File ($outputDir + '\table_comments_v2.txt') -Encoding UTF8

Write-Host 'Done - saved to table_comments_v2.txt'
