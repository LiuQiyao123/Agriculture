import { ref, computed, watch, nextTick } from 'vue';
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

export function useSoilQualityData(gisMapRef, tableRef) {
  const currentRow = ref(null);

  const processedPlots = computed(() => {
    return getProcessedGeoJSON(originalPlots, 'soil-quality');
  });

  const filters = ref({
    level: '',
    region: '',
  });

  const filterFields = ref([
    {
      type: 'select',
      model: 'level',
      label: '肥力等级',
      placeholder: '请选择等级',
      options: [
        { label: '贫瘠', value: '贫瘠' },
        { label: '较差', value: '较差' },
        { label: '中等', value: '中等' },
        { label: '良好', value: '良好' },
        { label: '优', value: '优' },
      ],
    },
    {
      type: 'input',
      model: 'region',
      label: '区域',
      placeholder: '请输入区域关键字',
    },
  ]);

  const suggestionContent = computed(() => {
    if (!currentRow.value) {
      return { sections: [{ title: 'AI 土壤改良建议', paragraph: '请在下方列表中选择一个地块以查看建议。' }] };
    }
    const suggestions = {
        '贫瘠': [
            '基础改良：施用腐熟有机肥 3000-4000 kg/亩，深耕 30-40cm。',
            '养分补充：补充缓释氮肥 15kg/亩，磷肥 8kg/亩，钾肥 12kg/亩。',
            '结构优化：种植绿肥（如紫云英）一季后翻压还田，增加土壤孔隙度。',
        ],
        '较差': [
            '基础改良：施用腐熟有机肥 2000-3000 kg/亩。',
            '养分补充：根据作物需求补充氮磷钾肥。',
        ],
        '中等': ['维持当前施肥方案，增施少量有机肥。'],
        '良好': ['保持现有耕作习惯，定期监测土壤养分。'],
        '优': ['土壤状况极佳，无需特别干预。']
    };

    return {
      sections: [
        {
          title: `地块：${currentRow.value.region}`,
          list: [
            `问题诊断：有机质含量${currentRow.value.level === '贫瘠' || currentRow.value.level === '较差' ? '偏低' : '正常'} (${currentRow.value.organicMatter})，氮磷钾养分需调整。`,
          ]
        },
        {
          title: '改良方案',
          list: suggestions[currentRow.value.level] || ['暂无具体建议。']
        },
        {
          title: '预期效果',
          paragraph: `1-2年内有机质提升至 ${(parseFloat(currentRow.value.organicMatter) * 1.5).toFixed(1)}%，作物产量提升 10-15%。`
        }
      ]
    }
  });

  const tableData = ref([
    { id: 1, region: '历下区', plotId: 'A-01', level: '贫瘠', organicMatter: '0.8%', nitrogen: '55', phosphorus: '12', potassium: '110' },
    { id: 2, region: '市南区', plotId: 'B-02', level: '较差', organicMatter: '1.5%', nitrogen: '70', phosphorus: '25', potassium: '150' },
    { id: 3, region: '张店区', plotId: 'C-03', level: '中等', organicMatter: '3.2%', nitrogen: '95', phosphorus: '40', potassium: '220' },
    { id: 4, region: '市中区', plotId: 'D-04', level: '良好', organicMatter: '4.5%', nitrogen: '120', phosphorus: '55', potassium: '280' },
    { id: 5, region: '东营区', plotId: 'E-05', level: '较差', organicMatter: '2.1%', nitrogen: '80', phosphorus: '30', potassium: '180' },
  ]);

  const filteredTableData = computed(() => {
    // Filtering logic can be re-enabled here if needed
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


  return {
    processedPlots,
    filters,
    filterFields,
    filteredTableData,
    handleCurrentChange,
    suggestionContent,
    currentRow,
  };
}
