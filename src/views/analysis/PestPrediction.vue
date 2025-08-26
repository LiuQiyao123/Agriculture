<template>
  <div class="page-container">
    <h1 class="page-title">病虫害分析与预测</h1>
    <div class="analysis-container">
      <el-row :gutter="20" class="top-row">
        <el-col :span="16">
          <DataPanel title="病虫害高发区GIS预警">
            <div class="placeholder">
              <img src="https://via.placeholder.com/800x600.png?text=Pest+Alert+Map" alt="Pest Alert Map" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          </DataPanel>
        </el-col>
        <el-col :span="8" class="right-column">
          <DataPanel title="主要病虫害发生概率">
             <EchartsWrapper :options="pieChartOptions" />
          </DataPanel>
          <DataPanel title="近期虫害数量趋势">
             <EchartsWrapper :options="lineChartOptions" />
          </DataPanel>
        </el-col>
      </el-row>
      <el-row class="bottom-row">
        <el-col :span="24">
          <DataPanel title="详细预警列表">
            <el-table :data="tableData" style="width: 100%" height="100%" class="dark-table">
              <el-table-column prop="plotId" label="地块编号" />
              <el-table-column prop="pest" label="病虫害种类" />
              <el-table-column prop="level" label="预警等级">
                <template #default="{ row }">
                  <el-tag :type="getRiskTagType(row.level)">{{ row.level }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="probability" label="发生概率(%)" />
              <el-table-column prop="time" label="预警时间" />
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
    { plotId: 'PLOT-023', pest: '稻飞虱', level: '高', probability: 85, time: '2023-10-28 11:00' },
    { plotId: 'PLOT-058', pest: '玉米螟', level: '中', probability: 60, time: '2023-10-28 10:45' },
    { plotId: 'PLOT-112', pest: '小麦白粉病', level: '低', probability: 30, time: '2023-10-28 09:30' },
    { plotId: 'PLOT-023', pest: '稻瘟病', level: '中', probability: 55, time: '2023-10-27 15:00' },
]);

const getRiskTagType = (level) => {
    if (level === '高') return 'error';
    if (level === '中') return 'warning';
    return 'success';
};

const pieChartOptions = ref({
    legend: {
        top: 'bottom',
        textStyle: { color: '#ccc' }
    },
    tooltip: { trigger: 'item', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
    series: [
        {
            name: '病虫害概率',
            type: 'pie',
            radius: [20, 110],
            center: ['50%', '50%'],
            roseType: 'area',
            itemStyle: {
                borderRadius: 5
            },
            data: [
                { value: 40, name: '稻飞虱' },
                { value: 32, name: '玉米螟' },
                { value: 28, name: '稻瘟病' },
                { value: 22, name: '小麦白粉病' },
                { value: 15, name: '棉铃虫' }
            ]
        }
    ],
    color: ['#ee6666', '#fac858', '#91cc75', '#5470c6', '#73c0de']
});

const lineChartOptions = ref({
    grid: { top: 30, right: 20, bottom: 30, left: 40 },
    xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLine: { lineStyle: { color: '#888' } },
        axisLabel: { color: '#ccc' },
    },
    yAxis: {
        type: 'value',
        name: '数量(只/百株)',
        nameTextStyle: { color: '#ccc' },
        axisLine: { show: true, lineStyle: { color: '#888' } },
        axisLabel: { color: '#ccc' },
        splitLine: { lineStyle: { type: 'dashed', color: '#444' } },
    },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
    series: [
        {
            name: '稻飞虱',
            type: 'line',
            smooth: true,
            data: [12, 15, 25, 22, 35, 42, 55],
            itemStyle: { color: '#ee6666' },
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