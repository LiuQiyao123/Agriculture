<template>
  <div class="harvest-list">
    <el-table
      :data="harvests"
      :loading="loading"
      style="width: 100%"
      @row-click="handleRowClick"
      :row-class-name="tableRowClassName"
    >
      <!-- Source Icon Column -->
      <el-table-column width="50" align="center" label="来源">
        <template #default="{ row }">
          <el-tooltip :content="row.source === 'ai' ? 'AI建议' : '手动创建'" placement="top">
            <span style="font-size: 1.2rem;">{{ row.source === 'ai' ? '🤖' : '📝' }}</span>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column prop="crop" label="作物类型" min-width="100">
        <template #default="{ row }">
          <el-tag type="success" size="small">{{ row.crop }}</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="plotName" label="关联地块" min-width="120" />
      
      <el-table-column label="采收窗口" min-width="180">
        <template #default="{ row }">
          <span>{{ formatDate(row.harvestStartDate) }} ~ {{ formatDate(row.harvestEndDate) }}</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="estimatedYield" label="预估产量" align="right">
        <template #default="{ row }">
          <span class="yield-text">{{ row.estimatedYield }}kg</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="actualYield" label="实际产量" align="right">
        <template #default="{ row }">
          <span class="yield-text">{{ row.actualYield || '-' }}kg</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="yieldAccuracy" label="预测准确率" min-width="120" align="center">
        <template #default="{ row }">
          <el-progress 
            v-if="row.yieldAccuracy"
            :percentage="row.yieldAccuracy" 
            :color="getAccuracyColor(row.yieldAccuracy)"
            :show-text="false"
            style="width: 60px;"
          />
          <span v-if="row.yieldAccuracy" style="margin-left: 8px;">{{ row.yieldAccuracy }}%</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="quality" label="品质等级" align="center">
        <template #default="{ row }">
          <el-tag 
            :type="getQualityType(row.quality)"
            size="small"
          >
            {{ getQualityText(row.quality) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="status" label="状态" align="center">
        <template #default="{ row }">
          <el-tag 
            :type="getStatusType(row.status)"
            size="small"
          >
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="createdBy" label="创建人" />
      
      <el-table-column label="操作" width="220" fixed="right" align="left">
        <template #default="{ row }">
          <div class="action-buttons">
            <!-- AI Suggested -->
            <template v-if="row.status === 'suggested'">
              <el-button size="small" type="primary" @click.stop="handleAction('review', row)">审核并优化</el-button>
              <el-button size="small" type="info" @click.stop="handleAction('ignore', row.id)">忽略</el-button>
            </template>
            <!-- Pending -->
            <template v-if="row.status === 'pending'">
              <el-button size="small" type="success" @click.stop="handleAction('start', row.id)">开始采收</el-button>
              <el-button size="small" @click.stop="handleRowClick(row)">编辑</el-button>
              <el-button size="small" type="danger" plain @click.stop="handleAction('delete', row.id)">删除</el-button>
            </template>
            <!-- Harvesting -->
            <template v-if="row.status === 'harvesting'">
              <el-button size="small" type="success" @click.stop="handleAction('complete', row.id)">完成采收</el-button>
              <el-button size="small" type="warning" plain @click.stop="handleAction('feedback', row.id)">问题反馈</el-button>
            </template>
            <!-- Feedback -->
            <template v-if="row.status === 'feedback'">
              <el-button size="small" type="warning" @click.stop="handleRowClick(row)">处理反馈</el-button>
            </template>
            <!-- Completed -->
            <template v-if="row.status === 'completed'">
              <el-button size="small" @click.stop="handleRowClick(row)">查看详情</el-button>
              <el-button size="small" type="info" @click.stop="handleAction('archive', row.id)">归档</el-button>
            </template>
            <!-- Ignored -->
             <template v-if="row.status === 'ignored'">
              <el-button size="small" @click.stop="handleAction('recover', row.id)">恢复建议</el-button>
              <el-button size="small" type="danger" plain @click.stop="handleAction('delete', row.id)">彻底删除</el-button>
            </template>
            <!-- Archived -->
            <template v-if="row.status === 'archived'">
              <el-button size="small" disabled>已归档</el-button>
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
  harvests: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['row-click', 'harvest-action']);

const handleRowClick = (row) => {
  emit('row-click', row);
};

const handleAction = (action, payload) => {
  const harvestId = typeof payload === 'object' ? payload.id : payload;
  emit('harvest-action', { action, harvestId, payload });
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const getStatusType = (status) => {
  const statusMap = {
    suggested: 'primary',
    pending: 'info',
    harvesting: 'success',
    feedback: 'warning',
    completed: 'success',
    ignored: 'default',
    archived: 'info'
  };
  return statusMap[status] || 'default';
};

const getStatusText = (status) => {
  const statusMap = {
    suggested: 'AI建议',
    pending: '待采收',
    harvesting: '采收中',
    feedback: '问题反馈',
    completed: '已完成',
    ignored: '已忽略',
    archived: '已归档'
  };
  return statusMap[status] || status;
};

const getQualityType = (quality) => {
  const qualityMap = {
    'A': 'success',
    'B': 'warning',
    'C': 'danger'
  };
  return qualityMap[quality] || 'default';
};

const getQualityText = (quality) => {
  const qualityMap = {
    'A': '优等',
    'B': '良等',
    'C': '次等'
  };
  return qualityMap[quality] || quality;
};

const getAccuracyColor = (accuracy) => {
  if (accuracy >= 90) return '#67c23a';
  if (accuracy >= 80) return '#e6a23c';
  return '#f56c6c';
};

const tableRowClassName = ({ row }) => {
  if (row.status === 'feedback') {
    return 'feedback-row';
  }
  return '';
};
</script>

<style scoped lang="scss">
.harvest-list {
  .yield-text {
    font-weight: 600;
    color: #67c23a;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
  }

  :deep(.el-table .feedback-row) {
    --el-table-tr-bg-color: var(--el-color-warning-light-9);
    
    &:hover > td {
      background-color: var(--el-color-warning-light-8) !important;
    }
  }
}
</style>
