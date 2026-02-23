export const courseLevels = {
  level1: {
    id: 'level1',
    title: "Level 1 - 義大利葡萄酒入門",
    subtitle: "建立基礎知識，探索經典產區",
    duration: "3-4 小時",
    difficulty: "入門",
    icon: "🌱",
    color: "#4CAF50",
    totalLessons: 14,
    modules: [
      {
        id: "L1M1",
        title: "第一章：義大利葡萄酒基礎",
        description: "認識義大利葡萄酒的歷史、分級制度與地理環境",
        lessons: [
          {
            id: "L1M1L1",
            title: "義大利葡萄酒簡介",
            duration: "10 分鐘",
            type: "video",
            completed: false
          },
          {
            id: "L1M1L2",
            title: "義大利分級制度 (DOCG/DOC/IGT)",
            duration: "12 分鐘",
            type: "interactive",
            completed: false
          },
          {
            id: "L1M1L3",
            title: "義大利地理與氣候",
            duration: "15 分鐘",
            type: "map",
            completed: false
          }
        ]
      },
      {
        id: "L1M2",
        title: "第二章：五大必學產區",
        description: "深入了解 Piedmont、Tuscany、Veneto、Sicily、Lombardy",
        lessons: [
          {
            id: "L1M2L1",
            title: "Piedmont 皮埃蒙特 - 霧中之王",
            duration: "20 分鐘",
            type: "region",
            mapRegion: "piedmont",
            keyWines: ["Barolo DOCG", "Barbaresco DOCG"],
            completed: false
          },
          {
            id: "L1M2L2",
            title: "Tuscany 托斯卡納 - 經典之美",
            duration: "20 分鐘",
            type: "region",
            mapRegion: "tuscany",
            keyWines: ["Chianti Classico DOCG", "Brunello di Montalcino DOCG"],
            completed: false
          },
          {
            id: "L1M2L3",
            title: "Veneto 威尼托 - 水都風情",
            duration: "18 分鐘",
            type: "region",
            mapRegion: "veneto",
            keyWines: ["Amarone della Valpolicella DOCG", "Prosecco DOC"],
            completed: false
          },
          {
            id: "L1M2L4",
            title: "Sicily 西西里 - 火山之島",
            duration: "15 分鐘",
            type: "region",
            mapRegion: "sicily",
            keyWines: ["Etna DOC", "Cerasuolo di Vittoria DOCG"],
            completed: false
          },
          {
            id: "L1M2L5",
            title: "Lombardy 倫巴第 - 氣泡之鄉",
            duration: "12 分鐘",
            type: "region",
            mapRegion: "lombardy",
            keyWines: ["Franciacorta DOCG"],
            completed: false
          }
        ]
      },
      {
        id: "L1M3",
        title: "第三章：基礎品種認識",
        description: "掌握義大利十大經典葡萄品種",
        lessons: [
          {
            id: "L1M3L1",
            title: "五大紅葡萄品種",
            duration: "25 分鐘",
            type: "grapes",
            grapes: ["Nebbiolo", "Sangiovese", "Corvina", "Nero d'Avola", "Aglianico"],
            completed: false
          },
          {
            id: "L1M3L2",
            title: "五大白葡萄品種",
            duration: "20 分鐘",
            type: "grapes",
            grapes: ["Pinot Grigio", "Vermentino", "Trebbiano", "Fiano", "Verdicchio"],
            completed: false
          }
        ]
      },
      {
        id: "L1M4",
        title: "第四章：基礎餐酒搭配",
        description: "學習義大利料理與葡萄酒的經典搭配",
        lessons: [
          {
            id: "L1M4L1",
            title: "義式料理與葡萄酒入門",
            duration: "20 分鐘",
            type: "pairing",
            completed: false
          },
          {
            id: "L1M4L2",
            title: "地域性配對原則",
            duration: "15 分鐘",
            type: "theory",
            completed: false
          }
        ]
      },
      {
        id: "L1M5",
        title: "Level 1 總複習與測驗",
        description: "完成測驗獲得 Level 1 認證",
        lessons: [],
        exam: {
          questions: 20,
          passingScore: 70,
          timeLimit: 30,
          certificateName: "義大利葡萄酒入門認證"
        }
      }
    ]
  },

  level2: {
    id: 'level2',
    title: "Level 2 - 義大利葡萄酒進階",
    subtitle: "深入探索全國產區，掌握餐酒搭配",
    duration: "6-8 小時",
    difficulty: "進階",
    icon: "🍷",
    color: "#FF9800",
    totalLessons: 28,
    prerequisites: ["完成 Level 1"],
    modules: [
      {
        id: "L2M1",
        title: "第一章：北義產區全覽",
        description: "探索 Trentino、Friuli、Liguria、Emilia-Romagna",
        lessons: [
          {
            id: "L2M1L1",
            title: "Trentino-Alto Adige 特倫蒂諾-上阿迪傑",
            duration: "25 分鐘",
            mapRegion: "trentino",
            completed: false
          },
          {
            id: "L2M1L2",
            title: "Friuli Venezia Giulia 弗留利",
            duration: "25 分鐘",
            mapRegion: "friuli",
            completed: false
          },
          {
            id: "L2M1L3",
            title: "Liguria 利古里亞",
            duration: "20 分鐘",
            mapRegion: "liguria",
            completed: false
          },
          {
            id: "L2M1L4",
            title: "Emilia-Romagna 艾米利亞-羅馬涅",
            duration: "22 分鐘",
            mapRegion: "emilia",
            completed: false
          }
        ]
      },
      {
        id: "L2M2",
        title: "第二章：中義產區深度",
        description: "Marche、Umbria、Lazio、Abruzzo 完整解析",
        lessons: [
          {
            id: "L2M2L1",
            title: "Marche 馬爾凱",
            duration: "20 分鐘",
            mapRegion: "marche",
            completed: false
          },
          {
            id: "L2M2L2",
            title: "Umbria 翁布里亞",
            duration: "22 分鐘",
            mapRegion: "umbria",
            completed: false
          },
          {
            id: "L2M2L3",
            title: "Lazio 拉齊奧",
            duration: "18 分鐘",
            mapRegion: "lazio",
            completed: false
          },
          {
            id: "L2M2L4",
            title: "Abruzzo 阿布魯佐",
            duration: "20 分鐘",
            mapRegion: "abruzzo",
            completed: false
          },
          {
            id: "L2M2L5",
            title: "Molise 莫利塞",
            duration: "15 分鐘",
            mapRegion: "molise",
            completed: false
          }
        ]
      },
      {
        id: "L2M3",
        title: "第三章：南義與島嶼",
        description: "Campania、Puglia、Basilicata、Calabria、Sardinia",
        lessons: [
          {
            id: "L2M3L1",
            title: "Campania 坎帕尼亞",
            duration: "25 分鐘",
            mapRegion: "campania",
            completed: false
          },
          {
            id: "L2M3L2",
            title: "Puglia 普利亞",
            duration: "25 分鐘",
            mapRegion: "puglia",
            completed: false
          },
          {
            id: "L2M3L3",
            title: "Basilicata 巴西利卡塔",
            duration: "18 分鐘",
            mapRegion: "basilicata",
            completed: false
          },
          {
            id: "L2M3L4",
            title: "Calabria 卡拉布里亞",
            duration: "18 分鐘",
            mapRegion: "calabria",
            completed: false
          },
          {
            id: "L2M3L5",
            title: "Sardinia 撒丁島",
            duration: "25 分鐘",
            mapRegion: "sardinia",
            completed: false
          }
        ]
      },
      {
        id: "L2M4",
        title: "第四章：進階品種研究",
        description: "20 種重要葡萄品種深度解析",
        lessons: [
          {
            id: "L2M4L1",
            title: "北義紅葡萄品種",
            duration: "30 分鐘",
            completed: false
          },
          {
            id: "L2M4L2",
            title: "中南義紅葡萄品種",
            duration: "30 分鐘",
            completed: false
          },
          {
            id: "L2M4L3",
            title: "北義白葡萄品種",
            duration: "25 分鐘",
            completed: false
          },
          {
            id: "L2M4L4",
            title: "中南義白葡萄品種",
            duration: "25 分鐘",
            completed: false
          }
        ]
      },
      {
        id: "L2M5",
        title: "第五章：餐酒搭配藝術",
        description: "掌握專業餐酒搭配技巧",
        lessons: [
          {
            id: "L2M5L1",
            title: "義大利料理與葡萄酒",
            duration: "30 分鐘",
            completed: false
          },
          {
            id: "L2M5L2",
            title: "乳酪與葡萄酒配對",
            duration: "25 分鐘",
            completed: false
          },
          {
            id: "L2M5L3",
            title: "季節性餐酒搭配",
            duration: "20 分鐘",
            completed: false
          }
        ]
      },
      {
        id: "L2M6",
        title: "Level 2 認證測驗",
        description: "完成進階認證",
        lessons: [],
        exam: {
          questions: 40,
          passingScore: 75,
          timeLimit: 60,
          certificateName: "義大利葡萄酒進階認證"
        }
      }
    ]
  },

  level3: {
    id: 'level3',
    title: "Level 3 - 義大利葡萄酒專家",
    subtitle: "大師級知識、盲品技巧、產業深度",
    duration: "10-12 小時",
    difficulty: "專家",
    icon: "🏆",
    color: "#9C27B0",
    totalLessons: 35,
    prerequisites: ["完成 Level 1", "完成 Level 2"],
    modules: [
      {
        id: "L3M1",
        title: "第一章：稀有品種與小產區",
        description: "探索 50 種稀有原生品種與隱藏寶石產區",
        lessons: [
          {
            id: "L3M1L1",
            title: "北義稀有品種 (Timorasso, Ruché, Freisa)",
            duration: "40 分鐘",
            completed: false
          },
          {
            id: "L3M1L2",
            title: "中義稀有品種 (Ciliegiolo, Cesanese)",
            duration: "35 分鐘",
            completed: false
          },
          {
            id: "L3M1L3",
            title: "南義原生品種寶庫",
            duration: "40 分鐘",
            completed: false
          },
          {
            id: "L3M1L4",
            title: "隱藏寶石產區 (Carema, Boca, Gattinara)",
            duration: "35 分鐘",
            completed: false
          }
        ]
      },
      {
        id: "L3M2",
        title: "第二章：酒標解讀專家課",
        description: "深度理解義大利酒標系統",
        lessons: [
          {
            id: "L3M2L1",
            title: "MGA 與 Cru 系統",
            duration: "30 分鐘",
            completed: false
          },
          {
            id: "L3M2L2",
            title: "歷史酒莊與分級",
            duration: "30 分鐘",
            completed: false
          },
          {
            id: "L3M2L3",
            title: "生產者風格辨識",
            duration: "35 分鐘",
            completed: false
          },
          {
            id: "L3M2L4",
            title: "Riserva vs Superiore 解析",
            duration: "25 分鐘",
            completed: false
          }
        ]
      },
      {
        id: "L3M3",
        title: "第三章：年份與陳年",
        description: "掌握義大利經典年份與陳年潛力評估",
        lessons: [
          {
            id: "L3M3L1",
            title: "Barolo 與 Barbaresco 經典年份",
            duration: "40 分鐘",
            completed: false
          },
          {
            id: "L3M3L2",
            title: "Brunello 與 Chianti 年份指南",
            duration: "35 分鐘",
            completed: false
          },
          {
            id: "L3M3L3",
            title: "Amarone 陳年特性",
            duration: "30 分鐘",
            completed: false
          },
          {
            id: "L3M3L4",
            title: "陳年潛力評估技巧",
            duration: "30 分鐘",
            completed: false
          }
        ]
      },
      {
        id: "L3M4",
        title: "第四章：盲品訓練",
        description: "系統化盲品方法與實戰練習",
        lessons: [
          {
            id: "L3M4L1",
            title: "系統化品酒法 (SAT Method)",
            duration: "45 分鐘",
            completed: false
          },
          {
            id: "L3M4L2",
            title: "義大利紅葡萄酒盲品特徵",
            duration: "50 分鐘",
            completed: false
          },
          {
            id: "L3M4L3",
            title: "義大利白葡萄酒盲品技巧",
            duration: "45 分鐘",
            completed: false
          },
          {
            id: "L3M4L4",
            title: "氣泡酒風格辨識",
            duration: "40 分鐘",
            completed: false
          },
          {
            id: "L3M4L5",
            title: "實戰盲品練習 (互動)",
            duration: "60 分鐘",
            type: "interactive",
            completed: false
          }
        ]
      },
      {
        id: "L3M5",
        title: "第五章：產業與市場",
        description: "了解義大利葡萄酒產業生態",
        lessons: [
          {
            id: "L3M5L1",
            title: "義大利葡萄酒產業結構",
            duration: "30 分鐘",
            completed: false
          },
          {
            id: "L3M5L2",
            title: "投資級葡萄酒分析",
            duration: "35 分鐘",
            completed: false
          },
          {
            id: "L3M5L3",
            title: "自然酒與有機趨勢",
            duration: "25 分鐘",
            completed: false
          },
          {
            id: "L3M5L4",
            title: "氣候變遷的影響",
            duration: "30 分鐘",
            completed: false
          }
        ]
      },
      {
        id: "L3M6",
        title: "第六章：專業侍酒技巧",
        description: "掌握高級侍酒服務技能",
        lessons: [
          {
            id: "L3M6L1",
            title: "進階餐酒搭配理論",
            duration: "35 分鐘",
            completed: false
          },
          {
            id: "L3M6L2",
            title: "老酒的侍酒與醒酒藝術",
            duration: "30 分鐘",
            completed: false
          },
          {
            id: "L3M6L3",
            title: "酒單設計與庫存管理",
            duration: "25 分鐘",
            completed: false
          }
        ]
      },
      {
        id: "L3M7",
        title: "大師級認證考試",
        description: "完成專家級認證",
        lessons: [],
        exam: {
          writtenQuestions: 60,
          blindTasting: 6,
          essayQuestions: 3,
          passingScore: 80,
          timeLimit: 180,
          certificateName: "義大利葡萄酒專家認證 (Italian Wine Expert)"
        }
      }
    ]
  }
}

// 獲取課程總覽統計
export function getCourseStats() {
  const stats = {
    totalLevels: 3,
    totalModules: 0,
    totalLessons: 0,
    totalDuration: 0
  }

  Object.values(courseLevels).forEach(level => {
    stats.totalModules += level.modules.length
    stats.totalLessons += level.totalLessons
  })

  return stats
}

// 獲取用戶進度
export function getUserProgress(levelId) {
  const storageKey = `course_progress_${levelId}`
  const saved = localStorage.getItem(storageKey)
  return saved ? JSON.parse(saved) : {
    currentModule: null,
    currentLesson: null,
    completedLessons: [],
    examPassed: false,
    score: 0
  }
}

// 保存用戶進度
export function saveUserProgress(levelId, progress) {
  const storageKey = `course_progress_${levelId}`
  localStorage.setItem(storageKey, JSON.stringify(progress))
}

// 測試模式：開啟所有課程
const TEST_MODE = true

// 檢查前置課程是否完成
export function checkPrerequisites(level) {
  // 測試模式下所有課程解鎖
  if (TEST_MODE) {
    return true
  }
  
  if (!level.prerequisites) return true
  
  // 簡化檢查：檢查前一個 level 是否有進度
  if (level.id === 'level2') {
    const level1Progress = getUserProgress('level1')
    return level1Progress.examPassed
  }
  
  if (level.id === 'level3') {
    const level1Progress = getUserProgress('level1')
    const level2Progress = getUserProgress('level2')
    return level1Progress.examPassed && level2Progress.examPassed
  }
  
  return true
}
