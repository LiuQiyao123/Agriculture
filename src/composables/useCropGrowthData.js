// src/composables/useCropGrowthData.js
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { getProcessedGeoJSON } from '@/services/MapService.js';
import originalPlots from '@/mock/shandong-plots.json';

function getPolygonCenter(coordinates) {
  if (!coordinates || !coordinates[0] || coordinates[0].length === 0) {
    return [118.5, 36.5];
  }
  const coords = coordinates[0];
  let minLng = coords[0][0], maxLng = coords[0][0], minLat = coords[0][1], maxLat = coords[0][1];
  for (const [lng, lat] of coords) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
}

export function useCropGrowthData(gisMapRef, tableRef) {
  const currentRow = ref(null);
  const validationChartRef = ref(null);

  const processedPlots = computed(() => {
    return getProcessedGeoJSON(originalPlots, 'ndvi-tiles');
  });

  const diagnosisContent = computed(() => {
    if (!currentRow.value) {
      return { sections: [{ title: '诊断结论', paragraph: '请在下方列表中选择一个地块以查看诊断。' }] };
    }
    const ndvi = currentRow.value.ndvi;
    let conclusion = '长势良好';
    if (ndvi < 0.7) conclusion = `存在营养胁迫风险，预测减产 ${(15 - (ndvi - 0.6) * 50).toFixed(0)}-${(20 - (ndvi - 0.6) * 50).toFixed(0)}%。`;
    else if (ndvi < 0.8) conclusion = '长势中等，有提升空间。';
    
    return {
      sections: [
        { title: `地块 ${currentRow.value.plot} 诊断结论`, paragraph: conclusion },
        { title: '处置优先级', paragraph: `当前地块优先级: ${currentRow.value.growth === '偏弱' ? '高' : '中'}` }
      ]
    }
  });

  const suggestionContent = computed(() => {
    if (!currentRow.value) {
      return { sections: [{ title: '本周作业计划', list: ['请选择地块以获取建议。'] }] };
    }
    const suggestions = {
      '良好': ['维持当前管理方案，注意监测天气变化。'],
      '中等': ['建议补充叶面肥一次，增加光合效率。', '夜间进行 8-12mm 补灌。'],
      '偏弱': ['48小时内对优先地块追施尿素 15-20kg/亩。', '夜间进行 10-15mm 补灌。', '喷施 0.3% 磷酸二氢钾叶面肥一次。'],
    };
    return {
      sections: [
        { title: `地块 ${currentRow.value.plot} 作业计划`, list: suggestions[currentRow.value.growth] || ['暂无特别建议。'] }
      ]
    }
  });

  const filters = ref({
    plot: '',
    growth: '',
  });

  const filterFields = ref([
    { type: 'input', model: 'plot', label: '地块', placeholder: '请输入地块关键字' },
    { type: 'select', model: 'growth', label: '长势', placeholder: '请选择长势', options: [
        { label: '良好', value: '良好' },
        { label: '中等', value: '中等' },
        { label: '偏弱', value: '偏弱' },
      ]},
  ]);

  const tableData = ref([
    { id: 1, plot: 'A-01', plotId: 'A-01', crop: '水稻', growth: '良好', ndvi: 0.82, date: '2023-10-26' },
    { id: 2, plot: 'B-02', plotId: 'B-02', crop: '玉米', growth: '中等', ndvi: 0.75, date: '2023-10-26' },
    { id: 3, plot: 'C-03', plotId: 'C-03', crop: '小麦', growth: '偏弱', ndvi: 0.68, date: '2023-10-26' },
    { id: 4, plot: 'D-04', plotId: 'D-04', crop: '水稻', growth: '良好', ndvi: 0.80, date: '2023-10-26' },
  ]);

  const filteredTableData = computed(() => {
    return tableData.value;
  });
  
  const handleCurrentChange = (val) => {
    if (!val) return;
    currentRow.value = val;

    const feature = originalPlots.features.find(f => f.properties.name === val.plotId);
    if (feature && gisMapRef.value && typeof gisMapRef.value.flyTo === 'function') {
      const center = getPolygonCenter(feature.geometry.coordinates);
      gisMapRef.value.flyTo({
        center: center,
        zoom: 12,
        pitch: 60,
        bearing: -20,
        duration: 2000,
      });
    }
  };

  watch(tableRef, (newTableRef) => {
    if (newTableRef && filteredTableData.value.length > 0) {
      const firstRow = filteredTableData.value[0];
      if (typeof newTableRef.setCurrentRow === 'function') {
        nextTick(() => {
          newTableRef.setCurrentRow(firstRow);
          handleCurrentChange(firstRow);
        });
      }
    }
  }, { once: true });

  onMounted(() => {
    nextTick(() => {
      if (validationChartRef.value) {
        validationChartRef.value.initChart();
      }
    });
  });

  const validationChartOptions = computed(() => {
    if (!currentRow.value) {
      return { series: [] };
    }
    const baseNdvi = currentRow.value.ndvi;
    const trendData = Array.from({ length: 7 }, (_, i) => {
      if (i === 6) return baseNdvi;
      return (baseNdvi - (0.1 - Math.random() * 0.2) * (7 - i)).toFixed(2);
    });

    return {
      grid: { top: 30, right: 20, bottom: 30, left: 40 },
      xAxis: {
        type: 'category',
        data: ['第16周', '第17周', '第18周', '第19周', '第20周', '第21周', '当前'],
        axisLine: { lineStyle: { color: '#888' } },
        axisLabel: { color: '#ccc' },
      },
      yAxis: {
        type: 'value',
        name: 'NDVI',
        nameTextStyle: { color: '#ccc' },
        min: 0,
        max: 1,
        axisLine: { show: true, lineStyle: { color: '#888' } },
        axisLabel: { color: '#ccc' },
        splitLine: { lineStyle: { type: 'dashed', color: '#444' } },
      },
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
      series: [
        {
          name: `NDVI趋势 (${currentRow.value.plot})`,
          type: 'line',
          smooth: true,
          data: trendData,
          itemStyle: { color: '#00c851' },
          areaStyle: {
              color: {
                  type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [{ offset: 0, color: 'rgba(0, 200, 81, 0.5)' }, { offset: 1, color: 'rgba(0, 200, 81, 0)' }]
              }
          },
          markLine: {
            silent: true,
            data: [{ yAxis: 0.65, name: '健康阈值' }],
            lineStyle: { type: 'dashed', color: '#ff4d4f' },
            label: { color: '#ff4d4f' }
          }
        },
      ],
    };
  });
  
  return {
    validationChartRef,
    validationChartOptions,
    processedPlots,
    filters,
    filterFields,
    filteredTableData,
    handleCurrentChange,
    diagnosisContent,
    suggestionContent,
    currentRow,
  };
}
