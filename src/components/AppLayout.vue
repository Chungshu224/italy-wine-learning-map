<!-- src/components/AppLayout.vue -->
<template>
  <div class="app-layout">
    <div
      class="sidebar"
      :style="isMobile ? { transform: sidebarOpen ? 'translateY(0)' : 'translateY(-100%)' } : {}"
    >
      <slot name="sidebar"></slot>
    </div>
    <div class="main-content">
      <slot name="main"></slot>
    </div>
    
    <!-- 行動裝置選單按鈕 -->
    <button v-if="isMobile" class="mobile-menu-btn" @click="toggleSidebar">
      {{ sidebarOpen ? '關閉選單' : '開啟選單' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isMobile = ref(window.innerWidth <= 768);
const sidebarOpen = ref(!isMobile.value);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) {
    sidebarOpen.value = true;
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
  background: var(--cream-bg);
}

.sidebar {
  flex: 0 0 auto;
  width: 320px;
  max-width: 100%;
  height: 100%;
  overflow-y: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--paper-bg);
  border-right: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  z-index: 20;
}

.main-content {
  flex: 1;
  position: relative;
  height: 100%;
  overflow-y: auto;
}

.mobile-menu-btn {
  display: none;
  position: absolute;
  left: 15px;
  top: 15px;
  z-index: 1000;
  padding: 10px 16px;
  background: var(--wine-red);
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  background: var(--wine-red-dark);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }
  
  .sidebar {
    position: absolute;
    z-index: 100;
    height: auto;
    max-height: 70vh;
    width: 100%;
    box-shadow: var(--shadow-lg);
    border-bottom: 1px solid var(--border-color);
  }
  
  .mobile-menu-btn {
    display: block;
  }
}
</style>