<template>
  <div class="data-panel">
    <div class="panel-title">{{ title }}</div>
    <div class="panel-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  }
});
</script>

<style lang="scss" scoped>
@use '@/styles/theme.scss' as theme;

.data-panel {
  background-color: theme.$panel-bg-color;
  border: 1px solid theme.$border-color;
  border-radius: 4px;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  &::before, &::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    border-style: solid;
    border-color: theme.$primary-accent-color;
  }

  &::before {
    top: -2px;
    left: -2px;
    border-width: 2px 0 0 2px;
  }

  &::after {
    bottom: -2px;
    right: -2px;
    border-width: 0 2px 2px 0;
  }
}

.panel-title {
  color: theme.$title-color;
  font-size: theme.$title-font-size;
  font-weight: bold;
  padding: 10px;
  border-bottom: 1px solid theme.$border-color;
}

.panel-content {
  padding: 10px;
  flex-grow: 1;
  overflow: hidden;
}
</style> 