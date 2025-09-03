<template>
  <div class="data-center-container">
    <div class="list-col">
      <DataPanel title="设备管理">
        <!-- 筛选工具栏 -->
        <div class="panel-toolbar">
          <el-form :inline="true" :model="query" class="filter-form">
            <el-form-item label="设备ID">
              <el-input v-model="query.id" placeholder="输入设备ID" clearable style="width: 140px;" />
            </el-form-item>
            <el-form-item label="设备名称">
              <el-input v-model="query.name" placeholder="输入设备名称" clearable style="width: 160px;" />
            </el-form-item>
            <el-form-item label="设备类型">
              <el-select v-model="query.type" placeholder="全部" clearable style="width: 140px;">
                <el-option label="墒情传感器" value="soil" />
                <el-option label="气象监测站" value="weather" />
                <el-option label="田间监测站" value="field" />
                <el-option label="虫情测报仪" value="moth" />
                <el-option label="孢子测报仪" value="spore" />
                <el-option label="巡飞无人机" value="drone" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px;">
                <el-option label="在线" value="online" />
                <el-option label="离线" value="offline" />
                <el-option label="告警" value="alarm" />
                <el-option label="维护中" value="maintenance" />
              </el-select>
            </el-form-item>
            <el-form-item label="乡镇">
              <el-select v-model="query.town" placeholder="全部" clearable style="width: 140px;">
                <el-option v-for="town in townOptions" :key="town" :label="town" :value="town" />
              </el-select>
            </el-form-item>
            <el-form-item label="电量">
              <el-select v-model="query.battery" placeholder="全部" clearable style="width: 120px;">
                <el-option label="高(>80%)" value="high" />
                <el-option label="中(20-80%)" value="medium" />
                <el-option label="低(<20%)" value="low" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
              <el-button @click="handleExport">导出</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 设备列表表格 -->
        <div class="table-container">
          <el-table
            :data="paginatedDevices"
            class="dark-table"
            height="100%"
            stripe
            @row-click="handleRowClick"
            highlight-current-row
            v-loading="loading"
          >
          <el-table-column prop="id" label="设备ID" width="130" />
          <el-table-column prop="name" label="设备名称" min-width="120" show-overflow-tooltip />
          <el-table-column prop="type" label="类型" width="110">
            <template #default="scope">
              <el-tag size="small" :type="getTypeTagType(scope.row.type)">
                {{ getTypeName(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="battery" label="电量%" width="90">
            <template #default="scope">
              <el-progress 
                :percentage="scope.row.battery" 
                :color="getBatteryColor(scope.row.battery)"
                :stroke-width="8"
                :show-text="false"
              />
              <span style="margin-left: 8px; font-size: 12px;">{{ scope.row.battery }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="lastSeen" label="最后上报" width="170">
            <template #default="scope">
              <span :class="{ 'text-warning': isOffline(scope.row.lastSeen) }">
                {{ formatDateTime(scope.row.lastSeen) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="town" label="乡镇" width="110" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button size="small" type="primary" @click.stop="showDeviceDetails(scope.row)">
                详情
              </el-button>
            </template>
          </el-table-column>
          </el-table>
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.currentPage"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[20, 50, 100, 200]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              prev-text="上一页"
              next-text="下一页"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </DataPanel>
    </div>

    <!-- 地图区域 -->
    <div class="map-col">
      <DataPanel title="设备分布地图" class="map-panel">
        <GisMap ref="gisMapRef" :markers="mapMarkers" :showLayerControl="false" :showMask="false" @marker-click="showDeviceDetails" />
      </DataPanel>
    </div>
    
    <!-- 设备详情对话框 -->
    <DeviceDetailDialog v-model:visible="detailDialogVisible" :device="selectedDevice" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { deviceList } from '@/mock/dataCenter.js';
import GisMap from '@/components/GisMap.vue';
import DataPanel from '@/components/DataPanel.vue';
import DeviceDetailDialog from '@/components/DeviceDetailDialog.vue';
import { ElMessage } from 'element-plus';

const devices = ref(deviceList);
const query = ref({ 
  id: '', 
  name: '', 
  type: '', 
  status: '', 
  town: '', 
  battery: '' 
});
const loading = ref(false);
const detailDialogVisible = ref(false);
const selectedDevice = ref(null);
const gisMapRef = ref(null);

// 分页配置
const pagination = ref({
  currentPage: 1,
  pageSize: 50,
  total: 0
});

// 乡镇选项
const townOptions = computed(() => {
  const towns = [...new Set(devices.value.map(d => d.town).filter(Boolean))];
  return towns.sort();
});

// 筛选后的设备列表
const filteredDevices = computed(() => {
  let filtered = devices.value.filter(d => {
    if (query.value.id && !d.id.toLowerCase().includes(query.value.id.toLowerCase())) return false;
    if (query.value.name && !d.name.toLowerCase().includes(query.value.name.toLowerCase())) return false;
    if (query.value.type && d.type !== query.value.type) return false;
    if (query.value.status && d.status !== query.value.status) return false;
    if (query.value.town && d.town !== query.value.town) return false;
    if (query.value.battery) {
      const battery = d.battery;
      if (query.value.battery === 'high' && battery <= 80) return false;
      if (query.value.battery === 'medium' && (battery > 80 || battery < 20)) return false;
      if (query.value.battery === 'low' && battery >= 20) return false;
    }
    return true;
  });
  
  pagination.value.total = filtered.length;
  return filtered;
});

// 分页后的设备列表
const paginatedDevices = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize;
  const end = start + pagination.value.pageSize;
  return filteredDevices.value.slice(start, end);
});

// 将设备类型从中文映射为地图组件识别的类型键
const normalizeDeviceType = (raw) => {
  const map = {
    '气象站': 'weather',
    '气象监测站': 'weather',
    '土壤湿度计': 'soil',
    '墒情传感器': 'soil',
    '田间监测站': 'field',
    '虫情测报仪': 'moth',
    '孢子测报仪': 'spore',
    '巡飞无人机': 'drone',
    '摄像头': 'field'
  };
  return map[raw] || 'soil';
};

// 地图标记：确保有坐标，并提供英文类型键以通过可见性过滤
const mapMarkers = computed(() => {
  return paginatedDevices.value
    .filter(d => Array.isArray(d.coordinates) && d.coordinates.length === 2)
    .map(d => ({
      ...d,
      type: normalizeDeviceType(d.type),
    }));
});

onMounted(() => {
  pagination.value.total = devices.value.length;
});

// 事件处理函数
const handleSearch = () => {
  pagination.value.currentPage = 1;
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 300);
};

const handleReset = () => {
  query.value = { id: '', name: '', type: '', status: '', town: '', battery: '' };
  pagination.value.currentPage = 1;
};

const handleExport = () => {
  ElMessage.success('导出功能开发中...');
};

const handleSizeChange = (size) => {
  pagination.value.pageSize = size;
  pagination.value.currentPage = 1;
};

const handleCurrentChange = (page) => {
  pagination.value.currentPage = page;
};

const handleRowClick = (device) => {
  if (device.coordinates && gisMapRef.value) {
    gisMapRef.value.flyTo({
      center: device.coordinates,
      zoom: 15,
      speed: 1.2,
    });
  }
};

const showDeviceDetails = (device) => {
  selectedDevice.value = device;
  detailDialogVisible.value = true;
  handleRowClick(device);
};

// 工具函数
const getTypeTagType = (type) => {
  const typeMap = {
    soil: 'success',
    weather: 'primary',
    field: 'warning',
    moth: 'danger',
    spore: 'info',
    drone: 'warning'
  };
  return typeMap[type] || 'info';
};

const getTypeName = (type) => {
  const typeMap = {
    soil: '墒情传感器',
    weather: '气象监测站',
    field: '田间监测站',
    moth: '虫情测报仪',
    spore: '孢子测报仪',
    drone: '巡飞无人机'
  };
  return typeMap[type] || type;
};

const getStatusType = (status) => {
  if (status === 'online' || status === '在线') return 'success';
  if (status === 'alarm' || status === '告警') return 'danger';
  if (status === 'maintenance' || status === '维护中') return 'warning';
  return 'info';
};

const getStatusText = (status) => {
  const statusMap = {
    online: '在线',
    offline: '离线',
    alarm: '告警',
    maintenance: '维护中'
  };
  return statusMap[status] || status;
};

const getBatteryColor = (battery) => {
  if (battery > 80) return '#67C23A';
  if (battery > 20) return '#E6A23C';
  return '#F56C6C';
};

const isOffline = (lastSeen) => {
  const lastSeenTime = new Date(lastSeen);
  const now = new Date();
  const diffHours = (now - lastSeenTime) / (1000 * 60 * 60);
  return diffHours > 24;
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return '未知';
  const date = new Date(dateTime);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style lang="scss" scoped>
@use '@/styles/theme.scss' as theme;

.data-center-container {
  padding: 10px;
  height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 10px;
}

/* 明确左右并排位置：使用包裹列，避免内容影响布局 */
.list-col { grid-column: 1 / 2; min-width: 0; }
.map-col { grid-column: 2 / 3; min-width: 0; }

/* 防止子项最小内容宽度导致换行 */
.data-center-container > * { min-width: 0; overflow: hidden; }
.map-panel { min-width: 0; }

/* 固定高度的列表容器，内部放表格和分页 */
.table-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 280px);
  min-height: 300px;
}

/* 面板内容区使用弹性布局，避免内部元素撑破 */
:deep(.panel-content) {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* 地图面板内容充满可用高度 */
.map-panel :deep(.panel-content) {
  height: 100%;
}

.panel-toolbar {
  padding: 0 12px 10px;
  border-bottom: 1px solid rgba(0,170,255,.3);
  margin-bottom: 10px;
}

.filter-form {
  .el-form-item {
    margin-bottom: 8px;
  }
}

.map-panel {
  height: 100%;
}

.pagination-wrapper { padding: 10px 0 0; text-align: right; border-top: 1px solid rgba(255,255,255,.1); }

.coordinates {
  font-family: monospace;
  font-size: 12px;
  color: #c0c4cc;
}

.text-warning {
  color: #E6A23C;
}

.text-muted {
  color: #909399;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

:deep(.el-progress-bar__outer) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.el-pagination) {
  .el-pagination__total,
  .el-pagination__jump {
    color: #c0c4cc;
  }
  
  .el-pager li {
    background-color: transparent;
    color: #c0c4cc;
    
    &.active {
      background-color: #409EFF;
      color: white;
    }
    
    &:hover {
      background-color: rgba(64, 158, 255, 0.1);
    }
  }
}
</style> 