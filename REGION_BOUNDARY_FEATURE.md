# 大區邊界顯示功能

## 功能概述

現在產區地圖頁面支援顯示整個大區的地理邊界，讓使用者可以更好地理解各個法定產區（DOCG/DOC/IGT）在整個大區中的位置關係。

## 功能特點

### 1. 自動載入大區邊界
- 地圖初始化時自動載入並顯示大區輪廓
- 使用淡酒紅色（#722F37）的半透明填充和邊框
- 如果沒有選擇任何 AOC，地圖會自動縮放至整個大區範圍

### 2. 切換顯示控制
- 右側新增「顯示大區/隱藏大區」按鈕
- 位置：地圖右側，3D 按鈕下方
- 支援一鍵切換顯示/隱藏大區邊界

### 3. 視覺設計
- 填充：酒紅色，透明度 8%（不會遮擋衛星圖）
- 邊框：酒紅色，3px 寬度，透明度 60%
- 與 AOC 產區圖層分離，互不干擾

### 4. 響應式設計
- 桌面版：按鈕位於右側 top: 190px
- 移動版：按鈕位於右側 top: 180px
- 按鈕大小和文字自動調整

## 技術實現

### 數據來源
大區邊界 GeoJSON 檔案位於：
```
/public/regions/{regionId}/geojson/{RegionName}.geojson
```

例如：
- Veneto: `/public/regions/veneto/geojson/Veneto.geojson`
- Piemonte: `/public/regions/piedmont/geojson/Piemonte.geojson`
- Friuli: `/public/regions/friuli/geojson/Friuli-Venezia Giulia.geojson`

### 圖層管理
- 圖層 ID：`region-boundary-fill`（填充）、`region-boundary-outline`（邊框）
- 資料源 ID：`region-boundary`
- 與 AOC 圖層獨立，確保互不影響

### 快取機制
- 使用全局 `geojsonCache` 快取已載入的邊界數據
- 避免重複請求，提升性能

## 使用場景

1. **初次進入產區地圖**
   - 自動顯示整個大區輪廓
   - 幫助使用者建立地理概念

2. **瀏覽多個 AOC 時**
   - 邊界始終顯示（除非手動隱藏）
   - 提供地理參考框架

3. **教學模式**
   - 保持大區邊界顯示
   - 逐一展示各個法定產區的位置

4. **簡潔模式**
   - 隱藏大區邊界
   - 專注於單一 AOC 的細節

## 瀏覽器支援

- 支援所有現代瀏覽器
- 需要 Mapbox GL JS v2+
- 需要 Turf.js 支援邊界計算

## 已驗證的大區

所有 19 個義大利葡萄酒大區的邊界檔案已完成配置：
- ✅ Veneto
- ✅ Piemonte
- ✅ Toscana
- ✅ Lombardy
- ✅ Friuli-Venezia Giulia
- ✅ Emilia-Romagna
- ✅ Sardegna
- ✅ Abruzzo、Basilicata、Calabria、Campania、Lazio、Liguria、Marche、Molise、Puglia、Sicily、Trentino、Umbria
