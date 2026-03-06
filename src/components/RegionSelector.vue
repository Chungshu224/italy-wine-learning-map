<template>
  <div class="region-selector">
    <div class="header">
      <h1>義大利葡萄酒產區地圖</h1>
      <p class="subtitle">Italian Wine Regions</p>
      
      <!-- 課程入口按鈕 -->
      <div class="header-actions">
        <button class="course-button" @click="gotoCourse">
          🎓 開始系統化學習
        </button>
        <button class="appellation-button" @click="gotoAppellations">
          📋 DOC / DOCG / IGT 法定等級清單
        </button>
        <p class="course-hint">完整課程體系 · 互動地圖 · 專業認證</p>
      </div>
    </div>
    
    <div class="region-grid">
      <div 
        v-for="region in regions" 
        :key="region.id"
        class="region-card"
        @click="selectRegion(region.id)"
      >
        <div class="region-icon">{{ region.icon }}</div>
        <h3>{{ region.nameCN }}</h3>
        <div class="name-with-audio">
          <p class="region-name-en">{{ region.nameEN }}</p>
          <button 
            class="pronunciation-button-small" 
            @click.stop="playRegionAudio(region.nameEN)"
            :title="`播放 ${region.nameEN} 的發音`"
          >
            🔊
          </button>
        </div>
        <div class="region-stats">
          <span>{{ region.aocCount }} DOC/DOCG</span>
          <span>~{{ region.hectare }} ha</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const regions = ref([
  { id: 'veneto', nameCN: '威尼托', nameEN: 'Veneto', icon: '🍷', aocCount: 14, hectare: '80,000' },
  { id: 'piedmont', nameCN: '皮埃蒙特', nameEN: 'Piedmont', icon: '🍇', aocCount: 18, hectare: '45,000' },
  { id: 'valle d\'aosta', nameCN: '瓦萊達奧斯塔', nameEN: 'Valle d\'Aosta', icon: '⛰️', aocCount: 1, hectare: '500' },
  { id: 'tuscany', nameCN: '托斯卡納', nameEN: 'Tuscany', icon: '🌿', aocCount: 11, hectare: '63,000' },
  { id: 'lombardy', nameCN: '倫巴第', nameEN: 'Lombardy', icon: '🥂', aocCount: 5, hectare: '27,000' },
  { id: 'trentino', nameCN: '特倫蒂諾-上阿迪傑', nameEN: 'Trentino-Alto Adige', icon: '🏔️', aocCount: 8, hectare: '15,000' },
  { id: 'friuli', nameCN: '弗留利-威尼斯朱利亞', nameEN: 'Friuli Venezia Giulia', icon: '🍾', aocCount: 10, hectare: '23,000' },
  { id: 'emilia', nameCN: '艾米利亞-羅馬涅', nameEN: 'Emilia-Romagna', icon: '🫧', aocCount: 2, hectare: '58,000' },
  { id: 'marche', nameCN: '馬爾凱', nameEN: 'Marche', icon: '🍷', aocCount: 5, hectare: '17,000' },
  { id: 'umbria', nameCN: '翁布里亞', nameEN: 'Umbria', icon: '🌾', aocCount: 2, hectare: '13,000' },
  { id: 'lazio', nameCN: '拉齊奧', nameEN: 'Lazio', icon: '🏛️', aocCount: 3, hectare: '22,000' },
  { id: 'abruzzo', nameCN: '阿布魯佐', nameEN: 'Abruzzo', icon: '🍇', aocCount: 1, hectare: '33,000' },
  { id: 'campania', nameCN: '坎帕尼亞', nameEN: 'Campania', icon: '🌋', aocCount: 3, hectare: '25,000' },
  { id: 'puglia', nameCN: '普利亞', nameEN: 'Puglia', icon: '☀️', aocCount: 4, hectare: '88,000' },
  { id: 'basilicata', nameCN: '巴西利卡塔', nameEN: 'Basilicata', icon: '⛰️', aocCount: 1, hectare: '5,000' },
  { id: 'calabria', nameCN: '卡拉布里亞', nameEN: 'Calabria', icon: '🌊', aocCount: 9, hectare: '8,000' },
  { id: 'sicily', nameCN: '西西里', nameEN: 'Sicily', icon: '🏝️', aocCount: 23, hectare: '113,000' },
  { id: 'sardinia', nameCN: '撒丁島', nameEN: 'Sardinia', icon: '🏖️', aocCount: 15, hectare: '32,000' },
  { id: 'liguria', nameCN: '利古里亞', nameEN: 'Liguria', icon: '🌴', aocCount: 8, hectare: '4,000' },
  { id: 'molise', nameCN: '莫利塞', nameEN: 'Molise', icon: '🍂', aocCount: 4, hectare: '6,000' }
])

const selectRegion = (regionId) => {
  router.push(`/region/${regionId}`)
}

const gotoCourse = () => {
  router.push('/course')
}

const gotoAppellations = () => {
  router.push('/regions/appellations')
}

// 播放產區名稱的發音
const playRegionAudio = (regionName) => {
  // 產區英文名稱→義大利語音頻文件名映射表
  const regionNameMap = {
    'Piedmont': 'Piemonte',
    'Tuscany': 'Toscana',
    'Lombardy': 'Lombardia',
    'Trentino-Alto Adige': 'Trentino-Alto Adige',
    'Friuli Venezia Giulia': 'Friuli-Venezia Giulia',
    'Emilia-Romagna': 'Emilia-Romagna',
    'Marche': 'Marche',
    'Umbria': 'Umbria',
    'Lazio': 'Lazio',
    'Abruzzo': 'Abruzzo',
    'Campania': 'Campania',
    'Puglia': 'Puglia',
    'Basilicata': 'Basilicata',
    'Calabria': 'Calabria',
    'Sardinia': 'Sardegna',
    'Sicily': 'Sicily',
    'Liguria': 'Liguria',
    'Molise': 'Molise',
    'Veneto': 'Veneto',
    'Valle d\'Aosta': 'Valle d\'Aosta'
  }
  
  // 使用映射表轉換名稱，如果沒有映射則使用原名稱
  const audioName = regionNameMap[regionName] || regionName
  
  if (window.playPronunciation) {
    window.playPronunciation(audioName)
  } else {
    console.warn('音頻播放功能未載入')
  }
}
</script>

<style scoped>
.region-selector {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--wine-red-dark) 0%, var(--wine-red) 100%);
  padding: 60px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.region-selector::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 0%, rgba(247, 231, 206, 0.1) 0%, transparent 60%);
  pointer-events: none;
}

.header {
  text-align: center;
  color: var(--champagne);
  margin-bottom: 60px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.header h1 {
  font-size: 4rem;
  margin: 0;
  font-weight: 700;
  font-family: var(--font-serif);
  text-shadow: 0 4px 12px rgba(0,0,0,0.3);
  letter-spacing: 1px;
}

.subtitle {
  font-size: 1.6rem;
  font-style: italic;
  margin-top: 15px;
  opacity: 0.9;
  font-weight: 300;
  font-family: var(--font-serif);
  letter-spacing: 2px;
}

.header-actions {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.course-button {
  padding: 18px 50px;
  font-size: 1.2rem;
  font-weight: 600;
  background: var(--champagne);
  color: var(--wine-red-dark);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  box-shadow: 0 6px 20px rgba(247, 231, 206, 0.3);
  letter-spacing: 1px;
  font-family: var(--font-sans);
}

.course-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(247, 231, 206, 0.5);
  background: white;
}

.appellation-button {
  padding: 14px 40px;
  font-size: 1.1rem;
  font-weight: 600;
  background: rgba(255,255,255,0.15);
  color: var(--champagne);
  border: 2px solid rgba(247, 231, 206, 0.5);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  font-family: var(--font-sans);
}

.appellation-button:hover {
  background: rgba(255,255,255,0.25);
  border-color: var(--champagne);
  transform: translateY(-3px);
}

.course-hint {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0;
  font-style: italic;
  font-family: var(--font-serif);
}

.region-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  max-width: 1400px;
  width: 100%;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

.region-card {
  background: var(--paper-bg);
  border-radius: 20px;
  padding: 40px 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 260px;
  border: 1px solid rgba(255,255,255,0.1);
}

.region-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow-lg);
  border-color: var(--wine-red-light);
}

.region-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  line-height: 1;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
  transition: transform 0.3s ease;
}

.region-card:hover .region-icon {
  transform: scale(1.1);
}

.region-card h3 {
  font-size: 1.5rem;
  margin: 10px 0 5px;
  color: var(--wine-red-dark);
  font-weight: 700;
  font-family: var(--font-serif);
}

.name-with-audio {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
  min-height: 20px;
}

.region-name-en {
  font-style: italic;
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin: 0;
  font-family: var(--font-serif);
}

.pronunciation-button-small {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
  flex-shrink: 0;
}

.pronunciation-button-small:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
}

.pronunciation-button-small:active {
  transform: scale(0.95);
}

.region-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  width: 100%;
  font-weight: 500;
}

@media (max-width: 1200px) {
  .region-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 25px;
  }
}

@media (max-width: 900px) {
  .region-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .header h1 {
    font-size: 3rem;
  }
}

@media (max-width: 600px) {
  .header h1 {
    font-size: 2.2rem;
  }
  
  .subtitle {
    font-size: 1.2rem;
  }
  
  .region-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .region-card {
    min-height: 220px;
    padding: 30px 20px;
  }
}
</style>
