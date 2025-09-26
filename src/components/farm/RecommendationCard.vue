<template>
  <div 
    class="recommendation-card" 
    :class="{ 'selected': selected, 'disabled': disabled }"
    @click="handleClick"
  >
    <div class="card-header">
      <h3 class="title">{{ recommendation.title }}</h3>
      <div class="risk-badge" :class="`risk-${recommendation.risk.level}`">
        {{ recommendation.risk.level === 'low' ? '低风险' : 
           recommendation.risk.level === 'medium' ? '中风险' : '高风险' }}
      </div>
    </div>
    
    <div class="card-content">
      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-label">预估产量</div>
          <div class="metric-value yield">{{ recommendation.estimatedYield }}kg/亩</div>
        </div>
        
        <div class="metric-item">
          <div class="metric-label">预估利润</div>
          <div class="metric-value profit">¥{{ formatNumber(recommendation.estimatedProfit) }}</div>
        </div>
        
        <div class="metric-item">
          <div class="metric-label">投入成本</div>
          <div class="metric-value cost">¥{{ formatNumber(recommendation.estimatedCost) }}</div>
        </div>
        
        <div class="metric-item">
          <div class="metric-label">ROI</div>
          <div class="metric-value roi">{{ calculateROI() }}%</div>
        </div>
      </div>
      
      <div class="summary">
        <p>{{ recommendation.summary }}</p>
      </div>
      
      <div class="features">
        <el-tag 
          v-for="feature in recommendation.features" 
          :key="feature"
          size="small"
          class="feature-tag"
        >
          {{ feature }}
        </el-tag>
      </div>
    </div>
    
    <div class="card-footer">
      <el-button 
        type="primary" 
        size="small" 
        :disabled="disabled"
        @click.stop="handleSelect"
      >
        {{ selected ? '已选择' : '选择此方案' }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  recommendation: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select', 'click']);

const handleClick = () => {
  if (!props.disabled) {
    emit('click', props.recommendation);
  }
};

const handleSelect = () => {
  if (!props.disabled) {
    emit('select', props.recommendation);
  }
};

const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toLocaleString();
};

const calculateROI = () => {
  const { estimatedProfit, estimatedCost } = props.recommendation;
  if (!estimatedCost || estimatedCost === 0) return 0;
  return ((estimatedProfit / estimatedCost) * 100).toFixed(1);
};
</script>

<style scoped lang="scss">
.recommendation-card {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #409eff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  }
  
  &.selected {
    border-color: #409eff;
    background: #f0f9ff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  }
  
  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
    
    .risk-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      
      &.risk-low {
        background: #f0f9ff;
        color: #409eff;
      }
      
      &.risk-medium {
        background: #fef3e2;
        color: #e6a23c;
      }
      
      &.risk-high {
        background: #fef0f0;
        color: #f56c6c;
      }
    }
  }
  
  .card-content {
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
      
      .metric-item {
        .metric-label {
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }
        
        .metric-value {
          font-size: 16px;
          font-weight: 600;
          
          &.yield {
            color: #67c23a;
          }
          
          &.profit {
            color: #409eff;
          }
          
          &.cost {
            color: #e6a23c;
          }
          
          &.roi {
            color: #f56c6c;
          }
        }
      }
    }
    
    .summary {
      margin-bottom: 16px;
      
      p {
        margin: 0;
        font-size: 14px;
        color: #606266;
        line-height: 1.5;
      }
    }
    
    .features {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      
      .feature-tag {
        margin: 0;
      }
    }
  }
  
  .card-footer {
    margin-top: 16px;
    text-align: center;
  }
}
</style>
