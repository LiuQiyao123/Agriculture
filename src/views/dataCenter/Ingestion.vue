<template>
  <div class="ingestion-container">
    <DataPanel title="数据入湖管理">
      <!-- 筛选工具栏 -->
      <div class="panel-toolbar">
        <el-form :inline="true" :model="query" class="filter-form">
          <el-form-item label="任务状态">
            <el-select v-model="query.status" placeholder="全部" clearable style="width: 140px;">
              <el-option label="运行中" value="running" />
              <el-option label="已完成" value="completed" />
              <el-option label="失败" value="failed" />
              <el-option label="暂停" value="paused" />
            </el-select>
          </el-form-item>
          <el-form-item label="数据类型">
            <el-select v-model="query.dataType" placeholder="全部" clearable style="width: 160px;">
              <el-option label="实时数据" value="realtime" />
              <el-option label="历史数据" value="historical" />
              <el-option label="图像数据" value="image" />
              <el-option label="视频数据" value="video" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="query.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px;"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" @click="handleCreateTask">新建任务</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card" v-for="stat in stats" :key="stat.key">
          <div class="stat-icon" :class="stat.theme">
            <el-icon><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-desc">{{ stat.desc }}</div>
          </div>
        </div>
      </div>

      <!-- 接入任务表格 -->
      <DataPanel title="接入任务" class="sub-panel">
        <div class="sub-panel-inner">
        <el-table :data="paginatedTaskList" class="dark-table sub-table" stripe>
          <el-table-column prop="id" label="任务ID" width="120" />
          <el-table-column prop="name" label="任务名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="dataType" label="数据类型" width="100">
            <template #default="scope">
              <el-tag size="small" :type="getDataTypeTagType(scope.row.dataType)">
                {{ getDataTypeName(scope.row.dataType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="priority" label="优先级" width="80">
            <template #default="scope">
              <el-tag 
                size="small" 
                :type="scope.row.priority === 'high' ? 'danger' : scope.row.priority === 'medium' ? 'warning' : 'info'"
              >
                {{ scope.row.priority === 'high' ? '高' : scope.row.priority === 'medium' ? '中' : '低' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="progress" label="进度" width="120">
            <template #default="scope">
              <el-progress 
                :percentage="scope.row.progress" 
                :status="getProgressStatus(scope.row.status)"
                :stroke-width="8"
              />
            </template>
          </el-table-column>
          <el-table-column prop="source" label="数据源" width="120" show-overflow-tooltip />
          <el-table-column prop="target" label="目标分区" width="140" show-overflow-tooltip />
          <el-table-column prop="startTime" label="开始时间" width="180" />
          <el-table-column prop="endTime" label="结束时间" width="180" />
          <el-table-column prop="dataCount" label="数据量" width="100" />
          <el-table-column label="操作" width="260" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleTaskDetail(scope.row)">详情</el-button>
              <el-button 
                v-if="scope.row.status === 'running'" 
                size="small" 
                type="warning" 
                @click="handlePauseTask(scope.row)"
              >
                暂停
              </el-button>
              <el-button 
                v-if="scope.row.status === 'paused'" 
                size="small" 
                type="success" 
                @click="handleResumeTask(scope.row)"
              >
                恢复
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDeleteTask(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="taskList.length > pagination.pageSize"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          :current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :total="taskList.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
          :pager-count="5"
          prev-text="上一页"
          next-text="下一页"
          :page-sizes="[5, 10, 20, 50]"
        />
        </div>
      </DataPanel>

      <!-- 质量报告表格 -->
      <DataPanel title="数据质量报告" class="sub-panel">
        <div class="sub-panel-inner">
        <el-table :data="paginatedQualityList" class="dark-table sub-table" stripe>
          <el-table-column prop="date" label="报告日期" width="120" />
          <el-table-column prop="dataType" label="数据类型" width="100">
            <template #default="scope">
              <el-tag size="small" :type="getDataTypeTagType(scope.row.dataType)">
                {{ getDataTypeName(scope.row.dataType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="totalCount" label="总数据量" width="100" />
          <el-table-column prop="validCount" label="有效数据" width="100" />
          <el-table-column prop="invalidCount" label="无效数据" width="100" />
          <el-table-column prop="qualityScore" label="质量评分" width="120">
            <template #default="scope">
              <el-rate 
                v-model="scope.row.qualityScore" 
                :max="5" 
                disabled 
                show-score 
                text-color="#ff9900"
              />
            </template>
          </el-table-column>
          <el-table-column prop="accuracy" label="准确性" width="80" />
          <el-table-column prop="completeness" label="完整性" width="80" />
          <el-table-column prop="consistency" label="一致性" width="80" />
          <el-table-column prop="issues" label="主要问题" min-width="200" show-overflow-tooltip />
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleQualityDetail(scope.row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="qualityList.length > pagination.pageSize"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          :current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :total="qualityList.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
          :pager-count="5"
          prev-text="上一页"
          next-text="下一页"
          :page-sizes="[5, 10, 20, 50]"
        />
        </div>
      </DataPanel>

      <!-- 数据集清单表格 -->
      <DataPanel title="数据集清单" class="sub-panel">
        <div class="sub-panel-inner">
        <el-table :data="paginatedDatasetList" class="dark-table sub-table" stripe>
          <el-table-column prop="id" label="数据集ID" width="120" />
          <el-table-column prop="name" label="数据集名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="type" label="数据类型" width="100">
            <template #default="scope">
              <el-tag size="small" :type="getDataTypeTagType(scope.row.type)">
                {{ getDataTypeName(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="size" label="数据大小" width="100" />
          <el-table-column prop="recordCount" label="记录数" width="120" />
          <el-table-column prop="version" label="版本" width="100" />
          <el-table-column prop="owner" label="所属部门" width="120" show-overflow-tooltip />
          <el-table-column prop="retention" label="保留策略" width="100" />
          <el-table-column prop="updateTime" label="更新时间" width="180" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'" size="small">
                {{ scope.row.status === 'active' ? '活跃' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="260" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleDatasetDetail(scope.row)">详情</el-button>
              <el-button size="small" type="primary" @click="handleDatasetDownload(scope.row)">下载</el-button>
              <el-button size="small" type="warning" @click="handleDatasetEdit(scope.row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="datasetList.length > pagination.pageSize"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          :current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :total="datasetList.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
          :pager-count="5"
          prev-text="上一页"
          next-text="下一页"
          :page-sizes="[5, 10, 20, 50]"
        />
        </div>
      </DataPanel>
    </DataPanel>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DataPanel from '@/components/DataPanel.vue'
import { 
  DataAnalysis, 
  Warning, 
  CircleCheck, 
  Clock,
  Document,
  VideoPlay,
  Picture,
  Histogram
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 查询条件
const query = ref({
  status: '',
  dataType: '',
  dateRange: []
})

// 统计卡片数据
const stats = ref([
  {
    key: 'totalTasks',
    label: '总任务数',
    value: '156',
    desc: '本月新增23个',
    theme: 'blue',
    icon: DataAnalysis
  },
  {
    key: 'runningTasks',
    label: '运行中',
    value: '12',
    desc: '正常执行中',
    theme: 'green',
    icon: CircleCheck
  },
  {
    key: 'failedTasks',
    label: '失败任务',
    value: '3',
    desc: '需要处理',
    theme: 'red',
    icon: Warning
  },
  {
    key: 'totalData',
    label: '总数据量',
    value: '2.3TB',
    desc: '日增长15GB',
    theme: 'cyan',
    icon: Histogram
  }
])

// 接入任务列表
const taskList = ref([
  {
    id: 'TASK-001',
    name: '墒情数据实时接入',
    dataType: 'realtime',
    status: 'running',
    progress: 75,
    startTime: '2025-01-15 08:00:00',
    endTime: '2025-01-15 20:00:00',
    dataCount: '12,430'
  },
  {
    id: 'TASK-002',
    name: '历史气象数据导入',
    dataType: 'historical',
    status: 'completed',
    progress: 100,
    startTime: '2025-01-14 00:00:00',
    endTime: '2025-01-14 23:59:59',
    dataCount: '45,678'
  },
  {
    id: 'TASK-003',
    name: '无人机图像数据同步',
    dataType: 'image',
    status: 'failed',
    progress: 45,
    startTime: '2025-01-15 10:00:00',
    endTime: '2025-01-15 12:00:00',
    dataCount: '1,234'
  },
  { id: 'TASK-004', name: '视频流接入-南郊监控', dataType: 'video', status: 'running', progress: 32, startTime: '2025-01-15 09:10:00', endTime: '-', dataCount: '18,239' },
  { id: 'TASK-005', name: '墒情补录数据导入', dataType: 'historical', status: 'paused', progress: 62, startTime: '2025-01-13 08:00:00', endTime: '-', dataCount: '8,902' },
  { id: 'TASK-006', name: '气象分钟级数据接入', dataType: 'realtime', status: 'running', progress: 88, startTime: '2025-01-15 00:00:00', endTime: '-', dataCount: '98,210' },
  { id: 'TASK-007', name: '无人机图像清洗任务', dataType: 'image', status: 'completed', progress: 100, startTime: '2025-01-12 10:00:00', endTime: '2025-01-12 18:00:00', dataCount: '5,432' },
  { id: 'TASK-008', name: '历史视频补传', dataType: 'video', status: 'failed', progress: 12, startTime: '2025-01-11 08:00:00', endTime: '2025-01-11 09:00:00', dataCount: '712' },
  { id: 'TASK-009', name: '土壤电导率批量入湖', dataType: 'historical', status: 'completed', progress: 100, startTime: '2025-01-10 07:00:00', endTime: '2025-01-10 22:00:00', dataCount: '76,543' },
  { id: 'TASK-010', name: '田间监测站离线补传', dataType: 'realtime', status: 'running', progress: 54, startTime: '2025-01-15 06:30:00', endTime: '-', dataCount: '6,781' }
])

// 质量报告列表
const qualityList = ref([
  {
    date: '2025-01-15',
    dataType: 'realtime',
    totalCount: 12430,
    validCount: 11850,
    invalidCount: 580,
    qualityScore: 4.5,
    issues: '部分传感器数据异常，存在重复上报'
  },
  {
    date: '2025-01-14',
    dataType: 'historical',
    totalCount: 45678,
    validCount: 44500,
    invalidCount: 1178,
    qualityScore: 4.2,
    issues: '历史数据中存在空值，时间戳格式不统一'
  },
  { date: '2025-01-13', dataType: 'image', totalCount: 5632, validCount: 5421, invalidCount: 211, qualityScore: 4.0, issues: '部分图像分辨率不达标' },
  { date: '2025-01-12', dataType: 'video', totalCount: 1290, validCount: 1263, invalidCount: 27, qualityScore: 4.7, issues: '少量视频损坏片段' },
  { date: '2025-01-11', dataType: 'realtime', totalCount: 11230, validCount: 11090, invalidCount: 140, qualityScore: 4.8, issues: '整体质量较好' }
])

// 数据集清单
const datasetList = ref([
  {
    id: 'DS-001',
    name: '墒情监测数据集',
    type: 'realtime',
    size: '156MB',
    recordCount: '1,234,567',
    updateTime: '2025-01-15 20:00:00',
    status: 'active'
  },
  {
    id: 'DS-002',
    name: '气象历史数据集',
    type: 'historical',
    size: '2.1GB',
    recordCount: '45,678,901',
    updateTime: '2025-01-14 23:59:59',
    status: 'active'
  },
  {
    id: 'DS-003',
    name: '无人机图像数据集',
    type: 'image',
    size: '156MB',
    recordCount: '12,345',
    updateTime: '2025-01-15 12:00:00',
    status: 'active'
  },
  { id: 'DS-004', name: '土壤电导率数据集', type: 'historical', size: '890MB', recordCount: '3,456,789', updateTime: '2025-01-10 22:00:00', status: 'active' },
  { id: 'DS-005', name: '田间监测站离线补传集', type: 'realtime', size: '512MB', recordCount: '678,901', updateTime: '2025-01-15 06:30:00', status: 'active' },
  { id: 'DS-006', name: '视频补传合集', type: 'video', size: '12.4GB', recordCount: '2,345', updateTime: '2025-01-11 09:00:00', status: 'active' }
])

// 分页相关
const pagination = ref({
  currentPage: 1,
  pageSize: 5
})

// 计算属性：分页后的数据
const paginatedTaskList = ref([])
const paginatedQualityList = ref([])
const paginatedDatasetList = ref([])

onMounted(() => {
  updatePaginatedData()
})

// 监听分页变化，更新数据
const handleCurrentChange = (newPage) => {
  pagination.value.currentPage = newPage
  updatePaginatedData()
}

const handleSizeChange = (newSize) => {
  pagination.value.pageSize = newSize
  pagination.value.currentPage = 1 // 重置当前页为1
  updatePaginatedData()
}

// 更新分页数据
const updatePaginatedData = () => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  paginatedTaskList.value = taskList.value.slice(start, end)
  paginatedQualityList.value = qualityList.value.slice(start, end)
  paginatedDatasetList.value = datasetList.value.slice(start, end)
}

// 事件处理函数
const handleSearch = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  query.value = { status: '', dataType: '', dateRange: [] }
}

const handleCreateTask = () => {
  ElMessage.info('新建任务功能开发中...')
}

const handleTaskDetail = (task) => {
  ElMessage.info(`查看任务详情: ${task.id}`)
}

const handlePauseTask = async (task) => {
  try {
    await ElMessageBox.confirm(`确定要暂停任务 ${task.id} 吗？`, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    task.status = 'paused'
    ElMessage.success('任务已暂停')
  } catch {
    // 用户取消
  }
}

const handleResumeTask = async (task) => {
  try {
    await ElMessageBox.confirm(`确定要恢复任务 ${task.id} 吗？`, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    task.status = 'running'
    ElMessage.success('任务已恢复')
  } catch {
    // 用户取消
  }
}

const handleDeleteTask = async (task) => {
  try {
    await ElMessageBox.confirm(`确定要删除任务 ${task.id} 吗？此操作不可恢复！`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const index = taskList.value.findIndex(t => t.id === task.id)
    if (index > -1) {
      taskList.value.splice(index, 1)
      ElMessage.success('任务已删除')
    }
  } catch {
    // 用户取消
  }
}

const handleQualityDetail = (quality) => {
  ElMessage.info(`查看质量报告: ${quality.date}`)
}

const handleDatasetDetail = (dataset) => {
  ElMessage.info(`查看数据集详情: ${dataset.id}`)
}

const handleDatasetDownload = (dataset) => {
  ElMessage.success(`开始下载数据集: ${dataset.name}`)
}

const handleDatasetEdit = (dataset) => {
  ElMessage.info(`编辑数据集: ${dataset.name}`)
}

// 工具函数
const getDataTypeTagType = (type) => {
  const typeMap = {
    realtime: 'success',
    historical: 'primary',
    image: 'warning',
    video: 'danger'
  }
  return typeMap[type] || 'info'
}

const getDataTypeName = (type) => {
  const typeMap = {
    realtime: '实时数据',
    historical: '历史数据',
    image: '图像数据',
    video: '视频数据'
  }
  return typeMap[type] || type
}

const getStatusTagType = (status) => {
  const typeMap = {
    running: 'success',
    completed: 'primary',
    failed: 'danger',
    paused: 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    running: '运行中',
    completed: '已完成',
    failed: '失败',
    paused: '暂停'
  }
  return statusMap[status] || status
}

const getProgressStatus = (status) => {
  if (status === 'failed') return 'exception'
  if (status === 'completed') return 'success'
  return ''
}

</script>

<style scoped>
.ingestion-container {
  padding: 5px;
  height: 100vh;
  overflow-y: auto;
}

.panel-toolbar {
  padding: 0 12px 5px;
  border-bottom: 1px solid rgba(0,170,255,.3);
  margin-bottom: 5px;
}

.filter-form .el-form-item {
  margin-bottom: 8px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 5px;
}

.stat-card {
  display: flex;
  align-items: center;
  background: rgba(0,0,0,.15);
  border: 1px solid rgba(0,170,255,.3);
  border-radius: 8px;
  padding: 5px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
}

.stat-icon.blue { background: rgba(0,170,255,.2); color: #00aaff; }
.stat-icon.green { background: rgba(103,194,58,.2); color: #67c23a; }
.stat-icon.cyan { background: rgba(0,255,255,.2); color: #00ffff; }
.stat-icon.red { background: rgba(255,107,107,.2); color: #ff6b6b; }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #a0a6b8;
  margin-bottom: 4px;
}

.stat-desc {
  font-size: 12px;
  color: #909399;
}

.sub-panel {
  margin-bottom: 6px;
  height: 280px; /* 提高三个子表容器高度 */
}

.sub-panel :deep(.panel-content) {
  padding: 5px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sub-panel-inner {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.sub-table {
  flex: 1 1 auto;
  height: auto;
  min-height: 0;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* 统一三个子表的行高与字号 */
:deep(.el-table__row) { height: 34px; }
:deep(.el-table__cell) { padding: 6px 8px; font-size: 12px; }
:deep(.el-table .cell) { font-size: 12px; }

:deep(.el-rate__icon) { font-size: 14px; }

:deep(.el-progress-bar__outer) {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 分页组件样式 - 紧凑版 */
:deep(.el-pagination) {
  margin-top: 3px;
  text-align: center;
}

:deep(.el-pagination .el-pager li) {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 170, 255, 0.3);
  color: #c0c4cc;
}

:deep(.el-pagination .el-pager li.is-active) {
  background-color: #00aaff;
  border-color: #00aaff;
  color: #fff;
}

:deep(.el-pagination .el-pager li:hover) {
  background-color: rgba(0, 170, 255, 0.2);
  border-color: #00aaff;
  color: #fff;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 170, 255, 0.3);
  color: #c0c4cc;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  background-color: rgba(0, 170, 255, 0.2);
  border-color: #00aaff;
  color: #fff;
}

:deep(.el-pagination .el-pagination__total),
:deep(.el-pagination .el-pagination__sizes) {
  color: #c0c4cc;
}

:deep(.el-pagination .el-pagination__jump) {
  color: #c0c4cc;
}

:deep(.el-pagination .el-pagination__jump .el-input__inner) {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 170, 255, 0.3);
  color: #c0c4cc;
}

:deep(.el-rate__icon) {
  font-size: 14px;
}

/* 取消之前更紧的高度，使用统一 34px 行高 */
</style>


