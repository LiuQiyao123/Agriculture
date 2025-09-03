<template>
  <div class="page-container">
    <h1 class="page-title">作物长势遥感监测</h1>
    <div class="analysis-container">
      <!-- Filter Bar -->
      <div class="filter-bar">
        <el-form :inline="true" :model="filters" @submit.prevent>
          <el-form-item label="作物类型">
            <el-select v-model="filters.cropType" placeholder="请选择类型" clearable>
              <el-option label="水稻" value="水稻" />
              <el-option label="玉米" value="玉米" />
              <el-option label="小麦" value="小麦" />
            </el-select>
          </el-form-item>
          <el-form-item label="长势状态">
            <el-select v-model="filters.status" placeholder="请选择状态" clearable>
              <el-option label="长势偏弱" value="长势偏弱" />
              <el-option label="长势良好" value="长势良好" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div class="main-content-grid">
        <DataPanel title="作物长势NDVI遥感图" class="grid-map">
          <GisMap :show-layer-control="false" :show-sensors="false" />
        </DataPanel>
        
        <div class="grid-ai-panels">
          <DataPanel title="AI 诊断结论" class="ai-panel-transparency">
            <div class="ai-panel-content text-content">
              <p><strong>诊断结论</strong>：检测到 <strong>127</strong> 个地块存在营养胁迫，预测减产 <strong>8-15%</strong>。</p>
              <p><strong>处置优先级</strong>：PLOT-007, PLOT-011, PLOT-019, PLOT-023, PLOT-031。</p>
            </div>
          </DataPanel>
          <DataPanel title="AI 决策建议" class="ai-panel-suggestion">
             <div class="ai-panel-content text-content">
                <p><strong>本周作业计划</strong>：</p>
                <ol>
                  <li>48小时内对优先地块追施尿素 15-20kg/亩。</li>
                  <li>夜间进行 6-10mm 补灌。</li>
                  <li>喷施 0.3% 磷酸二氢钾叶面肥一次。</li>
                </ol>
             </div>
          </DataPanel>
          <DataPanel title="数据分析验证" class="ai-panel-validation">
             <el-tabs>
                <el-tab-pane label="地块历史长势">
                  <EchartsWrapper :options="lineChartOptions" />
                </el-tab-pane>
                <el-tab-pane label="各地块对比">
                  <EchartsWrapper :options="barChartOptions" />
                </el-tab-pane>
              </el-tabs>
          </DataPanel>
        </div>

        <DataPanel title="长势异常地块列表" class="grid-table">
          <el-table 
            ref="tableRef"
            :data="filteredTableData" 
            style="width: 100%" 
            height="100%" 
            class="dark-table"
            highlight-current-row
          >
            <el-table-column prop="plotId" label="地块编号" />
            <el-table-column prop="cropType" label="作物类型" />
            <el-table-column prop="ndvi" label="当前NDVI值" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === '长势偏弱' ? 'warning' : 'success'">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="监测时间" />
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
  cropType: '',
  status: '',
});

const tableData = ref([
  { plotId: 'PLOT-007', cropType: '水稻', ndvi: '0.62', status: '长势偏弱', time: '2023-10-27 09:00:00' },
  { plotId: 'PLOT-015', cropType: '玉米', ndvi: '0.85', status: '长势良好', time: '2023-10-27 09:00:00' },
  { plotId: 'PLOT-003', cropType: '水稻', ndvi: '0.81', status: '长势良好', time: '2023-10-27 09:00:00' },
  { plotId: 'PLOT-011', cropType: '小麦', ndvi: '0.58', status: '长势偏弱', time: '2023-10-27 09:00:00' },
]);

const filteredTableData = computed(() => {
  return tableData.value.filter(item => {
    const cropMatch = filters.value.cropType ? item.cropType === filters.value.cropType : true;
    const statusMatch = filters.value.status ? item.status === filters.value.status : true;
    return cropMatch && statusMatch;
  });
});

onMounted(() => {
  nextTick(() => {
    if (tableRef.value && filteredTableData.value.length > 0) {
      tableRef.value.setCurrentRow(filteredTableData.value[0]);
    }
  });
});

const lineChartOptions = ref({
  grid: { top: 30, right: 20, bottom: 30, left: 40 },
  xAxis: {
    type: 'category',
    data: ['第8周', '第10周', '第12周', '第14周', '第16周', '第18周', '当前'],
    axisLine: { lineStyle: { color: '#888' } },
    axisLabel: { color: '#ccc' },
  },
  yAxis: {
    type: 'value',
    name: 'NDVI',
    nameTextStyle: { color: '#ccc' },
    min: 0,
    max: 1,
    axisLine: { show: true, lineStyle: { color: '#888' } },
    axisLabel: { color: '#ccc' },
    splitLine: { lineStyle: { type: 'dashed', color: '#444' } },
  },
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
  series: [
    {
      name: 'PLOT-007',
      type: 'line',
      smooth: true,
      data: [0.2, 0.35, 0.55, 0.75, 0.72, 0.68, 0.62],
      itemStyle: { color: '#00c851' },
      markLine: {
        silent: true,
        data: [{ yAxis: 0.65, name: '健康阈值' }],
        lineStyle: { type: 'dashed', color: '#ff4d4f' },
        label: { color: '#ff4d4f' }
      }
    },
  ],
});

const barChartOptions = ref({
  grid: { top: 30, right: 20, bottom: 30, left: 40 },
  xAxis: {
    type: 'category',
    data: ['PLOT-007', 'PLOT-015', 'PLOT-003', 'PLOT-011'],
    axisLine: { lineStyle: { color: '#888' } },
    axisLabel: { color: '#ccc', rotate: -30 },
  },
  yAxis: {
    type: 'value',
    name: 'NDVI',
    nameTextStyle: { color: '#ccc' },
    min: 0,
    max: 1,
    axisLine: { show: true, lineStyle: { color: '#888' } },
    axisLabel: { color: '#ccc' },
    splitLine: { lineStyle: { type: 'dashed', color: '#444' } },
  },
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
  series: [
    {
      name: '当前NDVI',
      type: 'bar',
      barWidth: '60%',
      data: [
        { value: 0.62, itemStyle: { color: '#ffc53d'} },
        { value: 0.85, itemStyle: { color: '#00c851'} },
        { value: 0.81, itemStyle: { color: '#00c851'} },
        { value: 0.58, itemStyle: { color: '#ffc53d'} }
      ],
    },
  ],
});
</script>

<style scoped lang="scss">
@use '@/styles/analysis-layout.scss';
.text-content {
  padding: 10px 15px;
  color: #a0a6b8;
  font-size: 14px;
  line-height: 1.6;
  ol {
    padding-left: 20px;
  }
}
</style> 