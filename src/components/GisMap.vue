<template>
  <div class="gis-map-wrapper">
    <div ref="mapContainer" class="map-container"></div>
    <!-- Map radial mask overlay -->
    <div class="map-mask" aria-hidden="true"></div>

    <!-- View Switcher -->
    <div class="view-switcher">
      <button 
        v-for="view in views" 
        :key="view.id" 
        :class="{ active: currentView === view.id }"
        @click="switchView(view.id)"
      >
        {{ view.name }}
      </button>
    </div>

    <div class="layer-control">
      <!-- Layer controls will be dynamically generated based on the current view -->
      <template v-if="currentViewLayers">
        <button
          v-for="layerKey in currentViewLayers.layers"
          :key="layerKey"
          class="layer-control-btn"
          :class="{ active: activeLayers.includes(layerKey) }"
          @click="() => toggleLayer(layerKey)"
        >
          {{ getLayerName(layerKey) }}
        </button>
      </template>
    </div>

    <!-- 设备图例控制 -->
    <div v-if="activeLayers.includes('sensor-devices')" class="device-legend">
      <div class="legend-title">设备类型</div>
      <div class="legend-items">
        <div 
          v-for="deviceType in deviceTypes" 
          :key="deviceType.key"
          class="legend-item"
          :class="{ active: deviceTypeVisibility[deviceType.key] }"
          @click="toggleDeviceType(deviceType.key)"
        >
          <div class="legend-icon" :class="`type-${deviceType.key}`">
            <i :class="deviceType.icon"></i>
          </div>
          <span class="legend-text">{{ deviceType.name }}</span>
        </div>
      </div>
    </div>

    <!-- 时间轴控制 -->
    <div v-if="shouldShowTimeSlider" class="time-slider">
      <div class="time-slider-header">
        <span class="time-label">时间轴</span>
        <span class="current-date">{{ selectedDate.toLocaleDateString('zh-CN') }}</span>
      </div>
      <div class="time-slider-content">
        <div class="slider-track">
          <div class="slider-fill" :style="{ width: `${getSliderPosition()}%` }"></div>
          <input 
            type="range" 
            min="0" 
            max="14" 
            :value="getSliderValue()"
            @input="handleSliderChange"
            class="slider-input"
          />
          <div class="time-markers">
            <div 
              v-for="(timeItem, index) in timeAxisData" 
              :key="index"
              class="time-marker"
              :class="{ 
                history: timeItem.type === 'history',
                current: timeItem.type === 'current',
                prediction: timeItem.type === 'prediction'
              }"
            >
              <span class="time-label">{{ timeItem.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 设备详情面板 -->
    <DeviceDetailPanel
      :visible="deviceDetailVisible"
      :device="selectedDevice"
      @close="deviceDetailVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import devices from '../mock/devices.json';
import irrigationSystem from '../mock/irrigation-system.json';
import DeviceDetailPanel from './DeviceDetailPanel.vue';
// import { generateChlorophyllGrid, chlorophyllColorScale } from '../mock/gis.js'; // Heatmap feature disabled for now

const props = defineProps({
  geojson: Object,
  markers: Array,
  layers: Object,
});

const emit = defineEmits(['marker-click', 'plot-analysis']);

// 设备详情面板状态
const deviceDetailVisible = ref(false);
const selectedDevice = ref(null);
const mapContainer = ref(null);
let map = null;

// --- Centralized Layer and View Configuration ---
const allLayersConfig = {
  'plots': { id: 'plots', name: '地块边界', type: 'geojson', defaultVisibility: true, exclusive: false },
  'sensor-devices': { id: 'sensor-devices', name: '在线设备', type: 'marker', defaultVisibility: true, exclusive: true },
  'ndvi-tiles': { id: 'ndvi-tiles', name: '作物长势(NDVI)', type: 'raster', defaultVisibility: false, exclusive: true },
  'soil-moisture': { id: 'soil-moisture', name: '土壤墒情评估', type: 'raster', defaultVisibility: false, exclusive: true },
  'pest-disease': { id: 'pest-disease', name: '病虫害监测', type: 'raster', defaultVisibility: false, exclusive: true },
  'weather-disaster': { id: 'weather-disaster', name: '气象灾害预警', type: 'raster', defaultVisibility: false, exclusive: true },
  'irrigation-system': { id: 'irrigation-system', name: '灌溉系统', type: 'geojson', defaultVisibility: false, exclusive: true },
  'crop-yield': { id: 'crop-yield', name: '产量预测', type: 'raster', defaultVisibility: false, exclusive: true },
  'soil-quality': { id: 'soil-quality', name: '土壤肥力', type: 'raster', defaultVisibility: false, exclusive: true },
};

const views = {
  production: {
    id: 'production',
    name: '农业生产视图',
    layers: ['plots', 'sensor-devices', 'ndvi-tiles', 'soil-moisture', 'pest-disease', 'weather-disaster', 'irrigation-system', 'crop-yield', 'soil-quality'],
  },
  governance: {
    id: 'governance',
    name: '数字乡村治理视图',
    layers: [],
  }
};

const currentView = ref('production');
const activeLayers = ref(['plots', 'sensor-devices']); // Default active layers
const currentViewLayers = computed(() => views[currentView.value]);

// 时间轴相关状态
const timeSliderVisible = ref(false);
const currentDate = ref(new Date());
const selectedDate = ref(new Date());

// 需要时间轴的图层
const timeAxisLayers = ['ndvi-tiles', 'soil-moisture', 'pest-disease', 'weather-disaster', 'crop-yield', 'soil-quality'];

// 计算时间轴是否应该显示
const shouldShowTimeSlider = computed(() => {
  return timeSliderVisible.value && activeLayers.value.some(layer => timeAxisLayers.includes(layer));
});

// 生成时间轴数据（T-7到T+7）
const timeAxisData = computed(() => {
  const dates = [];
  const today = new Date();
  
  // 过去7天
  for (let i = 7; i > 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push({
      date: date,
      label: date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
      type: 'history'
    });
  }
  
  // 今天
  dates.push({
    date: today,
    label: '今天',
    type: 'current'
  });
  
  // 未来7天
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

// 图层颜色配置
const layerColors = {
  'ndvi-tiles': {
    low: '#d73027',    // 红色 - 低NDVI
    medium: '#f46d43', // 橙色 - 中等NDVI
    high: '#fdae61',   // 黄色 - 高NDVI
    veryHigh: '#fee08b', // 浅黄 - 很高NDVI
    excellent: '#d9ef8b'  // 绿色 - 优秀NDVI
  },
  'soil-moisture': {
    dry: '#8b0000',      // 深红 - 干燥
    low: '#ff4500',      // 橙红 - 偏低
    normal: '#ffa500',   // 橙色 - 正常
    high: '#32cd32',     // 绿色 - 偏高
    wet: '#006400'       // 深绿 - 湿润
  },
  'pest-disease': {
    none: '#228b22',     // 绿色 - 无病虫害
    low: '#ffd700',      // 金色 - 轻度
    medium: '#ff8c00',   // 橙色 - 中度
    high: '#ff4500',     // 橙红 - 重度
    severe: '#8b0000'    // 深红 - 严重
  },
  'weather-disaster': {
    none: '#228b22',     // 绿色 - 无灾害
    low: '#ffd700',      // 金色 - 轻度
    medium: '#ff8c00',   // 橙色 - 中度
    high: '#ff4500',     // 橙红 - 重度
    severe: '#8b0000'    // 深红 - 严重
  },
  'crop-yield': {
    low: '#8b0000',      // 深红 - 低产
    medium: '#ff8c00',   // 橙色 - 中产
    high: '#32cd32',     // 绿色 - 高产
    veryHigh: '#228b22'  // 深绿 - 高产
  },
  'soil-quality': {
    poor: '#8b0000',     // 深红 - 贫瘠
    fair: '#ff8c00',     // 橙色 - 一般
    good: '#32cd32',     // 绿色 - 良好
    excellent: '#228b22' // 深绿 - 优秀
  }
};



const deviceTypeVisibility = ref({
  soil: true,
  weather: true,
  field: true,
  moth: true,
  spore: true,
  drone: true
});

// 切换设备类型显示
const toggleDeviceType = (typeKey) => {
  deviceTypeVisibility.value[typeKey] = !deviceTypeVisibility.value[typeKey];
  // 重新渲染设备标记
  if (activeLayers.value.includes('sensor-devices')) {
    clearMarkers();
    addMarkers();
  }
};

// 时间轴处理函数
const handleTimeChange = (date) => {
  selectedDate.value = date;
  // 这里可以根据选择的日期更新图层数据
  updateLayerDataByDate(date);
};

const handleSliderChange = (event) => {
  const value = parseInt(event.target.value);
  const dateIndex = value;
  if (timeAxisData.value[dateIndex]) {
    selectedDate.value = timeAxisData.value[dateIndex].date;
    updateLayerDataByDate(selectedDate.value);
  }
};

const getSliderValue = () => {
  // 直接返回当前选中日期在时间轴数据中的索引
  const today = new Date();
  const todayStr = today.toDateString();
  
  // 找到今天在时间轴数据中的索引
  const todayIndex = timeAxisData.value.findIndex(item => item.date.toDateString() === todayStr);
  
  if (todayIndex === -1) return 7; // 默认返回中间位置
  
  // 计算当前选中日期相对于今天的偏移
  const selectedIndex = timeAxisData.value.findIndex(item => item.date.toDateString() === selectedDate.value.toDateString());
  
  if (selectedIndex === -1) return todayIndex;
  
  return selectedIndex;
};

const getSliderPosition = () => {
  return (getSliderValue() / 14) * 100;
};

const updateLayerDataByDate = (date) => {
  // 根据选择的日期更新当前激活的图层数据
  const activeTimeLayer = activeLayers.value.find(layer => timeAxisLayers.includes(layer) && layer !== 'irrigation-system');
  if (activeTimeLayer && map) {
    // 这里可以根据日期更新图层的数据源
    console.log(`更新图层 ${activeTimeLayer} 的数据到日期: ${date.toLocaleDateString()}`);
    
    // 更新地块颜色
    updatePlotColors(activeTimeLayer, date);
  }
};

const updatePlotColors = (layerKey, date) => {
  if (!map || !props.geojson) return;
  
  const colors = layerColors[layerKey];
  if (!colors) return;
  
  // 模拟根据图层类型和日期生成地块颜色数据
  const updatedData = {
    ...props.geojson,
    features: props.geojson.features.map(feature => {
      const plotId = feature.properties.id;
      let color;
      
      // 根据图层类型生成不同的颜色
      switch (layerKey) {
        case 'ndvi-tiles':
          const ndviValue = Math.random() * 100;
          if (ndviValue < 20) color = colors.low;
          else if (ndviValue < 40) color = colors.medium;
          else if (ndviValue < 60) color = colors.high;
          else if (ndviValue < 80) color = colors.veryHigh;
          else color = colors.excellent;
          break;
          
        case 'soil-moisture':
          const moistureValue = Math.random() * 100;
          if (moistureValue < 20) color = colors.dry;
          else if (moistureValue < 40) color = colors.low;
          else if (moistureValue < 60) color = colors.normal;
          else if (moistureValue < 80) color = colors.high;
          else color = colors.wet;
          break;
          
        case 'pest-disease':
        case 'weather-disaster':
          const riskValue = Math.random() * 100;
          if (riskValue < 20) color = colors.none;
          else if (riskValue < 40) color = colors.low;
          else if (riskValue < 60) color = colors.medium;
          else if (riskValue < 80) color = colors.high;
          else color = colors.severe;
          break;
          
        case 'crop-yield':
          const yieldValue = Math.random() * 100;
          if (yieldValue < 25) color = colors.low;
          else if (yieldValue < 50) color = colors.medium;
          else if (yieldValue < 75) color = colors.high;
          else color = colors.veryHigh;
          break;
          
        case 'soil-quality':
          const qualityValue = Math.random() * 100;
          if (qualityValue < 25) color = colors.poor;
          else if (qualityValue < 50) color = colors.fair;
          else if (qualityValue < 75) color = colors.good;
          else color = colors.excellent;
          break;
          
        default:
          color = 'rgba(0, 170, 255, 0.1)';
      }
      
      return {
        ...feature,
        properties: {
          ...feature.properties,
          layerColor: color
        }
      };
    })
  };
  
  // 更新地图数据
  if (map.getSource('plots')) {
    map.getSource('plots').setData(updatedData);
  }
};

const getLayerName = (layerKey) => {
  return allLayersConfig[layerKey]?.name || layerKey;
};
// --- End Configuration ---

let markerInstances = [];

const switchView = (viewId) => {
  if (currentView.value === viewId) return;

  // Hide all layers from the old view before switching
  const oldViewConf = views[currentView.value];
  oldViewConf.layers.forEach(layerKey => {
    setLayerVisibility(layerKey, false);
  });
  
  currentView.value = viewId;
  const newViewConf = views[viewId];
  const newActiveLayers = [];

  // Set visibility for new view layers based on their default state
  newViewConf.layers.forEach(layerKey => {
    const config = allLayersConfig[layerKey];
    if (config) {
      setLayerVisibility(layerKey, config.defaultVisibility);
      if (config.defaultVisibility) {
        newActiveLayers.push(layerKey);
      }
    }
  });
  activeLayers.value = newActiveLayers;
};

const initializeMap = () => {
  if (!mapContainer.value) return;
  const apiKey = import.meta.env.VITE_MAPTILER_KEY;
  if (!apiKey || apiKey === 'YOUR_MAPTILER_API_KEY_HERE') {
    mapContainer.value.innerHTML = '<div class="map-error">Maptiler API Key缺失，请在.env文件中设置VITE_MAPTILER_KEY</div>';
    return;
  }
  
  const style = `https://api.maptiler.com/maps/0198e427-ec93-788c-a9fd-1f109fdac61f/style.json?key=${apiKey}`;
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: style,
    center: [118.5, 36.5], // Center of Shandong Province
    zoom: 7.2, // Zoom level to show the whole province
    pitch: 45,
    bearing: -17.6,
    antialias: true,
    attributionControl: false, // 完全禁用版权信息
    dragRotate: true,
    pitchWithRotate: true,
    keyboard: true,
  });

  map.on('load', () => {
    /*
    // Add the simulated chlorophyll heatmap
    const bbox = [114.6, 34.4, 122.7, 38.4]; // Bounding box for Shandong Province
    const chlorophyllData = generateChlorophyllGrid(bbox, 0.01); // Increased cell size for performance

    map.addSource('chlorophyll-heatmap', {
      type: 'geojson',
      data: chlorophyllData
    });

    map.addLayer({
      id: 'chlorophyll-heatmap-layer',
      type: 'fill',
      source: 'chlorophyll-heatmap',
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'chlorophyll'],
          ...chlorophyllColorScale
        ],
        'fill-opacity': 0.7,
        'fill-outline-color': 'transparent'
      }
    });
    */
    
    // Add NDVI Tile Layer Source and Layer Definition
    map.addSource('ndvi-source', {
      type: 'raster',
      tiles: ['/tiles/ndvi/{z}/{x}/{y}.png'], // Assumes tiles are in /public/tiles/
      tileSize: 256,
      attribution: 'NDVI data source'
    });

    map.addLayer({
      id: 'ndvi-tiles',
      type: 'raster',
      source: 'ndvi-source',
      paint: {
        'raster-opacity': 0.6
      },
      layout: {
        visibility: 'none' // Initially hidden
      }
    });

    updateMapData();
  });
};

const clearMarkers = () => {
  if (!markerInstances.length) return;
  markerInstances.forEach(m => m.remove());
  markerInstances = [];
};

const addMarkers = () => {
  const dataSource = Array.isArray(props.markers) && props.markers.length ? props.markers : devices;
  if (!map || !dataSource) return;
  dataSource.forEach(markerInfo => {
    if (!Array.isArray(markerInfo.coordinates)) return;
    
    // 检查设备类型是否可见
    const deviceType = (markerInfo.type || 'soil').toLowerCase();
    if (!deviceTypeVisibility.value[deviceType]) return;
    
    const wrap = document.createElement('div');
    wrap.className = 'marker-wrap';

    const el = document.createElement('div');

    // Determine status class
    const rawStatus = (markerInfo.status ?? 'online').toString().toLowerCase();
    let statusClass = 'state-online';
    if (rawStatus.includes('alarm') || rawStatus.includes('告')) statusClass = 'state-alarm';
    else if (rawStatus.includes('off') || rawStatus.includes('离')) statusClass = 'state-offline';

    // Determine type class
    const type = (markerInfo.type || 'soil').toLowerCase();
    let typeClass = 'type-soil';
    if (type.includes('weather')) typeClass = 'type-weather';
    else if (type.includes('drone')) typeClass = 'type-drone';
    else if (type.includes('moth')) typeClass = 'type-moth';
    else if (type.includes('spore')) typeClass = 'type-spore';
    else if (type.includes('field')) typeClass = 'type-field';

    // 创建设备图标
    el.className = `device-marker ${typeClass} ${statusClass}`;
    
    // 添加设备图标
    const iconElement = document.createElement('i');
    iconElement.className = getDeviceIconClass(type);
    el.appendChild(iconElement);
    
    // 添加状态指示器
    const statusIndicator = document.createElement('div');
    statusIndicator.className = 'status-indicator';
    el.appendChild(statusIndicator);
    
    wrap.appendChild(el);

    const marker = new maplibregl.Marker({ element: wrap })
      .setLngLat(markerInfo.coordinates)
      .addTo(map);
      
    marker.getElement().addEventListener('click', (e) => {
      e.stopPropagation();
      // 显示设备详情面板
      selectedDevice.value = markerInfo;
      deviceDetailVisible.value = true;
      emit('marker-click', markerInfo);
    });
    markerInstances.push(marker);

    // streamlight every 5s for online devices
    if (statusClass === 'state-online') {
      const shineInterval = setInterval(() => {
        if (el && el.isConnected) {
          el.classList.add('marker-shine');
          setTimeout(() => el.classList.remove('marker-shine'), 1200);
        } else {
          // Clean up interval if marker is removed
          clearInterval(shineInterval);
        }
      }, 5000 + Math.random() * 1000);
    }

    // 巡飞无人机动态位置更新
    if (markerInfo.type === 'drone') {
      let t = 0;
      const move = () => {
        t += 0.0005;
        const [lng, lat] = markerInfo.coordinates;
        marker.setLngLat([lng + Math.sin(t)*0.01, lat + Math.cos(t)*0.01]);
        requestAnimationFrame(move);
      };
      move();
    }
  });
};

// 获取设备图标类名
const getDeviceIconClass = (type) => {
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

// 设备图例配置（更新为包含图标信息）
const deviceTypes = [
  { key: 'soil', name: '墒情传感器', visible: true, color: '#1DC788', icon: 'el-icon-monitor' },
  { key: 'weather', name: '气象监测站', visible: true, color: '#20DBFD', icon: 'el-icon-cloudy' },
  { key: 'field', name: '田间监测站', visible: true, color: '#FFAA00', icon: 'el-icon-crop' },
  { key: 'moth', name: '虫情测报仪', visible: true, color: '#731DC7', icon: 'el-icon-bug' },
  { key: 'spore', name: '孢子测报仪', visible: true, color: '#FF6B6B', icon: 'el-icon-microscope' },
  { key: 'drone', name: '巡飞无人机', visible: true, color: '#4ECDC4', icon: 'el-icon-plane' }
];

const updateMapData = () => {
  if (!map) return;
  // polygons
  if (props.geojson) {
    if (map.getSource('plots')) {
      map.getSource('plots').setData(props.geojson);
    } else {
      map.addSource('plots', { 
        type: 'geojson', 
        data: props.geojson,
        promoteId: 'id' // Use feature property 'id' as feature id
      });
      
      // Add a layer for the plot fills
      map.addLayer({
        id: 'plots-fill',
        type: 'fill',
        source: 'plots',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#00aaff', // 悬停时的颜色
            [
              'case',
              ['has', 'layerColor'],
              ['get', 'layerColor'],
              'rgba(0, 170, 255, 0.1)' // 默认颜色
            ]
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.3, // 悬停时的透明度
            0.6  // 默认透明度 - 提高透明度让颜色更明显
          ]
        }
      });
      
      // Add a layer for the plot outlines
      map.addLayer({
        id: 'plots-outline',
        type: 'line',
        source: 'plots',
        paint: {
          'line-color': '#00aaff',
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            2.5, // Line width when hovered
            1    // Default line width
          ],
          'line-opacity': 0.8
        }
      });

      // Click event to show popup
      map.on('click', 'plots-fill', (e) => {
        if (e.features.length > 0) {
          const feature = e.features[0];
          showPlotPopup(feature, e.lngLat);
        }
      });

      // Hover effect
      let hoveredPlotId = null;
      map.on('mousemove', 'plots-fill', (e) => {
        if (e.features.length > 0) {
          if (hoveredPlotId !== null) {
            map.setFeatureState(
              { source: 'plots', id: hoveredPlotId },
              { hover: false }
            );
          }
          hoveredPlotId = e.features[0].properties.id;
          map.setFeatureState(
            { source: 'plots', id: hoveredPlotId },
            { hover: true }
          );
          map.getCanvas().style.cursor = 'pointer';
        }
      });

      map.on('mouseleave', 'plots-fill', () => {
        if (hoveredPlotId !== null) {
          map.setFeatureState(
            { source: 'plots', id: hoveredPlotId },
            { hover: false }
          );
        }
        hoveredPlotId = null;
        map.getCanvas().style.cursor = '';
      });
    }
  }
  // dynamic layers
  if (props.layers) {
    for (const key in props.layers) {
      if (!map.getSource(key)) {
        const layer = props.layers[key];
        map.addSource(key, { type: 'geojson', data: layer.data });
        map.addLayer({ id: key, type: 'fill', source: key, paint: layer.paint, layout: { visibility: 'none' } });
      }
    }
  }
  
  // 添加灌溉系统图层
  if (!map.getSource('irrigation-system')) {
    map.addSource('irrigation-system', { 
      type: 'geojson', 
      data: irrigationSystem
    });
    
    map.addLayer({
      id: 'irrigation-lines',
      type: 'line',
      source: 'irrigation-system',
      paint: {
        'line-color': [
          'interpolate',
          ['linear'],
          ['get', 'capacity'],
          15, '#87CEEB',  // 浅蓝色 - 小流量
          25, '#4682B4',  // 钢蓝色 - 中等流量
          30, '#1E90FF',  // 道奇蓝 - 大流量
          50, '#0000CD'   // 深蓝色 - 最大流量
        ],
        'line-width': [
          'interpolate',
          ['linear'],
          ['get', 'capacity'],
          15, 2,   // 细线 - 小流量
          25, 3,   // 中等线 - 中等流量
          30, 4,   // 粗线 - 大流量
          50, 5    // 最粗线 - 最大流量
        ],
        'line-opacity': 0.9
      },
      layout: {
        visibility: 'none'
      }
    });
    
    // 添加河流阴影效果
    map.addLayer({
      id: 'irrigation-lines-shadow',
      type: 'line',
      source: 'irrigation-system',
      paint: {
        'line-color': '#000000',
        'line-width': [
          'interpolate',
          ['linear'],
          ['get', 'capacity'],
          15, 3,   // 阴影宽度
          25, 4,
          30, 5,
          50, 6
        ],
        'line-opacity': 0.3,
        'line-translate': [2, 2]  // 阴影偏移
      },
      layout: {
        visibility: 'none'
      }
    });
  }
  // markers
  clearMarkers();
  addMarkers();
};

const setLayerVisibility = (layerKey, visible) => {
  const config = allLayersConfig[layerKey];
  if (!config) return;

  switch (config.type) {
    case 'geojson':
      if (layerKey === 'plots') {
        if (map.getLayer('plots-fill')) map.setLayoutProperty('plots-fill', 'visibility', visible ? 'visible' : 'none');
        if (map.getLayer('plots-outline')) map.setLayoutProperty('plots-outline', 'visibility', visible ? 'visible' : 'none');
      } else if (layerKey === 'irrigation-system') {
        if (map.getLayer('irrigation-lines')) map.setLayoutProperty('irrigation-lines', 'visibility', visible ? 'visible' : 'none');
        if (map.getLayer('irrigation-lines-shadow')) map.setLayoutProperty('irrigation-lines-shadow', 'visibility', visible ? 'visible' : 'none');
      }
      break;
    case 'marker':
      visible ? addMarkers() : clearMarkers();
      break;
    case 'raster':
      if (map.getLayer(config.id)) map.setLayoutProperty(config.id, 'visibility', visible ? 'visible' : 'none');
      break;
    // Add other layer types here
  }
};

const toggleLayer = (layerKey) => {
  if (!map) return;
  const config = allLayersConfig[layerKey];
  if (!config) return;
  
  const isCurrentlyActive = activeLayers.value.includes(layerKey);
  
  if (isCurrentlyActive) {
    // 关闭图层
    setLayerVisibility(layerKey, false);
    activeLayers.value = activeLayers.value.filter(l => l !== layerKey);
    
    // 重置地块颜色为默认
    if (timeAxisLayers.includes(layerKey)) {
      resetPlotColors();
    }
  } else {
    // 开启图层
    if (config.exclusive) {
      // 如果是互斥图层，先关闭其他互斥图层
      activeLayers.value.forEach(existingLayer => {
        const existingConfig = allLayersConfig[existingLayer];
        if (existingConfig && existingConfig.exclusive) {
          setLayerVisibility(existingLayer, false);
        }
      });
      activeLayers.value = activeLayers.value.filter(l => {
        const existingConfig = allLayersConfig[l];
        return !existingConfig || !existingConfig.exclusive;
      });
    }
    
    setLayerVisibility(layerKey, true);
    activeLayers.value.push(layerKey);
    
      // 如果是需要时间轴的图层，更新地块颜色
  if (timeAxisLayers.includes(layerKey) && layerKey !== 'irrigation-system') {
    updatePlotColors(layerKey, selectedDate.value);
  }
  }
  
  // 检查是否需要显示时间轴
  timeSliderVisible.value = activeLayers.value.some(layer => timeAxisLayers.includes(layer));
};

const resetPlotColors = () => {
  if (!map || !props.geojson) return;
  
  const resetData = {
    ...props.geojson,
    features: props.geojson.features.map(feature => ({
      ...feature,
      properties: {
        ...feature.properties,
        layerColor: undefined
      }
    }))
  };
  
  map.getSource('plots').setData(resetData);
};

// This function is no longer needed as toggleLayer handles markers
// const toggleSensorLayer = () => {
//   sensorLayerVisible.value = !sensorLayerVisible.value;
//   clearMarkers();
//   if (sensorLayerVisible.value) addMarkers();
// };

const showPlotPopup = (feature, lngLat) => {
  const props = feature.properties;
  
  const getSoilQuality = (score) => {
    if (score > 90) return { text: '优', color: '#52c41a' };
    if (score > 70) return { text: '良', color: '#1890ff' };
    if (score > 50) return { text: '中', color: '#faad14' };
    return { text: '差', color: '#f5222d' };
  };
  const soilQuality = getSoilQuality(props.soilScore);

  const popupContent = `
    <div class="plot-popup-content">
      <div class="popup-header"><h3>${props.name}</h3></div>
      <div class="popup-body">
        <div class="info-row"><span>作物类型</span><span>${props.crop}</span></div>
        <div class="info-row"><span>面积</span><span>${props.areaMu} 亩</span></div>
        <div class="info-row">
          <span>地力指数</span>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${props.soilScore}%; background-color: ${soilQuality.color};"></div>
            <span class="progress-label">${props.soilScore} (${soilQuality.text})</span>
          </div>
        </div>
        <div class="info-row"><span>实时墒情</span><span class="moisture-value">${props.soilMoisture}%</span></div>
        <div class="info-row"><span>NDVI值</span><span class="ndvi-value">${props.ndvi}</span></div>
        <div class="info-row"><span>负责人</span><span>${props.owner}</span></div>
        <div class="info-row"><span>联系电话</span><span><a href="tel:${props.phone}">${props.phone}</a></span></div>
      </div>
      <div class="popup-footer">
        <button id="analysis-btn" class="analysis-btn">进入分析</button>
      </div>
    </div>
  `;

  const popup = new maplibregl.Popup({ 
      offset: 15, 
      className: 'plot-popup',
      closeButton: false
    })
    .setLngLat(lngLat)
    .setHTML(popupContent)
    .addTo(map);

  // Add click listener to the button after popup is created
  document.getElementById('analysis-btn').addEventListener('click', () => {
    emit('plot-analysis', feature);
    popup.remove();
  });
};

const flyTo = (options) => {
  if (map) map.flyTo(options);
};

defineExpose({
  flyTo,
});

onMounted(initializeMap);

onUnmounted(() => {
  if (map) {
    clearMarkers();
    map.remove();
    map = null;
  }
});

watch(() => props.markers, () => {
  if (activeLayers.value.includes('sensor-devices')) {
    clearMarkers();
    addMarkers();
  }
}, { deep: true });
</script>

<style>
.gis-map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
.map-container {
  width: 100%;
  height: 100%;
}

/* Radial mask overlay above the map, below UI controls */
.map-mask {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2; /* 高于底图，但低于控件/弹窗 */
  background: radial-gradient( ellipse at 50% 50%, rgba(13,27,28,0) 0%, rgba(13,27,28,0.04) 40%, rgba(13,27,28,0.7) 61%, rgba(13,27,28,1) 100%);
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

/* View Switcher */
.view-switcher {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
  background: rgba(10, 29, 61, 0.85);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  padding: 6px;
  z-index: 10;
  border: 1px solid rgba(0, 170, 255, 0.5);
  box-shadow: 0 0 12px rgba(0, 170, 255, 0.3);
}

.view-switcher button {
  padding: 8px 16px;
  border: 1px solid transparent;
  background-color: transparent;
  color: #a0a6b8;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.view-switcher button:hover {
  background-color: rgba(0, 170, 255, 0.2);
  color: #fff;
}

.view-switcher button.active {
  background-color: #00aaff;
  color: #fff;
  border-color: #00aaff;
  box-shadow: 0 0 8px rgba(0, 170, 255, 0.7);
}


/* 设备标记样式 */
.device-marker {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.device-marker i {
  font-size: 16px;
  color: #fff;
  z-index: 2;
}

/* 设备类型颜色 */
.device-marker.type-soil { background: #1DC788; }
.device-marker.type-weather { background: #20DBFD; }
.device-marker.type-drone { background: #4ECDC4; }
.device-marker.type-moth { background: #731DC7; }
.device-marker.type-spore { background: #FF6B6B; }
.device-marker.type-field { background: #FFAA00; }

/* 状态指示器 */
.status-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
}

.device-marker.state-online .status-indicator {
  background: #52c41a;
}

.device-marker.state-offline .status-indicator {
  background: #a0a6b8;
}

.device-marker.state-alarm .status-indicator {
  background: #ff4d4f;
  animation: pulse-red 1.4s infinite;
}

/* 悬停效果 */
.device-marker:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

/* 流光效果 */
.device-marker.marker-shine {
  animation: pulse-blue 1.2s ease-out;
}

@keyframes pulse-blue {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 170, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(0, 170, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 170, 255, 0);
  }
}

@keyframes pulse-red {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.8);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(255, 77, 79, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 77, 79, 0);
  }
}

.marker-popup { color: #e6e8eb; font-size: 12px; }
/* 确保弹窗在遮罩之上 */
::deep(.maplibregl-popup) {
  z-index: 5;
}
.maplibregl-ctrl-attrib-inner a { color: #ccc !important; }
.map-error { color: red; padding: 20px; text-align: center; }

/* Layer Control Panel */
.layer-control {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(10, 29, 61, 0.9);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  padding: 15px 20px;
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  gap: 10px;
  max-width: 80%; /* 限制最大宽度 */
  z-index: 10;
  border: 1px solid rgba(0, 170, 255, 0.5);
  box-shadow: 0 0 12px rgba(0, 170, 255, 0.3);
}

.layer-control-btn {
  padding: 8px 16px;
  border: 1px solid rgba(0, 170, 255, 0.4);
  background-color: transparent;
  color: #a0a6b8;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  white-space: nowrap; /* 防止文字换行 */
  flex-shrink: 0; /* 防止按钮被压缩 */
}

.layer-control-btn:hover {
  background-color: rgba(0, 170, 255, 0.2);
  color: #fff;
  border-color: rgba(0, 170, 255, 0.7);
}

.layer-control-btn.active {
  background-color: #00aaff;
  color: #fff;
  border-color: #00aaff;
  box-shadow: 0 0 8px rgba(0, 170, 255, 0.7);
}


/* Device Legend */
.device-legend {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
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

.legend-icon.type-soil { background: #1DC788; }
.legend-icon.type-weather { background: #20DBFD; }
.legend-icon.type-drone { background: #4ECDC4; }
.legend-icon.type-moth { background: #731DC7; }
.legend-icon.type-spore { background: #FF6B6B; }
.legend-icon.type-field { background: #FFAA00; }

.legend-text {
  color: #a0a6b8;
  font-size: 14px;
  white-space: nowrap;
}

/* Time Slider */
.time-slider {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
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

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  background: #00aaff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 15px rgba(0, 170, 255, 0.6);
  border: 3px solid #ffffff;
}

.slider-input::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: #00aaff;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid #ffffff;
  box-shadow: 0 0 15px rgba(0, 170, 255, 0.6);
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

/* Plot Popup Styles */
.plot-popup .maplibregl-popup-content {
  background: rgba(10, 29, 61, 0.9);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  border: 1px solid rgba(0, 170, 255, 0.5);
  box-shadow: 0 0 12px rgba(0, 170, 255, 0.3);
  padding: 0;
  width: 280px;
  color: #e6e8eb;
}

.plot-popup .maplibregl-popup-tip {
  border-top-color: rgba(0, 170, 255, 0.5);
}

.plot-popup-content {
  font-size: 12px;
}

.popup-header {
  padding: 10px 15px;
  border-bottom: 1px solid rgba(0, 170, 255, 0.3);
}

.popup-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.popup-body {
  padding: 15px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row span:first-child {
  color: #a0a6b8;
}

.moisture-value { color: #1890ff; font-weight: bold; }
.ndvi-value { color: #52c41a; font-weight: bold; }
.info-row a { color: #00aaff; text-decoration: none; }
.info-row a:hover { text-decoration: underline; }

.progress-bar-container {
  width: 120px;
  height: 16px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  position: relative;
  text-align: center;
}

.progress-bar {
  height: 100%;
  border-radius: 8px;
}

.progress-label {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  line-height: 16px;
  font-size: 10px;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.popup-footer {
  padding: 10px 15px;
  border-top: 1px solid rgba(0, 170, 255, 0.3);
}

.analysis-btn {
  width: 100%;
  padding: 8px;
  background-color: #00aaff;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.analysis-btn:hover {
  background-color: #0088cc;
}

/* Force hide attribution control completely */
:deep(.maplibregl-ctrl-attrib) {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
}

:deep(.maplibregl-ctrl-attrib-inner),
:deep(.maplibregl-ctrl-attrib-button),
:deep(.maplibregl-ctrl-attrib.maplibregl-compact),
:deep(.maplibregl-ctrl-attrib.maplibregl-compact .maplibregl-ctrl-attrib-inner) {
  display: none !important;
  visibility: hidden !important;
}
</style> 