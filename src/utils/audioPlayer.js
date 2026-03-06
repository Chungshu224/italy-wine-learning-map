// 音訊播放工具
let currentAudio = null

/**
 * 從產區名稱中移除法定等級後綴
 * @param {string} regionName - 產區名稱 (例如: "Barolo DOCG", "Chianti DOC")
 * @returns {string} - 去除後綴的名稱 (例如: "Barolo", "Chianti")
 */
export function removeWineGrade(regionName) {
  if (!regionName) return ''
  
  // 移除常見的法定等級後綴
  return regionName
    .replace(/\s+(DOCG|DOC|IGT|IGP)$/i, '')
    .trim()
}

/**
 * 播放產區名稱發音
 * @param {string} regionName - 產區名稱
 * @param {Function} onError - 錯誤回調函數 (可選)
 * @param {string} regionFolder - 地區文件夾名稱 (可選，例如: "tuscany", "piedmont")
 */
export function playRegionPronunciation(regionName, onError = null, regionFolder = null) {
  try {
    // 停止當前正在播放的音訊
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }
    
    // 去除等級後綴
    const cleanName = removeWineGrade(regionName)
    
    // 定義所有可能的地區文件夾（用於回退搜索）
    const regionFolders = [
      'abruzzo', 'basilicata', 'calabria', 'campania', 'emilia', 'friuli',
      'lazio', 'liguria', 'lombardy', 'marche', 'molise', 'piedmont',
      'puglia', 'sardinia', 'sicily', 'trentino', 'tuscany', 'umbria',
      'valle d\'aosta', 'veneto'
    ]
    
    // 建立音訊路徑列表（按優先級排序）
    const audioPaths = []
    
    // 1. 優先級最高：直接從 /sounds/ 查找（大區音頻和未分類文件）
    audioPaths.push(`/sounds/${cleanName}.mp3`)
    
    // 2. 如果提供了特定地區，優先搜索該地區
    if (regionFolder) {
      audioPaths.unshift(`/regions/${regionFolder}/sounds/${cleanName}.mp3`)
    }
    
    // 3. 作為最後的回退：搜索所有地區（僅在沒有指定地區時）
    // 注意：這會產生多個 HTTP 請求，但只有在需要時才會執行
    if (!regionFolder) {
      // 不在這裡添加所有地區路徑，因為會產生太多請求
      // 如果需要，可以根據名稱推測地區
    }
    
    // 遞歸嘗試加載音訊文件
    let currentPathIndex = 0
    
    const tryLoadAudio = () => {
      if (currentPathIndex >= audioPaths.length) {
        // 所有路徑都失敗了
        const errorMsg = `無法找到音訊文件: ${cleanName}`
        console.warn(errorMsg)
        if (onError) {
          onError(new Error(errorMsg))
        }
        return
      }
      
      const audioPath = audioPaths[currentPathIndex]
      const audio = new Audio(audioPath)
      
      // 設置音量
      audio.volume = 0.8
      
      // 嘗試播放
      audio.play()
        .then(() => {
          // 成功播放
          currentAudio = audio
          
          // 播放結束後清理
          audio.addEventListener('ended', () => {
            currentAudio = null
          })
        })
        .catch(error => {
          // 當前路徑失敗，嘗試下一個
          console.debug(`嘗試路徑失敗 (${currentPathIndex + 1}/${audioPaths.length}): ${audioPath}`)
          currentPathIndex++
          tryLoadAudio()
        })
    }
    
    // 開始嘗試加載
    tryLoadAudio()
    
  } catch (error) {
    console.error('播放發音時發生錯誤:', error)
    if (onError) {
      onError(error)
    }
  }
}

/**
 * 停止當前播放的音訊
 */
export function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
}

/**
 * 生成發音按鈕的 HTML
 * @param {string} regionName - 產區名稱
 * @param {string} buttonId - 按鈕ID (可選，用於唯一標識)
 * @returns {string} - HTML字符串
 */
export function generatePronunciationButton(regionName, buttonId = '') {
  const cleanName = removeWineGrade(regionName)
  const idAttr = buttonId ? `id="${buttonId}"` : ''
  
  return `
    <button 
      ${idAttr}
      class="pronunciation-btn"
      onclick="window.playPronunciation('${regionName}')"
      title="點擊聽發音"
      style="
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        transition: all 0.3s ease;
        margin-bottom: 10px;
      "
      onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'"
      onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(102, 126, 234, 0.3)'"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      </svg>
      <span>聽發音</span>
    </button>
  `
}

// 將播放函數掛載到全局 window 對象，供 onclick 使用
if (typeof window !== 'undefined') {
  window.playPronunciation = playRegionPronunciation
}
