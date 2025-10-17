<!-- UNUSED: 未被任何视图/路由使用 -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="创建新种植计划向导"
    width="70%"
    top="10vh"
    :close-on-click-modal="false"
    @closed="$emit('closed')"
  >
    <el-steps :active="activeStep" finish-status="success" simple>
      <el-step title="选择地块与目标" />
      <el-step title="获取AI建议" />
      <el-step title="确认与生成" />
    </el-steps>

    <div class="wizard-content">
      <!-- Step 1: Select Plots and Goal -->
      <div v-if="activeStep === 0" class="step-content">
        <div class="left-panel">
          <h3>1. 选择地块</h3>
          <el-tabs v-model="activeTab" class="plot-selection-tabs">
            <el-tab-pane label="地图选择" name="map">
              <div class="map-container">
                <PlotsMap
                  :plots="allPlots"
                  :selected-plot-id="selectedPlotId"
                  @plot-clicked="handlePlotClicked"
                />
              </div>
            </el-tab-pane>
            <el-tab-pane label="列表选择" name="table">
          <el-table
            :data="allPlots"
            ref="plotsTableRef"
            @selection-change="handleSelectionChange"
                height="300px"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="地块ID" />
            <el-table-column prop="properties.crop" label="当前作物" />
            <el-table-column prop="properties.area" label="面积 (亩)" />
          </el-table>
            </el-tab-pane>
          </el-tabs>
          <div class="selected-plots-summary" v-if="selectedPlots.length > 0">
            <h4>已选地块 ({{ selectedPlots.length }}个):</h4>
            <el-tag 
              v-for="plot in selectedPlots" 
              :key="plot.id" 
              closable
              @close="removePlot(plot)"
              class="plot-tag"
            >
                {{ plot.id }}
              </el-tag>
            </div>
        </div>
        <div class="right-panel">
          <h3>2. 设定种植目标</h3>
           <el-form label-position="top">
            <el-form-item label="选择主要优化目标">
              <el-select v-model="planningGoal" placeholder="请选择目标">
                <el-option label="利润最大化" value="profit" />
                <el-option label="产量最高" value="yield" />
                <el-option label="最省水" value="water_saving" />
                <el-option label="碳排放最低" value="carbon_neutral" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>
       <!-- Step 2: AI Recommendations -->
       <div v-if="activeStep === 1" class="step-content vertical" v-loading="isFetchingRecommendations">
          <h3>AI为你生成了以下 {{ recommendations.length }} 个种植方案</h3>
          <p class="step-subtitle">综合考虑了您选择的地块历史、土壤数据、天气预测和市场行情。</p>
          <div class="recommendations-grid">
            <RecommendationCard
              v-for="(rec, index) in recommendations"
              :key="index"
              :recommendation="rec"
              :selected="selectedRecommendation === rec"
              @select="selectedRecommendation = rec"
            />
          </div>
       </div>
       <!-- Step 3: Confirm and Generate -->
       <div v-if="activeStep === 2" class="step-content vertical">
          <h3>3. 确认并生成计划</h3>
          <p class="step-subtitle">请检查以下信息，为新计划命名后即可生成。</p>
          <div class="summary-grid">
            <div class="summary-item">
              <h4>已选地块</h4>
              <el-tag v-for="plot in selectedPlots" :key="plot.id" class="summary-tag">
                {{ plot.id }}
              </el-tag>
            </div>
            <div class="summary-item">
              <h4>优化目标</h4>
              <el-tag type="success" class="summary-tag">{{ goalText }}</el-tag>
            </div>
            <div class="summary-item full-width">
              <h4>已选AI方案</h4>
              <RecommendationCard v-if="selectedRecommendation" :recommendation="selectedRecommendation" :selected="true" />
            </div>
          </div>
          <el-form class="final-form" label-position="top">
            <el-form-item label="为该计划命名">
              <el-input v-model="planName" placeholder="例如：2025年北区春季玉米增产计划"></el-input>
            </el-form-item>
          </el-form>
       </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handlePrev" :disabled="activeStep === 0">上一步</el-button>
        <el-button type="primary" @click="handleNext">
          {{ activeStep === 2 ? '完成' : '下一步' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { usePlots } from '@/composables/farm/usePlots.js';
import RecommendationCard from './RecommendationCard.vue';
import PlotsMap from './PlotsMap.vue';
import { AIRecommendationService } from '@/services/aiRecommendationService.js';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:visible', 'closed', 'plan-created']);

const { allPlots, fetchPlots } = usePlots();
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});
const activeStep = ref(0);
const activeTab = ref('map');
const selectedPlots = ref([]);
const selectedPlotId = ref(null);
const planningGoal = ref('profit');
const recommendations = ref([]);
const selectedRecommendation = ref(null);
const isFetchingRecommendations = ref(false);
const planName = ref('');

const goalOptions = {
  profit: '利润最大化',
  yield: '产量最高',
  water_saving: '最省水',
  carbon_neutral: '碳排放最低'
};

const goalText = computed(() => goalOptions[planningGoal.value]);


onMounted(() => {
  fetchPlots();
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    activeStep.value = 0; // Reset step when dialog opens
    selectedPlots.value = [];
    recommendations.value = [];
    selectedRecommendation.value = null;
    planName.value = '';
  }
});

watch(selectedRecommendation, (newVal) => {
  if (newVal) {
    planName.value = `基于"${newVal.title}"的种植计划`;
  }
});

const handleSelectionChange = (val) => {
  selectedPlots.value = val;
};

const handlePlotClicked = (plotId) => {
  const plot = allPlots.value.find(p => p.id === plotId);
  if (!plot) return;
  
  const existingIndex = selectedPlots.value.findIndex(p => p.id === plotId);
  if (existingIndex >= 0) {
    // 如果已选中，则取消选择
    selectedPlots.value.splice(existingIndex, 1);
  } else {
    // 如果未选中，则添加到选择列表
    selectedPlots.value.push(plot);
  }
  selectedPlotId.value = plotId;
};

const removePlot = (plot) => {
  const index = selectedPlots.value.findIndex(p => p.id === plot.id);
  if (index >= 0) {
    selectedPlots.value.splice(index, 1);
  }
};

const fetchRecommendations = async () => {
  isFetchingRecommendations.value = true;
  
  try {
    console.log('Fetching AI recommendations for:', {
      plots: selectedPlots.value.map(p => p.id),
      goal: planningGoal.value
    });
    
    // 并行获取各种数据
    const [recommendationsResult, plotHistory, marketData, weatherData] = await Promise.all([
      AIRecommendationService.getPlantingRecommendations(
        selectedPlots.value.map(p => p.id), 
        planningGoal.value
      ),
      AIRecommendationService.getPlotHistory(selectedPlots.value.map(p => p.id)),
      AIRecommendationService.getMarketData(),
      AIRecommendationService.getWeatherForecast()
    ]);
    
    if (recommendationsResult.success) {
      recommendations.value = recommendationsResult.data;
      console.log('AI recommendations received:', recommendationsResult.data);
    } else {
      throw new Error(recommendationsResult.message || '获取AI推荐失败');
    }
    
  } catch (error) {
    console.error('Failed to fetch AI recommendations:', error);
    // 降级到模拟数据
    recommendations.value = AIRecommendationService.generateRecommendationsByGoal(
      planningGoal.value, 
      selectedPlots.value.length
    );
  } finally {
    isFetchingRecommendations.value = false;
  }
};

const handleNext = () => {
  if (activeStep.value === 0) {
    if (selectedPlots.value.length === 0) {
      alert('请至少选择一个地块'); // Replace with ElMessage
      return;
    }
    fetchRecommendations();
    activeStep.value++;
    return;
  }
  if (activeStep.value === 1) {
    if (!selectedRecommendation.value) {
      alert('请选择一个推荐方案'); // Replace with ElMessage
      return;
    }
    activeStep.value++;
    return;
  }

  if (activeStep.value === 2) {
    if (!planName.value) {
      alert('请为计划命名'); // Replace with ElMessage
      return;
    }
    // Finish logic - 创建种植计划
    const planData = {
      name: planName.value,
      plots: selectedPlots.value.map(p => p.id),
      goal: planningGoal.value,
      details: selectedRecommendation.value,
      crop: selectedRecommendation.value?.title?.split(':')[1]?.trim() || '未知作物',
      plotCount: selectedPlots.value.length,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6个月后
      status: '草稿',
      estimatedCost: selectedRecommendation.value?.estimatedCost || 0,
      estimatedRevenue: selectedRecommendation.value?.estimatedProfit || 0,
      profit: selectedRecommendation.value?.estimatedProfit || 0,
      riskLevel: selectedRecommendation.value?.risk?.level || 'medium',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: '当前用户'
    };
    
    emit('plan-created', planData);
    dialogVisible.value = false;
  }
};

const handlePrev = () => {
  if (activeStep.value > 0) {
    activeStep.value--;
  }
};
</script>

<style scoped lang="scss">
.el-steps {
  margin-bottom: 20px;
}
.wizard-content {
  min-height: 50vh;
  padding: 20px;
  border: 1px dashed #ccc;
  border-radius: 4px;
}

.step-content {
  display: flex;
  gap: 20px;
  height: 100%;
}

.step-content.vertical {
  flex-direction: column;
}

.step-subtitle {
  color: #a0a6b8;
  margin-top: -5px;
  margin-bottom: 15px;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
  overflow-y: auto;
  max-height: 40vh;
  padding: 5px;
}

.left-panel {
  width: 60%;
  height: 50vh;
  display: flex;
  flex-direction: column;
}

.right-panel {
  width: 40%;
}

.plot-selection-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  
  :deep(.el-tabs__content) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  :deep(.el-tab-pane) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

.map-container {
  flex: 1;
  min-height: 300px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.selected-plots-summary {
  margin-top: 15px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  
  h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #606266;
  }
  
  .plot-tag {
    margin-right: 8px;
    margin-bottom: 8px;
  }
}

.el-select {
  width: 100%;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.summary-item {
  h4 {
    margin-top: 0;
    margin-bottom: 8px;
  }
  &.full-width {
    grid-column: span 2;
  }
}

.summary-tag {
  margin-right: 5px;
}

.final-form {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #444;
}
</style>
