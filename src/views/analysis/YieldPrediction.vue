<template>
  <div class="page-container">
    <h1 class="page-title">产量与产值预测</h1>
    <div class="analysis-container">
      <el-row :gutter="20" class="top-row">
        <el-col :span="16">
          <DataPanel title="区域产量预测空间分布">
            <div class="placeholder">
              <img src="https://via.placeholder.com/800x600.png?text=Yield+Prediction+Map" alt="Yield Prediction Map" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          </DataPanel>
        </el-col>
        <el-col :span="8" class="right-column">
          <DataPanel title="历史与预测产量对比">
             <EchartsWrapper :options="lineChartOptions" />
          </DataPanel>
          <DataPanel title="主要作物品种产量对比">
             <EchartsWrapper :options="barChartOptions" />
          </DataPanel>
        </el-col>
      </el-row>
      <el-row class="bottom-row">
        <el-col :span="24">
          <DataPanel title="详细预测数据">
            <el-table :data="tableData" style="width: 100%" height="100%" class="dark-table">
              <el-table-column prop="crop" label="作物品种" />
              <el-table-column prop="area" label="种植面积(万亩)" />
              <el-table-column prop="predictedYield" label="预测单产(公斤/亩)" />
              <el-table-column prop="totalYield" label="预测总产量(万吨)" />
              <el-table-column prop="predictedValue" label="预计总产值(亿元)" />
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
  { crop: '超级杂交稻', area: '58.2', predictedYield: '750', totalYield: '43.65', predictedValue: '12.2' },
  { crop: '高筋小麦', area: '35.1', predictedYield: '550', totalYield: '19.31', predictedValue: '5.4' },
  { crop: '糯玉米', area: '22.7', predictedYield: '680', totalYield: '15.44', predictedValue: '4.3' },
  { crop: '高油大豆', area: '15.9', predictedYield: '210', totalYield: '3.34', predictedValue: '1.8' },
]);

const lineChartOptions = ref({
    grid: { top: 40, right: 20, bottom: 30, left: 50 },
    legend: {
        data: ['历史产量', '预测产量'],
        textStyle: { color: '#ccc' },
        top: 10
    },
    xAxis: {
        type: 'category',
        data: ['2020', '2021', '2022', '2023(预测)'],
        axisLine: { lineStyle: { color: '#888' } },
        axisLabel: { color: '#ccc' },
    },
    yAxis: {
        type: 'value',
        name: '万吨',
        nameTextStyle: { color: '#ccc' },
        axisLine: { show: true, lineStyle: { color: '#888' } },
        axisLabel: { color: '#ccc' },
        splitLine: { lineStyle: { type: 'dashed', color: '#444' } },
    },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
    series: [
        {
            name: '历史产量',
            type: 'line',
            data: [75, 78, 82, null],
            itemStyle: { color: '#5470c6' },
        },
        {
            name: '预测产量',
            type: 'line',
            smooth: true,
            data: [null, null, 82, 81.7],
            itemStyle: { color: '#91cc75' },
            lineStyle: { type: 'dashed' }
        }
    ],
});

const barChartOptions = ref({
    grid: { top: 30, right: 20, bottom: 30, left: 60 },
    xAxis: {
        type: 'category',
        data: ['超级杂交稻', '高筋小麦', '糯玉米', '高油大豆'],
        axisLine: { lineStyle: { color: '#888' } },
        axisLabel: { color: '#ccc', interval: 0, rotate: -30 },
    },
    yAxis: {
        type: 'value',
        name: '公斤/亩',
        nameTextStyle: { color: '#ccc' },
        axisLine: { show: true, lineStyle: { color: '#888' } },
        axisLabel: { color: '#ccc' },
        splitLine: { lineStyle: { type: 'dashed', color: '#444' } },
    },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
    series: [
        {
            name: '预测单产',
            type: 'bar',
            barWidth: '40%',
            data: [750, 550, 680, 210],
            itemStyle: {
              color: '#fac858'
            }
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