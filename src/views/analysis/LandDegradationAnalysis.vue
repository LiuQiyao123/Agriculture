<template>
  <div class="page-container">
    <h1 class="page-title">耕地退化分析</h1>
    <div class="analysis-container">
      <el-row :gutter="20" class="top-row">
        <el-col :span="16">
          <DataPanel title="耕地退化风险等级分布图">
            <div class="placeholder">
              <img src="https://via.placeholder.com/800x600.png?text=Land+Degradation+Risk+Map" alt="Land Degradation Map" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          </DataPanel>
        </el-col>
        <el-col :span="8" class="right-column">
          <DataPanel title="主要退化成因分析">
             <EchartsWrapper :options="radarChartOptions" />
          </DataPanel>
          <DataPanel title="高风险耕地占比变化">
             <EchartsWrapper :options="lineChartOptions" />
          </DataPanel>
        </el-col>
      </el-row>
      <el-row class="bottom-row">
        <el-col :span="24">
          <DataPanel title="高风险地块列表">
            <el-table :data="tableData" style="width: 100%" height="100%" class="dark-table">
              <el-table-column prop="plotId" label="地块编号" />
              <el-table-column prop="riskLevel" label="风险等级">
                 <template #default="{ row }">
                  <el-tag :type="row.riskLevel === '高度风险' ? 'error' : 'warning'">{{ row.riskLevel }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="mainFactor" label="主要退化因素" />
              <el-table-column prop="organicMatter" label="有机质含量(%)" />
              <el-table-column prop="ph" label="土壤pH值" />
              <el-table-column prop="suggestion" label="治理建议" />
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
  { plotId: 'PLOT-088', riskLevel: '高度风险', mainFactor: '土壤酸化', organicMatter: '1.2', ph: '4.8', suggestion: '施用石灰' },
  { plotId: 'PLOT-121', riskLevel: '中度风险', mainFactor: '有机质下降', organicMatter: '1.5', ph: '5.9', suggestion: '增施有机肥' },
  { plotId: 'PLOT-045', riskLevel: '中度风险', mainFactor: '盐碱化', organicMatter: '1.8', ph: '8.2', suggestion: '灌排洗盐' },
  { plotId: 'PLOT-096', riskLevel: '高度风险', mainFactor: '重金属污染', organicMatter: '1.3', ph: '6.1', suggestion: '生物修复' },
]);

const radarChartOptions = ref({
  legend: {
    data: ['地块PLOT-088'],
    textStyle: { color: '#ccc' },
    bottom: 5
  },
  radar: {
    indicator: [
      { name: '土壤酸化', max: 10 },
      { name: '有机质下降', max: 10 },
      { name: '盐碱化', max: 10 },
      { name: '重金属污染', max: 10 },
      { name: '土壤板结', max: 10 },
    ],
    shape: 'circle',
    splitNumber: 5,
    axisName: {
      color: 'rgb(238, 197, 102)'
    },
    splitLine: {
      lineStyle: {
        color: [
          'rgba(238, 197, 102, 0.1)', 'rgba(238, 197, 102, 0.2)',
          'rgba(238, 197, 102, 0.4)', 'rgba(238, 197, 102, 0.6)',
          'rgba(238, 197, 102, 0.8)', 'rgba(238, 197, 102, 1)'
        ].reverse()
      }
    },
    splitArea: {
      show: false
    },
    axisLine: {
      lineStyle: {
        color: 'rgba(238, 197, 102, 0.5)'
      }
    }
  },
  series: [
    {
      name: '退化成因分析',
      type: 'radar',
      data: [
        {
          value: [9, 6, 3, 5, 4],
          name: '地块PLOT-088'
        }
      ]
    }
  ],
  tooltip: { trigger: 'item', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
});


const lineChartOptions = ref({
  grid: { top: 30, right: 20, bottom: 30, left: 40 },
  xAxis: {
    type: 'category',
    data: ['2020', '2021', '2022', '2023'],
    axisLine: { lineStyle: { color: '#888' } },
    axisLabel: { color: '#ccc' },
  },
  yAxis: {
    type: 'value',
    name: '占比(%)',
    nameTextStyle: { color: '#ccc' },
    axisLine: { show: true, lineStyle: { color: '#888' } },
    axisLabel: { color: '#ccc' },
    splitLine: { lineStyle: { type: 'dashed', color: '#444' } },
  },
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
  series: [
    {
      name: '高风险耕地占比',
      type: 'line',
      smooth: true,
      data: [2.5, 2.8, 3.1, 3.5],
      itemStyle: { color: '#ff4d4f' },
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