<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑种植计划"
    width="70%"
    top="5vh"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      v-loading="loading"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="计划名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入计划名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="作物类型" prop="crop">
            <el-select v-model="formData.crop" placeholder="请选择作物类型">
              <el-option label="玉米" value="玉米" />
              <el-option label="水稻" value="水稻" />
              <el-option label="小麦" value="小麦" />
              <el-option label="大豆" value="大豆" />
              <el-option label="蔬菜" value="蔬菜" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="开始日期" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              type="date"
              placeholder="选择开始日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="结束日期" prop="endDate">
            <el-date-picker
              v-model="formData.endDate"
              type="date"
              placeholder="选择结束日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择状态">
              <el-option label="草稿" value="草稿" />
              <el-option label="进行中" value="进行中" />
              <el-option label="已完成" value="已完成" />
              <el-option label="已暂停" value="已暂停" />
              <el-option label="已取消" value="已取消" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="预估成本" prop="estimatedCost">
            <el-input-number
              v-model="formData.estimatedCost"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="预估收入" prop="estimatedRevenue">
            <el-input-number
              v-model="formData.estimatedRevenue"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="风险等级" prop="riskLevel">
            <el-select v-model="formData.riskLevel" placeholder="请选择风险等级">
              <el-option label="低风险" value="low" />
              <el-option label="中风险" value="medium" />
              <el-option label="高风险" value="high" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="关联地块">
        <el-tag
          v-for="plot in formData.plots"
          :key="plot"
          closable
          @close="removePlot(plot)"
          class="plot-tag"
        >
          {{ plot }}
        </el-tag>
        <el-button
          type="primary"
          size="small"
          @click="showPlotSelector = true"
          style="margin-left: 10px"
        >
          添加地块
        </el-button>
      </el-form-item>
      
      <el-form-item label="备注">
        <el-input
          v-model="formData.notes"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          保存
        </el-button>
      </span>
    </template>
    
    <!-- 地块选择器 -->
    <el-dialog
      v-model="showPlotSelector"
      title="选择地块"
      width="60%"
      append-to-body
    >
      <el-table
        :data="availablePlots"
        @selection-change="handlePlotSelectionChange"
        ref="plotTableRef"
        height="300px"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="地块ID" />
        <el-table-column prop="properties.crop" label="当前作物" />
        <el-table-column prop="properties.area" label="面积 (亩)" />
      </el-table>
      <template #footer>
        <el-button @click="showPlotSelector = false">取消</el-button>
        <el-button type="primary" @click="confirmPlotSelection">确定</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { usePlots } from '@/composables/farm/usePlots.js';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  plan: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:visible', 'plan-updated']);

const { allPlots, fetchPlots } = usePlots();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const formRef = ref();
const plotTableRef = ref();
const loading = ref(false);
const saving = ref(false);
const showPlotSelector = ref(false);
const selectedPlots = ref([]);

const formData = ref({
  name: '',
  crop: '',
  startDate: '',
  endDate: '',
  status: '草稿',
  estimatedCost: 0,
  estimatedRevenue: 0,
  riskLevel: 'medium',
  plots: [],
  notes: ''
});

const rules = {
  name: [
    { required: true, message: '请输入计划名称', trigger: 'blur' }
  ],
  crop: [
    { required: true, message: '请选择作物类型', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' }
  ]
};

const availablePlots = computed(() => {
  return allPlots.value.filter(plot => !formData.value.plots.includes(plot.id));
});

watch(() => props.visible, (newVal) => {
  if (newVal && props.plan) {
    // 初始化表单数据
    formData.value = {
      name: props.plan.name || '',
      crop: props.plan.crop || '',
      startDate: props.plan.startDate || '',
      endDate: props.plan.endDate || '',
      status: props.plan.status || '草稿',
      estimatedCost: props.plan.estimatedCost || 0,
      estimatedRevenue: props.plan.estimatedRevenue || 0,
      riskLevel: props.plan.riskLevel || 'medium',
      plots: [...(props.plan.plots || [])],
      notes: props.plan.notes || ''
    };
  }
});

const removePlot = (plotId) => {
  const index = formData.value.plots.indexOf(plotId);
  if (index > -1) {
    formData.value.plots.splice(index, 1);
  }
};

const handlePlotSelectionChange = (selection) => {
  selectedPlots.value = selection;
};

const confirmPlotSelection = () => {
  selectedPlots.value.forEach(plot => {
    if (!formData.value.plots.includes(plot.id)) {
      formData.value.plots.push(plot.id);
    }
  });
  showPlotSelector.value = false;
  selectedPlots.value = [];
};

const handleSave = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    saving.value = true;
    
    // 计算利润
    const profit = formData.value.estimatedRevenue - formData.value.estimatedCost;
    
    const updatedPlan = {
      ...props.plan,
      ...formData.value,
      profit: profit,
      plotCount: formData.value.plots.length,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    emit('plan-updated', updatedPlan);
    dialogVisible.value = false;
    
  } catch (error) {
    console.error('Form validation failed:', error);
  } finally {
    saving.value = false;
  }
};

const handleClosed = () => {
  // 重置表单
  formRef.value?.resetFields();
  selectedPlots.value = [];
};

onMounted(() => {
  fetchPlots();
});
</script>

<style scoped lang="scss">
.plot-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
