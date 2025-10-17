<template>
  <div class="page-container">
    <PageTitle title="协同与审批" subtitle="多级审批 · 通知留痕" />
    <DataPanel title="审批列表">
      <el-table :data="rows" class="dark-table" height="520">
        <el-table-column prop="id" label="编号" width="120" />
        <el-table-column prop="bizType" label="业务类型" width="140" />
        <el-table-column prop="title" label="标题" min-width="220" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column label="操作" width="220" align="left">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="approve(row)">通过</el-button>
            <el-button size="small" type="warning" @click="reject(row)">驳回</el-button>
            <el-button size="small" @click="view(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </DataPanel>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PageTitle from '@/components/PageTitle.vue'
import DataPanel from '@/components/DataPanel.vue'

const rows = ref([
  { id: 'A-9001', bizType: 'transfer', title: 'T-1002 复合肥调拨', status: '待审' },
  { id: 'A-9002', bizType: 'forecast', title: '十月预测方案', status: '待审' },
])
const approve = (r)=> { r.status='已通过'; window?.ElMessage?.success?.('已通过') }
const reject = (r)=> { r.status='已驳回'; window?.ElMessage?.warning?.('已驳回') }
const view = (r)=> { window?.ElMessage?.info?.(`查看 ${r.id}`) }
</script>

<style scoped lang="scss">
.page-container { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
</style>


