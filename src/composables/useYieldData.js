import { ref, computed, onMounted, nextTick } from 'vue';

export function useYieldData() {
  const tableRef = ref(null);

  const filters = ref({
    crop: '',
  });

  const tableData = ref([
    { plotId: 'PLOT-015', crop: '玉米', currentYield: '750', predictedYield: '810', diff: '+8.0%' },
    { plotId: 'PLOT-003', crop: '水稻', currentYield: '820', predictedYield: '850', diff: '+3.7%' },
    { plotId: 'PLOT-007', crop: '水稻', currentYield: '780', predictedYield: '790', diff: '+1.3%' },
    { plotId: 'PLOT-011', crop: '小麦', currentYield: '600', predictedYield: '640', diff: '+6.7%' },
  ]);

  const filteredTableData = computed(() => {
    return tableData.value.filter(item => {
      return filters.value.crop ? item.crop === filters.value.crop : true;
    });
  });

  onMounted(() => {
    nextTick(() => {
      if (tableRef.value && filteredTableData.value.length > 0) {
        tableRef.value.setCurrentRow(filteredTableData.value[0]);
      }
    });
  });

  const barChartOptions = ref({
    grid: { top: 40, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: 'category',
      data: ['PLOT-015', 'PLOT-003', 'PLOT-007', 'PLOT-011'],
      axisLine: { lineStyle: { color: '#888' } },
      axisLabel: { color: '#ccc' },
    },
    yAxis: {
      type: 'value',
      name: '公斤/亩',
      nameTextStyle: { color: '#ccc' },
      axisLine: { show: true, lineStyle: { color: '#888' } },
      axisLabel: { color: '#ccc' },
      splitLine: { lineStyle: { type: 'dashed', color: '#444' } },
    },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
    legend: {
        data:['当前产量', '预测产量'],
        textStyle: {
            color: '#ccc'
        }
    },
    series: [
        { name: '当前产量', type: 'bar', data: [750, 820, 780, 600], itemStyle: { color: '#5470c6' } },
        { name: '预测产量', type: 'bar', data: [810, 850, 790, 640], itemStyle: { color: '#91cc75' } }
    ],
  });

  const suggestionContent = computed(() => {
    return {
      sections: [
        {
          title: '关键发现',
          list: [
            'PLOT-015 (玉米)：得益于近期光照充足，预计增产 8%。',
            'PLOT-011 (小麦)：由于分蘖期水肥管理得当，预计增产 6.7%。',
          ]
        },
        {
          title: '优化建议',
          list: [
            '建议对 PLOT-007 (水稻) 在成熟期前补充一次钾肥，可进一步提升约 2-3% 的产量。',
          ]
        }
      ]
    }
  });

  return {
    tableRef,
    filters,
    filteredTableData,
    barChartOptions,
    suggestionContent,
  };
}
