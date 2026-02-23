<template>
  <section class="map-section">
    <div class="map-header">
      <h1>{{ regionName }} 葡萄酒產區地圖</h1>
    </div>
    
    <!-- 大區資訊顯示（無 AOC 選擇時） -->
    <div class="map-info-bar" v-if="!activeAOC?.aoc && regionOverview">
      <div class="info-header-bar">
        <span class="aoc-info-title">
          <span class="aoc-dot" style="background: var(--wine-red)"></span>
          {{ regionOverview.nameCN }} {{ regionOverview.name }}
        </span>
        <div class="map-buttons">
          <button class="btn-reset" @click="resetToRegion">重置大區</button>
        </div>
      </div>
      
      <div class="region-overview-content">
        <div class="overview-section">
          <div class="overview-item">
            <span class="overview-label">📍 位置:</span>
            <span>{{ regionOverview.location }}</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">🌡️ 氣候:</span>
            <span>{{ regionOverview.climate }}</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">🌾 面積:</span>
            <span>{{ regionOverview.area }}</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">🍷 產量:</span>
            <span>{{ regionOverview.production }}</span>
          </div>
        </div>
        
        <div class="appellations-stats">
          <div class="stat-item docg">
            <div class="stat-number">{{ regionOverview.appellations.docg }}</div>
            <div class="stat-label">DOCG</div>
          </div>
          <div class="stat-item doc">
            <div class="stat-number">{{ regionOverview.appellations.doc }}</div>
            <div class="stat-label">DOC</div>
          </div>
          <div class="stat-item igt">
            <div class="stat-number">{{ regionOverview.appellations.igt }}</div>
            <div class="stat-label">IGT</div>
          </div>
        </div>
        
        <div class="overview-description">
          <p><strong>🎯 特色:</strong> {{ regionOverview.characteristics }}</p>
        </div>
        
        <div class="highlights-section">
          <div class="highlights-title">⭐ 代表酒款:</div>
          <ul class="highlights-list">
            <li v-for="(highlight, index) in regionOverview.highlights" :key="index">
              {{ highlight }}
            </li>
          </ul>
        </div>
        
        <div class="grape-section">
          <div class="grape-title">🍇 主要葡萄品種:</div>
          
          <template v-if="categorizeGrapes(regionOverview.mainGrapes).red.length">
            <div class="grape-category-title">🍷 紅葡萄品種</div>
            <div class="grape-badges">
              <div v-for="grape in categorizeGrapes(regionOverview.mainGrapes).red"
                   :key="grape"
                   class="grape-badge"
                   :style="grapeBadgeStyle(grape)">
                {{ grape }}
              </div>
            </div>
          </template>
          
          <template v-if="categorizeGrapes(regionOverview.mainGrapes).white.length">
            <div class="grape-category-title">🥂 白葡萄品種</div>
            <div class="grape-badges">
              <div v-for="grape in categorizeGrapes(regionOverview.mainGrapes).white"
                   :key="grape"
                   class="grape-badge"
                   :style="grapeBadgeStyle(grape)">
                {{ grape }}
              </div>
            </div>
          </template>
          
          <template v-if="categorizeGrapes(regionOverview.mainGrapes).aromatic.length">
            <div class="grape-category-title">🌸 芳香品種</div>
            <div class="grape-badges">
              <div v-for="grape in categorizeGrapes(regionOverview.mainGrapes).aromatic"
                   :key="grape"
                   class="grape-badge"
                   :style="grapeBadgeStyle(grape)">
                {{ grape }}
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    
    <!-- AOC 產區資訊顯示 -->
    <div class="map-info-bar" v-if="activeAOC?.aoc">
      <div class="info-header-bar">
        <span class="aoc-info-title">
          <span class="aoc-dot" :style="{background: aocColor(activeAOC.group)}"></span>
          {{ activeAOC.aoc.replace('.geojson','').replace(/_/g,' ') }}
        </span>
        <div class="map-buttons">
          <button class="btn-reset" @click="resetMap">重置地圖</button>
        </div>
      </div>
      
      <div v-if="regionInfo" class="region-info-content">
        <div class="info-header">
          <div>
            <b>{{ regionInfo.name }}</b> 
            <span class="region-type">({{ regionInfo.type }})</span>
            <span v-if="regionInfo.hectare" class="region-hectare"> - {{ regionInfo.hectare }} 公頃</span>
          </div>
          <div class="style-badges">
            <div v-for="style in Array.isArray(regionInfo.style) ? regionInfo.style : [regionInfo.style]" 
                 :key="style" 
                 class="style-badge"
                 :style="{backgroundColor: styleColors[style] || '#999', color: ['白酒', '甜酒'].includes(style) ? '#333' : '#fff'}">
              {{ style }}
            </div>
          </div>
        </div>

        <div class="description">{{ regionInfo.description }}</div>

        <div v-if="regionInfo.details" class="details-section">
          <div v-if="regionInfo.details.introduction" class="detail-item">
            <div class="detail-title">產區介紹:</div>
            <p>{{ regionInfo.details.introduction }}</p>
          </div>
          <div v-if="regionInfo.details.climate" class="detail-item">
            <div class="detail-title">氣候:</div>
            <p>{{ regionInfo.details.climate }}</p>
          </div>
          <div v-if="regionInfo.details.subregions && Object.keys(regionInfo.details.subregions).length > 0" class="detail-item">
            <div class="detail-title">子產區:</div>
            <ul>
              <li v-for="(desc, subregion) in regionInfo.details.subregions" :key="subregion">
                <strong>{{ subregion }}:</strong> {{ desc }}
              </li>
            </ul>
          </div>
        </div>

        <div v-if="regionInfo.grapes" class="grape-section">
          <div class="grape-title">主要葡萄品種:</div>
          
          <template v-if="categorizeGrapes(regionInfo.grapes).red.length">
            <div class="grape-category-title">🍷 紅葡萄品種</div>
            <div class="grape-badges">
              <div v-for="grape in categorizeGrapes(regionInfo.grapes).red"
                   :key="grape"
                   class="grape-badge"
                   :style="grapeBadgeStyle(grape)">
                {{ grape }}
              </div>
            </div>
          </template>
          
          <template v-if="categorizeGrapes(regionInfo.grapes).white.length">
            <div class="grape-category-title">🥂 白葡萄品種</div>
            <div class="grape-badges">
              <div v-for="grape in categorizeGrapes(regionInfo.grapes).white"
                   :key="grape"
                   class="grape-badge"
                   :style="grapeBadgeStyle(grape)">
                {{ grape }}
              </div>
            </div>
          </template>
          
          <template v-if="categorizeGrapes(regionInfo.grapes).aromatic.length">
            <div class="grape-category-title">🌸 芳香品種</div>
            <div class="grape-badges">
              <div v-for="grape in categorizeGrapes(regionInfo.grapes).aromatic"
                   :key="grape"
                   class="grape-badge"
                   :style="grapeBadgeStyle(grape)">
                {{ grape }}
              </div>
            </div>
          </template>
          
          <template v-if="categorizeGrapes(regionInfo.grapes).other.length">
            <div class="grape-category-title">📋 其他</div>
            <div class="grape-badges">
              <div v-for="grape in categorizeGrapes(regionInfo.grapes).other"
                   :key="grape"
                   class="grape-badge"
                   :style="grapeBadgeStyle(grape)">
                {{ grape }}
              </div>
            </div>
          </template>
        </div>
      </div>
      <div v-else class="no-info">無詳細產區資料</div>
    </div>
    <div ref="mapContainer" class="map"></div>
    <button class="btn-3d" @click="toggle3D">
      {{ is3D ? '2D' : '3D' }}
    </button>
    <button class="btn-region-boundary" @click="toggleRegionBoundary">
      {{ showRegionBoundary ? '隱藏大區' : '顯示大區' }}
    </button>
    <div v-if="mapError" class="map-error">
      {{ mapError }}
    </div>
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import * as turf from '@turf/turf'
import { regionOverviews } from '../data/regionOverviews.js'

// 葡萄品種分類顏色
const grapeTypeColors = {
  red: '#8B0000',
  white: '#F0E68C',
  aromatic: '#87CEEB',
  other: '#bbb'
}

const redGrapes = [
  // 義大利本地紅葡萄
  'Sangiovese', 'Brunello', 'Morellino', 'Prugnolo Gentile',
  'Nebbiolo', 'Chiavennasca', 'Spanna', 'Picotener', 'Pugnet',
  'Barbera', 'Montepulciano', 'Primitivo', 'Negroamaro', 'Aglianico',
  'Corvina', 'Corvina Veronese', 'Rondinella', 'Molinara', 'Corvinone', 'Oseleta', 'Negrara',
  'Canaiolo', 'Canaiolo Nero', 'Colorino', 'Ciliegiolo', 'Malvasia Nera', 'Malvasia Nera di Brindisi', 'Malvasia Nera di Lecce',
  'Mammolo', 'Pugnitello', 'Dolcetto', 'Freisa', 'Grignolino', 'Croatina', 'Bonarda',
  'Gaglioppo', 'Magliocco', 'Magliocco Canino', 'Magliocco Dolce',
  'Nero d\'Avola', 'Frappato', 'Nerello Mascalese', 'Nerello Cappuccio', 'Nocera', 'Perricone', 'Pignatello',
  'Lagrein', 'Teroldego', 'Schiava', 'Schiava gentile', 'Vernatsch', 'Marzemino',
  'Refosco', 'Refosco dal Peduncolo Rosso', 'Raboso', 'Raboso Piave', 'Raboso Veronese',
  'Vespolina', 'Uva Rara', 'Bonarda di Gattinara',
  'Groppello', 'Groppello Gentile', 'Groppello di Santo Stefano', 'Groppello di Mocasina',
  'Cannonau', 'Monica', 'Carignano', 'Bovale', 'Girò',
  'Sagrantino', 'Cesanese', 'Cesanese Comune', 'Cesanese di Affile',
  'Lambrusco', 'Lambrusco di Sorbara', 'Lambrusco Grasparossa', 'Lambrusco Salamino', 'Lambrusco Maestri', 'Lambrusco Marani', 'Lambrusco Viadanese',
  'Brachetto', 'Ruché', 'Pelaverga', 'Pelaverga Piccolo', 'Quagliano',
  'Rossese', 'Ormeasco', 'Pollera Nera',
  'Piedirosso', 'Sciascinoso', 'Casavecchia', 'Pallagrello Nero',
  'Nero di Troia', 'Bombino Nero', 'Susumaniello', 'Ottavianello',
  'Tintilia', 'Montuni',
  'Schioppettino', 'Pignolo', 'Tazzelenghe', 'Terrano',
  'Ancellotta', 'Fortana', 'Enantio', 'Lambrusco a Foglia Frastagliata',
  'Tai Rosso', 'Friularo',
  'Aleatico', 'Alicante',
  'Vernaccia Nera', 'Verdicchio Nero', 'Vermentino Nero',
  'Corinto Nero', 'Neretta Cuneese', 'Nero Buono',
  // 國際紅葡萄
  'Cabernet Sauvignon', 'Cabernet Franc', 'Merlot', 'Syrah', 'Pinot Noir', 'Pinot Nero',
  'Carmenère', 'Petit Verdot', 'Gamay'
]

const whiteGrapes = [
  // 義大利本地白葡萄
  'Trebbiano', 'Trebbiano Toscano', 'Trebbiano Romagnolo', 'Trebbiano Abruzzese', 'Trebbiano Spoletino', 'Ugni Blanc',
  'Verdicchio', 'Vernaccia di San Gimignano', 'Vernaccia di Oristano',
  'Vermentino', 'Pigato',
  'Ansonica', 'Inzolia',
  'Garganega', 'Turbiana', 'Trebbiano di Soave', 'Trebbiano di Lugana',
  'Glera',
  'Cortese',
  'Arneis', 'Favorita', 'Nascetta',
  'Fiano', 'Greco', 'Greco Bianco', 'Greco di Tufo', 'Falanghina', 'Falaghina', 'Coda di Volpe',
  'Pecorino', 'Passerina', 'Maceratino',
  'Malvasia', 'Malvasia Bianca', 'Malvasia Bianca Lunga', 'Malvasia Bianca di Candia', 'Malvasia di Candia',
  'Malvasia Istriana', 'Malvasia del Lazio', 'Malvasia del Chianti', 'Malvasia di Sardegna',
  'Ribolla Gialla',
  'Friulano', 'Tai', 'Tocai Friulano', 'Trebbianello',
  'Grechetto', 'Grecanico',
  'Catarratto', 'Grillo', 'Carricante', 'Damaschino', 'Zibibbo',
  'Erbaluce', 'Timorasso',
  'Nuragus', 'Nasco', 'Semidano', 'Vermentino', 'Torbato',
  'Verduzzo', 'Verduzzo Friulano', 'Verduzzo Trevigiano',
  'Verdeca', 'Verdello', 'Verdea',
  'Albana', 'Pignoletto', 'Ortrugo', 'Pagadebit',
  'Durella', 'Vespaiola',
  'Bellone', 'Bombino Bianco',
  'Bianchetta Trevigiana', 'Bianchetta Genovese', 'Bianco d\'Alessano', 'Biancolella',
  'Albarola', 'Bosco', 'Vermentino',
  'Picolit', 'Vitovska',
  'Nosiola', 'Dindarella',
  'Canaiolo Bianco',
  'Forastera', 'Biancolella',
  'Cococciola', 'Montonico bianco', 'Mantonico Bianco',
  'Bianchello', 'Manzoni Bianco', 'Incrocio Manzoni 6.0.13',
  'Pepella', 'Rossetto',
  'Procanico', 'Bombino Bianco',
  // 國際白葡萄
  'Chardonnay', 'Sauvignon', 'Sauvignon Blanc',
  'Pinot Bianco', 'Pinot Blanc', 'Pinot Grigio',
  'Riesling', 'Riesling Italico',
  'Müller-Thurgau',
  'Erbamat',
  'Viognier', 'Roussanne', 'Semillon'
]

const aromaticGrapes = [
  'Moscato', 'Moscato Bianco', 'Moscato Giallo', 'Moscato di Scanzo', 'Fior d\'Arancio',
  'Gewürztraminer', 'Traminer',
  'Riesling',
  'Malvasia', 'Malvasia di Casorzo', 'Malvasia di Schierano',
  'Brachetto', 'Aleatico'
]

function grapeBadgeStyle(grape) {
  // 清理品種名稱（移除括號說明、百分比等）
  const cleanGrape = grape.split('(')[0].split('（')[0].split(/[≥]/)[0].trim()
  
  if (redGrapes.some(g => cleanGrape.includes(g) || g.includes(cleanGrape))) {
    return { backgroundColor: grapeTypeColors.red, color: '#fff', fontWeight: 'bold' }
  } else if (aromaticGrapes.some(g => cleanGrape.includes(g) || g.includes(cleanGrape))) {
    return { backgroundColor: grapeTypeColors.aromatic, color: '#333', fontWeight: 'bold' }
  } else if (whiteGrapes.some(g => cleanGrape.includes(g) || g.includes(cleanGrape))) {
    return { backgroundColor: grapeTypeColors.white, color: '#333', fontWeight: 'bold' }
  } else {
    return { backgroundColor: grapeTypeColors.other, color: '#333' }
  }
}

// 分類葡萄品種
function categorizeGrapes(grapes) {
  if (!grapes) return { red: [], white: [], aromatic: [], other: [] }
  
  const grapeList = Array.isArray(grapes) ? grapes : grapes.split(',').map(g => g.trim())
  const result = { red: [], white: [], aromatic: [], other: [] }
  
  grapeList.forEach(grape => {
    const cleanGrape = grape.split('(')[0].split('（')[0].split(/[≥]/)[0].trim()
    
    if (redGrapes.some(g => cleanGrape.includes(g) || g.includes(cleanGrape))) {
      result.red.push(grape)
    } else if (aromaticGrapes.some(g => cleanGrape.includes(g) || g.includes(cleanGrape))) {
      result.aromatic.push(grape)
    } else if (whiteGrapes.some(g => cleanGrape.includes(g) || g.includes(cleanGrape))) {
      result.white.push(grape)
    } else {
      result.other.push(grape)
    }
  })
  
  return result
}

const props = defineProps({
  activeAOC: Object,
  regionInfo: Object,
  styleColors: Object,
  regionId: {
    type: String,
    default: 'veneto'
  },
  geojsonFolder: {
    type: String,
    default: 'Veneto'
  },
  regionName: {
    type: String,
    default: 'Veneto'
  }
})

const emit = defineEmits(['resetMap'])

// 獲取當前大區的基礎資訊
const regionOverview = computed(() => regionOverviews[props.regionId] || null)

const isLoading = ref(false)
const mapError = ref(null)
const mapContainer = ref(null)
let map = null
const is3D = ref(false)
const showRegionBoundary = ref(true)
const geojsonCache = new Map()

function aocColor(groupName) {
  return '#006400' // DarkGreen for Veneto
}

const styleColors = {
  '紅酒': '#8B0000',
  '白酒': '#F0E68C',
  '甜酒': '#FFD700',
  '氣泡酒': '#87CEEB',
  '粉紅酒': '#FFB6C1'
}

const showAOCGeojson = async (groupName, aocFile) => {
  if (!map) return

  // 嘗試兩種 GeoJSON 路徑結構:
  // 1. 統一資料夾: /regions/{regionId}/geojson/{RegionName}/{file}.geojson
  // 2. 分類資料夾: /regions/{regionId}/geojson/{type}/{file}.geojson
  let geojsonPath = `/regions/${props.regionId}/geojson/${props.geojsonFolder}/${aocFile}`

  isLoading.value = true
  mapError.value = null

  try {
    let geojson
    if (geojsonCache.has(geojsonPath)) {
      geojson = geojsonCache.get(geojsonPath)
    } else {
      let res = await fetch(geojsonPath)
      
      // 如果第一種路徑失敗，嘗試使用 type 作為資料夾名稱
      if (!res.ok && groupName) {
        geojsonPath = `/regions/${props.regionId}/geojson/${groupName}/${aocFile}`
        res = await fetch(geojsonPath)
      }
      
      if (!res.ok) throw new Error(`無法載入 geojson (${res.status})`)
      geojson = await res.json()
      geojsonCache.set(geojsonPath, geojson)
    }

    if (map.getLayer('aoc-fill')) map.removeLayer('aoc-fill')
    if (map.getLayer('aoc-outline')) map.removeLayer('aoc-outline')
    if (map.getSource('aoc')) map.removeSource('aoc')

    map.addSource('aoc', { type: 'geojson', data: geojson })
    
    // 隨機顏色 + 透明度 0.2
    function getRandomColor() {
      const r = Math.floor(Math.random() * 200);
      const g = Math.floor(Math.random() * 200);
      const b = Math.floor(Math.random() * 200);
      return `rgba(${r},${g},${b},0.2)`;
    }
    map.addLayer({
      id: 'aoc-fill',
      type: 'fill',
      source: 'aoc',
      paint: {
        'fill-color': getRandomColor(),
        'fill-opacity': 1
      }
    })
    map.addLayer({
      id: 'aoc-outline',
      type: 'line',
      source: 'aoc',
      paint: {
        'line-color': '#fff',
        'line-width': 2
      }
    })

    const bbox = turf.bbox(geojson)
    map.fitBounds(bbox, { padding: 40, duration: 800 })

  } catch (err) {
    console.error('載入 geojson 失敗:', err)
    mapError.value = `載入 geojson 失敗: ${err.message}`
  } finally {
    isLoading.value = false
  }
}

const loadRegionBoundary = async () => {
  if (!map) return
  
  const boundaryPath = `/regions/${props.regionId}/geojson/${props.geojsonFolder}.geojson`
  
  try {
    let geojson
    if (geojsonCache.has(boundaryPath)) {
      geojson = geojsonCache.get(boundaryPath)
    } else {
      const res = await fetch(boundaryPath)
      if (!res.ok) throw new Error(`無法載入大區邊界 (${res.status})`)
      geojson = await res.json()
      geojsonCache.set(boundaryPath, geojson)
    }
    
    // 移除舊的邊界圖層
    if (map.getLayer('region-boundary-fill')) map.removeLayer('region-boundary-fill')
    if (map.getLayer('region-boundary-outline')) map.removeLayer('region-boundary-outline')
    if (map.getSource('region-boundary')) map.removeSource('region-boundary')
    
    // 添加新的邊界圖層
    map.addSource('region-boundary', { type: 'geojson', data: geojson })
    
    map.addLayer({
      id: 'region-boundary-fill',
      type: 'fill',
      source: 'region-boundary',
      paint: {
        'fill-color': '#722F37',
        'fill-opacity': 0.12
      }
    })
    
    map.addLayer({
      id: 'region-boundary-outline',
      type: 'line',
      source: 'region-boundary',
      paint: {
        'line-color': '#FFD700',
        'line-width': 4.5,
        'line-opacity': 1
      }
    })
    
    // 如果沒有選擇 AOC，則自動縮放至大區範圍
    if (!props.activeAOC?.aoc) {
      const bbox = turf.bbox(geojson)
      map.fitBounds(bbox, { padding: 80, duration: 1000 })
    }
    
  } catch (err) {
    console.error('載入大區邊界失敗:', err)
  }
}

const toggleRegionBoundary = () => {
  showRegionBoundary.value = !showRegionBoundary.value
  
  if (!map) return
  
  if (showRegionBoundary.value) {
    loadRegionBoundary()
  } else {
    if (map.getLayer('region-boundary-fill')) map.removeLayer('region-boundary-fill')
    if (map.getLayer('region-boundary-outline')) map.removeLayer('region-boundary-outline')
    if (map.getSource('region-boundary')) map.removeSource('region-boundary')
  }
}

const resetMap = () => {
  emit('resetMap')
}

const resetToRegion = async () => {
  // 重置至大區視圖
  emit('resetMap')
  // 重新載入大區邊界並縮放
  if (map && showRegionBoundary.value) {
    await loadRegionBoundary()
  }
}

const toggle3D = () => {
  is3D.value = !is3D.value
  if (map) {
    map.easeTo({ pitch: is3D.value ? 45 : 0, duration: 800 })
  }
}

const initMap = async (retry = 0) => {
  try {
    if (!mapContainer.value) {
      if (retry < 5) {
        setTimeout(() => initMap(retry + 1), 200)
      } else {
        mapError.value = '無法獲取地圖容器'
      }
      return
    }
    
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    
    map = new mapboxgl.Map({
      container: mapContainer.value,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [11.25, 43.77],
      zoom: 7.5,
      pitch: is3D.value ? 45 : 0,
      bearing: 0
    })
    
    map.on('load', async () => {
      map.addControl(new mapboxgl.NavigationControl(), 'top-right')
      map.addControl(new mapboxgl.FullscreenControl(), 'top-right')
      
      // 預設載入大區邊界
      await loadRegionBoundary()
    })
    
    map.on('error', (err) => {
      console.error('地圖錯誤:', err)
      mapError.value = `地圖錯誤: ${err.error?.message || '未知錯誤'}`
    })
    
    mapError.value = null
  } catch (err) {
    console.error('地圖初始化錯誤:', err)
    mapError.value = `初始化錯誤: ${err.message}`
  }
}

watch(() => props.activeAOC, (newAOC, oldAOC) => {
  if (newAOC && newAOC.aoc) {
    if (newAOC.aoc !== oldAOC?.aoc) {
      showAOCGeojson(newAOC.group, newAOC.aoc)
    }
  } else if (map && map.getLayer('aoc-fill')) {
    map.removeLayer('aoc-fill')
    map.removeLayer('aoc-outline')
    map.removeSource('aoc')
    map.flyTo({ center: [11.25, 43.77], zoom: 7.5 })
  }
}, { deep: true })

onMounted(async () => {
  await nextTick()
  setTimeout(async () => {
    await initMap()
  }, 100)
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.map-section {
  flex: 1;
  position: relative;
  height: 100%;
  /* overflow: hidden; 移除以恢復全域卷軸 */
  background: var(--cream-bg);
}

.map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.map-header {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background: rgba(253, 251, 247, 0.9);
  backdrop-filter: blur(10px);
  padding: 12px 30px;
  border-radius: 30px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  text-align: center;
}

.map-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #C0392B;
  font-family: var(--font-serif);
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(255,255,255,0.6);
}

.map-info-bar {
  position: absolute;
  bottom: 30px;
  left: 30px;
  width: 450px;
  max-height: 60vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  z-index: 10;
  display: flex;
  flex-direction: column;
  /* overflow: hidden; 移除以恢復全域卷軸 */
  border: 1px solid var(--border-color);
}

.info-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: var(--cream-bg);
  border-bottom: 1px solid var(--border-color);
}

.aoc-info-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--wine-red-dark);
  display: flex;
  align-items: center;
  font-family: var(--font-serif);
}

.aoc-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 10px;
  box-shadow: 0 0 0 2px rgba(255,255,255,0.8);
}

.map-buttons {
  display: flex;
  gap: 10px;
}

.btn-reset {
  padding: 6px 12px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.btn-reset:hover {
  background: var(--paper-bg);
  color: var(--wine-red);
  border-color: var(--wine-red-light);
}

.region-info-content {
  padding: 20px;
  overflow-y: auto;
}

.info-header {
  margin-bottom: 15px;
}

.info-header b {
  font-size: 1.2rem;
  color: var(--text-primary);
  font-family: var(--font-serif);
}

.region-type, .region-hectare {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-left: 5px;
}

.style-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.style-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
  text-align: center;
  box-shadow: var(--shadow-sm);
  letter-spacing: 0.5px;
}

.description {
  margin-top: 15px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-primary);
}

.details-section {
  margin-top: 20px;
  border-top: 1px dashed var(--border-color);
  padding-top: 20px;
}

.detail-item {
  margin-bottom: 15px;
}

.detail-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--wine-red-dark);
  margin-bottom: 8px;
  font-family: var(--font-serif);
}

.detail-item p, .detail-item ul {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--text-secondary);
}

.detail-item ul {
  padding-left: 20px;
}

.detail-item li {
  margin-bottom: 6px;
}

.detail-item li strong {
  color: var(--text-primary);
}

.grape-section {
  margin: 20px 0 10px;
  border-top: 1px dashed var(--border-color);
  padding-top: 20px;
}

.grape-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--wine-red-dark);
  margin-bottom: 12px;
  font-family: var(--font-serif);
}

.grape-category-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  margin: 15px 0 8px 0;
  padding-left: 8px;
  border-left: 3px solid var(--wine-red-light);
  display: flex;
  align-items: center;
  gap: 6px;
}

.grape-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 5px;
}

.grape-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  white-space: nowrap;
  font-weight: 500;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  background: white;
}

.no-info {
  margin-top: 15px;
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

/* 大區資訊樣式 */
.region-overview-content {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 180px);
}

.overview-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.overview-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.overview-label {
  font-weight: 600;
  color: var(--wine-red-dark);
  min-width: 80px;
  flex-shrink: 0;
}

.appellations-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background: linear-gradient(135deg, #FDF9F3 0%, #F5EBE0 100%);
  border-radius: 15px;
  margin: 20px 0;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
}

.stat-item {
  text-align: center;
  padding: 10px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  font-family: var(--font-serif);
  margin-bottom: 5px;
}

.stat-item.docg .stat-number {
  color: #8B0000;
}

.stat-item.doc .stat-number {
  color: #D4A574;
}

.stat-item.igt .stat-number {
  color: #556B2F;
}

.stat-label {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--text-secondary);
}

.overview-description {
  margin: 20px 0;
  padding: 15px;
  background: #FFF9F0;
  border-left: 4px solid var(--wine-red);
  border-radius: 5px;
  font-size: 0.95rem;
  line-height: 1.6;
}

.overview-description strong {
  color: var(--wine-red-dark);
}

.highlights-section {
  margin: 20px 0;
}

.highlights-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--wine-red-dark);
  margin-bottom: 10px;
  font-family: var(--font-serif);
}

.highlights-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.highlights-list li {
  padding: 8px 0 8px 25px;
  position: relative;
  font-size: 0.9rem;
  line-height: 1.5;
}

.highlights-list li::before {
  content: '🍷';
  position: absolute;
  left: 0;
  font-size: 0.9rem;
}

.btn-3d {
  position: absolute;
  top: 140px;
  right: 10px;
  padding: 10px 20px;
  background: white;
  color: var(--wine-red-dark);
  border: 1px solid var(--border-color);
  border-radius: 30px;
  cursor: pointer;
  z-index: 10;
  font-weight: 600;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.btn-3d:hover {
  background: var(--cream-bg);
  border-color: var(--wine-red-light);
  transform: translateY(-2px);
}

.btn-region-boundary {
  position: absolute;
  top: 190px;
  right: 10px;
  padding: 10px 20px;
  background: white;
  color: var(--wine-red-dark);
  border: 1px solid var(--border-color);
  border-radius: 30px;
  cursor: pointer;
  z-index: 10;
  font-weight: 600;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-region-boundary:hover {
  background: var(--cream-bg);
  border-color: var(--wine-red-light);
  transform: translateY(-2px);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(253, 251, 247, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(114, 47, 55, 0.1);
  border-top: 4px solid var(--wine-red);
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.map-error {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #fee2e2;
  color: #991b1b;
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid #f87171;
  z-index: 30;
  max-width: 80%;
  text-align: center;
  box-shadow: var(--shadow-md);
  font-weight: 500;
}

@media (max-width: 768px) {
  .map-info-bar {
    max-width: calc(100% - 30px);
    width: auto;
    bottom: 15px;
    left: 15px;
    max-height: 40vh;
  }
  
  .map-header {
    top: 15px;
    padding: 10px 20px;
  }
  
  .map-header h1 {
    font-size: 1.2rem;
  }
  
  .btn-3d {
    top: 130px;
    right: 10px;
    padding: 8px 16px;
  }
  
  .btn-region-boundary {
    top: 180px;
    right: 10px;
    padding: 8px 16px;
    font-size: 0.85rem;
  }
}
</style>