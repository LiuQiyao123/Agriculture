<template>
  <div class="page-container">
    <h1 class="page-title">产量与产值预测</h1>
    <div class="analysis-container">
      <!-- Filter Bar -->
      <div class="filter-bar">
        <el-form :inline="true" :model="filters" @submit.prevent>
          <el-form-item label="作物品种">
            <el-select v-model="filters.crop" placeholder="请选择品种" clearable>
              <el-option label="超级杂交稻" value="超级杂交稻" />
              <el-option label="高筋小麦" value="高筋小麦" />
              <el-option label="糯玉米" value="糯玉米" />
              <el-option label="高油大豆" value="高油大豆" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div class="main-content-grid">
        <DataPanel title="区域产量预测空间分布" class="grid-map">
          <GisMap :show-layer-control="false" :show-sensors="false" />
        </DataPanel>
        
        <div class="grid-ai-panels">
          <DataPanel title="历史与预测产量对比" class="ai-panel-transparency">
            <EchartsWrapper :options="lineChartOptions" />
          </DataPanel>
          <DataPanel title="主要作物品种产量对比" class="ai-panel-suggestion">
             <EchartsWrapper :options="barChartOptions" />
          </DataPanel>
          <DataPanel title="AI 智能分析" class="ai-panel-validation">
             <div class="ai-panel-content text-content">
                <p><strong>AI 预测</strong>：</p>
                <ul>
                  <li>预计今年粮食总产量可达 <strong>81.7万吨</strong>，同比增长 <strong>4.5%</strong>。</li>
                  <li>超级杂交稻为主要增产点。</li>
                </ul>
                <p><strong>市场建议</strong>：</p>
                <ul>
                  <li>建议在11月中旬前完成收储，以获得最佳市场价格。</li>
                </ul>
             </div>
          </DataPanel>
        </div>

        <DataPanel title="详细预测数据" class="grid-table">
          <el-table 
            ref="tableRef"
            :data="filteredTableData" 
            style="width: 100%" 
            height="100%" 
            class="dark-table"
            highlight-current-row
          >
            <el-table-column prop="crop" label="作物品种" />
            <el-table-column prop="area" label="种植面积(万亩)" />
            <el-table-column prop="predictedYield" label="预测单产(公斤/亩)" />
            <el-table-column prop="totalYield" label="预测总产量(万吨)" />
            <el-table-column prop="predictedValue" label="预计总产值(亿元)" />
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
  crop: '',
});

const tableData = ref([
  { crop: '超级杂交稻', area: '58.2', predictedYield: '750', totalYield: '43.65', predictedValue: '12.2' },
  { crop: '高筋小麦', area: '35.1', predictedYield: '550', totalYield: '19.31', predictedValue: '5.4' },
  { crop: '糯玉米', area: '22.7', predictedYield: '680', totalYield: '15.44', predictedValue: '4.3' },
  { crop: '高油大豆', area: '15.9', predictedYield: '210', totalYield: '3.34', predictedValue: '1.8' },
]);

const filteredTableData = computed(() => {
  return tableData.value.filter(item => {
    return filters.value.crop ? item.crop === filters.value.crop : true;
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
    grid: { top: 40, right: 20, bottom: 30, left: 50 },
    legend: { data: ['历史产量', '预测产量'], textStyle: { color: '#ccc' }, top: 10 },
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
        { name: '历史产量', type: 'line', data: [75, 78, 82, null], itemStyle: { color: '#5470c6' } },
        { name: '预测产量', type: 'line', smooth: true, data: [null, null, 82, 81.7], itemStyle: { color: '#91cc75' }, lineStyle: { type: 'dashed' } }
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
    series: [{
        name: '预测单产', type: 'bar', barWidth: '40%',
        data: [750, 550, 680, 210],
        itemStyle: { color: '#fac858' }
    }],
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