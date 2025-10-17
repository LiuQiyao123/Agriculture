<template>
  <div class="page-container">
    <PageTitle title="农事预警中心" subtitle="集中监控并响应所有紧急农事事件" />
    <div class="content-area">
      <DataPanel>
        <template #title>
          <div class="panel-title-container">
            <span>所有预警事件</span>
          </div>
        </template>
        <AlertList
          :alerts="allAlerts"
          :loading="loading"
          @view-detail="handleViewDetail"
          @process-alert="handleProcessAlert"
        />
      </DataPanel>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import PageTitle from '@/components/PageTitle.vue';
import DataPanel from '@/components/DataPanel.vue';
import AlertList from '@/components/farm/AlertList.vue';
import { useAlerts } from '@/composables/farm/useAlerts.js';

const { allAlerts, loading, fetchAlerts } = useAlerts();

onMounted(() => {
  fetchAlerts();
});

const handleViewDetail = (alertId) => {
  console.log('View detail for alert:', alertId);
};

const handleProcessAlert = (alertId) => {
  console.log('Process alert:', alertId);
};
</script>

<style scoped lang="scss">
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.content-area {
  flex-grow: 1;
  overflow: hidden;
  padding: 10px;

  :deep(.panel-content) {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 10px;
  }
}

.panel-title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 10px;
}

.alert-list-placeholder {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
  font-size: 16px;
}
</style>
