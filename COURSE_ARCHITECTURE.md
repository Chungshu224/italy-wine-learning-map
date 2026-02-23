# 義大利葡萄酒課程系統架構

## 📚 課程概覽

本課程系統提供三個級別的義大利葡萄酒學習路徑，從入門到專家級，共 77 堂課程。

### Level 1 入門級 (🌱 初學者)
- **總時長:** 3-4 小時
- **課程數:** 14 堂
- **章節數:** 5 章
- **難度:** ⭐
- **目標:** 了解義大利葡萄酒基礎知識、5 大經典產區、DOC/DOCG 分級制度

### Level 2 進階級 (🍷 愛好者)
- **總時長:** 6-8 小時
- **課程數:** 28 堂
- **章節數:** 6 章
- **難度:** ⭐⭐
- **前置要求:** 完成 Level 1
- **目標:** 深入了解全國 19 產區、餐酒搭配、品種深入研究

### Level 3 專家級 (🏆 專業人士)
- **總時長:** 10-12 小時
- **課程數:** 35 堂
- **章節數:** 7 章
- **難度:** ⭐⭐⭐
- **前置要求:** 完成 Level 1 & 2
- **目標:** 稀有品種、盲品訓練、產業分析、專業認證

---

## 🗂️ 課程內容檔案結構

```
public/courses/
├── level1/
│   ├── l1-intro-1.json          # 義大利葡萄酒簡介
│   ├── l1-intro-2.json          # DOC/DOCG 分級制度
│   ├── l1-piemonte-1.json       # Piemonte 產區導覽
│   ├── l1-piemonte-2.json       # Barolo & Barbaresco 深入
│   └── ...
├── level2/
│   ├── l2-north-1.json
│   ├── l2-north-2.json
│   └── ...
└── level3/
    ├── l3-rare-1.json
    ├── l3-rare-2.json
    └── ...
```

---

## 📝 課程內容 JSON 格式

每個課程檔案 (`.json`) 包含以下欄位：

```json
{
  "lessonId": "l1-intro-1",
  "title": "課程標題",
  "content": "<h2>課程內容 HTML</h2><p>...</p>",
  "quiz": [
    {
      "question": "問題文字",
      "options": ["選項A", "選項B", "選項C", "選項D"],
      "answer": 2,
      "explanation": "答案解釋"
    }
  ]
}
```

### 欄位說明

- **lessonId:** 唯一識別碼，與 courseLevels.js 中的 id 對應
- **title:** 課程標題
- **content:** 課程內容 (HTML 格式)，支援：
  - `<h2>`, `<h3>` 標題
  - `<p>` 段落
  - `<ul>`, `<ol>`, `<li>` 列表
  - `<strong>`, `<em>` 強調
  - `<div class="highlight-box">` 重點提示框
  - `<p class="tip">` 提示段落
- **quiz:** 課程小測驗（選擇性），每題包含：
  - `question`: 問題
  - `options`: 選項陣列
  - `answer`: 正確答案索引 (0-based)
  - `explanation`: 答案說明

---

## 🎯 互動元素類型

課程中可包含以下互動元素 (在 courseLevels.js 中定義):

1. **map** - 嵌入產區地圖
2. **quiz** - 課程小測驗
3. **flashcard** - 記憶卡練習
4. **comparison** - 對比分析工具
5. **timeline** - 歷史時間軸
6. **video** - 教學影片

---

## 🏗️ 組件架構

### 1. CourseLevelSelector.vue
- **路由:** `/course`
- **功能:** 顯示三個級別的課程卡片、學習路徑圖、課程特色
- **狀態:** 顯示學習進度、解鎖狀態、認證狀態

### 2. CourseModule.vue
- **路由:** `/course/:levelId`
- **功能:** 顯示該級別的所有章節和課程、測驗入口
- **狀態:** 課程完成狀態、模組進度、課程解鎖邏輯

### 3. LessonViewer.vue
- **路由:** `/course/:levelId/lesson/:lessonId`
- **功能:** 
  - 側邊欄章節導航
  - 課程內容顯示
  - 地圖嵌入 (type='map' 時)
  - 互動元素嵌入
  - 上一課/下一課導航
  - 標記完成功能
- **狀態:** 課程完成追蹤

---

## 💾 學習進度儲存

使用 LocalStorage 儲存用戶學習進度：

```javascript
{
  "italy-wine-course-level1": {
    "completedLessons": ["l1-intro-1", "l1-intro-2", ...],
    "examPassed": false,
    "examResult": null
  },
  "italy-wine-course-level2": { ... },
  "italy-wine-course-level3": { ... }
}
```

### 核心函數 (在 courseLevels.js 中)

- `getUserProgress(levelId)` - 取得進度
- `saveUserProgress(levelId, progress)` - 儲存進度
- `checkPrerequisites(level)` - 檢查前置要求

---

## 🎓 測驗與認證系統

### 測驗規格

每個級別都有期末測驗：

| 級別 | 題數 | 時限 | 及格分數 | 認證名稱 |
|------|------|------|----------|----------|
| Level 1 | 30 題 | 30 分鐘 | 70% | 義大利葡萄酒入門認證 |
| Level 2 | 50 題 | 50 分鐘 | 75% | 義大利葡萄酒愛好者認證 |
| Level 3 | 80 題 | 90 分鐘 | 80% | 義大利葡萄酒專家認證 |

### 測驗解鎖條件

- 必須完成該級別所有課程
- 前一級別測驗須通過 (Level 2/3)

---

## 🚀 待開發功能

1. **測驗系統完整實作**
   - 測驗介面組件
   - 計時器功能
   - 成績計算與統計
   
2. **證書生成系統**
   - PDF 證書模板
   - 個人化資訊填入
   - 下載功能

3. **互動組件實作**
   - QuizWidget (課程小測驗)
   - FlashcardWidget (記憶卡)
   - ComparisonWidget (對比工具)
   - TimelineWidget (時間軸)
   - VideoWidget (影片播放器)

4. **課程內容製作**
   - 完成 Level 1 全部 14 堂課內容
   - 完成 Level 2 全部 28 堂課內容
   - 完成 Level 3 全部 35 堂課內容
   - 題庫建立 (總計約 1000+ 題)

5. **進度雲端同步**
   - 用戶帳號系統整合
   - 進度雲端儲存
   - 多裝置同步

6. **社群功能**
   - 學習筆記分享
   - 討論區
   - 學習排行榜

---

## 📊 課程統計

- **總課程數:** 77 堂
- **總學習時數:** 19-24 小時
- **涵蓋產區:** 19 個
- **測驗總題數:** 160 題 (期末測驗)
- **互動元素:** 40+ 個

---

## 🎨 設計風格指引

### 顏色方案

- **Level 1:** `linear-gradient(135deg, #4CAF50, #45a049)` - 綠色系
- **Level 2:** `linear-gradient(135deg, #2196F3, #1976D2)` - 藍色系
- **Level 3:** `linear-gradient(135deg, #9C27B0, #7B1FA2)` - 紫色系
- **通用主色:** `linear-gradient(135deg, #667eea, #764ba2)` - 紫藍漸層

### 圖示規範

使用 Emoji 圖示增加視覺吸引力：
- 🌱 入門級
- 🍷 進階級
- 🏆 專家級
- 🗺️ 地圖相關
- 📝 測驗/作業
- 🎓 認證/證書
- ⏱️ 時間相關
- 🎯 目標/重點

---

## 📱 響應式設計

- **桌面版 (>1024px):** 完整側邊欄 + 主內容區
- **平板版 (768-1024px):** 可收合側邊欄
- **手機版 (<768px):** 浮動側邊欄 + 單欄內容

---

建立日期: 2026-02-21  
最後更新: 2026-02-21
