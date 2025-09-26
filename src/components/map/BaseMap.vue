<template>
  <div ref="mapContainer" class="basemap-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import * as pmtiles from 'pmtiles';

// Initialize PMTiles protocol
let protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

const props = defineProps({
  layers: {
    type: Object,
    default: () => ({})
  },
  drawControls: {
    type: Boolean,
    default: false,
  },
  drawOptions: {
    type: Object,
    default: () => ({}),
  }
});

const emit = defineEmits(['map-load', 'feature-clicked', 'draw-create', 'draw-update', 'draw-delete']);

const mapContainer = ref(null);
let map = ref(null);
let draw = ref(null);

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
    emit('map-load', map.value);
    
    if (props.drawControls) {
      initializeDraw();
    }
  });
};

const updateLayers = (newLayers, prevLayers = {}) => {
  if (!map.value || !map.value.isStyleLoaded()) return;

  const currentSourceIds = Object.keys(map.value.getStyle().sources);
  const currentLayerIds = map.value.getStyle().layers.map(l => l.id);

  // Remove layers that are no longer in props
  Object.keys(prevLayers).forEach(layerId => {
    if (!newLayers[layerId]) {
      if (currentLayerIds.includes(layerId)) {
        map.value.removeLayer(layerId);
      }
      if (currentSourceIds.includes(layerId)) {
        map.value.removeSource(layerId);
      }
    }
  });

  Object.keys(newLayers).forEach(layerId => {
    const layerConfig = newLayers[layerId];
    if (!layerConfig || !layerConfig.data || !layerConfig.data.features) return;

    const source = map.value.getSource(layerId);
    if (source) {
      source.setData(layerConfig.data);
    } else {
      map.value.addSource(layerId, {
        type: 'geojson',
        data: layerConfig.data,
        ...layerConfig.sourceOptions,
      });
    }
    
    const existingLayer = map.value.getLayer(layerId);
    if (existingLayer) {
      // If layer exists, just update its paint properties
      if (layerConfig.paint) {
        Object.keys(layerConfig.paint).forEach(paintProperty => {
          map.value.setPaintProperty(layerId, paintProperty, layerConfig.paint[paintProperty]);
        });
      }
    } else {
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

const initializeDraw = () => {
  if (draw.value) return; // aleeady initialized

  const defaultDrawOptions = {
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: true,
    },
    ...props.drawOptions,
  };

  draw.value = new MapboxDraw(defaultDrawOptions);
  map.value.addControl(draw.value, 'top-right');

  map.value.on('draw.create', (e) => emit('draw-create', e));
  map.value.on('draw.update', (e) => emit('draw-update', e));
  map.value.on('draw.delete', (e) => emit('draw-delete', e));
};

const removeDraw = () => {
  if (draw.value && map.value) {
    map.value.removeControl(draw.value);
    draw.value = null;
  }
};

watch(() => props.drawControls, (newVal) => {
  if (map.value && map.value.isStyleLoaded()) {
    if (newVal) {
      initializeDraw();
    } else {
      removeDraw();
    }
  }
});

watch(() => props.layers, (newVal, oldVal) => {
  if (map.value && map.value.isStyleLoaded()) {
    updateLayers(newVal, oldVal);
  } else if (map.value) {
    map.value.once('load', () => updateLayers(newVal, oldVal));
  }
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
  flyTo,
  draw,
});

</script>

<style scoped>
.basemap-container {
  width: 100%;
  height: 100%;
}
.map-error {
  color: red;
  padding: 20px;
  text-align: center;
}
</style>
