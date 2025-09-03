<template>
  <div class="page-container">
    <h1 class="page-title">病虫害分析与预测</h1>
    <div class="analysis-container">
      <!-- Filter Bar -->
      <div class="filter-bar">
        <el-form :inline="true" :model="filters" @submit.prevent>
          <el-form-item label="病虫害种类">
            <el-select v-model="filters.pest" placeholder="请选择种类" clearable>
              <el-option label="稻飞虱" value="稻飞虱" />
              <el-option label="玉米螟" value="玉米螟" />
              <el-option label="小麦白粉病" value="小麦白粉病" />
              <el-option label="稻瘟病" value="稻瘟病" />
            </el-select>
          </el-form-item>
          <el-form-item label="预警等级">
            <el-select v-model="filters.level" placeholder="请选择等级" clearable>
              <el-option label="高" value="高" />
              <el-option label="中" value="中" />
              <el-option label="低" value="低" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div class="main-content-grid">
        <DataPanel title="病虫害高发区GIS预警" class="grid-map">
          <GisMap :show-layer-control="false" :show-sensors="false" />
        </DataPanel>
        
        <div class="grid-ai-panels">
          <DataPanel title="主要病虫害发生概率" class="ai-panel-transparency">
            <EchartsWrapper :options="pieChartOptions" />
          </DataPanel>
          <DataPanel title="近期虫害数量趋势" class="ai-panel-suggestion">
             <EchartsWrapper :options="lineChartOptions" />
          </DataPanel>
          <DataPanel title="AI 智能分析" class="ai-panel-validation">
             <div class="ai-panel-content text-content">
                <p><strong>AI 预测</strong>：</p>
                <ul>
                  <li>未来7天稻飞虱有 <strong>65%</strong> 概率进入高发期。</li>
                  <li>城关镇为主要风险区域。</li>
                </ul>
                <p><strong>防治建议</strong>：</p>
                <ul>
                  <li>建议立即对 PLOT-023 区域进行无人机精准施药。</li>
                </ul>
             </div>
          </DataPanel>
        </div>

        <DataPanel title="详细预警列表" class="grid-table">
          <el-table 
            ref="tableRef"
            :data="filteredTableData" 
            style="width: 100%" 
            height="100%" 
            class="dark-table"
            highlight-current-row
          >
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
  pest: '',
  level: '',
});

const tableData = ref([
    { plotId: 'PLOT-023', pest: '稻飞虱', level: '高', probability: 85, time: '2023-10-28 11:00' },
    { plotId: 'PLOT-058', pest: '玉米螟', level: '中', probability: 60, time: '2023-10-28 10:45' },
    { plotId: 'PLOT-112', pest: '小麦白粉病', level: '低', probability: 30, time: '2023-10-28 09:30' },
    { plotId: 'PLOT-023', pest: '稻瘟病', level: '中', probability: 55, time: '2023-10-27 15:00' },
]);

const filteredTableData = computed(() => {
  return tableData.value.filter(item => {
    const pestMatch = filters.value.pest ? item.pest === filters.value.pest : true;
    const levelMatch = filters.value.level ? item.level === filters.value.level : true;
    return pestMatch && levelMatch;
  });
});

onMounted(() => {
  nextTick(() => {
    if (tableRef.value && filteredTableData.value.length > 0) {
      tableRef.value.setCurrentRow(filteredTableData.value[0]);
    }
  });
});

const getRiskTagType = (level) => {
    if (level === '高') return 'error';
    if (level === '中') return 'warning';
    return 'success';
};

const pieChartOptions = ref({
    legend: { top: 'bottom', textStyle: { color: '#ccc' } },
    tooltip: { trigger: 'item', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333', textStyle: { color: '#fff' } },
    series: [{
        name: '病虫害概率', type: 'pie', radius: [20, 110], center: ['50%', '50%'], roseType: 'area',
        itemStyle: { borderRadius: 5 },
        data: [
            { value: 40, name: '稻飞虱' }, { value: 32, name: '玉米螟' }, { value: 28, name: '稻瘟病' },
            { value: 22, name: '小麦白粉病' }, { value: 15, name: '棉铃虫' }
        ]
    }],
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
    series: [{
        name: '稻飞虱', type: 'line', smooth: true, data: [12, 15, 25, 22, 35, 42, 55], itemStyle: { color: '#ee6666' },
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