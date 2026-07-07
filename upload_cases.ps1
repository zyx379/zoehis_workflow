# 读取本地 case 文件列表和对应的 IMA 文件夹 ID
$casesDir = 'd:\zoe_work_space\fj-common\docs\memory\cases'
$indexFile = 'd:\zoe_work_space\fj-common\docs\memory\index.md'

# 读取 index.md 获取每个 case 的 domain 映射
$indexContent = Get-Content $indexFile -Raw -Encoding UTF8

# folder_id 映射（domain → folder_id）
$folderMap = @{
    '收费&医保' = 'folder_7476121318742105'
    '医嘱&药剂' = 'folder_7476263954434199'
    '其他' = 'folder_7476263971212152'
}

# 业务域判断（从 index.md 的"域"列映射）
function Get-Domain($domainCol) {
    if ($domainCol -match '收费|医保|退药|摆药|配药池') { return '收费&医保' }
    if ($domainCol -match '医嘱|药剂|药库|处方|摆药') { return '医嘱&药剂' }
    return '其他'
}

# 判断分类
function Get-Category($domainCol) {
    if ($domainCol -match '排查|问题|bug|修复') { return '问题排查' }
    return '需求开发'
}

# 获取所有 md 文件
$files = Get-ChildItem $casesDir -Filter '*.md' | Sort-Object Name

$output = @()
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw -Encoding UTF8
    # 从文件第一行提取禅道号
    $firstLine = ($content -split "`n")[0]
    $zenId = ''
    if ($firstLine -match '\[(\d+)\]') { $zenId = $matches[1] }
    
    # 从 index.md 找对应的域
    $domainCol = ''
    if ($indexContent -match "\|.*$zenId.*\|\s*(\S+)\s*\|") {
        $domainCol = $matches[1]
    }
    
    $domain = Get-Domain $domainCol
    $category = Get-Category $domainCol
    $folderId = $folderMap[$domain]
    
    # 提取标题（去掉 # 前缀）
    $title = $firstLine -replace '^#\s*', ''
    
    $output += @{
        file = $f.Name
        zenId = $zenId
        domain = $domain
        category = $category
        folderId = $folderId
        title = $title
        contentLen = $content.Length
    }
}

$output | Format-Table file, zenId, domain, category, folderId, contentLen -AutoSize
Write-Host "`nTotal: $($output.Count) files"
