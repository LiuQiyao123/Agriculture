<template>
  <div v-if="visible" class="time-slider">
    <div class="time-slider-header">
      <span class="time-label">时间轴</span>
      <span class="current-date">{{ selectedDate.toLocaleDateString('zh-CN') }}</span>
    </div>
    <div class="time-slider-content">
      <div class="slider-track">
        <div class="slider-fill" :style="{ width: `${sliderPosition}%` }"></div>
        <input 
          type="range" 
          min="0" 
          :max="timeAxisData.length - 1" 
          :value="sliderValue"
          @input="handleSliderChange"
          class="slider-input"
        />
        <div class="time-markers">
          <div 
            v-for="(timeItem, index) in timeAxisData" 
            :key="index"
            class="time-marker"
            :class="[timeItem.type, { active: index === sliderValue }]"
          >
            <span class="time-label">{{ timeItem.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['date-changed']);

const selectedDate = ref(new Date());

const timeAxisData = computed(() => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 7; i > 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push({
      date: date,
      label: date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
      type: 'history'
    });
  }
  
  dates.push({ date: today, label: '今天', type: 'current' });
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push({
      date: date,
      label: date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
      type: 'prediction'
    });
  }
  return dates;
});

const sliderValue = computed(() => {
  return timeAxisData.value.findIndex(item => item.date.getTime() === selectedDate.value.getTime());
});

const sliderPosition = computed(() => {
  if (timeAxisData.value.length <= 1) return 50;
  return (sliderValue.value / (timeAxisData.value.length - 1)) * 100;
});

const handleSliderChange = (event) => {
  const index = parseInt(event.target.value, 10);
  if (timeAxisData.value[index]) {
    selectedDate.value = timeAxisData.value[index].date;
  }
};

watch(selectedDate, (newDate) => {
  emit('date-changed', newDate);
});

// Emit initial date
emit('date-changed', selectedDate.value);

</script>

<style scoped>
/* Styles copied and adapted from GisMap.vue */
.time-slider {
  background: rgba(10, 29, 61, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px 24px;
  z-index: 10;
  border: 2px solid rgba(0, 170, 255, 0.6);
  box-shadow: 0 0 20px rgba(0, 170, 255, 0.4);
  width: 1200px;
  max-width: 98vw;
  overflow: hidden;
}

.time-slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.time-label {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.current-date {
  font-size: 14px;
  color: #a0a6b8;
  background: rgba(0, 170, 255, 0.2);
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid rgba(0, 170, 255, 0.3);
}

.time-slider-content {
  position: relative;
}

.slider-track {
  position: relative;
  height: 50px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin: 0 10px;
}

.slider-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, rgba(0, 170, 255, 0.3), rgba(0, 170, 255, 0.6));
  border-radius: 10px;
  transition: width 0.3s ease;
}

.slider-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.time-markers {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  pointer-events: none;
}

.time-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 10px;
  border-radius: 6px;
  min-width: 60px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.time-marker.history {
  background: rgba(255, 193, 7, 0.15);
  border-color: rgba(255, 193, 7, 0.4);
}

.time-marker.current {
  background: rgba(0, 170, 255, 0.25);
  border-color: rgba(0, 170, 255, 0.6);
}

.time-marker.active,
.time-marker.current.active {
  box-shadow: 0 0 15px rgba(0, 170, 255, 0.4);
  transform: scale(1.05);
}

.time-marker.prediction {
  background: rgba(40, 167, 69, 0.15);
  border-color: rgba(40, 167, 69, 0.4);
}

.time-marker .time-label {
  font-size: 14px;
  color: #ffffff;
  text-align: center;
  line-height: 1.3;
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
  white-space: nowrap;
}
</style>
