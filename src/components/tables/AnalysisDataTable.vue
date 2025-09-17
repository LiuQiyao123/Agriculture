<template>
  <DataPanel :title="title">
    <el-table
      ref="tableInstance"
      :data="data"
      style="width: 100%"
      height="100%"
      class="dark-table"
      highlight-current-row
      v-bind="$attrs"
    >
      <slot></slot>
    </el-table>
  </DataPanel>
</template>

<script setup>
import { ref } from 'vue';
import DataPanel from '@/components/DataPanel.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
});

const tableInstance = ref(null);

const setCurrentRow = (row) => {
  if (tableInstance.value) {
    tableInstance.value.setCurrentRow(row);
  }
};

defineExpose({
  setCurrentRow,
});

defineOptions({
  inheritAttrs: false,
});
</script>
