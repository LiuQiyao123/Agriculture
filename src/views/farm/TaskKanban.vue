
<template>
  <div class="task-management-page">
    <!-- 1. KPI Stats -->
    <div class="stats-bar">
      <el-card class="stat-card">
        <div class="stat-title">待处理任务</div>
        <div class="stat-value">{{ kpi.todo }}</div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-title">进行中任务</div>
        <div class="stat-value">{{ kpi.inProgress }}</div>
      </el-card>
      <el-card class="stat-card urgent">
        <div class="stat-title">今日到期</div>
        <div class="stat-value">{{ kpi.dueToday }}</div>
      </el-card>
      <el-card class="stat-card overdue">
        <div class="stat-title">已延期任务</div>
        <div class="stat-value">{{ kpi.overdue }}</div>
      </el-card>
    </div>

    <!-- 2. Filter and Action Bar -->
    <div class="action-bar">
      <div class="filters">
        <el-input v-model="filters.keyword" placeholder="关键词搜索" clearable @clear="applyFilters" @keyup.enter="applyFilters" />
        <el-select v-model="filters.status" placeholder="按状态筛选" clearable @change="applyFilters">
          <el-option label="AI建议" value="suggested" />
          <el-option label="待下发" value="pending" />
          <el-option label="执行中" value="assigned" />
          <el-option label="问题反馈" value="feedback" />
          <el-option label="已完成" value="completed" />
          <el-option label="已忽略" value="ignored" />
          <el-option label="已归档" value="archived" />
        </el-select>
        <el-select v-model="filters.plot" placeholder="按地块筛选" clearable @change="applyFilters">
          <el-option v-for="plot in plotOptions" :key="plot.value" :label="plot.label" :value="plot.value" />
        </el-select>
        <el-select v-model="filters.assignee" placeholder="按负责人筛选" clearable @change="applyFilters">
          <el-option v-for="user in userOptions" :key="user.value" :label="user.label" :value="user.value" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="applyFilters">查询</el-button>
      </div>
      <div class="actions">
        <el-button type="primary" :icon="Plus" @click="handleNewTask">新建任务</el-button>
        <el-button type="danger" :icon="Delete" plain :disabled="selectedTaskIds.length === 0" @click="handleBulkDelete">批量删除</el-button>
        <el-radio-group v-model="currentView" size="default" style="margin-left: 20px;">
          <el-radio-button label="list"><el-icon><Tickets /></el-icon> 列表</el-radio-button>
          <el-radio-button label="kanban"><el-icon><Grid /></el-icon> 看板</el-radio-button>
          <el-radio-button label="calendar"><el-icon><Calendar /></el-icon> 日历</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 3. Views -->
    <div class="content-view">
      <!-- List View -->
      <div v-if="currentView === 'list'" class="list-map-view">
        <div class="table-container">
          <el-table 
            :data="paginatedTasks" 
            style="width: 100%" 
            @selection-change="handleSelectionChange"
            @row-mouseenter="highlightPlot"
            @row-mouseleave="clearPlotHighlight"
            @row-click="openTaskDetails"
            highlight-current-row
            :row-class-name="tableRowClassName"
          >
            <el-table-column type="selection" width="40" />
            <el-table-column width="50" align="center" label="来源">
              <template #default="{ row }">
                <el-tooltip :content="row.source === 'ai' ? 'AI建议' : '手动创建'" placement="top">
                  <span style="font-size: 1.2rem;">{{ row.source === 'ai' ? '🤖' : '📝' }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="任务标题" min-width="250" />
            <el-table-column prop="plotName" label="关联地块" width="120" />
            <el-table-column prop="assigneeName" label="负责人" width="100" />
            <el-table-column label="优先级" width="100">
              <template #default="{ row }">
                <el-tag :type="getPriorityTagType(row.priority)">{{ row.priority }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
               <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="dueDate" label="截止日期" width="120" />
            <el-table-column label="操作" width="220" fixed="right" align="left">
              <template #default="{ row }">
                 <div class="action-buttons">
                    <!-- AI建议 -->
                    <template v-if="row.status === 'suggested'">
                      <el-button size="small" type="primary" @click.stop="handleTaskAction('review', row)">审核并优化</el-button>
                      <el-button size="small" type="info" @click.stop="handleTaskAction('ignore', row.id)">忽略</el-button>
                    </template>
                    <!-- 待下发 -->
                    <template v-if="row.status === 'pending'">
                      <el-button size="small" type="success" @click.stop="handleTaskAction('assign', row.id)">下发</el-button>
                      <el-button size="small" @click.stop="openTaskDetails(row)">编辑</el-button>
                      <el-button size="small" type="danger" plain @click.stop="handleTaskAction('delete', row.id)">删除</el-button>
                    </template>
                    <!-- 执行中 & 已归档 -->
                    <template v-if="['assigned', 'archived'].includes(row.status)">
                       <el-button size="small" @click.stop="openTaskDetails(row)">查看详情</el-button>
                    </template>
                    <!-- 问题反馈 -->
                    <template v-if="row.status === 'feedback'">
                      <el-button size="small" type="warning" @click.stop="openTaskDetails(row)">处理反馈</el-button>
                    </template>
                    <!-- 已完成 -->
                    <template v-if="row.status === 'completed'">
                       <el-button size="small" @click.stop="openTaskDetails(row)">查看详情</el-button>
                      <el-button size="small" type="info" @click.stop="handleTaskAction('archive', row.id)">归档</el-button>
                    </template>
                     <!-- 已忽略 -->
                    <template v-if="row.status === 'ignored'">
                      <el-button size="small" @click.stop="handleTaskAction('recover', row.id)">恢复建议</el-button>
                      <el-button size="small" type="danger" plain @click.stop="handleTaskAction('delete', row.id)">彻底删除</el-button>
                    </template>
                  </div>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            background
            layout="prev, pager, next, total"
            :total="filteredTasks.length"
            :page-size="pageSize"
            @current-change="handlePageChange"
            style="margin-top: 20px; justify-content: flex-end;"
          />
        </div>
        <div class="map-container">
          <BaseMap 
            ref="baseMapRef"
            :layers="mapLayers"
            @feature-clicked="onFeatureClicked"
          />
          <!-- Custom Popup Logic -->
          <div ref="popupContainer" style="display: none;">
            <div v-if="selectedTaskForPopup" class="task-popup">
              <div class="popup-header">
                <h4>{{ selectedTaskForPopup.title }}</h4>
                <el-tag :type="getPriorityTagType(selectedTaskForPopup.priority)" size="small">{{ selectedTaskForPopup.priority }}</el-tag>
              </div>
              <div class="popup-body">
                <div class="info-row">
                  <span>关联地块:</span>
                  <strong>{{ selectedTaskForPopup.plotName }}</strong>
                </div>
                <div class="info-row">
                  <span>负责人:</span>
                  <strong>{{ selectedTaskForPopup.assignee }}</strong>
                </div>
                <div class="info-row">
                  <span>状态:</span>
                  <el-tag :type="getStatusTagType(selectedTaskForPopup.status)" size="small">{{ getStatusText(selectedTaskForPopup.status) }}</el-tag>
                </div>
                <template v-if="selectedTaskForPopup.status === 'done' && selectedTaskForPopup.impact">
                  <el-divider />
                  <div class="impact-analysis">
                    <h5>完成影响分析</h5>
                    <ul>
                      <li v-for="(value, key) in selectedTaskForPopup.impact" :key="key">
                        <span>{{ key }}:</span>
                        <strong class="impact-value">{{ value }}</strong>
                      </li>
                    </ul>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Kanban View -->
      <KanbanBoard
        v-if="currentView === 'kanban'"
        :columns="columns"
        :items="filteredTasks"
        group="tasks"
        @item-moved="handleItemMove"
        @item-clicked="openTaskDetails"
      >
        <template #card="{ item }">
          <div class="task-card" :class="`task-card-${item.status}`">
            <div class="task-header">
              <div>
                <span style="font-size: 1rem; vertical-align: middle;">{{ item.source === 'ai' ? '🤖' : '📝' }}</span>
                <el-tag :type="getPriorityTagType(item.priority)" size="small" style="margin-left: 8px;">{{ item.priority }}</el-tag>
              </div>
              <span class="task-plot">{{ item.plotName }}</span>
            </div>
            <p class="task-title">{{ item.title }}</p>
            <div class="task-footer">
              <span class="task-assignee">{{ item.assignee || '未分配' }}</span>
              <span class="task-due-date">{{ item.dueDate }}</span>
            </div>
          </div>
        </template>
      </KanbanBoard>

      <!-- Calendar View -->
      <UniversalCalendar 
        v-if="currentView === 'calendar'"
        :events="calendarEvents"
        @event-click="openTaskDetails"
      />
    </div>

    <!-- Task Details Modal (reused) -->
    <el-dialog v-model="taskDetailsVisible" :title="isNewTask ? '新建任务' : '任务详情'" width="50%">
      <el-form :model="selectedTask" label-width="100px">
        <el-form-item label="任务标题">
          <el-input v-model="selectedTask.title" />
        </el-form-item>
        <el-form-item label="关联地块">
          <el-select v-model="selectedTask.plotId">
            <el-option v-for="plot in plotOptions" :key="plot.value" :label="plot.label" :value="plot.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="selectedTask.assignee">
             <el-option v-for="user in userOptions" :key="user.value" :label="user.label" :value="user.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-radio-group v-model="selectedTask.priority">
            <el-radio-button label="高" />
            <el-radio-button label="中" />
            <el-radio-button label="低" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="selectedTask.dueDate" type="date" placeholder="选择日期" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="selectedTask.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="taskDetailsVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTask">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue';
import draggable from 'vuedraggable';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Delete, Search, Tickets, Grid, Calendar } from '@element-plus/icons-vue';
import BaseMap from '@/components/map/BaseMap.vue';
import KanbanBoard from '@/components/common/KanbanBoard.vue';
import UniversalCalendar from '@/components/common/UniversalCalendar.vue'; // 引入日历组件
import shandongPlots from '@/mock/shandong-plots.json';
// import tasksData from '@/mock/tasks.json'; // REMOVED: Use composable
import { useTasks } from '@/composables/farm/useTasks'; // IMPORTED: Our new composable
import usersData from '@/mock/users.json';
import maplibregl from 'maplibre-gl';

// --- Use Tasks Composable ---
const { 
  allTasks: tasks, 
  loading, 
  fetchTasks,
  updateTask,
  deleteTask: deleteTaskComposable,
  createTask: createTaskComposable
} = useTasks();

onMounted(() => {
  fetchTasks().then(() => {
    applyFilters(); // Apply initial filters after data is loaded
  });
});


// --- Helper Functions ---
const getCentroid = (coordinates) => {
  // Assuming first ring is the outer boundary
  const points = coordinates[0]; 
  if (!points || points.length === 0) return [0, 0];
  const total = points.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
  return [total[0] / points.length, total[1] / points.length];
};

const getTaskType = (title) => {
  if (title.includes('灌溉')) return 'irrigation';
  if (title.includes('追肥')) return 'fertilization';
  if (title.includes('巡田') || title.includes('巡检')) return 'patrol';
  if (title.includes('防治')) return 'pest-control';
  if (title.includes('修复')) return 'repair';
  return 'general';
};

// --- Map Logic ---
const baseMapRef = ref(null);
const highlightedPlotId = ref(null);
const popupContainer = ref(null);
let activePopupInstance = null;
const selectedTaskForPopup = ref(null);

const mapLayers = computed(() => {
    // Layer for individual task points
    const individualTaskLayerData = {
        type: 'FeatureCollection',
        features: filteredTasks.value.map(task => {
            const plotFeature = shandongPlots.features.find(f => f.properties.id === task.plotId);
            if (!plotFeature) return null;
            return {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: getCentroid(plotFeature.geometry.coordinates) },
                properties: { ...task, taskType: getTaskType(task.title) }
            };
        }).filter(Boolean)
    };

    return {
      'plots-fill': {
        data: shandongPlots,
        type: 'fill',
        paint: { 'fill-color': '#2E7462', 'fill-opacity': 0.5 }
      },
      'plots-outline': {
        data: shandongPlots,
        type: 'line',
        paint: {
           'line-color': ['case', ['==', ['get', 'id'], highlightedPlotId.value || ''], '#3370FF', '#FFFFFF'],
           'line-width': ['case', ['==', ['get', 'id'], highlightedPlotId.value || ''], 2.5, 1]
        }
      },
      'task-points': {
          data: individualTaskLayerData,
          type: 'circle',
          paint: {
            'circle-radius': 7,
            'circle-color': [
                'match', ['get', 'taskType'],
                'irrigation', '#3498db', 'fertilization', '#2ecc71', 'patrol', '#9b59b6',
                'pest-control', '#f1c40f', 'repair', '#e74c3c', '#bdc3c7'
            ],
            'circle-stroke-width': ['match', ['get', 'priority'], '高', 3, '中', 1.5, 1],
            'circle-stroke-color': ['match', ['get', 'priority'], '高', '#c0392b', '中', '#f39c12', '#7f8c8d'],
            'circle-opacity': 0.8
          }
      }
    }
});

const highlightPlot = (row) => {
  if (row && row.plotId) {
    highlightedPlotId.value = row.plotId;
  }
};

const clearPlotHighlight = () => {
  highlightedPlotId.value = null;
};

const flyToPlot = (row) => {
  if (!row || !row.plotId || !baseMapRef.value) return;
  const plotFeature = shandongPlots.features.find(f => f.properties.id === row.plotId);
  if (!plotFeature) return;
  const centroid = getCentroid(plotFeature.geometry.coordinates);
  baseMapRef.value.flyTo({ center: centroid, zoom: 15, pitch: 45, speed: 1.2 });
};

const onFeatureClicked = ({ layerId, feature, lngLat }) => {
  if (layerId === 'task-points') {
    selectedTaskForPopup.value = feature.properties;
    
    nextTick(() => {
      if (activePopupInstance) activePopupInstance.remove();
      if (popupContainer.value) {
        activePopupInstance = new maplibregl.Popup({ closeButton: false, maxWidth: 'none' })
          .setLngLat(lngLat)
          .setDOMContent(popupContainer.value)
          .addTo(baseMapRef.value.map);
      }
    });
  }
};

// --- Data Source ---
const plotOptions = computed(() => 
  shandongPlots.features.map(feature => ({
    value: feature.properties.id,
    label: feature.properties.name
  }))
);

const userOptions = ref(usersData);

// --- Core Logic ---
const currentView = ref('list'); // Default to list view
const filters = ref({ keyword: '', plot: '', assignee: '', status: '' }); // Added status filter
const filteredTasks = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const selectedTaskIds = ref([]);

const applyFilters = () => {
  let tempTasks = tasks.value;

  // Status Filter Logic
  if (filters.value.status) {
    tempTasks = tempTasks.filter(t => t.status === filters.value.status);
  } else {
    // By default, hide ignored and archived tasks
    tempTasks = tempTasks.filter(t => !['ignored', 'archived'].includes(t.status));
  }

  if (filters.value.keyword) {
    tempTasks = tempTasks.filter(t => t.title.toLowerCase().includes(filters.value.keyword.toLowerCase()));
  }
  if (filters.value.plot) {
    tempTasks = tempTasks.filter(t => t.plotId === filters.value.plot);
  }
  if (filters.value.assignee) {
    tempTasks = tempTasks.filter(t => t.assignee === filters.value.assignee);
  }
  filteredTasks.value = tempTasks;
  currentPage.value = 1; // Reset to first page after filtering
};

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTasks.value.slice(start, end);
});

const handlePageChange = (page) => {
  currentPage.value = page;
};

const handleSelectionChange = (selection) => {
  selectedTaskIds.value = selection.map(item => item.id);
};

// --- Kanban Specific Logic ---
const columns = ref([
  { id: 'suggested', title: 'AI建议' },
  { id: 'pending', title: '待下发' },
  { id: 'assigned', title: '执行中' },
  { id: 'feedback', title: '问题反馈' },
  { id: 'completed', title: '已完成' },
]);

const handleItemMove = ({ itemId, newStatusId }) => {
  const column = columns.value.find(c => c.id === newStatusId);
  if (column) {
    updateTask(itemId, { status: newStatusId });
    ElMessage.success(`任务已移至 "${column.title}"`);
  }
};

// --- Calendar Specific Logic ---
const calendarEvents = computed(() => {
    const statusColorMap = {
    suggested: '#409EFF',
    pending: '#909399',
    assigned: '#67C23A',
    feedback: '#E6A23C',
    completed: '#a5d6a7',
  };
  return filteredTasks.value.map(task => ({
    id: task.id,
    title: task.title,
    startDate: task.dueDate, // Tasks have a due date, not a range
    endDate: task.dueDate,
    color: statusColorMap[task.status] || 'gray',
    ...task
  }));
});


// --- Modal & CRUD Logic ---
const taskDetailsVisible = ref(false);
const selectedTask = ref({});
const isNewTask = ref(false);

const handleNewTask = () => {
  selectedTask.value = { priority: '中', status: 'todo' };
  isNewTask.value = true;
  taskDetailsVisible.value = true;
};

const openTaskDetails = (task) => {
  selectedTask.value = { ...task };
  isNewTask.value = false;
  taskDetailsVisible.value = true;
};

const saveTask = () => {
  const plot = plotOptions.value.find(p => p.value === selectedTask.value.plotId);
  selectedTask.value.plotName = plot ? plot.label : '';

  if (isNewTask.value) {
    createTaskComposable({ ...selectedTask.value, status: 'pending', source: 'manual' });
    ElMessage.success('新任务已创建，状态为"待下发"');
  } else {
    // Check if we are saving a reviewed AI suggestion
    if (selectedTask.value.status === 'suggested') {
      updateTask(selectedTask.value.id, { ...selectedTask.value, status: 'pending' });
      ElMessage.success('AI建议已审核优化，进入待下发状态');
    } else {
      updateTask(selectedTask.value.id, selectedTask.value);
      ElMessage.success('任务已更新！');
    }
  }
  taskDetailsVisible.value = false;
  // applyFilters will be triggered by reactive changes in tasks
};

const handleDeleteTask = (task) => {
  ElMessageBox.confirm(`确定要删除任务 "${task.title}" 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    deleteTaskComposable(task.id);
    ElMessage.success('任务已删除');
  }).catch(() => {});
};

const handleBulkDelete = () => {
   ElMessageBox.confirm(`确定要删除选中的 ${selectedTaskIds.value.length} 个任务吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    selectedTaskIds.value.forEach(id => deleteTaskComposable(id));
    ElMessage.success('批量删除成功');
  }).catch(() => {});
};

// --- Action Handler for List View ---
const handleTaskAction = (action, payload) => {
  const taskId = typeof payload === 'object' ? payload.id : payload;
  
  switch (action) {
    case 'review':
      openTaskDetails(payload); // payload is the full task object
      break;
    case 'ignore':
      updateTask(taskId, { status: 'ignored' });
      ElMessage.info('AI建议已忽略');
      break;
    case 'delete':
      ElMessageBox.confirm('确定要删除此任务吗？此操作不可恢复。', '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        deleteTaskComposable(taskId);
        ElMessage.success('任务已删除');
      }).catch(() => {});
      break;
    case 'assign':
      updateTask(taskId, { status: 'assigned' });
      ElMessage.success('任务已下发');
      break;
    case 'resolve':
       // In real app, this would open a dialog. Here we just open details.
      openTaskDetails(payload);
      break;
    case 'archive':
      updateTask(taskId, { status: 'archived' });
      ElMessage.success('任务已归档');
      break;
    case 'recover':
      updateTask(taskId, { status: 'suggested' });
      ElMessage.success('AI建议已恢复');
      break;
  }
};


// --- KPI & Helper Functions ---
const kpi = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  const activeTasks = tasks.value.filter(t => !['ignored', 'archived', 'completed'].includes(t.status));

  return {
    todo: tasks.value.filter(t => ['suggested', 'pending'].includes(t.status)).length,
    inProgress: tasks.value.filter(t => ['assigned', 'feedback'].includes(t.status)).length,
    dueToday: activeTasks.filter(t => t.dueDate === today).length,
    overdue: activeTasks.filter(t => t.dueDate < today).length,
  };
});

const getPriorityTagType = (priority) => {
  if (priority === '高' || priority === 'high') return 'danger';
  if (priority === '中' || priority === 'medium') return 'warning';
  return 'info';
};

const getStatusText = (status) => {
  const map = { 
    suggested: 'AI建议',
    pending: '待下发',
    assigned: '执行中',
    feedback: '问题反馈',
    completed: '已完成',
    ignored: '已忽略',
    archived: '已归档',
    // Legacy statuses for compatibility if needed
    todo: '待处理', 
    'in-progress': '进行中', 
    review: '待审核', 
    done: '已完成' 
  };
  return map[status] || '未知';
};

const getStatusTagType = (status) => {
  const map = { 
    suggested: 'primary',
    pending: 'info',
    assigned: 'success',
    feedback: 'warning',
    completed: 'success',
    ignored: 'default',
    archived: 'info',
     // Legacy statuses
    todo: 'info', 
    'in-progress': 'primary', 
    review: 'warning', 
    done: 'success' 
  };
  return map[status] || '';
};

// Initial data load - handled by onMounted
// applyFilters();
</script>

<style scoped>
.task-management-page {
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
}
.stat-card.urgent .stat-value { color: #e6a23c; }
.stat-card.overdue .stat-value { color: #f56c6c; }

.stat-title {
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-shrink: 0;
  align-items: center; /* Vertically align items */
}

.filters {
  display: flex;
  gap: 10px;
  align-items: center; /* Vertically align filter items */
}

.content-view {
  flex: 1;
  overflow: hidden;
}

/* New List-Map View Styles */
.list-map-view {
  display: grid;
  grid-template-columns: 6fr 4fr;
  gap: 20px;
  height: 100%;
}
.table-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.table-container .el-table {
  flex: 1;
  overflow-y: auto;
}
.map-container {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.action-buttons {
    display: flex;
    gap: 8px;
    /* justify-content: center; REMOVED */
}

/* Kanban View Styles (大部分已移至KanbanBoard.vue) */
.task-card {
  background: $panel-bg-color;
  border-radius: 6px;
  padding: 14px;
  margin-bottom: 10px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.25);
  border-left: 4px solid $primary-accent-color;
  transition: box-shadow 0.2s, background 0.2s;
}
.task-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.35);
}
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.task-plot { font-size: 12px; color: $text-color-secondary; }
.task-title { font-size: 14px; margin: 0 0 15px 0; line-height: 1.4; color: $title-color; }
.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: $text-color;
}
/* 状态色：左侧边框 + 低不透明度背景罩层 */
.task-card-suggested {
  border-left-color: $primary-accent-color;
  background: linear-gradient(0deg, rgba($primary-accent-color, 0.08), rgba($primary-accent-color, 0.08)), $panel-bg-color;
}
.task-card-pending {
  border-left-color: $border-color;
  background: linear-gradient(0deg, rgba(255,255,255,0.04), rgba(255,255,255,0.04)), $panel-bg-color;
}
.task-card-assigned {
  border-left-color: $secondary-accent-color;
  background: linear-gradient(0deg, rgba($secondary-accent-color, 0.08), rgba($secondary-accent-color, 0.08)), $panel-bg-color;
}
.task-card-feedback {
  border-left-color: #E6A23C; /* warning */
  background: linear-gradient(0deg, rgba(230,162,60,0.10), rgba(230,162,60,0.10)), $panel-bg-color;
}
.task-card-completed {
  border-left-color: #a5d6a7; /* soft green */
  background: linear-gradient(0deg, rgba(165,214,167,0.06), rgba(165,214,167,0.06)), $panel-bg-color;
}
.task-card-ignored {
  border-left-color: rgba(255,255,255,0.12);
  background: linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02)), $panel-bg-color;
}
.task-card-archived {
  border-left-color: rgba(255,255,255,0.15);
  background: linear-gradient(0deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03)), $panel-bg-color;
}
</style>

<style>
/* Scoped styles don't apply to map popups, so we need a global style block */
.maplibregl-popup-content {
  padding: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}
.maplibregl-popup-tip {
  border-top-color: rgba(21, 38, 62, 0.9) !important;
}
.maplibregl-popup-anchor-top .maplibregl-popup-tip {
  border-bottom-color: rgba(21, 38, 62, 0.9) !important;
}
.maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
  border-top-color: rgba(21, 38, 62, 0.9) !important;
}
.maplibregl-popup-anchor-left .maplibregl-popup-tip {
  border-right-color: rgba(21, 38, 62, 0.9) !important;
}
.maplibregl-popup-anchor-right .maplibregl-popup-tip {
  border-left-color: rgba(21, 38, 62, 0.9) !important;
}

.task-popup {
  width: 280px;
  background-color: rgba(21, 38, 62, 0.9);
  border: 1px solid #00aaff80;
  color: #E6E8EB;
  box-shadow: 0 0 15px rgba(0, 170, 255, 0.2);
  border-radius: 4px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.task-popup .popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(0, 170, 255, 0.1);
  border-bottom: 1px solid #00aaff80;
}

.task-popup .popup-header h4 {
  margin: 0;
  font-weight: bold;
  color: #FFFFFF;
  font-size: 16px;
  line-height: 1.2;
}

.task-popup .popup-body {
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;
}

.task-popup .info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 170, 255, 0.1);
}
.task-popup .info-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.task-popup .info-row span {
  color: #a0a6b8;
}

.task-popup .el-divider {
  background-color: rgba(0, 170, 255, 0.2);
  margin: 12px 0;
}

.task-popup .impact-analysis h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #FFFFFF;
  font-weight: bold;
}

.task-popup .impact-analysis ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-popup .impact-analysis li {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 13px;
}
.task-popup .impact-analysis .impact-value {
  color: #52c41a; /* Green for positive impact */
  font-weight: bold;
}
</style>


