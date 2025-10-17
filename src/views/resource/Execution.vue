<template>
  <div class="page-container">
    <PageTitle title="执行监控" subtitle="在途调拨 · 地图高亮 · 进度推进" />
    <div class="layout">
      <div class="map-pane">
        <BaseMap :layers="layers" />
      </div>
      <div class="right-pane">
        <DataPanel title="在途调拨">
          <el-table :data="rows" class="dark-table" height="520">
            <el-table-column prop="id" label="调拨单" width="120" />
            <el-table-column prop="title" label="标题" min-width="200" />
            <el-table-column prop="eta" label="ETA" width="120" />
            <el-table-column label="进度" width="160">
              <template #default="{ row }">
                <el-progress :percentage="row.progress" :stroke-width="8" />
              </template>
            </el-table-column>
          </el-table>
        </DataPanel>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PageTitle from '@/components/PageTitle.vue'
import DataPanel from '@/components/DataPanel.vue'
import BaseMap from '@/components/map/BaseMap.vue'

const rows = ref([
  { id: 'T-1003', title: '杀菌剂调拨（仓B→仓D）', eta: '11:40', progress: 45 },
  { id: 'T-1005', title: '氮肥调拨（仓A→仓E）', eta: '12:05', progress: 20 },
])

// 图层占位（后续接 useTransfers.buildRouteLayers）
const layers = ref([])
</script>

<style scoped lang="scss">
.page-container { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.layout { display: grid; grid-template-columns: 7fr 5fr; gap: 12px; }
.map-pane { border: 1px solid $border-color; border-radius: 8px; overflow: hidden; }
.right-pane { display: flex; flex-direction: column; gap: 12px; }
</style>


