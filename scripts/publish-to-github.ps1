# 首次将项目推送到 GitHub（需已安装 Git 并配置 user.name / user.email）
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
    Write-Host "未找到 git。请安装: https://git-scm.com/download/win" -ForegroundColor Red
    exit 1
}

$remoteUrl = "https://github.com/123yangyan/emotion.git"

if (-not (Test-Path .git)) {
    git init
    Write-Host "已初始化 git 仓库"
}

git add -A
$status = git status --porcelain
if (-not $status) {
    Write-Host "没有需要提交的更改。"
} else {
    git commit -m "chore: initial release v1.0.0"
    Write-Host "已提交"
}

git branch -M main

$remotes = git remote 2>$null
if ($remotes -match "origin") {
    git remote set-url origin $remoteUrl
} else {
    git remote add origin $remoteUrl
}

Write-Host "正在推送到 $remoteUrl ..."
git push -u origin main

Write-Host ""
Write-Host "代码已推送。发布安装包请执行:" -ForegroundColor Green
Write-Host "  git tag v1.0.0"
Write-Host "  git push origin v1.0.0"
