import { ref, reactive } from 'vue';

// 模拟数据
const assignedTargets = reactive({
  grainArea: 50,
  grainTarget: 20,
  economicArea: 30,
  economicTarget: 12
});

const plots = ref([
  {
    id: 1,
    name: '东地块',
    area: 25,
    soilType: '壤土',
    currentCrop: '小麦',
    plannedCrop: '玉米',
    status: '已规划'
  },
  {
    id: 2,
    name: '西地块',
    area: 20,
    soilType: '沙土',
    currentCrop: null,
    plannedCrop: '大豆',
    status: '待规划'
  }
]);

const plantingPlans = ref([
  {
    id: 1,
    plotName: '东地块',
    cropName: '玉米',
    cropType: '粮食作物',
    plannedArea: 25,
    expectedYield: 10,
    plantingDate: '2024-04-15',
    harvestDate: '2024-09-15',
    status: '执行中',
    approvalStatus: '已通过'
  },
  {
    id: 2,
    plotName: '西地块',
    cropName: '大豆',
    cropType: '粮食作物',
    plannedArea: 20,
    expectedYield: 6,
    plantingDate: '2024-05-01',
    harvestDate: '2024-10-01',
    status: '已制定',
    approvalStatus: '待审批'
  }
]);

const executionProgress = reactive({
  areaCompletion: 75,
  yieldCompletion: 82
});

const cropProgress = ref([
  { name: '玉米', completion: 80 },
  { name: '大豆', completion: 65 },
  { name: '西红柿', completion: 90 }
]);

const farmReminders = ref([
  {
    id: 1,
    type: '种植',
    message: '东地块玉米种植时间已到',
    date: '2024-04-15'
  },
  {
    id: 2,
    type: '施肥',
    message: '西地块大豆需要追肥',
    date: '2024-04-20'
  }
]);

const loading = ref(false);

export function useFarmerPlanning() {
  const fetchAssignedTargets = async () => {
    loading.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('获取分配指标失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const fetchPlots = async () => {
    loading.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('获取地块信息失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const fetchPlantingPlans = async () => {
    loading.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('获取种植计划失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const fetchExecutionData = async () => {
    loading.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('获取执行数据失败:', error);
    } finally {
      loading.value = false;
    }
  };

  return {
    assignedTargets,
    plots,
    plantingPlans,
    executionProgress,
    cropProgress,
    farmReminders,
    loading,
    fetchAssignedTargets,
    fetchPlots,
    fetchPlantingPlans,
    fetchExecutionData
  };
}
