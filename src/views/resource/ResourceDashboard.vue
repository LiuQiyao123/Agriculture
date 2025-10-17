<template>
  <div class="page-container">
    <PageTitle title="农资管理驾驶舱" subtitle="KPI 总览 · 地图分布 · 告警 · 摄像头" />

    <div class="kpi-row">
      <MetricCard title="库存周转天数" :value="kpi.turnoverDays" />
      <MetricCard title="在途调拨单" :value="kpi.inTransit" />
      <MetricCard title="库存告警项" :value="kpi.safetyAlerts" />
    </div>

    <div class="layout">
      <div class="map-pane">
        <BaseMap :layers="layers" />
      </div>
      <div class="right-pane">
        <DataPanel title="摄像头与告警">
          <div class="camera-box">
            <div class="camera-header">仓库监控 · 作业摄像头</div>
            <div class="camera-feed">
              <img :src="cameraPlaceholder" alt="camera" />
            </div>
          </div>
          <el-table :data="alerts" class="dark-table" height="260">
            <el-table-column prop="time" label="时间" width="160" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="desc" label="描述" min-width="220" />
          </el-table>
        </DataPanel>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PageTitle from '@/components/PageTitle.vue'
import DataPanel from '@/components/DataPanel.vue'
import MetricCard from '@/components/MetricCard.vue'
import BaseMap from '@/components/map/BaseMap.vue'
import cameraImage from '@/assets/images/农田监控.jpeg'

const cameraPlaceholder = cameraImage

const kpi = computed(() => ({ turnoverDays: 23, inTransit: 5, safetyAlerts: 3 }))

// 占位图层（后续由 useTransfers/useWarehouses 提供）
const layers = ref([])

const alerts = ref([
  { time: '2025-10-16 09:12', type: '库存', desc: '仓库A 氮肥低于安全库存' },
  { time: '2025-10-16 10:03', type: '调度', desc: '调拨 T-1008 预计延误 15 分钟' },
  { time: '2025-10-16 10:21', type: '设备', desc: '冷链车温控波动需复核' },
])
</script>

<style scoped lang="scss">
.page-container { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.kpi-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
.layout { display: grid; grid-template-columns: 7fr 5fr; gap: 12px; }
.map-pane { border: 1px solid $border-color; border-radius: 8px; overflow: hidden; }
.right-pane { display: flex; flex-direction: column; gap: 12px; }
.camera-box { border: 1px solid $border-color; border-radius: 8px; overflow: hidden; background: rgba(0,0,0,.2); margin-bottom: 10px; }
.camera-header { padding: 8px 10px; color: $title-color; font-weight: 600; border-bottom: 1px solid $border-color; }
.camera-feed img { display: block; width: 100%; height: 220px; object-fit: cover; background: #0f1e2e; }
</style>


