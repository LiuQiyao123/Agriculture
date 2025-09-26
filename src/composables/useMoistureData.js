import { ref, computed, watch } from 'vue';
import shandongPlots from '@/mock/shandong-plots.json';

function generateComprehensiveMoistureAdvice(plotData) {
  const { plotId, moistureLevel, optimalRange, timestamp, alertLevel } = plotData;

  const healthModel = {
    scores: {
      moisture: {
        score: alertLevel === '适中' ? 1.0 : (alertLevel === '轻度干旱' || alertLevel === '过湿' ? 0.6 : 0.2),
        reasoning: `墒情: ${alertLevel}`
      },
      cropRequirement: { score: 0.8, reasoning: '当前处于需水关键期。' },
      forecast: { score: 0.7, reasoning: '未来3天无有效降雨。' },
    },
    compositeScore: 0,
  };
  healthModel.compositeScore = (healthModel.scores.moisture.score * 0.7 + healthModel.scores.cropRequirement.score * 0.2 + healthModel.scores.forecast.score * 0.1) * 100;

  const diagnosis = {
    kpis: {
      moisture: { value: parseFloat(moistureLevel), trend: -5, optimal: 65, status: alertLevel },
    },
    summary: '',
    risks: [],
  };

  if (alertLevel !== '适中') {
    diagnosis.risks.push(`[${alertLevel}] ${alertLevel === '过湿' ? '土壤含水量饱和，可能导致作物根系缺氧' : '土壤缺水，已影响作物根系吸收水分和养分'}`);
  }
  diagnosis.summary = `AI墒情健康综合指数评定为 ${healthModel.compositeScore.toFixed(0)} 分。当前诊断结果为“${alertLevel}”。`;
  
  let irrigationTask = null;
  if (alertLevel.includes('干旱')) {
    irrigationTask = { 
      type: '紧急灌溉',
      detail: alertLevel === '中度干旱' ? '立即启动大水量灌溉（如漫灌或滴灌）' : '在未来24小时内进行一次补充灌溉'
    };
  } else if (alertLevel === '过湿') {
    irrigationTask = { type: '紧急排水', detail: '立即检查并疏通田间排水系统，必要时进行人工开沟排水。' };
  }

  const advice = {
    overview: {
      plotId,
      targetCrop: '当前作物',
      coreTask: alertLevel !== '适中' ? `解决“${alertLevel}”问题` : '维持最佳墒情',
      executionWindow: alertLevel !== '适中' ? '立即执行' : '按计划管理',
      priority: alertLevel.includes('中度') ? '高' : (alertLevel !== '适中' ? '中' : '低'),
    },
    irrigationTask,
    decisionBasis: diagnosis.risks,
    costBenefit: {
      estimatedCost: (irrigationTask ? 80 : 10).toFixed(2),
      expectedBenefits: irrigationTask ? '预计避免产量损失10%-15%。' : '维持根系健康，提升养分吸收效率。',
    }
  };

  return { diagnosis, advice, healthModel };
}

export function useMoistureData(baseMapRef, tableRef) {
  const tableData = ref([
    { plotId: '地块A01', moistureLevel: '72%', optimalRange: '60-80%', timestamp: '2025-09-22 10:00', alertLevel: '适中' },
    { plotId: '地块B02', moistureLevel: '55%', optimalRange: '60-80%', timestamp: '2025-09-22 11:30', alertLevel: '轻度干旱' },
    { plotId: '地块C03', moistureLevel: '45%', optimalRange: '60-80%', timestamp: '2025-09-22 09:45', alertLevel: '中度干旱' },
    { plotId: '地块D04', moistureLevel: '88%', optimalRange: '60-80%', timestamp: '2025-09-22 14:00', alertLevel: '过湿' },
    { plotId: '地块E05', moistureLevel: '68%', optimalRange: '60-80%', timestamp: '2025-09-22 12:10', alertLevel: '适中' },
  ].map(item => ({ ...item, ...generateComprehensiveMoistureAdvice(item) })));
  
  const currentRow = ref(null);
  const filters = ref({ alertLevel: '' });
  const filterFields = ref([
    { type: 'select', label: '预警等级', model: 'alertLevel', options: ['全部', '适中', '轻度干旱', '中度干旱', '过湿'] },
  ]);

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
  
  const diagnosisContent = computed(() => currentRow.value?.diagnosis);
  const suggestionContent = computed(() => currentRow.value?.advice);

  const processedPlots = computed(() => {
    return {
      type: 'FeatureCollection',
      features: shandongPlots.features.map(feature => {
        const plotData = tableData.value.find(d => d.plotId.includes(feature.properties.id.slice(-2))) || {};
        return { ...feature, properties: { ...feature.properties, ...plotData } };
      }),
    };
  });
  
  watch(tableRef, (newTableRef) => {
    if (newTableRef && tableData.value.length > 0) {
      const firstRow = tableData.value[0];
      newTableRef.setCurrentRow(firstRow);
      handleCurrentChange(firstRow);
    }
  }, { once: true });
  
  const moisturePieChartOptions = computed(() => {
    const statusCounts = tableData.value.reduce((acc, item) => {
      acc[item.alertLevel] = (acc[item.alertLevel] || 0) + 1;
      return acc;
    }, {});
    const chartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    return {
      title: { text: '土壤墒情预警等级分布', left: 'center', textStyle: { color: '#fff' }},
      tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' },
      legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: { color: '#fff' }
      },
      series: [{
          name: '预警等级',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: chartData,
          emphasis: {
              itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
          },
          label: {
              color: '#fff'
          }
      }]
    };
  });

  return {
    tableData, filterFields, filters, processedPlots,
    handleCurrentChange, currentRow, diagnosisContent, suggestionContent,
    moisturePieChartOptions,
  };
}
