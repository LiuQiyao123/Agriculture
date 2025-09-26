<template>
  <AnalysisPageLayout>
    <template #title>土壤墒情监测</template>

    <template #filter-bar>
      <FilterBar v-model="filters" :fields="filterFields" />
    </template>

    <template #map>
      <DataPanel title="土壤墒情分布图">
        <BaseMap
          ref="baseMapRef"
          :layers="mapLayers"
        />
      </DataPanel>
    </template>

    <template #ai-panels>
      <DiagnosisPanel v-if="diagnosisContent" :content="diagnosisContent" />
      <AdvicePanel v-if="suggestionContent" :content="suggestionContent" />
       <DataPanel title="墒情预警等级分布">
        <EchartsWrapper :options="moisturePieChartOptions" />
      </DataPanel>
    </template>

    <template #table>
      <AnalysisDataTable
        ref="tableRef"
        title="土壤墒情详情列表"
        :data="tableData"
        @current-change="handleCurrentChange"
      >
        <el-table-column prop="plotId" label="地块ID" />
        <el-table-column prop="moistureLevel" label="土壤湿度" />
        <el-table-column prop="optimalRange" label="适宜范围" />
        <el-table-column prop="timestamp" label="监测时间" />
        <el-table-column prop="alertLevel" label="预警等级">
           <template #default="{ row }">
            <el-tag :type="getAlertTagType(row.alertLevel)">
              {{ row.alertLevel }}
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
import { useMoistureData } from '@/composables/useMoistureData.js';

const baseMapRef = ref(null);
const tableRef = ref(null);

const {
  tableData, filterFields, filters, processedPlots,
  handleCurrentChange, diagnosisContent, suggestionContent,
  moisturePieChartOptions,
} = useMoistureData(baseMapRef, tableRef);

const mapLayers = computed(() => {
  const plots = {
    data: processedPlots.value,
    type: 'fill',
    paint: {
      'fill-color': [
        'match',
        ['get', 'alertLevel'],
        '中度干旱', '#f56c6c',
        '轻度干旱', '#e6a23c',
        '适中', '#52c41a',
        '过湿', '#409eff',
        '#cccccc' // default
      ],
      'fill-opacity': 0.7
    }
  };
  return { plots };
});

const getAlertTagType = (level) => {
  if (level.includes('干旱')) return 'danger';
  if (level.includes('过湿')) return 'warning';
  return 'success';
};
</script>

<style scoped lang="scss">
/* Scoped styles can be added here if needed */
</style> 