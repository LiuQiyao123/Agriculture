<template>
  <div class="page-container">
    <PageTitle title="采收管理" subtitle="智能采收决策与产量管理" />

    <!-- KPI Stats -->
    <div class="stats-bar">
      <el-card class="stat-card">
        <div class="stat-title">待处理采收</div>
        <div class="stat-value">{{ kpi.pending }}</div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-title">采收中</div>
        <div class="stat-value">{{ kpi.harvesting }}</div>
      </el-card>
      <el-card class="stat-card urgent">
        <div class="stat-title">AI建议</div>
        <div class="stat-value">{{ kpi.suggested }}</div>
      </el-card>
       <el-card class="stat-card overdue">
        <div class="stat-title">问题反馈</div>
        <div class="stat-value">{{ kpi.feedback }}</div>
      </el-card>
    </div>

    <div class="action-bar">
       <FilterBar
        v-model:search-value="searchKeyword"
        v-model="filterValues"
        :fields="filterFields"
        :show-search="true"
        search-placeholder="搜索作物类型/地块名称"
      />
      <div class="actions">
        <el-button type="primary" :icon="Plus" @click="handleNewHarvest">新建采收</el-button>
        <el-radio-group v-model="currentView" size="default" style="margin-left: 20px;">
          <el-radio-button label="list"><el-icon><Tickets /></el-icon> 列表</el-radio-button>
          <el-radio-button label="kanban"><el-icon><Grid /></el-icon> 看板</el-radio-button>
           <el-radio-button label="calendar"><el-icon><Calendar /></el-icon> 日历</el-radio-button>
          <el-radio-button label="map" disabled><el-icon><MapLocation /></el-icon> 地图</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="content-view">
      <HarvestList
        v-if="currentView === 'list'"
        :harvests="filteredHarvests"
        :loading="loading"
        @harvest-action="handleHarvestAction"
        @row-click="openHarvestDetails"
      />
      <!-- Kanban View -->
      <KanbanBoard
        v-if="currentView === 'kanban'"
        :columns="harvestColumns"
        :items="filteredHarvests"
        group="harvests"
        @item-moved="handleHarvestMove"
        @item-clicked="openHarvestDetails"
      >
        <template #card="{ item }">
          <div class="harvest-card" :class="`harvest-card-${item.status}`">
             <div class="card-header">
                <div>
                  <span style="font-size: 1rem; vertical-align: middle;">{{ item.source === 'ai' ? '🤖' : '📝' }}</span>
                  <span class="crop-name">{{ item.crop }}</span>
                </div>
                <span class="plot-name">{{ item.plotName }}</span>
             </div>
             <p class="yield-info">预计产量: <strong>{{ item.estimatedYield }}</strong> 吨</p>
             <div class="date-info">
                <el-icon><Calendar /></el-icon>
                <span>{{ item.harvestStartDate }} ~ {{ item.harvestEndDate }}</span>
             </div>
          </div>
        </template>
      </KanbanBoard>
       <UniversalCalendar
        v-if="currentView === 'calendar'"
        :events="calendarEvents"
        @event-click="openHarvestDetails"
      />
    </div>

    <!-- Details Dialog -->
    <el-dialog v-model="detailsVisible" :title="isNewHarvest ? '新建采收' : '采收详情'" width="50%">
       <p>详情弹窗内容...</p>
      <template #footer>
        <el-button @click="detailsVisible = false">取消</el-button>
        <el-button type="primary" @click="saveHarvest">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Plus, Tickets, Grid, Calendar, MapLocation } from '@element-plus/icons-vue';
import PageTitle from '@/components/PageTitle.vue';
import FilterBar from '@/components/forms/FilterBar.vue';
import HarvestList from '@/components/farm/HarvestList.vue';
import KanbanBoard from '@/components/common/KanbanBoard.vue'; // 替换为通用看板组件
import UniversalCalendar from '@/components/common/UniversalCalendar.vue'; // 引入日历组件
import { useHarvests } from '@/composables/farm/useHarvests.js';
import { ElMessage, ElMessageBox } from 'element-plus';

const { allHarvests, loading, fetchHarvests, addHarvest, updateHarvest, deleteHarvest } = useHarvests();

const currentView = ref('list');
const detailsVisible = ref(false);
const selectedHarvest = ref({});
const isNewHarvest = ref(false);


// 搜索和筛选
const searchKeyword = ref('');
const filterValues = ref({
  crop: '',
  status: ''
});

const filterFields = [
  {
    model: 'crop',
    label: '作物类型',
    type: 'select',
    placeholder: '全部作物',
    width: '150px',
    options: [
      { label: '全部', value: '' },
      { label: '小麦', value: '小麦' },
      { label: '玉米', value: '玉米' },
      { label: '大豆', value: '大豆' },
      { label: '水稻', value: '水稻' }
    ]
  },
  {
    model: 'status',
    label: '采收状态',
    type: 'select',
    placeholder: '全部状态',
    width: '150px',
    options: [
      { label: '全部', value: '' },
      { label: 'AI建议', value: 'suggested' },
      { label: '待采收', value: 'pending' },
      { label: '采收中', value: 'harvesting' },
      { label: '问题反馈', value: 'feedback' },
      { label: '已完成', value: 'completed' },
      { label: '已忽略', value: 'ignored' },
      { label: '已归档', value: 'archived' }
    ]
  }
];

// 看板列定义
const harvestColumns = ref([
  { id: 'suggested', title: 'AI建议' },
  { id: 'pending', title: '待采收' },
  { id: 'harvesting', title: '采收中' },
  { id: 'feedback', title: '问题反馈' },
  { id: 'completed', title: '已完成' },
]);

// 计算属性
const filteredHarvests = computed(() => {
  let filtered = [...allHarvests.value];

  // 默认隐藏
  if (!filterValues.value.status) {
    filtered = filtered.filter(h => !['ignored', 'archived'].includes(h.status));
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    filtered = filtered.filter(harvest => 
      harvest.crop.toLowerCase().includes(keyword) ||
      harvest.plotName.toLowerCase().includes(keyword)
    );
  }

  // 作物类型筛选
  if (filterValues.value.crop) {
    filtered = filtered.filter(harvest => harvest.crop === filterValues.value.crop);
  }

  // 状态筛选
  if (filterValues.value.status) {
    filtered = filtered.filter(harvest => harvest.status === filterValues.value.status);
  }

  return filtered;
});

const kpi = computed(() => {
  const activeHarvests = allHarvests.value.filter(h => !['ignored', 'archived', 'completed'].includes(h.status));
  return {
    pending: allHarvests.value.filter(h => h.status === 'pending').length,
    harvesting: allHarvests.value.filter(h => h.status === 'harvesting').length,
    suggested: allHarvests.value.filter(h => h.status === 'suggested').length,
    feedback: allHarvests.value.filter(h => h.status === 'feedback').length,
  };
});

const calendarEvents = computed(() => {
  const statusColorMap = {
    suggested: '#409EFF',  // blue
    pending: '#909399',      // grey
    harvesting: '#67C23A', // green
    feedback: '#E6A23C',    // yellow
    completed: '#a5d6a7', // light green
  };
  return filteredHarvests.value.map(harvest => ({
    id: harvest.id,
    title: `${harvest.crop} - ${harvest.plotName}`,
    startDate: harvest.harvestStartDate,
    endDate: harvest.harvestEndDate,
    color: statusColorMap[harvest.status] || 'gray',
    ...harvest // Pass full object
  }));
});


// CRUD and Actions
const handleNewHarvest = () => {
  isNewHarvest.value = true;
  selectedHarvest.value = { status: 'pending', source: 'manual' }; // Default values
  detailsVisible.value = true;
};

const openHarvestDetails = (harvest) => {
  isNewHarvest.value = false;
  selectedHarvest.value = { ...harvest };
  detailsVisible.value = true;
};

const saveHarvest = () => {
  if (isNewHarvest.value) {
    addHarvest(selectedHarvest.value);
    ElMessage.success('新采收任务已创建');
  } else {
     if (selectedHarvest.value.status === 'suggested') {
      updateHarvest(selectedHarvest.value.id, { ...selectedHarvest.value, status: 'pending' });
      ElMessage.success('AI建议已审核，进入待采收状态');
    } else {
      updateHarvest(selectedHarvest.value.id, selectedHarvest.value);
      ElMessage.success('采收任务已更新');
    }
  }
  detailsVisible.value = false;
};

// 看板拖拽事件处理
const handleHarvestMove = ({ itemId, newStatusId }) => {
  const column = harvestColumns.value.find(c => c.id === newStatusId);
  if (column) {
    updateHarvest(itemId, { status: newStatusId });
    ElMessage.success(`采收任务已移至 "${column.title}"`);
  }
};


// 事件处理
const handleHarvestAction = ({ action, harvestId, payload }) => {
  switch (action) {
    case 'review':
      openHarvestDetails(payload);
      break;
    case 'ignore':
      updateHarvest(harvestId, { status: 'ignored' });
      ElMessage.info('AI采收建议已忽略');
      break;
    case 'delete':
      ElMessageBox.confirm('确定要删除此采收任务吗？此操作不可恢复。', '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        deleteHarvest(harvestId);
        ElMessage.success('采收任务已删除');
      }).catch(() => {});
      break;
    case 'start':
      updateHarvest(harvestId, { status: 'harvesting' });
      ElMessage.success('采收任务已开始');
      break;
    case 'feedback':
      // For now, just update status. Later can open a dialog.
      updateHarvest(harvestId, { status: 'feedback' });
      ElMessage.warning('已提交问题反馈');
      break;
    case 'complete':
      updateHarvest(harvestId, { status: 'completed' });
      ElMessage.success('采收任务已完成');
      break;
    case 'archive':
      updateHarvest(harvestId, { status: 'archived' });
      ElMessage.success('采收记录已归档');
      break;
    case 'recover':
      updateHarvest(harvestId, { status: 'suggested' });
      ElMessage.success('AI采收建议已恢复');
      break;
    case 'updateStatus': // Action from Kanban
      updateHarvest(harvestId, payload);
      break;
  }
};

// 初始化
onMounted(() => {
  fetchHarvests();
});
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}
.stats-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}
.stat-card {
  text-align: center;
  .stat-title {
    color: #909399;
    font-size: 14px;
    margin-bottom: 8px;
  }
  .stat-value {
    font-size: 24px;
    font-weight: bold;
  }
  &.urgent .stat-value { color: #e6a23c; }
  &.overdue .stat-value { color: #f56c6c; }
}
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.content-view {
  flex: 1;
  overflow: hidden;
}

// 采收看板卡片样式
.harvest-card {
  /* 业务卡片改为透明容器，仅保留排版与内边距，视觉交给通用看板组件 */
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  padding: 12px 14px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: opacity 0.2s;
  font-size: 14px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .crop-name { font-weight: 600; margin-left: 8px; }
  .plot-name { font-size: 12px; color: $text-color-secondary; }
  .yield-info { margin: 0 0 12px 0; }
  .yield-info strong { color: #E6A23C; }
  .date-info { display: flex; align-items: center; font-size: 12px; color: $text-color-secondary; }
  .date-info .el-icon { margin-right: 5px; }
}

/* 禁用本页状态边框，避免覆盖通用看板组件的状态样式 */
.harvest-card-suggested,
.harvest-card-pending,
.harvest-card-harvesting,
.harvest-card-feedback { border-left: 0 !important; }


.kanban-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  font-size: 1.2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}
</style>
