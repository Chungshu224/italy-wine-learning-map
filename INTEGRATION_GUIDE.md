# 新產區整合指南

本指南說明如何將「已完成專案」中的產區整合到義大利葡萄酒地圖系統中。

## 專案結構

```
public/
  regions/
    veneto/               # Veneto 產區資料
      veneto-regions.json # 產區資訊 JSON
      geojson/           # GeoJSON 地理資料
        Veneto/
          *.geojson
    piedmont/            # 未來新增產區
      piedmont-regions.json
      geojson/
        Piedmont/
          *.geojson
```

## 添加新產區步驟

### 1. 準備資料檔案

從「已完成專案」資料夾中找到對應產區的資料，通常包含：
- `{region}-regions.json` - 產區資訊檔案
- `geojson/` 資料夾 - 包含所有 GeoJSON 地理邊界檔案

### 2. 創建產區資料夾

```powershell
# 例如添加 Piedmont 產區
New-Item -ItemType Directory -Force -Path "public\regions\piedmont"
New-Item -ItemType Directory -Force -Path "public\regions\piedmont\geojson"
```

### 3. 複製資料檔案

```powershell
# 複製 regions.json
Copy-Item "C:\Users\Chungshu\Desktop\教學網站製作20260220\已完成專案\Piedmont\piedmont-regions.json" "public\regions\piedmont\"

# 複製 geojson 資料夾
Copy-Item "C:\Users\Chungshu\Desktop\教學網站製作20260220\已完成專案\Piedmont\geojson" "public\regions\piedmont\geojson" -Recurse
```

### 4. 創建產區地圖組件

複製 `VenetoMap.vue` 並修改為新產區：

```vue
<!-- src/components/PiedmontMap.vue -->
<script setup>
// ... 其他代碼 ...

// 修改資料載入路徑
const loadRegionsData = async () => {
  try {
    const res = await fetch('/regions/piedmont/piedmont-regions.json')
    // ...
  }
}

// 修改預設產區和顏色
function aocColor(groupName) {
  return '#8B0000' // 改為 Piedmont 的代表色
}
</script>
```

在 `MapSection.vue` 的相應位置，修改 geojson 路徑：

```javascript
const geojsonPath = `/regions/piedmont/geojson/Piedmont/${aocFile}`
```

### 5. 添加路由

在 `src/router/index.js` 中添加新產區路由：

```javascript
{
  path: '/region/piedmont',
  name: 'Piedmont',
  component: () => import('../components/PiedmontMap.vue')
}
```

### 6. 更新首頁資訊

在 `RegionSelector.vue` 中，產區資料已預先設定好 19 個產區的基本資訊，無需修改。

## 快速整合腳本範例

以下是一個完整的 PowerShell 腳本範例，用於快速整合 Piedmont 產區：

```powershell
# 設定變數
$regionName = "piedmont"
$regionNameCapital = "Piedmont"
$sourcePath = "C:\Users\Chungshu\Desktop\教學網站製作20260220\已完成專案\Piedmont"
$targetPath = "public\regions\piedmont"

# 創建資料夾
New-Item -ItemType Directory -Force -Path $targetPath
New-Item -ItemType Directory -Force -Path "$targetPath\geojson"

# 複製檔案
Copy-Item "$sourcePath\piedmont-regions.json" "$targetPath\"
Copy-Item "$sourcePath\geojson" "$targetPath\geojson" -Recurse -Force

Write-Host "✅ $regionNameCapital 資料整合完成！"
Write-Host "接下來請："
Write-Host "1. 複製 VenetoMap.vue 為 ${regionNameCapital}Map.vue"
Write-Host "2. 修改組件中的資料路徑和顏色"
Write-Host "3. 在 router/index.js 添加路由"
```

## 已完成產區清單

- ✅ Veneto (威尼托)
- ⬜ Piedmont (皮埃蒙特)
- ⬜ Tuscany (托斯卡納)
- ⬜ Lombardy (倫巴第)
- ⬜ Trentino-Alto Adige (特倫蒂諾-上阿迪傑)
- ⬜ Friuli Venezia Giulia (弗留利-威尼斯朱利亞)
- ⬜ Emilia-Romagna (艾米利亞-羅馬涅)
- ⬜ Marche (馬爾凱)
- ⬜ Umbria (翁布里亞)
- ⬜ Lazio (拉齊奧)
- ⬜ Abruzzo (阿布魯佐)
- ⬜ Campania (坎帕尼亞)
- ⬜ Apulia (普利亞)
- ⬜ Basilicata (巴西利卡塔)
- ⬜ Calabria (卡拉布里亞)
- ⬜ Sicily (西西里)
- ⬜ Sardinia (撒丁島)
- ⬜ Liguria (利古里亞)
- ⬜ Molise (莫利塞)

## 注意事項

1. **檔案路徑一致性**：確保 JSON 檔案和 GeoJSON 資料夾的相對路徑正確
2. **命名規範**：保持與原始專案相同的命名規範（大小寫敏感）
3. **地圖中心座標**：每個產區需要設定適當的地圖中心座標和縮放級別
4. **顏色配置**：為每個產區選擇代表性顏色以區分不同產區
5. **資料驗證**：添加新產區後，測試地圖顯示和資料載入是否正常

## 測試清單

添加新產區後，請確認：

- [ ] 首頁產區卡片可正常點擊
- [ ] 路由導航正確
- [ ] JSON 資料正常載入
- [ ] GeoJSON 地理邊界正常顯示
- [ ] 搜尋功能正常
- [ ] 返回首頁按鈕正常
- [ ] 手機版顯示正常

## 需要協助？

如果在整合過程中遇到問題，請檢查：
1. 瀏覽器開發者工具的 Console 錯誤訊息
2. Network 標籤確認檔案載入狀態
3. 檔案路徑是否正確（注意大小寫）
