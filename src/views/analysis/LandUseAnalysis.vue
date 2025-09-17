<template>
  <div class="page-container">
    <h1 class="page-title">土地用途分析</h1>
    <div class="filter-bar">
      <el-form :inline="true" :model="filters" @submit.prevent>
        <el-form-item label="变更状态">
          <el-select v-model="filters.status" placeholder="请选择状态" clearable>
            <el-option label="已审批" value="已审批" />
            <el-option label="待审批" value="待审批" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="content-wrapper">
      <div class="main-content">
        <DataPanel title="地块用途GIS视图" class="map-panel">
          <GisMap :show-layer-control="false" :show-sensors="false" />
        </DataPanel>
        <div class="ai-panels-container">
          <DataPanel title="土地利用类型占比">
            <EchartsWrapper :options="pieChartOptions" />
          </DataPanel>
          <DataPanel title="耕地面积年度变化">
            <EchartsWrapper :options="barChartOptions" />
          </DataPanel>
          <AIPanel title="AI 智能分析" :content="aiAnalysisContent" />
        </div>
      </div>
      <DataPanel title="地块用途变更记录" class="table-panel">
        <el-table 
          :ref="tableRef"
          :data="filteredTableData" 
          style="width: 100%" 
          height="100%" 
          class="dark-table"
          highlight-current-row
        >
          <el-table-column prop="plotId" label="地块编号" />
          <el-table-column prop="originalUse" label="原用途" />
          <el-table-column prop="currentUse" label="现用途" />
          <el-table-column prop="area" label="面积(亩)" />
          <el-table-column prop="changeDate" label="变更日期" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="row.status === '待审批' ? 'warning' : 'success'">{{ row.status }}</el-tag>
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
import { useLandUseData } from '@/composables/useLandUseData.js';

const {
  tableRef,
  filters,
  filteredTableData,
  pieChartOptions,
  barChartOptions,
  aiAnalysisContent,
} = useLandUseData();
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
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;

  & > :nth-child(3) {
    grid-column: 1 / -1;
  }
}

.table-panel {
  flex-shrink: 0;
  height: 220px;
}
</style> 