import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { playRegionPronunciation, generatePronunciationButton } from './utils/audioPlayer.js'

// 將發音功能掛載到全局
window.playPronunciation = playRegionPronunciation
window.generatePronunciationButton = generatePronunciationButton

createApp(App).use(router).mount('#app')
