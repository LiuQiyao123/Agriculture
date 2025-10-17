<!-- UNUSED: 未被任何视图/组件引用 -->
<template>
  <div class="task-gantt">
    <div class="gantt-header">
      <h3>任务甘特图</h3>
      <div class="gantt-controls">
        <el-button-group>
          <el-button @click="zoomOut" :disabled="zoomLevel <= 0.5">缩小</el-button>
          <el-button @click="zoomIn" :disabled="zoomLevel >= 2">放大</el-button>
        </el-button-group>
        <el-button @click="fitToScreen">适应屏幕</el-button>
      </div>
    </div>
    
    <div class="gantt-content" ref="ganttContainer">
      <div class="gantt-grid">
        <!-- 左侧任务列表 -->
        <div class="gantt-sidebar">
          <div class="gantt-sidebar-header">
            <div class="task-column">任务名称</div>
            <div class="assignee-column">负责人</div>
            <div class="duration-column">工期</div>
            <div class="progress-column">进度</div>
          </div>
          <div class="gantt-sidebar-body">
            <div 
              v-for="task in tasks" 
              :key="task.id"
              class="gantt-sidebar-row"
              :class="{ 'selected': selectedTask === task.id }"
              @click="selectTask(task)"
            >
              <div class="task-column">
                <div class="task-name">{{ task.title }}</div>
                <div class="task-type">{{ getTaskTypeText(task.type) }}</div>
              </div>
              <div class="assignee-column">{{ task.assigneeName }}</div>
              <div class="duration-column">{{ getDuration(task) }}天</div>
              <div class="progress-column">
                <el-progress 
                  :percentage="task.progress" 
                  :show-text="false"
                  :color="getProgressColor(task.progress)"
                />
                <span class="progress-text">{{ task.progress }}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧时间轴 -->
        <div class="gantt-timeline">
          <div class="gantt-timeline-header">
            <div 
              v-for="date in timelineDates" 
              :key="date"
              class="timeline-header-cell"
              :style="{ width: `${dayWidth}px` }"
            >
              <div class="date-label">{{ formatDate(date) }}</div>
              <div class="weekday-label">{{ getWeekday(date) }}</div>
            </div>
          </div>
          
          <div class="gantt-timeline-body">
            <div 
              v-for="task in tasks" 
              :key="task.id"
              class="gantt-timeline-row"
            >
              <div 
                v-for="date in timelineDates" 
                :key="date"
                class="timeline-cell"
                :style="{ width: `${dayWidth}px` }"
                :class="{ 
                  'is-weekend': isWeekend(date),
                  'is-today': isToday(date)
                }"
              ></div>
              
              <!-- 任务条 -->
              <div 
                v-if="isTaskInRange(task, timelineDates)"
                class="task-bar"
                :class="`task-${task.status}`"
                :style="getTaskBarStyle(task)"
                @click="selectTask(task)"
              >
                <div class="task-bar-content">
                  <div class="task-bar-title">{{ task.title }}</div>
                  <div class="task-bar-progress">
                    <div 
                      class="task-bar-progress-fill"
                      :style="{ width: `${task.progress}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 任务详情侧边栏 -->
    <div v-if="selectedTask" class="task-detail-sidebar">
      <div class="sidebar-header">
        <h4>{{ selectedTask.title }}</h4>
        <el-button @click="selectedTask = null" size="small">关闭</el-button>
      </div>
      <div class="sidebar-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="任务类型">{{ getTaskTypeText(selectedTask.type) }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ selectedTask.assigneeName }}</el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ selectedTask.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ selectedTask.dueDate }}</el-descriptions-item>
          <el-descriptions-item label="工期">{{ getDuration(selectedTask) }}天</el-descriptions-item>
          <el-descriptions-item label="进度">
            <el-progress :percentage="selectedTask.progress" />
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedTask.status)">
              {{ getStatusText(selectedTask.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="task-description">
          <h5>任务描述</h5>
          <p>{{ selectedTask.description }}</p>
        </div>
        
        <div class="task-materials" v-if="selectedTask.materials?.length">
          <h5>所需材料</h5>
          <ul>
            <li v-for="material in selectedTask.materials" :key="material.name">
              {{ material.name }} - {{ material.quantity }}{{ material.unit }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  },
  startDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  endDate: {
    type: String,
    default: () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 3);
      return date.toISOString().split('T')[0];
    }
  }
});

const emit = defineEmits(['task-click', 'task-update']);

const ganttContainer = ref();
const selectedTask = ref(null);
const zoomLevel = ref(1);
const dayWidth = computed(() => 30 * zoomLevel.value);

const timelineDates = computed(() => {
  const dates = [];
  const start = new Date(props.startDate);
  const end = new Date(props.endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split('T')[0]);
  }
  
  return dates;
});

const selectTask = (task) => {
  selectedTask.value = task;
  emit('task-click', task);
};

const isTaskInRange = (task, dates) => {
  return dates.includes(task.startDate) || dates.includes(task.dueDate) ||
         (task.startDate <= dates[dates.length - 1] && task.dueDate >= dates[0]);
};

const getTaskBarStyle = (task) => {
  const startIndex = timelineDates.value.indexOf(task.startDate);
  const endIndex = timelineDates.value.indexOf(task.dueDate);
  
  if (startIndex === -1 || endIndex === -1) return {};
  
  const left = startIndex * dayWidth.value;
  const width = (endIndex - startIndex + 1) * dayWidth.value;
  
  return {
    left: `${left}px`,
    width: `${width}px`
  };
};

const getDuration = (task) => {
  const start = new Date(task.startDate);
  const end = new Date(task.dueDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const getWeekday = (dateStr) => {
  const date = new Date(dateStr);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return weekdays[date.getDay()];
};

const isWeekend = (dateStr) => {
  const date = new Date(dateStr);
  return date.getDay() === 0 || date.getDay() === 6;
};

const isToday = (dateStr) => {
  return dateStr === new Date().toISOString().split('T')[0];
};

const getTaskTypeText = (type) => {
  const typeMap = {
    'planting': '播种',
    'fertilizing': '施肥',
    'irrigation': '灌溉',
    'pest_control': '病虫害防治',
    'harvesting': '采收'
  };
  return typeMap[type] || type;
};

const getStatusType = (status) => {
  const statusMap = {
    'pending': 'info',
    'in_progress': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  };
  return statusMap[status] || 'default';
};

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待处理',
    'in_progress': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  };
  return statusMap[status] || status;
};

const getProgressColor = (progress) => {
  if (progress < 30) return '#f56c6c';
  if (progress < 70) return '#e6a23c';
  return '#67c23a';
};

const zoomIn = () => {
  if (zoomLevel.value < 2) {
    zoomLevel.value += 0.25;
  }
};

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value -= 0.25;
  }
};

const fitToScreen = () => {
  zoomLevel.value = 1;
};

onMounted(() => {
  nextTick(() => {
    // 初始化甘特图
  });
});
</script>

<style scoped lang="scss">
.task-gantt {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  
  .gantt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      color: #303133;
    }
    
    .gantt-controls {
      display: flex;
      gap: 10px;
    }
  }
  
  .gantt-content {
    flex: 1;
    overflow: auto;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
  }
  
  .gantt-grid {
    display: flex;
    min-width: 100%;
  }
  
  .gantt-sidebar {
    width: 400px;
    border-right: 1px solid #e4e7ed;
    background: #fafafa;
    
    .gantt-sidebar-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      background: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
      font-weight: 600;
      color: #606266;
    }
    
    .gantt-sidebar-body {
      .gantt-sidebar-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        border-bottom: 1px solid #e4e7ed;
        padding: 12px 8px;
        cursor: pointer;
        transition: background-color 0.3s;
        
        &:hover {
          background: #f0f9ff;
        }
        
        &.selected {
          background: #e6f7ff;
        }
        
        .task-column {
          .task-name {
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
          }
          
          .task-type {
            font-size: 12px;
            color: #909399;
          }
        }
        
        .assignee-column,
        .duration-column {
          font-size: 14px;
          color: #606266;
          display: flex;
          align-items: center;
        }
        
        .progress-column {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .progress-text {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }
  
  .gantt-timeline {
    flex: 1;
    min-width: 600px;
    
    .gantt-timeline-header {
      display: flex;
      background: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
    }
    
    .timeline-header-cell {
      padding: 8px 4px;
      text-align: center;
      border-right: 1px solid #e4e7ed;
      
      .date-label {
        font-weight: 600;
        color: #303133;
        font-size: 14px;
      }
      
      .weekday-label {
        font-size: 12px;
        color: #909399;
        margin-top: 2px;
      }
    }
    
    .gantt-timeline-body {
      position: relative;
      
      .gantt-timeline-row {
        display: flex;
        border-bottom: 1px solid #e4e7ed;
        min-height: 40px;
        position: relative;
        
        .timeline-cell {
          border-right: 1px solid #e4e7ed;
          
          &.is-weekend {
            background: #f8f9fa;
          }
          
          &.is-today {
            background: #e6f7ff;
          }
        }
        
        .task-bar {
          position: absolute;
          top: 4px;
          height: 32px;
          border-radius: 4px;
          cursor: pointer;
          z-index: 2;
          
          &.task-pending {
            background: #e6f7ff;
            border: 1px solid #91d5ff;
          }
          
          &.task-in_progress {
            background: #fff7e6;
            border: 1px solid #ffd591;
          }
          
          &.task-completed {
            background: #f6ffed;
            border: 1px solid #b7eb8f;
          }
          
          &.task-cancelled {
            background: #fff2f0;
            border: 1px solid #ffccc7;
          }
          
          .task-bar-content {
            padding: 4px 8px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            
            .task-bar-title {
              font-size: 12px;
              font-weight: 500;
              color: #303133;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .task-bar-progress {
              margin-top: 2px;
              height: 2px;
              background: rgba(0, 0, 0, 0.1);
              border-radius: 1px;
              overflow: hidden;
              
              .task-bar-progress-fill {
                height: 100%;
                background: #1890ff;
                transition: width 0.3s;
              }
            }
          }
        }
      }
    }
  }
  
  .task-detail-sidebar {
    position: absolute;
    top: 0;
    right: 0;
    width: 350px;
    height: 100%;
    background: white;
    border-left: 1px solid #e4e7ed;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
    
    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e4e7ed;
      
      h4 {
        margin: 0;
        color: #303133;
      }
    }
    
    .sidebar-content {
      padding: 16px;
      height: calc(100% - 60px);
      overflow-y: auto;
      
      .task-description,
      .task-materials {
        margin-top: 20px;
        
        h5 {
          margin-bottom: 10px;
          color: #303133;
        }
        
        p {
          color: #606266;
          line-height: 1.6;
        }
        
        ul {
          margin: 0;
          padding-left: 20px;
          
          li {
            color: #606266;
            margin-bottom: 4px;
          }
        }
      }
    }
  }
}
</style>
