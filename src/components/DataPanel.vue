<template>
  <div class="data-panel">
    <div class="panel-header">
      <h3 class="panel-title">{{ title }}</h3>
      <div class="panel-header-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    <div class="panel-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  }
});
</script>

<style scoped lang="scss">
@use '@/styles/theme.scss' as theme;

.data-panel {
  background-color: theme.$panel-bg-color;
  border: 1px solid theme.$border-color;
  border-radius: 8px;
  box-shadow: 0 0 12px rgba(0, 170, 255, 0.3);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 48px;
  border-bottom: 1px solid theme.$border-color;
  flex-shrink: 0;
  position: relative;

   &::before {
    content: '';
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 300px; 
    height: 100%;
    background-image: url('@/assets/images/模块基础.svg');
    background-repeat: no-repeat;
    background-size: 100% auto;
    background-position: left center;
    opacity: 0.5;
  }
}

.panel-title {
  color: theme.$title-color;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  position: relative;
  padding-left: 12px;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    background-color: theme.$primary-accent-color;
    border-radius: 2px;
  }
}

.panel-content {
  padding: 20px;
  flex-grow: 1;
  min-height: 200px; 
  overflow: auto;
  position: relative;
}

.panel-content:empty::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: theme.$panel-bg-color;
  z-index: 1;
}
</style> 