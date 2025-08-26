<template>
  <div class="page-container">
    <h1 class="page-title">墒情监测与旱情分析</h1>
    <div class="moisture-analysis-container">
      <el-row :gutter="20" class="top-row">
        <el-col :span="16">
          <DataPanel title="墒情GIS监测">
            <GisMap ref="gisMapRef" />
          </DataPanel>
        </el-col>
        <el-col :span="8" class="right-column">
          <DataPanel title="历史墒情趋势">
             <EchartsWrapper :options="lineChartOptions" />
          </DataPanel>
          <DataPanel title="各区域墒情对比">
             <EchartsWrapper :options="barChartOptions" />
          </DataPanel>
        </el-col>
      </el-row>
      <el-row class="bottom-row">
        <el-col :span="24">
          <DataPanel title="干旱预警列表">
            <el-table :data="tableData" style="width: 100%" height="100%" class="dark-table">
              <el-table-column prop="region" label="预警区域" />
              <el-table-column prop="level" label="预警等级">
                <template #default="{ row }">
                  <el-tag :type="row.level === '重度干旱' ? 'error' : 'warning'">{{ row.level }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="value" label="当前墒情(%)" />
              <el-table-column prop="time" label="发布时间" />
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
import GisMap from '@/components/GisMap.vue';
import EchartsWrapper from '@/components/EchartsWrapper.vue';

const gisMapRef = ref(null);

const tableData = ref([
  { region: '高新区-创新大道88号', level: '重度干旱', value: '18.5', time: '2023-10-27 10:30:15' },
  { region: '城关镇-幸福路12号', level: '中度干旱', value: '25.2', time: '2023-10-27 09:15:42' },
  { region: '开发区-工业一路101号', level: '中度干旱', value: '28.9', time: '2023-10-26 17:45:00' },
  { region: '远郊区-希望田野9号', level: '重度干旱', value: '19.8', time: '2023-10-26 14:22:31' },
]);

const lineChartOptions = ref({
  grid: { top: 30, right: 20, bottom: 30, left: 40 },
  xAxis: {
    type: 'category',
    data: ['10-21', '10-22', '10-23', '10-24', '10-25', '10-26', '10-27'],
    axisLine: { lineStyle: { color: '#888' } },
    axisLabel: { color: '#ccc' },
  },
  yAxis: {
    type: 'value',
    name: '土壤湿度(%)',
    nameTextStyle: { color: '#ccc', padding: [0, 0, 0, 50] },
    axisLine: { show: true, lineStyle: { color: '#888' } },
    axisLabel: { color: '#ccc' },
    splitLine: { lineStyle: { type: 'dashed', color: '#444' } },
  },
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
  series: [
    {
      name: '平均墒情',
      type: 'line',
      smooth: true,
      data: [35.2, 32.1, 28.4, 26.8, 27.5, 24.1, 22.9],
      itemStyle: { color: '#33b5e5' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(51, 181, 229, 0.5)' }, { offset: 1, color: 'rgba(51, 181, 229, 0)' }]
        }
      }
    },
  ],
});

const barChartOptions = ref({
  grid: { top: 30, right: 20, bottom: 30, left: 40 },
  xAxis: {
    type: 'category',
    data: ['高新区', '城关镇', '开发区', '远郊区'],
    axisLine: { lineStyle: { color: '#888' } },
    axisLabel: { color: '#ccc' },
  },
  yAxis: {
    type: 'value',
    axisLine: { show: true, lineStyle: { color: '#888' } },
    axisLabel: { color: '#ccc' },
    splitLine: { lineStyle: { type: 'dashed', color: '#444' } },
  },
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
  series: [
    {
      name: '当前墒情',
      type: 'bar',
      barWidth: '60%',
      data: [18.5, 25.2, 28.9, 19.8],
      itemStyle: {
        color: (params) => (params.value < 20 ? '#ff4d4f' : '#ffc53d'),
        borderRadius: [2, 2, 0, 0]
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

.moisture-analysis-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; // Important for flex-grow to work correctly inside another flex container
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
  height: 280px; // Adjusted height for better table visibility
}

.top-row .el-col, .top-row .data-panel, .bottom-row .el-col, .bottom-row .data-panel {
  height: 100%;
}
:deep(.data-panel .content) {
  height: calc(100% - 40px);
  padding: 10px; // Add some padding inside panels
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

// Ensure map and charts fill their container
:deep(.data-panel .content .gis-map),
:deep(.data-panel .content .echarts-wrapper) {
  width: 100%;
  height: 100%;
}
</style> 