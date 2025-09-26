import { ref, computed } from 'vue';
import shandongPlots from '@/mock/shandong-plots.json';

const STORAGE_KEY = 'agri_plots_all_v2'; // 更新版本，清除旧缓存

export function usePlots() {
  const allPlots = ref([]);
  const selectedPlot = ref(null);
  const loading = ref(false);

  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allPlots.value));
    } catch {}
  };

  const seedFromMock = () => {
    // 直接使用mock数据，计算健康评分
    const plotsWithDetails = shandongPlots.features.map(feature => {
      const id = `地块${feature.properties.id}`;
      // 根据土壤评分计算健康评分
      const healthScore = Math.min(95, Math.max(70, feature.properties.soilScore + Math.floor(Math.random() * 10) - 5));
      // 计算面积（从areaMu转换为亩）
      const area = (feature.properties.areaMu / 100).toFixed(1);
      
      return {
        ...feature,
        id: id,
        properties: {
          ...feature.properties,
          // 标准化属性名
          crop: feature.properties.crop,
          owner: feature.properties.owner,
          area: parseFloat(area),
          soilType: getSoilTypeFromScore(feature.properties.soilScore),
          healthScore: healthScore,
          // 保留原始数据
          soilScore: feature.properties.soilScore,
          soilMoisture: feature.properties.soilMoisture,
          organicMatter: feature.properties.organicMatter,
          pestSeverity: feature.properties.pestSeverity,
          ndvi: feature.properties.ndvi
        }
      }
    });
    return plotsWithDetails;
  };

  // 根据土壤评分推断土壤类型
  const getSoilTypeFromScore = (score) => {
    if (score >= 90) return '水稻土';
    if (score >= 85) return '壤土';
    if (score >= 80) return '沙壤土';
    if (score >= 75) return '黏土';
    return '沙土';
  };

  const fetchPlots = async () => {
    loading.value = true;
    await new Promise(res => setTimeout(res, 200)); // Simulate network delay
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        allPlots.value = JSON.parse(cached);
      } else {
        allPlots.value = seedFromMock();
        saveToStorage();
      }
    } catch {
      allPlots.value = seedFromMock();
    }
    loading.value = false;
  };

  const selectPlot = (plotId) => {
    const plot = allPlots.value.find(p => p.id === plotId);
    selectedPlot.value = plot || null;
  };

  const createPlot = (payload) => {
    // payload: { id,name,owner,area,crop,soilType, geometry }
    const newId = payload.name || (payload.id ? `地块${payload.id}` : undefined);
    if (!newId) {
      throw new Error('缺少地块标识');
    }
    if (allPlots.value.some(p => p.id === newId)) {
      throw new Error('地块编号/名称已存在');
    }
    const feature = {
      type: 'Feature',
      id: newId,
      geometry: payload.geometry,
      properties: {
        id: newId,
        owner: payload.owner || '',
        area: Number(payload.area) || 0,
        crop: payload.crop || '',
        soilType: payload.soilType || '',
        healthScore: 80,
        center: payload.center || undefined,
      }
    };
    allPlots.value = [...allPlots.value, feature];
    saveToStorage();
    return feature;
  };

  const updatePlot = (plotId, payload) => {
    const idx = allPlots.value.findIndex(p => p.id === plotId);
    if (idx === -1) throw new Error('地块不存在');
    const prev = allPlots.value[idx];
    const updated = {
      ...prev,
      geometry: payload.geometry || prev.geometry,
      properties: {
        ...prev.properties,
        owner: payload.owner ?? prev.properties.owner,
        area: payload.area != null ? Number(payload.area) : prev.properties.area,
        crop: payload.crop ?? prev.properties.crop,
        soilType: payload.soilType ?? prev.properties.soilType,
      }
    };
    const next = [...allPlots.value];
    next.splice(idx, 1, updated);
    allPlots.value = next;
    saveToStorage();
    return updated;
  };

  const deletePlot = (plotId) => {
    const idx = allPlots.value.findIndex(p => p.id === plotId);
    if (idx === -1) return false;
    const next = [...allPlots.value];
    next.splice(idx, 1);
    allPlots.value = next;
    if (selectedPlot.value?.id === plotId) selectedPlot.value = null;
    saveToStorage();
    return true;
  };

  return {
    // State
    allPlots,
    selectedPlot,
    loading,

    // Actions
    fetchPlots,
    selectPlot,
    createPlot,
    updatePlot,
    deletePlot,
  };
}

