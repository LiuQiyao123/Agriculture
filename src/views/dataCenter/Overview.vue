<template>
  <div class="overview-container">
    <!-- 顶部筛选和统计区域 -->
    <div class="top-section">
      <DataPanel title="数据源总览">
        <!-- 筛选工具栏 -->
        <div class="filter-toolbar">
          <el-form :inline="true" :model="query" class="filter-form">
            <el-form-item label="时间">
              <el-select v-model="query.range" style="width: 140px;">
                <el-option label="近24小时" value="24h" />
                <el-option label="近7天" value="7d" />
              </el-select>
            </el-form-item>
            <el-form-item label="类型">
              <el-select v-model="query.types" multiple collapse-tags style="width: 260px;" placeholder="全部">
                <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="乡镇">
              <el-select v-model="query.towns" multiple collapse-tags style="width: 240px;" placeholder="全部">
                <el-option v-for="t in townOptions" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="applyFilters">应用</el-button>
              <el-button @click="resetFilters">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- KPI指标卡片 -->
        <div class="kpi-grid">
          <div class="kpi-card" v-for="k in kpi" :key="k.title" @click="handleKpiClick(k)">
            <div class="kpi-icon" :class="k.theme">
              <el-icon><component :is="k.icon" /></el-icon>
            </div>
            <div class="kpi-content">
              <div class="kpi-value">{{ k.value }}</div>
              <div class="kpi-title">{{ k.title }}</div>
              <div class="kpi-details" v-html="k.details"></div>
            </div>
          </div>
        </div>
      </DataPanel>
    </div>

    <!-- 中部图表和地图区域 -->
    <div class="middle-section">
      <!-- 左侧图表区域 -->
      <div class="charts-area">
        <DataPanel title="上报趋势分析" class="chart-panel">
          <div class="chart-toolbar">
            <el-radio-group v-model="trendType" size="small">
              <el-radio-button label="hourly">按小时</el-radio-button>
              <el-radio-button label="daily">按天</el-radio-button>
              <el-radio-button label="weekly">按周</el-radio-button>
            </el-radio-group>
          </div>
          <EchartsWrapper :options="trendChartOptions" height="280px" />
        </DataPanel>

        <DataPanel title="告警分布统计" class="chart-panel">
          <EchartsWrapper :options="alarmChartOptions" height="280px" />
        </DataPanel>
      </div>

              <!-- 右侧地图区域 -->
        <div class="map-area">
          <DataPanel title="设备分布与覆盖" class="map-panel">
            <GisMap :show-layer-control="false" :show-view-switcher="false" />
          </DataPanel>
        </div>
    </div>

    <!-- 底部快速操作区域 -->
    <div class="bottom-section">
      <DataPanel title="快速操作">
        <div class="quick-actions">
          <div class="action-card" v-for="action in quickActions" :key="action.key" @click="handleQuickAction(action)">
            <div class="action-icon" :class="action.theme">
              <el-icon><component :is="action.icon" /></el-icon>
            </div>
            <div class="action-content">
              <div class="action-title">{{ action.title }}</div>
              <div class="action-desc">{{ action.desc }}</div>
            </div>
          </div>
        </div>
      </DataPanel>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DataPanel from '@/components/DataPanel.vue'
import GisMap from '@/components/GisMap.vue'
import EchartsWrapper from '@/components/EchartsWrapper.vue'
import { 
  Monitor, 
  Warning, 
  DataAnalysis, 
  OfficeBuilding,
  Plus,
  Download,
  Setting,
  Search
} from '@element-plus/icons-vue'

// 查询条件
const query = ref({ range:'24h', types:[], towns:[] })
const typeOptions = [
  { label:'墒情传感器', value:'soil' },
  { label:'气象监测站', value:'weather' },
  { label:'田间监测站', value:'field' },
  { label:'虫情测报仪', value:'moth' },
  { label:'孢子测报仪', value:'spore' },
  { label:'巡飞无人机', value:'drone' },
]
const townOptions = ['城关镇','高新区','开发区','南郊镇','北郊镇']

// KPI指标数据
const kpi = ref([
  { 
    key:'devices', 
    title: '设备总数', 
    value: '874', 
    details: '<span style="color:lime">+12</span>',
    theme: 'blue',
    icon: Monitor
  },
  { 
    key:'online', 
    title: '在线率', 
    value: '98.5%', 
    details: '<span style="color:lime">+0.3%</span>',
    theme: 'green',
    icon: DataAnalysis
  },
  { 
    key:'reports', 
    title: '近24h上报量', 
    value: '12,430', 
    details: '<span style="color:#00aaff">+5.2%</span>',
    theme: 'cyan',
    icon: OfficeBuilding
  },
  { 
    key:'alarms', 
    title: '告警数', 
    value: '23', 
    details: '<span style="color:#ff6b6b">5 高</span>',
    theme: 'red',
    icon: Warning
  },
  { 
    key:'towns', 
    title: '覆盖乡镇数', 
    value: '18', 
    details: '<span style="color:#a0a6b8">覆盖率100%</span>',
    theme: 'purple',
    icon: OfficeBuilding
  },
  { 
    key:'ingestion', 
    title: '入湖任务成功率', 
    value: '96.2%', 
    details: '<span style="color:lime">+1.8%</span>',
    theme: 'orange',
    icon: DataAnalysis
  },
])

// 图表配置
const trendType = ref('hourly')
const trendChartOptions = computed(() => {
  const xAxisData = trendType.value === 'hourly' 
    ? Array.from({ length: 24 }, (_, i) => `${i}:00`)
    : trendType.value === 'daily'
    ? Array.from({ length: 7 }, (_, i) => `第${i + 1}天`)
    : Array.from({ length: 4 }, (_, i) => `第${i + 1}周`)

  return {
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#c0c4cc' } },
    grid: { top: 40, left: 50, right: 30, bottom: 40 },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: { color: '#c0c4cc', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,.3)' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#c0c4cc', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,.1)' } }
    },
    series: [
      {
        name: '上报条数',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { color: '#00aaff' },
        data: xAxisData.map(() => Math.round(400 + Math.random() * 200))
      },
      {
        name: '异常数量',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { color: '#ff6b6b' },
        data: xAxisData.map(() => Math.round(10 + Math.random() * 30))
      }
    ]
  }
})

const alarmChartOptions = {
  tooltip: { trigger: 'item' },
  legend: { textStyle: { color: '#c0c4cc' } },
  series: [
    {
      name: '告警分布',
      type: 'pie',
      radius: ['40%', '70%'],
      label: { color: '#c0c4cc' },
      data: [
        { name: '高', value: 5, itemStyle: { color: '#ff6b6b' } },
        { name: '中', value: 12, itemStyle: { color: '#ffa726' } },
        { name: '低', value: 24, itemStyle: { color: '#66bb6a' } }
      ]
    }
  ]
}

// 快速操作
const quickActions = ref([
  {
    key: 'addDevice',
    title: '添加设备',
    desc: '新增监测设备到系统',
    theme: 'blue',
    icon: Plus
  },
  {
    key: 'exportData',
    title: '导出数据',
    desc: '导出各类监测数据',
    theme: 'green',
    icon: Download
  },
  {
    key: 'systemConfig',
    title: '系统配置',
    desc: '管理系统参数设置',
    theme: 'purple',
    icon: Setting
  },
  {
    key: 'dataQuery',
    title: '数据查询',
    desc: '高级数据查询分析',
    theme: 'orange',
    icon: Search
  }
])

// 事件处理函数
const applyFilters = () => {
  // 接入真实接口时在此触发刷新
}
const resetFilters = () => { 
  query.value = { range:'24h', types:[], towns:[] } 
}
const handleKpiClick = (k) => {
  // 跳转对应子页并带筛选
}
const handleQuickAction = (action) => {
  // 处理快速操作
}
</script>

<style scoped>
.overview-container {
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 顶部区域 */
.top-section {
  flex-shrink: 0;
}

.filter-toolbar {
  padding: 0 15px 15px;
  border-bottom: 1px solid rgba(0,170,255,.3);
  margin-bottom: 15px;
}

.filter-form .el-form-item {
  margin-bottom: 8px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  padding: 0 15px;
}

.kpi-card {
  display: flex;
  align-items: center;
  background: rgba(0,0,0,.15);
  border: 1px solid rgba(0,170,255,.3);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.kpi-card:hover {
  border-color: #00aaff;
  background: rgba(0,170,255,.1);
  transform: translateY(-2px);
}

.kpi-icon {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 20px;
}

.kpi-icon.blue { background: rgba(0,170,255,.2); color: #00aaff; }
.kpi-icon.green { background: rgba(103,194,58,.2); color: #67c23a; }
.kpi-icon.cyan { background: rgba(0,255,255,.2); color: #00ffff; }
.kpi-icon.red { background: rgba(255,107,107,.2); color: #ff6b6b; }
.kpi-icon.purple { background: rgba(156,39,176,.2); color: #9c27b0; }
.kpi-icon.orange { background: rgba(255,152,0,.2); color: #ff9800; }

.kpi-content {
  flex: 1;
  min-width: 0;
}

.kpi-value {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
  line-height: 1;
}

.kpi-title {
  font-size: 12px;
  color: #a0a6b8;
  margin-bottom: 4px;
  line-height: 1;
}

.kpi-details {
  font-size: 11px;
  color: #c0c4cc;
  line-height: 1;
}

/* 中部区域 */
.middle-section {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  min-height: 0;
}

.charts-area {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chart-panel {
  flex: 1;
}

.chart-panel :deep(.panel-content) {
  padding: 15px;
}

.chart-toolbar {
  margin-bottom: 15px;
  text-align: center;
}

.map-area {
  min-height: 0;
}

.map-panel {
  height: 100%;
}

.map-panel :deep(.panel-content) {
  padding: 15px;
}

/* 底部区域 */
.bottom-section {
  flex-shrink: 0;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  padding: 0 15px 15px;
}

.action-card {
  display: flex;
  align-items: center;
  background: rgba(0,0,0,.15);
  border: 1px solid rgba(0,170,255,.3);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  border-color: #00aaff;
  background: rgba(0,170,255,.1);
  transform: translateY(-2px);
}

.action-icon {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 22px;
}

.action-icon.blue { background: rgba(0,170,255,.2); color: #00aaff; }
.action-icon.green { background: rgba(103,194,58,.2); color: #67c23a; }
.action-icon.purple { background: rgba(156,39,176,.2); color: #9c27b0; }
.action-icon.orange { background: rgba(255,152,0,.2); color: #ff9800; }

.action-content {
  flex: 1;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
}

.action-desc {
  font-size: 12px;
  color: #a0a6b8;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .kpi-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1200px) {
  .middle-section {
    grid-template-columns: 1fr;
  }
  
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>


