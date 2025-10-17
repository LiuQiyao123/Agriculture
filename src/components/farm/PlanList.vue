<template>
  <div class="plan-list">
    <el-table
      :data="plans"
      :loading="loading"
      style="width: 100%"
      @row-click="handleRowClick"
    >
      <el-table-column prop="name" label="计划名称" min-width="180">
        <template #default="{ row }">
          <div class="plan-name">
            <span class="name">{{ row.name }}</span>
            <el-tag 
              :type="getStatusType(row.status)" 
              size="small" 
              class="status-tag"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="crop" label="作物类型">
        <template #default="{ row }">
          <el-tag type="success" size="small">{{ row.crop }}</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="plotCount" label="关联地块" align="center">
        <template #default="{ row }">
          <span class="plot-count">{{ row.plotCount }}个</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="timeRange" label="时间周期" min-width="160">
        <template #default="{ row }">
          <div class="time-range">
            <div class="start-date">{{ formatDate(row.startDate) }}</div>
            <div class="end-date">{{ formatDate(row.endDate) }}</div>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="profit" label="预估利润" min-width="120" align="right">
        <template #default="{ row }">
          <div class="profit">
            <span class="amount">¥{{ formatNumber(row.profit) }}</span>
            <div class="roi">ROI: {{ calculateROI(row) }}%</div>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="riskLevel" label="风险等级" align="center">
        <template #default="{ row }">
          <el-tag 
            :type="getRiskType(row.riskLevel)" 
            size="small"
          >
            {{ getRiskText(row.riskLevel) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="createdBy" label="创建人" />
      
      <el-table-column label="操作" width="120" fixed="right" align="left">
        <template #default="{ row }">
          <el-button 
            type="primary" 
            size="small" 
            @click.stop="handleViewDetail(row)"
          >
            查看详情
          </el-button>
          <el-button 
            type="default" 
            size="small" 
            @click.stop="handleEditPlan(row)"
          >
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  plans: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['view-detail', 'edit-plan', 'row-click']);

const handleRowClick = (row) => {
  emit('row-click', row);
};

const handleViewDetail = (plan) => {
  emit('view-detail', plan.id);
};

const handleEditPlan = (plan) => {
  emit('edit-plan', plan.id);
};

const getStatusType = (status) => {
  const statusMap = {
    '草稿': 'info',
    '进行中': 'success',
    '已完成': 'info',
    '已暂停': 'warning',
    '已取消': 'danger'
  };
  return statusMap[status] || 'info';
};

const getStatusText = (status) => {
  return status;
};

const getRiskType = (riskLevel) => {
  const riskMap = {
    'low': 'success',
    'medium': 'warning',
    'high': 'danger'
  };
  return riskMap[riskLevel] || 'default';
};

const getRiskText = (riskLevel) => {
  const riskMap = {
    'low': '低风险',
    'medium': '中风险',
    'high': '高风险'
  };
  return riskMap[riskLevel] || '未知';
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toLocaleString();
};

const calculateROI = (row) => {
  if (!row.estimatedCost || row.estimatedCost === 0) return 0;
  return ((row.profit / row.estimatedCost) * 100).toFixed(1);
};
</script>

<style scoped lang="scss">
.plan-list {
  .plan-name {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .name {
      font-weight: 500;
    }
    
    .status-tag {
      margin-left: 8px;
    }
  }
  
  .time-range {
    .start-date {
      font-size: 12px;
      color: #666;
    }
    
    .end-date {
      font-size: 12px;
      color: #999;
    }
  }
  
  .profit {
    .amount {
      font-weight: 600;
      color: #67c23a;
    }
    
    .roi {
      font-size: 12px;
      color: #666;
    }
  }
  
  .plot-count {
    font-weight: 500;
  }
}
</style>

