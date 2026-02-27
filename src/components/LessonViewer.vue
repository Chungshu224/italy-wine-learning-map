<template>
  <div v-if="level && currentModule && currentLesson" class="lesson-viewer" :style="{ '--level-color': level.color }" @keydown="handleKeydown" tabindex="0">

    <!-- ── 頂部導覽列 ── -->
    <header class="top-bar">
      <div class="top-bar-left">
        <button class="btn-back" @click="goBack">← 返回章節</button>
        <div class="breadcrumb-compact">
          <span class="bc-module">{{ currentModule.title }}</span>
          <span class="bc-sep">›</span>
          <span class="bc-lesson">{{ currentLesson.title }}</span>
        </div>
      </div>
      <div class="top-bar-center">
        <!-- 投影片進度點 -->
        <div class="slide-dots" v-if="slides.length > 1 || quizData">
          <button
            v-for="(_, i) in slides"
            :key="i"
            :class="['dot', { active: currentSlide === i && !isQuizMode }]"
            @click="goToSlide(i)"
          ></button>
          <button
            v-if="quizData"
            :class="['dot', 'dot-quiz', { active: isQuizMode }]"
            @click="startQuiz"
            title="隨堂測驗"
          >📝</button>
        </div>
        <span class="slide-counter" v-if="slides.length > 1 && !isQuizMode">{{ currentSlide + 1 }} / {{ slides.length }}</span>
        <span class="slide-counter" v-else-if="isQuizMode">隨堂測驗</span>
      </div>
      <div class="top-bar-right">
        <button class="btn-sidebar-toggle" @click="toggleSidebar">
          {{ sidebarCollapsed ? '☰ 課程目錄' : '✕ 隱藏目錄' }}
        </button>
        <button v-if="!isLessonCompleted(currentLesson.id)"
                class="btn-complete"
                @click="markAsCompleted">
          ✓ 標記完成
        </button>
        <span v-else class="badge-done">✓ 已完成</span>
      </div>
    </header>

    <!-- ── 主體區域 ── -->
    <div class="body-area">

      <!-- 側邊課程目錄 -->
      <transition name="sidebar-slide">
        <aside v-if="!sidebarCollapsed" class="sidebar">
          <div class="sidebar-module-title">{{ currentModule.title }}</div>
          <div class="sidebar-progress">{{ moduleCompletedCount }}/{{ currentModule.lessons.length }} 完成</div>

          <div class="lesson-list">
            <div
              v-for="(lesson, index) in currentModule.lessons"
              :key="lesson.id"
              :class="['lesson-nav-item',
                { active: lesson.id === currentLesson.id,
                  completed: isLessonCompleted(lesson.id) }]"
              @click="navigateToLesson(lesson, index)"
            >
              <div class="lesson-nav-number">
                <span v-if="isLessonCompleted(lesson.id)">✓</span>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="lesson-nav-info">
                <div class="lesson-nav-title">{{ lesson.title }}</div>
                <div class="lesson-nav-meta">
                  <span class="type-badge">{{ getTypeLabel(lesson.type) }}</span>
                  <span>{{ lesson.duration }}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </transition>

      <!-- 投影片主畫面 -->
      <main class="stage">
        <!-- 地圖課型 -->
        <div v-if="currentLesson.type === 'map' && currentLesson.mapRegion" class="map-slide">
          <div class="map-slide-text">
            <h1>{{ currentLesson.title }}</h1>
            <div class="lesson-meta-chips">
              <span class="chip chip-type">{{ getTypeLabel(currentLesson.type) }}</span>
              <span class="chip">⏱️ {{ currentLesson.duration }}</span>
              <span class="chip">🗺️ {{ currentLesson.mapRegion }}</span>
            </div>
            <div v-if="lessonContent" class="map-description" v-html="lessonContent"></div>
          </div>
          <div class="map-slide-iframe">
            <iframe :src="getMapUrl(currentLesson.mapRegion)" frameborder="0"></iframe>
          </div>
        </div>

        <!-- 投影片模式 -->
        <template v-else-if="slides.length > 0">
          <transition :name="slideTransition" mode="out-in">
            <!-- 測驗模式 -->
            <div v-if="isQuizMode" class="slide-frame quiz-frame" :key="'quiz'">
              <div class="quiz-container">
                <h2>📝 隨堂測驗</h2>
                <div v-if="!quizCompleted" class="quiz-content">
                  <div class="quiz-progress">問題 {{ currentQuizIndex + 1 }} / {{ quizData.length }}</div>
                  <h3 class="quiz-question">{{ currentQuizQuestion.question }}</h3>
                  <div class="quiz-options">
                    <button 
                      v-for="(option, index) in currentQuizQuestion.options" 
                      :key="index"
                      :class="['quiz-option', { 
                        'selected': selectedAnswer === index,
                        'correct': showAnswer && index === currentQuizQuestion.answer,
                        'wrong': showAnswer && selectedAnswer === index && index !== currentQuizQuestion.answer
                      }]"
                      @click="selectAnswer(index)"
                      :disabled="showAnswer"
                    >
                      <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
                      <span class="option-text">{{ option }}</span>
                    </button>
                  </div>
                  
                  <div v-if="showAnswer" class="quiz-feedback" :class="isCorrect ? 'feedback-correct' : 'feedback-wrong'">
                    <div class="feedback-icon">{{ isCorrect ? '✅' : '❌' }}</div>
                    <div class="feedback-text">
                      <h4>{{ isCorrect ? '答對了！' : '答錯了！' }}</h4>
                      <p>{{ currentQuizQuestion.explanation }}</p>
                    </div>
                  </div>
                  
                  <div class="quiz-actions">
                    <button 
                      v-if="!showAnswer" 
                      class="btn-quiz-submit" 
                      :disabled="selectedAnswer === null"
                      @click="submitAnswer"
                    >
                      確認答案
                    </button>
                    <button 
                      v-else 
                      class="btn-quiz-next" 
                      @click="nextQuizQuestion"
                    >
                      {{ currentQuizIndex < quizData.length - 1 ? '下一題' : '查看結果' }}
                    </button>
                  </div>
                </div>
                
                <div v-else class="quiz-result">
                  <div class="result-score">
                    <div class="score-circle" :class="{'score-pass': quizScore >= 60}">
                      {{ quizScore }}<span>分</span>
                    </div>
                  </div>
                  <h3>{{ quizScore >= 60 ? '🎉 恭喜完成測驗！' : '💪 再接再厲！' }}</h3>
                  <p>您答對了 {{ correctCount }} 題，共 {{ quizData.length }} 題。</p>
                  <div class="result-actions">
                    <button class="btn-quiz-retry" @click="retryQuiz">重新測驗</button>
                    <button class="btn-quiz-finish" @click="finishQuizAndNext">完成並繼續</button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 一般投影片 -->
            <div
              v-else
              class="slide-frame"
              :key="currentSlide"
              v-html="slides[currentSlide]"
            ></div>
          </transition>
        </template>

        <!-- 載入中 -->
        <div v-else class="loading-slide">
          <div class="spinner"></div>
          <p>載入課程內容中…</p>
        </div>

        <!-- 左右翻頁按鈕 -->
        <button
          v-if="(slides.length > 1 || hasPrevLesson) && !isQuizMode"
          class="nav-arrow nav-arrow--left"
          :disabled="currentSlide === 0 && !hasPrevLesson"
          @click="goPrev"
        >&#8592;</button>

        <button
          v-if="(slides.length > 1 || hasNextLesson) && !isQuizMode"
          class="nav-arrow nav-arrow--right"
          :disabled="currentSlide === slides.length - 1 && !hasNextLesson && !quizData"
          @click="goNext"
        >&#8594;</button>
      </main>
    </div>

  </div>
  <div v-else class="loading-page">
    <div class="spinner-large"></div>
    <p>載入課程中...</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { courseLevels, getUserProgress, saveUserProgress } from '../data/courseLevels'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const router = useRouter()

const props = defineProps({
  levelId: { type: String, required: true },
  lessonId: { type: String, required: true }
})

const sidebarCollapsed = ref(false)
const lessonContent = ref(null)
const slides = ref([])
const currentSlide = ref(0)
const slideTransition = ref('slide-left')

// ─── 地圖相關狀態 ───
let italyMap = null
let piedmontMap = null
let tuscanyMap = null
let venetoMap = null
let sicilyMap = null
let lombardyMap = null
let trentinoMap = null
let friuliMap = null
let liguriaMap = null
let emiliaMap = null
let marcheMap = null
let umbriaMap = null
let lazioMap = null

// ─── 測驗相關狀態 ───
const quizData = ref(null)
const isQuizMode = ref(false)
const currentQuizIndex = ref(0)
const selectedAnswer = ref(null)
const showAnswer = ref(false)
const isCorrect = ref(false)
const correctCount = ref(0)
const quizCompleted = ref(false)

const currentQuizQuestion = computed(() => {
  if (!quizData.value || quizData.value.length === 0) return null
  return quizData.value[currentQuizIndex.value]
})

const quizScore = computed(() => {
  if (!quizData.value || quizData.value.length === 0) return 0
  return Math.round((correctCount.value / quizData.value.length) * 100)
})

const startQuiz = () => {
  isQuizMode.value = true
  slideTransition.value = 'slide-left'
}

const goToSlide = (index) => {
  isQuizMode.value = false
  currentSlide.value = index
}

const selectAnswer = (index) => {
  if (showAnswer.value) return
  selectedAnswer.value = index
}

const submitAnswer = () => {
  if (selectedAnswer.value === null) return
  showAnswer.value = true
  isCorrect.value = selectedAnswer.value === currentQuizQuestion.value.answer
  if (isCorrect.value) {
    correctCount.value++
  }
}

const nextQuizQuestion = () => {
  if (currentQuizIndex.value < quizData.value.length - 1) {
    currentQuizIndex.value++
    selectedAnswer.value = null
    showAnswer.value = false
    isCorrect.value = false
  } else {
    quizCompleted.value = true
    if (quizScore.value >= 60) {
      markAsCompleted()
    }
  }
}

const retryQuiz = () => {
  currentQuizIndex.value = 0
  selectedAnswer.value = null
  showAnswer.value = false
  isCorrect.value = false
  correctCount.value = 0
  quizCompleted.value = false
}

const finishQuizAndNext = () => {
  if (hasNextLesson.value) {
    gotoNextLesson()
  } else {
    goBack()
  }
}

// ─── 解析 HTML 內容為投影片陣列 ───
const parseSlides = (htmlContent) => {
  if (!htmlContent) return []
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  // 取出 <section> 元素（slides wrapper）
  const sections = doc.querySelectorAll('section')
  if (sections.length > 0) {
    return Array.from(sections).map(s => s.outerHTML)
  }
  // 若無 section，整體視為單一投影片
  return [htmlContent]
}

const level = computed(() => courseLevels[props.levelId])
const progress = ref(getUserProgress(props.levelId))

// 找到當前課程所在的模組
const currentModuleIndex = computed(() => {
  if (!level.value || !level.value.modules) return 0
  for (let i = 0; i < level.value.modules.length; i++) {
    const lesson = level.value.modules[i].lessons.find(l => l.id === props.lessonId)
    if (lesson) return i
  }
  return 0
})

const currentModule = computed(() => {
  if (!level.value || !level.value.modules) return null
  return level.value.modules[currentModuleIndex.value]
})

const currentLessonIndex = computed(() => {
  if (!currentModule.value || !currentModule.value.lessons) return 0
  return currentModule.value.lessons.findIndex(l => l.id === props.lessonId)
})

const currentLesson = computed(() => {
  if (!currentModule.value || !currentModule.value.lessons) return null
  return currentModule.value.lessons[currentLessonIndex.value]
})

const moduleCompletedCount = computed(() => {
  if (!currentModule.value || !currentModule.value.lessons) return 0
  return currentModule.value.lessons.filter(lesson => 
    isLessonCompleted(lesson.id)
  ).length
})

const hasPrevLesson = computed(() => {
  return currentModuleIndex.value > 0 || currentLessonIndex.value > 0
})

const hasNextLesson = computed(() => {
  if (!currentModule.value || !level.value) return false
  const isLastLessonInModule = currentLessonIndex.value === currentModule.value.lessons.length - 1
  const isLastModule = currentModuleIndex.value === level.value.modules.length - 1
  return !(isLastLessonInModule && isLastModule)
})

const isLessonCompleted = (lessonId) => {
  return progress.value.completedLessons?.includes(lessonId) || false
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const navigateToLesson = (lesson, index) => {
  router.push({
    path: `/course/${props.levelId}/lesson/${lesson.id}`,
    query: { module: currentModuleIndex.value, index }
  })
}

const markAsCompleted = () => {
  if (!currentLesson.value) return
  if (!progress.value.completedLessons) progress.value.completedLessons = []
  if (!isLessonCompleted(currentLesson.value.id)) {
    progress.value.completedLessons.push(currentLesson.value.id)
    saveUserProgress(props.levelId, progress.value)
  }
  if (hasNextLesson.value) setTimeout(() => gotoNextLesson(), 500)
}

// ─── 統一的前進/後退 ───
const goPrev = () => {
  if (isQuizMode.value) {
    isQuizMode.value = false
    currentSlide.value = slides.value.length - 1
    slideTransition.value = 'slide-right'
  } else if (currentSlide.value > 0) {
    slideTransition.value = 'slide-right'
    currentSlide.value--
  } else if (hasPrevLesson.value) {
    gotoPrevLesson()
  }
}

const goNext = () => {
  if (isQuizMode.value) return
  
  if (currentSlide.value < slides.value.length - 1) {
    slideTransition.value = 'slide-left'
    currentSlide.value++
  } else if (quizData.value) {
    startQuiz()
  } else if (hasNextLesson.value) {
    gotoNextLesson()
  }
}

const handleKeydown = (e) => {
  if (isQuizMode.value && !quizCompleted.value) {
    // 測驗模式下的鍵盤操作
    if (e.key >= '1' && e.key <= '4') {
      const index = parseInt(e.key) - 1
      if (currentQuizQuestion.value && index < currentQuizQuestion.value.options.length) {
        selectAnswer(index)
      }
    } else if (e.key === 'Enter') {
      if (!showAnswer.value && selectedAnswer.value !== null) {
        submitAnswer()
      } else if (showAnswer.value) {
        nextQuizQuestion()
      }
    }
    return
  }
  
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev()
}

const gotoPrevLesson = () => {
  if (!hasPrevLesson.value || !currentModule.value || !level.value) return
  if (currentLessonIndex.value > 0) {
    navigateToLesson(currentModule.value.lessons[currentLessonIndex.value - 1], currentLessonIndex.value - 1)
  } else {
    const prevModule = level.value.modules[currentModuleIndex.value - 1]
    const prevLesson = prevModule.lessons[prevModule.lessons.length - 1]
    router.push({ path: `/course/${props.levelId}/lesson/${prevLesson.id}`, query: { module: currentModuleIndex.value - 1, index: prevModule.lessons.length - 1 } })
  }
}

const gotoNextLesson = () => {
  if (!hasNextLesson.value || !currentModule.value || !level.value) return
  if (currentLessonIndex.value < currentModule.value.lessons.length - 1) {
    navigateToLesson(currentModule.value.lessons[currentLessonIndex.value + 1], currentLessonIndex.value + 1)
  } else {
    const nextModule = level.value.modules[currentModuleIndex.value + 1]
    const nextLesson = nextModule.lessons[0]
    router.push({ path: `/course/${props.levelId}/lesson/${nextLesson.id}`, query: { module: currentModuleIndex.value + 1, index: 0 } })
  }
}

const goBack = () => { router.push(`/course/${props.levelId}`) }

const getTypeLabel = (type) => {
  const labels = { theory: '理論', map: '地圖', interactive: '互動', tasting: '品鑑', pairing: '搭配', quiz: '測驗' }
  return labels[type] || type
}

const getMapUrl = (regionName) => {
  const regionMap = {
    'Piemonte': 'piedmont', 'Toscana': 'tuscany', 'Veneto': 'veneto',
    'Lombardia': 'lombardy', 'Trentino-Alto Adige': 'trentino',
    'Friuli-Venezia Giulia': 'friuli', 'Emilia-Romagna': 'emilia',
    'Marche': 'marche', 'Umbria': 'umbria', 'Lazio': 'lazio',
    'Abruzzo': 'abruzzo', 'Campania': 'campania', 'Puglia': 'puglia',
    'Basilicata': 'basilicata', 'Calabria': 'calabria', 'Sicilia': 'sicily',
    'Sardegna': 'sardinia', 'Liguria': 'liguria', 'Molise': 'molise'
  }
  return `${window.location.origin}/region/${regionMap[regionName] || regionName.toLowerCase()}`
}

const loadLessonContent = async () => {
  lessonContent.value = null
  slides.value = []
  currentSlide.value = 0
  quizData.value = null
  isQuizMode.value = false
  currentQuizIndex.value = 0
  selectedAnswer.value = null
  showAnswer.value = false
  isCorrect.value = false
  correctCount.value = 0
  quizCompleted.value = false
  
  // 清理舊地圖
  if (italyMap) {
    italyMap.remove()
    italyMap = null
  }
  if (piedmontMap) {
    piedmontMap.remove()
    piedmontMap = null
  }
  
  try {
    const response = await fetch(`/courses/${props.levelId}/${props.lessonId}.json`)
    if (response.ok) {
      const data = await response.json()
      lessonContent.value = data.content
      slides.value = parseSlides(data.content)
      if (data.quiz && data.quiz.length > 0) {
        quizData.value = data.quiz
      }
      
      // 等待 DOM 更新後檢查是否需要初始化地圖
      await nextTick()
      initializeMapIfNeeded()
    } else {
      const fallback = `<section class="slide-cover"><h1>${currentLesson.value?.title || '課程'}</h1><p class="subtitle">課程內容準備中，敬請期待</p></section>`
      lessonContent.value = fallback
      slides.value = [fallback]
    }
  } catch (error) {
    console.error('載入課程內容失敗:', error)
    const errHTML = '<section class="slide-cover"><h1>載入失敗</h1><p>請重新整理頁面</p></section>'
    lessonContent.value = errHTML
    slides.value = [errHTML]
  }
}

// ─── 初始化地圖 (支持多種地圖) ───
const initializeMapIfNeeded = async () => {
  console.log('=== 準備初始化地圖 ===')
  
  // 等待 DOM 更新
  await nextTick()
  
  // 使用 setTimeout 確保投影片動畫和 v-html 已經完全渲染
  setTimeout(() => {
    console.log('檢查地圖容器...')
    
    // 檢查義大利地圖容器
    const italyMapContainer = document.getElementById('italy-map')
    // 檢查 Piedmont 地圖容器
    const piedmontMapContainer = document.getElementById('piedmont-map')
    // 檢查 Tuscany 地圖容器
    const tuscanyMapContainer = document.getElementById('tuscany-map')
    // 檢查 Veneto 地圖容器
    const venetoMapContainer = document.getElementById('veneto-map')
    // 檢查 Sicily 地圖容器
    const sicilyMapContainer = document.getElementById('sicily-map')
    // 檢查 Lombardy 地圖容器
    const lombardyMapContainer = document.getElementById('lombardy-map')
    // 檢查 Trentino 地圖容器
    const trentinoMapContainer = document.getElementById('trentino-map')
    // 檢查 Friuli 地圖容器
    const friuliMapContainer = document.getElementById('friuli-map')
    // 檢查 Liguria 地圖容器
    const liguriaMapContainer = document.getElementById('liguria-map')
    // 檢查 Emilia 地圖容器
    const emiliaMapContainer = document.getElementById('emilia-map')
    // 檢查 Marche 地圖容器
    const marcheMapContainer = document.getElementById('marche-map')
    // 檢查 Umbria 地圖容器
    const umbriaMapContainer = document.getElementById('umbria-map')
    // 檢查 Lazio 地圖容器
    const lazioMapContainer = document.getElementById('lazio-map')
    
    if (italyMapContainer && !italyMap) {
      console.log('✓ 找到義大利地圖容器，開始初始化...')
      initializeItalyMap()
    } else if (piedmontMapContainer && !piedmontMap) {
      console.log('✓ 找到 Piedmont 地圖容器，開始初始化...')
      initializePiedmontMap()
    } else if (tuscanyMapContainer && !tuscanyMap) {
      console.log('✓ 找到 Tuscany 地圖容器，開始初始化...')
      initializeTuscanyMap()
    } else if (venetoMapContainer && !venetoMap) {
      console.log('✓ 找到 Veneto 地圖容器，開始初始化...')
      initializeVenetoMap()
    } else if (sicilyMapContainer && !sicilyMap) {
      console.log('✓ 找到 Sicily 地圖容器，開始初始化...')
      initializeSicilyMap()
    } else if (lombardyMapContainer && !lombardyMap) {
      console.log('✓ 找到 Lombardy 地圖容器，開始初始化...')
      initializeLombardyMap()
    } else if (trentinoMapContainer && !trentinoMap) {
      console.log('✓ 找到 Trentino 地圖容器，開始初始化...')
      initializeTrentinoMap()
    } else if (friuliMapContainer && !friuliMap) {
      console.log('✓ 找到 Friuli 地圖容器，開始初始化...')
      initializeFriuliMap()
    } else if (liguriaMapContainer && !liguriaMap) {
      console.log('✓ 找到 Liguria 地圖容器，開始初始化...')
      initializeLiguriaMap()
    } else if (emiliaMapContainer && !emiliaMap) {
      console.log('✓ 找到 Emilia 地圖容器，開始初始化...')
      initializeEmiliaMap()
    } else if (marcheMapContainer && !marcheMap) {
      console.log('✓ 找到 Marche 地圖容器，開始初始化...')
      initializeMarcheMap()
    } else if (umbriaMapContainer && !umbriaMap) {
      console.log('✓ 找到 Umbria 地圖容器，開始初始化...')
      initializeUmbriaMap()
    } else if (lazioMapContainer && !lazioMap) {
      console.log('✓ 找到 Lazio 地圖容器，開始初始化...')
      initializeLazioMap()
    } else {
      console.log('❌ 未找到地圖容器或地圖已存在')
    }
  }, 600) // 延遲 600ms 確保投影片動畫和 DOM 完全渲染
}

// ─── 初始化義大利地圖 ───
const initializeItalyMap = () => {
  try {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    
    if (!mapboxgl.accessToken) {
      console.error('❌ Mapbox access token 未設置')
      return
    }
    
    console.log('🗺️ 開始初始化義大利地圖...')
    
    italyMap = new mapboxgl.Map({
      container: 'italy-map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [12.5, 42.5], // 義大利中心坐標
      zoom: 5.2,
        pitch: 0,
        bearing: 0
      })
    
    italyMap.addControl(new mapboxgl.NavigationControl(), 'top-right')
    italyMap.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    
    // 添加義大利 20 個產區標記
    italyMap.on('load', () => {
      const regions = [
        // 北部產區
        { name: 'Valle d\'Aosta', nameCN: '奧斯塔谷', coords: [7.2, 45.7], zone: 'north' },
        { name: 'Piemonte', nameCN: '皮埃蒙特', coords: [8.0, 45.0], zone: 'north' },
        { name: 'Liguria', nameCN: '利古里亞', coords: [8.5, 44.3], zone: 'north' },
        { name: 'Lombardy', nameCN: '倫巴第', coords: [10.0, 45.5], zone: 'north' },
        { name: 'Trentino-Alto Adige', nameCN: '特倫蒂諾', coords: [11.3, 46.4], zone: 'north' },
        { name: 'Veneto', nameCN: '威尼托', coords: [11.5, 45.4], zone: 'north' },
        { name: 'Friuli-Venezia Giulia', nameCN: '弗留利', coords: [13.2, 46.0], zone: 'north' },
        { name: 'Emilia-Romagna', nameCN: '艾米利亞', coords: [11.5, 44.5], zone: 'north' },
        
        // 中部產區
        { name: 'Toscana', nameCN: '托斯卡納', coords: [11.2, 43.3], zone: 'central' },
        { name: 'Umbria', nameCN: '翁布里亞', coords: [12.5, 42.9], zone: 'central' },
        { name: 'Marche', nameCN: '馬爾凱', coords: [13.3, 43.3], zone: 'central' },
        { name: 'Lazio', nameCN: '拉齊奧', coords: [12.6, 41.9], zone: 'central' },
        { name: 'Abruzzo', nameCN: '阿布魯佐', coords: [13.8, 42.2], zone: 'central' },
        { name: 'Molise', nameCN: '莫利塞', coords: [14.6, 41.7], zone: 'central' },
        
        // 南部產區
        { name: 'Campania', nameCN: '坎帕尼亞', coords: [14.8, 40.8], zone: 'south' },
        { name: 'Puglia', nameCN: '普利亞', coords: [16.8, 41.0], zone: 'south' },
        { name: 'Basilicata', nameCN: '巴西利卡塔', coords: [16.0, 40.6], zone: 'south' },
        { name: 'Calabria', nameCN: '卡拉布里亞', coords: [16.3, 39.0], zone: 'south' },
        { name: 'Sicilia', nameCN: '西西里', coords: [14.0, 37.5], zone: 'south' },
        { name: 'Sardegna', nameCN: '薩丁尼亞', coords: [9.0, 40.0], zone: 'south' }
      ]
      
      regions.forEach(region => {
        const markerColor = region.zone === 'north' ? '#3498db' : 
                           region.zone === 'central' ? '#27ae60' : '#e74c3c'
        
        const el = document.createElement('div')
        el.className = 'italy-region-marker'
        el.style.cssText = `
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${markerColor};
          border: 2px solid white;
          box-shadow: 0 0 10px ${markerColor};
          cursor: pointer;
          transition: all 0.3s;
        `
        
        el.addEventListener('mouseenter', () => {
          el.style.width = '16px'
          el.style.height = '16px'
        })
        
        el.addEventListener('mouseleave', () => {
          el.style.width = '12px'
          el.style.height = '12px'
        })
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 5px; font-size: 1.1rem; color: #2c3e50;">
                ${region.nameCN} ${region.name}
              </h3>
              <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">
                ${region.zone === 'north' ? '北部產區' : region.zone === 'central' ? '中部產區' : '南部產區'}
              </p>
            </div>
          `)
        
        new mapboxgl.Marker(el)
          .setLngLat(region.coords)
          .setPopup(popup)
          .addTo(italyMap)
      })
      
      console.log('✅ 義大利地圖初始化完成！')
    })
  } catch (error) {
    console.error('❌ 初始化義大利地圖失敗:', error)
  }
}

// ─── 初始化 Piedmont 地圖 ───
const initializePiedmontMap = () => {
  try {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    
    if (!mapboxgl.accessToken) {
      console.error('❌ Mapbox access token 未設置')
      return
    }
    
    console.log('🗺️ 開始初始化 Piedmont 地圖...')
    
    piedmontMap = new mapboxgl.Map({
      container: 'piedmont-map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [8.0, 44.8], // Piedmont 中心坐標
      zoom: 8.5,
      pitch: 0,
      bearing: 0
    })
    
    piedmontMap.addControl(new mapboxgl.NavigationControl(), 'top-right')
    piedmontMap.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    
    // 載入 GeoJSON 並添加產區邊界
    piedmontMap.on('load', async () => {
      console.log('📍 載入 Piedmont GeoJSON 邊界...')
      
      // 首先載入 Piedmont 大區邊界
      try {
        const regionResponse = await fetch('/regions/piedmont/geojson/Piemonte.geojson')
        if (regionResponse.ok) {
          const regionGeojson = await regionResponse.json()
          
          // 添加 Piedmont 大區邊界
          piedmontMap.addSource('piedmont-region', {
            type: 'geojson',
            data: regionGeojson
          })
          
          // 添加大區邊界填充層（淡淡的背景色）
          piedmontMap.addLayer({
            id: 'piedmont-region-fill',
            type: 'fill',
            source: 'piedmont-region',
            paint: {
              'fill-color': '#8e44ad',
              'fill-opacity': 0.08
            }
          })
          
          // 添加大區邊界線（粗一點的金色外框）
          piedmontMap.addLayer({
            id: 'piedmont-region-outline',
            type: 'line',
            source: 'piedmont-region',
            paint: {
              'line-color': '#f39c12',
              'line-width': 3,
              'line-opacity': 0.8
            }
          })
          
          console.log('✓ 載入 Piedmont 大區邊界')
        }
      } catch (error) {
        console.warn('⚠️ 無法載入 Piedmont 大區邊界:', error)
      }
      
      // 定義主要 DOCG 產區及其等級/顏色
      const docgRegions = [
        { name: 'Barolo DOCG', grade: 'S級', color: '#8B0000', fillColor: 'rgba(139, 0, 0, 0.3)' },
        { name: 'Barbaresco DOCG', grade: 'S級', color: '#8E44AD', fillColor: 'rgba(142, 68, 173, 0.3)' },
        { name: 'Roero DOCG', grade: 'A級', color: '#E67E22', fillColor: 'rgba(230, 126, 34, 0.25)' },
        { name: 'Cortese di Gavi Gavi DOCG', grade: 'A級', color: '#16A085', fillColor: 'rgba(22, 160, 133, 0.25)' },
        { name: 'Barbera d\'Asti DOCG', grade: 'A級', color: '#2980B9', fillColor: 'rgba(41, 128, 185, 0.25)' },
        { name: 'Gattinara DOCG', grade: 'B級', color: '#7F8C8D', fillColor: 'rgba(127, 140, 141, 0.2)' },
        { name: 'Ghemme DOCG', grade: 'B級', color: '#95A5A6', fillColor: 'rgba(149, 165, 166, 0.2)' },
        { name: 'Dogliani DOCG', grade: 'B級', color: '#34495E', fillColor: 'rgba(52, 73, 94, 0.2)' },
        { name: 'Asti DOCG', grade: 'C級', color: '#F39C12', fillColor: 'rgba(243, 156, 18, 0.25)' }
      ]
      
      // 載入每個產區的 GeoJSON
      for (const region of docgRegions) {
        try {
          const response = await fetch(`/regions/piedmont/geojson/DOCG/${region.name}.geojson`)
          if (response.ok) {
            const geojson = await response.json()
            
            const sourceId = `${region.name}-source`
            const layerId = `${region.name}-layer`
            const outlineId = `${region.name}-outline`
            
            // 添加數據源
            piedmontMap.addSource(sourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {
                  name: region.name.replace(' DOCG', ''),
                  grade: region.grade
                },
                geometry: geojson
              }
            })
            
            // 添加填充層
            piedmontMap.addLayer({
              id: layerId,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': region.fillColor,
                'fill-opacity': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  0.7,
                  0.4
                ]
              }
            })
            
            // 添加邊界線
            piedmontMap.addLayer({
              id: outlineId,
              type: 'line',
              source: sourceId,
              paint: {
                'line-color': region.color,
                'line-width': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  3,
                  2
                ]
              }
            })
            
            // 添加懸停效果
            let hoveredFeatureId = null
            
            piedmontMap.on('mousemove', layerId, (e) => {
              piedmontMap.getCanvas().style.cursor = 'pointer'
              
              if (hoveredFeatureId !== null) {
                piedmontMap.setFeatureState(
                  { source: sourceId, id: hoveredFeatureId },
                  { hover: false }
                )
              }
              
              hoveredFeatureId = e.features[0].id
              piedmontMap.setFeatureState(
                { source: sourceId, id: hoveredFeatureId },
                { hover: true }
              )
            })
            
            piedmontMap.on('mouseleave', layerId, () => {
              piedmontMap.getCanvas().style.cursor = ''
              
              if (hoveredFeatureId !== null) {
                piedmontMap.setFeatureState(
                  { source: sourceId, id: hoveredFeatureId },
                  { hover: false }
                )
              }
              hoveredFeatureId = null
            })
            
            // 添加點擊彈窗
            piedmontMap.on('click', layerId, (e) => {
              const coordinates = e.lngLat
              const properties = e.features[0].properties
              
              new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(`
                  <div style="padding: 10px;">
                    <div style="background: ${region.color}; color: white; padding: 5px 10px; border-radius: 5px; margin-bottom: 8px; text-align: center; font-size: 0.85rem; font-weight: 600;">
                      ${properties.grade}
                    </div>
                    <h3 style="margin: 0 0 5px; font-size: 1.1rem; color: #2c3e50; font-weight: 700;">
                      ${properties.name}
                    </h3>
                    <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">
                      DOCG 產區
                    </p>
                  </div>
                `)
                .addTo(piedmontMap)
            })
            
            console.log(`✓ 載入 ${region.name}`)
          }
        } catch (error) {
          console.warn(`⚠️ 無法載入 ${region.name}:`, error)
        }
      }
      
      // 添加重要城市標記
      const cities = [
        { name: 'Alba', nameCN: '阿爾巴', coords: [8.03, 44.70], label: '葡萄酒之都' },
        { name: 'Asti', nameCN: '阿斯蒂市', coords: [8.20, 44.90], label: '氣泡酒之鄉' },
        { name: 'Torino', nameCN: '都靈', coords: [7.68, 45.07], label: '首府' }
      ]
      
      cities.forEach(city => {
        const el = document.createElement('div')
        el.className = 'piedmont-city-marker'
        el.style.cssText = `
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #f39c12;
          border: 2px solid white;
          box-shadow: 0 0 10px #f39c12;
          cursor: pointer;
          transition: all 0.3s;
        `
        
        el.addEventListener('mouseenter', () => {
          el.style.width = '14px'
          el.style.height = '14px'
        })
        
        el.addEventListener('mouseleave', () => {
          el.style.width = '10px'
          el.style.height = '10px'
        })
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 10px;">
              <div style="background: #f39c12; color: white; padding: 5px 10px; border-radius: 5px; margin-bottom: 8px; text-align: center; font-size: 0.85rem; font-weight: 600;">
                ${city.label}
              </div>
              <h3 style="margin: 0 0 5px; font-size: 1.1rem; color: #2c3e50; font-weight: 700;">
                ${city.nameCN} ${city.name}
              </h3>
              <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">
                重要城市
              </p>
            </div>
          `)
        
        new mapboxgl.Marker(el)
          .setLngLat(city.coords)
          .setPopup(popup)
          .addTo(piedmontMap)
      })
      
      console.log('✅ Piedmont 地圖初始化完成（含 GeoJSON 邊界）！')
    })
  } catch (error) {
    console.error('❌ 初始化 Piedmont 地圖失敗:', error)
  }
}

// ─── 初始化 Tuscany 地圖 ───
const initializeTuscanyMap = () => {
  try {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    
    if (!mapboxgl.accessToken) {
      console.error('❌ Mapbox access token 未設置')
      return
    }
    
    console.log('🗺️ 開始初始化 Tuscany 地圖...')
    
    tuscanyMap = new mapboxgl.Map({
      container: 'tuscany-map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [11.25, 43.3], // Tuscany 中心坐標
      zoom: 8.0,
      pitch: 0,
      bearing: 0
    })
    
    tuscanyMap.addControl(new mapboxgl.NavigationControl(), 'top-right')
    tuscanyMap.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    
    // 載入 GeoJSON 並添加產區邊界
    tuscanyMap.on('load', async () => {
      console.log('📍 載入 Tuscany GeoJSON 邊界...')
      
      // 首先載入 Tuscany 大區邊界
      try {
        const regionResponse = await fetch('/regions/tuscany/geojson/Toscana.geojson')
        if (regionResponse.ok) {
          const regionGeojson = await regionResponse.json()
          
          // 添加 Tuscany 大區邊界
          tuscanyMap.addSource('tuscany-region', {
            type: 'geojson',
            data: regionGeojson
          })
          
          // 添加大區邊界填充層（淡淡的背景色）
          tuscanyMap.addLayer({
            id: 'tuscany-region-fill',
            type: 'fill',
            source: 'tuscany-region',
            paint: {
              'fill-color': '#c0392b',
              'fill-opacity': 0.08
            }
          })
          
          // 添加大區邊界線（粗一點的金色外框）
          tuscanyMap.addLayer({
            id: 'tuscany-region-outline',
            type: 'line',
            source: 'tuscany-region',
            paint: {
              'line-color': '#f39c12',
              'line-width': 3,
              'line-opacity': 0.8
            }
          })
          
          console.log('✓ 載入 Tuscany 大區邊界')
        }
      } catch (error) {
        console.warn('⚠️ 無法載入 Tuscany 大區邊界:', error)
      }
      
      // 定義主要 DOCG 產區及其等級/顏色
      const docgRegions = [
        { name: 'Brunello di Montalcino DOCG', grade: 'S級', color: '#8B0000', fillColor: 'rgba(192, 57, 43, 0.45)' },
        { name: 'Chianti Classico DOCG', grade: 'S級', color: '#A52A2A', fillColor: 'rgba(165, 42, 42, 0.4)' },
        { name: 'Vino Nobile di Montepulciano DOCG', grade: 'A級', color: '#27ae60', fillColor: 'rgba(39, 174, 96, 0.35)' },
        { name: 'Chianti DOCG', grade: 'A級', color: '#16a085', fillColor: 'rgba(22, 160, 133, 0.3)' },
        { name: 'Vernaccia di San Gimignano DOCG', grade: 'B級', color: '#3498db', fillColor: 'rgba(52, 152, 219, 0.25)' },
        { name: 'Morellino di Scansano DOCG', grade: 'B級', color: '#5DADE2', fillColor: 'rgba(93, 173, 226, 0.25)' }
      ]
      
      // 載入每個產區的 GeoJSON
      for (const region of docgRegions) {
        try {
          const response = await fetch(`/regions/tuscany/geojson/DOCG/${region.name}.geojson`)
          if (response.ok) {
            const geojson = await response.json()
            
            const sourceId = `${region.name}-source`
            const layerId = `${region.name}-layer`
            const outlineId = `${region.name}-outline`
            
            // 添加數據源
            tuscanyMap.addSource(sourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {
                  name: region.name.replace(' DOCG', ''),
                  grade: region.grade
                },
                geometry: geojson
              }
            })
            
            // 添加填充層
            tuscanyMap.addLayer({
              id: layerId,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': region.fillColor,
                'fill-opacity': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  0.7,
                  0.4
                ]
              }
            })
            
            // 添加邊界線
            tuscanyMap.addLayer({
              id: outlineId,
              type: 'line',
              source: sourceId,
              paint: {
                'line-color': region.color,
                'line-width': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  3,
                  2
                ]
              }
            })
            
            // 添加懸停效果
            let hoveredFeatureId = null
            
            tuscanyMap.on('mousemove', layerId, (e) => {
              tuscanyMap.getCanvas().style.cursor = 'pointer'
              
              if (hoveredFeatureId !== null) {
                tuscanyMap.setFeatureState(
                  { source: sourceId, id: hoveredFeatureId },
                  { hover: false }
                )
              }
              
              hoveredFeatureId = e.features[0].id
              tuscanyMap.setFeatureState(
                { source: sourceId, id: hoveredFeatureId },
                { hover: true }
              )
            })
            
            tuscanyMap.on('mouseleave', layerId, () => {
              tuscanyMap.getCanvas().style.cursor = ''
              
              if (hoveredFeatureId !== null) {
                tuscanyMap.setFeatureState(
                  { source: sourceId, id: hoveredFeatureId },
                  { hover: false }
                )
              }
              hoveredFeatureId = null
            })
            
            // 添加點擊彈窗
            tuscanyMap.on('click', layerId, (e) => {
              const coordinates = e.lngLat
              const properties = e.features[0].properties
              
              new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(`
                  <div style="padding: 10px;">
                    <div style="background: ${region.color}; color: white; padding: 5px 10px; border-radius: 5px; margin-bottom: 8px; text-align: center; font-size: 0.85rem; font-weight: 600;">
                      ${properties.grade}
                    </div>
                    <h3 style="margin: 0 0 5px; font-size: 1.1rem; color: #2c3e50; font-weight: 700;">
                      ${properties.name}
                    </h3>
                    <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">
                      DOCG 產區
                    </p>
                  </div>
                `)
                .addTo(tuscanyMap)
            })
            
            console.log(`✓ 載入 ${region.name}`)
          }
        } catch (error) {
          console.warn(`⚠️ 無法載入 ${region.name}:`, error)
        }
      }
      
      // 添加重要城市標記
      const cities = [
        { name: 'Firenze', nameCN: '佛羅倫斯', coords: [11.26, 43.77], label: '首府' },
        { name: 'Siena', nameCN: '錫耶納', coords: [11.33, 43.32], label: '古城' },
        { name: 'Montalcino', nameCN: '蒙塔奇諾', coords: [11.49, 43.06], label: 'Brunello 之鄉' }
      ]
      
      cities.forEach(city => {
        const el = document.createElement('div')
        el.className = 'tuscany-city-marker'
        el.style.cssText = `
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #f39c12;
          border: 2px solid white;
          box-shadow: 0 0 10px #f39c12;
          cursor: pointer;
          transition: all 0.3s;
        `
        
        el.addEventListener('mouseenter', () => {
          el.style.width = '14px'
          el.style.height = '14px'
        })
        
        el.addEventListener('mouseleave', () => {
          el.style.width = '10px'
          el.style.height = '10px'
        })
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 10px;">
              <div style="background: #f39c12; color: white; padding: 5px 10px; border-radius: 5px; margin-bottom: 8px; text-align: center; font-size: 0.85rem; font-weight: 600;">
                ${city.label}
              </div>
              <h3 style="margin: 0 0 5px; font-size: 1.1rem; color: #2c3e50; font-weight: 700;">
                ${city.nameCN} ${city.name}
              </h3>
              <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">
                重要城市
              </p>
            </div>
          `)
        
        new mapboxgl.Marker(el)
          .setLngLat(city.coords)
          .setPopup(popup)
          .addTo(tuscanyMap)
      })
      
      console.log('✅ Tuscany 地圖初始化完成（含 GeoJSON 邊界）！')
    })
  } catch (error) {
    console.error('❌ 初始化 Tuscany 地圖失敗:', error)
  }
}

// ─── 初始化 Veneto 地圖 ───
const initializeVenetoMap = () => {
  try {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    
    if (!mapboxgl.accessToken) {
      console.error('❌ Mapbox access token 未設置')
      return
    }
    
    console.log('🗺️ 開始初始化 Veneto 地圖...')
    
    venetoMap = new mapboxgl.Map({
      container: 'veneto-map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [11.35, 45.5],
      zoom: 8.2,
      pitch: 0,
      bearing: 0
    })
    
    venetoMap.addControl(new mapboxgl.NavigationControl(), 'top-right')
    venetoMap.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    
    venetoMap.on('load', async () => {
      console.log('📍 載入 Veneto GeoJSON 邊界...')
      
      try {
        const regionResponse = await fetch('/regions/veneto/geojson/Veneto.geojson')
        if (regionResponse.ok) {
          const regionGeojson = await regionResponse.json()
          
          venetoMap.addSource('veneto-region', {
            type: 'geojson',
            data: regionGeojson
          })
          
          venetoMap.addLayer({
            id: 'veneto-region-fill',
            type: 'fill',
            source: 'veneto-region',
            paint: {
              'fill-color': '#16a085',
              'fill-opacity': 0.08
            }
          })
          
          venetoMap.addLayer({
            id: 'veneto-region-outline',
            type: 'line',
            source: 'veneto-region',
            paint: {
              'line-color': '#f39c12',
              'line-width': 3,
              'line-opacity': 0.8
            }
          })
          
          console.log('✓ 載入 Veneto 大區邊界')
        }
      } catch (error) {
        console.warn('⚠️ 無法載入 Veneto 大區邊界:', error)
      }
      
      const docgRegions = [
        { name: 'Amarone della Valpolicella DOCG', grade: 'S級', color: '#8B0000', fillColor: 'rgba(192, 57, 43, 0.45)' },
        { name: 'Recioto della Valpolicella DOCG', grade: 'S級', color: '#A52A2A', fillColor: 'rgba(165, 42, 42, 0.4)' },
        { name: 'Conegliano Valdobbiadene Prosecco DOCG', grade: 'A級', color: '#27ae60', fillColor: 'rgba(39, 174, 96, 0.35)' },
        { name: 'Asolo - Prosecco o Colli Asolani - Prosecco DOCG', grade: 'A級', color: '#16a085', fillColor: 'rgba(22, 160, 133, 0.3)' },
        { name: 'Soave Superiore DOCG', grade: 'A級', color: '#2ecc71', fillColor: 'rgba(46, 204, 113, 0.35)' },
        { name: 'Recioto di Soave DOCG', grade: 'A級', color: '#1abc9c', fillColor: 'rgba(26, 188, 156, 0.3)' },
        { name: 'Bardolino Superiore DOCG', grade: 'B級', color: '#3498db', fillColor: 'rgba(52, 152, 219, 0.25)' },
        { name: 'Lison DOCG', grade: 'B級', color: '#5DADE2', fillColor: 'rgba(93, 173, 226, 0.25)' },
        { name: 'Colli di Conegliano DOCG', grade: 'B級', color: '#85C1E2', fillColor: 'rgba(133, 193, 226, 0.25)' },
        { name: 'Montello  Montello Rosso DOCG', grade: 'B級', color: '#6C8EBF', fillColor: 'rgba(108, 142, 191, 0.25)' },
        { name: 'Malanotte del Piave DOCG', grade: 'B級', color: '#7FB3D5', fillColor: 'rgba(127, 179, 213, 0.25)' },
        { name: 'Bagnoli Friularo Friularo di Bagnoli DOCG', grade: 'B級', color: '#5499C7', fillColor: 'rgba(84, 153, 199, 0.25)' },
        { name: 'Colli Euganei Fior d\'Arancio  Fior d\'Arancio Colli Euganei DOCG', grade: 'B級', color: '#85C1E2', fillColor: 'rgba(133, 193, 226, 0.25)' },
        { name: 'Recioto di Gambellara DOCG', grade: 'B級', color: '#AED6F1', fillColor: 'rgba(174, 214, 241, 0.25)' }
      ]
      
      for (const region of docgRegions) {
        try {
          const response = await fetch(`/regions/veneto/geojson/DOCG/${region.name}.geojson`)
          if (response.ok) {
            const geojson = await response.json()
            
            const sourceId = `${region.name}-source`
            const layerId = `${region.name}-layer`
            const outlineId = `${region.name}-outline`
            
            venetoMap.addSource(sourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {
                  name: region.name.replace(' DOCG', ''),
                  grade: region.grade
                },
                geometry: geojson
              }
            })
            
            venetoMap.addLayer({
              id: layerId,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': region.fillColor,
                'fill-opacity': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  0.7,
                  0.4
                ]
              }
            })
            
            venetoMap.addLayer({
              id: outlineId,
              type: 'line',
              source: sourceId,
              paint: {
                'line-color': region.color,
                'line-width': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  3,
                  2
                ]
              }
            })
            
            let hoveredFeatureId = null
            
            venetoMap.on('mousemove', layerId, (e) => {
              venetoMap.getCanvas().style.cursor = 'pointer'
              
              if (hoveredFeatureId !== null) {
                venetoMap.setFeatureState(
                  { source: sourceId, id: hoveredFeatureId },
                  { hover: false }
                )
              }
              
              hoveredFeatureId = e.features[0].id
              venetoMap.setFeatureState(
                { source: sourceId, id: hoveredFeatureId },
                { hover: true }
              )
            })
            
            venetoMap.on('mouseleave', layerId, () => {
              venetoMap.getCanvas().style.cursor = ''
              
              if (hoveredFeatureId !== null) {
                venetoMap.setFeatureState(
                  { source: sourceId, id: hoveredFeatureId },
                  { hover: false }
                )
              }
              hoveredFeatureId = null
            })
            
            venetoMap.on('click', layerId, (e) => {
              const coordinates = e.lngLat
              const properties = e.features[0].properties
              
              new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(`
                  <div style="padding: 10px;">
                    <div style="background: ${region.color}; color: white; padding: 5px 10px; border-radius: 5px; margin-bottom: 8px; text-align: center; font-size: 0.85rem; font-weight: 600;">
                      ${properties.grade}
                    </div>
                    <h3 style="margin: 0 0 5px; font-size: 1.1rem; color: #2c3e50; font-weight: 700;">
                      ${properties.name}
                    </h3>
                    <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">
                      DOCG 產區
                    </p>
                  </div>
                `)
                .addTo(venetoMap)
            })
            
            console.log(`✓ 載入 ${region.name}`)
          }
        } catch (error) {
          console.warn(`⚠️ 無法載入 ${region.name}:`, error)
        }
      }
      
      const cities = [
        { name: 'Venezia', nameCN: '威尼斯', coords: [12.34, 45.44], label: '首府' },
        { name: 'Verona', nameCN: '維羅納', coords: [10.99, 45.44], label: '羅密歐之城' },
        { name: 'Valdobbiadene', nameCN: '瓦爾多比亞德內', coords: [12.00, 45.90], label: 'Prosecco 中心' }
      ]
      
      cities.forEach(city => {
        const el = document.createElement('div')
        el.className = 'veneto-city-marker'
        el.style.cssText = `
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #f39c12;
          border: 2px solid white;
          box-shadow: 0 0 10px #f39c12;
          cursor: pointer;
          transition: all 0.3s;
        `
        
        el.addEventListener('mouseenter', () => {
          el.style.width = '14px'
          el.style.height = '14px'
        })
        
        el.addEventListener('mouseleave', () => {
          el.style.width = '10px'
          el.style.height = '10px'
        })
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 10px;">
              <div style="background: #f39c12; color: white; padding: 5px 10px; border-radius: 5px; margin-bottom: 8px; text-align: center; font-size: 0.85rem; font-weight: 600;">
                ${city.label}
              </div>
              <h3 style="margin: 0 0 5px; font-size: 1.1rem; color: #2c3e50; font-weight: 700;">
                ${city.nameCN} ${city.name}
              </h3>
              <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">
                重要城市
              </p>
            </div>
          `)
        
        new mapboxgl.Marker(el)
          .setLngLat(city.coords)
          .setPopup(popup)
          .addTo(venetoMap)
      })
      
      console.log('✅ Veneto 地圖初始化完成（含 GeoJSON 邊界）！')
    })
  } catch (error) {
    console.error('❌ 初始化 Veneto 地圖失敗:', error)
  }
}

// ─── 初始化 Sicily 地圖 ───
const initializeSicilyMap = () => {
  try {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    
    if (!mapboxgl.accessToken) {
      console.error('❌ Mapbox access token 未設置')
      return
    }
    
    console.log('🗺️ 開始初始化 Sicily 地圖...')
    
    sicilyMap = new mapboxgl.Map({
      container: 'sicily-map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [14.25, 37.6],
      zoom: 7.8,
      pitch: 0,
      bearing: 0
    })
    
    sicilyMap.addControl(new mapboxgl.NavigationControl(), 'top-right')
    sicilyMap.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    
    sicilyMap.on('load', async () => {
      console.log('📍 載入 Sicily GeoJSON 邊界...')
      
      try {
        const regionResponse = await fetch('/regions/sicily/geojson/Sicily.geojson')
        if (regionResponse.ok) {
          const regionGeojson = await regionResponse.json()
          
          sicilyMap.addSource('sicily-region', {
            type: 'geojson',
            data: regionGeojson
          })
          
          sicilyMap.addLayer({
            id: 'sicily-region-fill',
            type: 'fill',
            source: 'sicily-region',
            paint: {
              'fill-color': '#e67e22',
              'fill-opacity': 0.08
            }
          })
          
          sicilyMap.addLayer({
            id: 'sicily-region-outline',
            type: 'line',
            source: 'sicily-region',
            paint: {
              'line-color': '#f39c12',
              'line-width': 3,
              'line-opacity': 0.8
            }
          })
          
          console.log('✓ 載入 Sicily 大區邊界')
        }
      } catch (error) {
        console.warn('⚠️ 無法載入 Sicily 大區邊界:', error)
      }
      
      const docRegions = [
        { name: 'Etna DOC', grade: 'S級', color: '#8B0000', fillColor: 'rgba(192, 57, 43, 0.45)', type: 'DOC' },
        { name: 'Vittoria DOC', grade: 'S級', color: '#c0392b', fillColor: 'rgba(192, 57, 43, 0.4)', type: 'DOCG', displayName: 'Cerasuolo di Vittoria' },
        { name: 'Marsala DOC', grade: 'A級', color: '#f39c12', fillColor: 'rgba(243, 156, 18, 0.35)', type: 'DOC' },
        { name: 'Faro DOC', grade: 'A級', color: '#e67e22', fillColor: 'rgba(230, 126, 34, 0.3)', type: 'DOC' },
        { name: 'Noto DOC', grade: 'B級', color: '#95a5a6', fillColor: 'rgba(149, 165, 166, 0.25)', type: 'DOC' },
        { name: 'Pantelleria DOC', grade: 'B級', color: '#7f8c8d', fillColor: 'rgba(127, 140, 141, 0.25)', type: 'DOC' },
        { name: 'Alcamo DOC', grade: 'B級', color: '#bdc3c7', fillColor: 'rgba(189, 195, 199, 0.25)', type: 'DOC' }
      ]
      
      for (const region of docRegions) {
        try {
          const response = await fetch(`/regions/sicily/geojson/DOC/${region.name}.geojson`)
          if (response.ok) {
            const geojson = await response.json()
            
            const sourceId = `${region.name}-source`
            const layerId = `${region.name}-layer`
            const outlineId = `${region.name}-outline`
            
            sicilyMap.addSource(sourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {
                  name: region.displayName || region.name.replace(' DOC', '').replace(' DOCG', ''),
                  grade: region.grade,
                  type: region.type
                },
                geometry: geojson
              }
            })
            
            sicilyMap.addLayer({
              id: layerId,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': region.fillColor,
                'fill-opacity': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  0.7,
                  0.4
                ]
              }
            })
            
            sicilyMap.addLayer({
              id: outlineId,
              type: 'line',
              source: sourceId,
              paint: {
                'line-color': region.color,
                'line-width': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  3,
                  2
                ]
              }
            })
            
            let hoveredFeatureId = null
            
            sicilyMap.on('mousemove', layerId, (e) => {
              sicilyMap.getCanvas().style.cursor = 'pointer'
              
              if (hoveredFeatureId !== null) {
                sicilyMap.setFeatureState(
                  { source: sourceId, id: hoveredFeatureId },
                  { hover: false }
                )
              }
              
              hoveredFeatureId = e.features[0].id
              sicilyMap.setFeatureState(
                { source: sourceId, id: hoveredFeatureId },
                { hover: true }
              )
            })
            
            sicilyMap.on('mouseleave', layerId, () => {
              sicilyMap.getCanvas().style.cursor = ''
              
              if (hoveredFeatureId !== null) {
                sicilyMap.setFeatureState(
                  { source: sourceId, id: hoveredFeatureId },
                  { hover: false }
                )
              }
              hoveredFeatureId = null
            })
            
            sicilyMap.on('click', layerId, (e) => {
              const coordinates = e.lngLat
              const properties = e.features[0].properties
              
              new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(`
                  <div style="padding: 10px;">
                    <div style="background: ${region.color}; color: white; padding: 5px 10px; border-radius: 5px; margin-bottom: 8px; text-align: center; font-size: 0.85rem; font-weight: 600;">
                      ${properties.grade}
                    </div>
                    <h3 style="margin: 0 0 5px; font-size: 1.1rem; color: #2c3e50; font-weight: 700;">
                      ${properties.name}
                    </h3>
                    <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">
                      ${properties.type} 產區
                    </p>
                  </div>
                `)
                .addTo(sicilyMap)
            })
            
            console.log(`✓ 載入 ${region.name}`)
          }
        } catch (error) {
          console.warn(`⚠️ 無法載入 ${region.name}:`, error)
        }
      }
      
      const cities = [
        { name: 'Palermo', nameCN: '巴勒莫', coords: [13.36, 38.12], label: '首府' },
        { name: 'Catania', nameCN: '卡塔尼亞', coords: [15.09, 37.51], label: 'Etna 山腳' },
        { name: 'Marsala', nameCN: '馬爾薩拉', coords: [12.44, 37.80], label: '加烈酒之鄉' }
      ]
      
      cities.forEach(city => {
        const el = document.createElement('div')
        el.className = 'sicily-city-marker'
        el.style.cssText = `
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #f39c12;
          border: 2px solid white;
          box-shadow: 0 0 10px #f39c12;
          cursor: pointer;
          transition: all 0.3s;
        `
        
        el.addEventListener('mouseenter', () => {
          el.style.width = '14px'
          el.style.height = '14px'
        })
        
        el.addEventListener('mouseleave', () => {
          el.style.width = '10px'
          el.style.height = '10px'
        })
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 10px;">
              <div style="background: #f39c12; color: white; padding: 5px 10px; border-radius: 5px; margin-bottom: 8px; text-align: center; font-size: 0.85rem; font-weight: 600;">
                ${city.label}
              </div>
              <h3 style="margin: 0 0 5px; font-size: 1.1rem; color: #2c3e50; font-weight: 700;">
                ${city.nameCN} ${city.name}
              </h3>
              <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">
                重要城市
              </p>
            </div>
          `)
        
        new mapboxgl.Marker(el)
          .setLngLat(city.coords)
          .setPopup(popup)
          .addTo(sicilyMap)
      })
      
      console.log('✅ Sicily 地圖初始化完成（含 GeoJSON 邊界）！')
    })
  } catch (error) {
    console.error('❌ 初始化 Sicily 地圖失敗:', error)
  }
}

// ─── 初始化 Lombardy 地圖 ───
const initializeLombardyMap = () => {
  try {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    
    if (!mapboxgl.accessToken) {
      console.error('❌ Mapbox access token 未設置')
      return
    }
    
    console.log('🗺️ 開始初始化 Lombardy 地圖...')
    
    lombardyMap = new mapboxgl.Map({
      container: 'lombardy-map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [10.0, 45.6],
      zoom: 7.5,
      pitch: 0,
      bearing: 0
    })
    
    lombardyMap.addControl(new mapboxgl.NavigationControl(), 'top-right')
    lombardyMap.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    
    lombardyMap.on('load', async () => {
      console.log('📍 載入 Lombardy GeoJSON 邊界...')
      
      try {
        const regionResponse = await fetch('/regions/lombardy/geojson/Lombardy.geojson')
        if (regionResponse.ok) {
          const regionGeojson = await regionResponse.json()
          
          lombardyMap.addSource('lombardy-region', {
            type: 'geojson',
            data: regionGeojson
          })
          
          lombardyMap.addLayer({
            id: 'lombardy-region-fill',
            type: 'fill',
            source: 'lombardy-region',
            paint: {
              'fill-color': '#f39c12',
              'fill-opacity': 0.08
            }
          })
          
          lombardyMap.addLayer({
            id: 'lombardy-region-outline',
            type: 'line',
            source: 'lombardy-region',
            paint: {
              'line-color': '#f1c40f',
              'line-width': 3,
              'line-opacity': 0.9
            }
          })
          
          console.log('✓ 載入 Lombardy 大區邊界')
        }
      } catch (error) {
        console.warn('⚠️ 無法載入 Lombardy 大區邊界:', error)
      }
      
      const docgRegions = [
        { name: 'Franciacorta DOCG', grade: 'S級', color: '#d4af37', fillColor: 'rgba(212, 175, 55, 0.5)', type: 'DOCG' },
        { name: 'Oltrepò Pavese metodo classico DOCG', grade: 'A級', color: '#e74c3c', fillColor: 'rgba(231, 76, 60, 0.45)', type: 'DOCG' },
        { name: 'Valtellina Superiore DOCG', grade: 'A級', color: '#e67e22', fillColor: 'rgba(230, 126, 34, 0.45)', type: 'DOCG' },
        { name: 'Lugana DOC', grade: 'B級', color: '#3498db', fillColor: 'rgba(52, 152, 219, 0.35)', type: 'DOC' },
        { name: 'Sforzato di Valtellina  Sfursat di Valtellina DOCG', grade: 'B級', color: '#5dade2', fillColor: 'rgba(93, 173, 226, 0.35)', type: 'DOCG' },
        { name: 'Valtellina rosso Rosso di Valtellina DOC', grade: 'B級', color: '#85c1e9', fillColor: 'rgba(133, 193, 233, 0.3)', type: 'DOC' }
      ]
      
      for (const region of docgRegions) {
        try {
          const response = await fetch(`/regions/lombardy/geojson/${region.type}/${region.name}.geojson`)
          if (response.ok) {
            const geojson = await response.json()
            
            const sourceId = `${region.name}-source`
            const layerId = `${region.name}-layer`
            const outlineId = `${region.name}-outline`
            
            let displayName = region.name.replace(' DOCG', '').replace(' DOC', '')
            if (region.name === 'Oltrepò Pavese metodo classico DOCG') {
              displayName = 'Oltrepò Pavese MC'
            } else if (region.name === 'Sforzato di Valtellina  Sfursat di Valtellina DOCG') {
              displayName = 'Sforzato di Valtellina'
            } else if (region.name === 'Valtellina rosso Rosso di Valtellina DOC') {
              displayName = 'Valtellina Rosso'
            }
            
            lombardyMap.addSource(sourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {
                  name: displayName,
                  grade: region.grade,
                  type: region.type
                },
                geometry: geojson
              }
            })
            
            lombardyMap.addLayer({
              id: layerId,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': region.fillColor,
                'fill-opacity': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  0.7,
                  0.4
                ]
              }
            })
            
            lombardyMap.addLayer({
              id: outlineId,
              type: 'line',
              source: sourceId,
              paint: {
                'line-color': region.color,
                'line-width': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  3,
                  2
                ]
              }
            })
            
            let hoveredFeatureId = null
            
            lombardyMap.on('mousemove', layerId, (e) => {
              lombardyMap.getCanvas().style.cursor = 'pointer'
              
              if (hoveredFeatureId !== null) {
                lombardyMap.setFeatureState(
                  { source: sourceId, id: hoveredFeatureId },
                  { hover: false }
                )
              }
              
              hoveredFeatureId = e.features[0].id
              lombardyMap.setFeatureState(
                { source: sourceId, id: hoveredFeatureId },
                { hover: true }
              )
            })
            
            lombardyMap.on('mouseleave', layerId, () => {
              lombardyMap.getCanvas().style.cursor = ''
              
              if (hoveredFeatureId !== null) {
                lombardyMap.setFeatureState(
                  { source: sourceId, id: hoveredFeatureId },
                  { hover: false }
                )
              }
              hoveredFeatureId = null
            })
            
            lombardyMap.on('click', layerId, (e) => {
              const coordinates = e.lngLat
              const properties = e.features[0].properties
              
              new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(`
                  <div style="padding: 10px;">
                    <div style="background: ${region.color}; color: white; padding: 5px 10px; border-radius: 5px; margin-bottom: 8px; text-align: center; font-size: 0.85rem; font-weight: 600;">
                      ${properties.grade}
                    </div>
                    <h3 style="margin: 0 0 5px; font-size: 1.1rem; color: #2c3e50; font-weight: 700;">
                      ${properties.name}
                    </h3>
                    <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">
                      ${properties.type} 產區
                    </p>
                  </div>
                `)
                .addTo(lombardyMap)
            })
            
            console.log(`✓ 載入 ${displayName}`)
          }
        } catch (error) {
          console.warn(`⚠️ 無法載入 ${region.name}:`, error)
        }
      }
      
      const cities = [
        { name: 'Milano', nameCN: '米蘭', coords: [9.19, 45.46], label: '首府' },
        { name: 'Brescia', nameCN: '布雷西亞', coords: [10.21, 45.54], label: 'Franciacorta 所在地' },
        { name: 'Bergamo', nameCN: '貝加莫', coords: [9.67, 45.70], label: '歷史名城' }
      ]
      
      cities.forEach(city => {
        const el = document.createElement('div')
        el.className = 'lombardy-city-marker'
        el.style.cssText = `
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #f39c12;
          border: 2px solid white;
          box-shadow: 0 0 10px #f39c12;
          cursor: pointer;
          transition: all 0.3s;
        `
        
        el.addEventListener('mouseenter', () => {
          el.style.width = '14px'
          el.style.height = '14px'
        })
        
        el.addEventListener('mouseleave', () => {
          el.style.width = '10px'
          el.style.height = '10px'
        })
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 10px;">
              <div style="background: #f39c12; color: white; padding: 5px 10px; border-radius: 5px; margin-bottom: 8px; text-align: center; font-size: 0.85rem; font-weight: 600;">
                ${city.label}
              </div>
              <h3 style="margin: 0 0 5px; font-size: 1.1rem; color: #2c3e50; font-weight: 700;">
                ${city.nameCN} ${city.name}
              </h3>
              <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">
                重要城市
              </p>
            </div>
          `)
        
        new mapboxgl.Marker(el)
          .setLngLat(city.coords)
          .setPopup(popup)
          .addTo(lombardyMap)
      })
      
      console.log('✅ Lombardy 地圖初始化完成（含 GeoJSON 邊界）！')
    })
  } catch (error) {
    console.error('❌ 初始化 Lombardy 地圖失敗:', error)
  }
}

const initializeTrentinoMap = () => {
  try {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    
    if (!mapboxgl.accessToken) {
      console.error('❌ Mapbox access token 未設置')
      return
    }
    
    console.log('🗺️ 開始初始化 Trentino-Alto Adige 地圖...')
    
    trentinoMap = new mapboxgl.Map({
      container: 'trentino-map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [11.1, 46.3],
      zoom: 8.5,
      pitch: 0,
      bearing: 0
    })
    
    trentinoMap.addControl(new mapboxgl.NavigationControl(), 'top-right')
    trentinoMap.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    
    trentinoMap.on('load', async () => {
      console.log('📍 載入 Trentino-Alto Adige GeoJSON 邊界...')
      
      try {
        const regionResponse = await fetch('/regions/trentino/geojson/Trentino.geojson')
        if (regionResponse.ok) {
          const regionGeojson = await regionResponse.json()
          
          trentinoMap.addSource('trentino-region', {
            type: 'geojson',
            data: regionGeojson
          })
          
          trentinoMap.addLayer({
            id: 'trentino-region-fill',
            type: 'fill',
            source: 'trentino-region',
            paint: {
              'fill-color': '#3498db',
              'fill-opacity': 0.08
            }
          })
          
          trentinoMap.addLayer({
            id: 'trentino-region-outline',
            type: 'line',
            source: 'trentino-region',
            paint: {
              'line-color': '#3498db',
              'line-width': 3,
              'line-opacity': 0.9
            }
          })
          
          console.log('✓ 載入 Trentino-Alto Adige 大區邊界')
        }
      } catch (error) {
        console.warn('⚠️ 無法載入 Trentino-Alto Adige 大區邊界:', error)
      }
      
      const docRegions = [
        { name: 'Trento DOC', grade: 'S級', color: '#f39c12', fillColor: 'rgba(243, 156, 18, 0.5)', type: 'DOC' },
        { name: 'Teroldego Rotaliano DOC', grade: 'A級', color: '#e74c3c', fillColor: 'rgba(231, 76, 60, 0.45)', type: 'DOC' },
        { name: 'Trentino DOC', grade: 'B級', color: '#3498db', fillColor: 'rgba(52, 152, 219, 0.35)', type: 'DOC' },
        { name: 'Valdadige  Etschtaler DOC', grade: 'B級', color: '#5dade2', fillColor: 'rgba(93, 173, 226, 0.3)', type: 'DOC' }
      ]
      
      for (const region of docRegions) {
        try {
          const response = await fetch(`/regions/trentino/geojson/${region.type}/${region.name}.geojson`)
          if (response.ok) {
            const geojson = await response.json()
            
            const sourceId = `${region.name}-source`
            const layerId = `${region.name}-layer`
            const outlineId = `${region.name}-outline`
            
            let displayName = region.name.replace(' DOC', '').replace(' DOCG', '')
            if (region.name === 'Valdadige  Etschtaler DOC') {
              displayName = 'Valdadige'
            }
            
            trentinoMap.addSource(sourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {
                  name: displayName,
                  grade: region.grade,
                  type: region.type
                },
                geometry: geojson
              }
            })
            
            trentinoMap.addLayer({
              id: layerId,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': region.fillColor,
                'fill-opacity': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  0.7,
                  0.4
                ]
              }
            })
            
            trentinoMap.addLayer({
              id: outlineId,
              type: 'line',
              source: sourceId,
              paint: {
                'line-color': region.color,
                'line-width': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  3,
                  2
                ]
              }
            })
            
            let hoveredFeatureId = null
            
            trentinoMap.on('mousemove', layerId, (e) => {
              trentinoMap.getCanvas().style.cursor = 'pointer'
              
              if (hoveredFeatureId !== null) {
                trentinoMap.setFeatureState(
                  { source: sourceId, id: hoveredFeatureId },
                  { hover: false }
                )
              }
              
              hoveredFeatureId = e.features[0].id
              trentinoMap.setFeatureState(
                { source: sourceId, id: hoveredFeatureId },
                { hover: true }
              )
            })
            
            trentinoMap.on('mouseleave', layerId, () => {
              trentinoMap.getCanvas().style.cursor = ''
              
              if (hoveredFeatureId !== null) {
                trentinoMap.setFeatureState(
                  { source: sourceId, id: hoveredFeatureId },
                  { hover: false }
                )
              }
              hoveredFeatureId = null
            })
            
            trentinoMap.on('click', layerId, (e) => {
              const coordinates = e.lngLat
              const properties = e.features[0].properties
              
              new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(`
                  <div style="padding: 10px;">
                    <div style="background: ${region.color}; color: white; padding: 5px 10px; border-radius: 5px; margin-bottom: 8px; text-align: center; font-size: 0.85rem; font-weight: 600;">
                      ${properties.grade}
                    </div>
                    <h3 style="margin: 0 0 5px; font-size: 1.1rem; color: #2c3e50; font-weight: 700;">
                      ${properties.name}
                    </h3>
                    <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">
                      ${properties.type} 產區
                    </p>
                  </div>
                `)
                .addTo(trentinoMap)
            })
            
            console.log(`✓ 載入 ${displayName}`)
          }
        } catch (error) {
          console.warn(`⚠️ 無法載入 ${region.name}:`, error)
        }
      }
      
      const cities = [
        { name: 'Trento', nameCN: '特倫托', coords: [11.12, 46.07], label: 'Trentino 首府' },
        { name: 'Bolzano', nameCN: '博爾扎諾', coords: [11.35, 46.50], label: 'Alto Adige 首府' },
        { name: 'Rovereto', nameCN: '羅韋雷托', coords: [11.04, 45.89], label: '重要酒鎮' }
      ]
      
      cities.forEach(city => {
        const el = document.createElement('div')
        el.className = 'trentino-city-marker'
        el.style.cssText = `
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #f39c12;
          border: 2px solid white;
          box-shadow: 0 0 10px #f39c12;
          cursor: pointer;
          transition: all 0.3s;
        `
        
        el.addEventListener('mouseenter', () => {
          el.style.width = '14px'
          el.style.height = '14px'
        })
        
        el.addEventListener('mouseleave', () => {
          el.style.width = '10px'
          el.style.height = '10px'
        })
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 10px;">
              <div style="background: #f39c12; color: white; padding: 5px 10px; border-radius: 5px; margin-bottom: 8px; text-align: center; font-size: 0.85rem; font-weight: 600;">
                ${city.label}
              </div>
              <h3 style="margin: 0 0 5px; font-size: 1.1rem; color: #2c3e50; font-weight: 700;">
                ${city.nameCN} ${city.name}
              </h3>
              <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">
                重要城市
              </p>
            </div>
          `)
        
        new mapboxgl.Marker(el)
          .setLngLat(city.coords)
          .setPopup(popup)
          .addTo(trentinoMap)
      })
      
      console.log('✅ Trentino-Alto Adige 地圖初始化完成（含 GeoJSON 邊界）！')
    })
  } catch (error) {
    console.error('❌ 初始化 Trentino-Alto Adige 地圖失敗:', error)
  }
}

const initializeFriuliMap = () => {
  try {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    
    if (!mapboxgl.accessToken) {
      console.error('❌ Mapbox access token 未設置')
      return
    }
    
    console.log('🗺️ 開始初始化 Friuli Venezia Giulia 地圖...')
    
    friuliMap = new mapboxgl.Map({
      container: 'friuli-map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [13.2, 46.0],
      zoom: 8.8,
      pitch: 0,
      bearing: 0
    })
    
    friuliMap.addControl(new mapboxgl.NavigationControl(), 'top-right')
    friuliMap.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    
    friuliMap.on('load', async () => {
      console.log('📍 載入 Friuli Venezia Giulia GeoJSON 邊界...')
      
      try {
        const regionResponse = await fetch('/regions/friuli/geojson/Friuli-Venezia Giulia.geojson')
        if (regionResponse.ok) {
          const regionGeojson = await regionResponse.json()
          
          friuliMap.addSource('friuli-region', {
            type: 'geojson',
            data: regionGeojson
          })
          
          friuliMap.addLayer({
            id: 'friuli-region-fill',
            type: 'fill',
            source: 'friuli-region',
            paint: {
              'fill-color': '#16a085',
              'fill-opacity': 0.08
            }
          })
          
          friuliMap.addLayer({
            id: 'friuli-region-outline',
            type: 'line',
            source: 'friuli-region',
            paint: {
              'line-color': '#16a085',
              'line-width': 3,
              'line-opacity': 0.9
            }
          })
          
          console.log('✓ 載入 Friuli Venezia Giulia 大區邊界')
        }
      } catch (error) {
        console.warn('⚠️ 無法載入 Friuli Venezia Giulia 大區邊界:', error)
      }
      
      const regions = [
        { name: 'Collio Goriziano Collio DOC', displayName: 'Collio DOC', grade: 'S級', color: '#f39c12', fillColor: 'rgba(243, 156, 18, 0.5)', type: 'DOC' },
        { name: 'Friuli Colli Orientali DOC', displayName: 'Colli Orientali DOC', grade: 'A級', color: '#e74c3c', fillColor: 'rgba(231, 76, 60, 0.45)', type: 'DOC' },
        { name: 'Friuli Grave DOC', displayName: 'Friuli Grave DOC', grade: 'B級', color: '#3498db', fillColor: 'rgba(52, 152, 219, 0.35)', type: 'DOC' },
        { name: 'Ramandolo DOCG', displayName: 'Ramandolo DOCG', grade: '甜酒', color: '#9b59b6', fillColor: 'rgba(155, 89, 182, 0.4)', type: 'DOCG' },
        { name: 'Rosazzo DOCG', displayName: 'Rosazzo DOCG', grade: '精品', color: '#1abc9c', fillColor: 'rgba(26, 188, 156, 0.4)', type: 'DOCG' },
        { name: 'Friuli Isonzo Isonzo del Friuli DOC', displayName: 'Friuli Isonzo DOC', grade: 'B級', color: '#5dade2', fillColor: 'rgba(93, 173, 226, 0.3)', type: 'DOC' }
      ]
      
      for (const region of regions) {
        try {
          const response = await fetch(`/regions/friuli/geojson/${region.type}/${region.name}.geojson`)
          if (response.ok) {
            const geojson = await response.json()
            
            const sourceId = `${region.name}-source`
            const layerId = `${region.name}-layer`
            const outlineId = `${region.name}-outline`
            
            friuliMap.addSource(sourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {
                  name: region.displayName,
                  grade: region.grade,
                  type: region.type
                },
                geometry: geojson
              }
            })
            
            friuliMap.addLayer({
              id: layerId,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': region.fillColor,
                'fill-opacity': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  0.7,
                  0.4
                ]
              }
            })
            
            friuliMap.addLayer({
              id: outlineId,
              type: 'line',
              source: sourceId,
              paint: {
                'line-color': region.color,
                'line-width': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  3,
                  2
                ]
              }
            })
            
            let hoveredFeatureId = null
            
            friuliMap.on('mousemove', layerId, (e) => {
              friuliMap.getCanvas().style.cursor = 'pointer'
              
              if (hoveredFeatureId !== null) {
                friuliMap.setFeatureState(
                  { source: sourceId, id: hoveredFeatureId },
                  { hover: false }
                )
              }
              
              hoveredFeatureId = e.features[0].id
              friuliMap.setFeatureState(
                { source: sourceId, id: hoveredFeatureId },
                { hover: true }
              )
            })
            
            friuliMap.on('mouseleave', layerId, () => {
              friuliMap.getCanvas().style.cursor = ''
              
              if (hoveredFeatureId !== null) {
                friuliMap.setFeatureState(
                  { source: sourceId, id: hoveredFeatureId },
                  { hover: false }
                )
              }
              hoveredFeatureId = null
            })
            
            friuliMap.on('click', layerId, (e) => {
              const coordinates = e.lngLat
              const properties = e.features[0].properties
              
              new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(`
                  <div style="padding: 10px;">
                    <div style="background: ${region.color}; color: white; padding: 5px 10px; border-radius: 5px; margin-bottom: 8px; text-align: center; font-size: 0.85rem; font-weight: 600;">
                      ${properties.grade}
                    </div>
                    <h3 style="margin: 0 0 5px; font-size: 1.1rem; color: #2c3e50; font-weight: 700;">
                      ${properties.name}
                    </h3>
                    <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">
                      ${properties.type} 產區
                    </p>
                  </div>
                `)
                .addTo(friuliMap)
            })
            
            console.log(`✓ 載入 ${region.displayName}`)
          }
        } catch (error) {
          console.warn(`⚠️ 無法載入 ${region.name}:`, error)
        }
      }
      
      const cities = [
        { name: 'Gorizia', nameCN: '戈里齊亞', coords: [13.62, 45.94], label: 'Collio 心臟地帶' },
        { name: 'Udine', nameCN: '烏迪內', coords: [13.24, 46.07], label: '首府城市' },
        { name: 'Trieste', nameCN: '的里雅斯特', coords: [13.77, 45.65], label: '港口城市' }
      ]
      
      cities.forEach(city => {
        const el = document.createElement('div')
        el.className = 'friuli-city-marker'
        el.style.cssText = `
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #16a085;
          border: 2px solid white;
          box-shadow: 0 0 10px #16a085;
          cursor: pointer;
          transition: all 0.3s;
        `
        
        el.addEventListener('mouseenter', () => {
          el.style.width = '14px'
          el.style.height = '14px'
        })
        
        el.addEventListener('mouseleave', () => {
          el.style.width = '10px'
          el.style.height = '10px'
        })
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 10px;">
              <div style="background: #16a085; color: white; padding: 5px 10px; border-radius: 5px; margin-bottom: 8px; text-align: center; font-size: 0.85rem; font-weight: 600;">
                ${city.label}
              </div>
              <h3 style="margin: 0 0 5px; font-size: 1.1rem; color: #2c3e50; font-weight: 700;">
                ${city.nameCN} ${city.name}
              </h3>
              <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">
                重要城市
              </p>
            </div>
          `)
        
        new mapboxgl.Marker(el)
          .setLngLat(city.coords)
          .setPopup(popup)
          .addTo(friuliMap)
      })
      
      console.log('✅ Friuli Venezia Giulia 地圖初始化完成（含 GeoJSON 邊界）！')
    })
  } catch (error) {
    console.error('❌ 初始化 Friuli Venezia Giulia 地圖失敗:', error)
  }
}

const initializeLiguriaMap = () => {
  try {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    
    if (!mapboxgl.accessToken) {
      console.error('❌ Mapbox access token 未設置')
      return
    }
    
    console.log('🗺️ 開始初始化 Liguria 地圖...')
    
    liguriaMap = new mapboxgl.Map({
      container: 'liguria-map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [8.8, 44.3],
      zoom: 8.5,
      pitch: 0,
      bearing: 0
    })
    
    liguriaMap.addControl(new mapboxgl.NavigationControl(), 'top-right')
    liguriaMap.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    
    liguriaMap.on('load', async () => {
      console.log('📍 載入 Liguria GeoJSON 邊界...')
      
      try {
        const regionResponse = await fetch('/regions/liguria/geojson/Liguria.geojson')
        if (regionResponse.ok) {
          const regionGeojson = await regionResponse.json()
          
          liguriaMap.addSource('liguria-region', {
            type: 'geojson',
            data: regionGeojson
          })
          
          liguriaMap.addLayer({
            id: 'liguria-region-fill',
            type: 'fill',
            source: 'liguria-region',
            paint: {
              'fill-color': '#3498db',
              'fill-opacity': 0.08
            }
          })
          
          liguriaMap.addLayer({
            id: 'liguria-region-outline',
            type: 'line',
            source: 'liguria-region',
            paint: {
              'line-color': '#3498db',
              'line-width': 3,
              'line-opacity': 0.9
            }
          })
          
          console.log('✓ 載入 Liguria 大區邊界')
        }
      } catch (error) {
        console.warn('⚠️ 無法載入 Liguria 大區邊界:', error)
      }
      
      const regions = [
        { name: 'Cinque Terre Cinque Terre Sciacchetrà DOC', displayName: 'Cinque Terre DOC', grade: 'S級', color: '#f39c12', fillColor: 'rgba(243, 156, 18, 0.5)', type: 'DOC' },
        { name: 'Colli di Luni DOC', displayName: 'Colli di Luni DOC', grade: 'A級', color: '#e74c3c', fillColor: 'rgba(231, 76, 60, 0.45)', type: 'DOC' },
        { name: 'Dolceacqua Rossese di Dolceacqua DOC', displayName: 'Rossese di Dolceacqua', grade: 'A級', color: '#e67e22', fillColor: 'rgba(230, 126, 34, 0.45)', type: 'DOC' },
        { name: 'Colline di Levanto DOC', displayName: 'Colline di Levanto', grade: 'B級', color: '#3498db', fillColor: 'rgba(52, 152, 219, 0.35)', type: 'DOC' },
        { name: 'Val Polcèvera DOC', displayName: 'Val Polcèvera', grade: 'B級', color: '#5dade2', fillColor: 'rgba(93, 173, 226, 0.3)', type: 'DOC' }
      ]
      
      for (const region of regions) {
        try {
          const response = await fetch(`/regions/liguria/geojson/${region.type}/${region.name}.geojson`)
          if (response.ok) {
            const geojson = await response.json()
            
            const sourceId = `${region.name}-source`
            const layerId = `${region.name}-layer`
            const outlineId = `${region.name}-outline`
            
            liguriaMap.addSource(sourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {
                  name: region.displayName,
                  grade: region.grade,
                  type: region.type
                },
                geometry: geojson
              }
            })
            
            liguriaMap.addLayer({
              id: layerId,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': region.fillColor,
                'fill-opacity': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  0.7,
                  0.4
                ]
              }
            })
            
            liguriaMap.addLayer({
              id: outlineId,
              type: 'line',
              source: sourceId,
              paint: {
                'line-color': region.color,
                'line-width': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  3,
                  2
                ]
              }
            })
            
            let hoveredFeatureId = null
            
            liguriaMap.on('mousemove', layerId, (e) => {
              liguriaMap.getCanvas().style.cursor = 'pointer'
              
              if (hoveredFeatureId !== null) {
                liguriaMap.setFeatureState(
                  { source: sourceId, id: hoveredFeatureId },
                  { hover: false }
                )
              }
              
              hoveredFeatureId = e.features[0].id
              liguriaMap.setFeatureState(
                { source: sourceId, id: hoveredFeatureId },
                { hover: true }
              )
            })
            
            liguriaMap.on('mouseleave', layerId, () => {
              liguriaMap.getCanvas().style.cursor = ''
              
              if (hoveredFeatureId !== null) {
                liguriaMap.setFeatureState(
                  { source: sourceId, id: hoveredFeatureId },
                  { hover: false }
                )
              }
              hoveredFeatureId = null
            })
            
            liguriaMap.on('click', layerId, (e) => {
              const coordinates = e.lngLat
              const properties = e.features[0].properties
              
              new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(`
                  <div style="padding: 10px;">
                    <div style="background: ${region.color}; color: white; padding: 5px 10px; border-radius: 5px; margin-bottom: 8px; text-align: center; font-size: 0.85rem; font-weight: 600;">
                      ${properties.grade}
                    </div>
                    <h3 style="margin: 0 0 5px; font-size: 1.1rem; color: #2c3e50; font-weight: 700;">
                      ${properties.name}
                    </h3>
                    <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">
                      ${properties.type} 產區
                    </p>
                  </div>
                `)
                .addTo(liguriaMap)
            })
            
            console.log(`✓ 載入 ${region.displayName}`)
          }
        } catch (error) {
          console.warn(`⚠️ 無法載入 ${region.name}:`, error)
        }
      }
      
      const cities = [
        { name: 'Genova', nameCN: '熱那亞', coords: [8.93, 44.41], label: '首府' },
        { name: 'La Spezia', nameCN: '拉斯佩齊亞', coords: [9.82, 44.10], label: 'Cinque Terre 門戶' },
        { name: 'Ventimiglia', nameCN: '文蒂米利亞', coords: [7.61, 43.79], label: 'Rossese 產區' }
      ]
      
      cities.forEach(city => {
        const el = document.createElement('div')
        el.className = 'liguria-city-marker'
        el.style.cssText = `
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #3498db;
          border: 2px solid white;
          box-shadow: 0 0 10px #3498db;
          cursor: pointer;
          transition: all 0.3s;
        `
        
        el.addEventListener('mouseenter', () => {
          el.style.width = '14px'
          el.style.height = '14px'
        })
        
        el.addEventListener('mouseleave', () => {
          el.style.width = '10px'
          el.style.height = '10px'
        })
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 10px;">
              <div style="background: #3498db; color: white; padding: 5px 10px; border-radius: 5px; margin-bottom: 8px; text-align: center; font-size: 0.85rem; font-weight: 600;">
                ${city.label}
              </div>
              <h3 style="margin: 0 0 5px; font-size: 1.1rem; color: #2c3e50; font-weight: 700;">
                ${city.nameCN} ${city.name}
              </h3>
              <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">
                重要城市
              </p>
            </div>
          `)
        
        new mapboxgl.Marker(el)
          .setLngLat(city.coords)
          .setPopup(popup)
          .addTo(liguriaMap)
      })
      
      console.log('✅ Liguria 地圖初始化完成（含 GeoJSON 邊界）！')
    })
  } catch (error) {
    console.error('❌ 初始化 Liguria 地圖失敗:', error)
  }
}

// ─── Emilia-Romagna 地圖初始化 ───
const initializeEmiliaMap = () => {
  try {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    
    if (!mapboxgl.accessToken) {
      console.error('❌ Mapbox access token 未設置')
      return
    }
    
    console.log('🗺️ 開始初始化 Emilia 地圖...')
    
    emiliaMap = new mapboxgl.Map({
      container: 'emilia-map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [10.8, 44.5],
      zoom: 8.2,
      pitch: 0,
      bearing: 0
    })
    
    emiliaMap.addControl(new mapboxgl.NavigationControl(), 'top-right')
    emiliaMap.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    
    emiliaMap.on('load', async () => {
      console.log('📍 載入 Emilia GeoJSON 邊界...')
      
      try {
        const regionResponse = await fetch('/regions/emilia/geojson/Emilia-Romagna.geojson')
        if (regionResponse.ok) {
          const regionGeojson = await regionResponse.json()
          
          emiliaMap.addSource('emilia-region', {
            type: 'geojson',
            data: regionGeojson
          })
          
          emiliaMap.addLayer({
            id: 'emilia-region-fill',
            type: 'fill',
            source: 'emilia-region',
            paint: {
              'fill-color': '#e74c3c',
              'fill-opacity': 0.08
            }
          })
          
          emiliaMap.addLayer({
            id: 'emilia-region-outline',
            type: 'line',
            source: 'emilia-region',
            paint: {
              'line-color': '#e74c3c',
              'line-width': 3,
              'line-opacity': 0.9
            }
          })
          
          console.log('✅ Emilia 大區邊界已加載')
        }
      } catch (error) {
        console.error('❌ 載入 Emilia 大區邊界失敗:', error)
      }
      
      // DOC/DOCG 產區數據（課程重點產區）
      const regions = [
        {
          name: 'Lambrusco di Sorbara DOC',
          grade: 'S級',
          color: '#f39c12',
          description: '最優雅的 Lambrusco，粉紅色、高酸度、細膩氣泡',
          filepath: '/regions/emilia/geojson/DOC/Lambrusco di Sorbara DOC.geojson'
        },
        {
          name: 'Lambrusco Grasparossa di Castelvetro DOC',
          grade: 'A級',
          color: '#e74c3c',
          description: '最濃郁的 Lambrusco，深紫紅色、單寧較高、飽滿',
          filepath: '/regions/emilia/geojson/DOC/Lambrusco Grasparossa di Castelvetro DOC.geojson'
        },
        {
          name: 'Reggiano DOC',
          grade: 'A級',
          color: '#e67e22',
          description: '平衡型 Lambrusco，多品種混釀、性價比高',
          filepath: '/regions/emilia/geojson/DOC/Reggiano DOC.geojson'
        },
        {
          name: 'Romagna Albana DOCG',
          grade: 'B級',
          color: '#3498db',
          description: '義大利第一個白酒 DOCG（1987），Albana 品種',
          filepath: '/regions/emilia/geojson/DOCG/Romagna Albana DOCG.geojson'
        },
        {
          name: 'Colli Bolognesi Classico Pignoletto DOCG',
          grade: 'B級',
          color: '#5dade2',
          description: 'Bologna 丘陵的 Pignoletto 白酒和氣泡酒',
          filepath: '/regions/emilia/geojson/DOCG/Colli Bolognesi Classico Pignoletto DOCG.geojson'
        },
        {
          name: 'Romagna DOC',
          grade: 'B級',
          color: '#85c1e9',
          description: 'Sangiovese di Romagna 產區，果香柔順、易飲',
          filepath: '/regions/emilia/geojson/DOC/Romagna DOC.geojson'
        }
      ]
      
      // 逐一載入各產區的 GeoJSON
      for (const region of regions) {
        try {
          const response = await fetch(region.filepath)
          if (response.ok) {
            const geojson = await response.json()
            
            const sourceId = `emilia-${region.name.toLowerCase().replace(/\s+/g, '-')}`
            
            emiliaMap.addSource(sourceId, {
              type: 'geojson',
              data: geojson
            })
            
            emiliaMap.addLayer({
              id: `${sourceId}-fill`,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': region.color,
                'fill-opacity': 0.35
              }
            })
            
            emiliaMap.addLayer({
              id: `${sourceId}-outline`,
              type: 'line',
              source: sourceId,
              paint: {
                'line-color': region.color,
                'line-width': 2.5,
                'line-opacity': 0.9
              }
            })
            
            // 懸停效果
            emiliaMap.on('mouseenter', `${sourceId}-fill`, () => {
              emiliaMap.getCanvas().style.cursor = 'pointer'
              emiliaMap.setPaintProperty(`${sourceId}-fill`, 'fill-opacity', 0.6)
            })
            
            emiliaMap.on('mouseleave', `${sourceId}-fill`, () => {
              emiliaMap.getCanvas().style.cursor = ''
              emiliaMap.setPaintProperty(`${sourceId}-fill`, 'fill-opacity', 0.35)
            })
            
            // 點擊顯示資訊
            emiliaMap.on('click', `${sourceId}-fill`, () => {
              new mapboxgl.Popup()
                .setLngLat(emiliaMap.getCenter())
                .setHTML(`
                  <div style="padding: 8px; min-width: 200px;">
                    <h3 style="margin: 0 0 8px; color: ${region.color}; font-size: 1.1rem;">${region.name}</h3>
                    <p style="margin: 5px 0; font-weight: 600; color: #2c3e50;">等級：${region.grade}</p>
                    <p style="margin: 5px 0; color: #555; line-height: 1.5;">${region.description}</p>
                  </div>
                `)
                .addTo(emiliaMap)
            })
            
            console.log(`✅ ${region.name} 已加載`)
          }
        } catch (error) {
          console.error(`❌ 載入 ${region.name} 失敗:`, error)
        }
      }
      
      // 重要城市標記
      const cities = [
        { name: 'Bologna', coords: [11.3426, 44.4942], label: '波隆那（大區首府、美食之都）' },
        { name: 'Modena', coords: [10.9252, 44.6471], label: '摩德纳（Lambrusco、Balsamic 醋之鄉）' },
        { name: 'Parma', coords: [10.3279, 44.8015], label: '帕尔玛（Prosciutto、Parmigiano 之鄉）' },
        { name: 'Reggio Emilia', coords: [10.6313, 44.6989], label: '雷焦艾米利亚（Parmigiano 發源地）' }
      ]
      
      cities.forEach(city => {
        const el = document.createElement('div')
        el.className = 'city-marker'
        el.style.cssText = `
          background: #e74c3c;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          cursor: pointer;
        `
        
        new mapboxgl.Marker({ element: el })
          .setLngLat(city.coords)
          .setPopup(new mapboxgl.Popup({ offset: 15 })
            .setHTML(`
              <div style="padding: 8px; text-align: center;">
                <h4 style="margin: 0 0 5px; color: #e74c3c;">${city.name}</h4>
                <p style="margin: 0; color: #555; font-size: 0.9rem;">${city.label}</p>
              </div>
            `)
          )
          .addTo(emiliaMap)
      })
      
      console.log('✅ Emilia 地圖初始化完成（含 GeoJSON 邊界）！')
    })
  } catch (error) {
    console.error('❌ 初始化 Emilia 地圖失敗:', error)
  }
}

// ─── Marche 地圖初始化 ───
const initializeMarcheMap = () => {
  try {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    
    if (!mapboxgl.accessToken) {
      console.error('❌ Mapbox access token 未設置')
      return
    }
    
    console.log('🗺️ 開始初始化 Marche 地圖...')
    
    marcheMap = new mapboxgl.Map({
      container: 'marche-map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [13.3, 43.3],
      zoom: 8.5,
      pitch: 0,
      bearing: 0
    })
    
    marcheMap.addControl(new mapboxgl.NavigationControl(), 'top-right')
    marcheMap.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    
    marcheMap.on('load', async () => {
      console.log('📍 載入 Marche GeoJSON 邊界...')
      
      try {
        const regionResponse = await fetch('/regions/marche/geojson/Marche.geojson')
        if (regionResponse.ok) {
          const regionGeojson = await regionResponse.json()
          
          marcheMap.addSource('marche-region', {
            type: 'geojson',
            data: regionGeojson
          })
          
          marcheMap.addLayer({
            id: 'marche-region-fill',
            type: 'fill',
            source: 'marche-region',
            paint: {
              'fill-color': '#16a085',
              'fill-opacity': 0.08
            }
          })
          
          marcheMap.addLayer({
            id: 'marche-region-outline',
            type: 'line',
            source: 'marche-region',
            paint: {
              'line-color': '#16a085',
              'line-width': 3,
              'line-opacity': 0.9
            }
          })
          
          console.log('✅ Marche 大區邊界已加載')
        }
      } catch (error) {
        console.error('❌ 載入 Marche 大區邊界失敗:', error)
      }
      
      // DOC/DOCG 產區數據（課程重點產區）
      const regions = [
        {
          name: 'Castelli di Jesi Verdicchio Riserva DOCG',
          grade: 'S級',
          color: '#f39c12',
          description: '最大的 Verdicchio 產區，清爽礦物感、杏仁香氣',
          filepath: '/regions/marche/geojson/DOCG/Castelli di Jesi Verdicchio Riserva DOCG.geojson'
        },
        {
          name: 'Verdicchio di Matelica Riserva DOCG',
          grade: 'A級',
          color: '#9b59b6',
          description: '內陸山谷產區，結構更強、酸度更高、陳年潛力佳',
          filepath: '/regions/marche/geojson/DOCG/Verdicchio di Matelica Riserva DOCG.geojson'
        },
        {
          name: 'Cònero DOCG',
          grade: 'A級',
          color: '#e74c3c',
          description: 'Montepulciano 紅酒，濃郁果香、單寧柔順',
          filepath: '/regions/marche/geojson/DOCG/Cònero DOCG.geojson'
        },
        {
          name: 'Offida DOCG',
          grade: 'B級',
          color: '#3498db',
          description: 'Pecorino、Passerina 白酒產區',
          filepath: '/regions/marche/geojson/DOCG/Offida DOCG.geojson'
        },
        {
          name: 'Rosso Piceno Piceno DOC',
          grade: 'B級',
          color: '#e67e22',
          description: 'Sangiovese + Montepulciano 混釀，日常紅酒',
          filepath: '/regions/marche/geojson/DOC/Rosso Piceno Piceno DOC.geojson'
        },
        {
          name: 'Lacrima di Morro  Lacrima di Morro d\'Alba DOC',
          grade: 'B級',
          color: '#e91e63',
          description: '最芳香的紅葡萄品種，紫羅蘭、玫瑰香氣',
          filepath: '/regions/marche/geojson/DOC/Lacrima di Morro  Lacrima di Morro d\'Alba DOC.geojson'
        }
      ]
      
      // 逐一載入各產區的 GeoJSON
      for (const region of regions) {
        try {
          const response = await fetch(region.filepath)
          if (response.ok) {
            const geojson = await response.json()
            
            const sourceId = `marche-${region.name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}`
            
            marcheMap.addSource(sourceId, {
              type: 'geojson',
              data: geojson
            })
            
            marcheMap.addLayer({
              id: `${sourceId}-fill`,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': region.color,
                'fill-opacity': 0.35
              }
            })
            
            marcheMap.addLayer({
              id: `${sourceId}-outline`,
              type: 'line',
              source: sourceId,
              paint: {
                'line-color': region.color,
                'line-width': 2.5,
                'line-opacity': 0.9
              }
            })
            
            // 懸停效果
            marcheMap.on('mouseenter', `${sourceId}-fill`, () => {
              marcheMap.getCanvas().style.cursor = 'pointer'
              marcheMap.setPaintProperty(`${sourceId}-fill`, 'fill-opacity', 0.6)
            })
            
            marcheMap.on('mouseleave', `${sourceId}-fill`, () => {
              marcheMap.getCanvas().style.cursor = ''
              marcheMap.setPaintProperty(`${sourceId}-fill`, 'fill-opacity', 0.35)
            })
            
            // 點擊顯示資訊
            marcheMap.on('click', `${sourceId}-fill`, () => {
              new mapboxgl.Popup()
                .setLngLat(marcheMap.getCenter())
                .setHTML(`
                  <div style="padding: 8px; min-width: 200px;">
                    <h3 style="margin: 0 0 8px; color: ${region.color}; font-size: 1.1rem;">${region.name}</h3>
                    <p style="margin: 5px 0; font-weight: 600; color: #2c3e50;">等級：${region.grade}</p>
                    <p style="margin: 5px 0; color: #555; line-height: 1.5;">${region.description}</p>
                  </div>
                `)
                .addTo(marcheMap)
            })
            
            console.log(`✅ ${region.name} 已加載`)
          }
        } catch (error) {
          console.error(`❌ 載入 ${region.name} 失敗:`, error)
        }
      }
      
      // 重要城市標記
      const cities = [
        { name: 'Ancona', coords: [13.5188, 43.6158], label: '安科納（首府、Adriatic 海港）' },
        { name: 'Jesi', coords: [13.2439, 43.5231], label: 'Jesi（Verdicchio 核心產區）' },
        { name: 'Matelica', coords: [13.0082, 43.2564], label: 'Matelica（高海拔 Verdicchio）' },
        { name: 'Ascoli Piceno', coords: [13.5759, 42.8542], label: 'Ascoli Piceno（Rosso Piceno 產區）' }
      ]
      
      cities.forEach(city => {
        const el = document.createElement('div')
        el.className = 'city-marker'
        el.style.cssText = `
          background: #16a085;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          cursor: pointer;
        `
        
        new mapboxgl.Marker({ element: el })
          .setLngLat(city.coords)
          .setPopup(new mapboxgl.Popup({ offset: 15 })
            .setHTML(`
              <div style="padding: 8px; text-align: center;">
                <h4 style="margin: 0 0 5px; color: #16a085;">${city.name}</h4>
                <p style="margin: 0; color: #555; font-size: 0.9rem;">${city.label}</p>
              </div>
            `)
          )
          .addTo(marcheMap)
      })
      
      console.log('✅ Marche 地圖初始化完成（含 GeoJSON 邊界）！')
    })
  } catch (error) {
    console.error('❌ 初始化 Marche 地圖失敗:', error)
  }
}

// ─── Lazio 地圖初始化 ───
const initializeLazioMap = () => {
  try {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    
    if (!mapboxgl.accessToken) {
      console.error('❌ Mapbox access token 未設置')
      return
    }
    
    console.log('🗺️ 開始初始化 Lazio 地圖...')
    
    lazioMap = new mapboxgl.Map({
      container: 'lazio-map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [12.5, 41.9],
      zoom: 8.2,
      pitch: 0,
      bearing: 0
    })
    
    lazioMap.addControl(new mapboxgl.NavigationControl(), 'top-right')
    lazioMap.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    
    lazioMap.on('load', async () => {
      console.log('📍 載入 Lazio GeoJSON 邊界...')
      
      try {
        const regionResponse = await fetch('/regions/lazio/geojson/Lazio.geojson')
        if (regionResponse.ok) {
          const regionGeojson = await regionResponse.json()
          
          lazioMap.addSource('lazio-region', {
            type: 'geojson',
            data: regionGeojson
          })
          
          lazioMap.addLayer({
            id: 'lazio-region-fill',
            type: 'fill',
            source: 'lazio-region',
            paint: {
              'fill-color': '#f39c12',
              'fill-opacity': 0.08
            }
          })
          
          lazioMap.addLayer({
            id: 'lazio-region-outline',
            type: 'line',
            source: 'lazio-region',
            paint: {
              'line-color': '#f39c12',
              'line-width': 3,
              'line-opacity': 0.9
            }
          })
          
          console.log('✅ Lazio 大區邊界已加載')
        }
      } catch (error) {
        console.error('❌ 載入 Lazio 大區邊界失敗:', error)
      }
      
      // DOC/DOCG 產區數據（課程重點產區）
      const regions = [
        {
          name: 'Frascati Superiore DOCG',
          grade: 'S級',
          color: '#d4af37',
          description: 'Roma 最著名的白酒，火山土壤賦予獨特礦物感',
          filepath: '/regions/lazio/geojson/DOCG/Frascati Superiore DOCG.geojson'
        },
        {
          name: 'Cesanese del Piglio DOCG',
          grade: 'S級',
          color: '#e74c3c',
          description: 'Lazio 唯一的紅酒 DOCG，Cesanese 本土品種',
          filepath: '/regions/lazio/geojson/DOCG/Cesanese del Piglio Piglio DOCG.geojson'
        },
        {
          name: 'Cannellino di Frascati DOCG',
          grade: 'A級',
          color: '#9b59b6',
          description: 'Frascati 的甜酒版本，晚收或風乾葡萄釀造',
          filepath: '/regions/lazio/geojson/DOCG/Cannellino di Frascati DOCG.geojson'
        },
        {
          name: 'Est! Est!! Est!!! di Montefiascone DOC',
          grade: 'B級',
          color: '#3498db',
          description: '以傳說聞名的白酒，Bolsena 湖畔產區',
          filepath: '/regions/lazio/geojson/DOC/Est! Est!! Est!!! di Montefiascone DOC.geojson'
        },
        {
          name: 'Marino DOC',
          grade: 'B級',
          color: '#5dade2',
          description: 'Frascati 的鄰居，風格相似、價格更親民',
          filepath: '/regions/lazio/geojson/DOC/Marino DOC.geojson'
        },
        {
          name: 'Cesanese di Olevano Romano DOC',
          grade: 'B級',
          color: '#e67e22',
          description: 'Cesanese 的 DOC 版本，傳統風格、可釀成不同甜度',
          filepath: '/regions/lazio/geojson/DOC/Cesanese di Olevano Romano Olevano Romano DOC.geojson'
        }
      ]
      
      // 逐一載入各產區的 GeoJSON
      for (const region of regions) {
        try {
          const response = await fetch(region.filepath)
          if (response.ok) {
            const geojson = await response.json()
            
            const sourceId = `lazio-${region.name.toLowerCase().replace(/\s+/g, '-').replace(/!/g, '')}`
            
            lazioMap.addSource(sourceId, {
              type: 'geojson',
              data: geojson
            })
            
            lazioMap.addLayer({
              id: `${sourceId}-fill`,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': region.color,
                'fill-opacity': 0.35
              }
            })
            
            lazioMap.addLayer({
              id: `${sourceId}-outline`,
              type: 'line',
              source: sourceId,
              paint: {
                'line-color': region.color,
                'line-width': 2.5,
                'line-opacity': 0.9
              }
            })
            
            // 懸停效果
            lazioMap.on('mouseenter', `${sourceId}-fill`, () => {
              lazioMap.getCanvas().style.cursor = 'pointer'
              lazioMap.setPaintProperty(`${sourceId}-fill`, 'fill-opacity', 0.6)
            })
            
            lazioMap.on('mouseleave', `${sourceId}-fill`, () => {
              lazioMap.getCanvas().style.cursor = ''
              lazioMap.setPaintProperty(`${sourceId}-fill`, 'fill-opacity', 0.35)
            })
            
            // 點擊顯示資訊
            lazioMap.on('click', `${sourceId}-fill`, () => {
              new mapboxgl.Popup()
                .setLngLat(lazioMap.getCenter())
                .setHTML(`
                  <div style="padding: 8px; min-width: 200px;">
                    <h3 style="margin: 0 0 8px; color: ${region.color}; font-size: 1.1rem;">${region.name}</h3>
                    <p style="margin: 5px 0; font-weight: 600; color: #2c3e50;">等級：${region.grade}</p>
                    <p style="margin: 5px 0; color: #555; line-height: 1.5;">${region.description}</p>
                  </div>
                `)
                .addTo(lazioMap)
            })
            
            console.log(`✅ ${region.name} 已加載`)
          }
        } catch (error) {
          console.error(`❌ 載入 ${region.name} 失敗:`, error)
        }
      }
      
      // 重要城市標記
      const cities = [
        { name: 'Roma', coords: [12.4964, 41.9028], label: '羅馬（首都、永恆之城）' },
        { name: 'Frascati', coords: [12.6814, 41.8081], label: 'Frascati（Frascati 白酒產區）' },
        { name: 'Montefiascone', coords: [12.0417, 42.5417], label: 'Montefiascone（Est! Est!! Est!!! 產區）' },
        { name: 'Piglio', coords: [13.1375, 41.8208], label: 'Piglio（Cesanese del Piglio 產區）' }
      ]
      
      cities.forEach(city => {
        const el = document.createElement('div')
        el.className = 'city-marker'
        el.style.cssText = `
          background: #f39c12;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          cursor: pointer;
        `
        
        new mapboxgl.Marker({ element: el })
          .setLngLat(city.coords)
          .setPopup(new mapboxgl.Popup({ offset: 15 })
            .setHTML(`
              <div style="padding: 8px; text-align: center;">
                <h4 style="margin: 0 0 5px; color: #f39c12;">${city.name}</h4>
                <p style="margin: 0; color: #555; font-size: 0.9rem;">${city.label}</p>
              </div>
            `)
          )
          .addTo(lazioMap)
      })
      
      console.log('✅ Lazio 地圖初始化完成（含 GeoJSON 邊界）！')
    })
  } catch (error) {
    console.error('❌ 初始化 Lazio 地圖失敗:', error)
  }
}

// ─── Umbria 地圖初始化 ───
const initializeUmbriaMap = () => {
  try {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    
    if (!mapboxgl.accessToken) {
      console.error('❌ Mapbox access token 未設置')
      return
    }
    
    console.log('🗺️ 開始初始化 Umbria 地圖...')
    
    umbriaMap = new mapboxgl.Map({
      container: 'umbria-map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [12.6, 42.95],
      zoom: 8.8,
      pitch: 0,
      bearing: 0
    })
    
    umbriaMap.addControl(new mapboxgl.NavigationControl(), 'top-right')
    umbriaMap.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    
    umbriaMap.on('load', async () => {
      console.log('📍 載入 Umbria GeoJSON 邊界...')
      
      try {
        const regionResponse = await fetch('/regions/umbria/geojson/Umbria.geojson')
        if (regionResponse.ok) {
          const regionGeojson = await regionResponse.json()
          
          umbriaMap.addSource('umbria-region', {
            type: 'geojson',
            data: regionGeojson
          })
          
          umbriaMap.addLayer({
            id: 'umbria-region-fill',
            type: 'fill',
            source: 'umbria-region',
            paint: {
              'fill-color': '#8e44ad',
              'fill-opacity': 0.08
            }
          })
          
          umbriaMap.addLayer({
            id: 'umbria-region-outline',
            type: 'line',
            source: 'umbria-region',
            paint: {
              'line-color': '#8e44ad',
              'line-width': 3,
              'line-opacity': 0.9
            }
          })
          
          console.log('✅ Umbria 大區邊界已加載')
        }
      } catch (error) {
        console.error('❌ 載入 Umbria 大區邊界失敗:', error)
      }
      
      // DOC/DOCG 產區數據（課程重點產區）
      const regions = [
        {
          name: 'Montefalco Sagrantino DOCG',
          grade: 'S級',
          color: '#8e44ad',
          description: '單寧之王，世界上單寧含量最高的葡萄品種',
          filepath: '/regions/umbria/geojson/DOCG/Montefalco Sagrantino DOCG.geojson'
        },
        {
          name: 'Orvieto DOC',
          grade: 'A級',
          color: '#f39c12',
          description: 'Umbria 最知名的白酒，歷史可追溯至 Etruscan 文明',
          filepath: '/regions/umbria/geojson/DOC/Orvieto DOC.geojson'
        },
        {
          name: 'Torgiano Rosso Riserva DOCG',
          grade: 'A級',
          color: '#c0392b',
          description: 'Sangiovese 為主的陳年紅酒，Lungarotti 酒莊推广',
          filepath: '/regions/umbria/geojson/DOCG/Torgiano Rosso Riserva DOCG.geojson'
        },
        {
          name: 'Montefalco DOC',
          grade: 'B級',
          color: '#e74c3c',
          description: 'Montefalco Rosso，Sangiovese + Sagrantino 混釀、入門選擇',
          filepath: '/regions/umbria/geojson/DOC/Montefalco DOC.geojson'
        },
        {
          name: 'Torgiano DOC',
          grade: 'B級',
          color: '#e67e22',
          description: 'Torgiano 基礎版本，紅白酒皆有',
          filepath: '/regions/umbria/geojson/DOC/Torgiano DOC.geojson'
        }
      ]
      
      // 逐一載入各產區的 GeoJSON
      for (const region of regions) {
        try {
          const response = await fetch(region.filepath)
          if (response.ok) {
            const geojson = await response.json()
            
            const sourceId = `umbria-${region.name.toLowerCase().replace(/\s+/g, '-')}`
            
            umbriaMap.addSource(sourceId, {
              type: 'geojson',
              data: geojson
            })
            
            umbriaMap.addLayer({
              id: `${sourceId}-fill`,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': region.color,
                'fill-opacity': 0.35
              }
            })
            
            umbriaMap.addLayer({
              id: `${sourceId}-outline`,
              type: 'line',
              source: sourceId,
              paint: {
                'line-color': region.color,
                'line-width': 2.5,
                'line-opacity': 0.9
              }
            })
            
            // 懸停效果
            umbriaMap.on('mouseenter', `${sourceId}-fill`, () => {
              umbriaMap.getCanvas().style.cursor = 'pointer'
              umbriaMap.setPaintProperty(`${sourceId}-fill`, 'fill-opacity', 0.6)
            })
            
            umbriaMap.on('mouseleave', `${sourceId}-fill`, () => {
              umbriaMap.getCanvas().style.cursor = ''
              umbriaMap.setPaintProperty(`${sourceId}-fill`, 'fill-opacity', 0.35)
            })
            
            // 點擊顯示資訊
            umbriaMap.on('click', `${sourceId}-fill`, () => {
              new mapboxgl.Popup()
                .setLngLat(umbriaMap.getCenter())
                .setHTML(`
                  <div style="padding: 8px; min-width: 200px;">
                    <h3 style="margin: 0 0 8px; color: ${region.color}; font-size: 1.1rem;">${region.name}</h3>
                    <p style="margin: 5px 0; font-weight: 600; color: #2c3e50;">等級：${region.grade}</p>
                    <p style="margin: 5px 0; color: #555; line-height: 1.5;">${region.description}</p>
                  </div>
                `)
                .addTo(umbriaMap)
            })
            
            console.log(`✅ ${region.name} 已加載`)
          }
        } catch (error) {
          console.error(`❌ 載入 ${region.name} 失敗:`, error)
        }
      }
      
      // 重要城市標記
      const cities = [
        { name: 'Perugia', coords: [12.3889, 43.1107], label: '佩魯賈（首府）' },
        { name: 'Montefalco', coords: [12.6486, 42.8931], label: 'Montefalco（Sagrantino 之鄉）' },
        { name: 'Orvieto', coords: [12.1133, 42.7183], label: 'Orvieto（古城白酒產區）' },
        { name: 'Assisi', coords: [12.6167, 43.0703], label: 'Assisi（聖方濟各故鄉）' }
      ]
      
      cities.forEach(city => {
        const el = document.createElement('div')
        el.className = 'city-marker'
        el.style.cssText = `
          background: #8e44ad;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          cursor: pointer;
        `
        
        new mapboxgl.Marker({ element: el })
          .setLngLat(city.coords)
          .setPopup(new mapboxgl.Popup({ offset: 15 })
            .setHTML(`
              <div style="padding: 8px; text-align: center;">
                <h4 style="margin: 0 0 5px; color: #8e44ad;">${city.name}</h4>
                <p style="margin: 0; color: #555; font-size: 0.9rem;">${city.label}</p>
              </div>
            `)
          )
          .addTo(umbriaMap)
      })
      
      console.log('✅ Umbria 地圖初始化完成（含 GeoJSON 邊界）！')
    })
  } catch (error) {
    console.error('❌ 初始化 Umbria 地圖失敗:', error)
  }
}

watch(() => props.lessonId, () => { loadLessonContent() }, { immediate: true })

// 監聽投影片變化，初始化地圖
watch(currentSlide, async (newSlide) => {
  console.log('📄 投影片切換至:', newSlide)
  await nextTick()
  initializeMapIfNeeded()
})

// 清理地圖
onBeforeUnmount(() => {
  if (italyMap) {
    italyMap.remove()
    italyMap = null
  }
  if (piedmontMap) {
    piedmontMap.remove()
    piedmontMap = null
  }
  if (tuscanyMap) {
    tuscanyMap.remove()
    tuscanyMap = null
  }
  if (venetoMap) {
    venetoMap.remove()
    venetoMap = null
  }
  if (sicilyMap) {
    sicilyMap.remove()
    sicilyMap = null
  }
  if (lombardyMap) {
    lombardyMap.remove()
    lombardyMap = null
  }
  if (trentinoMap) {
    trentinoMap.remove()
    trentinoMap = null
  }
  if (friuliMap) {
    friuliMap.remove()
    friuliMap = null
  }
  if (liguriaMap) {
    liguriaMap.remove()
    liguriaMap = null
  }
  if (emiliaMap) {
    emiliaMap.remove()
    emiliaMap = null
  }
  if (marcheMap) {
    marcheMap.remove()
    marcheMap = null
  }
  if (umbriaMap) {
    umbriaMap.remove()
    umbriaMap = null
  }
  if (lazioMap) {
    lazioMap.remove()
    lazioMap = null
  }
})
</script>

<style scoped>
/* ══════════════════════════════
   整體框架
══════════════════════════════ */
.lesson-viewer {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1a2e;
  outline: none;
}

/* ══════════════════════════════
   頂部導覽列
══════════════════════════════ */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  flex-shrink: 0;
  background: rgba(10, 10, 30, 0.95);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  gap: 16px;
  z-index: 50;
}

.top-bar-left, .top-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.top-bar-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.breadcrumb-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: rgba(255,255,255,0.55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
}
.bc-sep { opacity: 0.4; }
.bc-lesson { color: rgba(255,255,255,0.85); font-weight: 600; }

.btn-back {
  padding: 10px 22px;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.8);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 30px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-back:hover { background: rgba(255,255,255,0.15); color: white; }

.btn-sidebar-toggle {
  padding: 10px 22px;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.7);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 30px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-sidebar-toggle:hover { background: rgba(255,255,255,0.12); color: white; }

.btn-complete {
  padding: 10px 24px;
  background: var(--wine-red);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-complete:hover { background: var(--wine-red-dark); transform: translateY(-1px); }

.badge-done {
  padding: 10px 22px;
  background: var(--success-color);
  color: white;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  white-space: nowrap;
}

/* ── 投影片進度點 ── */
.slide-dots {
  display: flex;
  gap: 8px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}
.dot.active { background: white; transform: scale(1.35); }
.dot:hover { background: rgba(255,255,255,0.6); }

.dot-quiz {
  background: transparent;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-top: -5px;
  opacity: 0.5;
}
.dot-quiz.active { opacity: 1; transform: scale(1.2); }
.dot-quiz:hover { opacity: 0.8; background: transparent; }

.slide-counter {
  font-size: 1rem;
  color: rgba(255,255,255,0.4);
  letter-spacing: 1px;
}

/* ══════════════════════════════
   主體佈局(側邊欄 + 舞台)
══════════════════════════════ */
.body-area {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* ══════════════════════════════
   側邊目錄
══════════════════════════════ */
.sidebar {
  width: 360px;
  flex-shrink: 0;
  background: #0f0f1e;
  border-right: 1px solid rgba(255,255,255,0.06);
  overflow-y: auto;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-module-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
  font-family: var(--font-serif);
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 6px;
}

.sidebar-progress {
  font-size: 1rem;
  color: rgba(255,255,255,0.38);
  margin-bottom: 16px;
}

.lesson-list { display: flex; flex-direction: column; gap: 8px; }

.lesson-nav-item {
  display: flex;
  gap: 14px;
  padding: 14px 16px;
  background: rgba(255,255,255,0.04);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(255,255,255,0.05);
  position: relative;
}
.lesson-nav-item:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.12); }
.lesson-nav-item.active { background: rgba(114,47,55,0.25); border-color: var(--wine-red-light); }
.lesson-nav-item.completed { border-color: rgba(39,174,96,0.4); }

.lesson-nav-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  flex-shrink: 0;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.6);
}
.lesson-nav-item.active .lesson-nav-number { background: var(--wine-red); color: white; }
.lesson-nav-item.completed .lesson-nav-number { background: var(--success-color); color: white; }

.lesson-nav-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
  line-height: 1.4;
  margin-bottom: 6px;
}
.lesson-nav-meta {
  display: flex;
  gap: 10px;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.35);
}
.type-badge {
  background: rgba(255,255,255,0.08);
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.85rem;
}

/* 側邊欄滑入動畫 */
.sidebar-slide-enter-active, .sidebar-slide-leave-active { transition: width 0.3s ease, opacity 0.3s ease; }
.sidebar-slide-enter-from, .sidebar-slide-leave-to { width: 0; opacity: 0; }

/* ══════════════════════════════
   投影片舞台
══════════════════════════════ */
.stage {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  overflow: hidden;
  padding: 40px 80px;
}

/* ── 投影片本體 ── */
.slide-frame {
  background: white;
  border-radius: 20px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.5);
  width: 100%;
  max-width: 1400px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding: 0;
  font-size: 1.5rem;
  line-height: 1.8;
  color: #2c3e50;
}

/* ── 投影片內部樣式覆寫 (v-html) ── */
.slide-frame :deep(.slide-cover) {
  background: linear-gradient(135deg, var(--wine-red-dark) 0%, #9b424e 60%, #764ba2 100%);
  color: white;
  padding: 80px 60px;
  text-align: center;
  border-radius: 20px;
  min-height: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.slide-frame :deep(.slide-cover h1) {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-family: var(--font-serif);
  margin: 0 0 24px;
  color: white;
  line-height: 1.2;
}
.slide-frame :deep(.slide-cover .subtitle) {
  font-size: clamp(1.4rem, 2.5vw, 2rem);
  opacity: 0.85;
  margin: 0;
}

.slide-frame :deep(.slide) {
  padding: 64px 80px;
  min-height: 480px;
}
.slide-frame :deep(.slide h2) {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  color: var(--wine-red-dark);
  font-family: var(--font-serif);
  border-bottom: 3px solid var(--wine-red);
  padding-bottom: 16px;
  margin: 0 0 36px;
}
.slide-frame :deep(.slide h3) {
  font-size: clamp(1.4rem, 2.5vw, 1.8rem);
  color: var(--wine-red);
  margin: 32px 0 16px;
}
.slide-frame :deep(.slide p),
.slide-frame :deep(.slide li) {
  font-size: clamp(1.2rem, 2vw, 1.6rem);
  line-height: 1.8;
  color: #2c3e50;
}
.slide-frame :deep(.big-points li) {
  font-size: clamp(1.3rem, 2.2vw, 1.8rem);
  padding: 18px 0;
  border-bottom: 1px solid #eee;
  list-style: none;
}
.slide-frame :deep(.stat-number) {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
}
.slide-frame :deep(.stat-label) {
  font-size: clamp(1.1rem, 1.8vw, 1.4rem);
}
.slide-frame :deep(.stats-grid) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
}
.slide-frame :deep(.region-table th),
.slide-frame :deep(.region-table td) {
  font-size: clamp(1.1rem, 1.8vw, 1.4rem);
  padding: 18px 24px;
}
.slide-frame :deep(.objective-item) {
  font-size: clamp(1.2rem, 2vw, 1.6rem);
  padding: 20px 32px;
}
.slide-frame :deep(.highlight-box) {
  background: linear-gradient(135deg, #f6f8fc, #eef2f7);
  padding: 28px 36px;
  border-radius: 12px;
  border-left: 5px solid var(--wine-red);
}

/* ══════════════════════════════
   測驗模式樣式
══════════════════════════════ */
.quiz-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
}

.quiz-container {
  width: 100%;
  max-width: 800px;
  padding: 40px;
  margin: 0 auto;
}

.quiz-container h2 {
  text-align: center;
  color: var(--wine-red-dark);
  font-family: var(--font-serif);
  font-size: 2.5rem;
  margin-bottom: 40px;
  border-bottom: 2px solid rgba(114, 47, 55, 0.2);
  padding-bottom: 20px;
}

.quiz-progress {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
  font-weight: 600;
}

.quiz-question {
  font-size: 1.8rem;
  color: var(--text-primary);
  line-height: 1.5;
  margin-bottom: 32px;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.quiz-option {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 20px 24px;
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-size: 1.3rem;
  color: var(--text-primary);
}

.quiz-option:hover:not(:disabled) {
  border-color: var(--wine-red-light);
  background: rgba(114, 47, 55, 0.03);
  transform: translateY(-2px);
}

.quiz-option.selected {
  border-color: var(--wine-red);
  background: rgba(114, 47, 55, 0.08);
}

.quiz-option.correct {
  border-color: var(--success-color);
  background: rgba(39, 174, 96, 0.1);
}

.quiz-option.wrong {
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  opacity: 0.7;
}

.option-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--cream-bg);
  border-radius: 50%;
  margin-right: 20px;
  font-weight: 700;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.quiz-option.selected .option-letter {
  background: var(--wine-red);
  color: white;
}

.quiz-option.correct .option-letter {
  background: var(--success-color);
  color: white;
}

.quiz-option.wrong .option-letter {
  background: #e74c3c;
  color: white;
}

.quiz-feedback {
  display: flex;
  gap: 20px;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 32px;
  animation: fadeIn 0.3s ease;
}

.feedback-correct {
  background: rgba(39, 174, 96, 0.1);
  border-left: 4px solid var(--success-color);
}

.feedback-wrong {
  background: rgba(231, 76, 60, 0.1);
  border-left: 4px solid #e74c3c;
}

.feedback-icon {
  font-size: 2rem;
}

.feedback-text h4 {
  margin: 0 0 8px 0;
  font-size: 1.4rem;
  color: var(--text-primary);
}

.feedback-text p {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.quiz-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-quiz-submit, .btn-quiz-next {
  padding: 16px 40px;
  font-size: 1.3rem;
  font-weight: 600;
  border-radius: 30px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-quiz-submit {
  background: var(--wine-red);
  color: white;
}

.btn-quiz-submit:hover:not(:disabled) {
  background: var(--wine-red-dark);
  transform: translateY(-2px);
}

.btn-quiz-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-quiz-next {
  background: var(--success-color);
  color: white;
}

.btn-quiz-next:hover {
  background: #219a52;
  transform: translateY(-2px);
}

.quiz-result {
  text-align: center;
  padding: 40px 0;
}

.result-score {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.score-circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: white;
  border: 8px solid #e74c3c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  font-weight: 700;
  color: var(--text-primary);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.score-circle span {
  font-size: 1.5rem;
  margin-left: 4px;
  color: var(--text-secondary);
}

.score-pass {
  border-color: var(--success-color);
}

.quiz-result h3 {
  font-size: 2.2rem;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.quiz-result p {
  font-size: 1.4rem;
  color: var(--text-secondary);
  margin-bottom: 40px;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn-quiz-retry {
  padding: 14px 32px;
  font-size: 1.2rem;
  font-weight: 600;
  background: white;
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-quiz-retry:hover {
  border-color: var(--text-secondary);
  background: var(--cream-bg);
}

.btn-quiz-finish {
  padding: 14px 32px;
  font-size: 1.2rem;
  font-weight: 600;
  background: var(--wine-red);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-quiz-finish:hover {
  background: var(--wine-red-dark);
  transform: translateY(-2px);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── 翻頁箭頭 ── */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  color: white;
  border: 2px solid rgba(255,255,255,0.2);
  font-size: 1.6rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(4px);
}
.nav-arrow--left { left: 16px; }
.nav-arrow--right { right: 16px; }
.nav-arrow:hover:not(:disabled) {
  background: rgba(255,255,255,0.22);
  border-color: rgba(255,255,255,0.5);
  transform: translateY(-50%) scale(1.08);
}
.nav-arrow:disabled { opacity: 0.2; cursor: not-allowed; }

/* ── 地圖課型 ── */
.map-slide {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  width: 100%;
  max-width: 1600px;
  height: calc(100vh - 120px);
  align-items: start;
}
.map-slide-text {
  background: white;
  border-radius: 20px;
  padding: 56px 64px;
  height: 100%;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
.map-slide-text h1 {
  font-size: clamp(2rem, 3.5vw, 3.2rem);
  color: var(--wine-red-dark);
  font-family: var(--font-serif);
  line-height: 1.25;
  margin: 0 0 24px;
}
.lesson-meta-chips {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}
.chip {
  padding: 8px 20px;
  border-radius: 30px;
  font-size: 1.1rem;
  background: var(--cream-bg);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}
.chip-type { background: var(--wine-red); color: white; border-color: var(--wine-red); }
.map-description { font-size: 1.3rem; line-height: 1.8; color: #444; }
.map-description :deep(h2) { font-size: 1.8rem; color: var(--wine-red-dark); margin: 32px 0 16px; }
.map-description :deep(li) { margin: 12px 0; font-size: 1.25rem; }

.map-slide-iframe {
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
.map-slide-iframe iframe {
  width: 100%;
  height: 100%;
  border: none;
  min-height: 600px;
}

/* ── Mapbox 地圖容器樣式 ── */
.slide-frame :deep(.map-slide-container) {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  height: 100%;
  min-height: 500px;
  padding: 20px;
}

.slide-frame :deep(.italy-overview-map),
.slide-frame :deep(.piedmont-region-map),
.slide-frame :deep(.tuscany-region-map),
.slide-frame :deep(.veneto-region-map),
.slide-frame :deep(.sicily-region-map),
.slide-frame :deep(.lombardy-region-map),
.slide-frame :deep(.trentino-region-map),
.slide-frame :deep(.friuli-region-map),
.slide-frame :deep(.liguria-region-map),
.slide-frame :deep(.emilia-region-map),
.slide-frame :deep(.marche-region-map),
.slide-frame :deep(.umbria-region-map) {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

.slide-frame :deep(.lazio-region-map) {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

.slide-frame :deep(.map-legend) {
  background: rgba(26, 26, 46, 0.92);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: fit-content;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.slide-frame :deep(.map-legend h3) {
  margin: 0 0 20px;
  color: #ffffff;
  font-size: 1.3rem;
  font-weight: 700;
  border-bottom: 2px solid rgba(102, 126, 234, 0.6);
  padding-bottom: 10px;
}

.slide-frame :deep(.legend-items) {
  margin-bottom: 25px;
}

.slide-frame :deep(.legend-item) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 500;
}

.slide-frame :deep(.legend-dot) {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 8px currentColor;
  flex-shrink: 0;
}

.slide-frame :deep(.legend-dot.north) {
  background: #3498db;
}

.slide-frame :deep(.legend-dot.central) {
  background: #27ae60;
}

.slide-frame :deep(.legend-dot.south) {
  background: #e74c3c;
}

.slide-frame :deep(.legend-dot.docg) {
  background: #c0392b;
}

.slide-frame :deep(.legend-dot.doc) {
  background: #3498db;
}

.slide-frame :deep(.legend-dot.city) {
  background: #f39c12;
}

.slide-frame :deep(.region-highlights) {
  background: rgba(142, 68, 173, 0.15);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid rgba(142, 68, 173, 0.3);
}

.slide-frame :deep(.region-highlights h4) {
  margin: 0 0 10px;
  color: #ffffff;
  font-weight: 700;
  font-size: 1.05rem;
}

.slide-frame :deep(.region-highlights ul) {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.slide-frame :deep(.region-highlights li) {
  margin: 8px 0;
  color: rgba(255, 255, 255, 0.95);
  font-size: 1rem;
  font-weight: 500;
  padding-left: 0;
}

.slide-frame :deep(.region-highlights strong) {
  color: #ffffff;
}

.slide-frame :deep(.map-tips) {
  background: rgba(102, 126, 234, 0.15);
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.slide-frame :deep(.map-tips p) {
  margin: 0 0 10px;
  color: #ffffff;
  font-weight: 700;
  font-size: 1.05rem;
}

.slide-frame :deep(.map-tips ul) {
  margin: 0;
  padding-left: 20px;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.8;
}

.slide-frame :deep(.map-tips li) {
  list-style: none;
  padding-left: 0;
  margin: 5px 0;
  font-size: 1rem;
  font-weight: 500;
}

.slide-frame :deep(.mapboxgl-popup-content) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.slide-frame :deep(.mapboxgl-popup-tip) {
  border-top-color: rgba(255, 255, 255, 0.95);
}

.slide-frame :deep(.italy-region-marker),
.slide-frame :deep(.piedmont-region-marker) {
  cursor: pointer;
}

/* ── 投影片切換動畫 ── */
.slide-left-enter-active, .slide-left-leave-active,
.slide-right-enter-active, .slide-right-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-from  { transform: translateX(70px);  opacity: 0; }
.slide-left-leave-to    { transform: translateX(-70px); opacity: 0; }
.slide-right-enter-from { transform: translateX(-70px); opacity: 0; }
.slide-right-leave-to   { transform: translateX(70px);  opacity: 0; }

/* ── 載入中 ── */
.loading-slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(255,255,255,0.5);
  gap: 20px;
  font-size: 1.1rem;
  font-family: var(--font-serif);
  font-style: italic;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top: 3px solid rgba(255,255,255,0.7);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ── 整頁載入中 ── */
.loading-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #1a1a2e;
  color: rgba(255,255,255,0.5);
  gap: 24px;
}
.spinner-large {
  width: 60px;
  height: 60px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.loading-page p { font-size: 1.2rem; font-family: var(--font-serif); }

/* ── RWD ── */
@media (max-width: 900px) {
  .stage { padding: 24px 60px; }
  .map-slide { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
  .map-slide-iframe { min-height: 300px; }
  .slide-frame { font-size: 1rem; }
  .breadcrumb-compact { display: none; }
}
@media (max-width: 600px) {
  .stage { padding: 16px 48px; }
  .top-bar { padding: 0 12px; }
  .sidebar { width: 260px; }
  .slide-frame :deep(.slide) { padding: 32px 28px; }
  .slide-frame :deep(.slide-cover) { padding: 48px 28px; }
  .nav-arrow { width: 44px; height: 44px; font-size: 1.3rem; }
}
</style>
