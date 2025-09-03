<template>
  <el-dialog :model-value="visible" title="设备详情" width="980px" @update:model-value="$emit('update:visible', false)" @opened="handleOpened">
    <template v-if="device">
      <el-descriptions :column="4" border>
        <el-descriptions-item label="设备ID" :span="2">{{ device.id }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ device.type }}</el-descriptions-item>
        <el-descriptions-item label="状态"><el-tag :type="statusTagType(device.status)">{{ device.status }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="名称" :span="2">{{ device.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="乡镇">{{ device.town || '-' }}</el-descriptions-item>
        <el-descriptions-item label="电量%">{{ device.battery ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="最后上报">{{ device.lastSeen || device.lastReport || '-' }}</el-descriptions-item>
        <el-descriptions-item label="经度">{{ device.coordinates?.[0] }}</el-descriptions-item>
        <el-descriptions-item label="纬度">{{ device.coordinates?.[1] }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>实时数据</el-divider>
      <el-table :data="realtimeRows" size="small" stripe>
        <el-table-column prop="key" label="指标" width="200" />
        <el-table-column prop="value" label="数值" />
      </el-table>

      <el-divider>
        <div class="section-title">
          <span>时序趋势（最近{{ timeHours }}小时）</span>
          <el-radio-group v-model="timeHours" size="small" class="time-range">
            <el-radio-button :label="6">6h</el-radio-button>
            <el-radio-button :label="12">12h</el-radio-button>
            <el-radio-button :label="24">24h</el-radio-button>
            <el-radio-button :label="48">48h</el-radio-button>
          </el-radio-group>
        </div>
      </el-divider>
      <div class="chart-block">
        <EchartsWrapper :options="seriesOptions" class="chart" />
      </div>

      <el-divider>图像</el-divider>
      <div class="media-grid">
        <template v-if="(device.images && device.images.length)">
          <el-image v-for="(img,i) in device.images" :key="i" :src="img" fit="cover" :preview-src-list="device.images" class="thumb" />
        </template>
        <div v-else class="empty-text">暂无图像</div>
      </div>
      <el-divider>光谱分析</el-divider>
      <div class="spectrum-block">
        <div class="chart-block">
          <EchartsWrapper :options="spectrumOptions" class="chart" />
        </div>
        <div class="spectrum-note">分析结论：{{ spectrumConclusion }}</div>
      </div>

      <el-divider>运维记录</el-divider>
      <el-timeline>
        <el-timeline-item v-for="(rec,i) in maintainRecords" :key="i" :timestamp="rec.time">{{ rec.text }}</el-timeline-item>
      </el-timeline>
    </template>
    <template v-else>
      <p>暂无设备信息</p>
    </template>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import EchartsWrapper from '@/components/EchartsWrapper.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  device: { type: Object, default: null },
});

defineEmits(['update:visible']);

const statusTagType = (status) => {
  if (status === '在线') return 'success';
  if (status === '离线') return 'info';
  if (status === '告警') return 'warning';
  return '';
};

const timeHours = ref(24)

const triggerResize = async () => {
  await nextTick()
  window.dispatchEvent(new Event('resize'))
  setTimeout(() => window.dispatchEvent(new Event('resize')), 160)
}
const handleOpened = () => triggerResize()
watch(() => props.visible, (v) => { if (v) triggerResize() })
watch(timeHours, () => triggerResize())
watch(() => props.device, () => triggerResize())

// Mock & adapters remain unchanged
const genMockRealtime = (d) => {
  const t = (d?.type || '').toLowerCase()
  if (t.includes('soil')) return { soilMoisture: 45, soilTemperature: 18, ph: 6.8 }
  if (t.includes('weather')) return { temperature: 22, humidity: 65, windSpeed: 3.2, rainfall: 0.4 }
  if (t.includes('field')) return { cropType: '小麦', growthStage: '拔节期', healthIndex: 86 }
  if (t.includes('moth')) return { mothCount: 132, trapType: '诱虫灯', riskLevel: '中' }
  if (t.includes('spore')) return { sporeCount: 24, diseaseType: '锈病', riskLevel: '低' }
  if (t.includes('drone')) return { altitude: 120, speed: 12, coverage: 67 }
  return { value: 10 }
}

const adaptData = (d) => {
  if (!d) return []
  const t = (d.type || '').toLowerCase()
  const data = { ...(d.data || {}), ...genMockRealtime(d) }
  if (t.includes('soil')) return [
    { key:'土壤湿度', value: `${data.soilMoisture}%` },
    { key:'土壤温度', value: `${data.soilTemperature}°C` },
    { key:'pH', value: data.ph },
  ]
  if (t.includes('weather')) return [
    { key:'气温', value: `${data.temperature}°C` },
    { key:'湿度', value: `${data.humidity}%` },
    { key:'风速', value: `${data.windSpeed}m/s` },
    { key:'降雨量', value: `${data.rainfall}mm` },
  ]
  if (t.includes('field')) return [
    { key:'作物类型', value: data.cropType },
    { key:'生长阶段', value: data.growthStage },
    { key:'健康指数', value: data.healthIndex },
  ]
  if (t.includes('moth')) return [
    { key:'虫情数量', value: data.mothCount },
    { key:'诱捕类型', value: data.trapType },
    { key:'风险等级', value: data.riskLevel },
  ]
  if (t.includes('spore')) return [
    { key:'孢子数量', value: data.sporeCount },
    { key:'病害类型', value: data.diseaseType },
    { key:'风险等级', value: data.riskLevel },
  ]
  if (t.includes('drone')) return [
    { key:'飞行高度', value: `${data.altitude}m` },
    { key:'飞行速度', value: `${data.speed}m/s` },
    { key:'覆盖面积', value: `${data.coverage}%` },
  ]
  return Object.keys(data).map(k => ({ key: k, value: String(data[k]) }))
}

const realtimeRows = computed(() => adaptData(props.device))

const seriesOptions = computed(() => {
  const labels = Array.from({ length: timeHours.value }, (_, i) => `${i}:00`)
  const t = (props.device?.type || '').toLowerCase()
  const gen = (base, noise=5) => labels.map(() => Number((base + (Math.random()*2-1)*noise).toFixed(2)))
  let series = []
  if (t.includes('soil')) series = [
    { name:'土壤湿度%', data: gen(45,6), color:'#13c2c2' },
    { name:'土壤温度°C', data: gen(18,2), color:'#faad14' },
  ]
  else if (t.includes('weather')) series = [
    { name:'气温°C', data: gen(22,3), color:'#faad14' },
    { name:'湿度%', data: gen(65,6), color:'#00aaff' },
  ]
  else if (t.includes('field')) series = [
    { name:'健康指数', data: gen(85,4), color:'#52c41a' },
  ]
  else if (t.includes('moth')) series = [
    { name:'虫情数量', data: gen(120,20), color:'#722ed1' },
  ]
  else if (t.includes('spore')) series = [
    { name:'孢子数量', data: gen(20,6), color:'#ff6b6b' },
  ]
  else if (t.includes('drone')) series = [
    { name:'飞行高度m', data: gen(120,30), color:'#4ecdc4' },
    { name:'速度m/s', data: gen(12,3), color:'#00aaff' },
  ]
  else series = [{ name:'值', data: gen(10,3), color:'#00aaff' }]

  return {
    tooltip: { trigger:'axis' },
    legend: { textStyle:{ color:'#c0c4cc' } },
    grid: { top: 30, left: 40, right: 20, bottom: 30 },
    xAxis: { type:'category', data: labels, axisLabel:{ color:'#c0c4cc', fontSize: 10 }, axisLine:{ lineStyle:{ color:'rgba(255,255,255,.3)'} } },
    yAxis: { type:'value', axisLabel:{ color:'#c0c4cc', fontSize:10 }, splitLine:{ lineStyle:{ color:'rgba(255,255,255,.1)'} } },
    series: series.map(s => ({ name:s.name, type:'line', data:s.data, smooth:true, showSymbol:false, lineStyle:{ color:s.color } }))
  }
})

const spectrumOptions = computed(() => {
  const wavelengths = Array.from({ length: 60 }, (_, i) => 400 + i*7)
  const base = wavelengths.map(w => (Math.sin((w-400)/140) + 1) * 30 + 20 + Math.random()*5)
  return {
    tooltip: { trigger:'axis' },
    grid: { top: 20, left: 40, right: 20, bottom: 30 },
    xAxis: { type:'category', data: wavelengths, name:'nm', axisLabel:{ color:'#c0c4cc', fontSize:10 } },
    yAxis: { type:'value', axisLabel:{ color:'#c0c4cc', fontSize:10 }, splitLine:{ lineStyle:{ color:'rgba(255,255,255,.1)'} } },
    series: [{ type:'line', data: base, smooth:true, areaStyle:{ opacity:0.15 }, lineStyle:{ color:'#20dbfd' } }]
  }
})

const spectrumConclusion = computed(() => '可见绿峰增强，叶绿素含量偏高，长势良好')

const maintainRecords = computed(() => {
  if (props.device?.maintain && props.device.maintain.length) return props.device.maintain
  return [
    { time: '2025-01-15 09:20', text: '例行巡检：设备运行正常' },
    { time: '2025-01-10 14:05', text: '更换电源模块，恢复在线' },
    { time: '2024-12-30 16:40', text: '固件升级至 v1.2.3' },
  ]
})
</script>

<style scoped>
:deep(.el-dialog__body){ display:flex; flex-direction:column; gap:10px; overflow-y:auto; max-height: calc(100vh - 160px); }
.section-title { display:flex; align-items:center; justify-content: space-between; width:100%; }
.time-range { margin-left: 12px; }
.media-grid { display:grid; grid-template-columns: repeat(auto-fill,minmax(120px,1fr)); gap:8px; margin-bottom: 8px; }
.thumb { width:100%; height:100px; object-fit:cover; border-radius:6px; overflow:hidden; }
.empty-text { color:#909399; font-size:12px; }
.spectrum-block { margin-top: 8px; }
.spectrum-note { color:#c0c4cc; font-size:12px; margin-top:6px; }
.chart-block { width:100%; min-width:0; flex: 0 0 auto; }
.chart { width:100%; height:300px; }
</style> 