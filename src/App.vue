<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script setup>
// Router view 會自動根據當前路由顯示對應的組件
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: var(--font-sans);
  background-color: var(--cream-bg);
  color: var(--text-primary);
}

.app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
