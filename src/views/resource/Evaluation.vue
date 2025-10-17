<template>
  <div class="page-container">
    <PageTitle title="评估与报表" subtitle="AI vs 人工 · 成本与效率对比" />
    <div class="kpi-row">
      <MetricCard title="成本下降(%)" :value="report.costDown" />
      <MetricCard title="效率提升(%)" :value="report.effUp" />
      <MetricCard title="库存周转(天)" :value="report.turnover" />
    </div>
    <DataPanel title="方案对比">
      <el-table :data="rows" class="dark-table" height="520">
        <el-table-column prop="metric" label="指标" min-width="200" />
        <el-table-column prop="ai" label="AI方案" width="160" />
        <el-table-column prop="manual" label="人工方案" width="160" />
        <el-table-column prop="delta" label="差异" width="160" />
        <el-table-column prop="explain" label="解释" min-width="260" />
      </el-table>
    </DataPanel>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PageTitle from '@/components/PageTitle.vue'
import DataPanel from '@/components/DataPanel.vue'
import MetricCard from '@/components/MetricCard.vue'

const report = ref({ costDown: 14, effUp: 18, turnover: 23 })
const rows = ref([
  { metric: '运输成本(万元)', ai: 86, manual: 100, delta: '-14%', explain: '路径优化与装载率提升' },
  { metric: '平均到货时效(小时)', ai: 7.4, manual: 9.1, delta: '-18%', explain: '优先级与窗口匹配' },
  { metric: '库存周转(天)', ai: 23, manual: 31, delta: '-26%', explain: '安全库存与补货节奏优化' },
])
</script>

<style scoped lang="scss">
.page-container { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.kpi-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
</style>


