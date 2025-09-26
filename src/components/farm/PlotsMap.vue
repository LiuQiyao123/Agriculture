<template>
  <div class="plots-map">
    <BaseMap
      ref="baseMapRef"
      :layers="plotLayers"
      @map-load="handleMapLoad"
      @feature-clicked="handleFeatureClicked"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import BaseMap from '@/components/map/BaseMap.vue';

const props = defineProps({
  plots: {
    type: Array,
    default: () => []
  },
  selectedPlotId: {
    type: String,
    default: null
  },
  hoveredPlotId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['plot-clicked', 'plot-hover', 'plot-unhover']);

const baseMapRef = ref();

// 将地块数据转换为 BaseMap 需要的 layers 格式
const plotLayers = computed(() => {
  if (!props.plots || props.plots.length === 0) return {};

  const features = props.plots.map(plot => ({
    type: 'Feature',
    properties: {
      id: plot.id,
      ...plot.properties
    },
    geometry: plot.geometry
  }));

  return {
    plots: {
      data: {
        type: 'FeatureCollection',
        features: features
      },
      type: 'fill',
      paint: {
        'fill-color': [
          'case',
          ['==', ['get', 'id'], props.selectedPlotId], '#ff6b6b',
          ['==', ['get', 'id'], props.hoveredPlotId], '#4ecdc4',
          '#007cbf'
        ],
        'fill-opacity': 0.3
      }
    },
    'plots-stroke': {
      data: {
        type: 'FeatureCollection',
        features: features
      },
      type: 'line',
      paint: {
        'line-color': [
          'case',
          ['==', ['get', 'id'], props.selectedPlotId], '#ff6b6b',
          ['==', ['get', 'id'], props.hoveredPlotId], '#4ecdc4',
          '#007cbf'
        ],
        'line-width': 2
      }
    }
  };
});

const handleMapLoad = (map) => {
  // 地图加载完成后的处理
  if (props.plots.length > 0) {
    // 自动调整视图到所有地块
    const bounds = new map.LngLatBounds();
    props.plots.forEach(plot => {
      if (plot.geometry && plot.geometry.type === 'Polygon') {
        plot.geometry.coordinates[0].forEach(coord => {
          bounds.extend(coord);
        });
      }
    });
    map.fitBounds(bounds, { padding: 50 });
  }
};

const handleFeatureClicked = (data) => {
  if (data.layerId === 'plots' && data.feature) {
    emit('plot-clicked', data.feature.properties.id);
  }
};

const flyToPlot = (plotId) => {
  if (!baseMapRef.value || !baseMapRef.value.map) {
    console.log('Map not ready');
    return;
  }
  
  const plot = props.plots.find(p => p.id === plotId);
  if (!plot || !plot.geometry || plot.geometry.type !== 'Polygon') {
    console.log('Plot not found or invalid geometry');
    return;
  }

  // 计算地块中心点
  const coordinates = plot.geometry.coordinates[0];
  let lngSum = 0, latSum = 0;
  coordinates.forEach(coord => {
    lngSum += coord[0];
    latSum += coord[1];
  });
  
  const center = [lngSum / coordinates.length, latSum / coordinates.length];
  
  // 使用 flyTo 飞到中心点
  baseMapRef.value.flyTo({
    center: center,
    zoom: 15,
    duration: 1000
  });
};

// 监听选中地块变化
watch(() => props.selectedPlotId, (newId) => {
  if (newId) {
    nextTick(() => {
      flyToPlot(newId);
    });
  }
});

const resizeMap = () => {
  if (baseMapRef.value) {
    baseMapRef.value.resize();
  }
};

defineExpose({
  flyToPlot,
  resizeMap
});
</script>

<style scoped lang="scss">
.plots-map {
  width: 100%;
  height: 100%;
}
</style>
