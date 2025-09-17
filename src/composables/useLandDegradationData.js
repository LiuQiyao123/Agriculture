import { ref, computed, onMounted, nextTick } from 'vue';

export function useLandDegradationData() {
  const tableRef = ref(null);

  const filters = ref({
    type: '',
    level: '',
  });

  const tableData = ref([
    { plotId: 'PLOT-089', type: '土壤酸化', level: '重度', area: '15.2', suggestion: '施用石灰改良' },
    { plotId: 'PLOT-121', type: '土壤盐碱化', level: '中度', area: '22.8', suggestion: '种植耐盐作物' },
    { plotId: 'PLOT-034', type: '养分流失', level: '轻度', area: '8.5', suggestion: '增施有机肥' },
    { plotId: 'PLOT-067', type: '土壤板结', level: '中度', area: '19.4', suggestion: '深耕、增施有机肥' },
  ]);

  const filteredTableData = computed(() => {
    return tableData.value.filter(item => {
      const typeMatch = filters.value.type ? item.type === filters.value.type : true;
      const levelMatch = filters.value.level ? item.level === filters.value.level : true;
      return typeMatch && levelMatch;
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
    series: [{ name: '退化类型', type: 'pie', radius: '50%', data: [{ value: 45, name: '水土流失' }, { value: 28, name: '土壤酸化' }, { value: 15, name: '盐碱化' }, { value: 12, name: '其他' }], emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } } }]
  });

  const aiAnalysisContent = computed(() => {
    return {
      sections: [
        {
          title: '主要风险',
          list: [
            'PLOT-088：检测到中度水土流失风险，表层土壤流失率约 5 t/ha·year。',
            'PLOT-121：土壤酸化趋势明显，pH值已降至 5.2。',
          ]
        },
        {
          title: '修复建议',
          list: [
            '对 PLOT-088 采用等高线种植，并增设植被缓冲带。',
            '对 PLOT-121 施用石灰或生物炭改良，每亩 50-80 kg。',
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
    aiAnalysisContent,
  };
}
