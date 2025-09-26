import { ref, computed, watch } from 'vue';
import shandongPlots from '@/mock/shandong-plots.json';

function generateComprehensivePestAdvice(plotData) {
  const { plotId, pestType, probability, riskLevel, monitoringTime } = plotData;

  const healthModel = {
    scores: {
      pest: {
        score: riskLevel === '高风险' ? 0.2 : riskLevel === '中风险' ? 0.5 : 1.0,
        reasoning: `主要风险: ${pestType}(${riskLevel})`
      },
      environment: { score: 0.7, reasoning: '环境湿度偏高，利于病害。' },
      cropResilience: { score: 0.8, reasoning: '作物品种抗性较好。' },
      prevention: { score: 0.6, reasoning: '历史防治措施一般。' }
    },
    compositeScore: 0,
  };
  healthModel.compositeScore = (healthModel.scores.pest.score * 0.6 + healthModel.scores.environment.score * 0.2 + healthModel.scores.cropResilience.score * 0.1 + healthModel.scores.prevention.score * 0.1) * 100;

  const diagnosis = {
    kpis: {
      riskLevel: { value: { '高风险': 3, '中风险': 2, '低风险': 1 }[riskLevel], trend: 0.5, optimal: 1, status: riskLevel },
      probability: { value: parseFloat(probability), trend: 0.1, optimal: 0, status: '关注' },
    },
    summary: ``,
    risks: [],
  };

  if (riskLevel !== '低风险') {
    diagnosis.risks.push(`[${riskLevel}] 已达到防治指标，如不干预，预计在3-5天内会大面积爆发。`);
  }
  diagnosis.summary = `AI病虫害风险综合指数评定为 ${healthModel.compositeScore.toFixed(0)} 分。当前主要风险为“${pestType}”，等级“${riskLevel}”。`;

  let controlTask = null;
  if (riskLevel !== '低风险') {
    controlTask = {
      type: riskLevel === '高风险' ? '紧急防治' : '预防性防治',
      method: '无人机精准喷洒',
      pesticide: pestType === '稻瘟病' ? '三环唑' : (pestType === '玉米螟' ? '甲维盐' : '通用杀菌剂'),
    };
  }

  const advice = {
    overview: {
      plotId,
      targetCrop: pestType,
      coreTask: riskLevel !== '低风险' ? `控制 ${pestType}` : '维持低风险状态',
      executionWindow: riskLevel === '高风险' ? '立即执行' : '未来3天内',
      priority: riskLevel,
    },
    controlTask,
    decisionBasis: diagnosis.risks,
    costBenefit: {
      estimatedCost: (controlTask ? 180 : 30).toFixed(2),
      expectedBenefits: controlTask ? '预计挽回产量损失10%-20%。' : '维持健康生长，降低未来防治成本。',
    }
  };

  return { diagnosis, advice, healthModel };
}

export function usePestPredictionData(baseMapRef, tableRef) {
  const tableData = ref([
    { plotId: '地块A01', pestType: '稻瘟病', riskLevel: '高风险', probability: '85%', monitoringTime: '2025-09-22 10:00' },
    { plotId: '地块B02', pestType: '玉米螟', riskLevel: '中风险', probability: '60%', monitoringTime: '2025-09-22 11:30' },
    { plotId: '地块C03', pestType: '白粉病', riskLevel: '低风险', probability: '25%', monitoringTime: '2025-09-22 09:45' },
    { plotId: '地块D04', pestType: '稻瘟病', riskLevel: '中风险', probability: '55%', monitoringTime: '2025-09-22 14:00' },
    { plotId: '地块E05', pestType: '锈病', riskLevel: '低风险', probability: '20%', monitoringTime: '2025-09-22 12:10' },
  ].map(item => ({ ...item, ...generateComprehensivePestAdvice(item) })));
  
  const currentRow = ref(null);
  const filters = ref({ riskLevel: '', pestType: '' });
  const filterFields = ref([
      { type: 'select', label: '风险等级', model: 'riskLevel', options: ['全部', '高风险', '中风险', '低风险'] },
      { type: 'select', label: '病虫害类型', model: 'pestType', options: ['全部', '稻瘟病', '玉米螟', '白粉病', '锈病'] },
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

  const riskPieChartOptions = computed(() => {
    const riskCounts = tableData.value.reduce((acc, item) => {
      acc[item.riskLevel] = (acc[item.riskLevel] || 0) + 1;
      return acc;
    }, {});
    const chartData = Object.entries(riskCounts).map(([name, value]) => ({ name, value }));
    return {
        title: { text: '病虫害风险等级分布', left: 'center', textStyle: { color: '#fff' }},
        tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' },
        legend: {
            orient: 'vertical',
            left: 'left',
            top: 'middle',
            textStyle: { color: '#fff' }
        },
        series: [{ 
            name: '风险等级',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['65%', '50%'],
            avoidLabelOverlap: false,
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '20',
                    fontWeight: 'bold',
                    color: '#fff'
                }
            },
            labelLine: {
                show: false
            },
            data: chartData,
            itemStyle: {
              borderColor: '#1e243b',
              borderWidth: 2
            }
        }]
    };
  });
  
  const pestTypeBarChartOptions = computed(() => {
    const typeCounts = tableData.value.reduce((acc, item) => {
      acc[item.pestType] = (acc[item.pestType] || 0) + 1;
      return acc;
    }, {});
    return {
        title: { text: '主要病虫害类型分布', left: 'center', textStyle: { color: '#fff' }},
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { 
            type: 'category', 
            data: Object.keys(typeCounts), 
            axisLabel: { color: '#fff', rotate: 30 },
        },
        yAxis: { 
            type: 'value', 
            axisLabel: { color: '#fff' },
            splitLine: { lineStyle: { color: '#333' } }
        },
        series: [{ 
            name: '地块数量',
            type: 'bar', 
            data: Object.values(typeCounts),
            itemStyle: { color: '#c23531' }
        }]
    };
  });

  return {
    tableData, filterFields, filters, processedPlots,
    handleCurrentChange, currentRow, diagnosisContent, suggestionContent,
    riskPieChartOptions, pestTypeBarChartOptions,
  };
}
