# 地圖功能增強說明

## 📅 更新日期
2026年3月22日

## 🎯 新增功能

### 1. 🏔️ 3D 地形視圖（整合功能）

#### 功能說明
- **一鍵開啟 3D 地形與 3D 視角**：點擊按鈕同時啟用地形和 3D 視角
- 使用 Mapbox Terrain DEM 數據源提供真實的 3D 地形效果
- 地形誇張係數設置為 1.5，增強視覺效果
- 自動調整到最佳視角（60° 俯仰角）以呈現地形
- 添加天空圖層（Sky Layer）增強 3D 氛圍
- 關閉時同步關閉地形效果並回復 2D 平面視圖（0° 俯仰角）

#### 使用方式
點擊右側控制面板的「🏔️ 3D 地形」按鈕，一鍵開啟/關閉 3D 地形視圖

#### 按鈕狀態
- **未啟用**：顯示「🏔️ 3D 地形」，藍色漸層
- **已啟用**：顯示「🏔️ 2D 平面」，保持藍色漸層提示當前為 3D 模式

#### 技術實現
```javascript
// 地形數據源（在地圖載入時添加）
map.addSource('mapbox-dem', {
  type: 'raster-dem',
  url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
  tileSize: 512,
  maxzoom: 14
})

// 整合的 3D 地形切換函數
const toggle3DTerrain = () => {
  if (!map) return
  
  // 切換狀態
  is3D.value = !is3D.value
  showTerrain.value = is3D.value
  
  if (is3D.value) {
    // 啟用 3D 地形和視角
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })
    map.easeTo({ pitch: 60, duration: 800 })
  } else {
    // 關閉 3D 地形和視角
    map.setTerrain(null)
    map.easeTo({ pitch: 0, duration: 800 })
  }
}
```

### 2. 📏 等高線（Contour Lines）功能

#### 功能說明
- 顯示地形等高線，清晰呈現地勢起伏
- 等高線顏色：橙色（#ff6900）
- 可通過按鈕控制顯示/隱藏
- 適合分析葡萄園的海拔分布

#### 使用方式
點擊右側控制面板的「📏 顯示等高線」按鈕

#### 技術實現
```javascript
// 等高線數據源
map.addSource('contours', {
  type: 'vector',
  url: 'mapbox://mapbox.mapbox-terrain-v2'
})

// 等高線圖層
map.addLayer({
  id: 'contour-lines',
  type: 'line',
  source: 'contours',
  'source-layer': 'contour',
  paint: {
    'line-color': '#ff6900',
    'line-width': 1,
    'line-opacity': 0.8
  }
})
```

### 3. 🏷️ 等高線高度標籤

#### 功能說明
- 每條等高線都顯示海拔高度（公尺）
- 標籤沿等高線排列，自動調整角度
- 白色光暈效果，確保在各種背景下清晰可讀
- 字體：DIN Offc Pro Bold

#### 視覺效果
- 文字顏色：橙色（#ff6900）
- 光暈顏色：白色
- 光暈寬度：2px
- 字體大小：11pt

#### 技術實現
```javascript
map.addLayer({
  id: 'contour-labels',
  type: 'symbol',
  source: 'contours',
  'source-layer': 'contour',
  layout: {
    'text-field': ['concat', ['get', 'ele'], 'm'],
    'symbol-placement': 'line',
    'text-rotation-alignment': 'map'
  },
  paint: {
    'text-color': '#ff6900',
    'text-halo-color': '#ffffff',
    'text-halo-width': 2
  }
})
```

### 4. 📋 資訊欄位收合功能

#### 功能說明
- 左下角資訊面板可以收合/展開
- 收合後僅顯示標題欄，節省螢幕空間
- 收合狀態會保持，直到手動切換
- 適用於大區資訊和 AOC 產區資訊兩種模式

#### 使用方式
點擊資訊欄位右上角的「▲ 收合」/「▼ 展開」按鈕

#### UI 設計
- 按鈕採用漸層紫色設計（#667eea → #764ba2）
- 懸停時有縮放效果
- 收合時面板最大高度限制為 80px

## 🎮 控制面板配置

### 右側控制按鈕（從上到下）
1. **🏔️ 3D 地形 / 2D 平面** - 一鍵開啟/關閉 3D 地形視圖（同時控制視角和地形效果）
2. **📏 顯示等高線** - 顯示/隱藏等高線及標籤
3. **顯示大區** - 顯示/隱藏大區邊界

### 資訊欄位控制按鈕
- **▲ 收合 / ▼ 展開** - 控制資訊面板的顯示狀態
- **重置地圖** / **重置大區** - 重置視圖到初始狀態

## 📱 響應式設計

所有新功能均支持移動端設備：
- 按鈕在小螢幕上自動調整大小
- 觸控友好的點擊區域
- 資訊面板在移動端自適應寬度

## 🔧 技術細節

### 數據源
- **地形 DEM**: `mapbox://mapbox.mapbox-terrain-dem-v1`
- **等高線**: `mapbox://mapbox.mapbox-terrain-v2`

### 性能優化
- 地形最大縮放層級限制為 14
- Tile 大小設置為 512px 以優化載入速度
- 使用向量瓦片（Vector Tiles）提供等高線數據

### 瀏覽器兼容性
- 需要支援 WebGL 的現代瀏覽器
- 建議使用 Chrome、Firefox、Safari 或 Edge 最新版本

## 🎓 教學應用場景

### 1. 地理課程
展示義大利葡萄酒產區的地形特徵，理解海拔與氣候的關係

### 2. 風土教學
結合等高線和 3D 地形，講解不同海拔對葡萄品種的影響

### 3. 產區比較
開啟等高線後，可視化比較不同產區的地勢差異

### 4. 互動探索
學生可自行操作地圖，探索產區的地理環境

## 📝 使用建議

1. **首次使用建議流程**：
   - 先開啟「3D 地形」查看整體地勢
   - 再開啟「等高線」觀察細節海拔
   - 使用滑鼠拖曳和縮放探索不同區域
   - 需要更大視野時，收合資訊欄位

2. **教學演示建議**：
   - 先展示 2D 平面地圖建立基礎認知
   - 切換到 3D 視角展示地形起伏
   - 開啟等高線後講解海拔數據
   - 結合產區資訊講解風土條件

3. **性能考量**：
   - 在較舊的設備上，建議分別使用 3D 功能和等高線功能
   - 同時開啟所有功能可能需要較高的圖形處理能力

## 🐛 已知限制

1. 等高線數據在高縮放層級（>14）時可能不夠密集
2. 3D 地形在某些區域可能因數據精度而略顯粗糙
3. 移動設備上 3D 渲染可能消耗較多電量

## 🔮 未來改進方向

- [ ] 添加海拔高度查詢工具（點擊任意位置顯示高度）
- [ ] 提供不同的地形誇張係數選項（1.0x, 1.5x, 2.0x）
- [ ] 添加坡度分析功能
- [ ] 整合氣候數據圖層
- [ ] 支援自定義等高線顏色和間距

## 📖 相關文檔

- Mapbox 地形文檔: https://docs.mapbox.com/mapbox-gl-js/example/add-terrain/
- Mapbox 等高線文檔: https://docs.mapbox.com/data/tilesets/reference/mapbox-terrain-v2/

## 📝 更新記錄

### 2026年3月22日 - v1.1
- **功能簡化**：將「3D 視角」和「3D 地形」按鈕合併為單一「🏔️ 3D 地形」按鈕
- **使用者體驗改善**：一鍵即可同時開啟 3D 視角和地形效果，操作更直覺
- **視覺優化**：新按鈕採用藍色漸層設計，更突出重要功能
- **狀態同步**：開啟/關閉時同步調整視角（60°/0°）和地形效果

### 2026年3月22日 - v1.0
- 初始版本發布
- 新增 3D 地形功能
- 新增等高線顯示功能
- 新增等高線高度標籤
- 新增資訊欄位收合功能

---

**開發者**: GitHub Copilot  
**最後更新**: 2026年3月22日
