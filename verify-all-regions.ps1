# 驗證所有大區配置完整性
Write-Host "=== 驗證大區配置 ===" -ForegroundColor Cyan

# RegionMap.vue 中的產區配置
$regions = @(
    'veneto', 'piedmont', 'tuscany', 'lombardy', 'trentino',
    'friuli', 'emilia', 'marche', 'umbria', 'lazio',
    'abruzzo', 'campania', 'puglia', 'basilicata', 'calabria',
    'sicily', 'sardinia', 'liguria', 'molise'
)

Write-Host "`n檢查 regionOverviews.js 資料..." -ForegroundColor Yellow

$overviewsFile = "src\data\regionOverviews.js"
$content = Get-Content $overviewsFile -Raw

$missing = @()
$found = @()

foreach ($region in $regions) {
    if ($content -match "  $region`: \{") {
        Write-Host "✓ $region - 已配置大區資訊" -ForegroundColor Green
        $found += $region
    } else {
        Write-Host "✗ $region - 缺少大區資訊" -ForegroundColor Red
        $missing += $region
    }
}

Write-Host "`n=== 統計 ===" -ForegroundColor Cyan
Write-Host "已配置: $($found.Count)/19" -ForegroundColor Green

if ($missing.Count -gt 0) {
    Write-Host "缺少: $($missing.Count)" -ForegroundColor Red
    Write-Host "缺少的大區: $($missing -join ', ')" -ForegroundColor Yellow
} else {
    Write-Host "所有大區配置完整！✓" -ForegroundColor Green
}

Write-Host "`n檢查資料夾結構..." -ForegroundColor Yellow
foreach ($region in $regions) {
    $path = "public\regions\$region"
    if (Test-Path $path) {
        $jsonFile = Get-ChildItem "$path\*.json" -ErrorAction SilentlyContinue
        if ($jsonFile) {
            Write-Host "✓ $region - 有 JSON 資料" -ForegroundColor Green
        } else {
            Write-Host "△ $region - 缺少 JSON 檔案" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ $region - 資料夾不存在" -ForegroundColor Red
    }
}
