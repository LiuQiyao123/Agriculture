<template>
  <div class="page-container">
    <h1 class="page-title">AI墒情预测与智能灌溉决策</h1>
    <div class="moisture-analysis-container">
      <!-- New Filter Bar -->
      <div class="filter-bar">
        <el-form :inline="true" :model="filters" @submit.prevent>
          <el-form-item label="预警区域">
            <el-input v-model="filters.region" placeholder="请输入区域关键字" clearable />
          </el-form-item>
          <el-form-item label="预警等级">
            <el-select v-model="filters.level" placeholder="请选择等级" clearable>
              <el-option label="重度干旱" value="重度干旱" />
              <el-option label="中度干旱" value="中度干旱" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div class="main-content-grid">
        <DataPanel title="AI墒情预测地图" class="grid-map">
          <GisMap
            ref="gisMapRef"
            :show-layer-control="false"
            :show-sensors="false"
          />
        </DataPanel>
        
        <div class="grid-ai-panels">
          <DataPanel title="AI模型透明度面板" class="ai-panel-transparency">
            <div class="ai-panel-content">
              <div class="model-metric">
                <span>历史验证准确率:</span>
                <span class="value success">87.3% ↗</span>
              </div>
              <div class="model-metric">
                <span>本轮预测置信度:</span>
                <span class="value">91.5%</span>
              </div>
              <div class="factor-weights">
                <p>关键影响因子权重:</p>
                <ul>
                  <li>未来降雨概率: 34.2%</li>
                  <li>土壤类型: 28.7%</li>
                  <li>历史墒情模式: 22.1%</li>
                  <li>地形微气候: 15.0%</li>
                </ul>
              </div>
            </div>
          </DataPanel>
          <DataPanel title="智能决策建议面板" class="ai-panel-suggestion">
             <div class="ai-panel-content">
                <div class="suggestion-card">
                  <h4>最优灌溉时间窗口</h4>
                  <p class="suggestion-time">2025.09.05 06:00-10:00</p>
                  <div class="suggestion-kpis">
                    <span>预期节水率: <strong>23%</strong></span>
                    <span>预期增产率: <strong>8.5%</strong></span>
                  </div>
                </div>
                <div class="risk-warning">
                  <h4>风险预警</h4>
                  <p>• 城关镇西北部 3日后中旱风险 (78%概率)</p>
                  <p>• 建议提前调配抗旱设备 120台</p>
                </div>
             </div>
          </DataPanel>
          <DataPanel title="预测结果验证" class="ai-panel-validation">
             <EchartsWrapper :options="lineChartOptions" />
          </DataPanel>
        </div>

        <DataPanel title="干旱预警列表" class="grid-table">
          <el-table 
            ref="tableRef"
            :data="filteredTableData" 
            style="width: 100%" 
            height="100%" 
            class="dark-table"
            highlight-current-row
            @current-change="handleCurrentChange"
          >
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import DataPanel from '@/components/DataPanel.vue';
import GisMap from '@/components/GisMap.vue';
import EchartsWrapper from '@/components/EchartsWrapper.vue';

const gisMapRef = ref(null);
const tableRef = ref(null);
const currentRow = ref(null);

const filters = ref({
  region: '',
  level: '',
});

const tableData = ref([
  { id: 1, region: '高新区-创新大道88号', level: '重度干旱', value: '18.5', time: '2023-10-27 10:30:15' },
  { id: 2, region: '城关镇-幸福路12号', level: '中度干旱', value: '25.2', time: '2023-10-27 09:15:42' },
  { id: 3, region: '开发区-工业一路101号', level: '中度干旱', value: '28.9', time: '2023-10-26 17:45:00' },
  { id: 4, region: '远郊区-希望田野9号', level: '重度干旱', value: '19.8', time: '2023-10-26 14:22:31' },
]);

const filteredTableData = computed(() => {
  const { region, level } = filters.value;
  return tableData.value.filter(item => {
    const regionMatch = region ? item.region.includes(region) : true;
    const levelMatch = level ? item.level === level : true;
    return regionMatch && levelMatch;
  });
});

const handleCurrentChange = (val) => {
  currentRow.value = val;
};

onMounted(() => {
  nextTick(() => {
    if (filteredTableData.value.length > 0) {
      tableRef.value?.setCurrentRow(filteredTableData.value[0]);
    }
  });
});

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
</script>

<style scoped lang="scss">
@use '@/styles/analysis-layout.scss';
</style> 