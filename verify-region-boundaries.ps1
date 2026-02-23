# 驗證所有產區邊界檔案是否存在
# Verify all region boundary geojson files

Write-Host "=== 驗證大區邊界檔案 ===" -ForegroundColor Cyan

# RegionMap.vue 中的 geojsonFolder 配置
$regionConfigs = @{
    'veneto' = 'Veneto'
    'piedmont' = 'Piemonte'
    'tuscany' = 'Toscana'
    'lombardy' = 'Lombardy'
    'trentino' = 'Trentino'
    'friuli' = 'Friuli-Venezia Giulia'
    'emilia' = 'Emilia-Romagna'
    'marche' = 'Marche'
    'umbria' = 'Umbria'
    'lazio' = 'Lazio'
    'abruzzo' = 'Abruzzo'
    'campania' = 'Campania'
    'puglia' = 'Puglia'
    'basilicata' = 'Basilicata'
    'calabria' = 'Calabria'
    'sicily' = 'Sicily'
    'sardinia' = 'Sardegna'
    'liguria' = 'Liguria'
    'molise' = 'Molise'
}

$missing = @()
$found = @()

foreach ($regionId in $regionConfigs.Keys | Sort-Object) {
    $folder = $regionConfigs[$regionId]
    $filePath = "public\regions\$regionId\geojson\$folder.geojson"
    
    if (Test-Path $filePath) {
        Write-Host "✓ $regionId → $folder.geojson" -ForegroundColor Green
        $found += $regionId
    } else {
        Write-Host "✗ $regionId → 找不到 $folder.geojson" -ForegroundColor Red
        $missing += "$regionId ($folder)"
    }
}

Write-Host "`n=== 統計結果 ===" -ForegroundColor Cyan
Write-Host "已找到: $($found.Count)/19" -ForegroundColor Green
if ($missing.Count -gt 0) {
    Write-Host "缺少: $($missing.Count)" -ForegroundColor Red
    Write-Host "缺少的檔案:" -ForegroundColor Yellow
    $missing | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
} else {
    Write-Host "所有大區邊界檔案都存在！" -ForegroundColor Green
}

# 檢查目錄結構
Write-Host "`n=== 驗證資料夾結構 ===" -ForegroundColor Cyan
$structureIssues = @()

foreach ($regionId in $regionConfigs.Keys | Sort-Object) {
    $regionPath = "public\regions\$regionId\geojson"
    
    if (Test-Path $regionPath) {
        $hasDocg = Test-Path "$regionPath\DOCG"
        $hasDoc = Test-Path "$regionPath\DOC"
        $hasIgt = Test-Path "$regionPath\IGT"
        
        if ($hasDocg -and $hasDoc -and $hasIgt) {
            Write-Host "✓ $regionId 有 DOCG/DOC/IGT 資料夾" -ForegroundColor Green
        } else {
            $missing_folders = @()
            if (-not $hasDocg) { $missing_folders += 'DOCG' }
            if (-not $hasDoc) { $missing_folders += 'DOC' }
            if (-not $hasIgt) { $missing_folders += 'IGT' }
            Write-Host "△ $regionId 缺少: $($missing_folders -join ', ')" -ForegroundColor Yellow
            $structureIssues += $regionId
        }
    } else {
        Write-Host "✗ $regionId geojson 資料夾不存在" -ForegroundColor Red
        $structureIssues += $regionId
    }
}

if ($structureIssues.Count -eq 0) {
    Write-Host "`n所有產區都有完整的 DOCG/DOC/IGT 資料夾結構！" -ForegroundColor Green
}
