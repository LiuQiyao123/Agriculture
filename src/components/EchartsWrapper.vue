<template>
  <div ref="chartRef" class="chart-host"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  options: { type: Object, required: true },
});

const chartRef = ref(null);
let chartInstance = null;
let ro = null;
let resizeTimer = null;

const safeResize = () => {
  if (!chartInstance) return;
  try { chartInstance.resize(); } catch {}
};

const debouncedResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (!chartRef.value) return;
    const { clientWidth, clientHeight } = chartRef.value;
    if (clientWidth && clientHeight) {
      safeResize();
    }
  }, 80);
};

const initChart = async () => {
  await nextTick();
  if (!chartRef.value) return;
  const { clientWidth, clientHeight } = chartRef.value;
  if (!clientWidth || !clientHeight) return; // 等容器有尺寸再初始化
  chartInstance = echarts.init(chartRef.value);
  chartInstance.setOption(props.options);
};

onMounted(async () => {
  await initChart();
  // 监听容器尺寸变化，比window.resize更可靠（弹窗、flex等场景）
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(() => {
      if (!chartInstance) initChart();
      debouncedResize();
    });
    if (chartRef.value) ro.observe(chartRef.value);
  } else {
    window.addEventListener('resize', debouncedResize);
  }
});

onUnmounted(() => {
  if (chartInstance) {
    try { chartInstance.dispose(); } catch {}
    chartInstance = null;
  }
  if (ro && chartRef.value) {
    try { ro.unobserve(chartRef.value); } catch {}
    ro = null;
  }
  window.removeEventListener('resize', debouncedResize);
  if (resizeTimer) { clearTimeout(resizeTimer); resizeTimer = null; }
});

// 选项变化：更新或延迟初始化
watch(() => props.options, async (newOptions) => {
  if (!chartInstance) {
    await initChart();
  }
  if (chartInstance) {
    chartInstance.setOption(newOptions, true);
    debouncedResize();
  }
}, { deep: true });

defineExpose({
  resizeChart: safeResize,
  initChart
});
</script>

<style scoped>
.chart-host { width: 100%; height: 100%; }
</style> 