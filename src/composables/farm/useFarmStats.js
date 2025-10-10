import { computed } from 'vue';
import { usePlots } from '@/composables/farm/usePlots.js';
import { useTasks } from '@/composables/farm/useTasks.js';
import { useHarvests } from '@/composables/farm/useHarvests.js';

export function useFarmStats() {
  const { allPlots, fetchPlots } = usePlots();
  const { allTasks, fetchTasks } = useTasks();
  const { allHarvests, fetchHarvests } = useHarvests();

  // 1. Plot Area Distribution Chart
  const plotAreaChartOptions = computed(() => {
    const data = allPlots.value.map(p => ({
      name: p.id,
      value: p.properties.area,
    }));
    return {
      title: { text: '地块面积分布', left: 'center', textStyle: { color: '#fff' } },
      tooltip: { trigger: 'item', formatter: '{b}: {c}亩 ({d}%)' },
      series: [{
        type: 'pie',
        radius: '60%',
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  });

  // 2. Crop Variety Proportion Chart
  const cropVarietyChartOptions = computed(() => {
    const cropData = {};
    allPlots.value.forEach(p => {
      const crop = p.properties.crop || '未知';
      cropData[crop] = (cropData[crop] || 0) + 1;
    });
    const data = Object.keys(cropData).map(key => ({ name: key, value: cropData[key] }));
    return {
      title: { text: '作物品种占比', left: 'center', textStyle: { color: '#fff' } },
      tooltip: { trigger: 'item', formatter: '{b}: {c}个地块 ({d}%)' },
      series: [{ type: 'pie', radius: '60%', data }]
    };
  });

  // 3. Task Status Statistics Chart
  const taskStatusChartOptions = computed(() => {
    const statusData = {};
    allTasks.value.forEach(t => {
      statusData[t.status] = (statusData[t.status] || 0) + 1;
    });
    return {
      title: { text: '任务状态统计', left: 'center', textStyle: { color: '#fff' } },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: Object.keys(statusData), axisLabel: { color: '#fff' } },
      yAxis: { type: 'value', axisLabel: { color: '#fff' } },
      series: [{ type: 'bar', data: Object.values(statusData) }]
    };
  });

  // 4. Yield Trend Chart
  const yieldTrendChartOptions = computed(() => {
    const sortedHarvests = [...allHarvests.value].sort((a, b) => new Date(a.harvestDate) - new Date(b.harvestDate));
    return {
      title: { text: '近半年产量趋势', left: 'center', textStyle: { color: '#fff' } },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: sortedHarvests.map(h => h.harvestDate), axisLabel: { color: '#fff' } },
      yAxis: { type: 'value', name: '产量 (吨)', axisLabel: { color: '#fff' } },
      series: [{ type: 'line', data: sortedHarvests.map(h => h.quantity), smooth: true }]
    };
  });

  const fetchData = async () => {
    await Promise.all([fetchPlots(), fetchTasks(), fetchHarvests()]);
  };

  return {
    fetchData,
    plotAreaChartOptions,
    cropVarietyChartOptions,
    taskStatusChartOptions,
    yieldTrendChartOptions,
  };
}

