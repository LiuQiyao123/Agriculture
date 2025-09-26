<template>
  <AnalysisPageLayout>
    <template #title>土壤健康诊断</template>

    <template #filter-bar>
      <FilterBar v-model="filters" :fields="filterFields" />
    </template>

    <template #map>
      <DataPanel title="土壤健康状况分布图">
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
          <el-tab-pane label="土壤健康雷达图" name="radar">
            <EchartsWrapper :options="healthRadarChartOptions" />
          </el-tab-pane>
          <el-tab-pane label="关键指标趋势" name="trend">
            <EchartsWrapper :options="soilPropertyTrendOptions" />
          </el-tab-pane>
        </el-tabs>
      </DataPanel>
    </template>

    <template #table>
      <AnalysisDataTable
        ref="tableRef"
        title="土壤健康诊断详情列表"
        :data="tableData"
        @current-change="handleCurrentChange"
      >
        <el-table-column prop="plotId" label="地块ID" />
        <el-table-column prop="ph" label="酸碱度(pH)" />
        <el-table-column prop="organicMatter" label="有机质" />
        <el-table-column prop="nitrogen" label="速效氮" />
        <el-table-column prop="phosphorus" label="速效磷" />
        <el-table-column prop="potassium" label="速效钾" />
        <el-table-column prop="overallHealth" label="综合健康评价">
          <template #default="{ row }">
            <el-tag :type="getHealthTagType(row.overallHealth)">
              {{ row.overallHealth }}
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
import { useSoilQualityData } from '@/composables/useSoilQualityData.js';

const baseMapRef = ref(null);
const tableRef = ref(null);
const activeChart = ref('radar');

const {
  tableData,
  filterFields,
  processedPlots,
  handleCurrentChange,
  currentRow,
  diagnosisContent,
  suggestionContent,
  healthRadarChartOptions,
  soilPropertyTrendOptions,
  filters, // Assuming filters are exposed from composable
} = useSoilQualityData(baseMapRef, tableRef); // Pass tableRef


const mapLayers = computed(() => {
  const plots = {
    data: processedPlots.value,
    type: 'fill',
    paint: {
      'fill-color': [
        'match',
        ['get', 'overallHealth'],
        '良好', '#52c41a',
        '中等', '#e6a23c',
        '较差', '#f56c6c',
        '#cccccc' // default
      ],
      'fill-opacity': 0.7
    }
  };
  return { plots };
});

const getHealthTagType = (level) => {
  if (level === '良好') return 'success';
  if (level === '中等') return 'warning';
  if (level === '较差') return 'danger';
  return 'info';
};
</script>

<style scoped lang="scss">
/* Scoped styles can be added here if needed */
</style> 