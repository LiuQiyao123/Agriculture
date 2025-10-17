<template>
  <DataPanel :title="title">
    <div class="ai-panel-content">
      <div v-if="content.metrics && content.metrics.length" class="metrics-grid">
        <div v-for="(metric, index) in content.metrics" :key="index" class="model-metric">
          <span>{{ metric.label }}:</span>
          <span class="value" :class="metric.class">{{ metric.value }}</span>
        </div>
      </div>
      
      <div v-if="content.sections && content.sections.length" class="content-sections">
        <div v-for="(section, index) in content.sections" :key="index" class="content-section">
          <h4>{{ section.title }}</h4>
          <p v-if="section.paragraph">{{ section.paragraph }}</p>
          <ul v-if="section.list && section.list.length">
            <li v-for="(item, itemIndex) in section.list" :key="itemIndex">{{ item }}</li>
          </ul>
        </div>
      </div>
    </div>
    <AnalysisExplanation v-if="explanation" :explanation="explanation" />
  </DataPanel>
</template>

<script setup>
import DataPanel from '@/components/DataPanel.vue';
import AnalysisExplanation from '@/components/AnalysisExplanation.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: Object,
    required: true,
    default: () => ({
      metrics: [],
      sections: [],
    }),
  },
  explanation: {
    type: String,
    default: ''
  }
});
</script>

<style scoped lang="scss">
.ai-panel-content {
  padding: 15px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 15px;
  margin-bottom: 10px;
}

.model-metric {
  color: $text-color-secondary;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .value {
    font-weight: bold;
    font-size: 16px;
    color: $title-color;
    &.success {
      color: #67c23a;
    }
     &.danger {
      color: #f56c6c;
    }
  }
}

.content-sections {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.content-section {
  h4 {
    color: $title-color;
    font-size: 15px;
    margin: 0 0 8px 0;
    border-left: 3px solid $primary-accent-color;
    padding-left: 8px;
  }

  p, ul {
    color: $text-color-secondary;
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
  }
  
  ul {
    padding-left: 20px;
  }
}
</style>
