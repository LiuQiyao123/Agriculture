import { ref, computed, watch } from 'vue';
import shandongPlots from '@/mock/shandong-plots.json';

function generateComprehensiveSoilAdvice(plotData) {
  const { plotId, ph, organicMatter, nitrogen, phosphorus, potassium, overallHealth } = plotData;

  const healthModel = {
    scores: {
      ph: {
        score: (ph > 6.0 && ph < 8.0) ? 1.0 : 0.4,
        reasoning: (ph > 6.0 && ph < 8.0) ? `pH值(${ph})适中。` : `pH值(${ph})异常，影响养分吸收。`
      },
      organicMatter: {
        score: parseFloat(organicMatter) >= 2.0 ? 1.0 : 0.5,
        reasoning: parseFloat(organicMatter) >= 2.0 ? `有机质(${organicMatter})含量充足。` : `有机质(${organicMatter})偏低，土壤肥力不足。`
      },
      nutrients: {
        score: parseFloat(nitrogen) > 100 && parseFloat(phosphorus) > 40 && parseFloat(potassium) > 120 ? 1.0 : 0.6,
        reasoning: parseFloat(nitrogen) > 100 ? '主要养分含量正常。' : '速效氮(${nitrogen})偏低。'
      },
      structure: { // Placeholder for soil structure
        score: 0.8,
        reasoning: '土壤结构基本良好。'
      }
    },
    compositeScore: 0,
  };
  healthModel.compositeScore = (healthModel.scores.ph.score * 0.3 + healthModel.scores.organicMatter.score * 0.4 + healthModel.scores.nutrients.score * 0.3) * 100;

  const diagnosis = {
    kpis: {
      ph: { value: parseFloat(ph), trend: 0.1, optimal: 7.0, status: healthModel.scores.ph.score > 0.5 ? '正常' : '异常' },
      organicMatter: { value: parseFloat(organicMatter), trend: -0.1, optimal: 2.5, status: healthModel.scores.organicMatter.score > 0.5 ? '充足' : '偏低' },
      nitrogen: { value: parseFloat(nitrogen), trend: 5, optimal: 120, status: healthModel.scores.nutrients.score > 0.5 ? '充足' : '偏低' },
    },
    summary: '',
    risks: [],
  };

  if (healthModel.scores.ph.score < 1.0) diagnosis.risks.push(`[酸碱失衡] ${healthModel.scores.ph.reasoning}`);
  if (healthModel.scores.organicMatter.score < 1.0) diagnosis.risks.push(`[地力不足] ${healthModel.scores.organicMatter.reasoning}`);
  if (healthModel.scores.nutrients.score < 1.0) diagnosis.risks.push(`[养分缺乏] ${healthModel.scores.nutrients.reasoning}`);
  
  diagnosis.summary = `AI土壤健康综合指数评定为 ${healthModel.compositeScore.toFixed(0)} 分。`;
  if(diagnosis.risks.length > 0) {
    diagnosis.summary += `当前主要诊断出 ${diagnosis.risks.length} 个潜在风险。`;
  } else {
    diagnosis.summary += `土壤健康状况良好。`;
  }

  let improvementTask = null;
  if (diagnosis.risks.length > 0) {
    improvementTask = {
      method: '精准改良',
      materials: [],
      amount: '视具体情况而定'
    };
    if (healthModel.scores.ph.score < 1.0) improvementTask.materials.push('石灰/石膏');
    if (healthModel.scores.organicMatter.score < 1.0) improvementTask.materials.push('有机肥');
    if (healthModel.scores.nutrients.score < 1.0) improvementTask.materials.push('平衡复合肥');
  }

  const advice = {
    overview: {
      plotId: plotId,
      targetCrop: `地块 (${overallHealth})`,
      coreTask: diagnosis.risks.length > 0 ? '土壤健康改良' : '维持地力',
      executionWindow: '下一轮种植前',
      priority: overallHealth === '较差' ? '高' : (overallHealth === '中等' ? '中' : '低'),
    },
    improvementTask,
    decisionBasis: diagnosis.risks,
    costBenefit: {
      estimatedCost: (improvementTask ? improvementTask.materials.length * 150 : 20).toFixed(2), // Simplified cost
      expectedBenefits: '预计改良后，作物产量潜力提升8%-15%，化肥利用率提高10%。',
    }
  };

  return { diagnosis, advice, healthModel };
}

// 定义模拟的土壤健康诊断表格数据
const tableData = ref([
  {
    plotId: '地块A01',
    ph: '6.8',
    organicMatter: '2.5%',
    nitrogen: '120 mg/kg',
    phosphorus: '55 mg/kg',
    potassium: '150 mg/kg',
    overallHealth: '良好',
  },
  {
    plotId: '地块B02',
    ph: '5.9',
    organicMatter: '1.8%',
    nitrogen: '85 mg/kg',
    phosphorus: '30 mg/kg',
    potassium: '110 mg/kg',
    overallHealth: '中等',
  },
  {
    plotId: '地块C03',
    ph: '7.5',
    organicMatter: '1.5%',
    nitrogen: '70 mg/kg',
    phosphorus: '25 mg/kg',
    potassium: '95 mg/kg',
    overallHealth: '较差',
  },
  {
    plotId: '地块D04',
    ph: '6.5',
    organicMatter: '2.8%',
    nitrogen: '135 mg/kg',
    phosphorus: '60 mg/kg',
    potassium: '160 mg/kg',
    overallHealth: '良好',
  },
  {
    plotId: '地块E05',
    ph: '6.2',
    organicMatter: '2.1%',
    nitrogen: '105 mg/kg',
    phosphorus: '45 mg/kg',
    potassium: '130 mg/kg',
    overallHealth: '中等',
  },
]);

// 定义筛选字段配置
const filterFields = ref([
  {
    type: 'select',
    label: '健康状况',
    model: 'overallHealth',
    options: ['全部', '良好', '中等', '较差'],
  },
]);


export function useSoilQualityData(baseMapRef, tableRef) {
  const tableData = ref([
    {
      plotId: '地块A01',
      ph: '6.8',
      organicMatter: '2.5%',
      nitrogen: '120 mg/kg',
      phosphorus: '55 mg/kg',
      potassium: '150 mg/kg',
      overallHealth: '良好',
    },
    {
      plotId: '地块B02',
      ph: '5.9',
      organicMatter: '1.8%',
      nitrogen: '85 mg/kg',
      phosphorus: '30 mg/kg',
      potassium: '110 mg/kg',
      overallHealth: '中等',
    },
    {
      plotId: '地块C03',
      ph: '7.5',
      organicMatter: '1.5%',
      nitrogen: '70 mg/kg',
      phosphorus: '25 mg/kg',
      potassium: '95 mg/kg',
      overallHealth: '较差',
    },
    {
      plotId: '地块D04',
      ph: '6.5',
      organicMatter: '2.8%',
      nitrogen: '135 mg/kg',
      phosphorus: '60 mg/kg',
      potassium: '160 mg/kg',
      overallHealth: '良好',
    },
    {
      plotId: '地块E05',
      ph: '6.2',
      organicMatter: '2.1%',
      nitrogen: '105 mg/kg',
      phosphorus: '45 mg/kg',
      potassium: '130 mg/kg',
      overallHealth: '中等',
    },
  ].map(item => {
    const comprehensiveData = generateComprehensiveSoilAdvice(item);
    return {
      ...item,
      comprehensiveData,
      healthModel: comprehensiveData.healthModel,
    }
  }));
  
  const currentRow = ref(null); // Initialize with null

  const handleCurrentChange = (row) => {
    if (row) {
      currentRow.value = row;
       if (baseMapRef.value) {
        const plotFeature = processedPlots.value.features.find(f => f.properties.plotId === row.plotId);
        if (plotFeature && plotFeature.properties.center) {
          baseMapRef.value.flyTo({ center: plotFeature.properties.center, zoom: 14 });
        }
      }
    }
  };
  
  const diagnosisContent = computed(() => currentRow.value?.comprehensiveData?.diagnosis);
  const suggestionContent = computed(() => currentRow.value?.comprehensiveData?.advice);

  // 将土壤数据与地块的地理信息数据进行合并处理
  const processedPlots = computed(() => {
    const healthStatus = ['良好', '中等', '较差'];
    return {
      type: 'FeatureCollection',
      features: shandongPlots.features.map(feature => {
        const plotData = tableData.value.find(d => d.plotId.includes(feature.properties.id.slice(-2))) || {};
        return {
          ...feature,
          properties: {
            ...feature.properties,
            ...plotData,
            overallHealth: plotData.overallHealth || healthStatus[Math.floor(Math.random() * healthStatus.length)],
          },
        }
      }),
    };
  });

  // 雷达图的配置选项 (改为依赖currentRow)
  const healthRadarChartOptions = computed(() => {
    if (!currentRow.value) return {};
    const scores = currentRow.value.healthModel.scores;
    const scoreValues = [
        scores.ph.score * 100, 
        scores.organicMatter.score * 100, 
        scores.nutrients.score * 100, 
        scores.structure.score * 100
    ];

    return {
      radar: {
        indicator: [
          { name: '酸碱平衡', max: 100 },
          { name: '有机质含量', max: 100 },
          { name: '养分状况', max: 100 },
          { name: '土壤结构', max: 100 },
        ],
        axisName: { color: '#fff', fontSize: 12 }
      },
      series: [
        {
          name: '土壤健康评估',
          type: 'radar',
          data: [
            {
              value: scoreValues,
              name: `地块 ${currentRow.value.plotId}`,
              areaStyle: { color: 'rgba(0, 221, 255, 0.4)' },
              lineStyle: { color: '#00DDFF' },
              itemStyle: { color: '#00DDFF' }
            }
          ]
        }
      ]
    };
  });
  
  const soilPropertyTrendOptions = computed(() => {
    if (!currentRow.value) return { series: [] };
    return { /* ... trend chart config ... */ };
  });

  // Set initial row after table is mounted
  watch(tableRef, (newTableRef) => {
    if (newTableRef && tableData.value.length > 0) {
      const firstRow = tableData.value[0];
      // The table component itself will highlight the row
      newTableRef.setCurrentRow(firstRow);
      // Manually trigger the handler to update state and map
      handleCurrentChange(firstRow);
    }
  }, { once: true });

  return {
    tableData,
    filterFields,
    processedPlots,
    handleCurrentChange,
    currentRow,
    diagnosisContent,
    suggestionContent,
    healthRadarChartOptions,
    soilPropertyTrendOptions,
  };
}
