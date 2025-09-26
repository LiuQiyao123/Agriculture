<template>
  <AnalysisPageLayout>
    <template #title>农业气象预警</template>

    <template #filter-bar>
      <FilterBar v-model="filters" :fields="filterFields" />
    </template>

    <template #map>
      <DataPanel title="气象预警空间分布图">
        <BaseMap
          ref="baseMapRef"
          :layers="mapLayers"
        />
      </DataPanel>
    </template>

    <template #ai-panels>
      <DiagnosisPanel v-if="diagnosisContent" :content="diagnosisContent" />
      <AdvicePanel v-if="suggestionContent" :content="suggestionContent" />
      <DataPanel title="预警类型分布">
        <EchartsWrapper :options="alertTypeChartOptions" />
      </DataPanel>
    </template>

    <template #table>
      <AnalysisDataTable
        ref="tableRef"
        title="农业气象预警详情列表"
        :data="alertData"
        @current-change="handleCurrentChange"
      >
        <el-table-column prop="county" label="区县" />
        <el-table-column prop="alertType" label="预警类型" />
        <el-table-column prop="startTime" label="开始时间" />
        <el-table-column prop="endTime" label="结束时间" />
        <el-table-column prop="alertLevel" label="预警等级">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.alertLevel)">
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
import { useWeatherAlertData } from '@/composables/useWeatherAlertData.js';

const baseMapRef = ref(null);
const tableRef = ref(null);

const {
  alertData, filterFields, filters, processedAlertAreas,
  handleCurrentChange, diagnosisContent, suggestionContent,
  alertTypeChartOptions,
} = useWeatherAlertData(baseMapRef, tableRef);

const mapLayers = computed(() => {
  const alertsLayer = {
    data: processedAlertAreas.value,
    type: 'fill',
    paint: {
      'fill-color': [
        'case',
        ['boolean', ['get', 'hasAlert'], false],
          ['match', ['get', 'alertLevel'],
            '红色', '#f56c6c',
            '橙色', '#f56c6c', // Using same for orange for visibility
            '黄色', '#e6a23c',
            '蓝色', '#409eff',
            '#cccccc' // Default color for unhandled alert levels
          ],
        'transparent' // No alert
      ],
      'fill-opacity': 0.6,
      'fill-outline-color': '#fff'
    }
  };
  return { alerts: alertsLayer };
});

const getLevelTagType = (level) => {
  if (level.includes('红色') || level.includes('橙色')) return 'danger';
  if (level.includes('黄色')) return 'warning';
  return 'primary';
};
</script>

<style scoped lang="scss">
/* Scoped styles can be added here if needed */
</style>
