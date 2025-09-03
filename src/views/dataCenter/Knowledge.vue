<template>
  <div class="knowledge-container">
    <DataPanel title="知识库中心">
      <!-- 筛选工具栏 -->
      <div class="panel-toolbar">
        <el-form :inline="true" :model="query" class="filter-form">
          <el-form-item label="文档类型">
            <el-select v-model="query.docType" placeholder="全部" clearable style="width: 160px;">
              <el-option label="作物栽培规范" value="cultivation" />
              <el-option label="农机设备手册" value="machinery" />
              <el-option label="病虫害防控" value="plant_protection" />
              <el-option label="灌溉施肥方案" value="irrigation_fertilization" />
              <el-option label="气象与灾害应对" value="agro_meteorology" />
              <el-option label="质量与标准" value="quality_standard" />
              <el-option label="运维与故障案例" value="maintenance_case" />
              <el-option label="培训与SOP" value="training_sop" />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="query.keyword" placeholder="搜索关键词" clearable style="width: 220px;" />
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="query.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 260px;"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.status" placeholder="全部" clearable style="width: 140px;">
              <el-option label="已发布" value="published" />
              <el-option label="草稿" value="draft" />
              <el-option label="审核中" value="reviewing" />
              <el-option label="已归档" value="archived" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" @click="handleCreateDoc">新建文档</el-button>
            <el-button type="warning" @click="handleImport">导入文件</el-button>
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

      <!-- 知识文档表格 -->
      <div class="table-container">
        <div class="table-inner">
          <el-table :data="docList" class="dark-table" height="100%" stripe>
            <el-table-column prop="id" label="文档ID" width="120" />
            <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="docType" label="类型" width="140">
              <template #default="scope">
                <el-tag size="small" :type="getDocTypeTagType(scope.row.docType)">
                  {{ getDocTypeName(scope.row.docType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="author" label="作者" width="140" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column prop="updateTime" label="更新时间" width="180" />
            <el-table-column prop="viewCount" label="浏览量" width="100" />
            <el-table-column prop="downloadCount" label="下载量" width="100" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="handleViewDoc(scope.row)">查看</el-button>
                <el-button size="small" type="primary" @click="handleEditDoc(scope.row)">编辑</el-button>
                <el-button size="small" type="warning" @click="handleDownload(scope.row)">下载</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[20, 50, 100, 200]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            prev-text="上一页"
            next-text="下一页"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </DataPanel>

    <!-- 文档详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="文档详情"
      size="60%"
      :with-header="true"
      direction="rtl"
    >
      <div v-if="selectedDoc" class="doc-detail">
        <div class="doc-header">
          <h2>{{ selectedDoc.title }}</h2>
          <div class="doc-meta">
            <el-tag :type="getDocTypeTagType(selectedDoc.docType)" size="small">
              {{ getDocTypeName(selectedDoc.docType) }}
            </el-tag>
            <el-tag :type="getStatusTagType(selectedDoc.status)" size="small">
              {{ getStatusText(selectedDoc.status) }}
            </el-tag>
            <span class="meta-item">作者：{{ selectedDoc.author }}</span>
            <span class="meta-item">创建：{{ selectedDoc.createTime }}</span>
            <span class="meta-item">更新：{{ selectedDoc.updateTime }}</span>
          </div>
        </div>

        <div class="doc-content">
          <div class="content-section">
            <h3>文档摘要</h3>
            <p>{{ selectedDoc.summary }}</p>
          </div>

          <div class="content-section">
            <h3>关键词</h3>
            <div class="keywords">
              <el-tag 
                v-for="keyword in selectedDoc.keywords" 
                :key="keyword" 
                size="small" 
                style="margin-right: 8px; margin-bottom: 8px;"
              >
                {{ keyword }}
              </el-tag>
            </div>
          </div>

          <div class="content-section">
            <h3>文档内容</h3>
            <div class="content-preview" v-html="selectedDoc.content"></div>
          </div>

          <div class="content-section">
            <h3>附件列表</h3>
            <div class="attachments">
              <div v-for="attachment in selectedDoc.attachments" :key="attachment.name" class="attachment-item">
                <el-icon><Document /></el-icon>
                <span class="attachment-name">{{ attachment.name }}</span>
                <span class="attachment-size">{{ attachment.size }}</span>
                <el-button size="small" type="primary" @click="handleDownloadAttachment(attachment)">
                  下载
                </el-button>
              </div>
            </div>
          </div>

          <div class="content-section">
            <h3>使用统计</h3>
            <div class="usage-stats">
              <div class="stat-item">
                <span class="stat-label">浏览量：</span>
                <span class="stat-value">{{ selectedDoc.viewCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">下载量：</span>
                <span class="stat-value">{{ selectedDoc.downloadCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">收藏数：</span>
                <span class="stat-value">{{ selectedDoc.favoriteCount || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="doc-actions">
          <el-button type="primary" @click="handleEditDoc(selectedDoc)">编辑文档</el-button>
          <el-button type="success" @click="handlePublishDoc(selectedDoc)" v-if="selectedDoc.status === 'draft'">
            发布
          </el-button>
          <el-button type="warning" @click="handleArchiveDoc(selectedDoc)" v-if="selectedDoc.status === 'published'">
            归档
          </el-button>
          <el-button @click="detailDrawerVisible = false">关闭</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DataPanel from '@/components/DataPanel.vue'
import { 
  Document, 
  EditPen, 
  View, 
  Download,
  Collection,
  Reading,
  Files,
  Star
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 查询条件
const query = ref({
  docType: '',
  keyword: '',
  dateRange: [],
  status: ''
})

// 统计卡片数据
const stats = ref([
  {
    key: 'totalDocs',
    label: '文档总数',
    value: '1,234',
    desc: '本月新增45篇',
    theme: 'blue',
    icon: Document
  },
  {
    key: 'publishedDocs',
    label: '已发布',
    value: '1,156',
    desc: '发布率93.7%',
    theme: 'green',
    icon: View
  },
  {
    key: 'draftDocs',
    label: '草稿',
    value: '45',
    desc: '待完善',
    theme: 'orange',
    icon: EditPen
  },
  {
    key: 'downloads',
    label: '总下载量',
    value: '15,678',
    desc: '日增长89次',
    theme: 'cyan',
    icon: Download
  }
])

// 文档列表
const docList = ref([
  {
    id: 'DOC-001',
    title: '小麦高产高效栽培技术规程（2025版）',
    docType: 'cultivation',
    author: '省农科院作栽所',
    status: 'published',
    createTime: '2025-01-10 09:00:00',
    updateTime: '2025-01-15 14:30:00',
    viewCount: 156,
    downloadCount: 89,
    summary: '小麦全生育期的关键栽培节点、密度、水肥与病虫草综合防控要点。',
    keywords: ['小麦', '栽培', '高产', '水肥管理'],
    content: '<p>本文档系统梳理了小麦高产高效栽培的关键技术...</p>',
    attachments: [
      { name: '小麦栽培规范.pdf', size: '2.5MB' }
    ]
  },
  {
    id: 'DOC-002',
    title: '自走式喷杆喷雾机操作与维护手册',
    docType: 'machinery',
    author: '设备运维中心',
    status: 'published',
    createTime: '2025-01-08 10:30:00',
    updateTime: '2025-01-12 16:45:00',
    viewCount: 234,
    downloadCount: 156,
    summary: '喷杆喷雾机安全使用、日常点检与常见故障排查流程。',
    keywords: ['农机', '喷雾机', '维护', '保养'],
    content: '<p>本文档介绍了喷杆喷雾机的标准操作与保养要点...</p>',
    attachments: [
      { name: '喷雾机点检表.xlsx', size: '120KB' }
    ]
  },
  {
    id: 'DOC-003',
    title: '玉米田主要病虫害识别与绿色防控',
    docType: 'plant_protection',
    author: '植保技术团队',
    status: 'draft',
    createTime: '2025-01-15 08:00:00',
    updateTime: '2025-01-15 08:00:00',
    viewCount: 45,
    downloadCount: 12,
    summary: '玉米大斑病、粘虫等识别要点及绿色防控技术路线。',
    keywords: ['玉米', '病虫害', '绿色防控'],
    content: '<p>本文档汇总了玉米田主要病虫害的识别方法与绿色防控...</p>',
    attachments: []
  },
  // 额外填充一些模拟数据，便于视觉上填满列表
  ...Array.from({ length: 20 }).map((_, i) => ({
    id: `DOC-${(i + 4).toString().padStart(3, '0')}`,
    title: `智慧农业SOP与标准作业流程示例 ${i + 1}`,
    docType: ['cultivation','machinery','plant_protection','irrigation_fertilization','agro_meteorology','quality_standard','maintenance_case','training_sop'][i % 8],
    author: ['技术中心','运维中心','推广服务站'][i % 3],
    status: ['published','draft','reviewing'][i % 3],
    createTime: '2025-01-05 09:00:00',
    updateTime: '2025-01-15 10:00:00',
    viewCount: 50 + i * 3,
    downloadCount: 20 + i * 2,
    summary: '示例占位文档，用于填充列表与验证分页和布局。',
    keywords: ['SOP','标准','示例'],
    content: '<p>示例内容...</p>',
    attachments: []
  }))
])

// 分页配置
const pagination = ref({
  currentPage: 1,
  pageSize: 50,
  total: 0
})

// 抽屉状态
const detailDrawerVisible = ref(false)
const selectedDoc = ref(null)

// 事件处理函数
const handleSearch = () => {
  ElMessage.success('搜索成功')
}

const handleReset = () => {
  query.value = { docType: '', keyword: '', dateRange: [], status: '' }
}

const handleCreateDoc = () => {
  ElMessage.info('新建文档功能开发中...')
}

const handleImport = () => {
  ElMessage.info('导入文件：占位入口，稍后接入实际导入流程')
}

const handleViewDoc = (doc) => {
  selectedDoc.value = doc
  detailDrawerVisible.value = true
}

const handleEditDoc = (doc) => {
  ElMessage.info(`编辑文档: ${doc.title}`)
}

const handleDownload = (doc) => {
  ElMessage.success(`开始下载: ${doc.title}`)
}

const handleDownloadAttachment = (attachment) => {
  ElMessage.success(`开始下载附件: ${attachment.name}`)
}

const handlePublishDoc = async (doc) => {
  try {
    await ElMessageBox.confirm(`确定要发布文档 "${doc.title}" 吗？`, '确认发布', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    doc.status = 'published'
    ElMessage.success('文档已发布')
  } catch {
    // 用户取消
  }
}

const handleArchiveDoc = async (doc) => {
  try {
    await ElMessageBox.confirm(`确定要归档文档 "${doc.title}" 吗？`, '确认归档', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    doc.status = 'archived'
    ElMessage.success('文档已归档')
  } catch {
    // 用户取消
  }
}

const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
}

const handleCurrentChange = (page) => {
  pagination.value.currentPage = page
}

// 工具函数
const getDocTypeTagType = (type) => {
  const typeMap = {
    cultivation: 'success',
    machinery: 'primary',
    plant_protection: 'warning',
    irrigation_fertilization: 'info',
    agro_meteorology: 'cyan',
    quality_standard: 'danger',
    maintenance_case: 'warning',
    training_sop: 'info'
  }
  return typeMap[type] || 'info'
}

const getDocTypeName = (type) => {
  const typeMap = {
    cultivation: '作物栽培规范',
    machinery: '农机设备手册',
    plant_protection: '病虫害防控',
    irrigation_fertilization: '灌溉施肥方案',
    agro_meteorology: '气象与灾害应对',
    quality_standard: '质量与标准',
    maintenance_case: '运维与故障案例',
    training_sop: '培训与SOP'
  }
  return typeMap[type] || type
}

const getStatusTagType = (status) => {
  const typeMap = {
    published: 'success',
    draft: 'info',
    reviewing: 'warning',
    archived: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    published: '已发布',
    draft: '草稿',
    reviewing: '审核中',
    archived: '已归档'
  }
  return statusMap[status] || status
}

onMounted(() => {
  pagination.value.total = docList.value.length
})
</script>

<style scoped>
.knowledge-container {
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
.stat-icon.green { background: rgba(103,194,58,.2); color: #67c23a; }
.stat-icon.orange { background: rgba(255,152,0,.2); color: #ff9800; }
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
  display: flex;
  flex-direction: column;
  height: calc(100vh - 380px);
  min-height: 260px;
}

.table-inner {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-inner :deep(.el-table) {
  flex: 1 1 auto;
}

.pagination-wrapper {
  padding: 12px 0 0;
  text-align: right;
  border-top: 1px solid rgba(255,255,255,.1);
}

/* 文档详情样式 */
.doc-detail {
  padding: 20px;
}

.doc-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,.1);
}

.doc-header h2 {
  margin: 0 0 15px 0;
  color: #fff;
  font-size: 24px;
}

.doc-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.meta-item {
  color: #a0a6b8;
  font-size: 14px;
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

.content-section p {
  color: #c0c4cc;
  line-height: 1.6;
  margin: 0;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.usage-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: rgba(0,0,0,.1);
  border-radius: 6px;
}

.stat-label {
  color: #a0a6b8;
  font-size: 14px;
}

.stat-value {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  margin-left: 8px;
}

.doc-actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,.1);
  text-align: center;
}

.doc-actions .el-button {
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


