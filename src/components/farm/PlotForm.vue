<template>
  <el-form :model="formData" :rules="rules" ref="plotFormRef" label-position="top">
    <el-form-item label="地块名称" prop="name">
      <el-input v-model="formData.name" placeholder="例如：北区一号地块"></el-input>
    </el-form-item>
    <el-form-item label="地块编号" prop="id">
      <el-input v-model="formData.id" placeholder="例如：A01"></el-input>
    </el-form-item>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="责任人" prop="owner">
          <el-input v-model="formData.owner" placeholder="填写责任人姓名"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="面积 (亩)" prop="area">
          <el-input-number v-model="formData.area" :min="0" :precision="2" style="width: 100%"></el-input-number>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="作物类型" prop="crop">
          <el-select v-model="formData.crop" placeholder="请选择作物" style="width: 100%">
            <el-option label="小麦" value="小麦" />
            <el-option label="玉米" value="玉米" />
            <el-option label="大豆" value="大豆" />
            <el-option label="水稻" value="水稻" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="填写联系电话"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item label="土壤评分" prop="soilScore">
          <el-input-number v-model="formData.soilScore" :min="0" :max="100" style="width: 100%"></el-input-number>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="土壤湿度 (%)" prop="soilMoisture">
          <el-input-number v-model="formData.soilMoisture" :min="0" :max="100" style="width: 100%"></el-input-number>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="有机质含量 (%)" prop="organicMatter">
          <el-input-number v-model="formData.organicMatter" :min="0" :max="10" :precision="2" style="width: 100%"></el-input-number>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="病虫害严重程度" prop="pestSeverity">
          <el-select v-model="formData.pestSeverity" placeholder="请选择" style="width: 100%">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="NDVI指数" prop="ndvi">
          <el-input-number v-model="formData.ndvi" :min="0" :max="1" :precision="2" style="width: 100%"></el-input-number>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';

const props = defineProps({
  plot: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:plot']);

const plotFormRef = ref();

const formData = reactive({
  id: '',
  name: '',
  owner: '',
  area: 0,
  crop: '',
  phone: '',
  soilScore: 0,
  soilMoisture: 0,
  organicMatter: 0,
  pestSeverity: 'low',
  ndvi: 0
});

const rules = {
  name: [{ required: true, message: '请输入地块名称', trigger: 'blur' }],
  id: [{ required: true, message: '请输入地块编号', trigger: 'blur' }],
  owner: [{ required: true, message: '请输入责任人', trigger: 'blur' }],
  area: [{ required: true, message: '请输入面积', trigger: 'blur' }],
  crop: [{ required: true, message: '请选择作物类型', trigger: 'change' }]
};

watch(() => props.plot, (newPlot) => {
  if (newPlot && Object.keys(newPlot).length > 0) {
    Object.assign(formData, newPlot);
  }
}, { immediate: true, deep: true });

watch(formData, (newData) => {
  emit('update:plot', { ...newData });
}, { deep: true });

const validate = () => {
  return plotFormRef.value.validate();
};

const resetFields = () => {
  plotFormRef.value.resetFields();
};

defineExpose({
  validate,
  resetFields
});
</script>

<style scoped lang="scss">
.el-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}
</style>

