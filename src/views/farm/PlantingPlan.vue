<template>
  <div class="planting-plan-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">种植计划管理</h1>
        <p class="page-subtitle">AI辅助的智能种植计划制定与管理</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" size="large" :icon="Plus" @click="handleCreatePlan">
          制定种植计划
        </el-button>
      </div>
    </div>

    <!-- 指标概览卡片 -->
    <div class="targets-overview">
      <div class="target-card grain">
        <div class="card-icon">🌾</div>
        <div class="card-content">
          <h3>粮食作物指标</h3>
          <div class="target-stats">
            <div class="stat">
              <span class="stat-label">面积要求</span>
              <span class="stat-value">{{ upperTargets.grainArea }}万亩</span>
            </div>
            <div class="stat">
              <span class="stat-label">产量目标</span>
              <span class="stat-value">{{ upperTargets.grainYield }}万吨</span>
            </div>
            <div class="stat">
              <span class="stat-label">完成时间</span>
              <span class="stat-value">{{ upperTargets.deadline }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="target-card economic">
        <div class="card-icon">🌱</div>
        <div class="card-content">
          <h3>经济作物指标</h3>
          <div class="target-stats">
            <div class="stat">
              <span class="stat-label">面积要求</span>
              <span class="stat-value">{{ upperTargets.economicArea }}万亩</span>
            </div>
            <div class="stat">
              <span class="stat-label">产量目标</span>
              <span class="stat-value">{{ upperTargets.economicYield }}万吨</span>
            </div>
            <div class="stat">
              <span class="stat-label">完成时间</span>
              <span class="stat-value">{{ upperTargets.deadline }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- AI分析面板 -->
      <div class="ai-analysis-section">
        <div class="section-header">
          <h2>🤖 AI智能分析</h2>
          <p>基于历史数据、政策导向和市场前景的综合分析</p>
        </div>
        
        <div class="analysis-grid">
          <div class="analysis-card">
            <div class="card-header">
              <div class="icon">📊</div>
              <h4>历史数据分析</h4>
            </div>
            <div class="card-body">
              <div class="data-item">
                <span class="label">章丘区平均产量</span>
                <span class="value">2.8吨/亩</span>
              </div>
              <div class="data-item">
                <span class="label">历城区土壤改良</span>
                <span class="value">提升15%</span>
              </div>
              <div class="data-item">
                <span class="label">长清区气候适宜度</span>
                <span class="value">85%</span>
              </div>
            </div>
          </div>
          
          <div class="analysis-card">
            <div class="card-header">
              <div class="icon">📋</div>
              <h4>政策导向分析</h4>
            </div>
            <div class="card-body">
              <div class="policy-item">
                <h5>国家粮食安全政策</h5>
                <p>确保粮食播种面积和产量稳定增长</p>
              </div>
              <div class="policy-item">
                <h5>山东省农业规划</h5>
                <p>重点发展特色农业和智慧农业</p>
              </div>
            </div>
          </div>
          
          <div class="analysis-card">
            <div class="card-header">
              <div class="icon">📈</div>
              <h4>市场前景分析</h4>
            </div>
            <div class="card-body">
              <div class="trend-item">
                <span class="trend-label">玉米价格</span>
                <span class="trend-value up">↗ 稳中有升</span>
              </div>
              <div class="trend-item">
                <span class="trend-label">蔬菜需求</span>
                <span class="trend-value up">↗ 持续增长</span>
              </div>
              <div class="trend-item">
                <span class="trend-label">中药材</span>
                <span class="trend-value up">↗ 政策扶持</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 种植计划列表 -->
      <div class="plans-section">
        <div class="section-header">
          <h2>📋 种植计划列表</h2>
          <p>当前所有种植计划的执行情况</p>
        </div>
        
        <div class="plans-table">
          <el-table :data="plantingPlans" style="width: 100%" class="modern-table">
            <el-table-column prop="region" label="区域" min-width="100">
              <template #default="{ row }">
                <div class="region-cell">
                  <span class="region-name">{{ row.region }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="cropName" label="作物" min-width="100">
              <template #default="{ row }">
                <div class="crop-cell">
                  <span class="crop-name">{{ row.cropName }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="cropType" label="类型">
              <template #default="{ row }">
                <el-tag :type="getCropTypeTag(row.cropType)" class="crop-type-tag">
                  {{ row.cropType }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="plannedArea" label="面积(万亩)" align="right">
              <template #default="{ row }">
                <div class="number-cell">{{ row.plannedArea }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="expectedYield" label="产量(万吨)" align="right">
              <template #default="{ row }">
                <div class="number-cell">{{ row.expectedYield }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="plantingDate" label="种植时间" min-width="120">
              <template #default="{ row }">
                <div class="date-cell">{{ row.plantingDate }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" class="status-tag">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right" align="left">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button size="small" @click="handleViewPlan(row)">查看</el-button>
                  <el-button size="small" type="primary" @click="handleEditPlan(row)">编辑</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 执行监控 -->
      <div class="monitor-section">
        <div class="section-header">
          <h2>📊 执行监控</h2>
          <p>实时监控种植计划的执行进度</p>
        </div>
        
        <div class="monitor-grid">
          <div class="progress-card">
            <h4>总体进度</h4>
            <div class="progress-items">
              <div class="progress-item">
                <div class="progress-label">
                  <span>面积完成率</span>
                  <span class="percentage">{{ executionProgress.areaCompletion }}%</span>
                </div>
                <el-progress 
                  :percentage="executionProgress.areaCompletion" 
                  :stroke-width="12"
                  :show-text="false"
                  color="#00aaff"
                />
              </div>
              <div class="progress-item">
                <div class="progress-label">
                  <span>产量完成率</span>
                  <span class="percentage">{{ executionProgress.yieldCompletion }}%</span>
                </div>
                <el-progress 
                  :percentage="executionProgress.yieldCompletion" 
                  :stroke-width="12"
                  :show-text="false"
                  color="#00ff7f"
                />
              </div>
            </div>
          </div>
          
          <div class="work-orders-card">
            <h4>工单管理</h4>
            <div class="work-orders-list">
              <div v-for="order in workOrders" :key="order.id" class="work-order-item">
                <div class="order-header">
                  <span class="order-id">{{ order.id }}</span>
                  <el-tag :type="getOrderStatusTag(order.status)" size="small">
                    {{ order.status }}
                  </el-tag>
                </div>
                <div class="order-content">{{ order.description }}</div>
                <div class="order-footer">
                  <span class="assignee">{{ order.assignee }}</span>
                  <span class="time">{{ order.createTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 协调分析 -->
      <div class="coordination-section">
        <div class="section-header">
          <h2>⚖️ 整体协调分析</h2>
          <p>检测和解决种植计划中的冲突问题</p>
        </div>
        
        <div class="coordination-grid">
          <div class="conflict-card">
            <div class="card-header">
              <div class="icon warning">⚠️</div>
              <h4>冲突检测</h4>
            </div>
            <div class="conflict-list">
              <div class="conflict-item">
                <el-tag type="warning" size="small">资源冲突</el-tag>
                <span>章丘区和历城区都需要玉米种子，供应不足</span>
              </div>
              <div class="conflict-item">
                <el-tag type="warning" size="small">时间冲突</el-tag>
                <span>各区县种植时间重叠，农机调度困难</span>
              </div>
            </div>
          </div>
          
          <div class="solution-card">
            <div class="card-header">
              <div class="icon success">💡</div>
              <h4>协调方案</h4>
            </div>
            <div class="solution-list">
              <div class="solution-item">
                <el-tag type="success" size="small">时间协调</el-tag>
                <span>错峰种植：章丘区4月，历城区5月，长清区6月</span>
              </div>
              <div class="solution-item">
                <el-tag type="success" size="small">资源协调</el-tag>
                <span>统一采购种子，分批供应，确保供应充足</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 对话框 -->
    <AIPlanningDialog
      v-model:visible="isWizardVisible"
      @plan-created="handlePlanCreated"
    />

    <el-dialog
      v-model="isDetailVisible"
      :title="selectedPlan?.name"
      width="80%"
      top="5vh"
    >
      <PlanDetail v-if="selectedPlan" :plan="selectedPlan" />
    </el-dialog>

    <PlanEditDialog
      v-model:visible="isEditVisible"
      :plan="selectedPlan"
      @plan-updated="handlePlanUpdated"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import AIPlanningDialog from '@/components/farm/AIPlanningDialog.vue';
import PlanDetail from '@/components/farm/PlanDetail.vue';
import PlanEditDialog from '@/components/farm/PlanEditDialog.vue';
import { Plus } from '@element-plus/icons-vue';
import { usePlantingPlans } from '@/composables/farm/usePlantingPlans.js';

const { allPlans, loading, fetchPlans, createPlan, updatePlan, getPlanById } = usePlantingPlans();

// 上级指标数据
const upperTargets = reactive({
  grainArea: 200,
  grainYield: 80,
  economicArea: 50,
  economicYield: 20,
  deadline: '2024年12月31日'
});

// 种植计划数据
const plantingPlans = ref([
  {
    id: 1,
    region: '章丘区',
    cropName: '玉米',
    cropType: '粮食作物',
    plannedArea: 60,
    expectedYield: 24,
    plantingDate: '2024-04-15',
    status: '执行中'
  },
  {
    id: 2,
    region: '历城区',
    cropName: '小麦',
    cropType: '粮食作物',
    plannedArea: 40,
    expectedYield: 16,
    plantingDate: '2024-03-01',
    status: '已制定'
  },
  {
    id: 3,
    region: '长清区',
    cropName: '大豆',
    cropType: '粮食作物',
    plannedArea: 30,
    expectedYield: 12,
    plantingDate: '2024-05-01',
    status: '待审批'
  }
]);

// 执行进度数据
const executionProgress = reactive({
  areaCompletion: 78,
  yieldCompletion: 82
});

// 工单数据
const workOrders = ref([
  {
    id: 'PLAN-2024-001',
    type: '资源不足',
    status: '处理中',
    description: '章丘区玉米种子供应不足，需要紧急调配',
    assignee: '王技术员',
    createTime: '2024-01-20 10:30'
  },
  {
    id: 'PLAN-2024-002',
    type: '技术指导',
    status: '已完成',
    description: '历城区小麦种植技术指导',
    assignee: '李专家',
    createTime: '2024-01-18 14:20'
  }
]);

// 对话框状态
const isWizardVisible = ref(false);
const isDetailVisible = ref(false);
const isEditVisible = ref(false);
const selectedPlan = ref(null);

onMounted(() => {
  fetchPlans();
});

const handleCreatePlan = () => {
  isWizardVisible.value = true;
};

const handleViewPlan = (row) => {
  selectedPlan.value = row;
  isDetailVisible.value = true;
};

const handleEditPlan = (row) => {
  selectedPlan.value = row;
  isEditVisible.value = true;
};

const handlePlanCreated = (planData) => {
  createPlan(planData);
  isWizardVisible.value = false;
};

const handlePlanUpdated = (updatedPlan) => {
  updatePlan(updatedPlan.id, updatedPlan);
  isEditVisible.value = false;
  selectedPlan.value = null;
};

// 工具函数
const getCropTypeTag = (type) => {
  const types = {
    '粮食作物': 'success',
    '经济作物': 'primary',
    '蔬菜': 'warning',
    '水果': 'info'
  };
  return types[type] || 'info';
};

const getStatusTagType = (status) => {
  const types = {
    '执行中': 'primary',
    '已制定': 'success',
    '待审批': 'warning',
    '已完成': 'info'
  };
  return types[status] || 'info';
};

const getOrderStatusTag = (status) => {
  const types = {
    '处理中': 'warning',
    '已完成': 'success',
    '待处理': 'info'
  };
  return types[status] || 'info';
};
</script>

<style scoped lang="scss">
.planting-plan-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1929 0%, #1a2332 100%);
  padding: 0;
}

// 页面标题
.page-header {
  background: linear-gradient(135deg, rgba(0, 170, 255, 0.1) 0%, rgba(0, 255, 127, 0.1) 100%);
  padding: 40px 30px;
  border-bottom: 1px solid rgba(0, 170, 255, 0.2);
  
  .header-content {
    .page-title {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      background: linear-gradient(135deg, #00aaff, #00ff7f);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .page-subtitle {
      margin: 0;
      font-size: 16px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
  
  .header-actions {
    margin-top: 20px;
  }
}

// 指标概览
.targets-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 30px;
  
  .target-card {
    background: linear-gradient(135deg, rgba(21, 38, 62, 0.9) 0%, rgba(0, 170, 255, 0.1) 100%);
    border: 1px solid rgba(0, 170, 255, 0.3);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 20px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(0, 170, 255, 0.2);
    }
    
    &.grain {
      background: linear-gradient(135deg, rgba(0, 170, 255, 0.1) 0%, rgba(0, 255, 127, 0.1) 100%);
    }
    
    &.economic {
      background: linear-gradient(135deg, rgba(0, 255, 127, 0.1) 0%, rgba(0, 170, 255, 0.1) 100%);
    }
    
    .card-icon {
      font-size: 48px;
      opacity: 0.8;
    }
    
    .card-content {
      flex: 1;
      
      h3 {
        margin: 0 0 16px 0;
        font-size: 20px;
        font-weight: 600;
        color: #ffffff;
      }
      
      .target-stats {
        .stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          
          .stat-label {
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
          }
          
          .stat-value {
            color: #00aaff;
            font-weight: 600;
            font-size: 16px;
          }
        }
      }
    }
  }
}

// 主要内容
.main-content {
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

// 通用区域样式
.section-header {
  margin-bottom: 24px;
  
  h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 600;
    color: #ffffff;
  }
  
  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
  }
}

// AI分析区域
.ai-analysis-section {
  .analysis-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    
    .analysis-card {
      background: rgba(21, 38, 62, 0.6);
      border: 1px solid rgba(0, 170, 255, 0.2);
      border-radius: 12px;
      padding: 20px;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 170, 255, 0.15);
      }
      
      .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        
        .icon {
          font-size: 24px;
        }
        
        h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
        }
      }
      
      .card-body {
        .data-item, .policy-item, .trend-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          
          .label, h5, .trend-label {
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
            margin: 0;
          }
          
          .value, p, .trend-value {
            color: #ffffff;
            font-weight: 500;
            font-size: 14px;
            margin: 0;
          }
          
          .trend-value.up {
            color: #00ff7f;
          }
        }
      }
    }
  }
}

// 计划列表
.plans-section {
  .plans-table {
    background: rgba(21, 38, 62, 0.6);
    border: 1px solid rgba(0, 170, 255, 0.2);
    border-radius: 12px;
    overflow: hidden;
    
    :deep(.el-table) {
      background: transparent;
      
      .el-table__header {
        background: rgba(0, 170, 255, 0.1);
        
        th {
          background: transparent;
          color: #ffffff;
          font-weight: 600;
          border-bottom: 1px solid rgba(0, 170, 255, 0.2);
        }
      }
      
      .el-table__body {
        background: transparent;
        
        td {
          background: transparent;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }
      }
    }
    
    .region-cell, .crop-cell, .number-cell, .date-cell {
      color: #ffffff;
      font-weight: 500;
    }
    
    .crop-type-tag, .status-tag {
      border-radius: 6px;
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
    }
  }
}

// 监控区域
.monitor-section {
  .monitor-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    
    .progress-card, .work-orders-card {
      background: rgba(21, 38, 62, 0.6);
      border: 1px solid rgba(0, 170, 255, 0.2);
      border-radius: 12px;
      padding: 20px;
      
      h4 {
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 600;
        color: #ffffff;
      }
    }
    
    .progress-items {
      .progress-item {
        margin-bottom: 16px;
        
        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          
          .percentage {
            color: #00aaff;
            font-weight: 600;
          }
        }
      }
    }
    
    .work-orders-list {
      .work-order-item {
        background: rgba(0, 170, 255, 0.05);
        border: 1px solid rgba(0, 170, 255, 0.2);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 8px;
        
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          
          .order-id {
            color: #ffffff;
            font-weight: 500;
            font-size: 14px;
          }
        }
        
        .order-content {
          color: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          margin-bottom: 8px;
        }
        
        .order-footer {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }
      }
    }
  }
}

// 协调分析
.coordination-section {
  .coordination-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    
    .conflict-card, .solution-card {
      background: rgba(21, 38, 62, 0.6);
      border: 1px solid rgba(0, 170, 255, 0.2);
      border-radius: 12px;
      padding: 20px;
      
      .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        
        .icon {
          font-size: 24px;
          
          &.warning {
            color: #ff6b6b;
          }
          
          &.success {
            color: #00ff7f;
          }
        }
        
        h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
        }
      }
      
      .conflict-list, .solution-list {
        .conflict-item, .solution-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(0, 170, 255, 0.05);
          border: 1px solid rgba(0, 170, 255, 0.2);
          border-radius: 8px;
          margin-bottom: 8px;
          
          span:last-child {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .targets-overview {
    grid-template-columns: 1fr;
  }
  
  .monitor-grid, .coordination-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 20px;
    
    .page-title {
      font-size: 24px;
    }
  }
  
  .targets-overview, .main-content {
    padding: 20px;
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
}
</style>