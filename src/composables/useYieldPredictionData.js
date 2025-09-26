import { ref, computed, watch } from 'vue';
import shandongPlots from '@/mock/shandong-plots.json';

function generateComprehensiveYieldAdvice(plotData) {
  const { plotId, cropType, predictedYield, confidence, harvestDate, status } = plotData;

  const healthModel = {
    scores: {
      growth: {
        score: status === '长势良好' ? 1.0 : 0.6,
        reasoning: status === '长势良好' ? '作物当前长势良好。' : `存在风险: ${status}`
      },
      climate: {
        score: 0.8,
        reasoning: '近期气象条件适宜。'
      },
      soil: {
        score: 0.9,
        reasoning: '土壤基础地力良好。'
      },
      management: {
        score: 0.7,
        reasoning: '田间管理水平中等。'
      }
    },
    compositeScore: 0,
  };
  healthModel.compositeScore = (healthModel.scores.growth.score * 0.5 + healthModel.scores.climate.score * 0.2 + healthModel.scores.soil.score * 0.2 + healthModel.scores.management.score * 0.1) * 100;
  
  const diagnosis = {
    kpis: {
      yield: { value: parseFloat(predictedYield), trend: 0.5, optimal: 12.0, status: parseFloat(predictedYield) > 10 ? '高产' : '中产' },
      confidence: { value: parseFloat(confidence), trend: 0.05, optimal: 0.95, status: '高' },
    },
    summary: '',
    risks: [],
  };

  if (status !== '长势良好') {
    diagnosis.risks.push(`[${status}] 这是影响最终产量的主要限制性因素。`);
  }
  diagnosis.summary = `AI产量预测模型综合评定指数为 ${healthModel.compositeScore.toFixed(0)} 分。预计产量为 ${predictedYield}，模型置信度为 ${confidence}。`;
  if (diagnosis.risks.length === 0) {
    diagnosis.summary += ' 当前作物状态健康，预计可达预期产量。';
  }

  let agronomyTask = null;
  if (status === '存在干旱风险') {
    agronomyTask = { type: '灌溉', detail: '建议立即进行一次补水灌溉，确保作物在产量形成关键期有充足水分。' };
  } else if (status === '病虫害预警') {
    agronomyTask = { type: '植保', detail: '请立即启动精准施药程序，使用无人机对目标区域喷洒对应农药，防止病害扩散。' };
  }

  const advice = {
    overview: {
      plotId: plotId,
      targetCrop: cropType,
      coreTask: status !== '长势良好' ? `应对“${status}”` : '稳产增收',
      executionWindow: '未来3-5天内',
      priority: status !== '长势良好' ? '高' : '中',
    },
    agronomyTask,
    decisionBasis: diagnosis.risks,
    costBenefit: {
      estimatedCost: (agronomyTask ? 120 : 50).toFixed(2),
      expectedBenefits: agronomyTask ? '预计挽回产量损失5%-8%。' : '预计产量稳定，品质提升3%。',
    }
  };

  return { diagnosis, advice, healthModel };
}


export function useYieldPredictionData(baseMapRef, tableRef) {
  const tableData = ref([
    { plotId: '地块A01', cropType: '玉米', predictedYield: '11.5 吨/公顷', confidence: '95%', harvestDate: '2025-10-15', status: '长势良好' },
    { plotId: '地块B02', cropType: '玉米', predictedYield: '9.8 吨/公顷', confidence: '92%', harvestDate: '2025-10-20', status: '存在干旱风险' },
    { plotId: '地块C03', cropType: '大豆', predictedYield: '4.2 吨/公顷', confidence: '90%', harvestDate: '2025-09-30', status: '病虫害预警' },
    { plotId: '地块D04', cropType: '玉米', predictedYield: '12.1 吨/公顷', confidence: '96%', harvestDate: '2025-10-18', status: '长势良好' },
    { plotId: '地块E05', cropType: '大豆', predictedYield: '4.5 吨/公顷', confidence: '94%', harvestDate: '2025-10-05', status: '长势良好' },
  ].map(item => {
    const comprehensiveData = generateComprehensiveYieldAdvice(item);
    return { ...item, comprehensiveData, healthModel: comprehensiveData.healthModel };
  }));

  const currentRow = ref(null);
  const filters = ref({ cropType: '', status: '' });
  const filterFields = ref([
      { type: 'select', label: '作物类型', model: 'cropType', options: ['全部', '玉米', '大豆'] },
      { type: 'select', label: '状态', model: 'status', options: ['全部', '长势良好', '存在干旱风险', '病虫害预警'] },
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
  
  const diagnosisContent = computed(() => currentRow.value?.comprehensiveData?.diagnosis);
  const suggestionContent = computed(() => currentRow.value?.comprehensiveData?.advice);

  const processedPlots = computed(() => {
    return {
      type: 'FeatureCollection',
      features: shandongPlots.features.map(feature => {
        const plotData = tableData.value.find(d => d.plotId.includes(feature.properties.id.slice(-2))) || {};
        return {
          ...feature,
          properties: { ...feature.properties, ...plotData },
        }
      }),
    };
  });
  
  const yieldBarChartOptions = computed(() => {
    const sortedData = [...tableData.value].sort((a, b) => parseFloat(b.predictedYield) - parseFloat(a.predictedYield));
    return {
      title: { text: '各地块产量预测对比', left: 'center', textStyle: { color: '#fff' }},
      tooltip: { 
        trigger: 'axis', 
        axisPointer: { type: 'shadow' }
      },
      legend: {
        show: true,
        bottom: 10,
        textStyle: {
            color: '#fff'
        }
      },
      grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
      xAxis: { 
        type: 'value', 
        boundaryGap: [0, 0.01], 
        axisLabel: { color: '#fff' },
        splitLine: { show: false }
      },
      yAxis: { 
        type: 'category', 
        data: sortedData.map(d => d.plotId), 
        axisLabel: { color: '#fff' }
      },
      series: [{
          name: '预测产量(吨/公顷)',
          type: 'bar',
          data: sortedData.map(d => parseFloat(d.predictedYield)),
          label: { show: true, position: 'right', color: '#fff', formatter: '{c} 吨' },
          itemStyle: {
            color: '#5470c6'
          }
      }]
    };
  });

  const yieldTrendChartOptions = computed(() => {
     if (!currentRow.value) return {};
     const baseYield = parseFloat(currentRow.value.predictedYield);
     const trendData = Array.from({ length: 5 }, (_, i) => (baseYield - (4-i) * (Math.random()*0.5)).toFixed(1));
     trendData.push(baseYield);
     return {
        title: {
            text: `${currentRow.value.plotId} 产量趋势`,
            left: 'center',
            textStyle: { color: '#fff', fontSize: 16 }
        },
        tooltip: {
            trigger: 'axis'
        },
        grid: { top: 50, right: 30, bottom: 40, left: 50 },
        xAxis: {
            type: 'category',
            data: ['-5周', '-4周', '-3周', '-2周', '-1周', '当前'],
            axisLabel: { color: '#ccc' },
            boundaryGap: false,
        },
        yAxis: {
            type: 'value',
            name: '吨/公顷',
            axisLabel: { color: '#ccc' },
            splitLine: { lineStyle: { type: 'dashed', color: '#444' } },
        },
        series: [{
            name: '产量预测',
            type: 'line',
            smooth: true,
            data: trendData,
            itemStyle: { color: '#00c851' },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [{
                        offset: 0, color: 'rgba(0, 200, 81, 0.5)'
                    }, {
                        offset: 1, color: 'rgba(0, 200, 81, 0)'
                    }]
                }
            }
        }]
     };
  });

  // Set initial row after table is mounted
  watch(tableRef, (newTableRef) => {
    if (newTableRef && tableData.value.length > 0) {
      const firstRow = tableData.value[0];
      newTableRef.setCurrentRow(firstRow);
      handleCurrentChange(firstRow);
    }
  }, { once: true });


  return {
    tableData,
    filterFields,
    filters,
    processedPlots,
    handleCurrentChange,
    currentRow,
    diagnosisContent,
    suggestionContent,
    yieldBarChartOptions,
    yieldTrendChartOptions,
  };
}
