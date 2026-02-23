# 測試所有大區路由
Write-Host "=== 測試所有大區路由 ===" -ForegroundColor Cyan
Write-Host ""

$regions = @(
    @{id='veneto'; name='Veneto 威尼托'},
    @{id='piedmont'; name='Piemonte 皮埃蒙特'},
    @{id='tuscany'; name='Toscana 托斯卡納'},
    @{id='lombardy'; name='Lombardy 倫巴第'},
    @{id='trentino'; name='Trentino 特倫蒂諾'},
    @{id='friuli'; name='Friuli 弗留利'},
    @{id='emilia'; name='Emilia-Romagna 艾米利亞-羅馬涅'},
    @{id='marche'; name='Marche 馬爾凱'},
    @{id='umbria'; name='Umbria 翁布里亞'},
    @{id='lazio'; name='Lazio 拉齊奧'},
    @{id='abruzzo'; name='Abruzzo 阿布魯佐'},
    @{id='campania'; name='Campania 坎帕尼亞'},
    @{id='puglia'; name='Puglia 普利亞'},
    @{id='basilicata'; name='Basilicata 巴西利卡塔'},
    @{id='calabria'; name='Calabria 卡拉布里亞'},
    @{id='sicily'; name='Sicily 西西里'},
    @{id='sardinia'; name='Sardegna 薩丁尼亞'},
    @{id='liguria'; name='Liguria 利古里亞'},
    @{id='molise'; name='Molise 莫利塞'}
)

Write-Host "可用的大區路由：" -ForegroundColor Yellow
Write-Host ""

foreach ($region in $regions) {
    $url = "http://localhost:5173/region/$($region.id)"
    Write-Host "  $($region.name)" -ForegroundColor Cyan
    Write-Host "  → $url" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "提示: 打開瀏覽器訪問上述 URL 測試每個大區" -ForegroundColor Green
Write-Host "初始畫面應顯示大區基礎資訊（無 AOC 選擇）" -ForegroundColor Green
