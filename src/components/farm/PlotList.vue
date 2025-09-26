<template>
  <div class="plot-list-container" v-loading="loading">
    <el-table
      :data="plots"
      stripe
      style="width: 100%; height: 100%;"
      highlight-current-row
      @current-change="handleCurrentChange"
      @row-mouseover="handleRowMouseover"
      @row-mouseleave="handleRowMouseleave"
    >
      <el-table-column prop="id" label="地块ID" />
      <el-table-column prop="properties.crop" label="当前作物" />
      <el-table-column prop="properties.area" label="面积(亩)" />
      <el-table-column prop="properties.owner" label="责任人" />
      <el-table-column prop="properties.healthScore" label="健康评分">
        <template #default="{ row }">
          <el-progress
            :percentage="row.properties.healthScore"
            :status="getScoreStatus(row.properties.healthScore)"
            :text-inside="true"
            :stroke-width="20"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="emit('edit-plot', row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
defineProps({
  plots: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['plot-selected', 'edit-plot', 'plot-hover', 'plot-unhover']);

const handleCurrentChange = (plot) => {
  if (plot) {
    emit('plot-selected', plot.id);
  }
};

const handleRowMouseover = (row) => {
  emit('plot-hover', row.id);
};

const handleRowMouseleave = () => {
  emit('plot-unhover');
};

const getScoreStatus = (score) => {
  if (score >= 90) return 'success';
  if (score >= 80) return '';
  if (score >= 70) return 'warning';
  return 'exception';
};
</script>

<style scoped lang="scss">
.plot-list-container {
  width: 100%;
  height: 100%;
}
</style>






