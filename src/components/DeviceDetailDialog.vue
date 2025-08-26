<template>
  <el-dialog
    :model-value="visible"
    title="设备详情"
    width="500px"
    @update:model-value="$emit('update:visible', false)"
  >
    <el-descriptions v-if="device" :column="2" border>
      <el-descriptions-item label="设备ID">{{ device.id }}</el-descriptions-item>
      <el-descriptions-item label="设备类型">{{ device.type }}</el-descriptions-item>
      <el-descriptions-item label="所属乡镇">{{ device.town }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusTagType(device.status)">{{ device.status }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="电量(%)">{{ device.battery }}</el-descriptions-item>
      <el-descriptions-item label="最后上报时间">{{ device.lastReport }}</el-descriptions-item>
      <el-descriptions-item label="经度">{{ device.coordinates[0] }}</el-descriptions-item>
      <el-descriptions-item label="纬度">{{ device.coordinates[1] }}</el-descriptions-item>
    </el-descriptions>
    <div v-else>
      <p>暂无设备信息</p>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  device: {
    type: Object,
    default: null,
  },
});

defineEmits(['update:visible']);

const statusTagType = (status) => {
  if (status === '在线') return 'success';
  if (status === '离线') return 'info';
  if (status === '告警') return 'warning';
  return '';
};
</script> 