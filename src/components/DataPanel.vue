<template>
  <div class="data-panel">
    <div v-if="title" class="panel-header">
      <span class="title-text">{{ title }}</span>
      <button v-if="showClose" class="close-btn" @click="emit('close')">&times;</button>
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
    default: ''
  },
  showClose: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);
</script>

<style lang="scss" scoped>
@use '@/styles/theme.scss' as theme;

.data-panel {
  position: relative;
  /* width: 400px; Constrain the panel width */
  flex-shrink: 0; /* Prevent the panel from shrinking in a flex container */
  min-height: 306px; /* Apply height constraint to the direct flex item */
  
  /* Make the panel a flex container to manage its children */
  display: flex;
  flex-direction: column;

  /* New styles for glowing effect */
  border-radius: 8px;
  border: 1px solid rgba(0, 170, 255, 0.5);
  box-shadow: 0 0 12px rgba(0, 170, 255, 0.3);
  background-color: theme.$panel-bg-color; /* Unified background */
}

.panel-header {
  position: relative;
  height: 80px !important; /* 强制标题区域高度 */
  min-height: 80px !important; /* 确保最小高度 */
  flex-shrink: 0 !important; /* 防止被压缩 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 12px;
  padding-right: 12px;

  /* Decorative background */
  &::before {
    content: '';
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 320px; 
    height: 100%;
    background-image: url('@/assets/images/模块基础.svg');
    background-repeat: no-repeat;
    background-size: contain;
    background-position: left center;
  }
}

.title-text {
  color: theme.$title-color;
  font-size: 16px; /* 恢复正常字体大小 */
  font-weight: bold;
  padding-left: 30px;
  position: relative;
  z-index: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

.close-btn {
  position: relative;
  z-index: 1;
  margin-right: 15px;
  background: transparent;
  border: none;
  color: #a0a6b8;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
  padding: 0 5px;
  transition: color 0.2s;

  &:hover {
    color: #fff;
  }
}

.panel-content {
  padding: 20px;
  flex-grow: 1;
}
</style> 