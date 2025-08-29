<template>
  <div class="gis-map-wrapper">
    <div ref="mapContainer" class="map-container"></div>

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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import devices from '../mock/devices.json';
// import { generateChlorophyllGrid, chlorophyllColorScale } from '../mock/gis.js'; // Heatmap feature disabled for now

const props = defineProps({
  geojson: Object,
  markers: Array,
  layers: Object,
});

const emit = defineEmits(['marker-click', 'plot-analysis']);
const mapContainer = ref(null);
let map = null;

// --- Centralized Layer and View Configuration ---
const allLayersConfig = {
  'plots': { id: 'plots', name: '地块边界', type: 'geojson', defaultVisibility: true },
  'sensor-devices': { id: 'sensor-devices', name: '在线设备', type: 'marker', defaultVisibility: true },
  'ndvi-tiles': { id: 'ndvi-tiles', name: 'NDVI 热力图', type: 'raster', defaultVisibility: false },
};

const views = {
  production: {
    id: 'production',
    name: '农业生产视图',
    layers: ['plots', 'sensor-devices', 'ndvi-tiles'],
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
    zoom: 6.5, // Zoom level to show the whole province
    pitch: 45,
    bearing: -17.6,
    antialias: true,
    attributionControl: { compact: true },
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

    el.className = `custom-marker ${typeClass} ${statusClass}`;
    wrap.appendChild(el);

    const marker = new maplibregl.Marker({ element: wrap })
      .setLngLat(markerInfo.coordinates)
      .setPopup(new maplibregl.Popup({ offset: 16 }).setHTML(`<div class="marker-popup"><div><strong>${markerInfo.name || markerInfo.id || '设备'}</strong></div><div>${markerInfo.type || ''}</div><div>状态: ${markerInfo.status || '在线'}</div>${markerInfo.lastSeen ? `<div>上报: ${markerInfo.lastSeen}</div>` : ''}</div>`))
      .addTo(map);
    marker.getElement().addEventListener('click', (e) => {
      e.stopPropagation();
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

    // basic drone movement simulation
    if (markerInfo.type === 'drone' || markerInfo.type === 'satellite') {
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
          'fill-color': '#00aaff', // Set fill color for hover effect
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.3, // Opacity when hovered
            0    // Fully transparent by default
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
  // markers
  clearMarkers();
  addMarkers();
};

const setLayerVisibility = (layerKey, visible) => {
  const config = allLayersConfig[layerKey];
  if (!config) return;

  switch (config.type) {
    case 'geojson':
      if (map.getLayer('plots-fill')) map.setLayoutProperty('plots-fill', 'visibility', visible ? 'visible' : 'none');
      if (map.getLayer('plots-outline')) map.setLayoutProperty('plots-outline', 'visibility', visible ? 'visible' : 'none');
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
  const isCurrentlyActive = activeLayers.value.includes(layerKey);
  setLayerVisibility(layerKey, !isCurrentlyActive);
  
  if (isCurrentlyActive) {
    activeLayers.value = activeLayers.value.filter(l => l !== layerKey);
  } else {
    activeLayers.value.push(layerKey);
  }
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


/* 水滴式 Marker  */
/* 统一尺寸与颜色变量，方便后期调整 */
.custom-marker{
  --size : 36px;            /* 圆直径 */
  --dot  : 12px;            /* 内白点直径 */
  --clr  : #00aaff;         /* 主色 */

  width: var(--size);
  height: var(--size);
  background: var(--clr, #00aaff);
  border-radius:50%;
  position:relative;
  cursor:pointer;
  box-shadow:0 0 8px rgba(0,170,255,.9);
}

/* 内部白点 */
.custom-marker::before{
  content:'';
  position:absolute;
  width:var(--dot);
  height:var(--dot);
  background:#fff;
  border-radius:50%;
  left:50%;top:50%;
  transform:translate(-50%,-50%);
}

/* 正下方等腰三角尖 */
.custom-marker::after{
  content:'';
  position:absolute;
  left:50%;
  top:calc(100% - 6px);                 /* 紧贴圆底 */
  transform:translateX(-50%);
  width:0;height:0;
  border-left: calc(var(--size)*0.42) solid transparent;
  border-right:calc(var(--size)*0.42) solid transparent;
  border-top: calc(var(--size)*0.55) solid var(--clr, #00aaff);
  filter:drop-shadow(0 0 4px rgba(0,170,255,.8));
}

/* Colors by Device Type */
.type-soil    { --clr:#1DC788; background: #1DC788; }
.type-weather { --clr:#20DBFD; background: #20DBFD; }
.type-drone   { --clr:#FFAA00; background: #FFAA00; }
.type-moth    { --clr:#731DC7; background: #731DC7; }

/* Styles by Device Status */
.state-offline {
  opacity: 0.4;
}
.state-alarm {
  animation: pulse-red 1.4s infinite;
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

/* Streamlight for online devices (JS adds/removes this class) */
.marker-shine {
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

.marker-popup { color: #e6e8eb; font-size: 12px; }
.maplibregl-ctrl-attrib-inner a { color: #ccc !important; }
.map-error { color: red; padding: 20px; text-align: center; }

/* Layer Control Panel */
.layer-control {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(10, 29, 61, 0.85);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  padding: 10px 20px;
  display: flex;
  gap: 15px;
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


.layer-item :deep(.el-checkbox__label) {
  color: #e6e8eb;
}

.layer-item :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #00aaff;
  border-color: #00aaff;
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