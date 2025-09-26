


<template>
    <div class="plan-detail" v-if="plan">
      <div class="detail-header">
        <div class="plan-info">
          <h2>{{ plan.name }}</h2>
          <div class="plan-meta">
            <el-tag :type="getStatusType(plan.status)">{{ plan.status }}</el-tag>
            <span class="crop">{{ plan.crop }}</span>
            <span class="created-by">创建人：{{ plan.createdBy }}</span>
          </div>
        </div>
      </div>
      
      <div class="detail-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-section">
              <h3>基本信息</h3>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="计划名称">{{ plan.name }}</el-descriptions-item>
                <el-descriptions-item label="作物类型">{{ plan.crop }}</el-descriptions-item>
                <el-descriptions-item label="关联地块">{{ plan.plotCount }}个</el-descriptions-item>
                <el-descriptions-item label="开始日期">{{ plan.startDate }}</el-descriptions-item>
                <el-descriptions-item label="结束日期">{{ plan.endDate }}</el-descriptions-item>
                <el-descriptions-item label="风险等级">
                  <el-tag :type="getRiskType(plan.riskLevel)">
                    {{ getRiskText(plan.riskLevel) }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>
          
          <el-col :span="12">
            <div class="info-section">
              <h3>财务预测</h3>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="预估成本">¥{{ formatNumber(plan.estimatedCost) }}</el-descriptions-item>
                <el-descriptions-item label="预估收入">¥{{ formatNumber(plan.estimatedRevenue) }}</el-descriptions-item>
                <el-descriptions-item label="预估利润">¥{{ formatNumber(plan.profit) }}</el-descriptions-item>
                <el-descriptions-item label="投资回报率">{{ calculateROI() }}%</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>
        </el-row>
        
        <div class="info-section">
          <h3>关联地块</h3>
          <el-tag 
            v-for="plot in plan.plots" 
            :key="plot"
            class="plot-tag"
          >
            {{ plot }}
          </el-tag>
        </div>
        
        <div class="info-section">
          <h3>农事日历</h3>
          <FarmingCalendar 
            :plan="plan"
            @task-clicked="handleTaskClick"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  import FarmingCalendar from './FarmingCalendar.vue';
  
  const props = defineProps({
    plan: {
      type: Object,
      required: true
    }
  });
  
  const getStatusType = (status) => {
    const statusMap = {
      '草稿': 'info',
      '进行中': 'success',
      '已完成': 'default',
      '已暂停': 'warning',
      '已取消': 'danger'
    };
    return statusMap[status] || 'default';
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
  
  const formatNumber = (num) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toLocaleString();
  };
  
  const calculateROI = () => {
    const { profit, estimatedCost } = props.plan;
    if (!estimatedCost || estimatedCost === 0) return 0;
    return ((profit / estimatedCost) * 100).toFixed(1);
  };
  
  const handleTaskClick = (task) => {
    console.log('Task clicked:', task);
    // 可以在这里添加任务详情弹窗或其他处理逻辑
  };
  </script>
  
  <style scoped lang="scss">
  .plan-detail {
    .detail-header {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e4e7ed;
      
      .plan-info {
        h2 {
          margin: 0 0 10px 0;
          color: #303133;
        }
        
        .plan-meta {
          display: flex;
          align-items: center;
          gap: 15px;
          
          .crop {
            color: #67c23a;
            font-weight: 500;
          }
          
          .created-by {
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
        
        .plot-tag {
          margin-right: 8px;
          margin-bottom: 8px;
        }
      }
    }
  }
  </style>