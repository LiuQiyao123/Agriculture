<template>
    <el-dialog
      v-model="dialogVisible"
      title="AI采收决策分析"
      width="80%"
      top="5vh"
      :close-on-click-modal="false"
    >
      <div class="decision-content">
        <div class="analysis-section">
          <h3>AI分析结果</h3>
          <div class="analysis-cards">
            <div class="analysis-card">
              <div class="card-title">最佳采收窗口</div>
              <div class="card-value">{{ aiAnalysis.optimalWindow }}</div>
              <div class="card-desc">基于成熟度和天气预测</div>
            </div>
            <div class="analysis-card">
              <div class="card-title">预估产量</div>
              <div class="card-value">{{ aiAnalysis.estimatedYield }}kg</div>
              <div class="card-desc">置信度: {{ aiAnalysis.confidence }}%</div>
            </div>
            <div class="analysis-card">
              <div class="card-title">市场价格</div>
              <div class="card-value">¥{{ aiAnalysis.marketPrice }}/kg</div>
              <div class="card-desc">当前市场行情</div>
            </div>
          </div>
        </div>
        
        <div class="recommendations-section">
          <h3>采收建议</h3>
          <div class="recommendations">
            <div class="recommendation-item">
              <el-icon class="recommendation-icon"><Check /></el-icon>
              <span>{{ aiAnalysis.recommendations.timing }}</span>
            </div>
            <div class="recommendation-item">
              <el-icon class="recommendation-icon"><Check /></el-icon>
              <span>{{ aiAnalysis.recommendations.method }}</span>
            </div>
            <div class="recommendation-item">
              <el-icon class="recommendation-icon"><Check /></el-icon>
              <span>{{ aiAnalysis.recommendations.storage }}</span>
            </div>
          </div>
        </div>
        
        <div class="factors-section">
          <h3>影响因素分析</h3>
          <div class="factors-grid">
            <div 
              v-for="factor in aiAnalysis.factors" 
              :key="factor.name"
              class="factor-item"
            >
              <div class="factor-name">{{ factor.name }}</div>
              <div class="factor-impact">
                <el-progress 
                  :percentage="factor.impact" 
                  :color="getImpactColor(factor.impact)"
                  :show-text="false"
                />
                <span class="impact-text">{{ factor.impact }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm">
            确认创建采收计划
          </el-button>
        </span>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, watch, onMounted } from 'vue';
  import { Check } from '@element-plus/icons-vue';
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    plot: {
      type: Object,
      default: null
    }
  });
  
  const emit = defineEmits(['update:visible', 'harvest-created']);
  
  const dialogVisible = ref(props.visible);
  
  const aiAnalysis = ref({
    optimalWindow: '2025-09-10 至 2025-09-20',
    estimatedYield: 850,
    confidence: 92,
    marketPrice: 2.8,
    recommendations: {
      timing: '建议在9月15日前后3天内完成采收，避开降雨天气',
      method: '使用联合收割机进行机械化采收，提高效率',
      storage: '采收后立即进行干燥处理，避免霉变损失'
    },
    factors: [
      { name: '作物成熟度', impact: 95 },
      { name: '天气条件', impact: 88 },
      { name: '市场价格', impact: 75 },
      { name: '土壤湿度', impact: 65 },
      { name: '病虫害风险', impact: 45 }
    ]
  });
  
  watch(() => props.visible, (newVal) => {
    dialogVisible.value = newVal;
    if (newVal) {
      // 模拟AI分析
      simulateAIAnalysis();
    }
  });
  
  watch(dialogVisible, (newVal) => {
    if (!newVal) {
      emit('update:visible', false);
    }
  });
  
  const simulateAIAnalysis = async () => {
    // 模拟AI分析过程
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 根据地块数据生成分析结果
    if (props.plot) {
      aiAnalysis.value.estimatedYield = Math.floor(Math.random() * 200) + 700;
      aiAnalysis.value.confidence = Math.floor(Math.random() * 20) + 80;
    }
  };
  
  const getImpactColor = (impact) => {
    if (impact >= 80) return '#67c23a';
    if (impact >= 60) return '#e6a23c';
    return '#f56c6c';
  };
  
  const handleConfirm = () => {
    const harvestData = {
      crop: '玉米', // 实际应该从地块数据获取
      plotId: props.plot?.id || 'A01',
      plotName: props.plot?.id || '地块A01',
      harvestDate: '2025-09-15',
      estimatedYield: aiAnalysis.value.estimatedYield,
      quality: null,
      status: 'pending',
      aiRecommendation: aiAnalysis.value
    };
    
    emit('harvest-created', harvestData);
    dialogVisible.value = false;
  };
  
  onMounted(() => {
    if (props.visible) {
      simulateAIAnalysis();
    }
  });
  </script>
  
  <style scoped lang="scss">
  .decision-content {
    .analysis-section {
      margin-bottom: 30px;
      
      h3 {
        margin-bottom: 20px;
        color: #303133;
      }
      
      .analysis-cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        
        .analysis-card {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          text-align: center;
          
          .card-title {
            font-size: 14px;
            color: #909399;
            margin-bottom: 8px;
          }
          
          .card-value {
            font-size: 24px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 4px;
          }
          
          .card-desc {
            font-size: 12px;
            color: #606266;
          }
        }
      }
    }
    
    .recommendations-section {
      margin-bottom: 30px;
      
      h3 {
        margin-bottom: 20px;
        color: #303133;
      }
      
      .recommendations {
        .recommendation-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          
          .recommendation-icon {
            color: #67c23a;
            margin-right: 8px;
          }
          
          span {
            color: #606266;
          }
        }
      }
    }
    
    .factors-section {
      h3 {
        margin-bottom: 20px;
        color: #303133;
      }
      
      .factors-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        
        .factor-item {
          .factor-name {
            font-size: 14px;
            color: #303133;
            margin-bottom: 8px;
          }
          
          .factor-impact {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .impact-text {
              font-size: 12px;
              color: #909399;
              min-width: 40px;
            }
          }
        }
      }
    }
  }
  </style>


