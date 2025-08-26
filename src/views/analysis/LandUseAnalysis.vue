<template>
  <div class="page-container">
    <h1 class="page-title">土地用途分析</h1>
    <div class="analysis-container">
      <el-row :gutter="20" class="top-row">
        <el-col :span="16">
          <DataPanel title="地块用途GIS视图">
            <div class="placeholder">
              <img src="https://via.placeholder.com/800x600.png?text=Land+Use+Classification+Map" alt="Land Use Map" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          </DataPanel>
        </el-col>
        <el-col :span="8" class="right-column">
          <DataPanel title="土地利用类型占比">
             <EchartsWrapper :options="pieChartOptions" />
          </DataPanel>
          <DataPanel title="耕地面积年度变化">
             <EchartsWrapper :options="barChartOptions" />
          </DataPanel>
        </el-col>
      </el-row>
      <el-row class="bottom-row">
        <el-col :span="24">
          <DataPanel title="地块用途变更记录">
            <el-table :data="tableData" style="width: 100%" height="100%" class="dark-table">
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
  { plotId: 'PLOT-034', originalUse: '耕地', currentUse: '建设用地', area: '5.2', changeDate: '2023-09-12', status: '已审批' },
  { plotId: 'PLOT-101', originalUse: '荒地', currentUse: '耕地', area: '10.8', changeDate: '2023-08-25', status: '已审批' },
  { plotId: 'PLOT-056', originalUse: '耕地', currentUse: '林地', area: '3.1', changeDate: '2023-08-11', status: '已审批' },
  { plotId: 'PLOT-210', originalUse: '耕地', currentUse: '其他', area: '1.5', changeDate: '2023-10-20', status: '待审批' },
]);

const pieChartOptions = ref({
  tooltip: { trigger: 'item', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
  legend: {
    top: '5%',
    left: 'center',
    textStyle: { color: '#ccc' }
  },
  series: [
    {
      name: '土地利用类型',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#2d3343',
        borderWidth: 2
      },
      label: { show: false, position: 'center' },
      emphasis: {
        label: {
          show: true,
          fontSize: '24',
          fontWeight: 'bold',
          color: '#fff'
        }
      },
      labelLine: { show: false },
      data: [
        { value: 1048, name: '耕地' },
        { value: 735, name: '林地' },
        { value: 580, name: '建设用地' },
        { value: 484, name: '水域' },
        { value: 300, name: '其他' }
      ]
    }
  ],
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
  series: [
    {
      name: '耕地面积',
      type: 'bar',
      barWidth: '40%',
      data: [1052, 1045, 1055, 1048],
      itemStyle: { color: '#91cc75' }
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