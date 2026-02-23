// src/services/dataService.js
export default {
  // 取得產區資訊
  async getRegionInfo(aocId) {
    try {
      const response = await fetch('/veneto-regions.json');
      if (!response.ok) throw new Error('Failed to load region info');
      
      const regions = await response.json();
      return regions.find(r => r.id === aocId) || null;
    } catch (error) {
      console.error('Error loading region info:', error);
      return null;
    }
  }
};