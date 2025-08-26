<template>
  <div 
    class="seamless-scroll-list" 
    ref="containerRef" 
    @mouseenter="isAnimating = false" 
    @mouseleave="isAnimating = true"
  >
    <div class="scroll-content" :style="{ transform: `translateY(-${scrollTop}px)` }">
      <div v-for="(item, index) in list" :key="'real'+index" class="scroll-item" @click="onItemClick(item)">
        {{ item.content }}
      </div>
      <!-- Cloned list for seamless effect -->
      <div v-for="(item, index) in list" :key="'clone'+index" class="scroll-item" @click="onItemClick(item)">
        {{ item.content }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  list: {
    type: Array,
    required: true,
  },
  speed: {
    type: Number,
    default: 30, // pixels per second
  },
});

const emit = defineEmits(['item-click']);

const onItemClick = (item) => {
  emit('item-click', item);
};

const containerRef = ref(null);
const scrollTop = ref(0);
const isAnimating = ref(true);
let animationFrameId = null;

const scroll = () => {
  if (isAnimating.value && containerRef.value) {
    scrollTop.value += props.speed / 60; // Assuming 60fps
    const scrollContent = containerRef.value.querySelector('.scroll-content');
    if (scrollContent && scrollTop.value >= scrollContent.offsetHeight / 2) {
      scrollTop.value = 0;
    }
  }
  animationFrameId = requestAnimationFrame(scroll);
};

onMounted(() => {
  if (props.list.length > 0) {
    animationFrameId = requestAnimationFrame(scroll);
  }
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId);
});

</script>

<style scoped>
.seamless-scroll-list {
  height: 100%;
  overflow: hidden;
}

.scroll-content {
  transition: transform 0.016s linear; /* Smooths out the animation */
}

.scroll-item {
  padding: 8px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.scroll-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style> 