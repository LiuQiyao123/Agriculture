<template>
  <div class="page-container">
    <PageTitle title="仓储与库存" subtitle="多仓库存 · 安全库存告警 · 补货建议" />

    <div class="layout">
      <div class="left">
        <DataPanel title="仓库列表">
          <el-table :data="warehouses" class="dark-table" height="520" @row-click="selectWarehouse">
            <el-table-column prop="name" label="仓库" min-width="160" />
            <el-table-column prop="region" label="区域" width="120" />
            <el-table-column label="库存项" width="100" align="right">
              <template #default="{ row }">{{ Object.keys(row.stock||{}).length }}</template>
            </el-table-column>
            <el-table-column label="容量" width="120" align="right" prop="capacity" />
          </el-table>
        </DataPanel>
      </div>
      <div class="right">
        <DataPanel title="库存明细与建议">
          <el-table :data="stockRows" class="dark-table" height="520">
            <el-table-column prop="item" label="物资" min-width="160" />
            <el-table-column prop="qty" label="数量" width="120" align="right" />
            <el-table-column prop="safety" label="安全库存" width="120" align="right" />
            <el-table-column label="告警" width="120">
              <template #default="{ row }">
                <el-tag :type="row.qty < row.safety ? 'danger' : 'success'">{{ row.qty < row.safety ? '低于安全库存' : '正常' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="建议" min-width="180">
              <template #default="{ row }">{{ row.qty < row.safety ? `建议补货 ${row.safety - row.qty}` : '—' }}</template>
            </el-table-column>
          </el-table>
        </DataPanel>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PageTitle from '@/components/PageTitle.vue'
import DataPanel from '@/components/DataPanel.vue'

const warehouses = ref([
  { id: 'W-A', name: '仓库A', region: '高新区', capacity: 1000, stock: { N: 120, NP: 260, FUN: 80 } },
  { id: 'W-B', name: '仓库B', region: '历下区', capacity: 800, stock: { N: 40, NP: 160, FUN: 50 } },
  { id: 'W-C', name: '仓库C', region: '章丘区', capacity: 600, stock: { N: 200, NP: 90, PEST: 60 } },
])
const itemsDict = { N: { name: '氮肥', safety: 100 }, NP: { name: '复合肥', safety: 150 }, FUN: { name: '广谱杀菌剂', safety: 60 }, PEST: { name: '杀虫剂', safety: 70 } }

const selectedId = ref('W-A')
const selectWarehouse = (row)=> { selectedId.value = row.id }
const stockRows = computed(()=>{
  const wh = warehouses.value.find(w=>w.id===selectedId.value)
  if (!wh) return []
  const s = wh.stock || {}
  return Object.keys(s).map(k=>({ item: itemsDict[k]?.name || k, qty: s[k], safety: itemsDict[k]?.safety || 0 }))
})

onMounted(()=>{})
</script>

<style scoped lang="scss">
.page-container { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.layout { display: grid; grid-template-columns: 5fr 7fr; gap: 12px; }
.left, .right { min-height: 0; }
</style>


