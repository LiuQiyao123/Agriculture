<template>
  <div class="search-filter-bar">
    <!-- 搜索框 -->
    <div class="search-section" v-if="showSearch">
      <el-input
        v-model="searchValue"
        :placeholder="searchPlaceholder"
        :prefix-icon="Search"
        clearable
        class="search-input"
      />
    </div>
    
    <!-- 筛选器 -->
    <div class="filter-section">
      <el-form :inline="true" :model="internalValue" @submit.prevent class="filter-form">
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
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  fields: {
    type: Array,
    required: true,
  },
  // 搜索相关属性
  showSearch: {
    type: Boolean,
    default: false
  },
  searchPlaceholder: {
    type: String,
    default: '请输入搜索关键词'
  },
  searchValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'update:searchValue']);

const internalValue = ref({ ...props.modelValue });
const searchValue = ref(props.searchValue);

watch(internalValue, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });

watch(searchValue, (newValue) => {
  emit('update:searchValue', newValue);
});

watch(() => props.modelValue, (newValue) => {
  internalValue.value = { ...newValue };
}, { deep: true });

watch(() => props.searchValue, (newValue) => {
  searchValue.value = newValue;
});

const getFieldCustomStyle = (field) => ({
  '--filter-item-width': field.width || '180px',
});
</script>

<style scoped lang="scss">
.search-filter-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0,170,255,.15);
  background: rgba(0,170,255,.02);
  gap: 20px;
  margin-bottom: 0;
  
  .search-section {
    flex-shrink: 0;
    .search-input {
      width: 280px;
    }
  }
  
  .filter-section {
    flex-shrink: 0;
    
    .filter-form {
      margin: 0;
      
      .el-form-item {
        margin-bottom: 0;
        margin-right: 16px;
        
        &:last-child {
          margin-right: 0;
        }
        
        :deep(.el-form-item__label) {
          color: #ecf0f1;
          font-weight: 500;
        }
        
        :deep(.el-input),
        :deep(.el-select),
        :deep(.el-cascader) {
          width: var(--filter-item-width);
          
          .el-input__wrapper {
            background-color: rgba(255, 255, 255, 0.1);
            border-color: rgba(0, 170, 255, 0.3);
            
            &:hover {
              border-color: rgba(0, 170, 255, 0.5);
            }
            
            &.is-focus {
              border-color: #00aaff;
            }
          }
          
          .el-input__inner {
            color: #ecf0f1;
            
            &::placeholder {
              color: rgba(236, 240, 241, 0.6);
            }
          }
        }
      }
    }
  }
}
</style>
