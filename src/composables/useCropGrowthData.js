// src/composables/useCropGrowthData.js
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { getProcessedGeoJSON } from '@/services/MapService.js';
import originalPlots from '@/mock/shandong-plots.json';
import { ElMessage } from 'element-plus';

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

/**
 * V3.0 智能农事建议生成器
 * @param {object} plotData - 地块的原始数据
 * @returns {object} 包含诊断、建议、成本效益等信息的完整数据结构
 */
function generateComprehensiveAdvice(plotData) {
  const { crop, growthStage, soilMoisture, soilTemperature, ndvi, lastNdvi, lai, spad } = plotData;

  // 1. V3.0 作物健康多维评估模型
  const healthModel = {
    scores: {
      moisture: {
        score: soilMoisture < 0.45 ? 0.2 : soilMoisture < 0.6 ? 0.6 : soilMoisture > 0.85 ? 0.8 : 1.0,
        reasoning: soilMoisture < 0.6 ? `土壤湿度(${ (soilMoisture * 100).toFixed(0) }%)偏低，存在干旱胁迫。` : '土壤水分充足。'
      },
      nutrients: {
        score: spad < 45 ? 0.4 : spad < 50 ? 0.7 : 1.0,
        reasoning: spad < 50 ? `叶绿素(SPAD)值(${spad})偏低，可能缺氮。` : '作物营养状况良好。'
      },
      vigor: {
        score: ndvi < 0.7 ? 0.5 : Math.min(1, (ndvi - 0.7) / (0.9 - 0.7) * 0.5 + 0.5),
        reasoning: ndvi < 0.75 ? `植被指数(NDVI)值(${ndvi})有待提升。` : '作物生长活力强劲。'
      },
      environment: {
        score: soilTemperature > 30 ? 0.5 : soilTemperature > 28 ? 0.7 : 1.0,
        reasoning: soilTemperature > 28 ? `土壤温度(${soilTemperature}°C)过高，可能影响根系。` : '环境温度适宜。'
      },
    },
    compositeScore: 0,
  };
  healthModel.compositeScore = (healthModel.scores.moisture.score * 0.4 + healthModel.scores.nutrients.score * 0.3 + healthModel.scores.vigor.score * 0.2 + healthModel.scores.environment.score * 0.1) * 100;
  
  const baseScheme = {
    '玉米': { '拔节期': { water: 25, N: 5, P: 2, K: 3 } },
    '棉花': { '花铃期': { water: 35, N: 4, P: 3, K: 8 } },
    '打瓜': { '开花坐瓜期': { water: 32, N: 2, P: 4, K: 7 } },
    '番茄': { '转色成熟期': { water: 25, N: 1, P: 2, K: 4 } },
  }[crop][growthStage] || { water: 20, N: 3, P: 3, K: 3 };


  // 1. 全息诊断模块数据生成
  const diagnosis = {
    kpis: {
      ndvi: { value: ndvi, trend: ndvi - lastNdvi, optimal: 0.85, status: ndvi > 0.8 ? '优秀' : ndvi > 0.7 ? '良好' : '偏低' },
      lai: { value: lai, trend: lai - 4.2, optimal: 5.0, status: lai > 4.5 ? '优秀' : '正常' },
      spad: { value: spad, trend: spad - 47, optimal: 55, status: spad > 50 ? '优秀' : spad > 45 ? '正常' : '偏低' },
    },
    summary: '',
    risks: [],
  };

  if (healthModel.scores.moisture.score < 0.5) diagnosis.risks.push(`[水分胁迫] 土壤湿度(${soilMoisture * 100}%)严重偏低，作物面临严重干旱胁迫，这是当前最主要的生长限制因子。`);
  else if (healthModel.scores.moisture.score < 0.7) diagnosis.risks.push(`[水分胁迫] 土壤湿度(${soilMoisture * 100}%)已接近适宜范围下限，存在轻度干旱胁迫风险。`);
  
  if (healthModel.scores.nutrients.score < 0.5) diagnosis.risks.push(`[养分胁迫] 叶绿素含量(SPAD)为 ${spad}，显著偏低，表明作物可能存在严重的氮素缺乏，光合作用效率低下。`);
  
  if (healthModel.scores.environment.score < 0.8) diagnosis.risks.push(`[环境胁迫] 土壤温度(${soilTemperature}°C)过高，可能抑制根系活力和养分吸收。`);
  
  diagnosis.summary = `AI综合健康指数评定为 ${healthModel.compositeScore.toFixed(0)} 分。`;
  if(diagnosis.risks.length > 0) {
    diagnosis.summary += `当前主要诊断出 ${diagnosis.risks.length} 个潜在风险，其中“${plotData.primaryRisk}”是首要问题。`;
  } else {
    diagnosis.summary += `各项指标均在健康范围，作物长势良好，请继续保持。`;
  }


  // 2. V3.0 智能决策推理
  let decisionBasis = [];
  let irrigationTask = null;
  let fertilizationTask = null;
  
  // 核心推理逻辑：优先解决生存问题（水），再解决发展问题（肥）
  if (healthModel.scores.moisture.score < 0.7) {
      irrigationTask = {
        rounds: 1,
        suggestedTime: '凌晨 4:00 - 6:00',
        method: '地下滴灌',
        targetVolume: (baseScheme.water * (1.4 - healthModel.scores.moisture.score)).toFixed(1),
        targetMoisture: '70% - 75%',
      };
      decisionBasis.push('【首要任务：灌溉】AI检测到显著的水分胁迫，这是当前限制作物生长的最关键因素。必须优先补充水分以保证作物存活和基础代谢。');

      if (healthModel.scores.nutrients.score < 0.8) {
        decisionBasis.push('【施肥建议：暂缓】虽然作物同样存在养分胁迫，但在严重缺水时施肥，根系无法有效吸收，且可能导致烧根。建议在灌溉完成、土壤湿度恢复正常24小时后，再执行施肥操作。');
      }
  } else {
    // 水分正常，再考虑施肥
     if (healthModel.scores.nutrients.score < 0.8) {
        fertilizationTask = {
          method: '随水滴灌',
          formula: '高钾型水溶肥',
          N: (baseScheme.N * (1.3 - healthModel.scores.nutrients.score)).toFixed(1),
          P: (baseScheme.P * (1.3 - healthModel.scores.nutrients.score)).toFixed(1),
          K: (baseScheme.K * (1.3 - healthModel.scores.nutrients.score)).toFixed(1),
        };
        decisionBasis.push('【核心任务：施肥】在水分适宜的前提下，AI检测到养分胁迫是当前影响作物产量和品质的主要因素，建议立即补充所需肥料。');
     } else {
       decisionBasis.push('【无需干预】AI未检测到显著的水分或养分胁迫，建议维持当前管理策略，定期监测即可。');
     }
  }


  const advice = {
    overview: {
      plotId: plotData.plotId,
      targetCrop: `${crop} (${growthStage})`,
      coreTask: diagnosis.risks.length > 0 ? `解除${plotData.primaryRisk}` : '维持健康生长',
      executionWindow: `未来 ${soilMoisture < 0.45 ? '24' : '48'} 小时内`,
      priority: plotData.decisionPriority,
    },
    irrigationTask,
    fertilizationTask,
    decisionBasis,
    costBenefit: {
      estimatedCost: (irrigationTask ? parseFloat(irrigationTask.targetVolume) * 0.5 : 0 + fertilizationTask ? (parseFloat(fertilizationTask.N) + parseFloat(fertilizationTask.P) + parseFloat(fertilizationTask.K)) * 8 : 0).toFixed(2),
      expectedBenefits: '预计产量提升 3%-5%，因干旱导致的减产风险降低 80%。',
    }
  };

  return { diagnosis, advice, healthModel };
}


export function useCropGrowthData(gisMapRef, tableRef) {
  const currentRow = ref(null);
  const validationChartRef = ref(null);

  const processedPlots = computed(() => {
    return getProcessedGeoJSON(originalPlots, 'ndvi-tiles');
  });

  const diagnosisContent = computed(() => {
    if (!currentRow.value) return null;
    return currentRow.value.comprehensiveData.diagnosis;
  });

  const suggestionContent = computed(() => {
    if (!currentRow.value) return null;
    return currentRow.value.comprehensiveData.advice;
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
    { id: 1, plot: 'A-01', plotId: 'A-01', crop: '玉米', growth: '良好', growthTrend: 0.03, primaryRisk: '无', decisionPriority: '低', ndvi: 0.82, lastNdvi: 0.80, date: '2023-10-26', growthStage: '拔节期', soilMoisture: 0.75, soilTemperature: 24, lai: 4.6, spad: 52 },
    { id: 2, plot: 'B-02', plotId: 'B-02', crop: '棉花', growth: '中等', growthTrend: -0.02, primaryRisk: '环境胁迫', decisionPriority: '中', ndvi: 0.75, lastNdvi: 0.77, date: '2023-10-26', growthStage: '花铃期', soilMoisture: 0.65, soilTemperature: 29, lai: 4.1, spad: 48 },
    { id: 3, plot: 'C-03', plotId: 'C-03', crop: '打瓜', growth: '偏弱', growthTrend: -0.05, primaryRisk: '水分胁迫', decisionPriority: '高', ndvi: 0.68, lastNdvi: 0.72, date: '2023-10-26', growthStage: '开花坐瓜期', soilMoisture: 0.44, soilTemperature: 25, lai: 3.5, spad: 44 },
    { id: 4, plot: 'D-04', plotId: 'D-04', crop: '番茄', growth: '良好', growthTrend: 0.01, primaryRisk: '无', decisionPriority: '低', ndvi: 0.80, lastNdvi: 0.79, date: '2023-10-26', growthStage: '转色成熟期', soilMoisture: 0.81, soilTemperature: 23, lai: 4.8, spad: 55 },
    { id: 5, plot: 'E-05', plotId: 'E-05', crop: '玉米', growth: '中等', growthTrend: -0.01, primaryRisk: '养分胁迫', decisionPriority: '中', ndvi: 0.73, lastNdvi: 0.74, date: '2023-10-26', growthStage: '拔节期', soilMoisture: 0.62, soilTemperature: 26, lai: 4.2, spad: 46 },
    { id: 6, plot: 'F-06', plotId: 'F-06', crop: '棉花', growth: '良好', growthTrend: 0.04, primaryRisk: '无', decisionPriority: '低', ndvi: 0.85, lastNdvi: 0.81, date: '2023-10-26', growthStage: '蕾期', soilMoisture: 0.72, soilTemperature: 25, lai: 4.7, spad: 53 },
    { id: 7, plot: 'G-07', plotId: 'G-07', crop: '打瓜', growth: '偏弱', growthTrend: -0.08, primaryRisk: '水分胁迫', decisionPriority: '高', ndvi: 0.65, lastNdvi: 0.73, date: '2023-10-26', growthStage: '伸蔓期', soilMoisture: 0.38, soilTemperature: 28, lai: 3.2, spad: 42 },
    { id: 8, plot: 'H-08', plotId: 'H-08', crop: '番茄', growth: '中等', growthTrend: 0.02, primaryRisk: '环境胁迫', decisionPriority: '中', ndvi: 0.76, lastNdvi: 0.74, date: '2023-10-26', growthStage: '开花坐果期', soilMoisture: 0.68, soilTemperature: 30, lai: 4.3, spad: 49 },
    { id: 9, plot: 'I-09', plotId: 'I-09', crop: '玉米', growth: '良好', growthTrend: 0.05, primaryRisk: '无', decisionPriority: '低', ndvi: 0.88, lastNdvi: 0.83, date: '2023-10-26', growthStage: '抽穗期', soilMoisture: 0.78, soilTemperature: 24, lai: 5.1, spad: 56 },
    { id: 10, plot: 'J-10', plotId: 'J-10', crop: '棉花', growth: '偏弱', growthTrend: -0.03, primaryRisk: '养分胁迫', decisionPriority: '高', ndvi: 0.69, lastNdvi: 0.72, date: '2023-10-26', growthStage: '花铃期', soilMoisture: 0.55, soilTemperature: 27, lai: 3.8, spad: 43 },
    { id: 11, plot: 'K-11', plotId: 'K-11', crop: '打瓜', growth: '中等', growthTrend: 0.01, primaryRisk: '环境胁迫', decisionPriority: '中', ndvi: 0.74, lastNdvi: 0.73, date: '2023-10-26', growthStage: '开花坐瓜期', soilMoisture: 0.63, soilTemperature: 29, lai: 4.0, spad: 47 },
    { id: 12, plot: 'L-12', plotId: 'L-12', crop: '番茄', growth: '良好', growthTrend: 0.03, primaryRisk: '无', decisionPriority: '低', ndvi: 0.83, lastNdvi: 0.80, date: '2023-10-26', growthStage: '转色成熟期', soilMoisture: 0.76, soilTemperature: 22, lai: 4.9, spad: 54 },
    { id: 13, plot: 'M-13', plotId: 'M-13', crop: '玉米', growth: '偏弱', growthTrend: -0.06, primaryRisk: '水分胁迫', decisionPriority: '高', ndvi: 0.67, lastNdvi: 0.73, date: '2023-10-26', growthStage: '拔节期', soilMoisture: 0.42, soilTemperature: 26, lai: 3.4, spad: 45 },
    { id: 14, plot: 'N-14', plotId: 'N-14', crop: '棉花', growth: '中等', growthTrend: 0.00, primaryRisk: '养分胁迫', decisionPriority: '中', ndvi: 0.72, lastNdvi: 0.72, date: '2023-10-26', growthStage: '蕾期', soilMoisture: 0.59, soilTemperature: 25, lai: 4.1, spad: 46 },
    { id: 15, plot: 'O-15', plotId: 'O-15', crop: '打瓜', growth: '良好', growthTrend: 0.04, primaryRisk: '无', decisionPriority: '低', ndvi: 0.81, lastNdvi: 0.77, date: '2023-10-26', growthStage: '成熟期', soilMoisture: 0.70, soilTemperature: 24, lai: 4.5, spad: 51 },
    { id: 16, plot: 'P-16', plotId: 'P-16', crop: '番茄', growth: '偏弱', growthTrend: -0.04, primaryRisk: '环境胁迫', decisionPriority: '高', ndvi: 0.70, lastNdvi: 0.74, date: '2023-10-26', growthStage: '开花坐果期', soilMoisture: 0.52, soilTemperature: 31, lai: 3.7, spad: 44 },
    { id: 17, plot: 'Q-17', plotId: 'Q-17', crop: '玉米', growth: '中等', growthTrend: 0.02, primaryRisk: '养分胁迫', decisionPriority: '中', ndvi: 0.77, lastNdvi: 0.75, date: '2023-10-26', growthStage: '灌浆期', soilMoisture: 0.64, soilTemperature: 23, lai: 4.4, spad: 48 },
    { id: 18, plot: 'R-18', plotId: 'R-18', crop: '棉花', growth: '良好', growthTrend: 0.06, primaryRisk: '无', decisionPriority: '低', ndvi: 0.86, lastNdvi: 0.80, date: '2023-10-26', growthStage: '吐絮期', soilMoisture: 0.73, soilTemperature: 26, lai: 4.8, spad: 55 },
    { id: 19, plot: 'S-19', plotId: 'S-19', crop: '打瓜', growth: '偏弱', growthTrend: -0.07, primaryRisk: '水分胁迫', decisionPriority: '高', ndvi: 0.66, lastNdvi: 0.73, date: '2023-10-26', growthStage: '开花坐瓜期', soilMoisture: 0.40, soilTemperature: 27, lai: 3.3, spad: 43 },
    { id: 20, plot: 'T-20', plotId: 'T-20', crop: '番茄', growth: '中等', growthTrend: 0.01, primaryRisk: '环境胁迫', decisionPriority: '中', ndvi: 0.75, lastNdvi: 0.74, date: '2023-10-26', growthStage: '转色成熟期', soilMoisture: 0.61, soilTemperature: 28, lai: 4.2, spad: 47 },
    { id: 21, plot: 'U-21', plotId: 'U-21', crop: '玉米', growth: '良好', growthTrend: 0.03, primaryRisk: '无', decisionPriority: '低', ndvi: 0.84, lastNdvi: 0.81, date: '2023-10-26', growthStage: '抽穗期', soilMoisture: 0.77, soilTemperature: 25, lai: 4.9, spad: 53 },
    { id: 22, plot: 'V-22', plotId: 'V-22', crop: '棉花', growth: '偏弱', growthTrend: -0.05, primaryRisk: '养分胁迫', decisionPriority: '高', ndvi: 0.68, lastNdvi: 0.73, date: '2023-10-26', growthStage: '花铃期', soilMoisture: 0.54, soilTemperature: 29, lai: 3.6, spad: 42 },
    { id: 23, plot: 'W-23', plotId: 'W-23', crop: '打瓜', growth: '中等', growthTrend: 0.00, primaryRisk: '环境胁迫', decisionPriority: '中', ndvi: 0.73, lastNdvi: 0.73, date: '2023-10-26', growthStage: '伸蔓期', soilMoisture: 0.60, soilTemperature: 30, lai: 3.9, spad: 46 },
    { id: 24, plot: 'X-24', plotId: 'X-24', crop: '番茄', growth: '良好', growthTrend: 0.04, primaryRisk: '无', decisionPriority: '低', ndvi: 0.82, lastNdvi: 0.78, date: '2023-10-26', growthStage: '开花坐果期', soilMoisture: 0.74, soilTemperature: 24, lai: 4.7, spad: 52 },
    { id: 25, plot: 'Y-25', plotId: 'Y-25', crop: '玉米', growth: '中等', growthTrend: -0.02, primaryRisk: '水分胁迫', decisionPriority: '中', ndvi: 0.71, lastNdvi: 0.73, date: '2023-10-26', growthStage: '拔节期', soilMoisture: 0.48, soilTemperature: 27, lai: 3.8, spad: 45 },
  ].map(item => {
    const comprehensiveData = generateComprehensiveAdvice(item);
    return {
      ...item,
      comprehensiveData,
      healthModel: comprehensiveData.healthModel,
    }
  }));

  const filteredTableData = computed(() => {
    // 简单的筛选逻辑，可以根据需要扩展
    let data = tableData.value;
    if (filters.value.plot) {
      data = data.filter(item => item.plot.includes(filters.value.plot));
    }
    if (filters.value.growth) {
      data = data.filter(item => item.growth === filters.value.growth);
    }
    return data;
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
  
  const executeScheme = (row) => {
    console.log(`Executing scheme for plot ${row.plot}`, row.comprehensiveData.advice);
    ElMessage.success(`地块 ${row.plot} 的水肥方案已开始执行。`);
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
  
  const healthRadarChartOptions = computed(() => {
    if (!currentRow.value) {
      return {};
    }
    const scores = currentRow.value.healthModel.scores;
    const scoreValues = [
        scores.moisture.score * 100, 
        scores.nutrients.score * 100, 
        scores.vigor.score * 100, 
        scores.environment.score * 100
    ];

    return {
      radar: {
        indicator: [
          { name: '水分健康', max: 100 },
          { name: '养分健康', max: 100 },
          { name: '生长活力', max: 100 },
          { name: '环境适宜度', max: 100 },
        ],
        shape: 'circle',
        splitNumber: 5,
        axisName: {
          color: '#ccc'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)'
          }
        },
        splitArea: {
          areaStyle: {
            color: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
          }
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)'
          }
        }
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          name: '作物健康评估',
          type: 'radar',
          data: [
            {
              value: scoreValues,
              name: `地块 ${currentRow.value.plot}`,
              areaStyle: {
                color: 'rgba(0, 200, 81, 0.6)'
              },
              lineStyle: {
                color: 'rgba(0, 200, 81, 1)'
              },
              itemStyle: {
                color: 'rgba(0, 200, 81, 1)'
              }
            }
          ]
        }
      ]
    };
  });

  const ndviTrendChartOptions = computed(() => {
    if (!currentRow.value) {
      return { series: [] };
    }
    const baseNdvi = currentRow.value.ndvi;
    const trendData = Array.from({ length: 7 }, (_, i) => {
      if (i === 6) return baseNdvi;
      // Ensure the trend is somewhat realistic by basing it on the lastNdvi
      const pastValue = i < 5 ? currentRow.value.lastNdvi - Math.random() * 0.1 : currentRow.value.lastNdvi;
      return (pastValue + (baseNdvi - pastValue) * (i / 6.0) + (Math.random() - 0.5) * 0.05).toFixed(2);
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
    executeScheme,
    healthRadarChartOptions,
    ndviTrendChartOptions,
  };
}
