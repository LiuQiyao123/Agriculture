<template>
  <div class="page-container">
    <PageTitle title="需求预测" subtitle="场景模拟 · 参数权重 · 一键生成计划" />

    <DataPanel title="场景与参数">
      <div class="toolbar">
        <el-select v-model="scenario" placeholder="选择场景" style="width:180px">
          <el-option label="基线" value="baseline" />
          <el-option label="极端气象" value="extreme" />
          <el-option label="病虫暴发" value="pest" />
        </el-select>
        <div class="sliders">
          <div class="slider">
            <span>运输成本权重</span>
            <el-slider v-model="weights.cost" :min="0" :max="100" />
          </div>
          <div class="slider">
            <span>时效性权重</span>
            <el-slider v-model="weights.time" :min="0" :max="100" />
          </div>
          <div class="slider">
            <span>库存水位权重</span>
            <el-slider v-model="weights.stock" :min="0" :max="100" />
          </div>
        </div>
        <el-button type="primary" @click="runForecast">生成预测</el-button>
        <el-button type="success" :disabled="!forecastRows.length" @click="emitPlan">一键生成计划</el-button>
      </div>
    </DataPanel>

    <DataPanel title="预测结果">
      <el-table :data="forecastRows" class="dark-table" height="520">
        <el-table-column prop="region" label="区域" min-width="120" />
        <el-table-column prop="item" label="农资" min-width="160" />
        <el-table-column prop="qty" label="需求量" width="120" align="right" />
        <el-table-column prop="confidence" label="置信度" width="120">
          <template #default="{ row }">
            <el-tag :type="row.confidence>0.8?'success':row.confidence>0.6?'info':'warning'">
              {{ Math.round(row.confidence*100) }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="说明" min-width="260">
          <template #default="{ row }">{{ row.explain }}</template>
        </el-table-column>
      </el-table>
    </DataPanel>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PageTitle from '@/components/PageTitle.vue'
import DataPanel from '@/components/DataPanel.vue'

const scenario = ref('baseline')
const weights = ref({ cost: 40, time: 40, stock: 20 })
const forecastRows = ref([])

const explainMap = {
  baseline: '基于历史趋势与当前库存的基线预测',
  extreme: '考虑极端降雨/温度对需求的放大影响',
  pest: '根据病虫预警对农药类需求的提升'
}

const runForecast = () => {
  // 简单规则模拟
  const items = [
    { region: '高新区', item: '氮肥', base: 120 },
    { region: '历下区', item: '复合肥', base: 80 },
    { region: '章丘区', item: '广谱杀菌剂', base: 60 },
    { region: '长清区', item: '杀虫剂', base: 50 },
  ]
  const s = scenario.value
  forecastRows.value = items.map((x, i) => {
    const factor = s==='extreme'? 1.25 : s==='pest'? 1.35 : 1
    const qty = Math.round(x.base * factor)
    const confidence = s==='baseline' ? 0.85 : s==='extreme'? 0.7 : 0.65
    const w = weights.value
    const r = { region: x.region, item: x.item, qty, confidence, explain: `${explainMap[s]}；权重(成本${w.cost}%/时效${w.time}%/库存${w.stock}%)` }
    return r
  })
}

const emitPlan = () => {
  // 后续与 useTransfers 对接，这里先提示
  if (!forecastRows.value.length) return
  window?.ElMessage?.success?.('已根据预测生成计划草案（模拟）')
}
</script>

<style scoped lang="scss">
.page-container { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.toolbar { display: flex; align-items: center; gap: 12px; }
.sliders { display: flex; gap: 18px; align-items: center; }
.slider { width: 220px; color: $text-color-secondary; }
</style>


