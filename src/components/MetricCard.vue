<template>
  <div class="metric-card">
    <div class="title">{{ title }}</div>
    <div class="value-container">
      <span class="value">{{ value }}</span>
      <span class="unit">{{ unit }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  unit: String,
});
</script>

<style lang="scss" scoped>
@use '@/styles/theme.scss' as theme;

.metric-card {
  text-align: center;
  padding: 15px;
}
.title {
  color: theme.$text-color;
  font-size: 16px;
  margin-bottom: 10px;
}
.value-container {
  display: flex;
  justify-content: center;
  align-items: baseline;
}
.value {
  font-size: 32px;
  font-weight: bold;
  color: theme.$primary-accent-color;
  margin-right: 5px;
}
.unit {
  font-size: 16px;
  color: theme.$text-color;
}
</style> 