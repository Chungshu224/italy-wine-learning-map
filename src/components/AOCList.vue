<template>
  <div class="aoc-list">
    <h2>{{ regionName }} 產區清單</h2>
    
    <input
      type="text"
      class="aoc-search"
      placeholder="搜尋產區..."
      v-model="searchModel"
    />
    
    <div v-for="(regions, group) in aocGroups" :key="group">
      <div class="group-header" @click="toggleRegion(group)">
        <span class="group-icon">{{ expandedRegions[group] ? '▼' : '▶' }}</span>
        <span class="group-name">{{ group }}</span>
      </div>
      <div v-show="expandedRegions[group]" class="region-group">
        <div v-for="(aocs, region) in regions" :key="region">
          <!-- region header 移除，僅顯示於下方 aoc-item -->
          <div class="region-content">
            <div
              v-for="aoc in aocs"
              :key="aoc"
              class="aoc-item"
              :class="{ active: isActive(group, aoc) }"
              @click="$emit('selectAOC', group, aoc)"
              style="justify-content: flex-start;"
            >
              <span class="aoc-dot" :style="{ background: aocColor(group) }"></span>
              <span class="aoc-name">{{ region }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { computed } from 'vue'


const props = defineProps({
  regionName: {
    type: String,
    default: 'Veneto'
  },
  search: String,
  aocGroups: Object,
  expandedRegions: Object,
  toggleRegion: Function,
  activeAOC: Object,
  aocColor: Function
})

// TODO: Add region order for Veneto

const emit = defineEmits(['update:search', 'selectAOC'])

const searchModel = computed({
  get: () => props.search,
  set: (val) => emit('update:search', val)
})

const formatAOCName = (aoc) => {
  return aoc
    .replace('.geojson', '')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
}

const isActive = (group, aoc) => {
  return props.activeAOC?.group === group && props.activeAOC?.aoc === aoc
}
</script>

<style scoped>
.aoc-list {
  flex: 0 0 380px;
  height: 100%;
  overflow-y: auto;
  background: var(--paper-bg);
  border-right: 1px solid var(--border-color);
  padding: 30px 20px;
  box-sizing: border-box;
  box-shadow: var(--shadow-sm);
  z-index: 10;
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--wine-red-dark);
  letter-spacing: 1px;
  font-family: var(--font-serif);
  font-size: 1.5rem;
  border-bottom: 2px solid var(--wine-red-light);
  padding-bottom: 10px;
  display: inline-block;
}

.aoc-search {
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 25px;
  font-size: 0.95rem;
  background: var(--cream-bg);
  transition: all 0.3s ease;
  font-family: var(--font-sans);
}

.aoc-search:focus {
  outline: none;
  border-color: var(--wine-red);
  box-shadow: 0 0 0 3px rgba(114, 47, 55, 0.1);
  background: white;
}

.group-header {
  display: flex;
  align-items: center;
  padding: 12px 10px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-bottom: 5px;
  background: var(--cream-bg);
  border: 1px solid transparent;
}

.group-header:hover {
  background: white;
  border-color: var(--border-color);
  box-shadow: var(--shadow-sm);
}

.group-name {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-serif);
}

.group-icon {
  font-size: 0.7rem;
  margin-right: 10px;
  width: 12px;
  color: var(--wine-red-light);
  transition: transform 0.3s ease;
}

.region-group {
  margin-left: 15px;
  margin-bottom: 15px;
  border-left: 1px dashed var(--border-color);
  padding-left: 10px;
}

.region-content {
  margin-top: 5px;
}

.aoc-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.aoc-item:hover {
  background: var(--cream-bg);
  color: var(--wine-red);
  transform: translateX(3px);
}

.aoc-item.active {
  background: rgba(114, 47, 55, 0.08);
  color: var(--wine-red-dark);
  font-weight: 600;
  border-left: 3px solid var(--wine-red);
}

.aoc-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(255,255,255,0.5);
}

@media (max-width: 768px) {
  .aoc-list {
    width: 100%;
    height: auto;
    flex: 0 0 auto;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    padding: 20px 15px;
  }
}
</style>