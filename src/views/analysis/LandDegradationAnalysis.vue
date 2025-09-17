<template>
  <div class="page-container">
    <h1 class="page-title">耕地退化分析</h1>
    <div class="filter-bar">
      <el-form :inline="true" :model="filters" @submit.prevent>
        <el-form-item label="退化类型">
          <el-select v-model="filters.type" placeholder="请选择类型" clearable>
            <el-option label="土壤酸化" value="土壤酸化" />
            <el-option label="土壤盐碱化" value="土壤盐碱化" />
            <el-option label="养分流失" value="养分流失" />
            <el-option label="土壤板结" value="土壤板结" />
          </el-select>
        </el-form-item>
        <el-form-item label="退化等级">
          <el-select v-model="filters.level" placeholder="请选择等级" clearable>
            <el-option label="重度" value="重度" />
            <el-option label="中度" value="中度" />
            <el-option label="轻度" value="轻度" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="content-wrapper">
      <div class="main-content">
        <DataPanel title="耕地退化空间分布" class="map-panel">
          <GisMap :show-layer-control="false" :show-sensors="false" />
        </DataPanel>
        <div class="ai-panels-container">
          <DataPanel title="退化类型占比">
            <EchartsWrapper :options="pieChartOptions" />
          </DataPanel>
          <AIPanel title="AI 退化分析与修复建议" :content="aiAnalysisContent" />
        </div>
      </div>
      <DataPanel title="耕地退化风险地块列表" class="table-panel">
        <el-table 
          :ref="tableRef"
          :data="filteredTableData" 
          style="width: 100%" 
          height="100%" 
          class="dark-table"
          highlight-current-row
        >
          <el-table-column prop="plotId" label="地块编号" />
          <el-table-column prop="type" label="退化类型" />
          <el-table-column prop="level" label="退化等级">
            <template #default="{ row }">
              <el-tag :type="row.level === '重度' ? 'danger' : row.level === '中度' ? 'warning' : 'info'">{{ row.level }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="area" label="面积(亩)" />
          <el-table-column prop="suggestion" label="修复建议" />
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
import { useLandDegradationData } from '@/composables/useLandDegradationData.js';

const {
  tableRef,
  filters,
  filteredTableData,
  pieChartOptions,
  aiAnalysisContent,
} = useLandDegradationData();
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