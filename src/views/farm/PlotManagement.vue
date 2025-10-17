<template>
  <div class="page-container">
    <PageTitle title="地块管理" subtitle="管理农场的数字化核心资产" />
    <div class="content-area">
      <DataPanel title="地块列表">
        <div class="search-filter-bar">
          <div class="search-section">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索地块名称/编号"
              :prefix-icon="Search"
              clearable
              style="width: 280px;"
            />
          </div>
          <div class="filter-section">
            <el-form inline>
              <el-form-item label="作物">
                <el-select v-model="selectedCrop" placeholder="全部" clearable style="width: 120px;">
                  <el-option v-for="opt in cropOptions" :key="opt" :label="opt" :value="opt" />
                </el-select>
              </el-form-item>
              <el-form-item label="面积(亩)">
                <el-input-number v-model="areaMin" :min="0" :precision="0" placeholder="≥" style="width: 100px;" />
                <span class="range-sep">-</span>
                <el-input-number v-model="areaMax" :min="0" :precision="0" placeholder="≤" style="width: 100px;" />
              </el-form-item>
              <el-form-item label="健康分">
                <el-input-number v-model="healthMin" :min="0" :max="100" :precision="0" placeholder="≥" style="width: 100px;" />
                <span class="range-sep">-</span>
                <el-input-number v-model="healthMax" :min="0" :max="100" :precision="0" placeholder="≤" style="width: 100px;" />
              </el-form-item>
              <el-form-item>
                <el-button @click="resetFilters">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div class="action-section">
            <el-button type="primary" :icon="Plus" @click="handleAddNewPlot">
              新增地块
            </el-button>
          </div>
        </div>
        <div class="content-wrapper">
          <div class="main-content">
            <div class="list-section">
              <PlotList
                :plots="filteredPlots"
                :loading="loading"
                @plot-selected="handlePlotSelected"
                @edit-plot="handleEditPlot"
                @plot-hover="handlePlotHover"
                @plot-unhover="handlePlotUnhover"
              />
            </div>
            <div class="map-section">
              <PlotsMap
                ref="plotsMapRef"
                :plots="filteredPlots"
                :selected-plot-id="selectedPlot ? selectedPlot.id : null"
                :hovered-plot-id="hoveredPlotId"
                @plot-clicked="handlePlotSelected"
                @plot-hover="handlePlotHover"
                @plot-unhover="handlePlotUnhover"
              />
            </div>
          </div>
          <div class="detail-sidebar" :class="{ 'open': selectedPlot }">
            <PlotDetail 
              :plot="selectedPlot" 
              @task-created="handleTaskCreated"
              @planning-created="handlePlanningCreated"
            />
          </div>
        </div>
      </DataPanel>
    </div>
    <el-dialog
      v-model="isDialogVisible"
      :title="isEditMode ? '编辑地块' : '新增地块'"
      width="90%"
      top="5vh"
      :close-on-click-modal="false"
      @closed="handleDialogClosed"
    >
      <div class="dialog-toolbar">
        <el-upload
          action=""
          :auto-upload="false"
          :show-file-list="false"
          accept=".json,.geojson,application/geo+json,application/json"
          :on-change="handleGeoJSONImport"
        >
          <el-button>导入GeoJSON</el-button>
        </el-upload>
      </div>
      <div class="dialog-content">
        <div class="form-section">
          <PlotForm ref="plotFormRef" />
        </div>
        <div class="map-draw-section">
          <BaseMap 
            ref="dialogMapRef" 
            :draw-controls="true"
            @draw-create="handleDrawCreate"
            @draw-update="handleDrawUpdate"
            @draw-delete="handleDrawDelete"
          />
          <div class="map-overlay-text">
            请使用右上角的工具在地图上绘制地块边界；或导入GeoJSON
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="isDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmAddPlot">
            {{ isEditMode ? '确认修改' : '确认新增' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import PageTitle from '@/components/PageTitle.vue';
import DataPanel from '@/components/DataPanel.vue';
import PlotList from '@/components/farm/PlotList.vue';
import PlotsMap from '@/components/farm/PlotsMap.vue';
import PlotForm from '@/components/farm/PlotForm.vue';
import PlotDetail from '@/components/farm/PlotDetail.vue';
import BaseMap from '@/components/map/BaseMap.vue';
import { Search, Plus } from '@element-plus/icons-vue';
import { usePlots } from '@/composables/farm/usePlots.js';
import * as turf from '@turf/turf';

const { allPlots, selectedPlot, loading, fetchPlots, selectPlot, createPlot, updatePlot, deletePlot } = usePlots();

const searchKeyword = ref('');
const selectedCrop = ref('');
const areaMin = ref();
const areaMax = ref();
const healthMin = ref();
const healthMax = ref();
const hoveredPlotId = ref(null);

const isDialogVisible = ref(false);
const isEditMode = ref(false);
const plotFormRef = ref(null);
const dialogMapRef = ref(null);
const plotsMapRef = ref(null); // 添加地图引用
const drawnGeometry = ref(null);
let editingPlotId = null;

const cropOptions = computed(() => {
  const set = new Set();
  (allPlots.value || []).forEach(p => { if (p.properties && p.properties.crop) set.add(p.properties.crop); });
  return Array.from(set);
});

const filteredPlots = computed(() => {
  const kw = (searchKeyword.value || '').trim();
  return (allPlots.value || []).filter(p => {
    const props = p.properties || {};
    if (kw && !(p.id.includes(kw) || (props.owner && props.owner.includes(kw)))) return false;
    if (selectedCrop.value && props.crop !== selectedCrop.value) return false;
    if (areaMin.value != null && props.area != null && props.area < areaMin.value) return false;
    if (areaMax.value != null && props.area != null && props.area > areaMax.value) return false;
    if (healthMin.value != null && props.healthScore != null && props.healthScore < healthMin.value) return false;
    if (healthMax.value != null && props.healthScore != null && props.healthScore > healthMax.value) return false;
    return true;
  });
});

const resetFilters = () => {
  selectedCrop.value = '';
  areaMin.value = undefined;
  areaMax.value = undefined;
  healthMin.value = undefined;
  healthMax.value = undefined;
  searchKeyword.value = '';
};

onMounted(() => {
  fetchPlots();
});

const handlePlotSelected = (plotId) => {
  console.log('handlePlotSelected called with plotId:', plotId);
  selectPlot(plotId);
  
  // 调用 flyToPlot 功能
  if (plotsMapRef.value) {
    console.log('Calling flyToPlot from handlePlotSelected');
    plotsMapRef.value.flyToPlot(plotId);
  } else {
    console.log('plotsMapRef not available');
  }
};

const handlePlotHover = (plotId) => {
  hoveredPlotId.value = plotId;
};

const handlePlotUnhover = () => {
  hoveredPlotId.value = null;
};

// 处理任务创建事件
const handleTaskCreated = (data) => {
  console.log('任务已创建:', data);
  const existingTasks = JSON.parse(localStorage.getItem('agri_tasks') || '[]');
  const newTasks = data.tasks.map(task => ({
    ...task,
    id: Date.now() + Math.random(),
    plotId: data.plotId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    createdFrom: 'plot-analysis'
  }));
  
  existingTasks.push(...newTasks);
  localStorage.setItem('agri_tasks', JSON.stringify(existingTasks));
};

// 处理种植规划创建事件
const handlePlanningCreated = (data) => {
  console.log('种植规划已创建:', data);
  const existingPlans = JSON.parse(localStorage.getItem('agri_plans') || '[]');
  const newPlan = {
    ...data,
    id: Date.now(),
    status: 'draft',
    createdAt: new Date().toISOString()
  };
  
  existingPlans.push(newPlan);
  localStorage.setItem('agri_plans', JSON.stringify(existingPlans));
};

const handleEditPlot = async (plot) => {
  isEditMode.value = true;
  editingPlotId = plot.id;
  isDialogVisible.value = true;
  await nextTick();
  plotFormRef.value.setFormData({
    id: plot.id.replace('地块',''),
    name: plot.id,
    owner: plot.properties?.owner || '',
    area: plot.properties?.area || 0,
    crop: plot.properties?.crop || '',
    soilType: plot.properties?.soilType || '',
  });
  const draw = dialogMapRef.value?.draw;
  if (draw) {
    draw.deleteAll();
    if (plot.geometry) {
      const feat = { type:'Feature', geometry: plot.geometry, properties: { id: plot.id } };
      draw.add(feat);
      drawnGeometry.value = plot.geometry;
    }
  }
};

const handleAddNewPlot = () => {
  isEditMode.value = false;
  editingPlotId = null;
  isDialogVisible.value = true;
};

const handleGeoJSONImport = (file) => {
  try {
    const reader = new FileReader();
    reader.onload = () => {
      const content = JSON.parse(reader.result);
      let geometry = null;
      if (content.type === 'FeatureCollection' && content.features?.length) {
        geometry = content.features[0].geometry;
      } else if (content.type === 'Feature' && content.geometry) {
        geometry = content.geometry;
      } else if (content.type === 'Polygon' || content.type === 'MultiPolygon') {
        geometry = content;
      }
      if (!geometry) return;
      const draw = dialogMapRef.value?.draw;
      if (draw) {
        draw.deleteAll();
        draw.add({ type:'Feature', geometry, properties:{} });
      }
      drawnGeometry.value = geometry;
      const areaInMu = turf.area(geometry) / 666.67;
      plotFormRef.value.setAreaData(areaInMu.toFixed(2));
    };
    reader.readAsText(file.raw || file);
  } catch {}
};

const handleDrawCreate = (e) => {
  const feature = e.features[0];
  drawnGeometry.value = feature.geometry;
  const areaInSqMeters = turf.area(feature);
  const areaInMu = areaInSqMeters / 666.67;
  plotFormRef.value.setAreaData(areaInMu.toFixed(2));
  const drawInstance = dialogMapRef.value.draw;
  if (drawInstance) {
    const allFeatures = drawInstance.getAll();
    if (allFeatures.features.length > 1) {
      const idsToDelete = allFeatures.features.slice(0, -1).map(f => f.id);
      drawInstance.delete(idsToDelete);
    }
  }
};

const handleDrawUpdate = (e) => {
  const feature = e.features[0];
  drawnGeometry.value = feature.geometry;
  const areaInSqMeters = turf.area(feature);
  const areaInMu = areaInSqMeters / 666.67;
  plotFormRef.value.setAreaData(areaInMu.toFixed(2));
};

const handleDrawDelete = () => {
  drawnGeometry.value = null;
  plotFormRef.value.setAreaData(0);
};

const handleDialogClosed = () => {
  plotFormRef.value?.resetForm();
  drawnGeometry.value = null;
  const drawInstance = dialogMapRef.value?.draw;
  if (drawInstance) {
    drawInstance.deleteAll();
  }
};

const handleDeleteSelected = () => {
  if (!selectedPlot.value) return;
  const ok = deletePlot(selectedPlot.value.id);
  if (ok) {
    ElMessage.success('已删除');
  } else {
    ElMessage.error('删除失败');
  }
};

const handleConfirmAddPlot = async () => {
  try {
    const isValid = await plotFormRef.value.validate();
    if (!isValid) return;
    const formData = plotFormRef.value.getFormData();
    if (!drawnGeometry.value) {
      ElMessage.warning('请在地图上绘制或导入地块边界');
      return;
    }
    const payload = {
      id: formData.id,
      name: formData.name,
      owner: formData.owner,
      area: formData.area,
      crop: formData.crop,
      soilType: formData.soilType,
      geometry: drawnGeometry.value,
    };
    try {
      if (isEditMode.value && editingPlotId) {
        updatePlot(editingPlotId, payload);
        ElMessage.success('修改成功');
      } else {
        createPlot(payload);
        ElMessage.success('新增成功');
      }
      isDialogVisible.value = false;
      fetchPlots();
    } catch (e) {
      ElMessage.error(e.message || '保存失败');
    }
  } catch (error) {
    ElMessage.error('表单校验失败');
  }
};
</script>

<style scoped lang="scss">
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.content-area {
  flex-grow: 1;
  overflow: hidden;
  
  :deep(.panel-content) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}

.search-filter-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0,170,255,.15);
  background: rgba(0,170,255,.02);
  gap: 20px;
  
  .search-section {
    flex-shrink: 0;
  }
  
  .filter-section {
    flex-shrink: 0;
    
    .el-form {
      margin: 0;
      
      .el-form-item {
        margin-bottom: 0;
        margin-right: 16px;
        
        &:last-child {
          margin-right: 0;
        }
      }
    }
    
    .range-sep { 
      display: inline-block; 
      width: 12px; 
      text-align: center; 
      color: #a0a6b8; 
      margin: 0 4px;
    }
  }
  
  .action-section {
    margin-left: auto;
    flex-shrink: 0;
  }
}

.content-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 0;
  position: relative;
  overflow: hidden;
  padding: 10px 0 0;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 10px;
  transition: margin-right 0.3s ease;
  
  &.with-detail {
    margin-right: 400px;
  }
}

.list-section {
  flex: 0 0 40%;
  height: 100%;
  border: 1px solid rgba(0,170,255,.3);
  border-radius: 4px;
  overflow: hidden;
  
  :deep(.el-table) { height: 100%; }
}

.map-section {
  flex: 0 0 60%;
  height: 100%;
  border: 1px solid rgba(0,170,255,.3);
  border-radius: 4px;
  overflow: hidden;
  
  :deep(.basemap-container) { height: 100%; }
}

.detail-sidebar {
  position: absolute;
  top: 10px;
  right: -400px;
  width: 400px;
  height: calc(100% - 10px);
  transition: right 0.3s ease;
  z-index: 10;
  
  &.open {
    right: 0;
  }
}

.dialog-toolbar { padding: 0 0 10px; display: flex; justify-content: flex-end; }

.dialog-content {
  display: flex;
  height: 80vh;
  gap: 20px;
}

.form-section { 
  width: 35%; 
  min-width: 400px; 
  flex-shrink: 0;
  overflow-y: auto;
}

.map-draw-section {
  flex: 1;
  position: relative;
  height: 100%;
  border: 1px solid rgba(0,170,255,.3);
  border-radius: 4px;
  overflow: hidden;
  
  :deep(.basemap-container) { 
    width: 100% !important;
    height: 100% !important;
  }
}

.map-overlay-text {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 8px 12px;
  border-radius: 4px;
  pointer-events: none;
}
</style>