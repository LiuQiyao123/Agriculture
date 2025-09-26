<template>
  <div class="page-title">
    <h1 class="title">{{ title }}</h1>
    <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
});
</script>

<style scoped lang="scss">
.page-title {
  margin-bottom: 24px;
  
  .title {
    font-size: 24px;
    font-weight: 600;
    color: #ffffff; // 改为白色
    margin: 0 0 8px 0;
    line-height: 1.2;
  }
  
  .subtitle {
    font-size: 14px;
    color: #e0e0e0; // 改为浅白色
    margin: 0;
    line-height: 1.4;
  }
}
</style>
