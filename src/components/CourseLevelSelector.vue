<template>
  <div class="course-levels">
    <!-- 測試模式提示 -->
    <div class="test-mode-banner">
      ⚠️ 測試模式：所有課程已解鎖 | <router-link to="/regions">📍 前往產區地圖</router-link>
    </div>

    <div class="hero">
      <h1>義大利葡萄酒學習之旅</h1>
      <p class="hero-subtitle">系統化學習，從入門到專家</p>
      <div class="hero-stats">
        <div class="stat-item">
          <span class="stat-number">3</span>
          <span class="stat-label">課程級別</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">19</span>
          <span class="stat-label">產區覆蓋</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">77</span>
          <span class="stat-label">課程單元</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">20+</span>
          <span class="stat-label">學習時數</span>
        </div>
      </div>
    </div>

    <div class="levels-container">
      <div v-for="(level, key) in levels" :key="key" 
           :class="['level-card', `level-${key}`, { locked: !isUnlocked(level) }]"
           :style="{ '--level-color': level.color }"
           @click="selectLevel(key, level)">
        
        <div v-if="!isUnlocked(level)" class="lock-overlay">
          <span class="lock-icon">🔒</span>
          <p>請先完成前置課程</p>
        </div>

        <div class="level-badge" :style="{ background: level.color }">
          <span class="level-icon">{{ level.icon }}</span>
          <span class="level-difficulty">{{ level.difficulty }}</span>
        </div>

        <h2>{{ level.title }}</h2>
        <p class="subtitle">{{ level.subtitle }}</p>

        <div class="level-stats">
          <div class="stat">
            <span class="stat-icon">⏱️</span>
            <span>{{ level.duration }}</span>
          </div>
          <div class="stat">
            <span class="stat-icon">📚</span>
            <span>{{ level.modules.length }} 章節</span>
          </div>
          <div class="stat">
            <span class="stat-icon">🎯</span>
            <span>{{ level.totalLessons }} 課程</span>
          </div>
        </div>

        <div v-if="level.prerequisites" class="prerequisites">
          <strong>📋 前置要求：</strong>
          <ul>
            <li v-for="(prereq, idx) in level.prerequisites" :key="idx">
              {{ prereq }}
            </li>
          </ul>
        </div>

        <div class="level-highlights">
          <h4>📖 學習內容：</h4>
          <ul>
            <li v-for="(module, idx) in level.modules.slice(0, 4)" :key="idx">
              {{ module.title }}
            </li>
            <li v-if="level.modules.length > 4" class="more">
              ... 還有 {{ level.modules.length - 4 }} 個章節
            </li>
          </ul>
        </div>

        <button 
          :style="{ background: isUnlocked(level) ? level.color : '#ccc' }" 
          class="start-button"
          :disabled="!isUnlocked(level)">
          {{ getButtonText(key) }}
        </button>

        <div v-if="getProgress(key) > 0" class="progress-indicator">
          <div class="progress-bar">
            <div class="progress-fill" 
                 :style="{ width: getProgress(key) + '%', background: level.color }">
            </div>
          </div>
          <span class="progress-text">{{ getProgress(key) }}% 完成</span>
        </div>

        <div v-if="hasCertificate(key)" class="certificate-badge">
          🏆 已獲得認證
        </div>
      </div>
    </div>

    <!-- 學習路徑圖 -->
    <div class="learning-path">
      <h2>📈 建議學習路徑</h2>
      <div class="path-diagram">
        <div class="path-step" :class="{ completed: hasCertificate('level1') }">
          <div class="step-number">1</div>
          <div class="step-icon">🌱</div>
          <h3>Level 1 入門</h3>
          <p class="step-duration">3-4 小時</p>
          <ul class="step-features">
            <li>5 大經典產區</li>
            <li>基礎品種認識</li>
            <li>分級制度理解</li>
          </ul>
        </div>
        <div class="path-arrow">→</div>
        <div class="path-step" :class="{ completed: hasCertificate('level2') }">
          <div class="step-number">2</div>
          <div class="step-icon">🍷</div>
          <h3>Level 2 進階</h3>
          <p class="step-duration">6-8 小時</p>
          <ul class="step-features">
            <li>全國 19 產區</li>
            <li>餐酒搭配藝術</li>
            <li>進階品種研究</li>
          </ul>
        </div>
        <div class="path-arrow">→</div>
        <div class="path-step" :class="{ completed: hasCertificate('level3') }">
          <div class="step-number">3</div>
          <div class="step-icon">🏆</div>
          <h3>Level 3 專家</h3>
          <p class="step-duration">10-12 小時</p>
          <ul class="step-features">
            <li>稀有品種深研</li>
            <li>盲品專業訓練</li>
            <li>產業市場分析</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 為什麼選擇我們 -->
    <div class="why-choose">
      <h2>🌟 課程特色</h2>
      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">🗺️</div>
          <h3>互動地圖學習</h3>
          <p>每個產區都配有完整的互動地圖，直觀了解 DOC/DOCG 分布</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🎓</div>
          <h3>專業認證體系</h3>
          <p>完成各級別課程可獲得專業認證證書</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📱</div>
          <div class="feature-icon">💻</div>
          <h3>隨時隨地學習</h3>
          <p>支援電腦、平板、手機，學習進度雲端同步</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🎯</div>
          <h3>系統化課程設計</h3>
          <p>循序漸進的課程安排，從基礎到專家級</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { courseLevels, getUserProgress, checkPrerequisites } from '../data/courseLevels'

const router = useRouter()
const levels = ref(courseLevels)

const getProgress = (levelKey) => {
  const progress = getUserProgress(levelKey)
  if (!progress.completedLessons) return 0
  
  const level = levels.value[levelKey]
  const totalLessons = level.totalLessons
  const completed = progress.completedLessons.length
  
  return Math.round((completed / totalLessons) * 100)
}

const hasCertificate = (levelKey) => {
  const progress = getUserProgress(levelKey)
  return progress.examPassed || false
}

const isUnlocked = (level) => {
  return checkPrerequisites(level)
}

const getButtonText = (levelKey) => {
  if (!isUnlocked(levels.value[levelKey])) {
    return '🔒 未解鎖'
  }
  
  const progress = getProgress(levelKey)
  if (progress === 0) {
    return '開始學習'
  } else if (progress === 100 || hasCertificate(levelKey)) {
    return '復習課程'
  } else {
    return '繼續學習'
  }
}

const TEST_MODE = true // 測試模式

const selectLevel = (levelKey, level) => {
  if (!TEST_MODE && !isUnlocked(level)) {
    alert('請先完成前置課程才能解鎖此級別')
    return
  }
  
  router.push(`/course/${levelKey}`)
}
</script>

<style scoped>
.course-levels {
  min-height: 100vh;
  background-color: var(--cream-bg);
}

 .hero {
  background: linear-gradient(135deg, var(--wine-red-dark) 0%, var(--wine-red) 100%);
  color: var(--champagne);
  padding: 80px 30px 60px;
  text-align: center;
  position: relative;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(247, 231, 206, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero h1 {
  font-size: 4rem;
  margin: 0 0 20px;
  font-weight: 700;
  color: var(--champagne);
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
  font-family: var(--font-serif);
}

.hero-subtitle {
  font-size: 1.4rem;
  margin-bottom: 50px;
  opacity: 0.9;
  font-weight: 300;
  font-family: var(--font-serif);
  letter-spacing: 1px;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 80px;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.stat-number {
  font-size: 3.5rem;
  font-weight: 700;
  font-family: var(--font-serif);
  margin-bottom: 8px;
  color: var(--champagne);
  line-height: 1;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.8;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.levels-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  max-width: 1400px;
  margin: -40px auto 80px;
  padding: 0 clamp(20px, 5vw, 60px);
  position: relative;
  z-index: 10;
}

.level-card {
  background: var(--paper-bg);
  border-radius: 20px;
  padding: 40px;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  position: relative;
  /* overflow: hidden; 移除以恢復全域卷軸 */
  display: flex;
  flex-direction: column;
  min-height: 700px;
  border: 1px solid var(--border-color);
}

.level-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: var(--level-color, var(--wine-red));
}

.level-card:not(.locked):hover {
  transform: translateY(-12px);
  box-shadow: var(--shadow-lg);
}

.level-card.locked {
  opacity: 0.7;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(253, 251, 247, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 20px;
}

.lock-icon {
  font-size: 3.5rem;
  margin-bottom: 15px;
  opacity: 0.8;
}

.level-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  border-radius: 30px;
  color: white;
  font-weight: 600;
  margin-bottom: 25px;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

.level-icon {
  font-size: 1.5rem;
}

.level-card h2 {
  font-size: 2rem;
  margin: 0 0 15px;
  color: var(--wine-red-dark);
  font-family: var(--font-serif);
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-bottom: 30px;
  line-height: 1.6;
  min-height: 55px;
  font-family: var(--font-serif);
  font-style: italic;
}

.level-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin: 0 0 30px;
  padding: 20px;
  background: var(--cream-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 500;
}

.stat-icon {
  font-size: 1.4rem;
  opacity: 0.8;
}

.prerequisites {
  background: var(--champagne);
  padding: 15px 20px;
  border-radius: 10px;
  margin: 0 0 25px;
  font-size: 0.9rem;
  border-left: 4px solid var(--wine-red-light);
  color: var(--wine-red-dark);
}

.prerequisites strong {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.prerequisites ul {
  margin: 0;
  padding-left: 20px;
  line-height: 1.6;
}

.level-highlights {
  margin: 0 0 30px;
  flex: 1;
}

.level-highlights h4 {
  margin: 0 0 15px;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-family: var(--font-sans);
  font-weight: 600;
}

.level-highlights ul {
  margin: 0;
  padding-left: 20px;
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 2;
}

.level-highlights .more {
  color: var(--text-light);
  font-style: italic;
  list-style-type: none;
  padding-left: 0;
  margin-top: 8px;
}

.start-button {
  width: 100%;
  padding: 18px;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 1px;
  margin-top: auto;
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-sans);
  box-shadow: var(--shadow-md);
}

.start-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  filter: brightness(1.1);
}

.start-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}

.progress-indicator {
  margin-top: 20px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  /* overflow: hidden; 移除以恢復全域卷軸 */
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 4px;
}

.progress-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.certificate-badge {
  margin-top: 20px;
  padding: 15px;
  background: linear-gradient(135deg, var(--champagne-dark) 0%, #d4af37 100%);
  color: var(--wine-red-dark);
  text-align: center;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: var(--shadow-sm);
}

.learning-path {
  max-width: 1400px;
  margin: 100px auto 80px;
  padding: 0 clamp(20px, 5vw, 60px);
  text-align: center;
}

.learning-path h2 {
  font-size: 2.5rem;
  margin-bottom: 60px;
}

.path-diagram {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 30px;
  margin: 0 auto;
}

.path-step {
  background: var(--paper-bg);
  padding: 40px 30px;
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
  flex: 1;
  max-width: 320px;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  position: relative;
}

.path-step:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
  border-color: var(--wine-red-light);
}

.path-step.completed {
  border-color: var(--success-color);
  background: #f9fdfa;
}

.step-number {
  width: 60px;
  height: 60px;
  background: var(--wine-red);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--font-serif);
  margin: 0 auto 20px;
  box-shadow: var(--shadow-sm);
}

.step-icon {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.path-step h3 {
  font-size: 1.5rem;
  margin: 0 0 10px;
}

.step-duration {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 25px;
  font-weight: 500;
}

.step-features {
  text-align: left;
  margin: 0;
  padding-left: 20px;
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 2;
}

.path-arrow {
  font-size: 2rem;
  color: var(--wine-red-light);
  display: flex;
  align-items: center;
  opacity: 0.5;
}

.why-choose {
  max-width: 1400px;
  margin: 0 auto 100px;
  padding: 80px clamp(20px, 5vw, 60px);
  background: var(--paper-bg);
  border-radius: 30px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.why-choose h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 60px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
}

.feature-item {
  text-align: center;
  padding: 30px;
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.9;
}

.feature-item h3 {
  font-size: 1.3rem;
  margin: 0 0 15px;
  font-family: var(--font-sans);
}

.feature-item p {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
}

@media (max-width: 1200px) {
  .levels-container {
    grid-template-columns: 1fr;
    max-width: 600px;
  }
  
  .level-card {
    min-height: auto;
  }
}

@media (max-width: 900px) {
  .hero h1 {
    font-size: 2.8rem;
  }
  
  .hero-stats {
    flex-wrap: wrap;
    gap: 40px;
  }
  
  .path-diagram {
    flex-direction: column;
    align-items: center;
  }
  
  .path-arrow {
    transform: rotate(90deg);
    margin: 20px 0;
  }
}

.test-mode-banner {
  background: var(--warning-color);
  color: white;
  padding: 12px 30px;
  text-align: center;
  font-weight: 500;
  font-size: 0.95rem;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.test-mode-banner a {
  color: white;
  text-decoration: underline;
  margin-left: 20px;
}

.test-mode-banner a:hover {
  opacity: 0.8;
}
</style>
