<template>
  <div class="monitoring-container">
    <!-- 筛选工具栏 -->
    <DataPanel title="采集监控">
      <div class="panel-toolbar">
        <el-form :inline="true" :model="query" class="filter-form">
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="query.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 360px;"
            />
          </el-form-item>
          <el-form-item label="设备类型">
            <el-select v-model="query.deviceTypes" multiple collapse-tags style="width: 280px;" placeholder="全部">
              <el-option label="墒情传感器" value="soil" />
              <el-option label="气象监测站" value="weather" />
              <el-option label="田间监测站" value="field" />
              <el-option label="虫情测报仪" value="moth" />
              <el-option label="孢子测报仪" value="spore" />
              <el-option label="巡飞无人机" value="drone" />
            </el-select>
          </el-form-item>
          <el-form-item label="乡镇">
            <el-select v-model="query.towns" multiple collapse-tags style="width: 240px;" placeholder="全部">
              <el-option v-for="town in townOptions" :key="town" :label="town" :value="town" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button @click="handleExport">导出报告</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card" v-for="stat in stats" :key="stat.key">
          <div class="stat-icon" :class="stat.theme">
            <el-icon><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-trend" :class="stat.trend">
              {{ stat.trendValue }}
            </div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-grid">
        <div class="chart-panel">
          <DataPanel title="上报趋势分析">
            <div class="chart-toolbar">
              <el-radio-group v-model="trendType" size="small">
                <el-radio-button label="hourly">按小时</el-radio-button>
                <el-radio-button label="daily">按天</el-radio-button>
                <el-radio-button label="weekly">按周</el-radio-button>
              </el-radio-group>
            </div>
            <EchartsWrapper :options="trendChartOptions" height="300px" />
          </DataPanel>
        </div>
        
        <div class="chart-panel">
          <DataPanel title="告警分布统计">
            <EchartsWrapper :options="alarmChartOptions" height="300px" />
          </DataPanel>
        </div>
      </div>

      <!-- 覆盖热力图 -->
      <DataPanel title="设备覆盖热力分析">
        <div class="map-toolbar">
          <el-radio-group v-model="heatmapType" size="small">
            <el-radio-button label="density">设备密度</el-radio-button>
            <el-radio-button label="coverage">覆盖范围</el-radio-button>
            <el-radio-button label="quality">数据质量</el-radio-button>
          </el-radio-group>
          <el-switch v-model="showHeatmap" active-text="显示热力" inactive-text="隐藏热力" />
        </div>
        <div class="map-container">
          <GisMap ref="gisMapRef" :show-heatmap="showHeatmap" :heatmap-type="heatmapType" />
        </div>
      </DataPanel>

      <!-- 告警列表 -->
      <DataPanel title="实时告警">
        <el-table :data="alarmList" class="dark-table" height="300px" stripe>
          <el-table-column prop="time" label="时间" width="180" />
          <el-table-column prop="deviceId" label="设备ID" width="130" />
          <el-table-column prop="deviceName" label="设备名称" min-width="120" />
          <el-table-column prop="type" label="告警类型" width="120">
            <template #default="scope">
              <el-tag :type="getAlarmTagType(scope.row.level)" size="small">
                {{ scope.row.type }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="level" label="级别" width="80">
            <template #default="scope">
              <el-tag :type="getAlarmTagType(scope.row.level)" size="small">
                {{ scope.row.level }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === '已处理' ? 'success' : 'warning'" size="small">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleAlarmDetail(scope.row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </DataPanel>
    </DataPanel>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DataPanel from '@/components/DataPanel.vue'
import GisMap from '@/components/GisMap.vue'
import EchartsWrapper from '@/components/EchartsWrapper.vue'
import { Monitor, Warning, DataAnalysis, OfficeBuilding } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 查询条件
const query = ref({
  dateRange: [],
  deviceTypes: [],
  towns: []
})

// 统计卡片数据
const stats = ref([
  {
    key: 'totalDevices',
    label: '设备总数',
    value: '874',
    trendValue: '+12',
    trend: 'up',
    theme: 'blue',
    icon: Monitor
  },
  {
    key: 'onlineRate',
    label: '在线率',
    value: '98.5%',
    trendValue: '+0.3%',
    trend: 'up',
    theme: 'green',
    icon: DataAnalysis
  },
  {
    key: 'reportCount',
    label: '24h上报量',
    value: '12,430',
    trendValue: '+5.2%',
    trend: 'up',
    theme: 'cyan',
    icon: OfficeBuilding
  },
  {
    key: 'alarmCount',
    label: '告警数量',
    value: '23',
    trendValue: '-8',
    trend: 'down',
    theme: 'red',
    icon: Warning
  }
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

// 地图相关
const gisMapRef = ref(null)
const heatmapType = ref('density')
const showHeatmap = ref(true)

// 告警列表
const alarmList = ref([
  {
    time: '2025-01-15 14:30:25',
    deviceId: 'IOT-2025-004',
    deviceName: '墒情传感器-004',
    type: '数据异常',
    level: '高',
    description: '土壤湿度数据超出正常范围，可能存在传感器故障',
    status: '未处理'
  },
  {
    time: '2025-01-15 14:25:18',
    deviceId: 'IOT-2025-003',
    deviceName: '气象监测站-003',
    type: '离线告警',
    level: '中',
    description: '设备超过2小时未上报数据',
    status: '处理中'
  },
  {
    time: '2025-01-15 14:20:45',
    deviceId: 'IOT-2025-017',
    deviceName: '虫情测报仪-017',
    type: '电量低',
    level: '低',
    description: '设备电量低于20%，建议及时充电',
    status: '已处理'
  }
])

// 乡镇选项
const townOptions = ['城关镇', '高新区', '开发区', '南郊镇', '北郊镇']

// 事件处理
const handleSearch = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  query.value = { dateRange: [], deviceTypes: [], towns: [] }
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const handleAlarmDetail = (alarm) => {
  ElMessage.info(`查看告警详情: ${alarm.deviceId}`)
}

const getAlarmTagType = (level) => {
  const typeMap = { '高': 'danger', '中': 'warning', '低': 'info' }
  return typeMap[level] || 'info'
}

onMounted(() => {
  // 设置默认时间范围为最近7天
  const end = new Date()
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
  query.value.dateRange = [start, end]
})
</script>

<style scoped>
.monitoring-container {
  padding: 10px;
}

.panel-toolbar {
  padding: 0 12px 10px;
  border-bottom: 1px solid rgba(0,170,255,.3);
  margin-bottom: 15px;
}

.filter-form .el-form-item {
  margin-bottom: 8px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  background: rgba(0,0,0,.15);
  border: 1px solid rgba(0,170,255,.3);
  border-radius: 8px;
  padding: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
}

.stat-icon.blue { background: rgba(0,170,255,.2); color: #00aaff; }
.stat-icon.green { background: rgba(103,194,58,.2); color: #67c23a; }
.stat-icon.cyan { background: rgba(0,255,255,.2); color: #00ffff; }
.stat-icon.red { background: rgba(255,107,107,.2); color: #ff6b6b; }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #a0a6b8;
  margin-bottom: 4px;
}

.stat-trend {
  font-size: 12px;
  font-weight: 500;
}

.stat-trend.up { color: #67c23a; }
.stat-trend.down { color: #f56c6c; }

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.chart-panel :deep(.panel-content) {
  padding: 15px;
}

.chart-toolbar {
  margin-bottom: 15px;
  text-align: center;
}

.map-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 0 15px;
}

.map-container {
  height: 400px;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}
</style>


