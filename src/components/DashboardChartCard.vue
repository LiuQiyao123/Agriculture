<template>
  <div class="dashboard-chart-card">
    <div class="card-header">
      <h3 class="card-title">{{ title }}</h3>
      <div class="card-actions">
        <!-- Action icons like settings, fullscreen, etc. can go here -->
        <el-icon><Setting /></el-icon>
      </div>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { Setting } from '@element-plus/icons-vue';

defineProps({
  title: {
    type: String,
    required: true,
    default: '图表标题'
  }
});
</script>

<style scoped>
.dashboard-chart-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  color: #303133;
  transition: .3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #ebeef5;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.card-actions {
  cursor: pointer;
}

.card-body {
  padding: 15px;
  flex: 1;
  min-height: 200px; /* Ensure a minimum height for the chart */
}
</style>
