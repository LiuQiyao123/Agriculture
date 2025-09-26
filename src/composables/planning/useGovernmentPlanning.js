import { ref, reactive } from 'vue';

// 模拟数据
const annualPlan = reactive({
  totalArea: 1200,
  areaTrend: 5.2,
  grainTarget: 480,
  grainTrend: 3.8,
  economicTarget: 320,
  economicTrend: 7.1,
  completionRate: 78.5,
  completionTrend: 12.3
});

const regionalTargets = ref([
  {
    id: 1,
    region: '济南市',
    level: '市级',
    grainArea: 200,
    grainTarget: 80,
    economicArea: 150,
    economicTarget: 60,
    completionRate: 82,
    status: '进行中'
  },
  {
    id: 2,
    region: '青岛市',
    level: '市级',
    grainArea: 180,
    grainTarget: 72,
    economicArea: 200,
    economicTarget: 80,
    completionRate: 75,
    status: '进行中'
  },
  {
    id: 3,
    region: '烟台市',
    level: '市级',
    grainArea: 160,
    grainTarget: 64,
    economicArea: 180,
    economicTarget: 72,
    completionRate: 88,
    status: '进行中'
  }
]);

const policyFiles = ref([
  {
    id: 1,
    title: '2024年山东省粮食生产指导意见',
    description: '关于做好2024年粮食生产工作的指导意见',
    publishDate: '2024-01-15',
    scope: '全省'
  }
]);

const loading = ref(false);

export function useGovernmentPlanning() {
  const fetchAnnualPlan = async () => {
    loading.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('获取年度计划失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const fetchRegionalTargets = async () => {
    loading.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('获取区域指标失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const fetchPolicyFiles = async () => {
    loading.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('获取政策文件失败:', error);
    } finally {
      loading.value = false;
    }
  };

  return {
    annualPlan,
    regionalTargets,
    policyFiles,
    loading,
    fetchAnnualPlan,
    fetchRegionalTargets,
    fetchPolicyFiles
  };
}
