<template>
  <div class="page-container">
    <PageTitle title="计划与调拨" subtitle="看板 · 日历 · 表格" />

    <div class="action-bar">
      <el-radio-group v-model="view" size="small">
        <el-radio-button label="kanban">看板</el-radio-button>
        <el-radio-button label="calendar">日历</el-radio-button>
        <el-radio-button label="table">表格</el-radio-button>
      </el-radio-group>
      <div style="flex:1"></div>
      <el-button type="primary" @click="createDraft">新建计划草案</el-button>
    </div>

    <div v-if="view==='kanban'">
      <KanbanBoard :columns="columns" :items="items" group="transfers" @item-moved="onMove">
        <template #card="{ item }">
          <div class="t-card">
            <div class="row">
              <div class="title">{{ item.title }}</div>
              <el-tag size="small">{{ item.status }}</el-tag>
            </div>
            <div class="row muted">
              <span>去向: {{ item.to }}</span>
              <span>ETA: {{ item.eta || '—' }}</span>
            </div>
            <div class="row actions">
              <el-button size="small" type="primary" @click.stop="approve(item)">审核</el-button>
              <el-button size="small" @click.stop="edit(item)">编辑</el-button>
            </div>
          </div>
        </template>
      </KanbanBoard>
    </div>

    <div v-else-if="view==='calendar'">
      <UniversalCalendar :events="calendarEvents" @event-click="onEventClick" />
    </div>

    <div v-else>
      <el-table :data="items" class="dark-table" height="560">
        <el-table-column prop="id" label="编号" width="120" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column prop="to" label="去向" width="160" />
        <el-table-column prop="eta" label="ETA" width="120" />
        <el-table-column label="操作" width="200" align="left">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="approve(row)">审核</el-button>
            <el-button size="small" @click="edit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="remove(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PageTitle from '@/components/PageTitle.vue'
import KanbanBoard from '@/components/common/KanbanBoard.vue'
import UniversalCalendar from '@/components/common/UniversalCalendar.vue'

const view = ref('kanban')
const columns = ref([
  { id: '待审核', title: '待审核' },
  { id: '待调拨', title: '待调拨' },
  { id: '在途', title: '在途' },
  { id: '已到货', title: '已到货' },
  { id: '异常', title: '异常' },
])

const items = ref([
  { id: 'T-1001', title: '氮肥调拨（仓A→仓B）', status: '待审核', to: '仓B', eta: '' },
  { id: 'T-1002', title: '复合肥调拨（仓A→仓C）', status: '待调拨', to: '仓C', eta: '10:30' },
  { id: 'T-1003', title: '杀菌剂调拨（仓B→仓D）', status: '在途', to: '仓D', eta: '11:40' },
])

const onMove = ({ item, to }) => { item.status = to }
const edit = (item) => { window?.ElMessage?.info?.(`编辑 ${item.id}`) }
const approve = (item) => { item.status = '待调拨'; window?.ElMessage?.success?.('已通过审核，进入待调拨') }
const remove = (id) => { items.value = items.value.filter(x=>x.id!==id); window?.ElMessage?.success?.('已删除') }
const createDraft = () => { items.value.unshift({ id: `T-${Math.floor(Math.random()*9000)+1000}`, title: '新计划草案', status: '待审核', to: '仓B' }) }

const calendarEvents = computed(()=> items.value.map(x=>({ key: x.id, title: x.title, start: new Date(), end: new Date() })))
const onEventClick = (e) => { const it = items.value.find(x=>x.id===e?.event?.key); if (it) edit(it) }
</script>

<style scoped lang="scss">
.page-container { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.action-bar { display: flex; align-items: center; gap: 10px; }
.t-card { display: flex; flex-direction: column; gap: 6px; color: $text-color; }
.t-card .row { display: flex; justify-content: space-between; align-items: center; }
.t-card .title { color: $title-color; font-weight: 600; }
.t-card .muted { color: $text-color-secondary; font-size: 12px; }
</style>


