<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleClose"
    title="AI辅助制定种植计划"
    width="95%"
    top="2vh"
    :before-close="handleClose"
    class="ai-planning-dialog"
  >
    <div class="planning-container">
      <!-- 步骤指示器 -->
      <div class="steps-header">
        <el-steps :active="currentStep" finish-status="success" align-center>
          <el-step title="选择地块并分析" description="选择地块并与AI互动获取建议" />
          <el-step title="方案预览" description="直观展示种植方案" />
          <el-step title="确认计划" description="最终确认并保存" />
        </el-steps>
      </div>

      <!-- 步骤内容 -->
      <div class="step-content">
        <!-- 步骤1：选择地块 & AI分析 -->
        <div v-if="currentStep === 0" class="step-panel">
          <div class="field-selection-layout">
            <!-- 左侧：地块选择 -->
            <div class="field-selection-left">
              <el-tabs v-model="selectionMode" type="card" class="selection-tabs">
                <el-tab-pane label="列表模式" name="list">
                  <div class="field-list nice-scrollbar">
                    <div
                      v-for="field in availableFields"
                      :key="field.id"
                      class="field-item"
                      :class="{ active: isSelected(field) }"
                      @click="togglePlotSelection(field)"
                    >
                      <el-checkbox
                        :model-value="isSelected(field)"
                        @click.stop
                        @change="() => togglePlotSelection(field)"
                        size="large"
                      />
                      <div class="field-info">
                        <h4>{{ field.name }}</h4>
                        <p class="field-location">{{ field.location }}</p>
                        <div class="field-details">
                          <span class="area">面积：{{ field.area }}亩</span>
                          <span class="soil">土壤：{{ field.soilType }}</span>
                        </div>
                      </div>
                      <div class="field-status">
                        <el-tag :type="field.status === '可用' ? 'success' : 'warning'" size="small">
                          {{ field.status }}
                        </el-tag>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="地图模式" name="map">
                  <div class="field-map">
                    <div class="map-placeholder">
                      <div class="map-icon">🗺️</div>
                      <p>地图模式（待实现）</p>
                      <p>点击地图上的地块进行选择</p>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
              <div class="analysis-summary-card">
                已选择 <strong>{{ selectedPlots.length }}</strong> 块地，
                总面积 <strong>{{ totalArea.toFixed(2) }}</strong> 亩
              </div>
            </div>
            
            <!-- 右侧：AI顾问与分析 -->
            <div class="ai-interaction-panel">
              <div v-if="selectedPlots.length === 0" class="empty-state">
                 <el-empty description="请先在左侧选择地块以开始分析和规划" />
              </div>
              <div v-else class="analysis-and-chat-container">
                 <!-- 分析数据展示 -->
                 <div class="analysis-display">
                    <h4>已选地块综合分析</h4>
                    <div class="analysis-grid">
                       <div class="analysis-item">
                          <span class="label">平均墒情</span>
                          <span class="value">{{ aggregatedData.avgMoisture.toFixed(1) }}%</span>
                       </div>
                       <div class="analysis-item">
                          <span class="label">平均pH值</span>
                          <span class="value">{{ aggregatedData.avgPh.toFixed(1) }}</span>
                       </div>
                       <div class="analysis-item">
                          <span class="label">平均有机质</span>
                          <span class="value">{{ aggregatedData.avgOrganicMatter.toFixed(2) }}%</span>
                       </div>
                       <div class="analysis-item">
                          <span class="label">平均健康分</span>
                          <span class="value">{{ aggregatedData.avgHealthScore.toFixed(1) }}</span>
                       </div>
                    </div>
                 </div>

                <!-- AI顾问对话 -->
                <div class="ai-advisor-panel">
                  <div class="advisor-header">
                    <div class="advisor-avatar">🤖</div>
                    <div class="advisor-info">
                      <h4>AI种植顾问</h4>
                      <p>基于您的选择提供建议</p>
                    </div>
                  </div>
                  
                  <div class="advisor-messages nice-scrollbar">
                    <div 
                      v-for="(message, index) in advisorMessages" 
                      :key="index"
                      class="advisor-message"
                      :class="message.type"
                    >
                      <div class="message-avatar">
                        <span v-if="message.type === 'ai'">🤖</span>
                        <span v-else>👤</span>
                      </div>
                      <div class="message-content">
                        <div class="message-text" v-html="message.html || message.text"></div>
                        <div v-if="message.suggestions" class="message-suggestions">
                          <el-button 
                            v-for="suggestion in message.suggestions" 
                            :key="suggestion"
                            size="small"
                            @click="selectSuggestion(suggestion)"
                          >
                            {{ suggestion }}
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="advisor-input">
                    <el-input
                      v-model="userInput"
                      placeholder="有什么疑问或需求，随时告诉我..."
                      @keyup.enter="sendMessage"
                      :disabled="isAiThinking"
                    >
                      <template #append>
                        <el-button 
                          @click="sendMessage" 
                          :loading="isAiThinking"
                          :disabled="!userInput.trim()"
                        >
                          发送
                        </el-button>
                      </template>
                    </el-input>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤2：方案预览 (原步骤3) -->
        <div v-if="currentStep === 1" class="step-panel">
          <div class="panel-header">
            <h3>👁️ 种植方案预览</h3>
            <p>直观展示种植过程、风险分析、预期收益等关键信息</p>
          </div>
          
          <div class="preview-container">
            <!-- 种植过程时间线 -->
            <div class="timeline-section">
              <h4>📅 种植过程时间线</h4>
              <div class="timeline">
                <div 
                  v-for="(phase, index) in plantingTimeline" 
                  :key="index"
                  class="timeline-item"
                >
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <h5>{{ phase.name }}</h5>
                    <p>{{ phase.description }}</p>
                    <div class="timeline-meta">
                      <span class="date">{{ phase.date }}</span>
                      <span class="duration">{{ phase.duration }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 风险分析 -->
            <div class="risk-analysis">
              <h4>⚠️ 风险分析</h4>
              <div class="risk-cards">
                <div 
                  v-for="risk in riskAnalysis" 
                  :key="risk.type"
                  class="risk-card"
                  :class="risk.level"
                >
                  <div class="risk-header">
                    <span class="risk-icon">{{ risk.icon }}</span>
                    <span class="risk-type">{{ risk.type }}</span>
                    <span class="risk-level">{{ risk.level }}</span>
                  </div>
                  <p class="risk-description">{{ risk.description }}</p>
                  <div class="risk-mitigation">
                    <strong>应对措施：</strong>{{ risk.mitigation }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 收益预测 -->
            <div class="profit-prediction">
              <h4>💰 收益预测</h4>
              <div class="profit-cards">
                <div class="profit-card">
                  <div class="profit-header">
                    <span class="profit-icon">📈</span>
                    <span class="profit-title">预期产量</span>
                  </div>
                  <div class="profit-value">{{ profitPrediction.yield }}吨/亩</div>
                </div>
                <div class="profit-card">
                  <div class="profit-header">
                    <span class="profit-icon">💵</span>
                    <span class="profit-title">预期收入</span>
                  </div>
                  <div class="profit-value">¥{{ profitPrediction.income }}/亩</div>
                </div>
                <div class="profit-card">
                  <div class="profit-header">
                    <span class="profit-icon">💸</span>
                    <span class="profit-title">预期成本</span>
                  </div>
                  <div class="profit-value">¥{{ profitPrediction.cost }}/亩</div>
                </div>
                <div class="profit-card highlight">
                  <div class="profit-header">
                    <span class="profit-icon">🎯</span>
                    <span class="profit-title">净利润</span>
                  </div>
                  <div class="profit-value">¥{{ profitPrediction.netProfit }}/亩</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤3：确认计划 (原步骤4) -->
        <div v-if="currentStep === 2" class="step-panel">
          <div class="panel-header">
            <h3>✅ 确认种植计划</h3>
            <p>请确认最终方案，系统将保存并开始执行</p>
          </div>
          
          <div class="final-summary">
            <div class="summary-card">
              <h4>📋 计划摘要</h4>
              <div class="summary-content">
                <div class="summary-item">
                  <span class="label">地块数量：</span>
                  <span class="value">{{ selectedPlots.length }} 块</span>
                </div>
                <div class="summary-item">
                  <span class="label">总面积：</span>
                  <span class="value">{{ totalArea.toFixed(2) }} 亩</span>
                </div>
                <div class="summary-item">
                  <span class="label">种植作物：</span>
                  <span class="value">{{ finalPlan.crop }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">预期总产量：</span>
                  <span class="value">{{ (profitPrediction.yield * totalArea.value).toFixed(2) }} 吨</span>
                </div>
                <div class="summary-item">
                  <span class="label">预期总收益：</span>
                  <span class="value">¥{{ (profitPrediction.netProfit * totalArea.value).toFixed(2) }}</span>
                </div>
              </div>
            </div>
            
            <div class="confirmation-options">
              <el-checkbox v-model="confirmRisk">我已了解并接受相关风险</el-checkbox>
              <el-checkbox v-model="confirmCost">我已确认成本预算</el-checkbox>
              <el-checkbox v-model="confirmTimeline">我已确认时间安排</el-checkbox>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="dialog-actions">
        <el-button @click="handleClose">取消</el-button>
        <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
        <el-button 
          v-if="currentStep < 2" 
          type="primary" 
          @click="nextStep"
          :disabled="!canProceed"
        >
          下一步
        </el-button>
        <el-button 
          v-if="currentStep === 2" 
          type="success" 
          @click="confirmPlan"
          :disabled="!canConfirm"
        >
          确认并保存
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue';
import { usePlots } from '@/composables/farm/usePlots.js';
import { ElMessage } from 'element-plus';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'plan-created']);

const { allPlots, fetchPlots } = usePlots();

const currentStep = ref(0);
const userInput = ref('');
const isAiThinking = ref(false);
const selectionMode = ref('list');
const selectedPlots = ref([]);
const advisorMessagesContainer = ref(null);

const availableFields = computed(() => {
  return allPlots.value.map(plot => ({
    id: plot.id,
    name: plot.properties.name || `地块-${plot.id}`,
    location: plot.properties.address || '未知位置',
    area: plot.properties.area || 0,
    soilType: plot.properties.soil_type || '未知',
    moisture: plot.properties.soil_moisture || 50, // 假设默认值
    ph: plot.properties.ph || 7.0, // 假设默认值
    organicMatter: plot.properties.organic_matter || 2.5, // 假设默认值
    healthScore: plot.properties.health_score || 80, // 假设默认值
    status: plot.properties.status || '可用',
    soilScore: plot.properties.soil_score || 85, // 假设默认值
    ndvi: plot.properties.ndvi || 0.7, // 假设默认值
    pestRisk: plot.properties.pest_risk || 10 // 假设默认值
  }));
});

const totalArea = computed(() => selectedPlots.value.reduce((sum, p) => sum + p.area, 0));

const aggregatedData = computed(() => {
  if (selectedPlots.value.length === 0) {
    return { avgMoisture: 0, avgPh: 0, avgOrganicMatter: 0, avgHealthScore: 0 };
  }
  const total = selectedPlots.value.length;
  const sum = selectedPlots.value.reduce((acc, plot) => {
    acc.moisture += plot.moisture;
    acc.ph += plot.ph;
    acc.organicMatter += plot.organicMatter;
    acc.healthScore += plot.healthScore;
    return acc;
  }, { moisture: 0, ph: 0, organicMatter: 0, healthScore: 0 });

  return {
    avgMoisture: sum.moisture / total,
    avgPh: sum.ph / total,
    avgOrganicMatter: sum.organicMatter / total,
    avgHealthScore: sum.healthScore / total
  };
});


const isSelected = (field) => {
  return selectedPlots.value.some(p => p.id === field.id);
};

const togglePlotSelection = (field) => {
  const index = selectedPlots.value.findIndex(p => p.id === field.id);
  if (index === -1) {
    selectedPlots.value.push(field);
  } else {
    selectedPlots.value.splice(index, 1);
  }
};


onMounted(() => {
  fetchPlots();
});

watch(selectedPlots, (newSelection) => {
  if (newSelection.length > 0) {
    const plotNames = newSelection.map(p => p.name).join('、');
    const introMessage = {
      id: Date.now(),
      type: 'ai',
      text: `您已选择 ${newSelection.length} 个地块: ${plotNames}。\n总面积为 ${totalArea.value.toFixed(2)} 亩。\n我们可以开始分析了。您想了解什么？`,
      suggestions: ['推荐种植作物', '分析市场前景', '评估风险收益']
    };
    // 替换欢迎语
    advisorMessages.value = [introMessage];
  } else {
    // 恢复初始欢迎语
    advisorMessages.value = [initialAdvisorMessage];
  }
}, { deep: true });

// 模拟数据
const weatherData = reactive({
  avgTemp: 15.2,
  precipitation: 650,
  frostFreeDays: 200
});

const historyData = reactive({
  avgYield: 2.8,
  bestCrop: '玉米',
  pestRisk: 15
});

const initialAdvisorMessage = {
  id: 1,
  type: 'ai',
  text: '您好！我是AI种植顾问。请先从左侧列表或地图中选择一个或多个地块，我将为您提供专业的种植建议。',
  suggestions: []
};

const advisorMessages = ref([initialAdvisorMessage]);

// 种植时间线
const plantingTimeline = ref([
  {
    name: '整地准备',
    description: '深翻土壤，施基肥，平整土地',
    date: '2024-03-15',
    duration: '3天'
  },
  {
    name: '播种',
    description: '选择优质种子，按标准密度播种',
    date: '2024-04-01',
    duration: '2天'
  },
  {
    name: '苗期管理',
    description: '查苗补苗，中耕除草，防治病虫害',
    date: '2024-04-15',
    duration: '15天'
  },
  {
    name: '生长期管理',
    description: '追肥，灌溉，病虫害防治',
    date: '2024-05-01',
    duration: '60天'
  },
  {
    name: '收获',
    description: '适时收获，晾晒，储存',
    date: '2024-09-15',
    duration: '5天'
  }
]);
const riskAnalysis = ref([
  {
    type: '气候风险',
    level: 'medium',
    icon: '🌦️',
    description: '春季可能遇到倒春寒，影响出苗',
    mitigation: '选择抗寒品种，适时播种'
  },
  {
    type: '病虫害风险',
    level: 'low',
    icon: '🐛',
    description: '根据历史数据，病虫害发生率较低',
    mitigation: '定期监测，预防性用药'
  },
  {
    type: '市场风险',
    level: 'medium',
    icon: '📈',
    description: '价格波动可能影响收益',
    mitigation: '关注市场动态，考虑期货套保'
  }
]);
const profitPrediction = reactive({
  yield: 3.2,
  income: 2560,
  cost: 1200,
  netProfit: 1360
});
const finalPlan = reactive({
  crop: '玉米',
  area: 0,
  expectedYield: 0,
  expectedIncome: 0
});
const confirmRisk = ref(false);
const confirmCost = ref(false);
const confirmTimeline = ref(false);

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0:
      return selectedPlots.value.length > 0;
    case 1:
      return true;
    case 2:
      return true;
    default:
      return false;
  }
});

const canConfirm = computed(() => {
  return confirmRisk.value && confirmCost.value && confirmTimeline.value;
});

const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++;
  }
};
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    const container = advisorMessagesContainer.value;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
};

const sendMessage = async () => {
  if (!userInput.value.trim()) return;
  
  const userMessageText = userInput.value;
  advisorMessages.value.push({ id: Date.now(), type: 'user', text: userMessageText });
  userInput.value = '';
  scrollToBottom();

  isAiThinking.value = true;
  
  // 模拟AI回复
  setTimeout(() => {
    let aiResponse = '';
    let suggestions = [];
    
    if (userMessageText.includes('推荐种植作物')) {
      aiResponse = `基于所选地块的平均土壤健康分(${aggregatedData.value.avgHealthScore.toFixed(1)})和气候条件，我推荐种植 **玉米** 或 **大豆**。
      \n- **玉米**: 预期产量高，市场需求稳定。
      \n- **大豆**: 有利于改善土壤肥力，且有政策补贴。
      \n您想深入了解哪一个？`;
      suggestions = ['玉米的详细方案', '大豆的详细方案'];
    } else if (userMessageText.includes('玉米')) {
      aiResponse = `好的，选择玉米是个不错的决定。根据地块数据，预计亩产可达 **${profitPrediction.yield}吨**，市场价格稳定。这是为您生成的初步种植计划，请在下一步预览。`;
      suggestions = ['还有别的选择吗？', '这个方案的风险是什么？'];
      finalPlan.crop = '玉米';
    } else if (userMessageText.includes('大豆')) {
        aiResponse = `好的，选择大豆有助于土壤轮作和改良。预计亩产可达 **2.5吨**，且享受国家补贴。这是为您生成的初步种植计划，请在下一步预览。`;
        suggestions = ['还有别的选择吗？', '这个方案的风险是什么？'];
        finalPlan.crop = '大豆';
    } else if (userMessageText.includes('风险')) {
      aiResponse = `主要风险包括：
      \n- **气候风险**: 春季可能遇到的倒春寒会影响出苗。
      \n- **病虫害风险**: 根据历史数据，病虫害发生率约为 ${historyData.pestRisk}%。
      \n- **市场风险**: 价格波动可能影响最终收益。
      \n我们可以在下一步的方案中为您提供详细的应对策略。`;
      suggestions = ['如何应对气候风险？', '病虫害如何防治？'];
    } else {
      aiResponse = '我已经收到您的信息，正在分析。您还有其他关心的问题吗？也许可以问我 "推荐什么品种？" 或者 "预计成本是多少？"';
      suggestions = ['推荐什么品种？', '预计成本是多少？', '分析市场前景'];
    }
    
    advisorMessages.value.push({
      id: Date.now() + 1,
      type: 'ai',
      text: aiResponse,
      suggestions: suggestions
    });
    
    isAiThinking.value = false;
    scrollToBottom();
  }, 1000);
};

const selectSuggestion = (suggestion) => {
  userInput.value = suggestion;
  sendMessage();
};

const confirmPlan = () => {
  const planData = {
    id: Date.now(),
    plots: selectedPlots.value.map(p => ({ id: p.id, name: p.name, area: p.area })),
    crop: finalPlan.crop,
    totalArea: totalArea.value,
    expectedYield: (profitPrediction.yield * totalArea.value).toFixed(2),
    expectedIncome: (profitPrediction.netProfit * totalArea.value).toFixed(2),
    timeline: plantingTimeline.value,
    risks: riskAnalysis.value,
    createTime: new Date().toISOString()
  };
  
  emit('plan-created', planData);
  ElMessage.success('种植计划已成功创建！');
  handleClose();
};

const handleClose = () => {
  emit('update:visible', false);
  // 重置状态
  currentStep.value = 0;
  selectedPlots.value = [];
  userInput.value = '';
  advisorMessages.value = [initialAdvisorMessage];
  confirmRisk.value = false;
  confirmCost.value = false;
  confirmTimeline.value = false;
};

</script>

<style scoped lang="scss">
.ai-planning-dialog {
  .el-dialog__body {
    padding: 20px;
  }
}

.planning-container {
  display: flex;
  flex-direction: column;
  height: calc(95vh - 120px); // 减去dialog的header和footer的大概高度
}

.steps-header {
  margin-bottom: 20px;
  padding: 15px 20px;
  background: rgba(0, 170, 255, 0.05);
  border-radius: 8px;

  :deep(.el-step__title) {
    font-size: 14px;
  }
   :deep(.el-step__description) {
    font-size: 12px;
  }
}

.step-content {
  flex: 1;
  overflow: hidden;
  display: flex;
}

.step-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.field-selection-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 20px;
  height: 100%;
  overflow: hidden;
}

.field-selection-left {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(21, 38, 62, 0.4);
  border: 1px solid rgba(0, 170, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.selection-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  
  :deep(.el-tabs__header) {
    margin: 0;
  }
  :deep(.el-tabs__content) {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  }
}

.field-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-item {
  background: rgba(21, 38, 62, 0.6);
  border: 1px solid rgba(0, 170, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 15px;

  &:hover {
    border-color: rgba(0, 170, 255, 0.6);
    background: rgba(0, 170, 255, 0.1);
  }

  &.active {
    border-color: #00aaff;
    box-shadow: 0 0 10px rgba(0, 170, 255, 0.5);
  }

  .field-info {
    flex: 1;
    h4 {
      margin: 0 0 4px 0;
      color: #e0e0e0;
      font-size: 15px;
    }
    .field-location {
      margin: 0 0 6px 0;
      color: #a0a0a0;
      font-size: 12px;
    }
    .field-details {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #c0c0c0;
    }
  }

  .field-status {
    margin-left: auto;
  }
}

.field-map {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1a293a;
  border-radius: 4px;
}

.analysis-summary-card {
  padding: 10px 15px;
  background-color: rgba(0, 170, 255, 0.1);
  border-top: 1px solid rgba(0, 170, 255, 0.2);
  color: #e0e0e0;
  font-size: 14px;

  strong {
    color: #409EFF;
    font-weight: 600;
  }
}

.ai-interaction-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 8px;
  background: rgba(10, 25, 41, 0.5);
  border: 1px solid rgba(0, 170, 255, 0.2);

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    :deep(.el-empty__description p) {
      color: #a0a0a0;
    }
  }
}

.analysis-and-chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 15px;
}

.analysis-display {
  margin-bottom: 15px;
  h4 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 16px;
    color: #e0e0e0;
  }
  .analysis-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .analysis-item {
    background: rgba(21, 38, 62, 0.6);
    padding: 8px 12px;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    .label {
      color: #a0a0a0;
    }
    .value {
      color: #409EFF;
      font-weight: bold;
    }
  }
}

.ai-advisor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(0, 170, 255, 0.1);
  border-radius: 8px;
  
  .advisor-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: rgba(0, 170, 255, 0.1);

    .advisor-avatar {
      font-size: 24px;
    }
    .advisor-info {
      h4 {
        margin: 0;
        font-size: 15px;
      }
      p {
        margin: 0;
        font-size: 12px;
        color: #a0a0a0;
      }
    }
  }
  
  .advisor-messages {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    
    .advisor-message {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      
      .message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
      }
      
      .message-content {
        max-width: 80%;
      }

      .message-text {
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.6;
        white-space: pre-wrap;
      }

      .message-suggestions {
        margin-top: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      &.ai {
        .message-avatar { background: rgba(0, 170, 255, 0.2); }
        .message-text { background: rgba(0, 170, 255, 0.15); }
      }
      
      &.user {
        flex-direction: row-reverse;
        .message-avatar { background: rgba(0, 255, 127, 0.2); }
        .message-content {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .message-text {
          background: rgba(0, 255, 127, 0.15);
          color: #e0e0e0;
        }
      }
    }
  }
  
  .advisor-input {
    padding: 10px;
    border-top: 1px solid rgba(0, 170, 255, 0.2);
  }
}

.nice-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.nice-scrollbar::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.1);
  border-radius: 3px;
}

.nice-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 170, 255, 0.3);
  border-radius: 3px;
}

.nice-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 170, 255, 0.5);
}


/* 保持步骤2和3的样式，但需要检查变量名是否一致 */
.preview-container, .final-summary {
  padding: 15px;
  background: rgba(21, 38, 62, 0.4);
  border: 1px solid rgba(0, 170, 255, 0.2);
  border-radius: 8px;
  height: 100%;
  overflow-y: auto;
}

.panel-header {
  margin-bottom: 20px;
  text-align: center;
  h3 { margin: 0 0 8px 0; font-size: 22px; }
  p { margin: 0; color: #a0a0a0; }
}

.timeline-section, .risk-analysis, .profit-prediction {
  margin-bottom: 25px;
  h4 {
    margin: 0 0 15px 0;
    color: #e0e0e0;
    font-size: 16px;
    border-bottom: 1px solid rgba(0, 170, 255, 0.2);
    padding-bottom: 8px;
  }
}

.timeline-item {
  position: relative;
  padding-left: 25px;
  margin-bottom: 20px;
  .timeline-marker {
    position: absolute;
    left: 0;
    top: 5px;
    width: 12px;
    height: 12px;
    background: #00aaff;
    border-radius: 50%;
    border: 2px solid #1a2332;
  }
  .timeline-content {
    h5 { margin: 0 0 5px 0; color: #fff; }
    p { margin: 0 0 5px 0; color: #ccc; font-size: 14px; }
    .timeline-meta { font-size: 12px; color: #888; }
  }
}

.risk-cards, .profit-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
}

.risk-card, .profit-card {
  background: rgba(0, 170, 255, 0.05);
  border: 1px solid rgba(0, 170, 255, 0.15);
  border-radius: 8px;
  padding: 15px;
}
.profit-card.highlight {
  border-color: #00ff7f;
  background: rgba(0, 255, 127, 0.1);
}

.summary-card {
  background: rgba(0, 170, 255, 0.05);
  border: 1px solid rgba(0, 170, 255, 0.2);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  h4 { margin-top: 0; }
  .summary-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    &:last-child { border-bottom: none; }
    .label { color: #a0a0a0; }
    .value { color: #fff; font-weight: 500; }
  }
}

.confirmation-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  margin-top: auto;
}
</style>