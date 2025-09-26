<template>
  <AnalysisPageLayout>
    <template #title>作物产量预测</template>

    <template #filter-bar>
      <FilterBar v-model="filters" :fields="filterFields" />
    </template>

    <template #map>
      <DataPanel title="作物产量预测空间分布图">
        <BaseMap
          ref="baseMapRef"
          :layers="mapLayers"
        />
      </DataPanel>
    </template>

    <template #ai-panels>
      <DiagnosisPanel v-if="diagnosisContent" :content="diagnosisContent" />
      <AdvicePanel v-if="suggestionContent" :content="suggestionContent" />
      <DataPanel title="AI分析图表">
        <el-tabs v-model="activeChart">
          <el-tab-pane label="产量对比图" name="bar">
            <EchartsWrapper :options="yieldBarChartOptions" />
          </el-tab-pane>
          <el-tab-pane label="产量趋势预测" name="trend">
            <EchartsWrapper :options="yieldTrendChartOptions" />
          </el-tab-pane>
        </el-tabs>
      </DataPanel>
    </template>

    <template #table>
      <AnalysisDataTable
        ref="tableRef"
        title="作物产量预测详情列表"
        :data="tableData"
        @current-change="handleCurrentChange"
      >
        <el-table-column prop="plotId" label="地块ID" />
        <el-table-column prop="cropType" label="作物类型" />
        <el-table-column prop="predictedYield" label="预测产量" />
        <el-table-column prop="confidence" label="置信度" />
        <el-table-column prop="harvestDate" label="预计收获日期" />
        <el-table-column prop="status" label="状态">
           <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </AnalysisDataTable>
    </template>
  </AnalysisPageLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import AnalysisPageLayout from '@/components/layouts/AnalysisPageLayout.vue';
import DataPanel from '@/components/DataPanel.vue';
import BaseMap from '@/components/map/BaseMap.vue';
import FilterBar from '@/components/forms/FilterBar.vue';
import AnalysisDataTable from '@/components/tables/AnalysisDataTable.vue';
import EchartsWrapper from '@/components/EchartsWrapper.vue';
import DiagnosisPanel from '@/components/DiagnosisPanel.vue';
import AdvicePanel from '@/components/AdvicePanel.vue';
import { useYieldPredictionData } from '@/composables/useYieldPredictionData.js';

const baseMapRef = ref(null);
const tableRef = ref(null);
const activeChart = ref('bar');

const {
  tableData,
  filterFields,
  filters,
  processedPlots,
  handleCurrentChange,
  diagnosisContent,
  suggestionContent,
  yieldBarChartOptions,
  yieldTrendChartOptions,
} = useYieldPredictionData(baseMapRef, tableRef); // Pass tableRef

const mapLayers = computed(() => {
  const plots = {
    data: processedPlots.value,
    type: 'fill',
    paint: {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['to-number', ['slice', ['get', 'predictedYield'], 0, 4]],
        4, '#f56c6c',   // Low yield
        8, '#e6a23c',   // Medium yield
        12, '#52c41a'  // High yield
      ],
      'fill-opacity': 0.7
    }
  };
  return { plots };
});

const getStatusTagType = (status) => {
  if (status === '长势良好') return 'success';
  if (status.includes('风险') || status.includes('预警')) return 'danger';
  return 'info';
};
</script>

<style scoped lang="scss">
/* Scoped styles can be added here if needed */
</style> 