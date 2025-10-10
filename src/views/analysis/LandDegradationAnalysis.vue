<template>
  <AnalysisPageLayout>
    <template #title>土地退化监测</template>

    <template #filter-bar>
      <FilterBar v-model="filters" :fields="filterFields" />
    </template>

    <template #map>
      <DataPanel title="地力退化程度分布图">
        <BaseMap
          ref="baseMapRef"
          :layers="mapLayers"
        />
        
      </DataPanel>
    </template>
    
    <template #ai-panels>
      <DataPanel title="AI智能分析">
        <AIPanel :content="aiAnalysisContent" :explanation="analysisExplanation" />
      </DataPanel>
      <DataPanel title="地力退化程度分布图">
        <EchartsWrapper :options="pieChartOptions" height="300px" />
      </DataPanel>
    </template>

    <template #table>
      <AnalysisDataTable
        ref="tableRef"
        title="地力退化详情列表"
        :data="filteredTableData"
        @current-change="handleCurrentChange"
      >
        <el-table-column prop="plot" label="地块" />
        <el-table-column prop="crop" label="主要作物" />
        <el-table-column prop="degradationLevel" label="退化等级">
           <template #default="{ row }">
            <el-tag :type="row.degradationLevel === '严重' ? 'danger' : row.degradationLevel === '中度' ? 'warning' : 'info'">
              {{ row.degradationLevel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="organicMatter" label="有机质含量(g/kg)" />
        <el-table-column prop="ph" label="土壤pH值" />
        <el-table-column prop="salinity" label="盐分含量(g/L)" />
        <el-table-column prop="mainReason" label="主要退化原因" />
      </AnalysisDataTable>
    </template>
  </AnalysisPageLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import DataPanel from '@/components/DataPanel.vue';
import BaseMap from '@/components/map/BaseMap.vue';
import LayerControl from '@/components/map/controls/LayerControl.vue';
import AnalysisPageLayout from '@/components/layouts/AnalysisPageLayout.vue';
import FilterBar from '@/components/forms/FilterBar.vue';
import AnalysisDataTable from '@/components/tables/AnalysisDataTable.vue';
import AIPanel from '@/components/AIPanel.vue';
import EchartsWrapper from '@/components/EchartsWrapper.vue';
import { useLandDegradationData } from '@/composables/useLandDegradationData.js';

const baseMapRef = ref(null);
const tableRef = ref(null);

// --- Map State Management ---
const analysisLayers = ref([
  { id: 'plots', name: '地块边界', exclusive: false, defaultVisibility: true },
  { id: 'degradation-level', name: '地力退化等级', exclusive: true, defaultVisibility: true },
]);
const initialActiveLayers = ['plots', 'degradation-level'];
const layerVisibilities = ref({
  'plots': true,
  'degradation-level': true,
});

const handleLayerVisibilityChange = ({ layerId, visible }) => {
  layerVisibilities.value[layerId] = visible;
};

const {
  processedPlots,
  filters,
  filterFields,
  filteredTableData,
  handleCurrentChange,
  aiAnalysisContent,
  analysisExplanation
} = useLandDegradationData(baseMapRef, tableRef);


const mapLayers = computed(() => {
  const finalLayers = {};
  
  if (layerVisibilities.value['plots']) {
    finalLayers['plots'] = {
      data: processedPlots.value,
      type: 'fill',
      paint: { 'fill-color': '#cccccc', 'fill-opacity': 0.1 }
    };
     finalLayers['plots-outline'] = {
      data: processedPlots.value,
      type: 'line',
      paint: { 'line-color': '#ffffff', 'line-width': 1 }
    };
  }
  
  if (layerVisibilities.value['degradation-level']) {
    finalLayers['degradation-fill'] = {
       data: processedPlots.value,
       type: 'fill',
       paint: {
        'fill-color': [
          'match',
          ['get', 'degradationLevel'],
          '严重', '#F56C6C',
          '中度', '#E6A23C',
          '轻微', '#409EFF',
          '#cccccc'
        ],
        'fill-opacity': 0.7
       }
    };
  }
  
  return finalLayers;
});

const tableColumns = [
  { prop: 'plot', label: '地块' },
  { prop: 'crop', label: '主要作物' },
  { prop: 'degradationLevel', label: '退化等级' },
  { prop: 'organicMatter', label: '有机质含量(g/kg)' },
  { prop: 'ph', label: '土壤pH值' },
  { prop: 'salinity', label: '盐分含量(g/L)' },
  { prop: 'mainReason', label: '主要原因' },
];

const pieChartOptions = computed(() => {
  const stats = filteredTableData.value.reduce((acc, item) => {
    if (!acc[item.degradationLevel]) {
      acc[item.degradationLevel] = 0;
    }
    acc[item.degradationLevel]++;
    return acc;
  }, {});

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderColor: '#333',
      textStyle: { color: '#fff' }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: {
        color: '#ccc'
      }
    },
    series: [
      {
        name: '退化等级',
        type: 'pie',
        radius: '70%',
        center: ['65%', '50%'],
        data: Object.keys(stats).map(key => ({ value: stats[key], name: key })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ],
    color: ['#F56C6C', '#E6A23C', '#67C23A', '#409EFF'] // Severe, Moderate, Slight
  };
});

</script>

<style scoped lang="scss">
.map-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}
</style> 