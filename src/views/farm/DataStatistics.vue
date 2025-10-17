<template>
  <div class="page-container">
    <PageTitle title="数据统计分析" subtitle="洞察农场运营数据，驱动智能化决策" />
    <div class="stats-grid">
      <div class="grid-item">
        <EchartsWrapper :options="plotAreaChartOptions" />
      </div>
      <div class="grid-item">
        <EchartsWrapper :options="cropVarietyChartOptions" />
      </div>
      <div class="grid-item">
        <EchartsWrapper :options="taskStatusChartOptions" />
      </div>
      <div class="grid-item wide">
        <EchartsWrapper :options="yieldTrendChartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import PageTitle from '@/components/PageTitle.vue';
import EchartsWrapper from '@/components/EchartsWrapper.vue';
import { useFarmStats } from '@/composables/farm/useFarmStats.js';

const {
  fetchData,
  plotAreaChartOptions,
  cropVarietyChartOptions,
  taskStatusChartOptions,
  yieldTrendChartOptions,
} = useFarmStats();

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="scss">
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
}

.stats-grid {
  flex-grow: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 20px;
  padding-top: 10px;
}

.grid-item {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0,170,255,.3);
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.grid-item.wide {
  grid-column: span 3;
}
</style>
