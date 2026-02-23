# 義大利葡萄酒產區地圖

這是一個互動式義大利葡萄酒產區教學地圖，使用 Vue 3 + Vite + Mapbox GL JS 開發，整合義大利 19 個主要葡萄酒產區的地理位置及詳細資訊展示。

## 功能特色

- **產區選擇首頁**：以卡片形式展示義大利 19 個主要葡萄酒產區
- **互動式地圖**：顯示各產區 DOC/DOCG 的精確地理邊界
- **產區分類**：依 DOCG、DOC、IGP 等類別進行分組
- **詳細資訊**：包含產區介紹、葡萄品種、酒類型等資料
- **3D 視角**：支援 2D/3D 視圖切換，更直觀感受地形特色
- **搜尋功能**：快速尋找特定產區
- **響應式設計**：支援桌面與行動裝置瀏覽

## 技術架構

- **前端框架**：Vue 3 (使用 Composition API)
- **路由管理**：Vue Router 4
- **建置工具**：Vite
- **地圖引擎**：Mapbox GL JS
- **地理資料**：GeoJSON 格式
- **資料處理**：@turf/turf

## 安裝步驟

### 1. 克隆專案

```bash
git clone https://github.com/Chungshu224/italy-wine-learning-map.git
cd italy-wine-learning-map
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 設定環境變數

複製 `.env.example` 到 `.env`：

```bash
cp .env.example .env
```

編輯 `.env` 文件，添加您的 Mapbox Access Token：

```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

> 📝 **取得 Mapbox Token**：  
> 1. 前往 [Mapbox](https://account.mapbox.com/) 註冊帳號  
> 2. 進入 [Access Tokens](https://account.mapbox.com/access-tokens/) 頁面  
> 3. 創建新的 token 或使用預設 token  
> 4. 複製 token 到 `.env` 文件

### 4. 啟動開發伺服器

```bash
npm run dev
```

瀏覽器開啟 `http://localhost:5173` 即可查看應用。

### 5. 建置生產版本

```bash
npm run build
```

建置後的文件在 `dist` 目錄中。

## 專案結構

```
italy-wine-learning-map/
├── public/
│   ├── regions/              # 各大區資料
│   │   ├── {region}/
│   │   │   ├── {region}-regions.json
│   │   │   └── geojson/      # GeoJSON 邊界資料
│   │   │       ├── DOCG/
│   │   │       ├── DOC/
│   │   │       └── IGT/
│   └── courses/              # 課程資料
│       ├── level1/
│       ├── level2/
│       └── level3/
├── src/
│   ├── components/
│   │   ├── MapSection.vue    # 地圖主要組件
│   │   ├── AOCList.vue       # 產區清單
│   │   ├── RegionMap.vue     # 產區地圖容器
│   │   └── ...
│   ├── data/
│   │   ├── regionOverviews.js # 大區基礎資訊
│   │   └── courseLevels.js    # 課程配置
│   ├── router/
│   └── App.vue
├── .env.example              # 環境變數範例
└── README.md
```

## 資料說明

### 葡萄品種分類

系統包含 **200+ 種義大利葡萄品種**，自動分類為：
- 🍷 **紅葡萄品種**：Sangiovese、Nebbiolo、Barbera、Montepulciano 等
- 🥂 **白葡萄品種**：Trebbiano、Verdicchio、Vermentino、Garganega 等
- 🌸 **芳香品種**：Moscato、Gewürztraminer、Malvasia 等

### 產區資料

- **19 個義大利葡萄酒大區**完整資料
- **DOCG/DOC/IGT** 法定產區分類
- **地理邊界** GeoJSON 格式
- **產區詳情**：氣候、土壤、葡萄品種、代表酒款等

## 授權

本專案僅供教學使用。

## 作者

Chungshu224
