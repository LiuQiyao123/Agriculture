<template>
  <div class="layer-control">
    <button
      v-for="layer in layers"
      :key="layer.id"
      class="layer-control-btn"
      :class="{ active: activeLayers.includes(layer.id) }"
      @click="() => toggleLayer(layer.id)"
    >
      {{ layer.name }}
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  layers: {
    type: Array,
    default: () => [] // e.g., [{ id: 'plots', name: '地块', exclusive: false, defaultVisibility: true }]
  },
  initialActiveLayers: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['layer-visibility-changed']);

const activeLayers = ref([...props.initialActiveLayers]);

const toggleLayer = (layerId) => {
  const layerConfig = props.layers.find(l => l.id === layerId);
  if (!layerConfig) return;

  const isCurrentlyActive = activeLayers.value.includes(layerId);

  if (isCurrentlyActive) {
    activeLayers.value = activeLayers.value.filter(l => l !== layerId);
  } else {
    if (layerConfig.exclusive) {
      // Deactivate all other exclusive layers
      const otherExclusiveLayers = props.layers
        .filter(l => l.exclusive && l.id !== layerId)
        .map(l => l.id);
      
      activeLayers.value = activeLayers.value.filter(l => !otherExclusiveLayers.includes(l));
    }
    activeLayers.value.push(layerId);
  }
};

watch(activeLayers, (newActive, oldActive) => {
  const allLayerIds = props.layers.map(l => l.id);
  allLayerIds.forEach(layerId => {
    const isVisible = newActive.includes(layerId);
    // Emit for every layer to ensure parent can update map visibility
    emit('layer-visibility-changed', { layerId, visible: isVisible });
  });
}, { immediate: true });

</script>

<style scoped>
.layer-control {
  background: rgba(10, 29, 61, 0.9);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  padding: 15px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 80%;
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
  white-space: nowrap;
  flex-shrink: 0;
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
</style>
