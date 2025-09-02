<template>
  <div class="metric-card">
    <div class="icon-container" v-if="icon">
      <div class="icon-circle" :class="`icon-theme-${iconTheme}`">
        <el-icon :size="20" class="metric-icon">
          <component :is="icon" />
        </el-icon>
      </div>
    </div>
    <div class="text-container">
      <div class="value">{{ value }}</div>
      <div v-if="details" class="details" v-html="details"></div>
      <div class="title">{{ title }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  details: String,
  icon: Object,
  iconTheme: {
    type: String,
    default: 'blue'
  }
});
</script>

<style lang="scss" scoped>
@use '@/styles/theme.scss' as theme;

.metric-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;

  // Glowing effect
  box-shadow: 0 0 12px var(--icon-color-1), inset 0 0 8px var(--icon-color-2);

  // Decorative ring
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid var(--icon-color-1);
    opacity: 0.5;
  }
  
  // Top-left dot
  &::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #ffcc00;
    box-shadow: 0 0 6px #ffcc00;
  }
}

.metric-icon {
  color: #ffffff;
}

.text-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 4px; /* 行距更舒适 */
}

.value {
  font-size: 24px; /* 指标数字稍微小一些 */
  font-weight: bold;
  color: #ffffff;
  line-height: 1.2;
}

.details {
  font-size: 12px;
  color: theme.$text-color-secondary;
  
  :deep(span) {
    font-weight: 500;
  }
}

.title {
  color: theme.$text-color;
  font-size: 12px;
}

// Color Themes
.icon-theme-blue {
  --icon-color-1: #00aaff;
  --icon-color-2: #40c4ff;
  background: radial-gradient(circle, rgba(0, 170, 255, 0.4) 0%, rgba(0, 170, 255, 0.1) 70%);
}

.icon-theme-green {
  --icon-color-1: #52c41a;
  --icon-color-2: #73d13d;
  background: radial-gradient(circle, rgba(82, 196, 26, 0.4) 0%, rgba(82, 196, 26, 0.1) 70%);
}

.icon-theme-purple {
  --icon-color-1: #722ed1;
  --icon-color-2: #9254de;
  background: radial-gradient(circle, rgba(114, 46, 209, 0.4) 0%, rgba(114, 46, 209, 0.1) 70%);
}

.icon-theme-cyan {
  --icon-color-1: #13c2c2;
  --icon-color-2: #36cfc9;
  background: radial-gradient(circle, rgba(19, 194, 194, 0.4) 0%, rgba(19, 194, 194, 0.1) 70%);
}
</style> 