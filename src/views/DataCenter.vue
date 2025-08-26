<template>
  <div class="data-center-container">
    <el-row :gutter="10">
      <!-- Left Column: Unified Data Log -->
      <el-col :span="12">
        <DataPanel title="统一数据记录">
          <div class="panel-toolbar">
             <el-button type="primary" @click="reportDialogVisible = true">新增人工上报</el-button>
          </div>
          <el-table :data="unifiedDataLog" stripe class="dark-table" height="calc(100vh - 170px)">
            <el-table-column prop="source" label="来源" width="100" />
            <el-table-column prop="type" label="类型/事件" />
            <el-table-column prop="location" label="位置/乡镇" />
            <el-table-column prop="reporter" label="设备/上报人" />
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column label="操作">
              <el-button size="small">详情</el-button>
            </el-table-column>
          </el-table>
        </DataPanel>
      </el-col>

      <!-- Right Column: Map and Device List -->
      <el-col :span="12" class="content-col">
        <DataPanel title="设备与事件分布" style="margin-bottom: 10px; flex-basis: 55%;">
          <GisMap ref="gisMapRef" :markers="devices" @marker-click="showDeviceDetails" />
        </DataPanel>
        <DataPanel title="自动化设备管理" style="flex-basis: 45%;">
          <el-table
            :data="devices"
            class="dark-table"
            height="calc(45vh - 120px)"
            stripe
            @row-click="handleRowClick"
            highlight-current-row
          >
            <el-table-column prop="id" label="设备ID" />
            <el-table-column prop="type" label="设备类型" />
            <el-table-column prop="status" label="状态" />
             <el-table-column label="操作">
              <template #default="scope">
                <el-button size="small" @click.stop="showDeviceDetails(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </DataPanel>
      </el-col>
    </el-row>
    
    <ReportDialog v-model:visible="reportDialogVisible" @submit="handleNewReport" />
    <DeviceDetailDialog v-model:visible="detailDialogVisible" :device="selectedDevice" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { deviceList } from '@/mock/dataCenter.js';
import GisMap from '@/components/GisMap.vue';
import DataPanel from '@/components/DataPanel.vue';
import ReportDialog from '@/components/ReportDialog.vue';
import DeviceDetailDialog from '@/components/DeviceDetailDialog.vue';
import { ElMessage } from 'element-plus';
import { onMounted } from 'vue';

const devices = ref(deviceList);
const reportDialogVisible = ref(false);
const detailDialogVisible = ref(false);
const selectedDevice = ref(null);
const unifiedDataLog = ref([]); // This will hold all data records
const gisMapRef = ref(null);

onMounted(() => {
  // Populate the unified log with device data on component mount
  const deviceLogs = devices.value.map(device => ({
    source: '自动',
    type: '设备上线',
    location: device.town,
    reporter: device.id,
    time: new Date().toLocaleString(), // Using current time as placeholder
    id: device.id,
  }));
  unifiedDataLog.value = [...deviceLogs];
});

const handleRowClick = (device) => {
  if (device.coordinates) {
    gisMapRef.value?.flyTo({
      center: device.coordinates,
      zoom: 15,
      speed: 1.2,
    });
  }
};

const showDeviceDetails = (device) => {
  selectedDevice.value = device;
  detailDialogVisible.value = true;
  handleRowClick(device); // Also fly to the location
};

const handleNewReport = (reportData) => {
  const newRecord = {
    source: '人工',
    type: reportData.eventType,
    location: reportData.town,
    reporter: reportData.reporter,
    time: new Date(reportData.reportTime).toLocaleString(),
    id: `MANUAL-${Date.now()}`
  };
  unifiedDataLog.value.unshift(newRecord);
  ElMessage.success('人工上报成功！');
};
</script>

<style lang="scss" scoped>
@use '@/styles/theme.scss' as theme;

.data-center-container {
  padding: 10px;
  height: 100%;
  .el-row {
    height: 100%;
  }
}
.content-col {
  display: flex;
  flex-direction: column;
}
.panel-toolbar {
  padding: 0 10px 10px;
  border-bottom: 1px solid theme.$border-color;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}
</style> 