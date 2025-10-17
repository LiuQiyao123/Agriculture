<template>
  <div class="tab-container">
    <!-- Tab导航 -->
    <div class="tab-navigation">
      <el-tabs 
        :model-value="activeTab" 
        @update:model-value="handleTabChange" 
        class="tab-tabs"
        :type="type"
        :size="size"
      >
        <el-tab-pane 
          v-for="tab in tabs" 
          :key="tab.value"
          :name="tab.value"
        >
          <template #label>
            <span class="tab-label">
              <el-icon v-if="showIcon && tab.icon">
                <component :is="tab.icon" />
              </el-icon>
              {{ tab.label }}
              <el-badge 
                v-if="tab.badge && tab.badge > 0" 
                :value="tab.badge" 
                class="tab-badge"
              />
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Tab内容 -->
    <div class="tab-content">
      <slot :active-tab="activeTab" :tab-data="currentTabData" />
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';

// Props定义
const props = defineProps({
  // 当前激活的tab
  activeTab: {
    type: String,
    required: true
  },
  // tab配置数组
  tabs: {
    type: Array,
    required: true,
    validator: (tabs) => {
      return tabs.every(tab => 
        tab.value && 
        tab.label
      );
    }
  },
  // 是否显示图标
  showIcon: {
    type: Boolean,
    default: true
  },
  // 标签页大小
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['large', 'default', 'small'].includes(value)
  },
  // 标签页类型
  type: {
    type: String,
    default: 'card',
    validator: (value) => ['card', 'border-card', 'line'].includes(value)
  },
  // 是否显示导航栏
  showNavigation: {
    type: Boolean,
    default: true
  }
});

// 事件定义
const emit = defineEmits(['tab-change']);

// 计算当前tab的数据
const currentTabData = computed(() => {
  return props.tabs.find(tab => tab.value === props.activeTab);
});

// 处理tab切换
const handleTabChange = (tabValue) => {
  emit('tab-change', tabValue);
};
</script>

<style scoped lang="scss">
.tab-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tab-navigation {
  background: $left-menu-bg;
  border-bottom: 1px solid $border-color;
  padding: 0 20px;
  
  .tab-tabs {
    :deep(.el-tabs__header) {
      margin: 0;
      background: transparent;
      border-bottom: none;
    }
    
    :deep(.el-tabs__nav-wrap) {
      padding: 0;
      background: transparent;
      border-bottom: none;
    }
    
    :deep(.el-tabs__nav) {
      background: transparent;
      border-bottom: none;
    }
    
    :deep(.el-tabs__active-bar) {
      display: none;
    }
    
    :deep(.el-tabs__item) {
      padding: 0 20px;
      height: 50px;
      line-height: 50px;
      font-weight: 500;
      color: $left-menu-text-color;
      background: transparent;
      border-bottom: none;
      transition: all 0.2s ease;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      
      &.is-active {
        color: $left-menu-active-text-color;
        background: $left-menu-active-bg;
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: $primary-color;
        }
      }
      
      &:hover {
        color: #fff;
        background: $left-menu-active-bg;
      }
    }
    
    .tab-label {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-weight: 500;
      transition: all 0.2s ease;
      position: relative;
      width: 100%;
      text-align: center;
      
      .tab-badge {
        margin-left: 4px;
      }
    }
  }
}

.tab-content {
  flex: 1;
  overflow: hidden;
  padding: 20px;
}

// 响应式设计
@media (max-width: 768px) {
  .tab-navigation {
    padding: 0 10px;
    
    .tab-tabs {
      :deep(.el-tabs__item) {
        padding: 0 10px;
        font-size: 14px;
        height: 45px;
        line-height: 45px;
      }
      
      .tab-label {
        gap: 4px;
        font-size: 14px;
      }
    }
  }
  
  .tab-content {
    padding: 10px;
  }
}

// 小屏幕适配
@media (max-width: 480px) {
  .tab-navigation {
    padding: 0 5px;
    
    .tab-tabs {
      :deep(.el-tabs__item) {
        padding: 0 8px;
        font-size: 12px;
        height: 40px;
        line-height: 40px;
      }
      
      .tab-label {
        gap: 2px;
        font-size: 12px;
      }
    }
  }
}
</style>
