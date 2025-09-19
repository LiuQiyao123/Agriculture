<template>
  <div v-if="visible" class="device-legend">
    <div class="legend-title">设备类型</div>
    <div class="legend-items">
      <div 
        v-for="deviceType in deviceTypes" 
        :key="deviceType.key"
        class="legend-item"
        :class="{ active: activeTypes.includes(deviceType.key) }"
        @click="() => toggleDeviceType(deviceType.key)"
      >
        <div class="legend-icon" :style="{ backgroundColor: deviceType.color }">
           <!-- You can use an icon library here if you have one -->
           <i :class="deviceType.icon"></i>
        </div>
        <span class="legend-text">{{ deviceType.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  deviceTypes: {
    type: Array,
    default: () => [
      // Example structure:
      // { key: 'soil', name: '墒情传感器', color: '#1DC788', icon: 'el-icon-monitor' },
    ]
  },
  initialActiveTypes: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['visibility-changed']);

const activeTypes = ref([...props.initialActiveTypes]);

const toggleDeviceType = (typeKey) => {
  if (activeTypes.value.includes(typeKey)) {
    activeTypes.value = activeTypes.value.filter(t => t !== typeKey);
  } else {
    activeTypes.value.push(typeKey);
  }
};

watch(activeTypes, (newActiveTypes) => {
  // Emit the full map of visibilities
  const visibilityMap = {};
  props.deviceTypes.forEach(type => {
    visibilityMap[type.key] = newActiveTypes.includes(type.key);
  });
  emit('visibility-changed', visibilityMap);
}, { immediate: true });

</script>

<style scoped>
/* Styles copied and adapted from GisMap.vue */
.device-legend {
  background: rgba(10, 29, 61, 0.9);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  padding: 16px 20px;
  z-index: 10;
  border: 1px solid rgba(0, 170, 255, 0.5);
  box-shadow: 0 0 12px rgba(0, 170, 255, 0.3);
  min-width: 400px;
}

.legend-title {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  text-align: center;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.6;
}

.legend-item.active {
  opacity: 1;
  background-color: rgba(0, 170, 255, 0.2);
}

.legend-item:hover {
  opacity: 1;
  background-color: rgba(0, 170, 255, 0.1);
}

.legend-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.legend-icon i {
  font-size: 12px;
  color: #fff;
}

.legend-text {
  color: #a0a6b8;
  font-size: 14px;
  white-space: nowrap;
}
</style>
