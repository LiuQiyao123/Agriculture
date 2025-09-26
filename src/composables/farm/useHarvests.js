import { ref, computed } from 'vue';

const STORAGE_KEY = 'agri_harvests_v1';

export function useHarvests() {
  const allHarvests = ref([]);
  const selectedHarvest = ref(null);
  const loading = ref(false);

  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allHarvests.value));
    } catch (error) {
      console.error('Failed to save harvests to storage:', error);
    }
  };

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        allHarvests.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load harvests from storage:', error);
    }
  };

  const seedMockData = () => {
    const mockHarvests = [
      {
        id: 'harvest-001',
        crop: '玉米',
        plotId: 'A01',
        plotName: '地块A01',
        harvestDate: '2025-09-15',
        estimatedYield: 850,
        actualYield: 820,
        yieldAccuracy: 96.5,
        quality: 'A',
        status: 'completed',
        aiRecommendation: {
          optimalWindow: '2025-09-10 至 2025-09-20',
          confidence: 92,
          factors: ['成熟度', '天气条件', '市场价格']
        },
        createdAt: '2025-08-20',
        createdBy: '张经理'
      },
      {
        id: 'harvest-002',
        crop: '小麦',
        plotId: 'B02',
        plotName: '地块B02',
        harvestDate: '2025-06-20',
        estimatedYield: 650,
        actualYield: null,
        yieldAccuracy: null,
        quality: null,
        status: 'pending',
        aiRecommendation: {
          optimalWindow: '2025-06-15 至 2025-06-25',
          confidence: 88,
          factors: ['成熟度', '天气条件', '市场价格']
        },
        createdAt: '2025-05-15',
        createdBy: '李主管'
      },
      {
        id: 'harvest-003',
        crop: '大豆',
        plotId: 'C03',
        plotName: '地块C03',
        harvestDate: '2025-10-10',
        estimatedYield: 420,
        actualYield: 435,
        yieldAccuracy: 96.4,
        quality: 'B',
        status: 'completed',
        aiRecommendation: {
          optimalWindow: '2025-10-05 至 2025-10-15',
          confidence: 85,
          factors: ['成熟度', '天气条件', '市场价格']
        },
        createdAt: '2025-09-01',
        createdBy: '王主任'
      }
    ];
    allHarvests.value = mockHarvests;
    saveToStorage();
  };

  const fetchHarvests = async () => {
    loading.value = true;
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      loadFromStorage();
      if (allHarvests.value.length === 0) {
        seedMockData();
      }
    } catch (error) {
      console.error('Failed to fetch harvests:', error);
    } finally {
      loading.value = false;
    }
  };

  const createHarvest = (harvestData) => {
    const newHarvest = {
      id: `harvest-${Date.now()}`,
      ...harvestData,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: '当前用户'
    };
    allHarvests.value.unshift(newHarvest);
    saveToStorage();
    return newHarvest;
  };

  const updateHarvest = (harvestId, updates) => {
    const index = allHarvests.value.findIndex(harvest => harvest.id === harvestId);
    if (index !== -1) {
      allHarvests.value[index] = { ...allHarvests.value[index], ...updates };
      saveToStorage();
      return allHarvests.value[index];
    }
    return null;
  };

  const deleteHarvest = (harvestId) => {
    const index = allHarvests.value.findIndex(harvest => harvest.id === harvestId);
    if (index !== -1) {
      allHarvests.value.splice(index, 1);
      saveToStorage();
      return true;
    }
    return false;
  };

  const getHarvestById = (harvestId) => {
    return allHarvests.value.find(harvest => harvest.id === harvestId);
  };

  const getHarvestsByStatus = (status) => {
    return allHarvests.value.filter(harvest => harvest.status === status);
  };

  const getHarvestsByCrop = (crop) => {
    return allHarvests.value.filter(harvest => harvest.crop === crop);
  };

  return {
    // State
    allHarvests,
    selectedHarvest,
    loading,

    // Actions
    fetchHarvests,
    createHarvest,
    updateHarvest,
    deleteHarvest,
    getHarvestById,
    getHarvestsByStatus,
    getHarvestsByCrop
  };
}