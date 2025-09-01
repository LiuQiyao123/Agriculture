<template>
  <div class="dashboard-container">
    <!-- Map as the base layer -->
    <GisMap ref="gisMapRef" :geojson="plots" :layers="gisLayersData" class="base-map" @plot-analysis="handlePlotAnalysis" />

    <!-- Overlay Panels -->
    <div class="top-metrics overlay-panel">
      <img src="@/assets/images/指标左.svg" alt="decoration-left" class="side-decorator" />
      <el-row :gutter="20" class="metrics-row">
        <el-col :span="6" v-for="metric in metrics" :key="metric.id">
          <MetricCard 
            :title="metric.title" 
            :value="metric.value" 
            :details="metric.details" 
            :icon="metric.icon" 
            :icon-theme="metric.iconTheme" 
          />
        </el-col>
      </el-row>
      <img src="@/assets/images/指标右.svg" alt="decoration-right" class="side-decorator" />
    </div>

    <div class="left-column overlay-panel">
       <DataPanel title="关键风险预测与告警" class="flex-item">
        <div class="risk-predict-content">
          <div class="chart-container">
             <EchartsWrapper :options="riskRadarOptions" />
          </div>
           <SeamlessScrollList :list="alerts" :speed="15" @item-click="handleAlertClick" class="alert-list"/>
        </div>
      </DataPanel>
      <DataPanel title="全域作物长势诊断" class="flex-item">
        <div class="crop-growth-content">
          <div class="chart-container">
            <EchartsWrapper :options="cropGrowthOptions" />
          </div>
          <div class="ai-report">
            <p class="report-text">{{ aiDiagnosisReport }}</p>
          </div>
        </div>
      </DataPanel>
      <DataPanel title="主导产业供需预测" class="flex-item">
        <div class="supply-demand-content">
          <div class="chart-container">
            <EchartsWrapper :options="supplyDemandOptions" />
          </div>
          <div class="ai-report">
             <p class="report-text">{{ supplyDemandSuggestion }}</p>
          </div>
        </div>
      </DataPanel>
    </div>

    <div class="right-column overlay-panel">
      
      <template v-if="!selectedPlot">
        <!-- 辖区概览（A+B+C 聚合版） -->
        <DataPanel title="农业生产健康诊断概览" class="flex-item health-diagnosis-panel">
          <div class="plot-report-content scrollable-content">
            <!-- 上半部分：实时大田图像 -->
            <div class="field-image-section">
              <el-image 
                :src="fieldImageSrc" 
                :preview-src-list="[fieldImageSrc]"
                fit="cover"
                class="field-image"
                :alt="'大田实时监控图像'"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                    <span>图像加载失败</span>
                  </div>
                </template>
              </el-image>
              <div class="image-info">
                <span class="capture-time">{{ fieldImageTime }}</span>
              </div>
            </div>
            
            <!-- 下半部分：健康诊断清单 -->
            <div class="report-section">
              <div class="diagnosis-item" v-for="item in diagnosisItems" :key="item.key">
                <div class="diagnosis-header">
                  <span class="diagnosis-name">{{ item.name }}</span>
                  <span class="diagnosis-value">{{ item.value }}</span>
                  <span class="diagnosis-status" :class="item.statusClass">{{ item.statusText }}</span>
                </div>
                <div class="diagnosis-details">
                  <div class="diagnosis-range">标准范围：{{ item.range }}</div>
                  <div class="diagnosis-analysis">{{ item.analysis }}</div>
                  <div class="diagnosis-suggestion">{{ item.suggestion }}</div>
                </div>
              </div>
            </div>
          </div>
        </DataPanel>

        <DataPanel title="病虫灾害风险与产量预测" class="flex-item risk-prediction-panel">
          <div class="plot-report-content scrollable-content">
            <div class="report-section">
              <div class="risk-item" v-for="item in riskItems" :key="item.key">
                <div class="risk-header">
                  <span class="risk-name">{{ item.name }}</span>
                  <span class="risk-value" :class="item.valueClass">{{ item.value }}</span>
                </div>
                <div class="risk-details">
                  <div class="risk-analysis">{{ item.analysis }}</div>
                  <div class="risk-suggestion">{{ item.suggestion }}</div>
                </div>
              </div>
            </div>
          </div>
        </DataPanel>

        <DataPanel title="核心指标趋势预测" class="flex-item history-trend-panel">
          <div class="plot-report-content">
            <div class="trend-chart-container">
              <EchartsWrapper :options="districtTrendOptions" />
            </div>
            <div class="trend-analysis">
              <div class="trend-summary">
                <span class="trend-label">当前趋势：</span>
                <span class="trend-value" :class="trendStatus.class">{{ trendStatus.text }}</span>
              </div>
              <div class="trend-prediction">
                <span class="trend-label">未来3个月预测：</span>
                <span class="trend-value">{{ trendPrediction }}</span>
              </div>
            </div>
          </div>
        </DataPanel>
      </template>
      <template v-else>
        <!-- 地块专属分析报告 -->
        <DataPanel :title="`地块专属分析报告: ${selectedPlot.properties.name}`" class="flex-item full-height" :show-close="true" @close="clearSelectedPlot">
          <div class="plot-report-content">
            <!-- 组件A: 地块健康诊断报告 -->
            <div class="report-section">
              <p class="section-title">地块健康诊断报告</p>
              <ul class="diagnosis-list">
                <li><span>土壤有机质</span><span class="value">{{ selectedPlot.properties.soilOrganic || '2.5%' }} <em class="status-ok">(标准)</em></span></li>
                <li><span>土壤速效氮</span><span class="value">{{ selectedPlot.properties.soilNitrogen || '85' }} mg/kg <em class="status-warn">(偏低)</em></span></li>
                <li><span>土壤湿度</span><span class="value">{{ selectedPlot.properties.soilMoisture || '65' }}% <em class="status-ok">(适宜)</em></span></li>
                <li><span>作物苗齐度</span><span class="value">{{ selectedPlot.properties.cropUniformity || '95' }}% <em class="status-good">(优)</em></span></li>
                <li><span>NDVI指数</span><span class="value">{{ selectedPlot.properties.ndvi || '0.85' }} <em class="status-good">(优)</em></span></li>
              </ul>
              <div class="ai-report-box">
                <strong>AI诊断结论:</strong>
                <p>{{ getPlotDiagnosis(selectedPlot) }}</p>
              </div>
            </div>
            
            <!-- 组件B: 地块风险与产量预测 -->
            <div class="report-section">
              <p class="section-title">地块风险与产量预测</p>
              <ul class="risk-list">
                <li><span>未来7日病害风险</span><span class="value">{{ getDiseaseRisk(selectedPlot) }}</span></li>
                <li><span>未来15日旱情风险</span><span class="value">{{ getDroughtRisk(selectedPlot) }}</span></li>
                <li><span>当季产量预测</span><span class="value">{{ getYieldPrediction(selectedPlot) }}</span></li>
                <li><span>病虫害影响评估</span><span class="value">{{ getPestImpact(selectedPlot) }}</span></li>
              </ul>
            </div>
            
            <!-- 组件C: 地块历史数据回溯 -->
            <div class="report-section">
              <p class="section-title">地块历史数据回溯</p>
              <div class="history-charts">
                <div class="mini-chart">
                  <p class="chart-title">NDVI指数变化趋势</p>
                  <EchartsWrapper :options="getNdviHistoryOptions(selectedPlot)" />
                </div>
                <div class="mini-chart">
                  <p class="chart-title">土壤湿度变化趋势</p>
                  <EchartsWrapper :options="getSoilMoistureHistoryOptions(selectedPlot)" />
                </div>
              </div>
            </div>
          </div>
        </DataPanel>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as echarts from 'echarts'
import MetricCard from '@/components/MetricCard.vue'
import SeamlessScrollList from '@/components/SeamlessScrollList.vue'
import EchartsWrapper from '@/components/EchartsWrapper.vue'
import GisMap from '@/components/GisMap.vue'
import DataPanel from '@/components/DataPanel.vue'
import {
  alertsList,
  plotGeoJson,
  cropGrowthData,
  getCropGrowthOptions,
  riskRadarData,
  getRiskRadarOptions,
  supplyDemandData,
  getSupplyDemandOptions,
} from '@/mock/dashboard.js';
import { gisLayers } from '@/mock/gis.js';
import {
  OfficeBuilding,
  Cpu,
  Warning,
  Coin,
  DataAnalysis,
  Notification,
  Monitor,
  PriceTag,
  Picture
} from '@element-plus/icons-vue'

const gisMapRef = ref(null);

const metricsData = [
  { id: 1, title: '主粮产量预测', value: '15.8 万吨', details: '<span style="color:lime">▲ 2.1% (较上周预测)</span>', icon: DataAnalysis, iconTheme: 'green' },
  { id: 2, title: '重大病虫害影响面积', value: '1.5 万亩', details: '<span style="color:red">稻飞虱影响</span>', icon: Notification, iconTheme: 'purple' },
  { id: 3, title: '设备在线率', value: '98.5%', details: '<span style="color:lime">874台在线</span>', icon: Monitor, iconTheme: 'blue' },
  { id: 4, title: '当季总产值预估', value: '¥3.85 亿元', details: '<span style="color:lime">▲ 8.2% (同比)</span>', icon: PriceTag, iconTheme: 'cyan' },
];
const metrics = ref(metricsData);
const alerts = ref(alertsList)
const plots = ref(plotGeoJson)
const gisLayersData = ref(gisLayers);

const aiDiagnosisReport = ref(
  '当前全县85%作物长势良好。其中，南部区域因光照充足，长势普遍优于北部；白马乡有约200亩地块NDVI值连续两周下降，已发出长势异常预警，需重点关注。'
);

const supplyDemandSuggestion = ref(
  '模型预测未来2个月内，水稻市场将呈现供过于求的态势。建议引导合作社、农户分批次销售，或拓展加工、仓储渠道，避免集中上市导致价格下跌。'
);

const themeColors = {
  titleColor: '#ffffff',
  textColor: '#c0c4cc',
  axisLineColor: 'rgba(255, 255, 255, 0.3)',
  splitLineColor: 'rgba(255, 255, 255, 0.1)',
  axisLabelColor: '#c0c4cc', // Add missing axisLabelColor
};

const cropGrowthOptions = computed(() => getCropGrowthOptions(cropGrowthData, themeColors));
const riskRadarOptions = computed(() => getRiskRadarOptions(riskRadarData, themeColors));
const supplyDemandOptions = computed(() => getSupplyDemandOptions(supplyDemandData, themeColors));
// 辖区概览 - 模拟指标与趋势
const districtDiagnosis = ref({ organic: '2.6%', nitrogen: 82, moisture: 66, uniformity: 92, ndvi: 0.83 });
const districtRisk = ref({ disease: '稻瘟病 (中风险, 40%)', drought: '轻度风险 (20%)', yield: '642 公斤/亩' });

// 大田图像相关
const fieldImageSrc = ref('/static/images/field-monitor/default.jpg');
const fieldImageTime = ref('2024-01-15 14:30');

// 健康诊断详细数据
const diagnosisItems = computed(() => [
  {
    key: 'organic',
    name: '土壤有机质',
    value: districtDiagnosis.value.organic,
    range: '2.0-3.5%',
    statusText: '良',
    statusClass: 'status-good',
    analysis: '当前有机质含量处于良好水平，有利于土壤团粒结构形成和微生物活动。',
    suggestion: '建议保持现有有机肥施用水平，可适当增加秸秆还田量。'
  },
  {
    key: 'nitrogen',
    name: '土壤速效氮',
    value: `${districtDiagnosis.value.nitrogen} mg/kg`,
    range: '80-120 mg/kg',
    statusText: '偏低',
    statusClass: 'status-warn',
    analysis: '速效氮含量偏低，可能影响作物叶片生长和叶绿素合成。',
    suggestion: '建议在5-7天内追施尿素15-20公斤/亩，分两次施用。'
  },
  {
    key: 'moisture',
    name: '土壤湿度',
    value: `${districtDiagnosis.value.moisture}%`,
    range: '60-80%',
    statusText: '适宜',
    statusClass: 'status-ok',
    analysis: '土壤湿度处于适宜范围，有利于作物根系发育和养分吸收。',
    suggestion: '保持现有灌溉频率，注意观察天气变化及时调整。'
  },
  {
    key: 'uniformity',
    name: '作物苗齐度',
    value: `${districtDiagnosis.value.uniformity}%`,
    range: '>90%',
    statusText: '优',
    statusClass: 'status-good',
    analysis: '苗齐度优秀，表明播种质量好，田间管理到位。',
    suggestion: '继续保持精细化管理，注意病虫害防治。'
  },
  {
    key: 'ndvi',
    name: 'NDVI指数',
    value: districtDiagnosis.value.ndvi,
    range: '0.6-0.9',
    statusText: '优',
    statusClass: 'status-good',
    analysis: 'NDVI指数较高，表明作物长势良好，叶绿素含量充足。',
    suggestion: '继续保持现有管理措施，注意观察长势变化。'
  }
]);

// 风险预测详细数据
const riskItems = computed(() => [
  {
    key: 'disease',
    name: '未来7日病害风险',
    value: districtRisk.value.disease,
    valueClass: 'risk-medium',
    analysis: '基于历史发病数据和当前气象条件，稻瘟病风险中等，主要影响区域为南部地块。',
    suggestion: '建议加强田间巡查，发现病斑及时喷施三环唑或稻瘟灵。'
  },
  {
    key: 'drought',
    name: '未来15日旱情风险',
    value: districtRisk.value.drought,
    valueClass: 'risk-low',
    analysis: '根据降水预报和土壤墒情监测，未来15天旱情风险较低。',
    suggestion: '保持正常灌溉频率，注意观察天气变化。'
  },
  {
    key: 'yield',
    name: '当季产量预测',
    value: districtRisk.value.yield,
    valueClass: 'risk-good',
    analysis: '基于当前长势、历史产量和气象条件，预计产量较去年增长5%。',
    suggestion: '加强后期管理，注意适时收获，避免倒伏损失。'
  },
  {
    key: 'market',
    name: '市场风险分析',
    value: '价格平稳，供需平衡',
    valueClass: 'risk-low',
    analysis: '当前市场价格相对稳定，供需关系基本平衡。',
    suggestion: '建议分批次销售，避免集中上市造成价格波动。'
  }
]);

// 趋势分析数据
const trendStatus = ref({
  text: '上升趋势',
  class: 'trend-up'
});

const trendPrediction = ref('预计NDVI指数将继续上升至0.87，土壤湿度维持在65-70%范围内');

// 合并的历史趋势图表配置
const districtTrendOptions = computed(() => {
  const dates = [
    '2024-01-01', '2024-01-15', '2024-01-31', '2024-02-01',
    '2024-02-15', '2024-02-29', '2024-03-01', '2024-03-15',
    '2024-03-31', '2024-04-01', '2024-04-15', '2024-04-30',
    '2024-05-01', '2024-05-15', '2024-05-31', '2024-06-01',
    '2024-06-15', '2024-06-30', '2024-07-01', '2024-07-15',
    '2024-07-31', '2024-08-01', '2024-08-15', '2024-08-31'
  ];
  
  const ndviData = [0.76, 0.78, 0.81, 0.84, 0.86, 0.85, 0.87, 0.88, 0.89, 0.90, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 1.00, 1.01, 1.02, 1.03, 1.04];
  const moistureData = [61, 59, 63, 66, 69, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94, 96, 98, 100, 102];
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    grid: {
      top: '15%',
      left: '10%',
      right: '10%',
      bottom: '20%'
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { color: '#c0c4cc', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } }
    },
    yAxis: [
      {
        type: 'value',
        name: 'NDVI指数',
        min: 0,
        max: 1,
        axisLabel: { color: '#c0c4cc', fontSize: 10 },
        axisLine: { lineStyle: { color: '#00aaff' } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
      },
      {
        type: 'value',
        name: '土壤湿度(%)',
        min: 0,
        max: 100,
        axisLabel: { color: '#c0c4cc', fontSize: 10 },
        axisLine: { lineStyle: { color: '#52c41a' } },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'NDVI指数',
        type: 'line',
        yAxisIndex: 0,
        data: ndviData.slice(0, 18),
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#00aaff' },
        itemStyle: { color: '#00aaff' }
      },
      {
        name: '土壤湿度',
        type: 'line',
        yAxisIndex: 1,
        data: moistureData.slice(0, 18),
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#52c41a' },
        itemStyle: { color: '#52c41a' }
      },
      {
        name: 'NDVI预测',
        type: 'line',
        yAxisIndex: 0,
        data: [...Array(18).fill(null), ...ndviData.slice(18)],
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#00aaff', type: 'dashed' },
        itemStyle: { color: '#00aaff' }
      },
      {
        name: '湿度预测',
        type: 'line',
        yAxisIndex: 1,
        data: [...Array(18).fill(null), ...moistureData.slice(18)],
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#52c41a', type: 'dashed' },
        itemStyle: { color: '#52c41a' }
      }
    ]
  };
});

const districtNdviTrendOptions = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { top: '10%', left: '10%', right: '10%', bottom: '20%' },
  xAxis: { type: 'category', data: ['1月','2月','3月','4月','5月','6月'], axisLabel: { color: '#c0c4cc', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } } },
  yAxis: { type: 'value', axisLabel: { color: '#c0c4cc', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
  series: [{ data: [0.76,0.78,0.81,0.84,0.86,0.85], type: 'line', smooth: true, symbol: 'circle', symbolSize: 4, lineStyle: { color: '#00aaff' } }]
}));

const districtMoistureTrendOptions = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { top: '10%', left: '10%', right: '10%', bottom: '20%' },
  xAxis: { type: 'category', data: ['1月','2月','3月','4月','5月','6月'], axisLabel: { color: '#c0c4cc', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } } },
  yAxis: { type: 'value', axisLabel: { color: '#c0c4cc', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
  series: [{ data: [61,59,63,66,69,66], type: 'line', smooth: true, symbol: 'circle', symbolSize: 4, lineStyle: { color: '#52c41a' } }]
}));

const selectedPlot = ref(null);

const handleAlertClick = (item) => {
  if (item.location && gisMapRef.value) {
    gisMapRef.value.flyTo({
      center: [item.location.lng, item.location.lat],
      zoom: item.location.zoom,
      speed: 1.2,
    });
  }
};

const handlePlotAnalysis = (plotFeature) => {
  selectedPlot.value = plotFeature;
};

const clearSelectedPlot = () => {
  selectedPlot.value = null;
};

// 地块分析相关方法
const getPlotDiagnosis = (plot) => {
  if (!plot) return '';
  const soilNitrogen = plot.properties.soilNitrogen || '85';
  const ndvi = plot.properties.ndvi || '0.85';
  const cropUniformity = plot.properties.cropUniformity || '95';

  if (soilNitrogen < 85) {
    return '该地块地力基础良好，但存在缺氮现象，已影响叶绿素合成。预测若不干预，将在10-15日后导致叶片发黄，并可能造成约5%-8%的产量损失。建议在5日内追施尿素...';
  }
  if (ndvi < 0.8) {
    return '该地块作物长势较差，NDVI指数偏低，可能存在病虫害或水分不足。建议加强田间管理，及时灌溉，并进行病虫害防治。';
  }
  if (cropUniformity < 90) {
    return '该地块作物苗齐度较低，可能存在播种或管理问题。建议检查播种密度，并加强田间管理。';
  }
  return '该地块地力基础良好，长势正常。';
};

const getDiseaseRisk = (plot) => {
  if (!plot) return '无风险';
  const diseaseRisk = plot.properties.diseaseRisk || '稻瘟病 (中风险, 45%), 纹枯病 (低风险, 15%)';
  return diseaseRisk;
};

const getDroughtRisk = (plot) => {
  if (!plot) return '无风险';
  const droughtRisk = plot.properties.droughtRisk || '无明显风险';
  return droughtRisk;
};

const getYieldPrediction = (plot) => {
  if (!plot) return '0 公斤/亩';
  const yieldValue = plot.properties.yieldValue || '650';
  return `${yieldValue} 公斤/亩 <em class="status-good">(较全县同类作物平均水平高8%)</em>`;
};

const getPestImpact = (plot) => {
  if (!plot) return '无影响';
  const pestImpact = plot.properties.pestImpact || '轻微影响，已采取防治措施';
  return pestImpact;
};

const getNdviHistoryOptions = (plot) => {
  if (!plot || !plot.properties.ndviHistory) {
    // 生成模拟历史数据
    const dates = ['1月', '2月', '3月', '4月', '5月', '6月'];
    const values = [0.75, 0.78, 0.82, 0.85, 0.87, 0.85];
    
    return {
      tooltip: { trigger: 'axis' },
      grid: { top: '10%', left: '10%', right: '10%', bottom: '20%' },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { color: '#c0c4cc', fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#c0c4cc', fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
      },
      series: [{
        data: values,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#00aaff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 170, 255, 0.3)' },
              { offset: 1, color: 'rgba(0, 170, 255, 0)' }
            ]
          }
        }
      }]
    };
  }
  
  const history = plot.properties.ndviHistory;
  const dates = Object.keys(history);
  const values = Object.values(history);

  return {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', left: '10%', right: '10%', bottom: '20%' },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { color: '#c0c4cc', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#c0c4cc', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
    },
    series: [{
      data: values,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { color: '#00aaff' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0, 170, 255, 0.3)' },
            { offset: 1, color: 'rgba(0, 170, 255, 0)' }
          ]
        }
      }
    }]
  };
};

const getSoilMoistureHistoryOptions = (plot) => {
  if (!plot || !plot.properties.soilMoistureHistory) {
    // 生成模拟历史数据
    const dates = ['1月', '2月', '3月', '4月', '5月', '6月'];
    const values = [60, 58, 62, 65, 68, 65];
    
    return {
      tooltip: { trigger: 'axis' },
      grid: { top: '10%', left: '10%', right: '10%', bottom: '20%' },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { color: '#c0c4cc', fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#c0c4cc', fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
      },
      series: [{
        data: values,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#52c41a' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0)' }
            ]
          }
        }
      }]
    };
  }
  
  const history = plot.properties.soilMoistureHistory;
  const dates = Object.keys(history);
  const values = Object.values(history);

  return {
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', left: '10%', right: '10%', bottom: '20%' },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { color: '#c0c4cc', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#c0c4cc', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
    },
    series: [{
      data: values,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { color: '#52c41a' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
            { offset: 1, color: 'rgba(82, 196, 26, 0)' }
          ]
        }
      }
    }]
  };
};
</script>

<style scoped>
.dashboard-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.base-map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.overlay-panel {
  position: absolute;
  z-index: 2;
  pointer-events: none; /* Pass clicks through the container to the map */
}

.overlay-panel > * {
  pointer-events: auto; /* Re-enable pointer events for child components */
}

.top-metrics {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1080px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
  position: relative; /* Needed for the pseudo-element */

  &::after {
    content: '';
    position: absolute;
    bottom: -20px; /* Position even further below */
    left: 0;
    width: 100%;
    height: 120px; /* Make it much taller */
    background: rgba(10, 29, 61, 0.8); /* Dark color with 80% opacity */
    filter: blur(25px); /* Keep blur radius as per last request */
    z-index: -1; /* Behind the content */
  }
}

.side-decorator {
  flex-shrink: 0;
  width: 42px;
  height: 80px;
}

.metrics-row {
  flex-grow: 1;
  width: 100%;
  pointer-events: auto; /* Re-enable pointer events for the cards */
}

.left-column,
.right-column {
  top: 20px; /* Move to the top */
  bottom: 20px; /* 留下底部间隙 */
  width: 20%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.left-column {
  left: 20px;
}

.right-column { right: 20px; }

/* 左侧容器：确保flex布局正确 */
.left-column .flex-item { 
  flex: 1 1 0; 
  min-height: 0; /* 允许内容收缩 */
  display: flex;
  flex-direction: column;
}

/* 右侧容器：默认展示时采用竖向等高布局，改为占满列高度 */
.right-column { flex-direction: column; }
.right-column .flex-item { 
  flex: 1 1 0; 
  min-height: 0; /* 允许内容收缩 */
  display: flex;
  flex-direction: column;
}

/* 可滚动内容区域 */
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 240px; /* 增加高度，向上扩展20px，向下扩展20px */
  margin-top: -20px; /* 向上移动20px */
  margin-bottom: -20px; /* 向下移动20px */
}

/* 滚动条样式 */
.scrollable-content::-webkit-scrollbar {
  width: 6px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: rgba(0, 170, 255, 0.6);
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 170, 255, 0.8);
}

/* 确保内容足够长以触发滚动 */
.plot-report-content {
  min-height: 300px; /* 减小最小高度 */
}

/* 诊断项目样式 */
.diagnosis-item {
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border-left: 3px solid #52c41a;
}

.diagnosis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.diagnosis-name {
  font-weight: bold;
  color: #fff;
}

.diagnosis-value {
  font-size: 18px;
  font-weight: bold;
  color: #00aaff;
}

.diagnosis-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.diagnosis-status.status-good {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.diagnosis-status.status-warning {
  background: rgba(250, 173, 20, 0.2);
  color: #faad14;
}

.diagnosis-status.status-danger {
  background: rgba(245, 34, 45, 0.2);
  color: #f5222d;
}

.diagnosis-details {
  font-size: 13px;
  line-height: 1.5;
}

.diagnosis-range {
  color: #a0a6b8;
  margin-bottom: 5px;
}

.diagnosis-analysis {
  color: #c0c4cc;
  margin-bottom: 5px;
}

.diagnosis-suggestion {
  color: #00aaff;
  font-weight: 500;
}

.flex-item {
  display: flex;
  flex-direction: column;
}

.full-height {
  height: 100%;
}

.crop-growth-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.risk-predict-content, .supply-demand-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.alert-list {
  height: 100px; /* Give a fixed height to the alert list */
  flex-shrink: 0;
}

.chart-container {
  flex: 1;
  min-height: 0; /* Important for flexbox to allow shrinking */
}

.ai-report {
  padding: 10px 15px;
  background: rgba(0, 170, 255, 0.1);
  border-top: 1px solid rgba(0, 170, 255, 0.3);
}

.report-title {
  margin: 0 0 5px 0;
  font-weight: bold;
  color: #00aaff;
}

.report-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #c0c4cc;
}

.plot-report-content {
  padding: 10px 15px;
  height: 100%;
  overflow-y: auto;
}

.report-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #00aaff;
  margin: 0 0 10px 0;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(0, 170, 255, 0.3);
}

.diagnosis-list, .risk-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 14px;
}

.diagnosis-list li, .risk-list li {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.diagnosis-list li > span:first-child,
.risk-list li > span:first-child {
  color: #a0a6b8;
}

.diagnosis-list .value, .risk-list .value {
  color: #fff;
  font-weight: 500;
}

em.status-ok { color: #c0c4cc; font-style: normal; }
em.status-warn { color: #e6a23c; font-style: normal; }
em.status-good { color: #52c41a; font-style: normal; }

.ai-report-box {
  margin-top: 15px;
  padding: 10px;
  background: rgba(0,0,0,0.2);
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.7;
}
.ai-report-box strong {
  color: #00aaff;
}
.ai-report-box p {
  margin: 5px 0 0 0;
}

.history-charts {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.mini-chart {
  flex: 1;
  min-height: 120px;
}

.chart-title {
  font-size: 12px;
  color: #c0c4cc;
  margin-bottom: 5px;
  text-align: center;
}

/* 健康诊断面板样式 */
.field-image-section {
  margin-bottom: 15px;
  position: relative;
}

.field-image {
  width: 100%;
  height: 180px;
  border-radius: 8px;
  border: 1px solid rgba(0, 170, 255, 0.3);
  object-fit: cover;
}

.image-info {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  padding: 4px 8px;
  border-radius: 4px;
}

.capture-time {
  font-size: 12px;
  color: #c0c4cc;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 180px;
  color: #c0c4cc;
  font-size: 14px;
}

.diagnosis-item {
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border-left: 3px solid #00aaff;
}

.diagnosis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.diagnosis-name {
  font-weight: 500;
  color: #c0c4cc;
}

.diagnosis-value {
  font-weight: bold;
  color: #fff;
}

.diagnosis-status {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
}

.diagnosis-details {
  font-size: 13px;
  line-height: 1.5;
}

.diagnosis-range {
  color: #a0a6b8;
  margin-bottom: 4px;
}

.diagnosis-analysis {
  color: #c0c4cc;
  margin-bottom: 4px;
}

.diagnosis-suggestion {
  color: #00aaff;
  font-weight: 500;
}

/* 风险预测面板样式 */
.risk-item {
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border-left: 3px solid #722ed1; /* 改为紫色，避免与橙色状态冲突 */
}

.risk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.risk-name {
  font-weight: bold;
  color: #fff;
  font-size: 14px;
}

.risk-value {
  font-size: 16px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
}

.risk-value.risk-low {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.risk-value.risk-medium {
  background: rgba(250, 173, 20, 0.2);
  color: #faad14;
}

.risk-value.risk-high {
  background: rgba(245, 34, 45, 0.2);
  color: #f5222d;
}

.risk-details {
  font-size: 12px;
  line-height: 1.4;
}

.risk-analysis {
  color: #c0c4cc;
  margin-bottom: 5px;
}

.risk-suggestion {
  color: #00aaff;
  font-weight: 500;
}

.risk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.risk-name {
  font-weight: 500;
  color: #c0c4cc;
}

.risk-value {
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}

.risk-details {
  font-size: 13px;
  line-height: 1.5;
}

.risk-analysis {
  color: #c0c4cc;
  margin-bottom: 4px;
}

.risk-suggestion {
  color: #e6a23c;
  font-weight: 500;
}

/* 历史趋势面板样式 */
.trend-chart-container {
  height: 200px;
  margin-bottom: 15px;
}

.trend-analysis {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  display: flex; /* 让两条内容左右分布 */
  justify-content: space-between;
  align-items: center;
}

.trend-summary, .trend-prediction {
  display: block; /* 每条内容内部上下排列 */
  margin-bottom: 0;
  position: relative;
}

.trend-summary {
  flex: 0 0 20%; /* 当前趋势占30% */
  padding-right: 12px; /* 为分隔线留出空间 */
  border-right: 1px solid rgba(255, 255, 255, 0.1); /* 浅浅的竖线 */
}

.trend-prediction {
  flex: 0 0 80%; /* 未来3个月预测占70%，更宽 */
  padding-left: 12px; /* 为分隔线留出空间 */
}

.trend-label {
  color: #a0a6b8;
  font-size: 13px;
  display: block;
  margin-bottom: 4px;
}

.trend-value {
  font-weight: 500;
  font-size: 13px;
  display: block;
}

/* 核心指标趋势预测容器内容向上平移 */
.history-trend-panel .plot-report-content {
  margin-top: -20px; /* 整体向上平移20px */
  overflow: visible; /* 去掉滚动条 */
}

/* 核心指标趋势预测下方文字区域向上平移 */
.history-trend-panel .trend-analysis {
  margin-top: -20px; /* 文字区域向上平移20px */
}

/* 状态样式 */
.status-ok { background: rgba(82, 196, 26, 0.2); color: #52c41a; }
.status-warn { background: rgba(230, 162, 60, 0.2); color: #e6a23c; }
.status-good { background: rgba(82, 196, 26, 0.2); color: #52c41a; }

.risk-low { background: rgba(82, 196, 26, 0.2); color: #52c41a; }
.risk-medium { background: rgba(230, 162, 60, 0.2); color: #e6a23c; }
.risk-high { background: rgba(245, 34, 45, 0.2); color: #f5222d; }
.risk-good { background: rgba(82, 196, 26, 0.2); color: #52c41a; }

.trend-up { color: #52c41a; }
.trend-down { color: #f5222d; }
.trend-stable { color: #c0c4cc; }

/* This rule fixes the height compression issue in DataPanel */
.flex-item :deep(.panel-content > *) {
  height: 100%;
}

/* 大田图像样式 */
.field-image-section {
  margin-bottom: 20px;
}

.field-image {
  width: 100%;
  height: 120px;
  border-radius: 6px;
  object-fit: cover;
}

.image-info {
  margin-top: 8px;
  text-align: center;
}

.capture-time {
  color: #a0a6b8;
  font-size: 12px;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  color: #a0a6b8;
  font-size: 12px;
}

.image-error .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}
</style> 