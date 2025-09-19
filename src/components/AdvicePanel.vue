<template>
  <div class="advice-panel" v-if="content">
    <!-- 1. Overview Section -->
    <div class="section overview-section">
      <div class="section-header">
        <el-icon><Document /></el-icon>
        <h3 class="section-title">作业任务概览</h3>
        <el-tag :type="priorityType" size="small">{{ content.overview.priority }} 优先级</el-tag>
      </div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="地块编号">{{ content.overview.plotId }}</el-descriptions-item>
        <el-descriptions-item label="目标作物">{{ content.overview.targetCrop }}</el-descriptions-item>
        <el-descriptions-item label="核心任务">{{ content.overview.coreTask }}</el-descriptions-item>
        <el-descriptions-item label="建议执行窗口">{{ content.overview.executionWindow }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 2. Task Checklist Section -->
    <div class="section checklist-section">
       <div class="section-header">
        <el-icon><List /></el-icon>
        <h3 class="section-title">任务清单</h3>
      </div>
      <div v-if="content.irrigationTask || content.fertilizationTask" class="task-cards">
        <el-card shadow="hover" class="task-card" v-if="content.irrigationTask">
          <template #header>
            <div class="card-header">
              <span>精准灌溉</span>
              <el-tag type="primary" effect="light">1 轮</el-tag>
            </div>
          </template>
          <ul>
            <li><strong>建议时间:</strong> {{ content.irrigationTask.suggestedTime }}</li>
            <li><strong>灌溉方式:</strong> {{ content.irrigationTask.method }}</li>
            <li><strong>目标水量:</strong> {{ content.irrigationTask.targetVolume }} m³</li>
            <li><strong>目标土壤湿度:</strong> {{ content.irrigationTask.targetMoisture }}</li>
          </ul>
        </el-card>
        <el-card shadow="hover" class="task-card" v-if="content.fertilizationTask">
          <template #header>
            <div class="card-header">
              <span>营养补充</span>
               <el-tag type="success" effect="light">{{ content.fertilizationTask.formula }}</el-tag>
            </div>
          </template>
           <ul>
            <li><strong>施肥方式:</strong> {{ content.fertilizationTask.method }}</li>
            <li><strong>氮 (N):</strong> {{ content.fertilizationTask.N }} kg</li>
            <li><strong>磷 (P):</strong> {{ content.fertilizationTask.P }} kg</li>
            <li><strong>钾 (K):</strong> {{ content.fertilizationTask.K }} kg</li>
          </ul>
        </el-card>
      </div>
      <div v-else class="no-task">
        <el-icon><CircleCheckFilled /></el-icon>
        <span>当前无需执行特定农事任务，请继续监测。</span>
      </div>
    </div>

    <!-- 3. Decision Basis Section -->
     <div class="section basis-section">
      <div class="section-header">
        <el-icon><Opportunity /></el-icon>
        <h3 class="section-title">AI 决策依据</h3>
      </div>
      <div class="basis-list">
        <p v-for="(basis, index) in content.decisionBasis" :key="index" class="basis-item">
          {{ basis }}
        </p>
      </div>
    </div>

    <!-- 4. Cost Benefit Section -->
    <div class="section cost-benefit-section">
      <div class="section-header">
        <el-icon><TrendCharts /></el-icon>
        <h3 class="section-title">成本效益评估</h3>
      </div>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="cost-card">
            <div class="cost-title">投入成本估算</div>
            <div class="cost-value">¥ {{ content.costBenefit.estimatedCost }}</div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="benefit-card">
            <div class="benefit-title">预期收益分析</div>
            <div class="benefit-text">{{ content.costBenefit.expectedBenefits }}</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Document, List, Opportunity, TrendCharts, CircleCheckFilled } from '@element-plus/icons-vue';

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
});

const priorityType = computed(() => {
  switch (props.content?.overview?.priority) {
    case '高': return 'danger';
    case '中': return 'warning';
    case '低': return 'info';
    default: return 'primary';
  }
});
</script>

<style scoped lang="scss">
.advice-panel {
  padding: 16px;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  font-size: 14px;
}

.section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  .el-icon {
    margin-right: 8px;
    font-size: 18px;
    color: var(--el-color-primary);
  }
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-heading);
    margin: 0;
    flex-grow: 1;
  }
}

.overview-section {
  :deep(.el-descriptions__label) {
    font-weight: bold;
  }
}

.task-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.no-task {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: var(--color-background-mute);
  border-radius: 6px;
  color: var(--color-text-soft);
  .el-icon {
    margin-right: 8px;
    color: var(--el-color-success);
    font-size: 18px;
  }
}

.task-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  li {
    line-height: 1.8;
    color: var(--color-text-soft);
    strong {
      color: var(--color-text);
    }
  }
}

.basis-list {
  .basis-item {
    line-height: 1.7;
    padding: 8px;
    background-color: var(--color-background-mute);
    border-radius: 4px;
    margin: 0 0 8px 0;
    border-left: 3px solid var(--el-color-primary-light-3);
  }
}

.cost-card, .benefit-card {
  padding: 16px;
  border-radius: 6px;
  height: 100%;
}

.cost-card {
  background-color: rgba(245, 108, 108, 0.1);
  border: 1px solid rgba(245, 108, 108, 0.3);
  text-align: center;
  .cost-title {
    font-weight: 600;
    margin-bottom: 8px;
    color: #F56C6C;
  }
  .cost-value {
    font-size: 24px;
    font-weight: bold;
    color: #F56C6C;
  }
}

.benefit-card {
  background-color: rgba(103, 194, 58, 0.1);
  border: 1px solid rgba(103, 194, 58, 0.3);
  .benefit-title {
    font-weight: 600;
    margin-bottom: 8px;
    color: #67C23A;
  }
  .benefit-text {
    line-height: 1.6;
    color: #67C23A;
  }
}
</style>
