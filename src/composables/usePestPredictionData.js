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

export function usePestPredictionData(gisMapRef, tableRef) {
  const currentRow = ref(null);

  const processedPlots = computed(() => {
    return getProcessedGeoJSON(originalPlots, 'pest-disease');
  });

  const filters = ref({
    riskLevel: '',
    pestType: '',
  });

  const filterFields = ref([
    {
      type: 'select',
      model: 'riskLevel',
      label: '风险等级',
      placeholder: '请选择等级',
      options: [
        { label: '高', value: '高' },
        { label: '中', value: '中' },
        { label: '低', value: '低' },
      ],
    },
    {
      type: 'input',
      model: 'pestType',
      label: '害虫种类',
      placeholder: '请输入害虫名称',
    },
  ]);

  const suggestionContent = computed(() => {
    if (!currentRow.value) {
      return { metrics: [], sections: [{ title: 'AI 精准防治方案', paragraph: '请在下方列表中选择一个地块以查看建议。' }] };
    }
    
    const suggestions = {
        '高': [
            '生物防治：于傍晚释放赤眼蜂，每亩 1.5万 - 2万头。',
            '物理防治：安装杀虫灯，每 30-50 亩一盏。',
            '化学防治：若虫口密度超过阈值，使用 5% 甲维盐水分散粒剂 2000-3000 倍液喷雾。',
        ],
        '中': [
            '生物防治：释放天敌，如瓢虫、草蛉等。',
            '物理防治：黄板诱杀，每亩 20-30 块。',
        ],
        '低': ['加强田间监测，暂不需特殊防治。']
    };

    return {
      metrics: [
        { label: '发生概率', value: `${currentRow.value.riskLevel === '高' ? '85' : currentRow.value.riskLevel === '中' ? '60' : '30'}%`, class: 'danger' },
        { label: '防治窗口', value: '10-28 至 11-03' }
      ],
      sections: [
        {
          title: `地块：${currentRow.value.region} (${currentRow.value.pestType})`,
          list: suggestions[currentRow.value.riskLevel] || ['暂无具体建议。']
        },
        {
          title: '注意事项',
          paragraph: '避免在高温时段施药，注意个人防护。'
        }
      ]
    }
  });

  const tableData = ref([
    { id: 1, region: '历下区', plotId: 'A-01', pestType: '玉米螟', riskLevel: '高', prediction: '7天后进入高发期', area: '150亩' },
    { id: 2, region: '市南区', plotId: 'B-02', pestType: '稻飞虱', riskLevel: '中', prediction: '10天后可能爆发', area: '320亩' },
    { id: 3, region: '张店区', plotId: 'C-03', pestType: '棉铃虫', riskLevel: '低', prediction: '无明显爆发迹象', area: '500亩' },
    { id: 4, region: '市中区', plotId: 'D-04', pestType: '蚜虫', riskLevel: '高', prediction: '5天后密度将达防治阈值', area: '80亩' },
    { id: 5, region: '东营区', plotId: 'E-05', pestType: '红蜘蛛', riskLevel: '中', prediction: '环境湿度降低，利于其繁殖', area: '240亩' },
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
