
<template>
  <div class="page-container">
    <PageTitle title="农机调度" subtitle="AI辅助的智能农机调度决策与管理"/>

    <el-tabs v-model="activeTab" type="card" class="dispatch-tabs">
      <el-tab-pane label="农机档案" name="machines">
        <DataPanel title="农机档案">
          <div class="toolbar">
            <FilterBar v-model="machineFilters" :fields="machineFilterFields" :show-search="false" />
            <div class="actions">
              <el-button type="primary" @click="openMachineForm()">新增农机</el-button>
            </div>
          </div>
          <el-table :data="filteredMachines" class="dark-table" height="520">
            <el-table-column prop="name" label="名称" min-width="140" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="brand" label="品牌" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getMachineStatusTag(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="操作人员" width="120" />
            <el-table-column label="位置" width="160">
              <template #default="{ row }">{{ formatLngLat(row.location) }}</template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="160" align="left">
              <template #default="{ row }">
                <el-button size="small" @click="openMachineForm(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="removeMachine(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </DataPanel>
      </el-tab-pane>

      <el-tab-pane label="作业需求" name="requests">
        <DataPanel title="作业需求">
          <div class="toolbar">
            <FilterBar v-model="requestFilters" :fields="requestFilterFields" :show-search="false" />
            <div class="actions">
              <el-button type="primary" @click="openRequestForm()">新增需求</el-button>
              <el-button @click="mockImportRequests">批量导入(模拟)</el-button>
            </div>
          </div>
          <el-table :data="filteredRequests" class="dark-table" height="520">
            <el-table-column prop="plotName" label="地块" min-width="140" />
            <el-table-column prop="crop" label="作物" width="100" />
            <el-table-column prop="area" label="面积(亩)" width="110" align="right" />
            <el-table-column label="时间窗口" min-width="200">
              <template #default="{ row }">{{ row.windowStart }} ~ {{ row.windowEnd }}</template>
            </el-table-column>
            <el-table-column prop="priority" label="优先级" width="90" />
            <el-table-column prop="status" label="状态" width="110">
              <template #default="{ row }">
                <el-tag :type="getRequestStatusTag(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="220" align="left">
              <template #default="{ row }">
                <el-button size="small" @click="openRequestForm(row)">编辑</el-button>
                <el-button size="small" type="warning" @click="auditRequest(row)">审核</el-button>
                <el-button size="small" type="danger" @click="removeRequest(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </DataPanel>
      </el-tab-pane>

      <el-tab-pane label="智能匹配" name="matching">
        <DataPanel title="匹配与分配">
          <div class="toolbar">
            <el-button @click="recalcScores">刷新评分</el-button>
          </div>
          <KanbanBoard 
            :columns="matchingColumns" 
            :items="matchingItems" 
            group="matching" 
            @item-clicked="openAssignDialog"
          >
            <template #card="{ item }">
              <div class="match-card">
                <div class="row">
                  <div class="title">{{ item.request.plotName }} · {{ item.request.crop }}</div>
                  <el-tag size="small">{{ item.status }}</el-tag>
                </div>
                <div class="row muted">
                  <span>面积: {{ item.request.area }} 亩</span>
                  <span>窗口: {{ item.request.windowStart }} ~ {{ item.request.windowEnd }}</span>
                </div>
                <div class="row muted">
                  <span>优先级: {{ item.request.priority || '—' }}</span>
                  <span>标准: {{ item.request.standard || '—' }}</span>
                </div>
                <div class="row top-matches" v-if="getTopMatches(item.id).length">
                  <span class="muted">匹配TOP3:</span>
                  <div class="matches">
                    <el-tag v-for="m in getTopMatches(item.id)" :key="m.machineId" size="small" type="info">
                      {{ getMachineName(m.machineId) }} · {{ m.score }}
                    </el-tag>
                  </div>
                </div>
                <div class="row actions">
                  <el-button size="small" type="primary" @click.stop="openAssignDialog(item)">一键分配</el-button>
                </div>
              </div>
            </template>
          </KanbanBoard>
        </DataPanel>
      </el-tab-pane>

      <el-tab-pane label="调度监控" name="routing">
        <DataPanel title="路径与导航">
          <div class="route-layout">
            <div class="map-pane">
              <BaseMap ref="routeMapRef" :layers="routeLayers" @feature-clicked="onRouteFeatureClicked" />
            </div>
            <div class="right-pane">
              <div class="camera-box">
                <div class="camera-header">作业摄像头</div>
                <div class="camera-feed">
                  <img :src="cameraPlaceholder" alt="camera" />
                </div>
              </div>
              <div class="kpi-cards">
                <MetricCard title="在途调度" :value="inRouteCount" />
                <MetricCard title="预计到达(分钟)" :value="avgEta" />
              </div>
              <div class="table-wrapper">
                <el-table 
                  :data="dispatches" 
                  class="dark-table" 
                  :height="'100%'"
                  @row-click="onDispatchRowClick"
                  :row-class-name="dispatchRowClass"
                  ref="dispatchTableRef"
                >
                  <el-table-column prop="id" label="调度单" width="120" />
                  <el-table-column prop="request.plotName" label="地块" min-width="120">
                    <template #default="{ row }">{{ row.request?.plotName }}</template>
                  </el-table-column>
                  <el-table-column prop="machine.name" label="农机" min-width="120">
                    <template #default="{ row }">{{ row.machine?.name }}</template>
                  </el-table-column>
                  <el-table-column prop="eta" label="ETA(分钟)" width="110" align="right" />
                  <el-table-column label="进度" width="160">
                    <template #default="{ row }">
                      <el-progress :percentage="row.progress || 0" :stroke-width="8" />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" fixed="right" width="180" align="left">
                    <template #default="{ row }">
                      <el-button size="small" type="success" @click="startNavigation(row)">开始</el-button>
                      <el-button size="small" type="primary" @click="tickProgress(row)">推进</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </DataPanel>
      </el-tab-pane>

      <el-tab-pane label="过程监控" name="monitoring">
        <DataPanel title="过程监控">
          <div class="route-layout">
            <div class="map-pane">
              <BaseMap ref="monitorMapRef" :layers="monitorLayers" />
            </div>
            <div class="right-pane">
              <div class="kpi-cards">
                <MetricCard title="进行中" :value="runningCount" />
                <MetricCard title="异常" :value="alarmCount" />
              </div>
              <div class="table-wrapper" style="display:flex;align-items:flex-start;gap:10px;">
                <el-button type="warning" @click="reportRandomAlarm">模拟异常上报</el-button>
              </div>
            </div>
          </div>
        </DataPanel>
      </el-tab-pane>

      <el-tab-pane label="协同与通知" name="collaboration">
        <DataPanel title="协同与通知">
          <el-button type="primary" @click="notify('新调度已下发')">推送一条通知</el-button>
          <el-button @click="notify('作业已完成')">完成通知</el-button>
          <el-button type="danger" @click="notify('发现异常，请处理')">异常通知</el-button>
        </DataPanel>
      </el-tab-pane>

      <el-tab-pane label="统计与报表" name="reports">
        <DataPanel title="统计与报表">
          <div class="kpi-row">
            <MetricCard title="利用率(%)" :value="kpi.utilization" />
            <MetricCard title="完成率(%)" :value="kpi.completion" />
            <MetricCard title="平均响应(min)" :value="kpi.avgResponse" />
          </div>
          <el-table :data="reportRows" class="dark-table" height="520">
            <el-table-column prop="machine" label="农机" min-width="140" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="jobs" label="作业数" width="100" align="right" />
            <el-table-column prop="hours" label="时长(h)" width="110" align="right" />
            <el-table-column prop="issues" label="异常" width="90" align="right" />
          </el-table>
        </DataPanel>
      </el-tab-pane>
    </el-tabs>

    <!-- 机器/需求对话框（占位，后续细化表单） -->
    <el-dialog v-model="machineDialogVisible" title="农机信息" width="520px">
      <el-form :model="editingMachine" label-width="100px">
        <el-form-item label="名称"><el-input v-model="editingMachine.name" /></el-form-item>
        <el-form-item label="类型"><el-input v-model="editingMachine.type" /></el-form-item>
        <el-form-item label="品牌"><el-input v-model="editingMachine.brand" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="machineDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="saveMachine">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="requestDialogVisible" title="作业需求" width="520px">
      <el-form :model="editingRequest" label-width="100px">
        <el-form-item label="地块"><el-input v-model="editingRequest.plotName" /></el-form-item>
        <el-form-item label="作物"><el-input v-model="editingRequest.crop" /></el-form-item>
        <el-form-item label="面积(亩)"><el-input v-model.number="editingRequest.area" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="requestDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="saveRequest">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import PageTitle from '@/components/PageTitle.vue'
import DataPanel from '@/components/DataPanel.vue'
import FilterBar from '@/components/forms/FilterBar.vue'
import MetricCard from '@/components/MetricCard.vue'
import KanbanBoard from '@/components/common/KanbanBoard.vue'
import UniversalCalendar from '@/components/common/UniversalCalendar.vue'
import BaseMap from '@/components/map/BaseMap.vue'
import cameraImage from '@/assets/images/农田监控.jpeg'

import { useMachines } from '@/composables/resource/useMachines'
import { useRequests } from '@/composables/resource/useRequests'
import { useDispatch } from '@/composables/resource/useDispatch'

const activeTab = ref('machines')

// composables
const { machines, fetchMachines, createMachine, updateMachine, deleteMachine } = useMachines()
const { requests, fetchRequests, createRequest, updateRequest, deleteRequest, auditToPending } = useRequests()
const { dispatches, matchScores, calcMatchScores, createDispatch, updateDispatch, buildRouteLayers } = useDispatch({ machines, requests })

// 摄像头占位图（使用上传的真实图片）
const cameraPlaceholder = cameraImage

// 1) Machines
const machineDialogVisible = ref(false)
const editingMachine = ref({})
const machineFilters = ref({ keyword: '', type: '', status: '' })
const machineFilterFields = [
  { model: 'type', label: '类型', type: 'select', options: [{label:'全部',value:''},{label:'播种机',value:'播种机'},{label:'收割机',value:'收割机'}] },
  { model: 'status', label: '状态', type: 'select', options: [{label:'全部',value:''},{label:'空闲',value:'空闲'},{label:'作业中',value:'作业中'},{label:'维修',value:'维修'},{label:'保养',value:'保养'}] },
]
const filteredMachines = computed(() => {
  let list = machines.value
  if (machineFilters.value.type) list = list.filter(m=>m.type===machineFilters.value.type)
  if (machineFilters.value.status) list = list.filter(m=>m.status===machineFilters.value.status)
  return list
})
const openMachineForm = (row) => { editingMachine.value = row? {...row}: {}; machineDialogVisible.value = true }
const saveMachine = () => {
  if (editingMachine.value.id) updateMachine(editingMachine.value.id, editingMachine.value)
  else createMachine(editingMachine.value)
  machineDialogVisible.value = false; ElMessage.success('已保存')
}
const removeMachine = (id) => { deleteMachine(id); ElMessage.success('已删除') }
const getMachineStatusTag = (s) => (s==='空闲'?'success':s==='作业中'?'primary':s==='维修'?'warning':'info')
const formatLngLat = (loc) => Array.isArray(loc)? `${loc[0].toFixed(4)}, ${loc[1].toFixed(4)}`: ''

// 2) Requests
const requestDialogVisible = ref(false)
const editingRequest = ref({})
const requestFilters = ref({ crop:'', status:'' })
const requestFilterFields = [
  { model:'crop', label:'作物', type:'select', options:[{label:'全部',value:''},{label:'小麦',value:'小麦'},{label:'玉米',value:'玉米'},{label:'大豆',value:'大豆'}] },
  { model:'status', label:'状态', type:'select', options:[{label:'全部',value:''},{label:'待审核',value:'待审核'},{label:'待调度',value:'待调度'},{label:'已调度',value:'已调度'},{label:'作业中',value:'作业中'},{label:'已完成',value:'已完成'}] },
]
const filteredRequests = computed(()=>{
  let list = requests.value
  if (requestFilters.value.crop) list = list.filter(r=>r.crop===requestFilters.value.crop)
  if (requestFilters.value.status) list = list.filter(r=>r.status===requestFilters.value.status)
  return list
})
const openRequestForm = (row) => { editingRequest.value = row? {...row}: {}; requestDialogVisible.value = true }
const saveRequest = () => {
  if (editingRequest.value.id) updateRequest(editingRequest.value.id, editingRequest.value)
  else createRequest(editingRequest.value)
  requestDialogVisible.value = false; ElMessage.success('已保存')
}
const removeRequest = (id) => { deleteRequest(id); ElMessage.success('已删除') }
const auditRequest = (row) => { auditToPending(row.id); ElMessage.success('已审核，进入待调度') }
const getRequestStatusTag = (s) => (s==='待审核'?'warning':s==='待调度'?'info':s==='已调度'?'primary':s==='作业中'?'success':s==='已完成'?'success':'')

// 3) Matching
const matchingColumns = ref([
  { id:'待调度', title:'待调度' },
  { id:'已调度', title:'已调度' },
])
const matchingItems = computed(()=>{
  // 将需求对象一并传入，便于卡片展示更多信息
  return requests.value.map(r=>({ id: r.id, status: r.status==='待调度' ? '待调度' : '已调度', request: r }))
})
const recalcScores = () => { calcMatchScores(); ElMessage.success('已刷新评分') }
const openAssignDialog = (item) => {
  const reqId = typeof item === 'object' ? item.id : item
  const best = matchScores.value.filter(s=>s.requestId===reqId).sort((a,b)=>b.score-a.score)[0]
  if (!best) { ElMessage.warning('暂无可用匹配'); return }
  createDispatch(best.requestId, best.machineId)
  ElNotification({ title:'已分配', message:`${best.request?.plotName} ← ${best.machine?.name}`, type:'success' })
}
const getTopMatches = (requestId) => matchScores.value
  .filter(s=>s.requestId===requestId)
  .sort((a,b)=> b.score-a.score)
  .slice(0,3)
const getMachineName = (id) => machines.value.find(m=>m.id===id)?.name || id

// 4) Routing
const routeMapRef = ref(null)
const dispatchTableRef = ref()
const highlightedId = ref('')

// 根据选中ID重建图层，驱动高亮
const routeLayers = computed(()=> buildRouteLayers(dispatches.value, highlightedId.value) )

const inRouteCount = computed(()=> dispatches.value.filter(d=> (d.progress||0)>0 && (d.progress||0)<100 ).length )
const avgEta = computed(()=>{
  const list = dispatches.value; if (!list.length) return 0
  return Math.round(list.reduce((s,d)=> s + (d.eta||0), 0)/list.length)
})
const startNavigation = (d)=>{ updateDispatch(d.id, { progress: 1 }) }
const tickProgress = (d)=>{ updateDispatch(d.id, { progress: Math.min((d.progress||0)+10, 100) }) }

// 5) Monitoring
const monitorMapRef = ref(null)
const monitorLayers = computed(()=> buildRouteLayers(dispatches.value) )
const runningCount = computed(()=> dispatches.value.filter(d=> (d.progress||0)>0 && (d.progress||0)<100 ).length )
const alarmCount = ref(0)
const reportRandomAlarm = ()=>{ alarmCount.value += 1; ElNotification({ title:'异常上报', message:'发现异常，请处理', type:'warning' }) }

// 7) Reports（简化KPI）
const kpi = computed(()=>({ utilization: 68, completion: 72, avgResponse: 18 }))
const reportRows = computed(()=> machines.value.map(m=>({ machine:m.name, type:m.type, jobs: Math.floor(Math.random()*12)+3, hours: (Math.random()*120).toFixed(1), issues: Math.floor(Math.random()*3) })))

const onDispatchRowClick = (row)=>{
  highlightedId.value = row.id
  // 飞行到对应路线包络
  try {
    const line = row.routeLine?.geometry?.coordinates
    if (routeMapRef.value?.map && Array.isArray(line) && line.length>1) {
      const xs = line.map(c=>c[0]); const ys = line.map(c=>c[1])
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
      routeMapRef.value.map.fitBounds([[minX,minY],[maxX,maxY]], { padding: 80, duration: 500 })
    }
  } catch {}
}

const onRouteFeatureClicked = ({ layerId, feature })=>{
  const id = feature?.properties?.id
  if (!id) return
  highlightedId.value = id
  // 高亮表格行并滚动定位
  nextTick(()=>{
    const idx = dispatches.value.findIndex(d=>d.id===id)
    if (idx>=0 && dispatchTableRef.value?.setCurrentRow) {
      dispatchTableRef.value.setCurrentRow(dispatches.value[idx])
    }
  })
}

const dispatchRowClass = ({ row })=> row.id===highlightedId.value ? 'row-highlight' : ''

onMounted(()=>{ fetchMachines(); fetchRequests(); })
</script>

<style scoped lang="scss">
.page-container { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.dispatch-tabs :deep(.el-tab-pane) { padding-top: 6px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
/* 将容器高度拉满：预留标题/标签/内边距后，使用近全屏高度 */
.route-layout { display: grid; grid-template-columns: 6fr 4fr; gap: 12px; height: calc(100vh - 220px); }
.map-pane { border: 1px solid $border-color; border-radius: 8px; overflow: hidden; height: 100%; }
.right-pane { display: flex; flex-direction: column; gap: 12px; height: 100%; min-height: 0; }
.camera-box { align-self: stretch; width: 100%; border: 1px solid $border-color; border-radius: 8px; overflow: hidden; background: rgba(0,0,0,.2); }
.camera-header { padding: 8px 10px; color: $title-color; font-weight: 600; border-bottom: 1px solid $border-color; }
.camera-feed img { display: block; width: 100%; height: 220px; object-fit: cover; background: #0f1e2e; }
.kpi-cards { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }
.table-wrapper { flex: 1; min-height: 0; }
.kpi-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 10px; }
.match-card { display: flex; flex-direction: column; gap: 6px; color: $text-color; }
.match-card .title { color: $title-color; font-weight: 600; }
.match-card .row { display: flex; justify-content: space-between; align-items: center; }
.match-card .muted { color: $text-color-secondary; font-size: 12px; }
.match-card .matches { display: flex; gap: 6px; flex-wrap: wrap; }
.match-card .actions { justify-content: flex-end; }
.row-highlight :deep(td) { background: rgba(64,158,255,.12) !important; }
</style>


