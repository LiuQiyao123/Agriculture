<template>
  <AnalysisPageLayout>
    <template #title>土壤质量分析与改良决策</template>
    
    <template #filter-bar>
      <FilterBar v-model="filters" :fields="filterFields" />
    </template>

    <template #map>
      <DataPanel title="土壤有机质含量分布图">
        <GisMap
          :ref="gisMapRef"
          :show-layer-control="false"
          :show-sensors="false"
          :geojson="processedPlots"
        />
      </DataPanel>
    </template>

    <template #ai-panels>
      <AIPanel title="AI 土壤改良建议" :content="suggestionContent" />
    </template>

    <template #table>
      <AnalysisDataTable
        :ref="tableRef"
        title="土壤质量指标详情"
        :data="filteredTableData"
        @current-change="handleCurrentChange"
      >
        <el-table-column prop="region" label="区域" />
        <el-table-column prop="level" label="肥力等级">
            <template #default="{ row }">
            <el-tag :type="row.level === '贫瘠' ? 'danger' : row.level === '较差' ? 'warning' : 'success'">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="organicMatter" label="有机质" />
        <el-table-column prop="nitrogen" label="速效氮(mg/kg)" />
        <el-table-column prop="phosphorus" label="速效磷(mg/kg)" />
        <el-table-column prop="potassium" label="速效钾(mg/kg)" />
      </AnalysisDataTable>
    </template>
  </AnalysisPageLayout>
</template>

<script setup>
import { ref } from 'vue';
import DataPanel from '@/components/DataPanel.vue';
import GisMap from '@/components/GisMap.vue';
import AIPanel from '@/components/AIPanel.vue';
import AnalysisPageLayout from '@/components/layouts/AnalysisPageLayout.vue';
import FilterBar from '@/components/forms/FilterBar.vue';
import AnalysisDataTable from '@/components/tables/AnalysisDataTable.vue';
import { useSoilQualityData } from '@/composables/useSoilQualityData.js';

const gisMapRef = ref(null);
const tableRef = ref(null);

const {
  processedPlots,
  filters,
  filterFields,
  filteredTableData,
  handleCurrentChange,
  suggestionContent,
} = useSoilQualityData(gisMapRef, tableRef);
</script>

<style scoped lang="scss">
/* Layout is handled by AnalysisPageLayout.vue */
</style>
