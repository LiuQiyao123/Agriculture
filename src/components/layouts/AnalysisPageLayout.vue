<template>
  <div class="page-container">
    <h1 class="page-title">
      <slot name="title"></slot>
    </h1>
    <div class="analysis-container">
      <div class="filter-bar">
        <slot name="filter-bar"></slot>
      </div>
      <div class="main-content-grid">
        <div class="grid-main">
          <div class="grid-map">
            <slot name="map"></slot>
          </div>
          <div class="grid-table">
            <slot name="table"></slot>
          </div>
        </div>
        <div class="grid-sidebar">
          <slot name="ai-panels"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// This component is purely for layout and slots, so no script logic is needed.
</script>

<style scoped lang="scss">
@use '@/styles/analysis-layout.scss';
</style>
