# 義大利產區資料完整性檢查腳本

$sourcePath = "C:\Users\Chungshu\Desktop\教學網站製作20260220\已完成專案"
$targetBase = "public\regions"

$regionMapping = @{
    "Veneto-map" = "veneto"
    "Piemonte-map" = "piedmont"
    "Toscana-map" = "tuscany"
    "Lambardy  map" = "lombardy"
    "Trentino-map" = "trentino"
    "Friuli Venezia Giulia-map" = "friuli"
    "Emilia Romagna-map" = "emilia"
    "Marche-map" = "marche"
    "Umbria-map" = "umbria"
    "Lazio-map" = "lazio"
    "Abruzzo-map" = "abruzzo"
    "Campania-map" = "campania"
    "Puglia-map" = "apulia"
    "Basilicata-map" = "basilicata"
    "Calabria-map" = "calabria"
    "Sicily-map" = "sicily"
    "Sardinia-map" = "sardinia"
    "Liguria-map" = "liguria"
    "Molise-map" = "molise"
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "義大利葡萄酒產區資料完整性檢查" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$missingReport = @()
$summary = @()

foreach ($sourceFolder in $regionMapping.Keys) {
    $regionId = $regionMapping[$sourceFolder]
    
    Write-Host "檢查產區: $regionId" -ForegroundColor Yellow
    
    # 檢查 JSON 檔案
    $targetJson = Join-Path $targetBase "$regionId\$regionId-regions.json"
    
    if (-not (Test-Path $targetJson) -or (Get-Item $targetJson).Length -lt 100) {
        Write-Host "  ⚠ JSON 檔案遺漏或損壞，重新複製..." -ForegroundColor Red
        
        # 找到來源 JSON 檔案
        $sourceJsonPattern = Join-Path $sourcePath "$sourceFolder\public\*-regions.json"
        $sourceJson = Get-ChildItem $sourceJsonPattern -ErrorAction SilentlyContinue | Select-Object -First 1
        
        if ($sourceJson) {
            Copy-Item $sourceJson.FullName $targetJson -Force
            Write-Host "    ✓ 已複製: $($sourceJson.Name)" -ForegroundColor Green
        }
    }
    
    if (Test-Path $targetJson) {
        try {
            $jsonData = Get-Content $targetJson -Raw | ConvertFrom-Json
            $jsonCount = $jsonData.Count
            
            # 統計各類型數量
            $docCount = ($jsonData | Where-Object { $_.type -eq 'DOC' }).Count
            $docgCount = ($jsonData | Where-Object { $_.type -eq 'DOCG' }).Count
            $igpCount = ($jsonData | Where-Object { $_.type -like 'IG*' }).Count
            
            Write-Host "  JSON: 總計 $jsonCount 個 (DOCG:$docgCount, DOC:$docCount, IGP:$igpCount)" -ForegroundColor White
            
            # 檢查 GeoJSON 檔案
            $geojsonPath = Join-Path $targetBase "$regionId\geojson"
            $geojsonFiles = Get-ChildItem $geojsonPath -Recurse -Filter "*.geojson" -ErrorAction SilentlyContinue
            $geojsonCount = if ($geojsonFiles) { $geojsonFiles.Count } else { 0 }
            
            Write-Host "  GeoJSON: $geojsonCount 個檔案" -ForegroundColor White
            
            # 檢查遺漏的 GeoJSON
            $missing = @()
            foreach ($item in $jsonData) {
                $geojsonName = "$($item.id).geojson"
                $found = $geojsonFiles | Where-Object { $_.Name -eq $geojsonName }
                
                if (-not $found) {
                    $missing += [PSCustomObject]@{
                        Region = $regionId
                        AOC = $item.id
                        Type = $item.type
                        Name = $item.name
                    }
                }
            }
            
            if ($missing.Count -gt 0) {
                Write-Host "  ⚠ 遺漏 $($missing.Count) 個 GeoJSON 檔案" -ForegroundColor Red
                $missingReport += $missing
            } else {
                Write-Host "  ✓ 所有 GeoJSON 檔案齊全" -ForegroundColor Green
            }
            
            $summary += [PSCustomObject]@{
                Region = $regionId
                JSON_Total = $jsonCount
                DOCG = $docgCount
                DOC = $docCount
                IGP = $igpCount
                GeoJSON = $geojsonCount
                Missing = $missing.Count
                Status = if ($missing.Count -eq 0) { "✓" } else { "⚠ $($missing.Count) 遺漏" }
            }
            
        } catch {
            Write-Host "  ✗ JSON 解析失敗: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  ✗ 找不到 JSON 檔案" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "摘要報告" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$summary | Format-Table -AutoSize

if ($missingReport.Count -gt 0) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "遺漏的 GeoJSON 檔案清單" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    $missingReport | Format-Table -AutoSize
    
    Write-Host "`n總計遺漏: $($missingReport.Count) 個 GeoJSON 檔案" -ForegroundColor Red
} else {
    Write-Host "`n✓ 所有產區的 GeoJSON 檔案都已齊全！" -ForegroundColor Green
}

Write-Host "`n檢查完成！`n" -ForegroundColor Cyan
