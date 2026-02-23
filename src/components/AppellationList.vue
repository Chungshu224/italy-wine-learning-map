<template>
  <div class="appellation-page">
    <!-- ── 頁首 ── -->
    <header class="page-header">
      <div class="header-inner">
        <button class="btn-back" @click="$router.push('/regions')">← 返回產區地圖</button>
        <div class="header-titles">
          <h1>🍷 義大利法定產區等級清單</h1>
          <p class="subtitle">Italian Wine Appellations — DOCG · DOC · IGT</p>
        </div>
      </div>
    </header>

    <!-- ── 統計橫幅 ── -->
    <div class="stats-bar">
      <div class="stat-chip docg">
        <span class="stat-num">{{ counts.DOCG }}</span>
        <span class="stat-label">DOCG</span>
        <span class="stat-desc">保證法定產區</span>
      </div>
      <div class="stat-chip doc">
        <span class="stat-num">{{ counts.DOC }}</span>
        <span class="stat-label">DOC</span>
        <span class="stat-desc">法定產區</span>
      </div>
      <div class="stat-chip igt">
        <span class="stat-num">{{ counts.IGT }}</span>
        <span class="stat-label">IGT</span>
        <span class="stat-desc">地區餐酒</span>
      </div>
      <div class="stat-chip total">
        <span class="stat-num">{{ appellations.length }}</span>
        <span class="stat-label">總計</span>
        <span class="stat-desc">收錄酒款</span>
      </div>
    </div>

    <!-- ── 篩選工具列 ── -->
    <div class="toolbar">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input
          v-model="keyword"
          class="search-input"
          placeholder="搜尋產區名稱、葡萄品種、地區..."
          @input="resetPage"
        />
        <button v-if="keyword" class="clear-btn" @click="keyword = ''; resetPage()">✕</button>
      </div>

      <div class="filter-group">
        <button
          v-for="t in typeFilters"
          :key="t.value"
          :class="['filter-btn', `filter-btn--${t.value.toLowerCase()}`, { active: activeType === t.value }]"
          @click="toggleType(t.value)"
        >
          {{ t.label }}
        </button>
      </div>

      <div class="filter-group">
        <button
          v-for="s in styleFilters"
          :key="s.value"
          :class="['style-btn', { active: activeStyle === s.value }]"
          @click="toggleStyle(s.value)"
        >
          {{ s.label }}
        </button>
      </div>

      <select class="region-select" v-model="activeRegion" @change="resetPage">
        <option value="">全部產區</option>
        <option v-for="r in allRegions" :key="r" :value="r">{{ r }}</option>
      </select>
    </div>

    <!-- ── 結果計數 ── -->
    <div class="result-info">
      顯示 <strong>{{ paginated.length }}</strong> 筆（共 {{ filtered.length }} 筆符合）
    </div>

    <!-- ── 清單 ── -->
    <div class="card-grid" v-if="filtered.length > 0">
      <div
        v-for="item in paginated"
        :key="item.name + item.type"
        class="appellation-card"
        :class="`card--${item.type.toLowerCase()}`"
      >
        <!-- 頂部色條 -->
        <div :class="['card-ribbon', `ribbon--${item.type.toLowerCase()}`]">
          <span class="ribbon-type">{{ item.type }}</span>
          <span class="ribbon-region">{{ item.region }}</span>
        </div>

        <div class="card-body">
          <!-- 名稱 -->
          <h3 class="card-name">{{ item.name }}</h3>

          <!-- 葡萄酒風格徽章 -->
          <div class="style-badges">
            <span
              v-for="s in item.styles"
              :key="s"
              class="style-badge"
              :class="`style-badge--${styleClass(s)}`"
            >{{ s }}</span>
          </div>

          <!-- 簡介 -->
          <p class="card-description">{{ item.description }}</p>

          <!-- 葡萄品種 -->
          <div class="grape-wrap">
            <span class="grape-icon">🍇</span>
            <span class="grape-list">{{ item.grapes.join('、') }}</span>
          </div>

          <!-- 產省 -->
          <div class="province-wrap">
            <span class="province-icon">📍</span>
            <span>{{ item.province }}</span>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="card-footer">
          <router-link
            :to="`/region/${item.regionId}`"
            class="btn-goto-map"
          >
            🗺 開啟產區地圖
          </router-link>
        </div>
      </div>
    </div>

    <!-- 無結果 -->
    <div v-else class="empty-state">
      <div class="empty-icon">🍷</div>
      <h3>找不到符合條件的產區</h3>
      <p>請嘗試調整篩選條件或搜尋關鍵字</p>
      <button class="reset-all-btn" @click="resetAll">清除所有篩選</button>
    </div>

    <!-- ── 分頁 ── -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">◀</button>
      <button
        v-for="p in pageNumbers"
        :key="p"
        :class="['page-btn', { active: p === currentPage, ellipsis: p === '...' }]"
        :disabled="p === '...'"
        @click="typeof p === 'number' && (currentPage = p)"
      >{{ p }}</button>
      <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">▶</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const appellations = ref([])
const keyword = ref('')
const activeType = ref('')
const activeStyle = ref('')
const activeRegion = ref('')
const currentPage = ref(1)
const pageSize = 18

const typeFilters = [
  { label: '全部等級', value: '' },
  { label: 'DOCG', value: 'DOCG' },
  { label: 'DOC', value: 'DOC' },
  { label: 'IGT', value: 'IGT' }
]

const styleFilters = [
  { label: '全部', value: '' },
  { label: '🔴 紅酒', value: '紅酒' },
  { label: '⚪ 白酒', value: '白酒' },
  { label: '🟡 甜酒', value: '甜酒' },
  { label: '🫧 氣泡', value: '氣泡酒' },
  { label: '🌸 粉紅', value: '粉紅酒' }
]

const counts = computed(() => ({
  DOCG: appellations.value.filter(a => a.type === 'DOCG').length,
  DOC: appellations.value.filter(a => a.type === 'DOC').length,
  IGT: appellations.value.filter(a => a.type === 'IGT').length
}))

const allRegions = computed(() => {
  const set = new Set(appellations.value.map(a => a.region))
  return Array.from(set).sort()
})

const filtered = computed(() => {
  let list = appellations.value
  if (activeType.value) list = list.filter(a => a.type === activeType.value)
  if (activeStyle.value) list = list.filter(a => a.styles.includes(activeStyle.value))
  if (activeRegion.value) list = list.filter(a => a.region === activeRegion.value)
  if (keyword.value.trim()) {
    const kw = keyword.value.trim().toLowerCase()
    list = list.filter(a =>
      a.name.toLowerCase().includes(kw) ||
      a.region.toLowerCase().includes(kw) ||
      a.grapes.some(g => g.toLowerCase().includes(kw)) ||
      a.description.toLowerCase().includes(kw) ||
      (a.province || '').toLowerCase().includes(kw)
    )
  }
  return list
})

const totalPages = computed(() => Math.ceil(filtered.value.length / pageSize))

const paginated = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

const pageNumbers = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  const pages = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cur > 3) pages.push('...')
    for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
    if (cur < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

const toggleType = (t) => { activeType.value = t; resetPage() }
const toggleStyle = (s) => { activeStyle.value = s; resetPage() }
const resetPage = () => { currentPage.value = 1 }
const resetAll = () => { keyword.value = ''; activeType.value = ''; activeStyle.value = ''; activeRegion.value = ''; resetPage() }

const styleClass = (s) => {
  const map = { '紅酒': 'red', '白酒': 'white', '甜酒': 'sweet', '氣泡酒': 'sparkling', '粉紅酒': 'rose' }
  return map[s] || 'other'
}

onMounted(async () => {
  try {
    const res = await fetch('/italy-appellations.json')
    appellations.value = await res.json()
  } catch (e) {
    console.error('載入法定產區資料失敗', e)
  }
})
</script>

<style scoped>
/* ══ 整體頁面 ══ */
.appellation-page {
  min-height: 100vh;
  background: var(--cream-bg);
  padding-bottom: 60px;
}

/* ══ 頁首 ══ */
.page-header {
  background: linear-gradient(135deg, var(--wine-red-dark) 0%, var(--wine-red) 60%, #9b424e 100%);
  padding: 40px 24px 50px;
  color: white;
  position: relative;
  overflow: hidden;
}

.page-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: var(--cream-bg);
  border-radius: 30px 30px 0 0;
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.btn-back {
  padding: 10px 22px;
  background: rgba(255,255,255,0.15);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-back:hover { background: rgba(255,255,255,0.25); }

.header-titles { flex: 1; }
.header-titles h1 {
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  font-family: var(--font-serif);
  margin: 0 0 8px;
  color: var(--champagne);
}
.subtitle {
  font-size: 1.15rem;
  color: rgba(255,255,255,0.75);
  margin: 0;
  letter-spacing: 1px;
}

/* ══ 統計橫幅 ══ */
.stats-bar {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 1280px;
  margin: -20px auto 32px;
  padding: 0 24px;
  position: relative;
  z-index: 10;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 32px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  min-width: 140px;
  border-top: 5px solid #ccc;
  transition: transform 0.2s;
}
.stat-chip:hover { transform: translateY(-4px); }
.stat-chip.docg { border-top-color: #8B0000; }
.stat-chip.doc  { border-top-color: var(--wine-red); }
.stat-chip.igt  { border-top-color: #B8860B; }
.stat-chip.total { border-top-color: var(--grape-purple); }

.stat-num  { font-size: 2.8rem; font-weight: 700; color: var(--wine-red-dark); line-height: 1; }
.stat-label { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin: 4px 0 2px; }
.stat-desc  { font-size: 0.9rem; color: var(--text-secondary); }

/* ══ 工具列 ══ */
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  max-width: 1280px;
  margin: 0 auto 16px;
  padding: 0 24px;
}

.search-wrap {
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 8px 16px;
  gap: 10px;
  flex: 1;
  min-width: 240px;
  transition: border-color 0.2s;
}
.search-wrap:focus-within { border-color: var(--wine-red); }
.search-icon { font-size: 1.1rem; }
.search-input { border: none; outline: none; flex: 1; font-size: 1.1rem; background: transparent; color: var(--text-primary); }
.clear-btn { background: none; border: none; cursor: pointer; color: var(--text-secondary); font-size: 1rem; padding: 0; }
.clear-btn:hover { color: var(--wine-red); }

.filter-group { display: flex; gap: 8px; flex-wrap: wrap; }

.filter-btn {
  padding: 10px 20px;
  border-radius: 30px;
  border: 2px solid transparent;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  color: var(--text-secondary);
  border-color: var(--border-color);
}
.filter-btn:hover { border-color: var(--wine-red-light); color: var(--wine-red); }
.filter-btn--docg.active { background: #8B0000; color: white; border-color: #8B0000; }
.filter-btn--doc.active  { background: var(--wine-red); color: white; border-color: var(--wine-red); }
.filter-btn--igt.active  { background: #B8860B; color: white; border-color: #B8860B; }
.filter-btn--.active     { background: var(--grape-purple); color: white; border-color: var(--grape-purple); }

.style-btn {
  padding: 8px 16px;
  border-radius: 30px;
  border: 1px solid var(--border-color);
  background: white;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
}
.style-btn:hover { background: var(--cream-bg); color: var(--text-primary); }
.style-btn.active { background: var(--wine-red); color: white; border-color: var(--wine-red); }

.region-select {
  padding: 10px 16px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  color: var(--text-primary);
  cursor: pointer;
  transition: border-color 0.2s;
}
.region-select:focus { outline: none; border-color: var(--wine-red); }

/* ══ 結果資訊 ══ */
.result-info {
  max-width: 1280px;
  margin: 0 auto 20px;
  padding: 0 24px;
  font-size: 1rem;
  color: var(--text-secondary);
}
.result-info strong { color: var(--wine-red-dark); }

/* ══ 卡片網格 ══ */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.appellation-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.25s;
}
.appellation-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.12);
}

/* 頂部色條 */
.card-ribbon {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
}
.ribbon--docg { background: #8B0000; }
.ribbon--doc  { background: var(--wine-red); }
.ribbon--igt  { background: #B8860B; }

.ribbon-type  { background: rgba(255,255,255,0.2); padding: 3px 12px; border-radius: 20px; font-size: 0.9rem; }
.ribbon-region { font-size: 0.9rem; opacity: 0.85; }

/* 卡片主體 */
.card-body {
  padding: 20px 20px 12px;
  flex: 1;
}

.card-name {
  font-size: 1.3rem;
  font-family: var(--font-serif);
  color: var(--wine-red-dark);
  margin: 0 0 12px;
  line-height: 1.3;
}

/* 風格徽章 */
.style-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.style-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.88rem;
  font-weight: 600;
}
.style-badge--red      { background: #fde8ea; color: #8B0000; }
.style-badge--white    { background: #fdf8e8; color: #7a6000; }
.style-badge--sweet    { background: #fff8dc; color: #8B6914; }
.style-badge--sparkling { background: #e8f4fd; color: #1565c0; }
.style-badge--rose     { background: #fde8f0; color: #9c1452; }
.style-badge--other    { background: var(--cream-bg); color: var(--text-secondary); }

.card-description {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.65;
  margin-bottom: 14px;
}

.grape-wrap, .province-wrap {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
}
.grape-icon, .province-icon { flex-shrink: 0; margin-top: 1px; }
.grape-list { line-height: 1.5; }

/* 卡片底部 */
.card-footer {
  padding: 12px 20px 18px;
  border-top: 1px solid var(--border-color);
  margin-top: auto;
}

.btn-goto-map {
  display: block;
  width: 100%;
  padding: 12px;
  text-align: center;
  background: var(--wine-red);
  color: white;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s;
}
.btn-goto-map:hover {
  background: var(--wine-red-dark);
  transform: translateY(-2px);
}

/* ══ 空狀態 ══ */
.empty-state {
  text-align: center;
  padding: 80px 24px;
  color: var(--text-secondary);
}
.empty-icon { font-size: 4rem; margin-bottom: 16px; }
.empty-state h3 { font-size: 1.6rem; color: var(--text-primary); margin-bottom: 8px; }
.empty-state p  { font-size: 1.1rem; margin-bottom: 24px; }
.reset-all-btn {
  padding: 12px 32px;
  background: var(--wine-red);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.reset-all-btn:hover { background: var(--wine-red-dark); }

/* ══ 分頁 ══ */
.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 48px;
  padding: 0 24px;
  flex-wrap: wrap;
}
.page-btn {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-btn:hover:not(:disabled) { border-color: var(--wine-red); color: var(--wine-red); }
.page-btn.active { background: var(--wine-red); color: white; border-color: var(--wine-red); font-weight: 700; }
.page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.page-btn.ellipsis { border-color: transparent; background: none; cursor: default; }

/* ══ RWD ══ */
@media (max-width: 768px) {
  .page-header { padding: 32px 16px 48px; }
  .toolbar { flex-direction: column; align-items: stretch; }
  .search-wrap { min-width: auto; }
  .stats-bar { gap: 12px; }
  .stat-chip { min-width: 110px; padding: 16px 20px; }
  .stat-num { font-size: 2rem; }
  .card-grid { grid-template-columns: 1fr; padding: 0 16px; }
}
</style>
