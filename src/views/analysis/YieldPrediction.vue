<template>
  <div class="page-container">
    <h1 class="page-title">产量预测与估算</h1>
    <div class="filter-bar">
      <el-form :inline="true" :model="filters" @submit.prevent>
        <el-form-item label="作物品种">
          <el-select v-model="filters.crop" placeholder="请选择品种" clearable>
            <el-option label="玉米" value="玉米" />
            <el-option label="水稻" value="水稻" />
            <el-option label="小麦" value="小麦" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="content-wrapper">
      <div class="main-content">
        <DataPanel title="地块产量GIS视图" class="map-panel">
          <GisMap :show-layer-control="false" :show-sensors="false" />
        </DataPanel>
        <div class="ai-panels-container">
          <DataPanel title="产量预测对比">
            <EchartsWrapper :options="barChartOptions" />
          </DataPanel>
          <AIPanel title="AI 智能分析" :content="suggestionContent" />
        </div>
      </div>
      <DataPanel title="地块产量预测详情" class="table-panel">
        <el-table 
          :ref="tableRef"
          :data="filteredTableData" 
          style="width: 100%" 
          height="100%" 
          class="dark-table"
          highlight-current-row
        >
          <el-table-column prop="plotId" label="地块编号" />
          <el-table-column prop="crop" label="作物品种" />
          <el-table-column prop="currentYield" label="当前产量(公斤/亩)" />
          <el-table-column prop="predictedYield" label="预测产量(公斤/亩)" />
          <el-table-column prop="diff" label="变化率">
             <template #default="{ row }">
              <span :class="row.diff.startsWith('+') ? 'positive' : 'negative'">
                {{ row.diff }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </DataPanel>
    </div>
  </div>
</template>

<script setup>
import DataPanel from '@/components/DataPanel.vue';
import EchartsWrapper from '@/components/EchartsWrapper.vue';
import GisMap from '@/components/GisMap.vue';
import AIPanel from '@/components/AIPanel.vue';
import { useYieldData } from '@/composables/useYieldData.js';

const {
  tableRef,
  filters,
  filteredTableData,
  barChartOptions,
  suggestionContent,
} = useYieldData();
</script>

<style scoped lang="scss">
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-title {
  color: #a0a6b8;
  font-size: 18px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.filter-bar {
  flex-shrink: 0;
  margin-bottom: 16px;
}

.content-wrapper {
  flex-grow: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-content {
  flex-grow: 1;
  min-height: 0;
  display: flex;
  gap: 16px;
}

.map-panel {
  flex: 3;
  min-width: 0;
}

.ai-panels-container {
  flex: 2;
  min-width: 0;
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
}

.table-panel {
  flex-shrink: 0;
  height: 220px;
}
</style> 