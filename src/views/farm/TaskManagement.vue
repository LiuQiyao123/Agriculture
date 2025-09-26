<template>
  <div class="page-container">
    <PageTitle title="任务管理 (Task Management)" subtitle="统一管理所有农事任务，确保按时按质完成" />
    <div class="content-area">
      <DataPanel>
        <template #title>
          <div class="panel-title-container">
            <span>农事任务</span>
            <div class="actions">
              <el-button type="primary" :icon="Plus" @click="handleCreateTask">
                创建任务
              </el-button>
            </div>
          </div>
        </template>
        
        <!-- 筛选器 -->
        <div class="filter-bar">
          <el-form inline>
            <el-form-item label="状态">
              <el-select v-model="filters.status" placeholder="全部状态" clearable>
                <el-option label="待处理" value="pending" />
                <el-option label="进行中" value="in_progress" />
                <el-option label="待审核" value="pending_review" />
                <el-option label="已完成" value="completed" />
              </el-select>
            </el-form-item>
            <el-form-item label="负责人">
              <el-select v-model="filters.assignee" placeholder="全部负责人" clearable>
                <el-option label="张师傅" value="zhang" />
                <el-option label="李师傅" value="li" />
                <el-option label="王师傅" value="wang" />
              </el-select>
            </el-form-item>
            <el-form-item label="任务类型">
              <el-select v-model="filters.type" placeholder="全部类型" clearable>
                <el-option label="播种" value="planting" />
                <el-option label="施肥" value="fertilizing" />
                <el-option label="灌溉" value="irrigation" />
                <el-option label="病虫害防治" value="pest_control" />
                <el-option label="采收" value="harvesting" />
              </el-select>
            </el-form-item>
            <el-form-item label="日期范围">
              <el-date-picker
                v-model="filters.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>
            <el-form-item>
              <el-button @click="resetFilters">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 视图切换 -->
        <div class="view-switcher">
          <el-radio-group v-model="currentView" @change="handleViewChange">
            <el-radio-button label="list">列表视图</el-radio-button>
            <el-radio-button label="kanban">看板视图</el-radio-button>
            <el-radio-button label="calendar">日历视图</el-radio-button>
            <el-radio-button label="map">地图视图</el-radio-button>
          </el-radio-group>
        </div>
        
        <!-- 任务内容区域 -->
        <div class="task-content">
          <!-- 列表视图 -->
          <TaskList 
            v-if="currentView === 'list'"
            :tasks="filteredTasks"
            :loading="loading"
            @task-click="handleTaskClick"
            @task-update="handleTaskUpdate"
          />
          
          <!-- 看板视图 -->
          <TaskKanban 
            v-if="currentView === 'kanban'"
            :tasks="filteredTasks"
            @task-move="handleTaskMove"
            @task-click="handleTaskClick"
          />
          
          <!-- 日历视图 -->
          <TaskCalendar 
            v-if="currentView === 'calendar'"
            :tasks="filteredTasks"
            @task-click="handleTaskClick"
          />
          
          <!-- 地图视图 -->
          <TaskMap 
            v-if="currentView === 'map'"
            :tasks="filteredTasks"
            @task-click="handleTaskClick"
          />
        </div>
      </DataPanel>
    </div>
    
    <!-- 任务详情对话框 -->
    <el-dialog
      v-model="isDetailVisible"
      :title="selectedTask?.title"
      width="70%"
      top="5vh"
    >
      <TaskDetail v-if="selectedTask" :task="selectedTask" @update="handleTaskUpdate" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import PageTitle from '@/components/PageTitle.vue';
import DataPanel from '@/components/DataPanel.vue';
import TaskList from '@/components/farm/TaskList.vue';
import TaskKanban from '@/components/farm/TaskKanban.vue';
import TaskCalendar from '@/components/farm/TaskCalendar.vue';
import TaskMap from '@/components/farm/TaskMap.vue';
import TaskDetail from '@/components/farm/TaskDetail.vue';
import { Plus } from '@element-plus/icons-vue';
import { useTasks } from '@/composables/farm/useTasks.js';

const { allTasks, loading, fetchTasks, updateTask, moveTask } = useTasks();

const currentView = ref('list');
const isDetailVisible = ref(false);
const selectedTask = ref(null);

const filters = ref({
  status: '',
  assignee: '',
  type: '',
  dateRange: []
});

const filteredTasks = computed(() => {
  let tasks = allTasks.value || [];
  
  if (filters.value.status) {
    tasks = tasks.filter(task => task.status === filters.value.status);
  }
  
  if (filters.value.assignee) {
    tasks = tasks.filter(task => task.assignee === filters.value.assignee);
  }
  
  if (filters.value.type) {
    tasks = tasks.filter(task => task.type === filters.value.type);
  }
  
  if (filters.value.dateRange && filters.value.dateRange.length === 2) {
    const [start, end] = filters.value.dateRange;
    tasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= start && taskDate <= end;
    });
  }
  
  return tasks;
});

onMounted(() => {
  fetchTasks();
});

const handleViewChange = (view) => {
  currentView.value = view;
};

const handleCreateTask = () => {
  // TODO: 实现创建任务功能
  console.log('Create new task');
};

const handleTaskClick = (task) => {
  selectedTask.value = task;
  isDetailVisible.value = true;
};

const handleTaskUpdate = (taskId, updates) => {
  updateTask(taskId, updates);
};

const handleTaskMove = (taskId, newStatus) => {
  moveTask(taskId, newStatus);
};

const resetFilters = () => {
  filters.value = {
    status: '',
    assignee: '',
    type: '',
    dateRange: []
  };
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
  padding: 10px;
  
  :deep(.panel-content) {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 10px;
  }
}

.panel-title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 10px;
  margin-bottom: 20px;
}

.filter-bar {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
  
  .el-form {
    margin: 0;
    
    .el-form-item {
      margin-bottom: 0;
      margin-right: 20px;
    }
  }
}

.view-switcher {
  margin-bottom: 20px;
  text-align: right;
}

.task-content {
  flex: 1;
  overflow: hidden;
}
</style>
