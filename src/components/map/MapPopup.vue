<template>
  <div class="map-popup-container">
    <div class="popup-header">
      <slot name="title">
        <span class="default-title">{{ title }}</span>
      </slot>
      <button class="close-button" @click="$emit('close')">&times;</button>
    </div>
    <div class="popup-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '详情'
  }
});
defineEmits(['close']);
</script>

<style scoped lang="scss">
@use '@/styles/theme.scss' as theme;

.map-popup-container {
  width: 280px;
  background-color: rgba(21, 38, 62, 0.9);
  border: 1px solid theme.$border-color;
  color: theme.$text-color;
  box-shadow: 0 0 15px rgba(0, 170, 255, 0.2);
  border-radius: 4px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(0, 170, 255, 0.1);
  border-bottom: 1px solid theme.$border-color;

  .default-title {
    font-weight: bold;
    color: theme.$title-color;
    font-size: 16px;
  }
}

.close-button {
  background: none;
  border: none;
  color: theme.$text-color;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

.popup-content {
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;

  :deep(ul), :deep(li) {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  :deep(li) {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    border-bottom: 1px solid rgba(0, 170, 255, 0.1);

    &:last-child {
      border-bottom: none;
    }

    .label {
      color: theme.$text-color-secondary;
    }
    .value {
      color: theme.$title-color;
      font-weight: bold;
    }
  }
}
</style>
<style>
/* MapLibre popup style overrides */
.maplibregl-popup-content {
  padding: 0;
  background: transparent;
  box-shadow: none;
}
.maplibregl-popup-tip {
  border-top-color: rgba(21, 38, 62, 0.9) !important;
}
.maplibregl-popup-anchor-top .maplibregl-popup-tip {
  border-bottom-color: rgba(21, 38, 62, 0.9) !important;
}
.maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
  border-top-color: rgba(21, 38, 62, 0.9) !important;
}
.maplibregl-popup-anchor-left .maplibregl-popup-tip {
  border-right-color: rgba(21, 38, 62, 0.9) !important;
}
.maplibregl-popup-anchor-right .maplibregl-popup-tip {
  border-left-color: rgba(21, 38, 62, 0.9) !important;
}
</style>
