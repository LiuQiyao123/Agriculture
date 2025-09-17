<template>
  <AnalysisPageLayout>
    <template #title>墒情分析与旱情预测</template>
    
    <template #filter-bar>
      <FilterBar v-model="filters" :fields="filterFields" />
    </template>

    <template #map>
      <DataPanel title="土壤墒情空间分布图">
        <GisMap
          ref="gisMapRef"
          :show-layer-control="false"
          :show-sensors="false"
          :geojson="processedPlots"
        />
      </DataPanel>
    </template>

    <template #ai-panels>
      <AIPanel title="AI模型透明度" :content="modelTransparencyContent" class="ai-panel-transparency" />
      <AIPanel title="智能决策建议" :content="decisionSuggestionContent" class="ai-panel-suggestion" />
      <DataPanel title="预测结果" class="ai-panel-validation">
        <EchartsWrapper ref="validationChartRef" :options="validationChartOptions" />
      </DataPanel>
    </template>

    <template #table>
      <AnalysisDataTable
        :ref="tableRef"
        title="干旱预警地块列表"
        :data="filteredTableData"
        @current-change="handleCurrentChange"
      >
        <el-table-column prop="plotName" label="地块名称" />
        <el-table-column prop="warningType" label="预警类型" />
        <el-table-column prop="warningLevel" label="预警级别">
          <template #default="{ row }">
            <el-tag :type="row.tagType">{{ row.warningLevel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="confidence" label="AI预测置信度" />
        <el-table-column prop="suggestion" label="处置建议" />
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
import { useMoistureData } from '@/composables/useMoistureData.js';

const gisMapRef = ref(null);
const tableRef = ref(null);

const {
  validationChartRef,
  filters,
  filterFields,
  filteredTableData,
  validationChartOptions,
  processedPlots,
  modelTransparencyContent,
  decisionSuggestionContent,
  handleCurrentChange,
} = useMoistureData(gisMapRef, tableRef);
</script>

<style scoped lang="scss">
/* 
  Use :deep to apply a high-priority override to the grid layout,
  ensuring the validation panel spans both columns. This is a robust
  way to handle stubborn caching or specificity issues.
*/
:deep(.grid-ai-panels .ai-panel-validation) {
  grid-column: 1 / -1;
}
</style> 