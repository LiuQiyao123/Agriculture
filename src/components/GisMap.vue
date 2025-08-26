<template>
  <div class="gis-map-wrapper">
    <div ref="mapContainer" class="map-container"></div>
    <div class="layer-control">
      <div class="layer-item">
        <el-checkbox :model-value="sensorLayerVisible" label="传感器点" @change="toggleSensorLayer" />
      </div>
      <div v-if="layers">
        <div v-for="(layer, key) in layers" :key="key" class="layer-item">
          <el-checkbox
            :model-value="activeLayers.includes(key)"
            :label="layer.name"
            @change="toggleLayer(key)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const props = defineProps({
  geojson: Object,
  markers: Array,
  layers: Object,
});

const emit = defineEmits(['marker-click']);
const mapContainer = ref(null);
let map = null;
const activeLayers = ref([]);
const sensorLayerVisible = ref(true);
let markerInstances = [];

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
    center: [116.397, 39.916],
    zoom: 9,
    pitch: 45,
  });

  map.on('load', () => {
    updateMapData();
  });
};

const clearMarkers = () => {
  if (!markerInstances.length) return;
  markerInstances.forEach(m => m.remove());
  markerInstances = [];
};

const addMarkers = () => {
  if (!map || !props.markers || !sensorLayerVisible.value) return;
  props.markers.forEach(markerInfo => {
    if (!Array.isArray(markerInfo.coordinates)) return;
    const el = document.createElement('div');
    const raw = (markerInfo.status ?? 'online').toString();
    const s = raw.toLowerCase();
    let status = 'online';
    if (s.includes('alarm') || raw.includes('告')) status = 'alarm';
    else if (s.includes('off') || raw.includes('离')) status = 'offline';
    else if (raw.includes('正') || raw.includes('在') || s.includes('on')) status = 'online';
    el.className = `custom-marker marker-${status}`;
    el.title = `${markerInfo.name || markerInfo.id || ''} ${markerInfo.type || ''}\n状态: ${markerInfo.status || '在线'}${markerInfo.lastSeen ? `\n上报: ${markerInfo.lastSeen}` : ''}`;
    const marker = new maplibregl.Marker(el)
      .setLngLat(markerInfo.coordinates)
      .setPopup(new maplibregl.Popup({ offset: 16 }).setHTML(`<div class="marker-popup"><div><strong>${markerInfo.name || markerInfo.id || '设备'}</strong></div><div>${markerInfo.type || ''}</div><div>状态: ${markerInfo.status || '在线'}</div>${markerInfo.lastSeen ? `<div>上报: ${markerInfo.lastSeen}</div>` : ''}</div>`))
      .addTo(map);
    marker.getElement().addEventListener('click', (e) => {
      e.stopPropagation();
      emit('marker-click', markerInfo);
    });
    markerInstances.push(marker);
  });
};

const updateMapData = () => {
  if (!map) return;
  // polygons
  if (props.geojson) {
    if (map.getSource('plots')) map.getSource('plots').setData(props.geojson);
    else {
      map.addSource('plots', { type: 'geojson', data: props.geojson });
      map.addLayer({ id: 'plots-fill', type: 'fill', source: 'plots', paint: { 'fill-color': '#00ff7f', 'fill-opacity': 0.5 } });
      map.addLayer({ id: 'plots-outline', type: 'line', source: 'plots', paint: { 'line-color': '#00aaff', 'line-width': 2 } });
    }
  }
  // dynamic layers
  if (props.layers) {
    for (const key in props.layers) {
      if (!map.getSource(key)) {
        const layer = props.layers[key];
        map.addSource(key, { type: 'fill', data: layer.data });
        map.addLayer({ id: key, type: 'fill', source: key, paint: layer.paint, layout: { visibility: 'none' } });
      }
    }
  }
  // markers
  clearMarkers();
  addMarkers();
};

const toggleLayer = (layerKey) => {
  if (!map) return;
  const visibility = map.getLayoutProperty(layerKey, 'visibility') === 'visible' ? 'none' : 'visible';
  map.setLayoutProperty(layerKey, 'visibility', visibility);
  if (visibility === 'visible') activeLayers.value.push(layerKey);
  else activeLayers.value = activeLayers.value.filter(l => l !== layerKey);
};

const toggleSensorLayer = () => {
  sensorLayerVisible.value = !sensorLayerVisible.value;
  clearMarkers();
  if (sensorLayerVisible.value) addMarkers();
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
  clearMarkers();
  addMarkers();
}, { deep: true });

watch(sensorLayerVisible, (v) => {
  if (!v) clearMarkers();
});
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
/* marker styles */
.custom-marker {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(0, 170, 255, 0.6);
  background: #00ff7f; /* default visible color to avoid transparent markers */
}
.marker-online { background: #00ff7f; }
.marker-offline { background: #667085; box-shadow: 0 0 6px rgba(102,112,133,.4); }
.marker-alarm { background: #ff4d4f; animation: pulse 1.4s infinite; box-shadow: 0 0 10px rgba(255,77,79,.8); }
@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.25); } 100% { transform: scale(1); } }

.marker-popup { color: #e6e8eb; font-size: 12px; }

.layer-control {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(21, 38, 62, 0.8);
  padding: 10px;
  border-radius: 4px;
  border: 1px solid rgba(0, 170, 255, 0.3);
}
.layer-item .el-checkbox { color: #fff; }
.maplibregl-ctrl-attrib-inner a { color: #ccc !important; }
.map-error { color: red; padding: 20px; text-align: center; }
</style> 