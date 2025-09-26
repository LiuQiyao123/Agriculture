<template>
  <div class="farming-calendar">
    <div class="calendar-header">
      <h3>农事日历</h3>
      <div class="calendar-controls">
        <el-button-group>
          <el-button 
            :type="viewMode === 'month' ? 'primary' : 'default'"
            @click="viewMode = 'month'"
          >
            月视图
          </el-button>
          <el-button 
            :type="viewMode === 'week' ? 'primary' : 'default'"
            @click="viewMode = 'week'"
          >
            周视图
          </el-button>
          <el-button 
            :type="viewMode === 'gantt' ? 'primary' : 'default'"
            @click="viewMode = 'gantt'"
          >
            甘特图
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <!-- 月视图 -->
    <div v-if="viewMode === 'month'" class="month-view">
      <el-calendar v-model="currentDate">
        <template #date-cell="{ date, data }">
          <div class="calendar-cell">
            <div class="date-number">{{ date.getDate() }}</div>
            <div class="tasks-list">
              <div 
                v-for="task in getTasksForDate(date)" 
                :key="task.id"
                class="task-item"
                :class="`task-${task.type}`"
                @click="handleTaskClick(task)"
              >
                {{ task.title }}
              </div>
            </div>
          </div>
        </template>
      </el-calendar>
    </div>
    
    <!-- 周视图 -->
    <div v-if="viewMode === 'week'" class="week-view">
      <div class="week-header">
        <div class="week-nav">
          <el-button @click="previousWeek">上一周</el-button>
          <span class="week-title">{{ currentWeekTitle }}</span>
          <el-button @click="nextWeek">下一周</el-button>
        </div>
      </div>
      <div class="week-grid">
        <div class="time-column">
          <div class="time-header">时间</div>
          <div 
            v-for="hour in 24" 
            :key="hour"
            class="time-slot"
          >
            {{ hour.toString().padStart(2, '0') }}:00
          </div>
        </div>
        <div 
          v-for="day in weekDays" 
          :key="day.date"
          class="day-column"
        >
          <div class="day-header">
            <div class="day-name">{{ day.name }}</div>
            <div class="day-date">{{ day.date }}</div>
          </div>
          <div class="day-tasks">
            <div 
              v-for="task in getTasksForDate(day.dateObj)" 
              :key="task.id"
              class="task-block"
              :class="`task-${task.type}`"
              :style="getTaskStyle(task)"
              @click="handleTaskClick(task)"
            >
              <div class="task-title">{{ task.title }}</div>
              <div class="task-time">{{ task.startTime }} - {{ task.endTime }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 甘特图视图 -->
    <div v-if="viewMode === 'gantt'" class="gantt-view">
      <div class="gantt-container">
        <div class="gantt-header">
          <div class="task-column">任务</div>
          <div class="timeline-column">
            <div class="timeline-header">
              <div 
                v-for="month in ganttMonths" 
                :key="month"
                class="month-header"
              >
                {{ month }}
              </div>
            </div>
          </div>
        </div>
        <div class="gantt-body">
          <div 
            v-for="task in ganttTasks" 
            :key="task.id"
            class="gantt-row"
          >
            <div class="task-info">
              <div class="task-name">{{ task.title }}</div>
              <div class="task-duration">{{ task.duration }}天</div>
            </div>
            <div class="task-bar-container">
              <div 
                class="task-bar"
                :class="`task-${task.type}`"
                :style="getGanttTaskStyle(task)"
                @click="handleTaskClick(task)"
              >
                <span class="task-label">{{ task.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  plan: {
    type: Object,
    required: true
  },
  tasks: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['task-clicked']);

const viewMode = ref('month');
const currentDate = ref(new Date());
const currentWeek = ref(new Date());

// 生成农事任务
const farmingTasks = computed(() => {
  if (!props.plan) return [];
  
  const tasks = [];
  const startDate = new Date(props.plan.startDate);
  const endDate = new Date(props.plan.endDate);
  const crop = props.plan.crop;
  
  // 根据作物类型生成不同的农事任务
  const taskTemplates = getTaskTemplatesByCrop(crop);
  
  taskTemplates.forEach(template => {
    const taskDate = new Date(startDate);
    taskDate.setDate(startDate.getDate() + template.dayOffset);
    
    if (taskDate <= endDate) {
      tasks.push({
        id: `task-${template.type}-${taskDate.getTime()}`,
        title: template.title,
        type: template.type,
        date: taskDate,
        startTime: template.startTime,
        endTime: template.endTime,
        duration: template.duration,
        description: template.description,
        status: 'pending'
      });
    }
  });
  
  return tasks.sort((a, b) => a.date - b.date);
});

const getTaskTemplatesByCrop = (crop) => {
  const templates = {
    '玉米': [
      { type: 'preparation', title: '整地施肥', dayOffset: 0, startTime: '08:00', endTime: '17:00', duration: 3, description: '深翻整地，施入基肥' },
      { type: 'planting', title: '播种', dayOffset: 3, startTime: '08:00', endTime: '16:00', duration: 2, description: '机械播种，控制密度' },
      { type: 'fertilizing', title: '追肥', dayOffset: 30, startTime: '08:00', endTime: '16:00', duration: 1, description: '苗期追肥' },
      { type: 'weeding', title: '除草', dayOffset: 45, startTime: '08:00', endTime: '17:00', duration: 2, description: '机械除草' },
      { type: 'pest_control', title: '病虫害防治', dayOffset: 60, startTime: '08:00', endTime: '16:00', duration: 1, description: '喷施农药' },
      { type: 'harvest', title: '收获', dayOffset: 120, startTime: '08:00', endTime: '18:00', duration: 5, description: '机械收获' }
    ],
    '水稻': [
      { type: 'preparation', title: '整地', dayOffset: 0, startTime: '08:00', endTime: '17:00', duration: 5, description: '水田整地' },
      { type: 'planting', title: '插秧', dayOffset: 5, startTime: '08:00', endTime: '16:00', duration: 3, description: '人工插秧' },
      { type: 'watering', title: '灌溉管理', dayOffset: 20, startTime: '08:00', endTime: '16:00', duration: 1, description: '水位管理' },
      { type: 'fertilizing', title: '追肥', dayOffset: 40, startTime: '08:00', endTime: '16:00', duration: 1, description: '分蘖期追肥' },
      { type: 'pest_control', title: '病虫害防治', dayOffset: 70, startTime: '08:00', endTime: '16:00', duration: 2, description: '综合防治' },
      { type: 'harvest', title: '收获', dayOffset: 140, startTime: '08:00', endTime: '18:00', duration: 7, description: '机械收获' }
    ]
  };
  
  return templates[crop] || templates['玉米'];
};

const getTasksForDate = (date) => {
  if (!date) return [];
  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) return [];
  
  return farmingTasks.value.filter(task => {
    const taskDate = new Date(task.date);
    return taskDate.toDateString() === targetDate.toDateString();
  });
};

const weekDays = computed(() => {
  const startOfWeek = new Date(currentWeek.value);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    days.push({
      date: date.getDate(),
      name: ['日', '一', '二', '三', '四', '五', '六'][i],
      dateObj: date
    });
  }
  return days;
});

const currentWeekTitle = computed(() => {
  const startOfWeek = new Date(currentWeek.value);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  return `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()} - ${endOfWeek.getMonth() + 1}/${endOfWeek.getDate()}`;
});

const ganttTasks = computed(() => {
  return farmingTasks.value.map(task => ({
    ...task,
    startDate: task.date,
    endDate: new Date(task.date.getTime() + task.duration * 24 * 60 * 60 * 1000)
  }));
});

const ganttMonths = computed(() => {
  const months = [];
  const startDate = new Date(props.plan.startDate);
  const endDate = new Date(props.plan.endDate);
  
  let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  while (current <= endDate) {
    months.push(`${current.getFullYear()}/${current.getMonth() + 1}`);
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
});

const getTaskStyle = (task) => {
  if (!task || !task.startTime || !task.endTime) {
    return { top: '0%', height: '0%' };
  }
  
  const startHour = parseInt(task.startTime.split(':')[0]);
  const endHour = parseInt(task.endTime.split(':')[0]);
  const top = (startHour / 24) * 100;
  const height = ((endHour - startHour) / 24) * 100;
  
  return {
    top: `${top}%`,
    height: `${height}%`
  };
};

const getGanttTaskStyle = (task) => {
  if (!task || !props.plan || !props.plan.startDate || !props.plan.endDate) {
    return { left: '0%', width: '0%' };
  }
  
  const startDate = new Date(props.plan.startDate);
  const endDate = new Date(props.plan.endDate);
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  if (totalDays <= 0) {
    return { left: '0%', width: '0%' };
  }
  
  const taskStart = new Date(task.startDate);
  const taskEnd = new Date(task.endDate);
  const taskStartDay = Math.ceil((taskStart - startDate) / (1000 * 60 * 60 * 24));
  const taskDuration = Math.ceil((taskEnd - taskStart) / (1000 * 60 * 60 * 24));
  
  const left = Math.max(0, (taskStartDay / totalDays) * 100);
  const width = Math.max(0, (taskDuration / totalDays) * 100);
  
  return {
    left: `${left}%`,
    width: `${width}%`
  };
};

const handleTaskClick = (task) => {
  emit('task-clicked', task);
};

const previousWeek = () => {
  currentWeek.value = new Date(currentWeek.value.getTime() - 7 * 24 * 60 * 60 * 1000);
};

const nextWeek = () => {
  currentWeek.value = new Date(currentWeek.value.getTime() + 7 * 24 * 60 * 60 * 1000);
};
</script>

<style scoped lang="scss">
.farming-calendar {
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      color: #303133;
    }
  }
  
  .calendar-cell {
    height: 100px;
    padding: 4px;
    
    .date-number {
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .tasks-list {
      .task-item {
        font-size: 12px;
        padding: 2px 4px;
        margin-bottom: 2px;
        border-radius: 2px;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        
        &.task-preparation { background: #e1f5fe; color: #0277bd; }
        &.task-planting { background: #e8f5e8; color: #2e7d32; }
        &.task-fertilizing { background: #fff3e0; color: #f57c00; }
        &.task-weeding { background: #f3e5f5; color: #7b1fa2; }
        &.task-pest_control { background: #ffebee; color: #c62828; }
        &.task-harvest { background: #e0f2f1; color: #00695c; }
        &.task-watering { background: #e3f2fd; color: #1565c0; }
      }
    }
  }
  
  .week-view {
    .week-header {
      margin-bottom: 15px;
      
      .week-nav {
        display: flex;
        align-items: center;
        gap: 15px;
        
        .week-title {
          font-weight: 600;
          color: #303133;
        }
      }
    }
    
    .week-grid {
      display: flex;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      overflow: hidden;
      
      .time-column {
        width: 80px;
        border-right: 1px solid #e4e7ed;
        
        .time-header {
          padding: 10px;
          background: #f5f7fa;
          font-weight: 600;
          text-align: center;
          border-bottom: 1px solid #e4e7ed;
        }
        
        .time-slot {
          padding: 8px;
          text-align: center;
          font-size: 12px;
          color: #909399;
          border-bottom: 1px solid #f0f0f0;
          height: 30px;
          line-height: 14px;
        }
      }
      
      .day-column {
        flex: 1;
        border-right: 1px solid #e4e7ed;
        
        &:last-child {
          border-right: none;
        }
        
        .day-header {
          padding: 10px;
          background: #f5f7fa;
          text-align: center;
          border-bottom: 1px solid #e4e7ed;
          
          .day-name {
            font-weight: 600;
            color: #303133;
          }
          
          .day-date {
            font-size: 12px;
            color: #909399;
            margin-top: 2px;
          }
        }
        
        .day-tasks {
          position: relative;
          height: 720px; // 24 * 30px
          
          .task-block {
            position: absolute;
            left: 2px;
            right: 2px;
            padding: 4px;
            border-radius: 2px;
            cursor: pointer;
            font-size: 12px;
            
            .task-title {
              font-weight: 500;
              margin-bottom: 2px;
            }
            
            .task-time {
              font-size: 10px;
              opacity: 0.8;
            }
            
            &.task-preparation { background: #e1f5fe; color: #0277bd; }
            &.task-planting { background: #e8f5e8; color: #2e7d32; }
            &.task-fertilizing { background: #fff3e0; color: #f57c00; }
            &.task-weeding { background: #f3e5f5; color: #7b1fa2; }
            &.task-pest_control { background: #ffebee; color: #c62828; }
            &.task-harvest { background: #e0f2f1; color: #00695c; }
            &.task-watering { background: #e3f2fd; color: #1565c0; }
          }
        }
      }
    }
  }
  
  .gantt-view {
    .gantt-container {
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      overflow: hidden;
      
      .gantt-header {
        display: flex;
        background: #f5f7fa;
        border-bottom: 1px solid #e4e7ed;
        
        .task-column {
          width: 200px;
          padding: 15px;
          font-weight: 600;
          border-right: 1px solid #e4e7ed;
        }
        
        .timeline-column {
          flex: 1;
          
          .timeline-header {
            display: flex;
            
            .month-header {
              flex: 1;
              padding: 15px 10px;
              text-align: center;
              font-weight: 600;
              border-right: 1px solid #e4e7ed;
              
              &:last-child {
                border-right: none;
              }
            }
          }
        }
      }
      
      .gantt-body {
        .gantt-row {
          display: flex;
          border-bottom: 1px solid #f0f0f0;
          
          &:last-child {
            border-bottom: none;
          }
          
          .task-info {
            width: 200px;
            padding: 15px;
            border-right: 1px solid #e4e7ed;
            
            .task-name {
              font-weight: 500;
              margin-bottom: 4px;
            }
            
            .task-duration {
              font-size: 12px;
              color: #909399;
            }
          }
          
          .task-bar-container {
            flex: 1;
            position: relative;
            padding: 10px 0;
            
            .task-bar {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              height: 20px;
              border-radius: 2px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              
              .task-label {
                font-size: 12px;
                color: white;
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100%;
              }
              
              &.task-preparation { background: #0277bd; }
              &.task-planting { background: #2e7d32; }
              &.task-fertilizing { background: #f57c00; }
              &.task-weeding { background: #7b1fa2; }
              &.task-pest_control { background: #c62828; }
              &.task-harvest { background: #00695c; }
              &.task-watering { background: #1565c0; }
            }
          }
        }
      }
    }
  }
}
</style>