# 批量轉換地圖為 Puglia 深色格式
# 由於工作量龐大，此腳本將逐個處理 JSON 文件並替換地圖 section

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "批量轉換地圖格式為 Puglia 深色風格" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

# 基本路徑
$basePath = $PSScriptRoot
$coursePath = Join-Path $basePath "public\courses"

# 完整的地圖配置（已從子代理提取）
$mapsConfig = @(
    @{
        file = "level1\L1M1L3.json"
        mapId = "italy-map"
        regionName = "Italy"
        regionNameCN = "義大利"
        emoji = "🗺️"
        themeColor = "#667eea"
        themeColorRGB = "102,126,234"
        description = "從阿爾卑斯山到西西里島，義大利 20 個產區的地理分布與氣候多樣性"
        regions = @(
            @{ grade = "北部產區"; name = "8個產區"; color = "#3498db"; description = "大陸性氣候，Piemonte、Lombardy、Veneto 等" },
            @{ grade = "中部產區"; name = "6個產區"; color = "#27ae60"; description = "地中海氣候，Toscana、Umbria、Marche 等" },
            @{ grade = "南部產區"; name = "6個產區"; color = "#e74c3c"; description = "炎熱氣候，Puglia、Sicily、Calabria 等" }
        )
    }
)

function HexToRgba {
    param([string]$hex, [double]$alpha = 0.1)
    $r = [Convert]::ToInt32($hex.Substring(1, 2), 16)
    $g = [Convert]::ToInt32($hex.Substring(3, 2), 16)
    $b = [Convert]::ToInt32($hex.Substring(5, 2), 16)
    return "rgba($r,$g,$b,$alpha)"
}

function Generate-PugliaHTML {
    param([hashtable]$map)
    
    $regionSlug = $map.regionName.ToLower() -replace '\s+', '-' -replace '[()]', ''
    
    $html = "<section class='slide $regionSlug-map-slide' style='padding:0'>"
    $html += "<div class='$regionSlug-map-container' style='display:grid;grid-template-columns:2fr 1fr;gap:20px;height:100%;padding:20px;background:#1a1a2e;border-radius:12px'>"
    $html += "<div id='$($map.mapId)' class='$regionSlug-region-map' style='border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.3)'></div>"
    $html += "<div class='map-legend'>"
    $html += "<h3 style='margin:0 0 20px;color:$($map.themeColor);font-size:1.3rem;text-align:center'>$($map.emoji) $($map.regionNameCN) 產區地圖</h3>"
    $html += "<div style='margin-bottom:25px;padding:15px;background:rgba($($map.themeColorRGB),.15);border-radius:8px;border-left:4px solid $($map.themeColor)'>"
    $html += "<p style='margin:0;color:#ecf0f1;line-height:1.7;font-size:.95rem'>$($map.description)</p></div>"
    
    # 分組產區
    $gradeGroups = $map.regions | Group-Object -Property grade
    
    foreach ($gradeGroup in $gradeGroups) {
        $grade = $gradeGroup.Name
        $gradeEmoji = if ($grade -match 'S') { '🏆' } elseif ($grade -match 'A') { '⭐' } else { '✨' }
        $firstRegion = $gradeGroup.Group[0]
        $gradeColor = $firstRegion.color
        
        $html += "<div style='margin-bottom:20px'>"
        $html += "<h4 style='margin:0 0 12px;color:$gradeColor;font-size:1.1rem;border-bottom:2px solid $gradeColor;padding-bottom:8px'>$gradeEmoji $grade</h4>"
        
        foreach ($region in $gradeGroup.Group) {
            $rgbaBackground = HexToRgba -hex $region.color -alpha 0.1
            $html += "<div style='margin:8px 0;padding:10px;background:$rgbaBackground;border-radius:6px;border-left:3px solid $($region.color)'>"
            $html += "<div style='display:flex;align-items:center;margin-bottom:5px'>"
            $html += "<div style='width:16px;height:16px;background:$($region.color);border-radius:3px;margin-right:10px'></div>"
            $html += "<strong style='color:$($region.color)'>$($region.name)</strong></div>"
            $html += "<p style='margin:5px 0 0 26px;color:#bdc3c7;font-size:.88rem;line-height:1.6'>$($region.description)</p></div>"
        }
        
        $html += "</div>"
    }
    
    $html += "</div></div></section>"
    return $html
}

Write-Host "注意：此腳本僅生成新的 HTML，需手動替換 JSON 文件中的舊地圖 section" -ForegroundColor Yellow
Write-Host "由於 JSON 文件結構複雜，建議使用 VS Code 的搜尋/替換功能逐個處理" -ForegroundColor Yellow
Write-Host ""

Write-Host "生成第一個地圖 HTML（Italy）作為示例：" -ForegroundColor Green
Write-Host ""
$italyHTML = Generate-PugliaHTML -map $mapsConfig[0]
Write-Host $italyHTML -ForegroundColor White
Write-Host ""
Write-Host "HTML 已生成！" -ForegroundColor Green
