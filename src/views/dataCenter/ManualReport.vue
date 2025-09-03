<template>
  <div class="manual-report-container">
    <DataPanel title="人工上报管理">
      <!-- 筛选工具栏 -->
      <div class="panel-toolbar">
        <el-form :inline="true" :model="query" class="filter-form">
          <el-form-item label="上报ID">
            <el-input v-model="query.id" placeholder="输入上报ID" clearable style="width: 140px;" />
          </el-form-item>
          <el-form-item label="事件类型">
            <el-select v-model="query.eventType" placeholder="全部" clearable style="width: 160px;">
              <el-option label="病虫害" value="pest" />
              <el-option label="气象灾害" value="weather" />
              <el-option label="土壤问题" value="soil" />
              <el-option label="设备故障" value="equipment" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="上报人">
            <el-input v-model="query.reporter" placeholder="输入上报人姓名" clearable style="width: 140px;" />
          </el-form-item>
          <el-form-item label="乡镇">
            <el-select v-model="query.town" placeholder="全部" clearable style="width: 140px;">
              <el-option v-for="town in townOptions" :key="town" :label="town" :value="town" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px;">
              <el-option label="待审核" value="pending" />
              <el-option label="审核中" value="reviewing" />
              <el-option label="已通过" value="approved" />
              <el-option label="已拒绝" value="rejected" />
              <el-option label="已处理" value="processed" />
            </el-select>
          </el-form-item>
          <el-form-item label="上报时间">
            <el-date-picker
              v-model="query.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 360px;"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" @click="handleCreateReport">新建上报</el-button>
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

      <!-- 人工上报表格 -->
      <div class="table-container">
        <el-table :data="reportList" class="dark-table" height="calc(100vh - 400px)" stripe>
          <el-table-column prop="id" label="上报ID" width="120" />
          <el-table-column prop="eventType" label="事件类型" width="100">
            <template #default="scope">
              <el-tag size="small" :type="getEventTypeTagType(scope.row.eventType)">
                {{ getEventTypeName(scope.row.eventType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="reporter" label="上报人" width="100" />
          <el-table-column prop="phone" label="联系电话" width="130" />
          <el-table-column prop="town" label="乡镇" width="100" />
          <el-table-column prop="location" label="具体位置" min-width="150" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reportTime" label="上报时间" width="180" />
          <el-table-column prop="priority" label="优先级" width="80">
            <template #default="scope">
              <el-tag :type="getPriorityTagType(scope.row.priority)" size="small">
                {{ scope.row.priority }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleViewReport(scope.row)">查看</el-button>
              <el-button 
                v-if="scope.row.status === 'pending'" 
                size="small" 
                type="primary" 
                @click="handleReview(scope.row)"
              >
                审核
              </el-button>
              <el-button 
                v-if="scope.row.status === 'approved'" 
                size="small" 
                type="success" 
                @click="handleProcess(scope.row)"
              >
                处理
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[20, 50, 100, 200]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </DataPanel>

    <!-- 上报详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="上报详情"
      size="60%"
      :with-header="true"
      direction="rtl"
    >
      <div v-if="selectedReport" class="report-detail">
        <div class="report-header">
          <h2>{{ selectedReport.title }}</h2>
          <div class="report-meta">
            <el-tag :type="getEventTypeTagType(selectedReport.eventType)" size="small">
              {{ getEventTypeName(selectedReport.eventType) }}
            </el-tag>
            <el-tag :type="getStatusTagType(selectedReport.status)" size="small">
              {{ getStatusText(selectedReport.status) }}
            </el-tag>
            <el-tag :type="getPriorityTagType(selectedReport.priority)" size="small">
              优先级：{{ selectedReport.priority }}
            </el-tag>
          </div>
        </div>

        <div class="report-content">
          <div class="content-section">
            <h3>基本信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">上报人：</span>
                <span class="value">{{ selectedReport.reporter }}</span>
              </div>
              <div class="info-item">
                <span class="label">联系电话：</span>
                <span class="value">{{ selectedReport.phone }}</span>
              </div>
              <div class="info-item">
                <span class="label">乡镇：</span>
                <span class="value">{{ selectedReport.town }}</span>
              </div>
              <div class="info-item">
                <span class="label">具体位置：</span>
                <span class="value">{{ selectedReport.location }}</span>
              </div>
              <div class="info-item">
                <span class="label">上报时间：</span>
                <span class="value">{{ selectedReport.reportTime }}</span>
              </div>
              <div class="info-item">
                <span class="label">处理时限：</span>
                <span class="value">{{ selectedReport.deadline || '未设置' }}</span>
              </div>
            </div>
          </div>

          <div class="content-section">
            <h3>事件描述</h3>
            <div class="description">
              <p>{{ selectedReport.description }}</p>
            </div>
          </div>

          <div class="content-section" v-if="selectedReport.images && selectedReport.images.length">
            <h3>现场图片</h3>
            <div class="image-gallery">
              <div 
                v-for="(image, index) in selectedReport.images" 
                :key="index" 
                class="image-item"
                @click="previewImage(image)"
              >
                <img :src="image.url" :alt="image.name" />
                <div class="image-name">{{ image.name }}</div>
              </div>
            </div>
          </div>

          <div class="content-section" v-if="selectedReport.attachments && selectedReport.attachments.length">
            <h3>附件列表</h3>
            <div class="attachments">
              <div v-for="attachment in selectedReport.attachments" :key="attachment.name" class="attachment-item">
                <el-icon><Document /></el-icon>
                <span class="attachment-name">{{ attachment.name }}</span>
                <span class="attachment-size">{{ attachment.size }}</span>
                <el-button size="small" type="primary" @click="handleDownloadAttachment(attachment)">
                  下载
                </el-button>
              </div>
            </div>
          </div>

          <div class="content-section" v-if="selectedReport.reviewNotes">
            <h3>审核意见</h3>
            <div class="review-notes">
              <p>{{ selectedReport.reviewNotes }}</p>
              <div class="review-meta">
                <span>审核人：{{ selectedReport.reviewer }}</span>
                <span>审核时间：{{ selectedReport.reviewTime }}</span>
              </div>
            </div>
          </div>

          <div class="content-section" v-if="selectedReport.processNotes">
            <h3>处理结果</h3>
            <div class="process-notes">
              <p>{{ selectedReport.processNotes }}</p>
              <div class="process-meta">
                <span>处理人：{{ selectedReport.processor }}</span>
                <span>处理时间：{{ selectedReport.processTime }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="report-actions">
          <el-button 
            v-if="selectedReport.status === 'pending'" 
            type="primary" 
            @click="handleReview(selectedReport)"
          >
            审核
          </el-button>
          <el-button 
            v-if="selectedReport.status === 'approved'" 
            type="success" 
            @click="handleProcess(selectedReport)"
          >
            处理
          </el-button>
          <el-button @click="detailDrawerVisible = false">关闭</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 审核对话框 -->
    <el-dialog
      v-model="reviewDialogVisible"
      title="审核上报"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="reviewForm.result">
            <el-radio label="approved">通过</el-radio>
            <el-radio label="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            v-model="reviewForm.notes"
            type="textarea"
            :rows="4"
            placeholder="请输入审核意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReview">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 处理对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      title="处理上报"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="processForm" label-width="80px">
        <el-form-item label="处理结果">
          <el-input
            v-model="processForm.notes"
            type="textarea"
            :rows="4"
            placeholder="请输入处理结果和措施"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProcess">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DataPanel from '@/components/DataPanel.vue'
import { 
  Document, 
  Warning, 
  CircleCheck, 
  Clock,
  User,
  Location,
  Phone
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 查询条件
const query = ref({
  id: '',
  eventType: '',
  reporter: '',
  town: '',
  status: '',
  dateRange: []
})

// 统计卡片数据
const stats = ref([
  {
    key: 'totalReports',
    label: '总上报数',
    value: '156',
    desc: '本月新增23个',
    theme: 'blue',
    icon: Document
  },
  {
    key: 'pendingReports',
    label: '待审核',
    value: '12',
    desc: '需要及时处理',
    theme: 'orange',
    icon: Clock
  },
  {
    key: 'approvedReports',
    label: '已通过',
    value: '134',
    desc: '审核通过率85.9%',
    theme: 'green',
    icon: CircleCheck
  },
  {
    key: 'processedReports',
    label: '已处理',
    value: '98',
    desc: '处理率73.1%',
    theme: 'cyan',
    icon: User
  }
])

// 人工上报列表
const reportList = ref([
  {
    id: 'MR-001',
    eventType: 'pest',
    title: '发现小麦条锈病',
    reporter: '张三',
    phone: '138****1234',
    town: '城关镇',
    location: '城关镇东郊村小麦田',
    status: 'pending',
    reportTime: '2025-01-15 14:30:00',
    priority: '高',
    description: '在东郊村小麦田发现条锈病，叶片出现黄色条状病斑，面积约2亩，需要及时处理。',
    images: [
      { url: 'https://via.placeholder.com/150x100/ff6b6b/ffffff?text=病害图片1', name: '病害图片1.jpg' },
      { url: 'https://via.placeholder.com/150x100/ff6b6b/ffffff?text=病害图片2', name: '病害图片2.jpg' }
    ],
    attachments: [],
    deadline: '2025-01-16 14:30:00'
  },
  {
    id: 'MR-002',
    eventType: 'weather',
    title: '强降雨导致农田积水',
    reporter: '李四',
    phone: '139****5678',
    town: '高新区',
    location: '高新区南郊农田',
    status: 'approved',
    reportTime: '2025-01-15 10:00:00',
    priority: '中',
    description: '昨晚强降雨导致南郊农田积水严重，水深约20cm，影响作物生长。',
    images: [
      { url: 'https://via.placeholder.com/150x100/4ecdc4/ffffff?text=积水图片', name: '积水图片.jpg' }
    ],
    attachments: [],
    reviewNotes: '情况属实，需要及时排水处理',
    reviewer: '王审核员',
    reviewTime: '2025-01-15 11:00:00'
  },
  {
    id: 'MR-003',
    eventType: 'equipment',
    title: '灌溉设备故障',
    reporter: '王五',
    phone: '137****9012',
    town: '开发区',
    location: '开发区西区灌溉站',
    status: 'processed',
    reportTime: '2025-01-14 16:00:00',
    priority: '高',
    description: '西区灌溉站水泵出现异常噪音，无法正常供水，影响周边农田灌溉。',
    images: [],
    attachments: [
      { name: '设备检查报告.pdf', size: '1.2MB' }
    ],
    reviewNotes: '设备故障属实，需要维修',
    reviewer: '李审核员',
    reviewTime: '2025-01-14 17:00:00',
    processNotes: '已联系维修人员，更换了损坏的轴承，设备恢复正常运行',
    processor: '赵维修员',
    processTime: '2025-01-15 09:00:00'
  }
])

// 分页配置
const pagination = ref({
  currentPage: 1,
  pageSize: 50,
  total: 0
})

// 抽屉和对话框状态
const detailDrawerVisible = ref(false)
const selectedReport = ref(null)
const reviewDialogVisible = ref(false)
const processDialogVisible = ref(false)

// 表单数据
const reviewForm = ref({
  result: 'approved',
  notes: ''
})

const processForm = ref({
  notes: ''
})

// 乡镇选项
const townOptions = ['城关镇', '高新区', '开发区', '南郊镇', '北郊镇']

// 事件处理函数
const handleSearch = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  query.value = { id: '', eventType: '', reporter: '', town: '', status: '', dateRange: [] }
}

const handleCreateReport = () => {
  ElMessage.info('新建上报功能开发中...')
}

const handleViewReport = (report) => {
  selectedReport.value = report
  detailDrawerVisible.value = true
}

const handleReview = (report) => {
  selectedReport.value = report
  reviewForm.value = { result: 'approved', notes: '' }
  reviewDialogVisible.value = true
}

const handleProcess = (report) => {
  selectedReport.value = report
  processForm.value = { notes: '' }
  processDialogVisible.value = true
}

const submitReview = async () => {
  if (!reviewForm.value.notes.trim()) {
    ElMessage.warning('请输入审核意见')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要${reviewForm.value.result === 'approved' ? '通过' : '拒绝'}这个上报吗？`, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const report = selectedReport.value
    report.status = reviewForm.value.result
    report.reviewNotes = reviewForm.value.notes
    report.reviewer = '当前用户'
    report.reviewTime = new Date().toLocaleString()

    ElMessage.success('审核完成')
    reviewDialogVisible.value = false
  } catch {
    // 用户取消
  }
}

const submitProcess = async () => {
  if (!processForm.value.notes.trim()) {
    ElMessage.warning('请输入处理结果')
    return
  }

  try {
    await ElMessageBox.confirm('确定要提交处理结果吗？', '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const report = selectedReport.value
    report.status = 'processed'
    report.processNotes = processForm.value.notes
    report.processor = '当前用户'
    report.processTime = new Date().toLocaleString()

    ElMessage.success('处理完成')
    processDialogVisible.value = false
  } catch {
    // 用户取消
  }
}

const handleDownloadAttachment = (attachment) => {
  ElMessage.success(`开始下载附件: ${attachment.name}`)
}

const previewImage = (image) => {
  // 这里可以实现图片预览功能
  ElMessage.info(`预览图片: ${image.name}`)
}

const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
}

const handleCurrentChange = (page) => {
  pagination.value.currentPage = page
}

// 工具函数
const getEventTypeTagType = (type) => {
  const typeMap = {
    pest: 'danger',
    weather: 'warning',
    soil: 'info',
    equipment: 'primary',
    other: 'default'
  }
  return typeMap[type] || 'default'
}

const getEventTypeName = (type) => {
  const typeMap = {
    pest: '病虫害',
    weather: '气象灾害',
    soil: '土壤问题',
    equipment: '设备故障',
    other: '其他'
  }
  return typeMap[type] || type
}

const getStatusTagType = (status) => {
  const typeMap = {
    pending: 'warning',
    reviewing: 'info',
    approved: 'success',
    rejected: 'danger',
    processed: 'primary'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待审核',
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已拒绝',
    processed: '已处理'
  }
  return statusMap[status] || status
}

const getPriorityTagType = (priority) => {
  if (priority === '高') return 'danger'
  if (priority === '中') return 'warning'
  return 'info'
}

onMounted(() => {
  pagination.value.total = reportList.value.length
})
</script>

<style scoped>
.manual-report-container {
  padding: 10px;
}

.panel-toolbar {
  padding: 0 12px 10px;
  border-bottom: 1px solid rgba(0,170,255,.3);
  margin-bottom: 15px;
}

.filter-form .el-form-item {
  margin-bottom: 8px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  background: rgba(0,0,0,.15);
  border: 1px solid rgba(0,170,255,.3);
  border-radius: 8px;
  padding: 15px;
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
.stat-icon.orange { background: rgba(255,152,0,.2); color: #ff9800; }
.stat-icon.green { background: rgba(103,194,58,.2); color: #67c23a; }
.stat-icon.cyan { background: rgba(0,255,255,.2); color: #00ffff; }

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

.table-container {
  background: rgba(0,0,0,.15);
  border: 1px solid rgba(0,170,255,.3);
  border-radius: 8px;
  padding: 15px;
}

.pagination-wrapper {
  padding: 15px 0 0;
  text-align: right;
  border-top: 1px solid rgba(255,255,255,.1);
}

/* 上报详情样式 */
.report-detail {
  padding: 20px;
}

.report-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,.1);
}

.report-header h2 {
  margin: 0 0 15px 0;
  color: #fff;
  font-size: 24px;
}

.report-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.content-section {
  margin-bottom: 30px;
}

.content-section h3 {
  color: #fff;
  font-size: 18px;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255,255,255,.1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .label {
  color: #a0a6b8;
  font-size: 14px;
  min-width: 80px;
}

.info-item .value {
  color: #c0c4cc;
  font-size: 14px;
}

.description p {
  color: #c0c4cc;
  line-height: 1.6;
  margin: 0;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.image-item {
  cursor: pointer;
  text-align: center;
}

.image-item img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid transparent;
  transition: border-color 0.3s;
}

.image-item:hover img {
  border-color: #409EFF;
}

.image-name {
  margin-top: 8px;
  color: #a0a6b8;
  font-size: 12px;
}

.attachments {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(0,0,0,.1);
  border-radius: 6px;
}

.attachment-name {
  flex: 1;
  color: #c0c4cc;
}

.attachment-size {
  color: #909399;
  font-size: 12px;
  margin-right: 10px;
}

.review-notes,
.process-notes {
  background: rgba(0,0,0,.1);
  padding: 15px;
  border-radius: 6px;
}

.review-notes p,
.process-notes p {
  color: #c0c4cc;
  line-height: 1.6;
  margin: 0 0 10px 0;
}

.review-meta,
.process-meta {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 12px;
}

.report-actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,.1);
  text-align: center;
}

.report-actions .el-button {
  margin: 0 10px;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

:deep(.el-drawer__header) {
  background: #1a1a1a;
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,.1);
}

:deep(.el-drawer__body) {
  background: #0d1b1c;
  color: #c0c4cc;
}

:deep(.el-dialog) {
  background: #0d1b1c;
}

:deep(.el-dialog__header) {
  background: #1a1a1a;
  color: #fff;
}

:deep(.el-dialog__body) {
  background: #0d1b1c;
  color: #c0c4cc;
}

:deep(.el-pagination) {
  .el-pagination__total,
  .el-pagination__jump {
    color: #c0c4cc;
  }
  
  .el-pager li {
    background-color: transparent;
    color: #c0c4cc;
    
    &.active {
      background-color: #409EFF;
      color: white;
    }
    
    &:hover {
      background-color: rgba(64, 158, 255, 0.1);
    }
  }
}
</style>


