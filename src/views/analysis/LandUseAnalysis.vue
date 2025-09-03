<template>
  <div class="page-container">
    <h1 class="page-title">土地用途分析</h1>
    <div class="analysis-container">
      <!-- Filter Bar -->
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

      <div class="main-content-grid">
        <DataPanel title="地块用途GIS视图" class="grid-map">
          <GisMap :show-layer-control="false" :show-sensors="false" />
        </DataPanel>
        
        <div class="grid-ai-panels">
          <DataPanel title="土地利用类型占比" class="ai-panel-transparency">
            <EchartsWrapper :options="pieChartOptions" />
          </DataPanel>
          <DataPanel title="耕地面积年度变化" class="ai-panel-suggestion">
             <EchartsWrapper :options="barChartOptions" />
          </DataPanel>
          <DataPanel title="AI 智能分析" class="ai-panel-validation">
             <div class="ai-panel-content text-content">
                <p><strong>AI 发现</strong>：</p>
                <ul>
                  <li>检测到 <strong>3</strong> 处疑似违规用地。</li>
                  <li>预测未来一年建设用地需求将增加 <strong>5%</strong>。</li>
                </ul>
                <p><strong>优化建议</strong>：</p>
                <ul>
                  <li>建议将 PLOT-101 地块调整为高价值经济作物区。</li>
                </ul>
             </div>
          </DataPanel>
        </div>

        <DataPanel title="地块用途变更记录" class="grid-table">
          <el-table 
            ref="tableRef"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import DataPanel from '@/components/DataPanel.vue';
import EchartsWrapper from '@/components/EchartsWrapper.vue';
import GisMap from '@/components/GisMap.vue';

const tableRef = ref(null);
const filters = ref({
  status: '',
});

const tableData = ref([
  { plotId: 'PLOT-034', originalUse: '耕地', currentUse: '建设用地', area: '5.2', changeDate: '2023-09-12', status: '已审批' },
  { plotId: 'PLOT-101', originalUse: '荒地', currentUse: '耕地', area: '10.8', changeDate: '2023-08-25', status: '已审批' },
  { plotId: 'PLOT-056', originalUse: '耕地', currentUse: '林地', area: '3.1', changeDate: '2023-08-11', status: '已审批' },
  { plotId: 'PLOT-210', originalUse: '耕地', currentUse: '其他', area: '1.5', changeDate: '2023-10-20', status: '待审批' },
]);

const filteredTableData = computed(() => {
  return tableData.value.filter(item => {
    return filters.value.status ? item.status === filters.value.status : true;
  });
});

onMounted(() => {
  nextTick(() => {
    if (tableRef.value && filteredTableData.value.length > 0) {
      tableRef.value.setCurrentRow(filteredTableData.value[0]);
    }
  });
});

const pieChartOptions = ref({
  tooltip: { trigger: 'item', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
  legend: { top: '5%', left: 'center', textStyle: { color: '#ccc' } },
  series: [{
    name: '土地利用类型', type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false,
    itemStyle: { borderRadius: 10, borderColor: '#2d3343', borderWidth: 2 },
    label: { show: false, position: 'center' },
    emphasis: { label: { show: true, fontSize: '24', fontWeight: 'bold', color: '#fff' } },
    labelLine: { show: false },
    data: [
      { value: 1048, name: '耕地' }, { value: 735, name: '林地' }, { value: 580, name: '建设用地' },
      { value: 484, name: '水域' }, { value: 300, name: '其他' }
    ]
  }],
  color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
});

const barChartOptions = ref({
  grid: { top: 30, right: 20, bottom: 30, left: 50 },
  xAxis: {
    type: 'category',
    data: ['2020年', '2021年', '2022年', '2023年'],
    axisLine: { lineStyle: { color: '#888' } },
    axisLabel: { color: '#ccc' },
  },
  yAxis: {
    type: 'value',
    name: '亩',
    nameTextStyle: { color: '#ccc' },
    axisLine: { show: true, lineStyle: { color: '#888' } },
    axisLabel: { color: '#ccc' },
    splitLine: { lineStyle: { type: 'dashed', color: '#444' } },
  },
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
  series: [{ name: '耕地面积', type: 'bar', barWidth: '40%', data: [1052, 1045, 1055, 1048], itemStyle: { color: '#91cc75' } }],
});
</script>

<style scoped lang="scss">
@use '@/styles/analysis-layout.scss';
.text-content {
  padding: 10px 15px;
  color: #a0a6b8;
  font-size: 14px;
  line-height: 1.6;
  ul {
    padding-left: 20px;
  }
}
</style> 