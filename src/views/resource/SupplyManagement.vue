
<template>
  <div class="page-container">
    <PageTitle title="农资库存管理" subtitle="AI智能管理调配种子、化肥等农资" />

    <el-tabs v-model="activeTab" type="card" class="integrated-tabs">
      <el-tab-pane label="驾驶舱" name="dashboard">
        <ResourceDashboard />
      </el-tab-pane>
      <el-tab-pane label="需求预测" name="forecasts">
        <Forecasts />
      </el-tab-pane>
      <el-tab-pane label="计划与调拨" name="plan">
        <PlanAndTransfers />
      </el-tab-pane>
      <el-tab-pane label="仓储与库存" name="warehouses">
        <Warehouses />
      </el-tab-pane>
      <el-tab-pane label="执行监控" name="execution">
        <Execution />
      </el-tab-pane>
      <el-tab-pane label="协同与审批" name="approvals">
        <Approvals />
      </el-tab-pane>
      <el-tab-pane label="评估与报表" name="evaluation">
        <Evaluation />
      </el-tab-pane>
      <el-tab-pane label="数据接入与参数" name="integration">
        <Integration />
      </el-tab-pane>
    </el-tabs>
  </div>
  
</template>

<script setup>
import { ref } from 'vue'
import PageTitle from '@/components/PageTitle.vue'
import ResourceDashboard from '@/views/resource/ResourceDashboard.vue'
import Forecasts from '@/views/resource/Forecasts.vue'
import PlanAndTransfers from '@/views/resource/PlanAndTransfers.vue'
import Warehouses from '@/views/resource/Warehouses.vue'
import Execution from '@/views/resource/Execution.vue'
import Approvals from '@/views/resource/Approvals.vue'
import Evaluation from '@/views/resource/Evaluation.vue'
import Integration from '@/views/resource/Integration.vue'

const activeTab = ref('warehouses')
</script>

<style scoped lang="scss">
.page-container { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.integrated-tabs :deep(.el-tab-pane) { padding-top: 6px; }
</style>


