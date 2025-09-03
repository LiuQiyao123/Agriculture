<template>
  <div class="page-container">
    <h1 class="page-title">耕地退化分析</h1>
    <div class="analysis-container">
      <!-- Filter Bar -->
      <div class="filter-bar">
        <el-form :inline="true" :model="filters" @submit.prevent>
          <el-form-item label="风险等级">
            <el-select v-model="filters.riskLevel" placeholder="请选择等级" clearable>
              <el-option label="高度风险" value="高度风险" />
              <el-option label="中度风险" value="中度风险" />
            </el-select>
          </el-form-item>
          <el-form-item label="退化因素">
            <el-select v-model="filters.mainFactor" placeholder="请选择因素" clearable>
              <el-option label="土壤酸化" value="土壤酸化" />
              <el-option label="有机质下降" value="有机质下降" />
              <el-option label="盐碱化" value="盐碱化" />
              <el-option label="重金属污染" value="重金属污染" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div class="main-content-grid">
        <DataPanel title="耕地退化风险等级分布图" class="grid-map">
          <GisMap :show-layer-control="false" :show-sensors="false" />
        </DataPanel>
        
        <div class="grid-ai-panels">
          <DataPanel title="AI 诊断结论" class="ai-panel-transparency">
            <div class="ai-panel-content text-content">
              <p><strong>诊断结论</strong>：酸化和有机质下降是主要退化因素。</p>
              <p><strong>核心治理区</strong>：建议优先治理 <strong>12</strong> 个核心区。</p>
            </div>
          </DataPanel>
          <DataPanel title="主要退化成因分析" class="ai-panel-suggestion">
             <EchartsWrapper :options="radarChartOptions" />
          </DataPanel>
          <DataPanel title="高风险耕地占比变化" class="ai-panel-validation">
             <EchartsWrapper :options="lineChartOptions" />
          </DataPanel>
        </div>

        <DataPanel title="高风险地块列表" class="grid-table">
          <el-table 
            ref="tableRef"
            :data="filteredTableData" 
            style="width: 100%" 
            height="100%" 
            class="dark-table"
            highlight-current-row
          >
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
  riskLevel: '',
  mainFactor: '',
});

const tableData = ref([
  { plotId: 'PLOT-088', riskLevel: '高度风险', mainFactor: '土壤酸化', organicMatter: '1.2', ph: '4.8', suggestion: '施用石灰' },
  { plotId: 'PLOT-121', riskLevel: '中度风险', mainFactor: '有机质下降', organicMatter: '1.5', ph: '5.9', suggestion: '增施有机肥' },
  { plotId: 'PLOT-045', riskLevel: '中度风险', mainFactor: '盐碱化', organicMatter: '1.8', ph: '8.2', suggestion: '灌排洗盐' },
  { plotId: 'PLOT-096', riskLevel: '高度风险', mainFactor: '重金属污染', organicMatter: '1.3', ph: '6.1', suggestion: '生物修复' },
]);

const filteredTableData = computed(() => {
  return tableData.value.filter(item => {
    const riskMatch = filters.value.riskLevel ? item.riskLevel === filters.value.riskLevel : true;
    const factorMatch = filters.value.mainFactor ? item.mainFactor === filters.value.mainFactor : true;
    return riskMatch && factorMatch;
  });
});

onMounted(() => {
  nextTick(() => {
    if (tableRef.value && filteredTableData.value.length > 0) {
      tableRef.value.setCurrentRow(filteredTableData.value[0]);
    }
  });
});

const radarChartOptions = ref({
  legend: { data: ['地块PLOT-088'], textStyle: { color: '#ccc' }, bottom: 5 },
  radar: {
    indicator: [
      { name: '土壤酸化', max: 10 }, { name: '有机质下降', max: 10 }, { name: '盐碱化', max: 10 },
      { name: '重金属污染', max: 10 }, { name: '土壤板结', max: 10 },
    ],
    shape: 'circle',
    splitNumber: 5,
    axisName: { color: 'rgb(238, 197, 102)' },
    splitLine: { lineStyle: { color: [
      'rgba(238, 197, 102, 0.1)','rgba(238, 197, 102, 0.2)','rgba(238, 197, 102, 0.4)',
      'rgba(238, 197, 102, 0.6)','rgba(238, 197, 102, 0.8)','rgba(238, 197, 102, 1)'
    ].reverse()}},
    splitArea: { show: false },
    axisLine: { lineStyle: { color: 'rgba(238, 197, 102, 0.5)' } }
  },
  series: [{ name: '退化成因分析', type: 'radar', data: [{ value: [9, 6, 3, 5, 4], name: '地块PLOT-088' }] }],
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
  series: [{ name: '高风险耕地占比', type: 'line', smooth: true, data: [2.5, 2.8, 3.1, 3.5], itemStyle: { color: '#ff4d4f' } }],
});
</script>

<style scoped lang="scss">
@use '@/styles/analysis-layout.scss';
.text-content {
  padding: 10px 15px;
  color: #a0a6b8;
  font-size: 14px;
  line-height: 1.6;
}
</style> 