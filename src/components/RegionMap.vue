<template>
  <div class="main-layout">
    <button class="back-button" @click="goBack">
      ← 返回課程學習
    </button>
    
    <AOCList
      v-model:search="search"
      :aocGroups="filteredAocGroups"
      :expandedRegions="expandedRegions"
      :toggleRegion="toggleRegion"
      :activeAOC="activeAOC"
      :aocColor="aocColor"
      :regionName="regionConfig.name"
      @selectAOC="showAOCGeojson"
    />
    
    <MapSection
      :activeAOC="activeAOC"
      :regionInfo="regionInfo"
      :styleColors="styleColors"
      :regionId="regionId"
      :geojsonFolder="regionConfig.geojsonFolder"
      :regionName="regionConfig.name"
      @resetMap="resetMap"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AOCList from './AOCList.vue'
import MapSection from './MapSection.vue'

const router = useRouter()
const route = useRoute()

// 從路由獲取產區 ID
const regionId = computed(() => route.params.regionId || 'veneto')

// 產區配置資訊
const regionConfigs = {
  veneto: { name: 'Veneto', color: '#006400', geojsonFolder: 'Veneto', defaultAOC: 'Veneto IGP', defaultGroup: 'IGP' },
  piedmont: { name: 'Piemonte', color: '#8B0000', geojsonFolder: 'Piemonte', defaultAOC: 'Piemonte DOC', defaultGroup: 'DOC' },
  tuscany: { name: 'Toscana', color: '#A0522D', geojsonFolder: 'Toscana', defaultAOC: 'Toscana IGT', defaultGroup: 'IGT' },
  lombardy: { name: 'Lombardy', color: '#4B0082', geojsonFolder: 'Lombardy', defaultAOC: 'Lombardia IGT', defaultGroup: 'IGT' },
  trentino: { name: 'Trentino', color: '#228B22', geojsonFolder: 'Trentino', defaultAOC: 'Trentino DOC', defaultGroup: 'DOC' },
  friuli: { name: 'Friuli', color: '#FF8C00', geojsonFolder: 'Friuli-Venezia Giulia', defaultAOC: 'Friuli Grave DOC', defaultGroup: 'DOC' },
  emilia: { name: 'EmiliaRomagna', color: '#DC143C', geojsonFolder: 'Emilia-Romagna', defaultAOC: 'Emilia IGT', defaultGroup: 'IGT' },
  marche: { name: 'Marche', color: '#2E8B57', geojsonFolder: 'Marche', defaultAOC: 'Marche IGT', defaultGroup: 'IGT' },
  umbria: { name: 'Umbria', color: '#556B2F', geojsonFolder: 'Umbria', defaultAOC: 'Umbria IGT', defaultGroup: 'IGT' },
  lazio: { name: 'Lazio', color: '#8B4513', geojsonFolder: 'Lazio', defaultAOC: 'Lazio IGT', defaultGroup: 'IGT' },
  abruzzo: { name: 'Abruzzo', color: '#B8860B', geojsonFolder: 'Abruzzo', defaultAOC: 'Abruzzo DOC', defaultGroup: 'DOC' },
  campania: { name: 'Campania', color: '#CD5C5C', geojsonFolder: 'Campania', defaultAOC: 'Campania IGT', defaultGroup: 'IGT' },
  puglia: { name: 'Puglia', color: '#DAA520', geojsonFolder: 'Puglia', defaultAOC: 'Puglia IGT', defaultGroup: 'IGT' },
  basilicata: { name: 'Basilicata', color: '#6B8E23', geojsonFolder: 'Basilicata', defaultAOC: 'Basilicata IGT', defaultGroup: 'IGT' },
  calabria: { name: 'Calabria', color: '#BC8F8F', geojsonFolder: 'Calabria', defaultAOC: 'Calabria IGT', defaultGroup: 'IGT' },
  sicily: { name: 'Sicily', color: '#FF6347', geojsonFolder: 'Sicily', defaultAOC: 'Sicilia DOC', defaultGroup: 'DOC' },
  sardinia: { name: 'Sardinia', color: '#4682B4', geojsonFolder: 'Sardegna', defaultAOC: 'Sardegna DOC', defaultGroup: 'DOC' },
  liguria: { name: 'Liguria', color: '#20B2AA', geojsonFolder: 'Liguria', defaultAOC: 'Liguria IGT', defaultGroup: 'IGT' },
  molise: { name: 'Molise', color: '#8FBC8F', geojsonFolder: 'Molise', defaultAOC: 'Molise DOC', defaultGroup: 'DOC' }
}

const regionConfig = computed(() => regionConfigs[regionId.value] || regionConfigs.veneto)

// State
const search = ref('')
const activeAOC = ref({ group: '', aoc: '' })
const regionInfo = ref(null)
const regionsData = ref([])

// Expansion states
const expandedRegions = ref({})

const toggleRegion = (regionName) => {
  expandedRegions.value[regionName] = !expandedRegions.value[regionName]
}

// Navigation
const goBack = () => {
  router.push('/')
}

// Color mapping
function aocColor(groupName) {
  return regionConfig.value.color
}

const styleColors = {
  '紅酒': '#8B0000',
  '白酒': '#F0E68C',
  '甜酒': '#FFD700',
  '氣泡酒': '#87CEEB',
  '粉紅酒': '#FFB6C1'
}

// Data loading and processing
const aocGroups = computed(() => {
    const groups = {};
    if (!regionsData.value.length) {
        return groups;
    }

    // 過濾掉 type="Region" 的條目
    const validRegions = regionsData.value.filter(r => r.type !== 'Region');

    for (const region of validRegions) {
        if (!groups[region.type]) {
            groups[region.type] = {};
        }
        if (!groups[region.type][region.name]) {
            groups[region.type][region.name] = [];
        }
        groups[region.type][region.name].push(`${region.id}.geojson`);
    }

    // 確保按照 DOCG -> DOC -> IGT 順序排列
    const sortedGroups = {};
    const order = ['DOCG', 'DOC', 'IGT'];
    
    order.forEach(type => {
        if (groups[type]) {
            sortedGroups[type] = groups[type];
        }
    });
    
    // 添加其他未列出的類型
    Object.keys(groups).forEach(type => {
        if (!order.includes(type)) {
            sortedGroups[type] = groups[type];
        }
    });
    
    return sortedGroups;
});

const filteredAocGroups = computed(() => {
  if (!search.value) return aocGroups.value;
  const lowerCaseSearch = search.value.toLowerCase();
  const result = {};

  for (const group in aocGroups.value) {
    for (const region in aocGroups.value[group]) {
      const aocs = aocGroups.value[group][region];
      const filteredAocs = aocs.filter(aoc => aoc.toLowerCase().replace('.geojson','').includes(lowerCaseSearch));

      if (filteredAocs.length > 0) {
        if (!result[group]) result[group] = {};
        result[group][region] = filteredAocs;
      }
    }
  }
  return result;
});

// Map interaction
const showAOCGeojson = async (groupName, aocFile) => {
  activeAOC.value = { group: groupName, aoc: aocFile }
  const aocId = aocFile.replace('.geojson', '');
  
  let foundRegion = regionsData.value.find(r => r.id === aocId);
  regionInfo.value = foundRegion;
}

const resetMap = () => {
  activeAOC.value = { group: '', aoc: '' }
  regionInfo.value = null;
}

// Lifecycle
const loadRegionsData = async () => {
  try {
    const jsonPath = `/regions/${regionId.value}/${regionId.value}-regions.json`
    const res = await fetch(jsonPath)
    if (res.ok) {
      regionsData.value = await res.json()
      // Initialize expandedRegions for all regions
      regionsData.value.forEach(r => { expandedRegions.value[r.name] = false; });
    } else {
      throw new Error(`HTTP ${res.status}`)
    }
  } catch (err) {
    console.error('載入產區資料失敗:', err)
    regionsData.value = []
  }
}

const initializeDefaultSelection = () => {
  if (regionsData.value.length === 0) return
  
  const config = regionConfig.value
  // 預設展開第一個分組
  expandedRegions.value[config.defaultGroup] = true
  
  // 嘗試選擇預設 AOC
  const defaultAOCFile = `${config.defaultAOC}.geojson`
  let foundRegion = regionsData.value.find(r => r.id + '.geojson' === defaultAOCFile)
  
  // 如果找不到預設，就選第一個
  if (!foundRegion && regionsData.value.length > 0) {
    foundRegion = regionsData.value[0]
    activeAOC.value = { group: foundRegion.type, aoc: `${foundRegion.id}.geojson` }
  } else if (foundRegion) {
    activeAOC.value = { group: config.defaultGroup, aoc: defaultAOCFile }
  }
  
  regionInfo.value = foundRegion
}

// 監聽路由變化，重新載入資料
watch(regionId, async () => {
  await loadRegionsData()
  // 移除自動選擇，讓初始顯示大區資訊
  activeAOC.value = { group: '', aoc: '' }
  regionInfo.value = null
}, { immediate: false })

onMounted(async () => {
  await loadRegionsData()
  // 移除自動選擇，讓初始顯示大區資訊
  // 所有分組預設收合
  activeAOC.value = { group: '', aoc: '' }
  regionInfo.value = null
})

</script>

<style scoped>
.main-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--cream-bg);
}

.back-button {
  position: fixed;
  top: 20px;
  left: 400px;
  z-index: 1000;
  background: var(--wine-red);
  color: white;
  border: 1px solid var(--wine-red-dark);
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.5px;
}

.back-button:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  background: var(--wine-red-dark);
}

.back-button:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
  
  .back-button {
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    font-size: 0.9rem;
  }
  
  :deep(.aoc-list) {
    height: 35%;
    width: 100%;
    overflow-y: auto;
    flex-shrink: 0;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
}
</style>
