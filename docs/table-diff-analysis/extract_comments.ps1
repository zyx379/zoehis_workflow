$outputDir = 'D:\zoe_work_space\fj-common\docs\table-diff-analysis'

$allDirs = @(
    'D:\zoe_work_space\fj-common\onelink-micro-charge-fj-common',
    'D:\zoe_work_space\fj-common\onelink-micro-optimus-fj-common',
    'D:\zoe_work_space\fj-common\onelink-micro-pres-fj-common',
    'D:\zoe_work_space\旧架构日常需求\fj-fd\zoe-optimus-fj-fd',
    'D:\zoe_work_space\政策性&共性改造集成专用\zoe-optimus-service-stack'
)

$tableComments = @{}

# Step 1: Extract from Java entity classes (@TableName + @ApiModel / Javadoc)
foreach ($dir in $allDirs) {
    if (-not (Test-Path $dir)) { continue }
    $javaFiles = Get-ChildItem -Path $dir -Filter '*.java' -Recurse | Where-Object { $_.FullName -notmatch 'target[/\\]' }
    foreach ($file in $javaFiles) {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $tableNameMatch = $null

        if ($content -match '@TableName') {
            $tableNameMatch = [regex]::Match($content, '@TableName\s*\(\s*(?:value\s*=\s*)?["'']([^"'']+)["'']')
        } elseif ($content -match '@Table\s*\(') {
            $tableNameMatch = [regex]::Match($content, '@Table\s*\(\s*(?:name\s*=\s*)?["'']([^"'']+)["'']')
        }

        if ($tableNameMatch -and $tableNameMatch.Success) {
            $fullTableName = $tableNameMatch.Groups[1].Value.ToUpper()
            $shortName = ($fullTableName -split '\.')[-1]
            $comment = $null

            $apiModelMatch = [regex]::Match($content, '@ApiModel\s*\(\s*(?:value\s*=\s*)?["'']([^"'']+)["'']')
            if ($apiModelMatch.Success) {
                $c = $apiModelMatch.Groups[1].Value
                if ($c -notmatch '对象$' -and $c -match '[\u4e00-\u9fff]') { $comment = $c }
            }

            if (-not $comment) {
                $javadocMatch = [regex]::Match($content, '(?s)/\*\*\s*\*\s*<p>标题:\s*([^<]+?)</p>')
                if ($javadocMatch.Success) { $comment = $javadocMatch.Groups[1].Value.Trim() }
            }

            if (-not $comment) {
                $javadocMatch2 = [regex]::Match($content, '(?s)/\*\*\s*\*?\s*([^\n*]*[\u4e00-\u9fff][^\n*]*)\s*\*')
                if ($javadocMatch2.Success) {
                    $c = $javadocMatch2.Groups[1].Value.Trim()
                    if ($c.Length -gt 2 -and $c.Length -lt 50) { $comment = $c }
                }
            }

            if ($comment -and -not $tableComments.ContainsKey($shortName)) {
                $tableComments[$shortName] = $comment
            }
        }
    }
}

Write-Host "Java entity comments: $($tableComments.Count)"

# Step 2: Extract from XML mapping file comments
foreach ($dir in $allDirs) {
    if (-not (Test-Path $dir)) { continue }
    $xmlFiles = Get-ChildItem -Path $dir -Filter '*.xml' -Recurse | Where-Object { $_.FullName -match 'mappings[/\\]' -and $_.FullName -notmatch 'target[/\\]' }
    foreach ($file in $xmlFiles) {
        $head = Get-Content $file.FullName -TotalCount 30 -Encoding UTF8 | Out-String
        $commentMatches = [regex]::Matches($head, '<!--\s*([\u4e00-\u9fff][^-]*?)\s*-->')
        foreach ($cm in $commentMatches) {
            $comment = $cm.Groups[1].Value.Trim()
            if ($comment.Length -lt 3 -or $comment.Length -gt 50) { continue }

            $content = Get-Content $file.FullName -Raw -Encoding UTF8
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

Write-Host "Total comments: $($tableComments.Count)"

$lines = $tableComments.GetEnumerator() | Sort-Object Name | ForEach-Object {
    $_.Key + '|' + $_.Value
}
$lines | Out-File ($outputDir + '\table_comments.txt') -Encoding UTF8

Write-Host 'Done'
