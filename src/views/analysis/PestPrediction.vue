<template>
  <AnalysisPageLayout>
    <template #title>病虫害风险预警</template>

    <template #filter-bar>
      <FilterBar v-model="filters" :fields="filterFields" />
    </template>

    <template #map>
      <DataPanel title="病虫害风险分布图">
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
          <el-tab-pane label="风险等级分布" name="pie">
            <EchartsWrapper :options="riskPieChartOptions" />
          </el-tab-pane>
          <el-tab-pane label="病虫害类型分布" name="bar">
            <EchartsWrapper :options="pestTypeBarChartOptions" />
          </el-tab-pane>
        </el-tabs>
      </DataPanel>
    </template>

    <template #table>
      <AnalysisDataTable
        ref="tableRef"
        title="病虫害风险详情列表"
        :data="tableData"
        @current-change="handleCurrentChange"
      >
        <el-table-column prop="plotId" label="地块ID" />
        <el-table-column prop="pestType" label="病虫害类型" />
        <el-table-column prop="probability" label="发生概率" />
        <el-table-column prop="monitoringTime" label="监测时间" />
        <el-table-column prop="riskLevel" label="风险等级">
          <template #default="{ row }">
            <el-tag :type="getRiskTagType(row.riskLevel)">
              {{ row.riskLevel }}
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
import { usePestPredictionData } from '@/composables/usePestPredictionData.js';

const baseMapRef = ref(null);
const tableRef = ref(null);
const activeChart = ref('pie');

const {
  tableData, filterFields, filters, processedPlots,
  handleCurrentChange, diagnosisContent, suggestionContent,
  riskPieChartOptions, pestTypeBarChartOptions,
} = usePestPredictionData(baseMapRef, tableRef);

const mapLayers = computed(() => {
  const plots = {
    data: processedPlots.value,
    type: 'fill',
    paint: {
      'fill-color': [
        'match',
        ['get', 'riskLevel'],
        '高风险', '#f56c6c',
        '中风险', '#e6a23c',
        '低风险', '#52c41a',
        '#cccccc' // default
      ],
      'fill-opacity': 0.7
    }
  };
  return { plots };
});

const getRiskTagType = (level) => {
  if (level === '高风险') return 'danger';
  if (level === '中风险') return 'warning';
  return 'success';
};
</script>

<style scoped lang="scss">
/* Scoped styles can be added here if needed */
</style> 