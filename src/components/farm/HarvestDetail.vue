<!-- UNUSED: 未被任何视图/组件引用 -->
<template>
  <div class="harvest-detail" v-if="harvest">
    <div class="detail-header">
      <div class="harvest-info">
        <h2>{{ harvest.crop }} 采收详情</h2>
        <div class="harvest-meta">
          <el-tag :type="getStatusType(harvest.status)">{{ getStatusText(harvest.status) }}</el-tag>
          <span class="plot-name">{{ harvest.plotName }}</span>
          <span class="harvest-date">{{ formatDate(harvest.harvestDate) }}</span>
        </div>
      </div>
    </div>
    
    <div class="detail-content">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="info-section">
            <h3>基本信息</h3>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="作物类型">{{ harvest.crop }}</el-descriptions-item>
              <el-descriptions-item label="关联地块">{{ harvest.plotName }}</el-descriptions-item>
              <el-descriptions-item label="采收日期">{{ harvest.harvestDate }}</el-descriptions-item>
              <el-descriptions-item label="预估产量">{{ harvest.estimatedYield }}kg</el-descriptions-item>
              <el-descriptions-item label="实际产量">{{ harvest.actualYield || '待采收' }}kg</el-descriptions-item>
              <el-descriptions-item label="品质等级">
                <el-tag v-if="harvest.quality" :type="getQualityType(harvest.quality)">
                  {{ getQualityText(harvest.quality) }}
                </el-tag>
                <span v-else>待评估</span>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-col>
        
        <el-col :span="12">
          <div class="info-section">
            <h3>AI分析结果</h3>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="最佳采收窗口">{{ harvest.aiRecommendation?.optimalWindow }}</el-descriptions-item>
              <el-descriptions-item label="预测置信度">{{ harvest.aiRecommendation?.confidence }}%</el-descriptions-item>
              <el-descriptions-item label="预测准确率">{{ harvest.yieldAccuracy || '待计算' }}%</el-descriptions-item>
              <el-descriptions-item label="市场价格">¥{{ harvest.aiRecommendation?.marketPrice }}/kg</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-col>
      </el-row>
      
      <div class="info-section">
        <h3>AI建议</h3>
        <div class="recommendations">
          <div class="recommendation-item">
            <el-icon class="icon"><Clock /></el-icon>
            <span>{{ harvest.aiRecommendation?.recommendations?.timing }}</span>
          </div>
          <div class="recommendation-item">
            <el-icon class="icon"><Tools /></el-icon>
            <span>{{ harvest.aiRecommendation?.recommendations?.method }}</span>
          </div>
          <div class="recommendation-item">
            <el-icon class="icon"><Box /></el-icon>
            <span>{{ harvest.aiRecommendation?.recommendations?.storage }}</span>
          </div>
        </div>
      </div>
      
      <div class="info-section" v-if="harvest.actualYield">
        <h3>采收结果分析</h3>
        <div class="analysis-charts">
          <div class="chart-item">
            <div class="chart-title">产量对比</div>
            <div class="chart-content">
              <div class="yield-comparison">
                <div class="yield-item">
                  <span class="label">预估产量</span>
                  <span class="value">{{ harvest.estimatedYield }}kg</span>
                </div>
                <div class="yield-item">
                  <span class="label">实际产量</span>
                  <span class="value actual">{{ harvest.actualYield }}kg</span>
                </div>
                <div class="yield-item">
                  <span class="label">差异</span>
                  <span class="value" :class="getYieldDiffClass()">
                    {{ getYieldDifference() }}kg
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { Clock, Tools, Box } from '@element-plus/icons-vue';

const props = defineProps({
  harvest: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update']);

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

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

const getYieldDifference = () => {
  if (!props.harvest.actualYield) return 0;
  return props.harvest.actualYield - props.harvest.estimatedYield;
};

const getYieldDiffClass = () => {
  const diff = getYieldDifference();
  if (diff > 0) return 'positive';
  if (diff < 0) return 'negative';
  return 'neutral';
};
</script>

<style scoped lang="scss">
.harvest-detail {
  .detail-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e4e7ed;
    
    .harvest-info {
      h2 {
        margin: 0 0 10px 0;
        color: #303133;
      }
      
      .harvest-meta {
        display: flex;
        align-items: center;
        gap: 15px;
        
        .plot-name {
          color: #67c23a;
          font-weight: 500;
        }
        
        .harvest-date {
          color: #909399;
          font-size: 14px;
        }
      }
    }
  }
  
  .detail-content {
    .info-section {
      margin-bottom: 20px;
      
      h3 {
        margin-bottom: 15px;
        color: #303133;
      }
      
      .recommendations {
        .recommendation-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          
          .icon {
            color: #409eff;
            margin-right: 8px;
          }
          
          span {
            color: #606266;
          }
        }
      }
      
      .analysis-charts {
        .chart-item {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          
          .chart-title {
            font-weight: 600;
            color: #303133;
            margin-bottom: 15px;
          }
          
          .yield-comparison {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            
            .yield-item {
              text-align: center;
              
              .label {
                display: block;
                font-size: 14px;
                color: #909399;
                margin-bottom: 8px;
              }
              
              .value {
                font-size: 18px;
                font-weight: 600;
                color: #303133;
                
                &.actual {
                  color: #67c23a;
                }
                
                &.positive {
                  color: #67c23a;
                }
                
                &.negative {
                  color: #f56c6c;
                }
                
                &.neutral {
                  color: #909399;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
