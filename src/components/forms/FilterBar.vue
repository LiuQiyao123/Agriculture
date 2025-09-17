<template>
  <el-form :inline="true" :model="internalValue" @submit.prevent>
    <el-form-item
      v-for="field in fields"
      :key="field.model"
      :label="field.label"
      :style="getFieldCustomStyle(field)"
    >
      <el-select
        v-if="field.type === 'select'"
        v-model="internalValue[field.model]"
        :placeholder="field.placeholder || '请选择'"
        clearable
      >
        <el-option
          v-for="option in field.options"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>

      <el-cascader
        v-else-if="field.type === 'cascader'"
        v-model="internalValue[field.model]"
        :options="field.options"
        :placeholder="field.placeholder || '请选择'"
        clearable
      />

      <el-input
        v-else
        v-model="internalValue[field.model]"
        :placeholder="field.placeholder || '请输入'"
        clearable
      />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  fields: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const internalValue = ref({ ...props.modelValue });

watch(internalValue, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });

watch(() => props.modelValue, (newValue) => {
  internalValue.value = { ...newValue };
}, { deep: true });

const getFieldCustomStyle = (field) => ({
  '--filter-item-width': field.width || '180px',
});
</script>

<style scoped lang="scss">
.el-form-item {
  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-cascader) {
    width: var(--filter-item-width);
  }
}
</style>
