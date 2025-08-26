<template>
  <div class="page-container">
    <h1 class="page-title">智慧灌溉数字孪生</h1>
    <div class="analysis-container">
      <el-row :gutter="20" class="top-row">
        <el-col :span="18">
          <DataPanel title="灌溉区数字孪生场景">
            <div class="placeholder">
              <img src="https://via.placeholder.com/1000x600.png?text=Digital+Twin+Scene" alt="Digital Twin Scene" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          </DataPanel>
        </el-col>
        <el-col :span="6" class="right-column">
          <DataPanel title="设备状态监控">
             <div class="device-list">
                <div v-for="device in deviceStatus" :key="device.id" class="device-item">
                    <span class="device-name">{{ device.name }}</span>
                    <el-tag :type="device.status === '在线' ? 'success' : 'error'">{{ device.status }}</el-tag>
                </div>
             </div>
          </DataPanel>
          <DataPanel title="近期灌溉任务日志">
             <el-timeline class="timeline">
                <el-timeline-item
                  v-for="(log, index) in irrigationLog"
                  :key="index"
                  :timestamp="log.time"
                  :type="log.type"
                >
                  {{ log.content }}
                </el-timeline-item>
              </el-timeline>
          </DataPanel>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DataPanel from '@/components/DataPanel.vue';

const deviceStatus = ref([
    { id: 'PUMP-01', name: '1号主水泵', status: '在线' },
    { id: 'VALVE-01A', name: 'A区1号阀门', status: '在线' },
    { id: 'VALVE-01B', name: 'B区1号阀门', status: '离线' },
    { id: 'SENSOR-T-05', name: '5号土壤湿度计', status: '在线' },
    { id: 'SENSOR-T-08', name: '8号土壤湿度计', status: '在线' },
]);

const irrigationLog = ref([
  { time: '2023/10/28 10:00', content: '开始执行A区灌溉任务', type: 'primary' },
  { time: '2023/10/28 10:15', content: 'A区灌溉完成，用时15分钟，用水3.2m³', type: 'success' },
  { time: '2023/10/27 18:00', content: '开始执行C区灌溉任务', type: 'primary' },
  { time: '2023/10/27 18:05', content: 'C区设备连接失败，任务中断', type: 'danger' },
]);

</script>

<style scoped lang="scss">
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-title {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.analysis-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.top-row {
  flex-grow: 1;
  min-height: 0;
  & > .el-col {
    height: 100%;
  }
}

.top-row .el-col, .top-row .data-panel {
  height: 100%;
}
:deep(.data-panel .content) {
  height: calc(100% - 40px);
  padding: 15px;
  overflow-y: auto;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;

  .data-panel {
    flex: 1;
    height: auto;
    min-height: 0;
  }
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  border: 1px dashed #555;
  border-radius: 4px;
  background-color: #000;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 14px;
}

.timeline {
  padding-left: 5px;
  :deep(.el-timeline-item__timestamp) {
    color: #aaa;
  }
  :deep(.el-timeline-item__content) {
    color: #ddd;
  }
}
</style> 