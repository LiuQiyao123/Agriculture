<template>
  <div class="recommendation-card" :class="{ 'is-recommended': recommended }">
    <div class="card-header">
      <h4 class="recommendation-title">{{ recommendation.title }}</h4>
      <el-tag v-if="recommended" type="danger">AI推荐</el-tag>
    </div>
    <div class="card-body">
      <ul>
        <li v-for="item in recommendation.details" :key="item.label">
          <span class="detail-label">{{ item.label }}:</span>
          <span class="detail-value">{{ item.value }}</span>
        </li>
      </ul>
    </div>
    <div class="card-footer">
      <el-button type="primary" plain @click="selectScheme">选择此方案</el-button>
      <el-button link @click="viewDetails">查看详情</el-button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  recommendation: {
    type: Object,
    required: true,
    default: () => ({
      title: '默认方案',
      details: [
        { label: '预估产量', value: '1000公斤/亩' },
        { label: '预估利润', value: '¥5000/亩' },
        { label: '风险评级', value: '低' },
      ]
    })
  },
  recommended: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select', 'details']);

const selectScheme = () => {
  emit('select', props.recommendation);
};

const viewDetails = () => {
  emit('details', props.recommendation);
};
</script>

<style scoped>
.recommendation-card {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.recommendation-card.is-recommended {
  border-color: #f56c6c;
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.recommendation-title {
  margin: 0;
  font-size: 18px;
}

.card-body ul {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.card-body li {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 14px;
}

.detail-label {
  color: #606266;
}

.detail-value {
  color: #303133;
  font-weight: bold;
}

.card-footer {
  text-align: right;
}
</style>
