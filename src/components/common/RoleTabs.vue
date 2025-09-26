<template>
  <TabContainer
    :active-tab="activeRole"
    :tabs="roles"
    :show-icon="showIcon"
    :size="size"
    :type="type"
    @tab-change="handleRoleChange"
  >
    <template #default="{ activeTab, tabData }">
      <slot :active-role="activeTab" :role-data="tabData" />
    </template>
  </TabContainer>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import TabContainer from './TabContainer.vue';

// Props定义
const props = defineProps({
  // 当前激活的角色
  activeRole: {
    type: String,
    required: true
  },
  // 角色配置数组
  roles: {
    type: Array,
    required: true,
    validator: (roles) => {
      return roles.every(role => 
        role.value && 
        role.label && 
        role.icon
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
    validator: (value) => ['card', 'border-card'].includes(value)
  }
});

// 事件定义
const emit = defineEmits(['role-change']);

// 处理角色切换
const handleRoleChange = (roleValue) => {
  emit('role-change', roleValue);
};
</script>

<style scoped lang="scss">
// RoleTabs组件基于TabContainer，不需要额外样式
</style>
