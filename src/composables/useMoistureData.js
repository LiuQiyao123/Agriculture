// src/composables/useMoistureData.js
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { getProcessedGeoJSON } from '@/services/MapService.js';
import originalPlots from '@/mock/shandong-plots.json';

// Helper function to calculate the center of a polygon
function getPolygonCenter(coordinates) {
  if (!coordinates || !coordinates[0] || coordinates[0].length === 0) {
    // Return a default center if coordinates are invalid
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


export function useMoistureData(gisMapRef, tableRef) {
  const currentRow = ref(null);

  const processedPlots = computed(() => {
    return getProcessedGeoJSON(originalPlots, 'soil-moisture');
  });

  const filters = ref({
    region: '',
    level: '',
  });

  const areaOptions = ref([
    {
      value: '高新区',
      label: '高新区',
      children: [
        { value: '高新区-创新大道88号', label: '高新区-创新大道88号' },
        { value: '高新区-科技路100号', label: '高新区-科技路100号' },
      ],
    },
    {
      value: '城关镇',
      label: '城关镇',
      children: [
        { value: '城关镇-幸福路12号', label: '城关镇-幸福路12号' },
        { value: '城关镇-文化街50号', label: '城关镇-文化街50号' },
      ],
    },
    {
      value: '开发区',
      label: '开发区',
      children: [
        { value: '开发区-工业一路101号', label: '开发区-工业一路101号' },
        { value: '开发区-科技大道200号', label: '开发区-科技大道200号' },
      ],
    },
    {
      value: '远郊区',
      label: '远郊区',
      children: [
        { value: '远郊区-希望田野9号', label: '远郊区-希望田野9号' },
        { value: '远郊区-绿野农庄15号', label: '远郊区-绿野农庄15号' },
      ],
    },
  ]);

  const filterFields = ref([
    {
      type: 'cascader',
      model: 'area',
      label: '预警区域',
      placeholder: '请选择区域',
      options: areaOptions.value,
      width: '240px',
    },
    {
      type: 'select',
      model: 'level',
      label: '预警级别',
      placeholder: '请选择级别',
      options: [
        { label: '重旱', value: '重旱' },
        { label: '中旱', value: '中旱' },
        { label: '轻旱', value: '轻旱' },
      ],
    },
    {
      type: 'input',
      model: 'type',
      label: '预警类型',
      placeholder: '请输入类型关键字',
    },
  ]);

  const tableData = ref([
    { id: "A01", plotName: '地块A-01', plotId: 'A-01', warningType: '持续干旱', warningLevel: '重旱', confidence: '92%', suggestion: '立即启动1号灌溉方案', tagType: 'danger' },
    { id: "B02", plotName: '地块B-02', plotId: 'B-02', warningType: '短期干旱', warningLevel: '中旱', confidence: '85%', suggestion: '建议提前调配抗旱设备', tagType: 'warning' },
    { id: "C03", plotName: '地块C-03', plotId: 'C-03', warningType: '持续干旱', warningLevel: '轻旱', confidence: '90%', suggestion: '无需特殊处理', tagType: 'info' },
    { id: "D04", plotName: '地块D-04', plotId: 'D-04', warningType: '短期干旱', warningLevel: '重旱', confidence: '95%', suggestion: '建议提前调配抗旱设备', tagType: 'danger' },
  ]);

  const filteredTableData = computed(() => {
    return tableData.value;
  });
  
  const modelTransparencyContent = computed(() => {
    if (!currentRow.value) {
      return { metrics: [], sections: [{ title: '关键影响因子权重', list: ['请先在下方列表中选择一个地块'] }] };
    }
    const confidence = parseFloat(currentRow.value.confidence) || 90;
    return {
      metrics: [
        { label: '历史验证准确率', value: `${(confidence - 5 + Math.random() * 2).toFixed(1)}% ↗`, class: 'success' },
        { label: '本轮预测置信度', value: `${confidence.toFixed(1)}%`, class: '' },
      ],
      sections: [
        {
          title: `关键影响因子 (${currentRow.value.plotName})`,
          list: [
            `未来降雨概率: ${(confidence / 2.5 + Math.random() * 5).toFixed(1)}%`,
            `土壤类型: ${(confidence / 3 + Math.random() * 5).toFixed(1)}%`,
            `历史墒情模式: ${(confidence / 4 + Math.random() * 5).toFixed(1)}%`,
            `地形微气候: ${(100 - (confidence / 2.5 + confidence / 3 + confidence / 4)).toFixed(1)}%`,
          ],
        },
      ],
    }
  });

  const decisionSuggestionContent = computed(() => {
    if (!currentRow.value) {
      return { sections: [{ title: '智能决策建议', paragraph: '请先在下方列表中选择一个地块' }] };
    }
    const days = Math.floor(Math.random() * 5) + 1;
    return {
       sections: [
        {
          title: `最优灌溉方案 (${currentRow.value.plotName})`,
          paragraph: currentRow.value.suggestion,
        },
        {
          title: '风险预警',
          list: [
            `${currentRow.value.plotName} ${days}日后${currentRow.value.warningLevel}风险 (${(parseFloat(currentRow.value.confidence) - Math.random() * 10).toFixed(1)}%概率)`,
            `建议调配抗旱设备 ${Math.floor(Math.random() * 50) + 10}台`,
          ],
        },
      ],
    }
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

  const validationChartRef = ref(null);

  // Watch for the table component to be ready, then select the first row.
  // This is more reliable than using onMounted with nextTick.
  watch(tableRef, (newTableRef) => {
    if (newTableRef && filteredTableData.value.length > 0) {
      const firstRow = filteredTableData.value[0];
      if (typeof newTableRef.setCurrentRow === 'function') {
        // Use nextTick to ensure the table has rendered its rows
        nextTick(() => {
          newTableRef.setCurrentRow(firstRow);
          handleCurrentChange(firstRow);
        });
      }
    }
  }, { once: true });


  onMounted(() => {
    // Chart initialization remains here
    nextTick(() => {
      if(validationChartRef.value) {
        validationChartRef.value.initChart();
      }
    });
  });

  const validationChartOptions = computed(() => {
    if (!currentRow.value) {
      return { series: [] }; 
    }
    const baseData = [35.2, 32.1, 28.4, 26.8, 27.5, 24.1, 22.9];
    const newData = baseData.map(d => (d - 5 + Math.random() * 10).toFixed(1));

    return {
      grid: { top: 30, right: 20, bottom: 30, left: 40 },
      xAxis: {
        type: 'category',
        data: ['10-21', '10-22', '10-23', '10-24', '10-25', '10-26', '10-27'],
        axisLine: { lineStyle: { color: '#888' } },
        axisLabel: { color: '#ccc' },
      },
      yAxis: {
        type: 'value',
        name: '土壤湿度(%)',
        nameTextStyle: { color: '#ccc', padding: [0, 0, 0, 50] },
        axisLine: { show: true, lineStyle: { color: '#888' } },
        axisLabel: { color: '#ccc' },
        splitLine: { lineStyle: { type: 'dashed', color: '#444' } },
      },
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
      series: [
        {
          name: `墒情 (${currentRow.value.plotName})`,
          type: 'line',
          smooth: true,
          data: newData,
          itemStyle: { color: '#33b5e5' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [{ offset: 0, color: 'rgba(51, 181, 229, 0.5)' }, { offset: 1, color: 'rgba(51, 181, 229, 0)' }]
            }
          }
        },
      ],
    }
  });

  return {
    validationChartRef,
    currentRow,
    processedPlots,
    filters,
    areaOptions,
    filterFields,
    tableData,
    filteredTableData,
    handleCurrentChange,
    validationChartOptions,
    modelTransparencyContent,
    decisionSuggestionContent
  };
}
