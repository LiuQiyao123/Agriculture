<template>
  <el-dialog
    :model-value="visible"
    title="新增人工数据上报"
    width="600px"
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-form :model="formData" label-width="120px" class="dark-form">
      <el-form-item label="上报人">
        <el-input v-model="formData.reporter" />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="formData.phone" />
      </el-form-item>
      <el-form-item label="上报时间">
        <el-date-picker
          v-model="formData.reportTime"
          type="datetime"
          placeholder="选择日期时间"
          style="width: 100%;"
        />
      </el-form-item>
      <el-form-item label="所属乡镇">
        <el-select v-model="formData.town" placeholder="请选择乡镇" style="width: 100%;">
          <el-option label="城关镇" value="城关镇" />
          <el-option label="高新区" value="高新区" />
          <el-option label="开发区" value="开发区" />
        </el-select>
      </el-form-item>
      <el-form-item label="事件类型">
        <el-radio-group v-model="formData.eventType">
          <el-radio-button label="病害" />
          <el-radio-button label="虫害" />
          <el-radio-button label="灾情" />
          <el-radio-button label="农事" />
        </el-radio-group>
      </el-form-item>
      <el-form-item label="详细描述">
        <el-input v-model="formData.description" type="textarea" />
      </el-form-item>
      <el-form-item label="现场照片">
        <el-upload
          action="#"
          list-type="picture-card"
          :auto-upload="false"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">取消</el-button>
        <el-button type="primary" @click="handleSubmit">
          提交
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive } from 'vue';
import { Plus } from '@element-plus/icons-vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:visible', 'submit']);

const formData = reactive({
  reporter: '',
  phone: '',
  reportTime: new Date(),
  town: '',
  eventType: '病害',
  description: ''
});

const handleSubmit = () => {
  // In a real app, you would validate the form here
  emit('submit', { ...formData });
  emit('update:visible', false);
};
</script> 