import { ref, computed } from 'vue';
import shandongPlots from '@/mock/shandong-plots.json';

// Mock data specific to land degradation analysis
const tableData = shandongPlots.features.map(f => ({
  plot: f.properties.name,
  crop: ['玉米', '棉花', '大豆'][Math.floor(Math.random() * 3)],
  degradationLevel: ['轻微', '中度', '严重'][Math.floor(Math.random() * 3)],
  organicMatter: (Math.random() * 10 + 5).toFixed(2),
  ph: (Math.random() * 2 + 5.5).toFixed(2),
  salinity: (Math.random() * 1.5).toFixed(2),
  mainReason: ['过度耕作', '水土流失', '盐碱化'][Math.floor(Math.random() * 3)],
  // Include plot id for linking
  plotId: f.properties.id,
}));

const filterFields = [
  { id: 'plot', name: '地块', type: 'select', options: tableData.map(d => d.plot) },
  { id: 'degradationLevel', name: '退化等级', type: 'select', options: ['轻微', '中度', '严重'] }
];

export function useLandDegradationData(mapRef, tableRef) {
  const filters = ref({
    plot: null,
    degradationLevel: null,
  });

  const filteredTableData = computed(() => {
    return tableData.filter(item => {
      const plotMatch = !filters.value.plot || item.plot === filters.value.plot;
      const levelMatch = !filters.value.degradationLevel || item.degradationLevel === filters.value.degradationLevel;
      return plotMatch && levelMatch;
    });
  });
  
  const processedPlots = computed(() => {
    return {
      ...shandongPlots,
      features: shandongPlots.features.map(feature => {
        const plotData = filteredTableData.value.find(d => d.plotId === feature.properties.id);
        return {
          ...feature,
          properties: {
            ...feature.properties,
            ...plotData
          }
        };
      })
    };
  });

  const handleCurrentChange = (row) => {
    if (!row || !mapRef.value) return;
    // Potentially flyTo map on row change in the future
  };
  
  const aiAnalysisContent = computed(() => {
    // Simulate AI analysis based on the entirety of the data
    const highRiskPlots = tableData.filter(p => p.degradationLevel === '严重');
    const moderateRiskPlots = tableData.filter(p => p.degradationLevel === '中度');
    const mainReasonCounts = tableData.reduce((acc, plot) => {
      acc[plot.mainReason] = (acc[plot.mainReason] || 0) + 1;
      return acc;
    }, {});
    const mostCommonReason = Object.keys(mainReasonCounts).reduce((a, b) => mainReasonCounts[a] > mainReasonCounts[b] ? a : b, '');

    return {
      sections: [
        {
          title: 'AI 综合诊断',
          list: [
            `发现 ${highRiskPlots.length} 块地块存在'严重'退化风险，主要集中在北部区域。`,
            `共 ${moderateRiskPlots.length} 块地块存在'中度'退化风险，需关注其有机质含量变化。`,
            `当前农场主要的退化原因是'${mostCommonReason}'，占比 ${(mainReasonCounts[mostCommonReason] / tableData.length * 100).toFixed(1)}%。`
          ]
        },
        {
          title: '智能决策建议',
          list: [
            "针对'严重'退化地块，建议立即实施休耕或种植绿肥作物（如苜蓿、三叶草）以恢复土壤有机质。",
            "针对'水土流失'严重的地块，建议修建等高线梯田或增加植被覆盖率。",
            "建议对所有'中度'及以上退化地块进行土壤样本深度分析，以制定精准的改良方案。",
            "引入免耕或少耕技术，以减少土壤扰动，保护土壤结构。"
          ]
        }
      ]
    };
  });

  return {
    processedPlots,
    filters,
    filterFields,
    filteredTableData,
    handleCurrentChange,
    aiAnalysisContent
  };
}
