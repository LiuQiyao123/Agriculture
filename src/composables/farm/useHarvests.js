import { ref, computed } from 'vue';

const STORAGE_KEY = 'agri_harvests_v2';

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
        id: 'harvest-ai-001',
        crop: '玉米',
        plotId: 'A01',
        plotName: '地块A01',
        harvestStartDate: '2025-09-10',
        harvestEndDate: '2025-09-20',
        estimatedYield: 850,
        status: 'suggested',
        source: 'ai',
        aiRecommendation: {
          optimalWindow: '2025-09-10 至 2025-09-20',
          confidence: 92,
          factors: ['成熟度', '天气条件', '市场价格']
        },
        createdAt: '2025-08-20',
        createdBy: 'AI助手',
        feedbackHistory: []
      },
      {
        id: 'harvest-002',
        crop: '小麦',
        plotId: 'B02',
        plotName: '地块B02',
        harvestStartDate: '2025-06-15',
        harvestEndDate: '2025-06-25',
        estimatedYield: 650,
        status: 'pending',
        source: 'manual',
        createdAt: '2025-05-15',
        createdBy: '李主管',
        feedbackHistory: []
      },
      {
        id: 'harvest-003',
        crop: '大豆',
        plotId: 'C03',
        plotName: '地块C03',
        harvestStartDate: '2025-10-05',
        harvestEndDate: '2025-10-15',
        estimatedYield: 420,
        status: 'harvesting',
        source: 'manual',
        createdAt: '2025-09-01',
        createdBy: '王主任',
        feedbackHistory: []
      },
       {
        id: 'harvest-feedback-001',
        crop: '水稻',
        plotId: 'D04',
        plotName: '地块D04',
        harvestStartDate: '2025-11-05',
        harvestEndDate: '2025-11-10',
        estimatedYield: 780,
        status: 'feedback',
        source: 'manual',
        createdAt: '2025-10-15',
        createdBy: '张经理',
        feedbackHistory: [{
          user: '现场负责人A',
          time: '2025-11-06 10:00',
          content: '收割机出现故障，已暂停作业。'
        }]
      },
      {
        id: 'harvest-001',
        crop: '玉米',
        plotId: 'A01',
        plotName: '地块A01',
        harvestStartDate: '2025-09-11',
        harvestEndDate: '2025-09-15',
        estimatedYield: 850,
        actualYield: 820,
        yieldAccuracy: 96.5,
        quality: 'A',
        status: 'completed',
        source: 'ai',
        createdAt: '2025-08-20',
        createdBy: '张经理',
        feedbackHistory: []
      },
      {
        id: 'harvest-ignored-01',
        crop: '番茄',
        plotId: 'F06',
        plotName: '地块F06',
        harvestStartDate: '2025-08-15',
        harvestEndDate: '2025-08-25',
        estimatedYield: 2500,
        status: 'ignored',
        source: 'ai',
        aiRecommendation: {
          optimalWindow: '2025-08-15 至 2025-08-25',
          confidence: 80,
          factors: ['成熟度', '市场价格']
        },
        createdAt: '2025-07-20',
        createdBy: 'AI助手',
        feedbackHistory: []
      },
       {
        id: 'harvest-archived-001',
        crop: '土豆',
        plotId: 'E05',
        plotName: '地块E05',
        harvestStartDate: '2024-08-20',
        harvestEndDate: '2024-08-28',
        estimatedYield: 1200,
        actualYield: 1250,
        yieldAccuracy: 96,
        quality: 'A',
        status: 'archived',
        source: 'manual',
        createdAt: '2024-07-20',
        createdBy: '李主管',
        feedbackHistory: []
      },
      {
        id: "harvest-006",
        plotId: "plot-f",
        plotName: "F区蔬菜",
        crop: "番茄",
        estimatedYield: 25,
        actualYield: null,
        harvestStartDate: "2025-10-25",
        harvestEndDate: "2025-11-10",
        status: "pending",
        source: 'manual',
        feedbackHistory: [],
      },
      {
        id: "harvest-007",
        plotId: "plot-g",
        plotName: "G区果园",
        crop: "苹果",
        estimatedYield: 40,
        actualYield: 42,
        harvestStartDate: "2025-10-20",
        harvestEndDate: "2025-11-05",
        status: "completed",
        source: 'manual',
        feedbackHistory: [],
      },
      {
        id: "harvest-008",
        plotId: "plot-h",
        plotName: "H区试验田",
        crop: "高粱",
        estimatedYield: 15,
        actualYield: null,
        harvestStartDate: "2025-11-01",
        harvestEndDate: "2025-11-10",
        status: "suggested",
        source: 'ai',
        feedbackHistory: [],
      },
      {
        id: "harvest-009",
        plotId: "plot-a",
        plotName: "A区小麦",
        crop: "小麦",
        estimatedYield: 65,
        actualYield: null,
        harvestStartDate: "2025-10-18",
        harvestEndDate: "2025-10-25",
        status: "harvesting",
        source: 'manual',
        feedbackHistory: [],
      },
      {
        id: "harvest-010",
        plotId: "plot-c",
        plotName: "C区玉米",
        crop: "玉米",
        estimatedYield: 80,
        actualYield: null,
        harvestStartDate: "2025-10-22",
        harvestEndDate: "2025-10-30",
        status: "feedback",
        source: 'manual',
        feedbackHistory: [{ user: '李四', time: '2025-10-23', content: '收割机出现故障，进度延误一天。' }],
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

  const addHarvest = (harvestData) => {
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
    addHarvest,
    updateHarvest,
    deleteHarvest,
    getHarvestById,
    getHarvestsByStatus,
    getHarvestsByCrop
  };
}