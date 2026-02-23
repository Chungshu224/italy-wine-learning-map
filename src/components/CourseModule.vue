<template>
  <div v-if="level" class="course-module" :style="{ '--level-color': level.color }">
    <!-- 課程頭部 -->
    <div class="module-header">
      <button class="back-button" @click="goBack">
        ← 返回課程選擇
      </button>
      
      <div class="header-content">
        <div class="level-badge" :style="{ background: level.color }">
          <span class="level-icon">{{ level.icon }}</span>
          <span>{{ level.title }}</span>
        </div>
        <h1>{{ level.subtitle }}</h1>
        <div class="overall-progress">
          <div class="progress-stats">
            <span>已完成: {{ completedLessonsCount }}/{{ level.totalLessons }}</span>
            <span class="progress-percentage">{{ overallProgress }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" 
                 :style="{ width: overallProgress + '%', background: level.color }">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模組列表 -->
    <div v-if="level && level.modules" class="modules-container">
      <div v-for="(module, moduleIndex) in level.modules" 
           :key="module.id"
           class="module-card">
        
        <div class="module-header-bar">
          <div class="module-title-section">
            <span class="module-number">第 {{ moduleIndex + 1 }} 章</span>
            <h2>{{ module.title }}</h2>
          </div>
          <div v-if="module.lessons" class="module-progress">
            {{ getModuleCompletedCount(module) }}/{{ module.lessons.length }} 完成
          </div>
        </div>

        <div v-if="module.lessons" class="lessons-grid">
          <div v-for="(lesson, lessonIndex) in module.lessons"
               :key="lesson.id"
               :class="['lesson-item', {
                 completed: isLessonCompleted(lesson.id),
                 current: currentLessonId === lesson.id,
                 locked: !isLessonUnlocked(moduleIndex, lessonIndex)
               }]"
               @click="selectLesson(lesson, moduleIndex, lessonIndex)">
            
            <div class="lesson-status-icon">
              <span v-if="isLessonCompleted(lesson.id)">✓</span>
              <span v-else-if="!isLessonUnlocked(moduleIndex, lessonIndex)">🔒</span>
              <span v-else>{{ lessonIndex + 1 }}</span>
            </div>

            <div class="lesson-content">
              <h3>{{ lesson.title }}</h3>
              
              <div class="lesson-meta">
                <span class="lesson-type" :class="'type-' + lesson.type">
                  {{ getTypeLabel(lesson.type) }}
                </span>
                <span class="lesson-duration">⏱️ {{ lesson.duration }}</span>
              </div>

              <div v-if="lesson.mapRegion" class="lesson-region">
                🗺️ {{ lesson.mapRegion }}
              </div>

              <div v-if="lesson.interactive" class="interactive-badges">
                <span v-for="item in lesson.interactive" :key="item" class="badge">
                  {{ getInteractiveLabel(item) }}
                </span>
              </div>
            </div>

            <div v-if="isLessonCompleted(lesson.id)" class="completed-badge">
              完成
            </div>
          </div>
        </div>
      </div>

      <!-- 測驗卡片 -->
      <div v-if="level.exam" class="exam-card" :class="{ unlocked: isExamUnlocked }">
        <div class="exam-header">
          <span class="exam-icon">🎓</span>
          <h2>{{ level.exam.certificateName }}</h2>
        </div>

        <div v-if="!isExamUnlocked" class="exam-locked">
          <p>🔒 完成所有課程後才能參加測驗</p>
          <p class="exam-requirement">
            需完成: {{ completedLessonsCount }}/{{ level.totalLessons }} 課程
          </p>
        </div>

        <div v-else class="exam-details">
          <div class="exam-stats">
            <div class="exam-stat">
              <span class="stat-icon">📝</span>
              <span>{{ level.exam.totalQuestions }} 題</span>
            </div>
            <div class="exam-stat">
              <span class="stat-icon">⏰</span>
              <span>{{ level.exam.timeLimit }}</span>
            </div>
            <div class="exam-stat">
              <span class="stat-icon">🎯</span>
              <span>{{ level.exam.passingScore }}% 及格</span>
            </div>
          </div>

          <div v-if="examResult" class="exam-result">
            <div v-if="examResult.passed" class="result-passed">
              🏆 恭喜通過！得分: {{ examResult.score }}%
              <button class="cert-button" @click="downloadCertificate">
                下載證書
              </button>
            </div>
            <div v-else class="result-failed">
              得分: {{ examResult.score }}% (未達及格標準)
              <button class="retry-button" @click="startExam">
                重新測驗
              </button>
            </div>
          </div>

          <button v-else class="start-exam-button" 
                  :style="{ background: level.color }"
                  @click="startExam">
            開始測驗
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading-page">
    <div class="spinner-large"></div>
    <p>載入課程中...</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { courseLevels, getUserProgress, saveUserProgress } from '../data/courseLevels'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  levelId: {
    type: String,
    required: true
  }
})

const level = computed(() => courseLevels[props.levelId])
const currentLessonId = ref(null)
const progress = ref(getUserProgress(props.levelId))

const completedLessonsCount = computed(() => {
  return progress.value.completedLessons?.length || 0
})

const overallProgress = computed(() => {
  if (!level.value) return 0
  return Math.round((completedLessonsCount.value / level.value.totalLessons) * 100)
})

const isExamUnlocked = computed(() => {
  if (!level.value) return false
  return completedLessonsCount.value === level.value.totalLessons
})

const examResult = computed(() => {
  return progress.value.examResult || null
})

const isLessonCompleted = (lessonId) => {
  return progress.value.completedLessons?.includes(lessonId) || false
}

const getModuleCompletedCount = (module) => {
  if (!module || !module.lessons) return 0
  return module.lessons.filter(lesson => isLessonCompleted(lesson.id)).length
}

const TEST_MODE = true // 測試模式：開放所有課程

const isLessonUnlocked = (moduleIndex, lessonIndex) => {
  // 測試模式下所有課程解鎖
  if (TEST_MODE) return true
  
  // 第一課總是解鎖
  if (moduleIndex === 0 && lessonIndex === 0) return true
  
  // 檢查 level 是否已載入
  if (!level.value || !level.value.modules) return false
  
  // 檢查前一課是否完成
  if (lessonIndex > 0) {
    const currentModule = level.value.modules[moduleIndex]
    if (!currentModule || !currentModule.lessons) return false
    const prevLesson = currentModule.lessons[lessonIndex - 1]
    if (!prevLesson) return false
    return isLessonCompleted(prevLesson.id)
  }
  
  // 檢查前一個模組的最後一課是否完成
  if (moduleIndex > 0) {
    const prevModule = level.value.modules[moduleIndex - 1]
    if (!prevModule || !prevModule.lessons || prevModule.lessons.length === 0) return false
    const lastLesson = prevModule.lessons[prevModule.lessons.length - 1]
    if (!lastLesson) return false
    return isLessonCompleted(lastLesson.id)
  }
  
  return true
}

const selectLesson = (lesson, moduleIndex, lessonIndex) => {
  if (!TEST_MODE && !isLessonUnlocked(moduleIndex, lessonIndex)) {
    alert('請先完成前一個課程')
    return
  }
  
  currentLessonId.value = lesson.id
  router.push({
    path: `/course/${props.levelId}/lesson/${lesson.id}`,
    query: { module: moduleIndex, index: lessonIndex }
  })
}

const getTypeLabel = (type) => {
  const labels = {
    theory: '理論',
    map: '地圖',
    interactive: '互動',
    tasting: '品鑑',
    pairing: '搭配',
    quiz: '測驗'
  }
  return labels[type] || type
}

const getInteractiveLabel = (item) => {
  const labels = {
    map: '🗺️',
    quiz: '📝',
    flashcard: '🃏',
    comparison: '⚖️',
    timeline: '📅',
    video: '🎥'
  }
  return labels[item] || item
}

const startExam = () => {
  router.push(`/course/${props.levelId}/exam`)
}

const downloadCertificate = () => {
  // 實作下載證書功能
  alert('證書下載功能開發中...')
}

const goBack = () => {
  router.push('/course')
}
</script>

<style scoped>
.course-module {
  min-height: 100vh;
  background-color: var(--cream-bg);
}

 .module-header {
  background: linear-gradient(135deg, var(--wine-red-dark) 0%, var(--wine-red) 100%);
  color: var(--champagne);
  padding: 40px clamp(20px, 5vw, 60px) 60px;
  position: relative;
  /* overflow: hidden; 移除以恢復全域卷軸 */
}

.module-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 80% 20%, rgba(247, 231, 206, 0.1) 0%, transparent 40%);
  pointer-events: none;
}

.back-button {
  background: rgba(247, 231, 206, 0.15);
  color: var(--champagne);
  border: 1px solid rgba(247, 231, 206, 0.3);
  padding: 10px 24px;
  border-radius: 30px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 40px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(4px);
}

.back-button:hover {
  background: rgba(247, 231, 206, 0.25);
  transform: translateX(-5px);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 1;
}

.level-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 8px 24px;
  border-radius: 30px;
  font-weight: 600;
  margin-bottom: 20px;
  font-size: 0.95rem;
  background: var(--level-color, var(--wine-red-light));
  color: white;
  box-shadow: var(--shadow-sm);
  letter-spacing: 1px;
}

.level-icon {
  font-size: 1.4rem;
}

.header-content h1 {
  font-size: 3rem;
  margin: 0 0 30px;
  color: var(--champagne);
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.overall-progress {
  max-width: 600px;
  background: rgba(0,0,0,0.2);
  padding: 20px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 1rem;
  color: var(--champagne);
  font-weight: 500;
}

.progress-percentage {
  font-weight: 700;
  font-size: 1.2rem;
  font-family: var(--font-serif);
}

.progress-bar {
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  /* overflow: hidden; 移除以恢復全域卷軸 */
}

.progress-fill {
  height: 100%;
  background: var(--champagne);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(247, 231, 206, 0.5);
}

.modules-container {
  max-width: 1400px;
  margin: -40px auto 80px;
  padding: 0 clamp(20px, 5vw, 60px);
  width: 100%;
  position: relative;
  z-index: 10;
}

.module-card {
  background: var(--paper-bg);
  border-radius: 20px;
  padding: clamp(30px, 4vw, 50px);
  margin-bottom: 40px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.module-card:hover {
  box-shadow: var(--shadow-lg);
}

.module-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 35px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.module-title-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.module-number {
  color: var(--wine-red-light);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.module-card h2 {
  margin: 0;
  font-size: 2rem;
  color: var(--wine-red-dark);
}

.module-progress {
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 500;
  background: var(--cream-bg);
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
}

.lessons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
}

.lesson-item {
  display: flex;
  gap: 20px;
  padding: 25px;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: 1px solid var(--border-color);
  position: relative;
  /* overflow: hidden; 移除以恢復全域卷軸 */
}

.lesson-item:not(.locked):hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
  border-color: var(--wine-red-light);
}

.lesson-item.completed {
  background: #fdfbf7;
  border-color: var(--success-color);
}

.lesson-item.completed::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--success-color);
}

.lesson-item.current {
  border-color: var(--wine-red);
  background: var(--cream-bg);
  box-shadow: var(--shadow-sm);
}

.lesson-item.current::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--wine-red);
}

.lesson-item.locked {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f5f5f5;
}

.lesson-status-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: var(--cream-bg);
  color: var(--wine-red-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-family: var(--font-serif);
  flex-shrink: 0;
  font-size: 1.2rem;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.lesson-item:not(.locked):hover .lesson-status-icon {
  background: var(--wine-red);
  color: white;
  border-color: var(--wine-red);
}

.lesson-item.completed .lesson-status-icon {
  background: var(--success-color);
  color: white;
  border-color: var(--success-color);
}

.lesson-item.locked .lesson-status-icon {
  background: #e0e0e0;
  color: #9e9e9e;
  border-color: #d5d5d5;
}

.lesson-content {
  flex: 1;
}

.lesson-content h3 {
  margin: 0 0 12px;
  font-size: 1.2rem;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-weight: 600;
  line-height: 1.4;
}

.lesson-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.lesson-type {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.type-theory { background: #e8f4f8; color: #2980b9; }
.type-map { background: #fef5e7; color: #d35400; }
.type-interactive { background: #f4ecf7; color: #8e44ad; }
.type-tasting { background: #fdedec; color: #c0392b; }
.type-pairing { background: #eafaf1; color: #27ae60; }
.type-quiz { background: #fef9e7; color: #f39c12; }

.lesson-duration {
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.lesson-region {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.interactive-badges {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 10px;
  background: var(--cream-bg);
  border-radius: 6px;
  font-size: 0.8rem;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.completed-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: var(--success-color);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: var(--shadow-sm);
}

.exam-card {
  background: var(--paper-bg);
  border-radius: 20px;
  padding: 50px;
  margin-top: 60px;
  text-align: center;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  position: relative;
  /* overflow: hidden; 移除以恢復全域卷軸 */
}

.exam-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: var(--border-color);
}

.exam-card.unlocked {
  background: linear-gradient(to bottom, #fffdf5, #fff);
  border-color: #f1c40f;
}

.exam-card.unlocked::before {
  background: linear-gradient(90deg, #f1c40f, #f39c12);
}

.exam-header {
  margin-bottom: 30px;
}

.exam-icon {
  font-size: 4.5rem;
  display: block;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
}

.exam-card h2 {
  font-size: 2.2rem;
  color: var(--wine-red-dark);
  margin: 0;
}

.exam-locked p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 15px 0;
}

.exam-requirement {
  font-weight: 600;
  color: var(--wine-red);
  background: var(--cream-bg);
  display: inline-block;
  padding: 8px 20px;
  border-radius: 20px;
  margin-top: 10px;
}

.exam-details {
  max-width: 700px;
  margin: 0 auto;
}

.exam-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  margin: 35px 0;
}

.exam-stat {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  font-weight: 600;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  font-size: 2rem;
}

.start-exam-button {
  width: 100%;
  max-width: 350px;
  padding: 18px 40px;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 1px;
  margin-top: 30px;
  border-radius: 30px;
}

.exam-result {
  margin-top: 30px;
  padding: 30px;
  border-radius: 16px;
  font-size: 1.2rem;
  font-weight: 600;
}

.result-passed {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.result-failed {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.cert-button, .retry-button {
  display: inline-block;
  margin: 20px auto 0;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 1rem;
}

.cert-button {
  background: #f59e0b;
  color: white;
}

.cert-button:hover {
  background: #d68910;
}

.retry-button {
  background: #e74c3c;
  color: white;
}

.retry-button:hover {
  background: #c0392b;
}

@media (max-width: 768px) {
  .header-content h1 {
    font-size: 2.2rem;
  }
  
  .module-header {
    padding: 30px 20px 40px;
  }
  
  .modules-container {
    padding: 0 20px;
    margin-top: -20px;
  }
  
  .module-card {
    padding: 25px;
  }
  
  .module-header-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .lessons-grid {
    grid-template-columns: 1fr;
  }
  
  .exam-stats {
    grid-template-columns: 1fr;
  }
}

.loading-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--cream-bg);
}

.loading-page p {
  margin-top: 25px;
  font-size: 1.2rem;
  color: var(--text-secondary);
  font-family: var(--font-serif);
  font-style: italic;
}

.spinner-large {
  width: 60px;
  height: 60px;
  border: 3px solid rgba(114, 47, 55, 0.1);
  border-top: 3px solid var(--wine-red);
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
