<template>
  <div class="alert-list">
    <div class="alert-filters">
      <FilterBar
        v-model="filterValues"
        :fields="filterFields"
      />
    </div>

    <div class="alert-content">
      <el-table
        :data="filteredAlerts"
        :loading="loading"
        style="width: 100%"
        @row-click="handleRowClick"
        row-class-name="alert-row"
      >
        <el-table-column prop="type" label="类型">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="预警标题" min-width="250">
          <template #default="{ row }">
            <div class="alert-title">
              <el-icon v-if="row.isRead === false" class="unread-icon">
                <WarningFilled />
              </el-icon>
              <span :class="{ 'unread-text': row.isRead === false }">{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="severity" label="严重程度">
          <template #default="{ row }">
            <el-tag :type="getSeverityTagType(row.severity)" size="small">
              {{ getSeverityLabel(row.severity) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="plotName" label="关联地块" min-width="120" />

        <el-table-column prop="createTime" label="创建时间" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right" align="left">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click.stop="handleViewDetail(row)"
            >
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              @click.stop="handleProcessAlert(row)"
            >
              处理
            </el-button>
            <el-button
              v-if="row.status === 'processing'"
              type="warning"
              size="small"
              @click.stop="handleResolveAlert(row)"
            >
              解决
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="totalAlerts"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { WarningFilled } from '@element-plus/icons-vue';
import FilterBar from '@/components/forms/FilterBar.vue';

const props = defineProps({
  alerts: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['view-detail', 'process-alert', 'resolve-alert']);

// 筛选配置
const filterValues = ref({
  type: '',
  severity: '',
  status: ''
});

const filterFields = [
  {
    model: 'type',
    label: '预警类型',
    type: 'select',
    placeholder: '全部类型',
    width: '150px',
    options: [
      { label: '全部', value: '' },
      { label: '病虫害', value: 'pest' },
      { label: '天气预警', value: 'weather' },
      { label: '土壤异常', value: 'soil' },
      { label: '设备故障', value: 'device' },
      { label: '采收提醒', value: 'harvest' }
    ]
  },
  {
    model: 'severity',
    label: '严重程度',
    type: 'select',
    placeholder: '全部级别',
    width: '150px',
    options: [
      { label: '全部', value: '' },
      { label: '紧急', value: 'urgent' },
      { label: '高', value: 'high' },
      { label: '中', value: 'medium' },
      { label: '低', value: 'low' }
    ]
  },
  {
    model: 'status',
    label: '状态',
    type: 'select',
    placeholder: '全部状态',
    width: '150px',
    options: [
      { label: '全部', value: '' },
      { label: '未处理', value: 'pending' },
      { label: '处理中', value: 'processing' },
      { label: '已解决', value: 'resolved' }
    ]
  }
];

// 分页
const currentPage = ref(1);
const pageSize = ref(20);

// 计算属性
const filteredAlerts = computed(() => {
  let filtered = [...props.alerts];

  // 按类型筛选
  if (filterValues.value.type) {
    filtered = filtered.filter(alert => alert.type === filterValues.value.type);
  }

  // 按严重程度筛选
  if (filterValues.value.severity) {
    filtered = filtered.filter(alert => alert.severity === filterValues.value.severity);
  }

  // 按状态筛选
  if (filterValues.value.status) {
    filtered = filtered.filter(alert => alert.status === filterValues.value.status);
  }

  return filtered;
});

const totalAlerts = computed(() => filteredAlerts.value.length);

// 标签类型映射
const getTypeTagType = (type) => {
  const typeMap = {
    pest: 'danger',
    weather: 'warning',
    soil: 'info',
    device: 'warning',
    harvest: 'success'
  };
  return typeMap[type] || 'info';
};

const getTypeLabel = (type) => {
  const labelMap = {
    pest: '病虫害',
    weather: '天气预警',
    soil: '土壤异常',
    device: '设备故障',
    harvest: '采收提醒'
  };
  return labelMap[type] || type;
};

const getSeverityTagType = (severity) => {
  const severityMap = {
    urgent: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'success'
  };
  return severityMap[severity] || 'info';
};

const getSeverityLabel = (severity) => {
  const labelMap = {
    urgent: '紧急',
    high: '高',
    medium: '中',
    low: '低'
  };
  return labelMap[severity] || severity;
};

const getStatusTagType = (status) => {
  const statusMap = {
    pending: 'danger',
    processing: 'warning',
    resolved: 'success'
  };
  return statusMap[status] || 'info';
};

const getStatusLabel = (status) => {
  const labelMap = {
    pending: '未处理',
    processing: '处理中',
    resolved: '已解决'
  };
  return labelMap[status] || status;
};

// 格式化时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  return new Date(dateTime).toLocaleString('zh-CN');
};

// 事件处理
const handleRowClick = (row) => {
  emit('view-detail', row);
};

const handleViewDetail = (alert) => {
  emit('view-detail', alert);
};

const handleProcessAlert = (alert) => {
  emit('process-alert', alert);
};

const handleResolveAlert = (alert) => {
  emit('resolve-alert', alert);
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 监听筛选条件变化，重置页码
watch(filterValues, () => {
  currentPage.value = 1;
}, { deep: true });
</script>

<style scoped lang="scss">
.alert-list {
  .alert-filters {
    margin-bottom: 20px;
    
    :deep(.search-filter-bar) {
      background: rgba(10, 29, 61, 0.85);
      border: 1px solid rgba(0,170,255,.3);
      border-radius: 8px;
      padding: 16px;
    }
  }

  .alert-content {
    .alert-row {
      cursor: pointer;
      
      &:hover {
        background-color: #f5f7fa;
      }
    }

    .alert-title {
      display: flex;
      align-items: center;

      .unread-icon {
        color: #409eff;
        margin-right: 8px;
        font-size: 12px;
      }

      .unread-text {
        font-weight: 600;
      }
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style>
