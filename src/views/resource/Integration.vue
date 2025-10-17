<template>
  <div class="page-container">
    <PageTitle title="数据接入与参数" subtitle="数据源占位 · 模型参数权重" />
    <DataPanel title="数据源接入（占位）">
      <el-form label-width="120px" class="dark-form" style="max-width:680px;">
        <el-form-item label="气象服务URL"><el-input placeholder="https://weather.example.com/api" /></el-form-item>
        <el-form-item label="IoT平台密钥"><el-input placeholder="****************" /></el-form-item>
        <el-form-item label="库存系统Endpoint"><el-input placeholder="https://inventory.example.com" /></el-form-item>
        <el-form-item>
          <el-button type="primary">保存</el-button>
        </el-form-item>
      </el-form>
    </DataPanel>

    <DataPanel title="模型参数权重">
      <div class="weights">
        <div class="w-item"><span>运输成本</span><el-slider v-model="w.cost" :min="0" :max="100" /></div>
        <div class="w-item"><span>时效性</span><el-slider v-model="w.time" :min="0" :max="100" /></div>
        <div class="w-item"><span>库存水位</span><el-slider v-model="w.stock" :min="0" :max="100" /></div>
        <div class="w-item"><span>作物优先</span><el-slider v-model="w.crop" :min="0" :max="100" /></div>
        <el-button type="success" @click="saveWeights">保存参数</el-button>
      </div>
    </DataPanel>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PageTitle from '@/components/PageTitle.vue'
import DataPanel from '@/components/DataPanel.vue'

const w = ref({ cost: 40, time: 40, stock: 20, crop: 30 })
const saveWeights = () => { window?.ElMessage?.success?.('已保存参数（演示）') }
</script>

<style scoped lang="scss">
.page-container { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.weights { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; align-items: center; }
.w-item { display: flex; gap: 10px; align-items: center; }
.w-item span { width: 76px; color: $text-color-secondary; }
</style>


