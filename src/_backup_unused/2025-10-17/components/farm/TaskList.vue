<!-- UNUSED: 仅被未启用的 TaskManagement.vue 引用 -->
<template>
  <div class="task-list-container">
    <el-table
      :data="tasks"
      :loading="loading"
      style="width: 100%"
      @row-click="handleRowClick"
      :row-class-name="tableRowClassName"
    >
      <!-- 来源图标列 -->
      <el-table-column width="50" align="center">
        <template #default="{ row }">
          <el-tooltip :content="row.source === 'ai' ? 'AI建议' : '手动创建'" placement="top">
            <span class="source-icon">{{ row.source === 'ai' ? '🤖' : '📝' }}</span>
          </el-tooltip>
        </template>
      </el-table-column>

      <!-- 任务标题 -->
      <el-table-column prop="title" label="任务标题" min-width="250">
        <template #default="{ row }">
          <div class="task-title">{{ row.title }}</div>
          <div class="task-meta">
            <span>关联地块: {{ row.plotName }}</span> |
            <span>类型: {{ getTaskTypeName(row.type) }}</span>
          </div>
        </template>
      </el-table-column>

      <!-- 状态 -->
      <el-table-column prop="status" label="状态" min-width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 负责人 -->
      <el-table-column prop="assigneeName" label="负责人" min-width="100" align="center" />

      <!-- 截止日期 -->
      <el-table-column prop="dueDate" label="截止日期" min-width="120" align="center" />
      
      <!-- 进度 -->
      <el-table-column prop="progress" label="进度" min-width="150">
        <template #default="{ row }">
          <el-progress :percentage="row.progress" :color="getProgressColor(row.progress)" />
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="220" fixed="right" align="left">
        <template #default="{ row }">
          <div class="action-buttons">
            <!-- AI建议 -->
            <template v-if="row.status === 'suggested'">
              <el-button size="small" type="success" @click.stop="handleAction('adopt', row.id)">采纳</el-button>
              <el-button size="small" type="info" @click.stop="handleAction('ignore', row.id)">忽略</el-button>
            </template>
            <!-- 待下发 -->
            <template v-if="row.status === 'pending'">
              <el-button size="small" type="primary" @click.stop="handleAction('assign', row.id)">下发</el-button>
              <el-button size="small" @click.stop="handleRowClick(row)">编辑</el-button>
            </template>
            <!-- 执行中 -->
            <template v-if="row.status === 'assigned'">
               <el-button size="small" @click.stop="handleRowClick(row)">查看详情</el-button>
            </template>
            <!-- 问题反馈 -->
            <template v-if="row.status === 'feedback'">
              <el-button size="small" type="warning" @click.stop="handleAction('resolve', row.id)">处理反馈</el-button>
            </template>
            <!-- 已完成 -->
            <template v-if="row.status === 'completed'">
              <el-button size="small" type="info" @click.stop="handleAction('archive', row.id)">归档</el-button>
            </template>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['task-click', 'task-action']);

const handleRowClick = (task) => {
  emit('task-click', task);
};

const handleAction = (action, taskId) => {
  emit('task-action', { action, taskId });
};

const getStatusText = (status) => {
  const map = {
    suggested: 'AI建议',
    pending: '待下发',
    assigned: '执行中',
    feedback: '问题反馈',
    completed: '已完成',
    archived: '已归档'
  };
  return map[status] || '未知';
};

const getStatusTagType = (status) => {
  const map = {
    suggested: 'primary',
    pending: 'info',
    assigned: 'success',
    feedback: 'warning',
    completed: 'info',
    archived: 'info'
  };
  return map[status] || 'default';
};

const getTaskTypeName = (type) => {
    const map = {
        planting: '播种',
        fertilizing: '施肥',
        irrigation: '灌溉',
        pest_control: '病虫害防治',
        harvesting: '采收'
    };
    return map[type] || type;
};

const getProgressColor = (percentage) => {
  if (percentage < 30) return '#f56c6c';
  if (percentage < 70) return '#e6a23c';
  return '#67c23a';
};

const tableRowClassName = ({ row }) => {
  if (row.status === 'feedback') {
    return 'feedback-row';
  }
  if (row.status === 'suggested') {
    return 'suggested-row';
  }
  return '';
};
</script>

<style scoped lang="scss">
.task-list-container {
  .source-icon {
    font-size: 1.2rem;
  }
  
  .task-title {
    font-weight: 500;
  }
  
  .task-meta {
    font-size: 0.8rem;
    color: #909399;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
  }
  
  :deep(.el-table .feedback-row) {
    --el-table-tr-bg-color: var(--el-color-warning-light-9);
    
    &:hover > td {
      background-color: var(--el-color-warning-light-8) !important;
    }
  }

  :deep(.el-table .suggested-row) {
    --el-table-tr-bg-color: var(--el-color-primary-light-9);
  }
}
</style>
