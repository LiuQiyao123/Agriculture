<template>
  <div class="harvest-list">
    <el-table
      :data="harvests"
      :loading="loading"
      style="width: 100%"
      @row-click="handleRowClick"
    >
      <el-table-column prop="crop" label="作物类型" width="120">
        <template #default="{ row }">
          <el-tag type="success" size="small">{{ row.crop }}</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="plotName" label="关联地块" width="120" />
      
      <el-table-column prop="harvestDate" label="采收日期" width="120">
        <template #default="{ row }">
          {{ formatDate(row.harvestDate) }}
        </template>
      </el-table-column>
      
      <el-table-column prop="estimatedYield" label="预估产量" width="120" align="right">
        <template #default="{ row }">
          <span class="yield-text">{{ row.estimatedYield }}kg</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="actualYield" label="实际产量" width="120" align="right">
        <template #default="{ row }">
          <span class="yield-text">{{ row.actualYield || '-' }}kg</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="yieldAccuracy" label="预测准确率" width="120" align="center">
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
      
      <el-table-column prop="quality" label="品质等级" width="100" align="center">
        <template #default="{ row }">
          <el-tag 
            :type="getQualityType(row.quality)"
            size="small"
          >
            {{ getQualityText(row.quality) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag 
            :type="getStatusType(row.status)"
            size="small"
          >
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="createdBy" label="创建人" width="100" />
      
      <el-table-column label="操作" width="180" fixed="right">
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
            @click.stop="handleStartHarvest(row)"
          >
            开始采收
          </el-button>
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

const emit = defineEmits(['row-click', 'view-detail', 'start-harvest']);

const handleRowClick = (row) => {
  emit('row-click', row);
};

const handleViewDetail = (harvest) => {
  emit('view-detail', harvest.id);
};

const handleStartHarvest = (harvest) => {
  emit('start-harvest', harvest.id);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const getStatusType = (status) => {
  const statusMap = {
    'pending': 'info',
    'in_progress': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  };
  return statusMap[status] || 'default';
};

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待采收',
    'in_progress': '采集中',
    'completed': '已完成',
    'cancelled': '已取消'
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
</script>

<style scoped lang="scss">
.harvest-list {
  .yield-text {
    font-weight: 600;
    color: #67c23a;
  }
}
</style>
