<template>
  <div class="diagnosis-panel" v-if="content">
    <div class="kpi-grid">
      <div class="kpi-card" v-for="(kpi, key) in content.kpis" :key="key">
        <div class="kpi-name">{{ getKpiName(key) }}</div>
        <div class="kpi-value">{{ kpi.value.toFixed(2) }}</div>
        <div class="kpi-status" :class="getStatusClass(kpi.status)">{{ kpi.status }}</div>
        <div class="kpi-trend">
          <span :style="{ color: kpi.trend >= 0 ? '#67C23A' : '#F56C6C' }">
            {{ kpi.trend > 0 ? '+' : '' }}{{ kpi.trend.toFixed(2) }} (vs. last cycle)
          </span>
        </div>
        <div class="kpi-gauge">
          <div class="gauge-bar" :style="{ width: `${(kpi.value / kpi.optimal) * 100}%`, backgroundColor: getStatusColor(kpi.status) }"></div>
        </div>
      </div>
    </div>
    <div class="summary-section">
      <div class="section-title">AI 综合诊断摘要</div>
      <p class="summary-text">{{ content.summary }}</p>
    </div>
    <div class="risk-section">
      <div class="section-title">潜在风险评估</div>
      <ul v-if="content.risks.length > 0" class="risk-list">
        <li v-for="(risk, index) in content.risks" :key="index" class="risk-item">
          <el-icon><WarningFilled /></el-icon> {{ risk }}
        </li>
      </ul>
      <p v-else class="no-risk">暂未发现显著风险。</p>
    </div>
  </div>
</template>

<script setup>
import { WarningFilled } from '@element-plus/icons-vue';

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
});

const kpiNameMapping = {
  ndvi: '植被指数 (NDVI)',
  lai: '叶面积指数 (LAI)',
  spad: '叶绿素含量 (SPAD)',
};

const getKpiName = (key) => kpiNameMapping[key] || key.toUpperCase();

const statusClasses = {
  '优秀': 'status-excellent',
  '良好': 'status-good',
  '正常': 'status-normal',
  '偏低': 'status-low',
};

const statusColors = {
  '优秀': '#13ce66',
  '良好': '#67C23A',
  '正常': '#409EFF',
  '偏低': '#F56C6C',
};

const getStatusClass = (status) => statusClasses[status] || 'status-normal';
const getStatusColor = (status) => statusColors[status] || '#409EFF';
</script>

<style scoped lang="scss">
.diagnosis-panel {
  padding: 16px;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 14px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.kpi-card {
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  text-align: center;
  background-color: var(--color-background-mute);
}

.kpi-name {
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-primary);
  line-height: 1.2;
}

.kpi-status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  display: inline-block;
  margin: 4px 0;
  color: #fff;
  &.status-excellent { background-color: #13ce66; }
  &.status-good { background-color: #67C23A; }
  &.status-normal { background-color: #409EFF; }
  &.status-low { background-color: #F56C6C; }
}

.kpi-trend {
  font-size: 12px;
  color: var(--color-text-soft);
  margin-bottom: 8px;
}

.kpi-gauge {
  width: 100%;
  height: 8px;
  background-color: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
  .gauge-bar {
    height: 100%;
    transition: width 0.5s ease-in-out;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--color-heading);
  border-left: 4px solid var(--el-color-primary);
  padding-left: 8px;
}

.summary-text {
  line-height: 1.7;
  color: var(--color-text-soft);
}

.risk-list {
  list-style: none;
  padding-left: 0;
  .risk-item {
    padding: 8px;
    background-color: rgba(245, 108, 108, 0.1);
    border-left: 3px solid #F56C6C;
    margin-bottom: 8px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    .el-icon {
      margin-right: 8px;
      color: #F56C6C;
    }
  }
}

.no-risk {
  color: var(--color-text-soft);
}
</style>
