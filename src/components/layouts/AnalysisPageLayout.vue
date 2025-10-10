<template>
  <div class="page-container page-grid">
    <h1 class="page-title">
      <slot name="title"></slot>
    </h1>
    <div class="filter-bar" style="grid-column: span 2;">
      <slot name="filter-bar"></slot>
    </div>
    <div class="grid-map">
      <slot name="map"></slot>
    </div>
    <div class="grid-table">
      <slot name="table"></slot>
    </div>
    <div class="grid-sidebar">
      <slot name="ai-panels"></slot>
    </div>
  </div>
</template>

<script setup>
// This component is purely for layout and slots, so no script logic is needed.
</script>

<style scoped lang="scss">
@use '@/styles/analysis-layout.scss';
</style>
