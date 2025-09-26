<template>
  <AnalysisPageLayout>
    <template #title>作物长势分析</template>

    <template #filter-bar>
      <FilterBar v-model="filters" :fields="filterFields" />
    </template>

    <template #map>
      <DataPanel title="作物长势NDVI分布图">
        <BaseMap
          ref="baseMapRef"
          :layers="mapLayers"
        />
        <!-- Map Controls are now part of the page layout, not the map component -->
        
      </DataPanel>
    </template>

    <template #ai-panels>
      <DiagnosisPanel :content="diagnosisContent" />
      <AdvicePanel :content="suggestionContent" />
      <DataPanel title="AI分析图表" class="health-radar-chart">
        <el-tabs v-model="activeChart" class="chart-tabs">
          <el-tab-pane label="作物健康雷达图" name="radar">
            <div class="radar-container">
              <div class="radar-analysis-layout">
                <!-- 左侧卡片 -->
                <div class="left-cards">
                  <div class="analysis-card" data-indicator="moisture">
                    <div class="card-score">{{ currentRow?.healthModel?.scores?.moisture?.score ? (currentRow.healthModel.scores.moisture.score * 100).toFixed(0) : '0' }} <small>分</small></div>
                    <div class="card-reasoning">{{ currentRow?.healthModel?.scores?.moisture?.reasoning || '土壤水分充足。' }}</div>
                    <!-- 连接线 -->
                    <div class="connection-line line-to-top"></div>
                  </div>
                  <div class="analysis-card" data-indicator="vigor">
                    <div class="card-score">{{ currentRow?.healthModel?.scores?.vigor?.score ? (currentRow.healthModel.scores.vigor.score * 100).toFixed(0) : '0' }} <small>分</small></div>
                    <div class="card-reasoning">{{ currentRow?.healthModel?.scores?.vigor?.reasoning || '作物生长活力强劲。' }}</div>
                    <!-- 连接线 -->
                    <div class="connection-line line-to-bottom"></div>
                  </div>
                </div>
                
                <!-- 中央雷达图 -->
                <div class="center-radar">
                  <EchartsWrapper ref="healthRadarChartRef" :options="healthRadarChartOptions" />
                </div>
                
                <!-- 右侧卡片 -->
                <div class="right-cards">
                  <div class="analysis-card" data-indicator="nutrients">
                    <div class="card-score">{{ currentRow?.healthModel?.scores?.nutrients?.score ? (currentRow.healthModel.scores.nutrients.score * 100).toFixed(0) : '0' }} <small>分</small></div>
                    <div class="card-reasoning">{{ currentRow?.healthModel?.scores?.nutrients?.reasoning || '作物营养状况良好。' }}</div>
                    <!-- 连接线 -->
                    <div class="connection-line line-to-top"></div>
                  </div>
                  <div class="analysis-card" data-indicator="environment">
                    <div class="card-score">{{ currentRow?.healthModel?.scores?.environment?.score ? (currentRow.healthModel.scores.environment.score * 100).toFixed(0) : '0' }} <small>分</small></div>
                    <div class="card-reasoning">{{ currentRow?.healthModel?.scores?.environment?.reasoning || '环境温度适宜。' }}</div>
                    <!-- 连接线 -->
                    <div class="connection-line line-to-bottom"></div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="NDVI变化趋势" name="ndvi">
             <EchartsWrapper ref="ndviTrendChartRef" :options="ndviTrendChartOptions" />
          </el-tab-pane>
        </el-tabs>
      </DataPanel>
    </template>

    <template #table>
      <AnalysisDataTable
        ref="tableRef"
        title="作物长势详情列表"
        :data="filteredTableData"
        @current-change="handleCurrentChange"
      >
        <el-table-column prop="plot" label="地块" />
        <el-table-column prop="crop" label="作物" />
        <el-table-column prop="growthStage" label="生长阶段" />
        <el-table-column prop="growth" label="综合长势评估">
          <template #default="{ row }">
            <el-tag :type="row.growth === '良好' ? 'success' : row.growth === '中等' ? 'warning' : 'danger'">
              {{ row.growth }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="growthTrend" label="长势变化趋势">
          <template #default="{ row }">
            <span :style="{ color: row.growthTrend > 0 ? '#67C23A' : '#F56C6C' }">
              {{ (row.growthTrend * 100).toFixed(1) }}%
              <el-icon v-if="row.growthTrend > 0"><CaretTop /></el-icon>
              <el-icon v-else><CaretBottom /></el-icon>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="primaryRisk" label="主要胁迫风险" />
        <el-table-column prop="soilMoisture" label="土壤湿度">
          <template #default="{ row }">
            {{ (row.soilMoisture * 100).toFixed(0) }}%
          </template>
        </el-table-column>
        <el-table-column prop="decisionPriority" label="决策优先级">
          <template #default="{ row }">
            <el-tag :type="row.decisionPriority === '高' ? 'danger' : row.decisionPriority === '中' ? 'warning' : 'info'">
              {{ row.decisionPriority }}
            </el-tag>
          </template>
        </el-table-column>
      </AnalysisDataTable>
    </template>
  </AnalysisPageLayout>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import { CaretTop, CaretBottom } from '@element-plus/icons-vue';
import DataPanel from '@/components/DataPanel.vue';
import BaseMap from '@/components/map/BaseMap.vue';
import LayerControl from '@/components/map/controls/LayerControl.vue';
import EchartsWrapper from '@/components/EchartsWrapper.vue';
import AnalysisPageLayout from '@/components/layouts/AnalysisPageLayout.vue';
import FilterBar from '@/components/forms/FilterBar.vue';
import AnalysisDataTable from '@/components/tables/AnalysisDataTable.vue';
import { useCropGrowthData } from '@/composables/useCropGrowthData.js';
import DiagnosisPanel from '@/components/DiagnosisPanel.vue';
import AdvicePanel from '@/components/AdvicePanel.vue';

const baseMapRef = ref(null);
const tableRef = ref(null);
const healthRadarChartRef = ref(null);
const ndviTrendChartRef = ref(null);
const activeChart = ref('radar');

// --- Map State Management ---
const analysisLayers = ref([
  { id: 'plots', name: '地块边界', exclusive: false, defaultVisibility: true },
  { id: 'ndvi-tiles', name: '作物长势(NDVI)', exclusive: true, defaultVisibility: true },
  { id: 'soil-moisture', name: '土壤墒情', exclusive: true, defaultVisibility: false },
  // ... add other analysis layers here
]);
const initialActiveLayers = ['plots', 'ndvi-tiles'];
const layerVisibilities = ref({
  'plots': true,
  'ndvi-tiles': true,
  'soil-moisture': false,
});

const handleLayerVisibilityChange = ({ layerId, visible }) => {
  layerVisibilities.value[layerId] = visible;
};

const mapLayers = computed(() => {
  // Base plot layers
  const plots = {
    data: processedPlots.value, // This comes from useCropGrowthData
    type: 'fill',
    paint: { 
      'fill-color': [
        'case',
        ['has', 'ndviColor'], ['get', 'ndviColor'],
        '#cccccc' 
      ],
      'fill-opacity': 0.7 
    }
  };

  // NDVI raster layer from a tile source (example)
  const ndviTiles = {
    type: 'raster',
    source: {
      type: 'raster',
      tiles: ['/tiles/ndvi/{z}/{x}/{y}.png'],
      tileSize: 256
    },
    paint: { 'raster-opacity': 0.6 }
  };
  
  const finalLayers = {};
  if (layerVisibilities.value['plots']) {
    finalLayers['plots'] = plots;
  }
  if (layerVisibilities.value['ndvi-tiles']) {
    // This example assumes a tile source is pre-registered in BaseMap or passed differently.
    // For now, let's just control the plot coloring based on NDVI.
  }
  
  // A better approach for raster would be to have BaseMap handle sources.
  // For now, we drive plot colors via NDVI values.
  
  return finalLayers;
});


const {
  processedPlots,
  filters,
  filterFields,
  filteredTableData,
  handleCurrentChange,
  validationChartOptions,
  diagnosisContent,
  suggestionContent,
  executeScheme,
  healthRadarChartOptions,
  ndviTrendChartOptions,
  currentRow,
} = useCropGrowthData(baseMapRef, tableRef);

watch([activeChart, healthRadarChartOptions, ndviTrendChartOptions], () => {
  nextTick(() => {
    if (activeChart.value === 'radar' && healthRadarChartRef.value) {
      healthRadarChartRef.value.initChart();
    }
    if (activeChart.value === 'ndvi' && ndviTrendChartRef.value) {
      ndviTrendChartRef.value.initChart();
    }
  });
}, { deep: true });
</script>

<style scoped lang="scss">
.map-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}
:deep(.health-radar-chart) {
  min-height: 500px; /* Increase minimum height */
  height: auto; /* Let it grow as needed */
  flex-shrink: 0; /* Prevent shrinking */
}

:deep(.chart-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;

  .el-tabs__header {
    flex-shrink: 0;
  }
  .el-tabs__content {
    flex-grow: 1;
    min-height: 0;
    .el-tab-pane {
      height: 100%;
    }
  }
}

.radar-container {
  height: 100%;
  min-height: 400px;
}

.radar-analysis-layout {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr; /* 左卡片 | 雷达图 | 右卡片 */
  grid-template-rows: 1fr;
  height: 100%;
  align-items: center;
  gap: 20px;
  position: relative;
}

.left-cards, .right-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  justify-content: center;
}

.center-radar {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.analysis-card {
  border: 1px solid rgba(64, 158, 255, 0.3);
  border-radius: 8px;
  padding: 15px;
  background-color: rgba(64, 158, 255, 0.05);
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 80px;
  backdrop-filter: blur(10px);
}

.connection-line {
  position: absolute;
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.6), rgba(64, 158, 255, 0.2));
  height: 2px;
  z-index: 1;
}

.left-cards .connection-line {
  right: -20px;
  width: 20px;
}

.right-cards .connection-line {
  left: -20px;
  width: 20px;
}

.line-to-top {
  top: 30%;
}

.line-to-bottom {
  bottom: 30%;
}
.card-title {
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 5px;
}
.card-score {
  font-size: 20px;
  font-weight: bold;
  color: var(--el-color-primary);
  margin-bottom: 5px;
  small {
    font-size: 12px;
  }
}
.card-reasoning {
  font-size: 12px;
  color: var(--color-text-soft);
  line-height: 1.5;
  flex-grow: 1;
}

/* Using :deep to style components inside el-tabs */
:deep(.content-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;

  .el-tabs__header {
    flex-shrink: 0;
    margin: 0;
    padding: 0 15px;
  }
  
  .el-tabs__content {
    flex-grow: 1;
    min-height: 0;
  }

  .el-tab-pane {
    height: 100%;
  }
}

:deep(.ai-panel-validation) {
  grid-column: 1 / -1;
}
</style> 