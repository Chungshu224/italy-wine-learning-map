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
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { courseLevels, getUserProgress, saveUserProgress } from '../data/courseLevels'

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
  
  try {
    const response = await fetch(`/courses/${props.levelId}/${props.lessonId}.json`)
    if (response.ok) {
      const data = await response.json()
      lessonContent.value = data.content
      slides.value = parseSlides(data.content)
      if (data.quiz && data.quiz.length > 0) {
        quizData.value = data.quiz
      }
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

watch(() => props.lessonId, () => { loadLessonContent() }, { immediate: true })
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
