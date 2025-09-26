<template>
  <div class="plot-map">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const props = defineProps({
  plot: {
    type: Object,
    required: true
  }
});

const mapContainer = ref();
let map = null;

const initMap = () => {
  if (!mapContainer.value) return;
  
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: {
        'raster-tiles': {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        }
      },
      layers: [
        {
          id: 'simple-tiles',
          type: 'raster',
          source: 'raster-tiles',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    },
    center: [117.0, 36.6],
    zoom: 10
  });

  // Add plot marker
  if (props.plot.geometry && props.plot.geometry.coordinates) {
    const coordinates = props.plot.geometry.coordinates[0][0];
    const center = [
      coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length,
      coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length
    ];

    new maplibregl.Marker()
      .setLngLat(center)
      .addTo(map);

    // Add plot polygon
    map.on('load', () => {
      map.addSource('plot', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [props.plot]
        }
      });

      map.addLayer({
        id: 'plot-fill',
        type: 'fill',
        source: 'plot',
        paint: {
          'fill-color': '#007cbf',
          'fill-opacity': 0.3
        }
      });

      map.addLayer({
        id: 'plot-stroke',
        type: 'line',
        source: 'plot',
        paint: {
          'line-color': '#007cbf',
          'line-width': 2
        }
      });
    });
  }
};

onMounted(() => {
  nextTick(() => {
    initMap();
  });
});

onUnmounted(() => {
  if (map) {
    map.remove();
  }
});

watch(() => props.plot, () => {
  if (map) {
    map.remove();
    nextTick(() => {
      initMap();
    });
  }
}, { deep: true });
</script>

<style scoped lang="scss">
.plot-map {
  width: 100%;
  height: 100%;
}

.map-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>

