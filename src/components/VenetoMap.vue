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
      :regionName="'Veneto'"
      :regionId="'veneto'"
      @selectAOC="showAOCGeojson"
    />
    
    <MapSection
      :activeAOC="activeAOC"
      :regionInfo="regionInfo"
      :styleColors="styleColors"
      @resetMap="resetMap"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AOCList from './AOCList.vue'
import MapSection from './MapSection.vue'

const router = useRouter()

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
  return '#006400' // DarkGreen for Veneto
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

    for (const region of regionsData.value) {
        if (!groups[region.type]) {
            groups[region.type] = {};
        }
        if (!groups[region.type][region.name]) {
            groups[region.type][region.name] = [];
        }
        groups[region.type][region.name].push(`${region.id}.geojson`);
    }
    return groups;
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
    const res = await fetch('/regions/veneto/veneto-regions.json')
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


onMounted(async () => {
  await loadRegionsData()
  // 預設展開 IGP 分組
  expandedRegions.value['IGP'] = true
  // 自動選取 Veneto IGP.geojson
  const defaultAOC = 'Veneto IGP.geojson'
  activeAOC.value = { group: 'IGP', aoc: defaultAOC }
  let foundRegion = regionsData.value.find(r => r.id + '.geojson' === defaultAOC)
  regionInfo.value = foundRegion
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
  left: 20px;
  z-index: 1000;
  background: linear-gradient(135deg, var(--wine-red) 0%, var(--wine-red-dark) 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  font-family: var(--font-sans);
  letter-spacing: 0.5px;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  background: linear-gradient(135deg, var(--wine-red-light) 0%, var(--wine-red) 100%);
}

.back-button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
  
  .back-button {
    top: 10px;
    left: 10px;
    padding: 10px 18px;
    font-size: 14px;
  }
  
  :deep(.aoc-list) {
    height: 30%;
    width: 100%;
    overflow-y: auto;
    flex-shrink: 0;
  }
}
</style>