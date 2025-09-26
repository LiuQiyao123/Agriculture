import { ref, computed } from 'vue';

const STORAGE_KEY = 'agri_planting_plans_v1';

export function usePlantingPlans() {
  const allPlans = ref([]);
  const selectedPlan = ref(null);
  const loading = ref(false);

  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allPlans.value));
    } catch (error) {
      console.error('Failed to save plans to storage:', error);
    }
  };

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        allPlans.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load plans from storage:', error);
    }
  };

  const seedMockData = () => {
    const mockPlans = [
      {
        id: 'plan-001',
        name: '2025年春季玉米增产计划',
        crop: '玉米',
        plotCount: 3,
        plots: ['地块A01', '地块B02', '地块C03'],
        startDate: '2025-03-15',
        endDate: '2025-09-30',
        status: '进行中',
        estimatedCost: 45000,
        estimatedRevenue: 120000,
        profit: 75000,
        riskLevel: 'medium',
        createdAt: '2025-01-15',
        createdBy: '张经理'
      },
      {
        id: 'plan-002',
        name: '2025年水稻节水种植计划',
        crop: '水稻',
        plotCount: 2,
        plots: ['地块D04', '地块E05'],
        startDate: '2025-04-01',
        endDate: '2025-10-15',
        status: '草稿',
        estimatedCost: 32000,
        estimatedRevenue: 85000,
        profit: 53000,
        riskLevel: 'low',
        createdAt: '2025-01-20',
        createdBy: '李主管'
      },
      {
        id: 'plan-003',
        name: '2024年大豆轮作计划',
        crop: '大豆',
        plotCount: 4,
        plots: ['地块A01', '地块B02', '地块F06', '地块G07'],
        startDate: '2024-05-01',
        endDate: '2024-11-30',
        status: '已完成',
        estimatedCost: 28000,
        estimatedRevenue: 78000,
        profit: 50000,
        riskLevel: 'low',
        createdAt: '2024-04-15',
        createdBy: '王主任'
      }
    ];
    allPlans.value = mockPlans;
    saveToStorage();
  };

  const fetchPlans = async () => {
    loading.value = true;
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟网络延迟
    
    try {
      loadFromStorage();
      if (allPlans.value.length === 0) {
        seedMockData();
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      loading.value = false;
    }
  };

  const createPlan = (planData) => {
    const newPlan = {
      id: `plan-${Date.now()}`,
      ...planData,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: '当前用户'
    };
    allPlans.value.unshift(newPlan);
    saveToStorage();
    return newPlan;
  };

  const updatePlan = (planId, updates) => {
    const index = allPlans.value.findIndex(plan => plan.id === planId);
    if (index !== -1) {
      allPlans.value[index] = { ...allPlans.value[index], ...updates };
      saveToStorage();
      return allPlans.value[index];
    }
    return null;
  };

  const deletePlan = (planId) => {
    const index = allPlans.value.findIndex(plan => plan.id === planId);
    if (index !== -1) {
      allPlans.value.splice(index, 1);
      saveToStorage();
      return true;
    }
    return false;
  };

  const getPlanById = (planId) => {
    return allPlans.value.find(plan => plan.id === planId);
  };

  const getPlansByStatus = (status) => {
    return allPlans.value.filter(plan => plan.status === status);
  };

  const getPlansByCrop = (crop) => {
    return allPlans.value.filter(plan => plan.crop === crop);
  };

  return {
    // State
    allPlans,
    selectedPlan,
    loading,

    // Actions
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    getPlanById,
    getPlansByStatus,
    getPlansByCrop
  };
}
