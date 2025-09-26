import { ref, reactive } from 'vue';

// 模拟数据
const assignedTargets = reactive({
  grainArea: 2000,
  grainTarget: 800,
  economicArea: 1500,
  economicTarget: 600
});

const regionalPlans = ref([
  {
    id: 1,
    planName: '2024年春季粮食种植计划',
    cropType: '粮食作物',
    plannedArea: 1200,
    expectedYield: 480,
    subRegions: ['章丘区', '历城区', '长清区'],
    status: '执行中',
    approvalStatus: '已通过'
  },
  {
    id: 2,
    planName: '2024年经济作物种植计划',
    cropType: '经济作物',
    plannedArea: 800,
    expectedYield: 320,
    subRegions: ['市中区', '天桥区', '槐荫区'],
    status: '已制定',
    approvalStatus: '待审批'
  }
]);

const subRegionTargets = ref([
  {
    id: 1,
    subRegion: '章丘区',
    level: '县级',
    grainArea: 500,
    grainTarget: 200,
    economicArea: 300,
    economicTarget: 120,
    completionRate: 85
  },
  {
    id: 2,
    subRegion: '历城区',
    level: '县级',
    grainArea: 400,
    grainTarget: 160,
    economicArea: 250,
    economicTarget: 100,
    completionRate: 78
  }
]);

const overallProgress = reactive({
  areaCompletion: 78,
  yieldCompletion: 82
});

const cropProgress = ref([
  { name: '小麦', completion: 85 },
  { name: '玉米', completion: 72 },
  { name: '大豆', completion: 90 },
  { name: '蔬菜', completion: 68 }
]);

const alerts = ref([
  {
    id: 1,
    level: '高',
    message: '章丘区小麦种植进度滞后，需要加快进度'
  }
]);

const loading = ref(false);

export function useRegionalPlanning() {
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

  const fetchRegionalPlans = async () => {
    loading.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('获取区域计划失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const fetchSubRegionTargets = async () => {
    loading.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('获取下级区域指标失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const fetchMonitoringData = async () => {
    loading.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('获取监控数据失败:', error);
    } finally {
      loading.value = false;
    }
  };

  return {
    assignedTargets,
    regionalPlans,
    subRegionTargets,
    overallProgress,
    cropProgress,
    alerts,
    loading,
    fetchAssignedTargets,
    fetchRegionalPlans,
    fetchSubRegionTargets,
    fetchMonitoringData
  };
}
