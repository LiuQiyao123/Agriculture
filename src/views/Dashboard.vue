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
       <DataPanel title="关键风险预测与告警" class="flex-item" style="flex-basis: 33.3%;">
        <div class="risk-predict-content">
          <div class="chart-container">
             <EchartsWrapper :options="riskRadarOptions" />
          </div>
           <SeamlessScrollList :list="alerts" :speed="15" @item-click="handleAlertClick" class="alert-list"/>
        </div>
      </DataPanel>
      <DataPanel title="全域作物长势诊断" class="flex-item" style="flex-basis: 33.3%;">
        <div class="crop-growth-content">
          <div class="chart-container">
            <EchartsWrapper :options="cropGrowthOptions" />
          </div>
          <div class="ai-report">
            <p class="report-text">{{ aiDiagnosisReport }}</p>
          </div>
        </div>
      </DataPanel>
      <DataPanel title="主导产业供需预测" class="flex-item" style="flex-basis: 33.3%;">
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
        <DataPanel title="全县主要农作物种植结构" class="flex-item" style="flex-basis: 50%;">
          <EchartsWrapper :options="plantingStructureOptions" />
        </DataPanel>
        <DataPanel title="近30天预警数量趋势" class="flex-item" style="flex-basis: 50%;">
          <EchartsWrapper :options="alertTrendOptions" />
        </DataPanel>
      </template>
      <template v-else>
        <DataPanel :title="`地块专属分析报告: ${selectedPlot.properties.name}`" class="flex-item full-height" :show-close="true" @close="clearSelectedPlot">
           <div class="plot-report-content">
              <div class="report-section">
                <p class="section-title">地块健康诊断报告</p>
                <ul class="diagnosis-list">
                  <li><span>土壤有机质</span><span class="value">2.5% <em class="status-ok">(标准)</em></span></li>
                  <li><span>土壤速效氮</span><span class="value">85 mg/kg <em class="status-warn">(偏低)</em></span></li>
                  <li><span>土壤湿度</span><span class="value">65% <em class="status-ok">(适宜)</em></span></li>
                   <li><span>作物苗齐度</span><span class="value">95% <em class="status-good">(优)</em></span></li>
                </ul>
                <div class="ai-report-box">
                  <strong>AI诊断结论:</strong>
                  <p>该地块地力基础良好，但存在缺氮现象，已影响叶绿素合成。预测若不干预，将在10-15日后导致叶片发黄，并可能造成约5%-8%的产量损失。建议在5日内追施尿素...</p>
                </div>
              </div>
              <div class="report-section">
                <p class="section-title">地块风险与产量预测</p>
                 <ul class="risk-list">
                  <li><span>未来7日病害风险</span><span class="value">稻瘟病 (中风险, 45%), 纹枯病 (低风险, 15%)</span></li>
                  <li><span>未来15日旱情风险</span><span class="value">无明显风险</span></li>
                  <li><span>当季产量预测</span><span class="value">650 公斤/亩 <em class="status-good">(较全县同类作物平均水平高8%)</em></span></li>
                </ul>
              </div>
           </div>
        </DataPanel>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MetricCard from '@/components/MetricCard.vue'
import SeamlessScrollList from '@/components/SeamlessScrollList.vue'
import EchartsWrapper from '@/components/EchartsWrapper.vue'
import GisMap from '@/components/GisMap.vue'
import DataPanel from '@/components/DataPanel.vue'
import {
  alertsList,
  plantingStructureData,
  getPlantingStructureOptions,
  plotGeoJson,
  yieldValueData,
  getYieldValueOptions,
  alertTrendData,
  getAlertTrendOptions,
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
  PriceTag
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

const plantingStructureOptions = computed(() => getPlantingStructureOptions(plantingStructureData, themeColors));
const yieldValueOptions = computed(() => getYieldValueOptions(yieldValueData, themeColors));
const alertTrendOptions = computed(() => getAlertTrendOptions(alertTrendData, themeColors));
const cropGrowthOptions = computed(() => getCropGrowthOptions(cropGrowthData, themeColors));
const riskRadarOptions = computed(() => getRiskRadarOptions(riskRadarData, themeColors));
const supplyDemandOptions = computed(() => getSupplyDemandOptions(supplyDemandData, themeColors));

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
  bottom: 20px;
  width: 20%; /* Example width, adjust as needed */
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.left-column {
  left: 20px;
}

.right-column {
  right: 20px;
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


/* This rule fixes the height compression issue in DataPanel */
.flex-item :deep(.panel-content > *) {
  height: 100%;
}
</style> 