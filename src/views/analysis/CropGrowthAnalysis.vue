<template>
  <AnalysisPageLayout>
    <template #title>作物长势遥感监测</template>

    <template #filter-bar>
      <FilterBar v-model="filters" :fields="filterFields" />
    </template>

    <template #map>
      <DataPanel title="作物长势NDVI分布图">
        <GisMap
          ref="gisMapRef"
          :show-layer-control="false"
          :show-sensors="false"
          :geojson="processedPlots"
        />
      </DataPanel>
    </template>

    <template #ai-panels>
      <AIPanel title="AI长势诊断" :content="diagnosisContent" />
      <AIPanel title="智能决策建议" :content="suggestionContent" />
      <DataPanel title="NDVI变化趋势验证" class="ai-panel-validation">
        <EchartsWrapper ref="validationChartRef" :options="validationChartOptions" />
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
        <el-table-column prop="growth" label="长势">
          <template #default="{ row }">
            <el-tag :type="row.growth === '良好' ? 'success' : row.growth === '中等' ? 'warning' : 'danger'">
              {{ row.growth }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ndvi" label="平均NDVI" />
        <el-table-column prop="date" label="监测日期" />
      </AnalysisDataTable>
    </template>
  </AnalysisPageLayout>
</template>

<script setup>
import { ref } from 'vue';
import DataPanel from '@/components/DataPanel.vue';
import GisMap from '@/components/GisMap.vue';
import EchartsWrapper from '@/components/EchartsWrapper.vue';
import AIPanel from '@/components/AIPanel.vue';
import AnalysisPageLayout from '@/components/layouts/AnalysisPageLayout.vue';
import FilterBar from '@/components/forms/FilterBar.vue';
import AnalysisDataTable from '@/components/tables/AnalysisDataTable.vue';
import { useCropGrowthData } from '@/composables/useCropGrowthData.js';

const gisMapRef = ref(null);
const tableRef = ref(null);

const {
  validationChartRef,
  processedPlots,
  filters,
  filterFields,
  filteredTableData,
  handleCurrentChange,
  validationChartOptions,
  diagnosisContent,
  suggestionContent,
} = useCropGrowthData(gisMapRef, tableRef);
</script>

<style scoped lang="scss">
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