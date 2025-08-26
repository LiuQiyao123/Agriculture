<template>
  <div class="dashboard-container">
    <!-- Map as the base layer -->
    <GisMap ref="gisMapRef" :geojson="plots" :layers="gisLayersData" class="base-map" />

    <!-- Overlay Panels -->
    <div class="top-metrics overlay-panel">
      <el-row :gutter="20">
        <el-col :span="6" v-for="metric in metrics" :key="metric.id">
          <DataPanel>
            <MetricCard :title="metric.title" :value="metric.value" :unit="metric.unit" />
          </DataPanel>
        </el-col>
      </el-row>
    </div>

    <div class="left-column overlay-panel">
      <DataPanel title="关键预警通知" class="flex-item" style="flex-basis: 40%;">
        <SeamlessScrollList :list="alerts" @item-click="handleAlertClick" />
      </DataPanel>
      <DataPanel title="设备在线状态" class="flex-item" style="flex-basis: 30%;">
        <EchartsWrapper :options="deviceStatusOptions" />
      </DataPanel>
      <DataPanel title="土壤墒情实时监测" class="flex-item" style="flex-basis: 30%;">
        <EchartsWrapper :options="soilMoistureOptions" />
      </DataPanel>
    </div>

    <div class="right-column overlay-panel">
      <DataPanel title="全县主要农作物种植结构" class="flex-item" style="flex-basis: 50%;">
        <EchartsWrapper :options="plantingStructureOptions" />
      </DataPanel>
      <DataPanel title="近30天预警数量趋势" class="flex-item" style="flex-basis: 50%;">
        <EchartsWrapper :options="alertTrendOptions" />
      </DataPanel>
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
  topMetrics,
  alertsList,
  plantingStructureData,
  getPlantingStructureOptions,
  plotGeoJson,
  yieldValueData,
  getYieldValueOptions,
  alertTrendData,
  getAlertTrendOptions,
  deviceStatusData,
  getDeviceStatusOptions,
  soilMoistureData,
  getSoilMoistureOptions
} from '@/mock/dashboard.js';
import { gisLayers } from '@/mock/gis.js';

const gisMapRef = ref(null);
const metrics = ref(topMetrics)
const alerts = ref(alertsList)
const plots = ref(plotGeoJson)
const gisLayersData = ref(gisLayers);

const themeColors = {
  titleColor: '#ffffff',
  textColor: '#c0c4cc',
  axisLineColor: 'rgba(255, 255, 255, 0.3)',
  splitLineColor: 'rgba(255, 255, 255, 0.1)',
};

const plantingStructureOptions = computed(() => getPlantingStructureOptions(plantingStructureData, themeColors));
const yieldValueOptions = computed(() => getYieldValueOptions(yieldValueData, themeColors));
const alertTrendOptions = computed(() => getAlertTrendOptions(alertTrendData, themeColors));
const deviceStatusOptions = computed(() => getDeviceStatusOptions(deviceStatusData, themeColors));
const soilMoistureOptions = computed(() => getSoilMoistureOptions(soilMoistureData, themeColors));

const handleAlertClick = (item) => {
  if (item.location && gisMapRef.value) {
    gisMapRef.value.flyTo({
      center: [item.location.lng, item.location.lat],
      zoom: item.location.zoom,
      speed: 1.2,
    });
  }
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
  left: 20px;
  right: 20px;
  width: calc(100% - 40px);
}

.left-column,
.right-column {
  top: 140px; /* Adjust based on top-metrics height */
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
</style> 