<template>
  <div class="analysis-explanation">
    <el-link type="primary" :underline="false" @click="toggle" class="toggle-link">
      <el-icon><CaretRight v-if="!open" /><CaretBottom v-else /></el-icon>
      {{ open ? '隐藏分析思考过程' : '查看分析思考过程' }}
    </el-link>

    <el-collapse-transition>
      <div v-show="open" class="explanation-content" v-html="rendered" />
    </el-collapse-transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { CaretRight, CaretBottom } from '@element-plus/icons-vue';
import { marked } from 'marked';

const props = defineProps({
  explanation: { type: String, required: true }
});

const open = ref(false);
const toggle = () => (open.value = !open.value);

const rendered = computed(() => marked.parse(props.explanation || ''));
</script>

<style scoped lang="scss">
.analysis-explanation {
  margin-top: 10px;

  .toggle-link {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
  }

  .explanation-content {
    margin-top: 8px;
    padding: 8px 12px;
    background: rgba(0, 170, 255, 0.05);
    border-left: 3px solid #00aaff;
    border-radius: 4px;
    color: var(--color-text);
    font-size: 13px;
    line-height: 1.6;
    max-height: 260px;
    overflow-y: auto;
  }
}
</style>
