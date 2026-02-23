# 義大利產區資料整合腳本
# 此腳本將所有產區資料從「已完成專案」複製到統一的 regions 資料夾

$sourcePath = "C:\Users\Chungshu\Desktop\教學網站製作20260220\已完成專案"
$targetBase = "public\regions"

# 產區對照表：資料夾名稱 -> 規範化名稱
$regionMapping = @{
    "Piemonte-map" = @{
        folder = "piedmont"
        json = "piemonte-regions.json"
        geojsonFolder = "Piemonte"
    }
    "Toscana-map" = @{
        folder = "tuscany"
        json = "toscana-regions.json"
        geojsonFolder = "Toscana"
    }
    "Lambardy  map" = @{
        folder = "lombardy"
        json = "lombardy-regions.json"
        geojsonFolder = "Lombardy"
    }
    "Trentino-map" = @{
        folder = "trentino"
        json = "trentino-regions.json"
        geojsonFolder = "Trentino"
    }
    "Friuli Venezia Giulia-map" = @{
        folder = "friuli"
        json = "friuli-regions.json"
        geojsonFolder = "Friuli"
    }
    "Emilia Romagna-map" = @{
        folder = "emilia"
        json = "emiliaromagna-regions.json"
        geojsonFolder = "EmiliaRomagna"
    }
    "Marche-map" = @{
        folder = "marche"
        json = "marche-regions.json"
        geojsonFolder = "Marche"
    }
    "Umbria-map" = @{
        folder = "umbria"
        json = "umbria-regions.json"
        geojsonFolder = "Umbria"
    }
    "Lazio-map" = @{
        folder = "lazio"
        json = "lazio-regions.json"
        geojsonFolder = "Lazio"
    }
    "Abruzzo-map" = @{
        folder = "abruzzo"
        json = "abruzzo-regions.json"
        geojsonFolder = "Abruzzo"
    }
    "Campania-map" = @{
        folder = "campania"
        json = "campania-regions.json"
        geojsonFolder = "Campania"
    }
    "Puglia-map" = @{
        folder = "apulia"
        json = "puglia-regions.json"
        geojsonFolder = "Puglia"
    }
    "Basilicata-map" = @{
        folder = "basilicata"
        json = "basilicata-regions.json"
        geojsonFolder = "Basilicata"
    }
    "Calabria-map" = @{
        folder = "calabria"
        json = "calabria-regions.json"
        geojsonFolder = "Calabria"
    }
    "Sicily-map" = @{
        folder = "sicily"
        json = "sicily-regions.json"
        geojsonFolder = "Sicily"
    }
    "Sardinia-map" = @{
        folder = "sardinia"
        json = "sardinia-regions.json"
        geojsonFolder = "Sardinia"
    }
    "Liguria-map" = @{
        folder = "liguria"
        json = "liguria-regions.json"
        geojsonFolder = "Liguria"
    }
    "Molise-map" = @{
        folder = "molise"
        json = "molise-regions.json"
        geojsonFolder = "Molise"
    }
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "開始整合義大利葡萄酒產區資料" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($sourceFolder in $regionMapping.Keys) {
    $region = $regionMapping[$sourceFolder]
    $regionFolder = $region.folder
    $jsonFile = $region.json
    $geojsonFolder = $region.geojsonFolder
    
    Write-Host "處理產區: $regionFolder..." -ForegroundColor Yellow
    
    try {
        # 創建目標資料夾
        $targetPath = Join-Path $targetBase $regionFolder
        New-Item -ItemType Directory -Force -Path $targetPath | Out-Null
        New-Item -ItemType Directory -Force -Path "$targetPath\geojson" | Out-Null
        
        # 檢查來源檔案
        $sourceJson = Join-Path $sourcePath "$sourceFolder\public\$jsonFile"
        $sourceGeojson = Join-Path $sourcePath "$sourceFolder\public\geojson\$geojsonFolder"
        
        if (-not (Test-Path $sourceJson)) {
            Write-Host "  ⚠ 找不到 JSON 檔案: $sourceJson" -ForegroundColor Red
            $failCount++
            continue
        }
        
        # 複製 JSON 檔案
        $targetJson = Join-Path $targetPath "$regionFolder-regions.json"
        Copy-Item $sourceJson $targetJson -Force
        Write-Host "  ✓ 複製 JSON: $jsonFile -> $regionFolder-regions.json" -ForegroundColor Green
        
        # 複製 GeoJSON 資料夾
        if (Test-Path $sourceGeojson) {
            Copy-Item $sourceGeojson "$targetPath\geojson\$geojsonFolder" -Recurse -Force
            $geojsonCount = (Get-ChildItem "$targetPath\geojson\$geojsonFolder" -Filter "*.geojson").Count
            Write-Host "  ✓ 複製 GeoJSON: $geojsonCount 個檔案" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ 找不到 GeoJSON 資料夾: $sourceGeojson" -ForegroundColor Red
        }
        
        $successCount++
        Write-Host ""
        
    } catch {
        Write-Host "  ✗ 錯誤: $_" -ForegroundColor Red
        $failCount++
        Write-Host ""
    }
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "整合完成！" -ForegroundColor Cyan
Write-Host "成功: $successCount 個產區" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "失敗: $failCount 個產區" -ForegroundColor Red
}
Write-Host "============================================" -ForegroundColor Cyan
