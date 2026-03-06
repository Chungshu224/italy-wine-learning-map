# 整理 sounds 資料夾腳本
# 將音頻文件按照產區分類到 public/regions/{region}/sounds/ 資料夾中

Write-Host "開始整理音頻文件..." -ForegroundColor Cyan

# 產區名稱映射 (資料夾名稱 -> 產區名稱)
$regionMapping = @{
    'veneto' = 'Veneto'
    'piedmont' = 'Piemonte'
    'valle d''aosta' = 'Valle d''Aosta'
    'tuscany' = 'Toscana'
    'lombardy' = 'Lombardia'
    'trentino' = 'Trentino-Alto Adige'
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
    'sicily' = 'Sicilia'
    'sardinia' = 'Sardegna'
    'liguria' = 'Liguria'
    'molise' = 'Molise'
}

# 1. 創建產區 sounds 資料夾
$regionsPath = "public\regions"
Get-ChildItem $regionsPath -Directory | ForEach-Object {
    $soundsPath = Join-Path $_.FullName "sounds"
    if (-not (Test-Path $soundsPath)) {
        New-Item -Path $soundsPath -ItemType Directory -Force | Out-Null
        Write-Host "  ✓ 創建資料夾: $($_.Name)/sounds" -ForegroundColor Green
    }
}

# 2. 讀取所有產區的葡萄酒資料
$winesByRegion = @{}
Get-ChildItem "$regionsPath\*\*-regions.json" | ForEach-Object {
    $regionData = Get-Content $_.FullName | ConvertFrom-Json
    # 從文件路徑提取產區名稱（例如：veneto, tuscany）
    $region = $_.Directory.Name
    $regionData | ForEach-Object {
        if (-not $winesByRegion.ContainsKey($region)) {
            $winesByRegion[$region] = @()
        }
        # 移除 DOCG/DOC/IGT 後綴以匹配音頻文件名
        $cleanName = $_.name -replace '\s+(DOCG|DOC|IGT|IGP)\s*$', ''
        $winesByRegion[$region] += $cleanName
    }
}

# 3. 移動音頻文件
$soundsSource = "public\sounds"
$movedCount = 0
$notFoundCount = 0
$regionalAudioFiles = @()

Get-ChildItem $soundsSource -Filter "*.mp3" | ForEach-Object {
    $audioFile = $_
    $fileName = $audioFile.Name
    $nameWithoutExt = $audioFile.BaseName
    
    # 檢查是否為大區音頻文件
    $isRegionalAudio = $false
    foreach ($folder in $regionMapping.Keys) {
        $regionName = $regionMapping[$folder]
        if ($nameWithoutExt -eq $regionName) {
            $isRegionalAudio = $true
            $regionalAudioFiles += $audioFile.Name
            # 大區音頻保留在 public/sounds 根目錄
            Write-Host "  → 保留大區音頻: $fileName" -ForegroundColor Yellow
            break
        }
    }
    
    if ($isRegionalAudio) {
        return # 跳過這個文件
    }
    
    # 尋找對應的產區
    $foundRegion = $null
    foreach ($region in $winesByRegion.Keys) {
        if ($winesByRegion[$region] -contains $nameWithoutExt) {
            $foundRegion = $region
            break
        }
    }
    
    if ($foundRegion) {
        # $foundRegion 已經是資料夾名稱（例如 "tuscany"）
        $targetPath = Join-Path "$regionsPath\$foundRegion\sounds" $fileName
        Move-Item -Path $audioFile.FullName -Destination $targetPath -Force
        Write-Host "  ✓ 已移動: $fileName -> $foundRegion/sounds/" -ForegroundColor Green
        $movedCount++
    } else {
        Write-Host "  ✗ 找不到產區: $fileName" -ForegroundColor Red
        $notFoundCount++
    }
}

# 4. 統計結果
Write-Host "`n整理完成！" -ForegroundColor Cyan
Write-Host "  已移動: $movedCount 個文件" -ForegroundColor Green
Write-Host "  大區音頻 (保留): $($regionalAudioFiles.Count) 個文件" -ForegroundColor Yellow
Write-Host "  找不到產區: $notFoundCount 個文件" -ForegroundColor Red

if ($regionalAudioFiles.Count -gt 0) {
    Write-Host "`n保留的大區音頻文件:" -ForegroundColor Yellow
    $regionalAudioFiles | ForEach-Object { Write-Host "    - $_" }
}
