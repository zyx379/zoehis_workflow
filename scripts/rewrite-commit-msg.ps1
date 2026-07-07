param(
    [Parameter(Mandatory = $true)]
    [string]$RepoPath,
    [Parameter(Mandatory = $true)]
    [string]$Message
)

Set-Location $RepoPath
$tree = git rev-parse 'HEAD^{tree}'
$parent = git rev-parse 'HEAD~1'
$env:GIT_AUTHOR_NAME = (git log -1 --format='%an')
$env:GIT_AUTHOR_EMAIL = (git log -1 --format='%ae')
$env:GIT_COMMITTER_NAME = $env:GIT_AUTHOR_NAME
$env:GIT_COMMITTER_EMAIL = $env:GIT_AUTHOR_EMAIL
$newCommit = & git commit-tree $tree -p $parent -m $Message
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($newCommit)) {
    throw "git commit-tree failed"
}
git reset --hard $newCommit
git log -1 --format=full
