<template>
  <div class="page-container">
    <h1 class="page-title">作物长势遥感监测</h1>
    <div class="analysis-container">
      <el-row :gutter="20" class="top-row">
        <el-col :span="16">
          <DataPanel title="作物长势NDVI遥感图">
            <div class="placeholder">
              <img src="https://via.placeholder.com/800x600.png?text=NDVI+Satellite+Image" alt="NDVI Map" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          </DataPanel>
        </el-col>
        <el-col :span="8" class="right-column">
          <DataPanel title="地块历史长势分析">
             <EchartsWrapper :options="lineChartOptions" />
          </DataPanel>
          <DataPanel title="各地块长势对比">
             <EchartsWrapper :options="barChartOptions" />
          </DataPanel>
        </el-col>
      </el-row>
      <el-row class="bottom-row">
        <el-col :span="24">
          <DataPanel title="长势异常地块列表">
            <el-table :data="tableData" style="width: 100%" height="100%" class="dark-table">
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
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DataPanel from '@/components/DataPanel.vue';
import EchartsWrapper from '@/components/EchartsWrapper.vue';

const tableData = ref([
  { plotId: 'PLOT-007', cropType: '水稻', ndvi: '0.62', status: '长势偏弱', time: '2023-10-27 09:00:00' },
  { plotId: 'PLOT-015', cropType: '玉米', ndvi: '0.85', status: '长势良好', time: '2023-10-27 09:00:00' },
  { plotId: 'PLOT-003', cropType: '水稻', ndvi: '0.81', status: '长势良好', time: '2023-10-27 09:00:00' },
  { plotId: 'PLOT-011', cropType: '小麦', ndvi: '0.58', status: '长势偏弱', time: '2023-10-27 09:00:00' },
]);

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
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-title {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.analysis-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.top-row {
  flex-grow: 1;
  margin-bottom: 20px;
  min-height: 0;
  & > .el-col {
    height: 100%;
  }
}

.bottom-row {
  flex-shrink: 0;
  height: 280px;
}

.top-row .el-col, .top-row .data-panel, .bottom-row .el-col, .bottom-row .data-panel {
  height: 100%;
}
:deep(.data-panel .content) {
  height: calc(100% - 40px);
  padding: 10px;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;

  .data-panel {
    flex: 1;
    height: auto;
    min-height: 0;
  }
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  border: 1px dashed #555;
  border-radius: 4px;
  background-color: #000;
}

:deep(.data-panel .content .echarts-wrapper) {
  width: 100%;
  height: 100%;
}
</style> 