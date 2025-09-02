<template>
  <div v-if="visible" class="device-detail-panel">
    <div class="panel-header">
      <h3 class="panel-title">设备详情</h3>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>
    
    <div v-if="device" class="panel-content">
      <!-- 设备基本信息 -->
      <div class="device-info">
        <div class="device-header">
          <div class="device-icon" :class="`type-${device.type}`">
            <i :class="getDeviceIcon(device.type)"></i>
          </div>
          <div class="device-title">
            <h4>{{ device.name }}</h4>
            <p class="device-type">{{ getDeviceTypeName(device.type) }}</p>
          </div>
        </div>
        
        <div class="device-status">
          <el-tag :type="getStatusType(device.status)" size="small">
            {{ getStatusText(device.status) }}
          </el-tag>
          <span class="battery-info">
            <i class="el-icon-battery"></i>
            {{ device.battery }}%
          </span>
        </div>
      </div>

      <!-- 设备数据 -->
      <div class="device-data">
        <h5>实时数据</h5>
        <div class="data-grid">
          <div v-for="(value, key) in getDeviceData(device)" :key="key" class="data-item">
            <span class="data-label">{{ getDataLabel(key) }}</span>
            <span class="data-value">{{ formatDataValue(value, key) }}</span>
          </div>
        </div>
      </div>

      <!-- 设备图像 -->
      <div class="device-images">
        <h5>监测图像</h5>
        <div class="image-grid">
          <div 
            v-for="(image, index) in device.images" 
            :key="index" 
            class="image-item"
            @click="previewImage(image)"
          >
            <img :src="image" :alt="`${device.name}图像${index + 1}`" />
            <div class="image-overlay">
              <i class="el-icon-zoom-in"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 设备位置信息 -->
      <div class="device-location">
        <h5>位置信息</h5>
        <div class="location-info">
          <p><strong>所属乡镇：</strong>{{ device.town }}</p>
          <p><strong>经度：</strong>{{ device.coordinates[0] }}</p>
          <p><strong>纬度：</strong>{{ device.coordinates[1] }}</p>
          <p><strong>最后上报：</strong>{{ formatDateTime(device.lastSeen) }}</p>
        </div>
      </div>
    </div>

    <div v-else class="no-device">
      <p>请选择设备查看详情</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  device: {
    type: Object,
    default: null
  }
});

defineEmits(['close']);

// 获取设备图标
const getDeviceIcon = (type) => {
  const iconMap = {
    soil: 'el-icon-monitor',
    weather: 'el-icon-cloudy',
    drone: 'el-icon-plane',
    moth: 'el-icon-bug',
    spore: 'el-icon-microscope',
    field: 'el-icon-crop'
  };
  return iconMap[type] || 'el-icon-monitor';
};

// 获取设备类型名称
const getDeviceTypeName = (type) => {
  const nameMap = {
    soil: '墒情传感器',
    weather: '气象监测站',
    drone: '巡飞无人机',
    moth: '虫情测报仪',
    spore: '孢子测报仪',
    field: '田间监测站'
  };
  return nameMap[type] || '未知设备';
};

// 获取状态类型
const getStatusType = (status) => {
  if (status === 'online') return 'success';
  if (status === 'offline') return 'info';
  if (status === 'alarm') return 'warning';
  return 'info';
};

// 获取状态文本
const getStatusText = (status) => {
  if (status === 'online') return '在线';
  if (status === 'offline') return '离线';
  if (status === 'alarm') return '告警';
  return '未知';
};

// 获取设备数据
const getDeviceData = (device) => {
  if (!device.data) return {};
  
  const dataMap = {
    soil: {
      soilMoisture: '土壤湿度',
      soilTemperature: '土壤温度',
      ph: 'pH值'
    },
    weather: {
      temperature: '温度',
      humidity: '湿度',
      windSpeed: '风速',
      rainfall: '降雨量'
    },
    drone: {
      altitude: '飞行高度',
      speed: '飞行速度',
      coverage: '覆盖面积'
    },
    moth: {
      mothCount: '虫情数量',
      trapType: '诱捕类型',
      riskLevel: '风险等级'
    },
    spore: {
      sporeCount: '孢子数量',
      diseaseType: '病害类型',
      riskLevel: '风险等级'
    },
    field: {
      cropType: '作物类型',
      growthStage: '生长阶段',
      healthIndex: '健康指数'
    }
  };
  
  return dataMap[device.type] || {};
};

// 获取数据标签
const getDataLabel = (key) => {
  const labelMap = {
    soilMoisture: '土壤湿度',
    soilTemperature: '土壤温度',
    ph: 'pH值',
    temperature: '温度',
    humidity: '湿度',
    windSpeed: '风速',
    rainfall: '降雨量',
    altitude: '飞行高度',
    speed: '飞行速度',
    coverage: '覆盖面积',
    mothCount: '虫情数量',
    trapType: '诱捕类型',
    riskLevel: '风险等级',
    sporeCount: '孢子数量',
    diseaseType: '病害类型',
    cropType: '作物类型',
    growthStage: '生长阶段',
    healthIndex: '健康指数'
  };
  return labelMap[key] || key;
};

// 格式化数据值
const formatDataValue = (value, key) => {
  if (key === 'ph') return value.toFixed(1);
  if (key === 'temperature' || key === 'soilTemperature') return `${value}°C`;
  if (key === 'humidity' || key === 'soilMoisture') return `${value}%`;
  if (key === 'windSpeed') return `${value}m/s`;
  if (key === 'rainfall') return `${value}mm`;
  if (key === 'altitude') return `${value}m`;
  if (key === 'speed') return `${value}m/s`;
  if (key === 'coverage') return `${value}%`;
  if (key === 'healthIndex') return `${value}分`;
  if (key === 'riskLevel') {
    const levelMap = { low: '低', medium: '中', high: '高' };
    return levelMap[value] || value;
  }
  return value;
};

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return '未知';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
};

// 预览图像
const previewImage = (imageUrl) => {
  // 这里可以实现图像预览功能
  console.log('预览图像:', imageUrl);
};
</script>

<style scoped>
.device-detail-panel {
  position: fixed;
  left: calc(25% + 20px); /* 左侧面板宽度(25%) + 间距 */
  top: 50%;
  transform: translateY(-50%);
  width: 320px;
  max-height: 80vh;
  background: rgba(0, 0, 0, 0.85);
  border: 1px solid rgba(0, 170, 255, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .device-detail-panel {
    left: calc(30% + 15px);
    width: 300px;
  }
}

@media (max-width: 1200px) {
  .device-detail-panel {
    left: calc(35% + 10px);
    width: 280px;
  }
}

@media (max-width: 1000px) {
  .device-detail-panel {
    left: calc(40% + 10px);
    width: 260px;
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 170, 255, 0.2);
  background: rgba(0, 170, 255, 0.1);
}

.panel-title {
  margin: 0;
  color: #00aaff;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #a0a6b8;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.panel-content {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(80vh - 60px);
}

.device-info {
  margin-bottom: 24px;
}

.device-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.device-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: #fff;
}

.device-icon.type-soil { background: #1DC788; }
.device-icon.type-weather { background: #20DBFD; }
.device-icon.type-drone { background: #4ECDC4; }
.device-icon.type-moth { background: #731DC7; }
.device-icon.type-spore { background: #FF6B6B; }
.device-icon.type-field { background: #FFAA00; }

.device-title h4 {
  margin: 0 0 4px 0;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.device-type {
  margin: 0;
  color: #a0a6b8;
  font-size: 14px;
}

.device-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.battery-info {
  color: #a0a6b8;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.device-data,
.device-images,
.device-location {
  margin-bottom: 24px;
}

.device-data h5,
.device-images h5,
.device-location h5 {
  margin: 0 0 12px 0;
  color: #00aaff;
  font-size: 14px;
  font-weight: 600;
}

.data-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.data-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-label {
  color: #a0a6b8;
  font-size: 12px;
}

.data-value {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.image-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.image-item:hover {
  transform: scale(1.05);
}

.image-item img {
  width: 100%;
  height: 80px;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.image-overlay i {
  color: #fff;
  font-size: 20px;
}

.location-info p {
  margin: 8px 0;
  color: #a0a6b8;
  font-size: 14px;
}

.location-info strong {
  color: #fff;
}

.no-device {
  padding: 40px 20px;
  text-align: center;
  color: #a0a6b8;
}

/* 滚动条样式 */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(0, 170, 255, 0.5);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 170, 255, 0.7);
}
</style>
