<template>
  <div ref="mapContainer" class="base-map-container"></div>
</template>

<script setup>
import { shallowRef, ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as pmtiles from 'pmtiles';

// Initialize PMTiles protocol
let protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

const props = defineProps({
  layers: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['map-loaded', 'feature-clicked']);

const mapContainer = shallowRef(null);
const map = shallowRef(null);

const initializeMap = () => {
  if (!mapContainer.value) return;
  const apiKey = import.meta.env.VITE_MAPTILER_KEY;
  if (!apiKey || apiKey === 'YOUR_MAPTILER_API_KEY_HERE') {
    mapContainer.value.innerHTML = '<div class="map-error">Maptiler API Key缺失，请在.env文件中设置VITE_MAPTILER_KEY</div>';
    return;
  }
  
  const style = `https://api.maptiler.com/maps/0198e427-ec93-788c-a9fd-1f109fdac61f/style.json?key=${apiKey}`;

  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: style,
    center: [118.5, 36.5],
    zoom: 7.2,
    pitch: 0,
    bearing: 0,
    antialias: true,
    attributionControl: false,
  });

  map.value.on('load', () => {
    updateLayers(props.layers);
    emit('map-loaded', map.value);
  });
};

const updateLayers = (newLayers) => {
  if (!map.value || !map.value.isStyleLoaded()) return;

  const currentSources = map.value.getStyle().sources;
  const currentLayers = map.value.getStyle().layers.map(l => l.id);

  Object.keys(newLayers).forEach(layerId => {
    const layerConfig = newLayers[layerId];
    if (!layerConfig || !layerConfig.data) return;

    if (!currentSources[layerId]) {
      map.value.addSource(layerId, {
        type: 'geojson',
        data: layerConfig.data,
        ...layerConfig.sourceOptions,
      });
    } else {
      map.value.getSource(layerId).setData(layerConfig.data);
    }
    
    if (!currentLayers.includes(layerId)) {
      map.value.addLayer({
        id: layerId,
        source: layerId,
        type: layerConfig.type || 'fill',
        paint: layerConfig.paint || {},
        layout: layerConfig.layout || {},
      });

      map.value.on('click', layerId, (e) => {
        if (e.features && e.features.length > 0) {
          emit('feature-clicked', { layerId, feature: e.features[0], lngLat: e.lngLat });
        }
      });
       map.value.on('mouseenter', layerId, () => map.value.getCanvas().style.cursor = 'pointer');
       map.value.on('mouseleave', layerId, () => map.value.getCanvas().style.cursor = '');
    }
  });
};


watch(() => props.layers, (newVal) => {
  updateLayers(newVal);
}, { deep: true });

onMounted(initializeMap);

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});

const flyTo = (options) => {
  if (map.value) map.value.flyTo(options);
};

defineExpose({
  map,
  flyTo
});

</script>

<style scoped>
.base-map-container {
  width: 100%;
  height: 100%;
}
.map-error {
  color: red;
  padding: 20px;
  text-align: center;
}
</style>
