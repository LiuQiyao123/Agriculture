import { ref, computed, onMounted, nextTick } from 'vue';

export function useLandUseData() {
  const tableRef = ref(null);
  
  const filters = ref({
    status: '',
  });

  const tableData = ref([
    { plotId: 'PLOT-034', originalUse: '耕地', currentUse: '建设用地', area: '5.2', changeDate: '2023-09-12', status: '已审批' },
    { plotId: 'PLOT-101', originalUse: '荒地', currentUse: '耕地', area: '10.8', changeDate: '2023-08-25', status: '已审批' },
    { plotId: 'PLOT-056', originalUse: '耕地', currentUse: '林地', area: '3.1', changeDate: '2023-08-11', status: '已审批' },
    { plotId: 'PLOT-210', originalUse: '耕地', currentUse: '其他', area: '1.5', changeDate: '2023-10-20', status: '待审批' },
  ]);

  const filteredTableData = computed(() => {
    return tableData.value.filter(item => {
      return filters.value.status ? item.status === filters.value.status : true;
    });
  });

  onMounted(() => {
    nextTick(() => {
      if (tableRef.value && filteredTableData.value.length > 0) {
        tableRef.value.setCurrentRow(filteredTableData.value[0]);
      }
    });
  });

  const pieChartOptions = ref({
    tooltip: { trigger: 'item', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
    legend: { top: '5%', left: 'center', textStyle: { color: '#ccc' } },
    series: [{
      name: '土地利用类型', type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#2d3343', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: '24', fontWeight: 'bold', color: '#fff' } },
      labelLine: { show: false },
      data: [
        { value: 1048, name: '耕地' }, { value: 735, name: '林地' }, { value: 580, name: '建设用地' },
        { value: 484, name: '水域' }, { value: 300, name: '其他' }
      ]
    }],
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
  });

  const barChartOptions = ref({
    grid: { top: 30, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: 'category',
      data: ['2020年', '2021年', '2022年', '2023年'],
      axisLine: { lineStyle: { color: '#888' } },
      axisLabel: { color: '#ccc' },
    },
    yAxis: {
      type: 'value',
      name: '亩',
      nameTextStyle: { color: '#ccc' },
      axisLine: { show: true, lineStyle: { color: '#888' } },
      axisLabel: { color: '#ccc' },
      splitLine: { lineStyle: { type: 'dashed', color: '#444' } },
    },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
    series: [{ name: '耕地面积', type: 'bar', barWidth: '40%', data: [1052, 1045, 1055, 1048], itemStyle: { color: '#91cc75' } }],
  });

  const aiAnalysisContent = computed(() => {
    return {
      sections: [
        {
          title: 'AI 发现',
          list: [
            '检测到 3 处疑似违规用地。',
            '预测未来一年建设用地需求将增加 5%。',
          ]
        },
        {
          title: '优化建议',
          list: [
            '建议将 PLOT-101 地块调整为高价值经济作物区。',
          ]
        }
      ]
    }
  });

  return {
    tableRef,
    filters,
    filteredTableData,
    pieChartOptions,
    barChartOptions,
    aiAnalysisContent,
  };
}
