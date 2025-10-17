import { ref, computed } from 'vue';

const STORAGE_KEY = 'agri_tasks_v2';

export function useTasks() {
  const allTasks = ref([]);
  const selectedTask = ref(null);
  const loading = ref(false);

  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allTasks.value));
    } catch (error) {
      console.error('Failed to save tasks to storage:', error);
    }
  };

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        allTasks.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load tasks from storage:', error);
    }
  };

  const seedMockData = () => {
    const mockTasks = [
      // 1. AI 建议任务 (suggested)
      {
        id: 'task-ai-001',
        title: '【AI建议】根据天气预报，C03地块有蚜虫风险',
        type: 'pest_control',
        status: 'suggested',
        priority: 'high',
        assignee: null,
        assigneeName: '',
        plotId: 'C03',
        plotName: '地块C03',
        description: '气象数据显示未来三天高温高湿，是蚜虫爆发的高风险期。建议立即对C03地块的小麦进行预防性喷药。',
        startDate: '2025-04-01',
        dueDate: '2025-04-03',
        completedDate: null,
        estimatedHours: 4,
        actualHours: 0,
        materials: [{ name: '吡虫啉', quantity: 2, unit: 'L' }],
        equipment: ['喷雾器'],
        weather: '高温高湿预警',
        progress: 0,
        createdAt: '2025-03-31',
        createdBy: 'AI助手',
        source: 'ai',
        feedbackHistory: []
      },
      // 1.2 AI 建议任务 (ignored)
      {
        id: 'task-ai-002',
        title: '【AI建议】E05地块灌溉提醒',
        type: 'irrigation',
        status: 'ignored',
        priority: 'medium',
        assignee: null,
        assigneeName: '',
        plotId: 'E05',
        plotName: '地块E05',
        description: '土壤湿度传感器数据显示E05地块湿度低于阈值，建议立即进行灌溉。',
        startDate: '2025-04-02',
        dueDate: '2025-04-03',
        completedDate: null,
        estimatedHours: 3,
        actualHours: 0,
        materials: [],
        equipment: ['灌溉系统'],
        weather: '晴朗',
        progress: 0,
        createdAt: '2025-04-01',
        createdBy: 'AI助手',
        source: 'ai',
        feedbackHistory: []
      },
      // 2. 手动创建，待下发任务 (pending)
      {
        id: 'task-002',
        title: 'B02地块施肥作业',
        type: 'fertilizing',
        status: 'pending',
        priority: 'medium',
        assignee: 'li',
        assigneeName: '李师傅',
        plotId: 'B02',
        plotName: '地块B02',
        description: '根据土壤检测结果进行精准施肥，主要补充氮磷钾元素。',
        startDate: '2025-03-22',
        dueDate: '2025-03-25',
        completedDate: null,
        estimatedHours: 6,
        actualHours: 0,
        materials: [
          { name: '尿素', quantity: 100, unit: 'kg' },
          { name: '磷酸二铵', quantity: 80, unit: 'kg' },
        ],
        equipment: ['施肥机'],
        weather: '多云',
        progress: 0,
        createdAt: '2025-03-18',
        createdBy: '王主任',
        source: 'manual',
        feedbackHistory: []
      },
       {
        id: 'task-002b',
        title: 'B03地块除草',
        type: 'pest_control',
        status: 'pending',
        priority: 'low',
        assignee: 'li',
        assigneeName: '李师傅',
        plotId: 'B03',
        plotName: '地块B03',
        description: '进行一次常规的田间除草作业。',
        startDate: '2025-04-05',
        dueDate: '2025-04-07',
        estimatedHours: 8,
        source: 'manual',
        feedbackHistory: []
      },
      // 3. 已下发/执行中任务 (assigned)
      {
        id: 'task-001',
        title: 'A01地块玉米播种',
        type: 'planting',
        status: 'assigned',
        priority: 'high',
        assignee: 'zhang',
        assigneeName: '张师傅',
        plotId: 'A01',
        plotName: '地块A01',
        description: '使用精密播种机进行玉米播种，播种密度为每亩6000株。',
        startDate: '2025-03-15',
        dueDate: '2025-03-20',
        completedDate: null,
        estimatedHours: 8,
        actualHours: 5,
        materials: [{ name: '玉米种子', quantity: 50, unit: 'kg' }],
        equipment: ['精密播种机'],
        weather: '晴天',
        progress: 60,
        createdAt: '2025-03-10',
        createdBy: '李主管',
        source: 'manual',
        feedbackHistory: []
      },
      // 4. 有问题反馈的任务 (feedback)
      {
        id: 'task-003',
        title: 'C03地块病虫害防治',
        type: 'pest_control',
        status: 'feedback',
        priority: 'high',
        assignee: 'wang',
        assigneeName: '王师傅',
        plotId: 'C03',
        plotName: '地块C03',
        description: '发现蚜虫危害，需要及时喷洒杀虫剂进行防治。',
        startDate: '2025-03-12',
        dueDate: '2025-03-15',
        completedDate: null,
        estimatedHours: 4,
        actualHours: 1,
        materials: [{ name: '吡虫啉', quantity: 2, unit: 'L' }],
        equipment: ['喷雾器'],
        weather: '无风',
        progress: 25,
        createdAt: '2025-03-10',
        createdBy: '张经理',
        source: 'manual',
        feedbackHistory: [
          {
            user: '王师傅',
            time: '2025-03-12 14:30',
            content: '喷雾器出现故障，无法正常工作，需要维修。'
          }
        ]
      },
      // 5. 已完成任务 (completed)
      {
        id: 'task-004',
        title: 'D04地块灌溉作业',
        type: 'irrigation',
        status: 'completed',
        priority: 'medium',
        assignee: 'zhang',
        assigneeName: '张师傅',
        plotId: 'D04',
        plotName: '地块D04',
        description: '根据土壤湿度监测结果进行补充灌溉。',
        startDate: '2025-03-08',
        dueDate: '2025-03-10',
        completedDate: '2025-03-09',
        estimatedHours: 3,
        actualHours: 3,
        materials: [],
        equipment: ['灌溉系统'],
        weather: '晴天',
        progress: 100,
        createdAt: '2025-03-05',
        createdBy: '李主管',
        source: 'manual',
        feedbackHistory: []
      },
       {
        id: 'task-004b',
        title: 'E05地块巡田',
        type: 'general',
        status: 'completed',
        priority: 'low',
        assignee: 'wang',
        assigneeName: '王师傅',
        plotId: 'E05',
        plotName: '地块E05',
        description: '常规巡田，检查作物生长情况。',
        startDate: '2025-04-01',
        dueDate: '2025-04-01',
        completedDate: '2025-04-01',
        estimatedHours: 2,
        actualHours: 2,
        progress: 100,
        source: 'manual',
        feedbackHistory: []
      },
      // 6. 已归档任务 (archived)
      {
        id: 'task-old-005',
        title: '去年冬季土地翻耕',
        type: 'planting',
        status: 'archived',
        priority: 'low',
        assignee: 'li',
        assigneeName: '李师傅',
        plotId: 'A01',
        plotName: '地块A01',
        description: '冬季对A01地块进行深度翻耕，改良土壤结构。',
        startDate: '2024-12-01',
        dueDate: '2024-12-10',
        completedDate: '2024-12-08',
        estimatedHours: 16,
        actualHours: 15,
        materials: [],
        equipment: ['深耕机'],
        weather: '晴朗',
        progress: 100,
        createdAt: '2024-11-25',
        createdBy: '王主任',
        source: 'manual',
        feedbackHistory: []
      },
      {
        id: "task-008",
        title: "【AI建议】根据湿度传感器数据，D区小麦地块有灌溉需求",
        type: 'irrigation',
        status: 'suggested',
        priority: 'medium',
        assignee: null,
        assigneeName: '',
        plotId: 'plot-d',
        plotName: 'D区小麦',
        description: "AI分析显示D区地块土壤湿度低于阈值20%，建议立即进行灌溉，预计需水量50立方米。",
        startDate: '2025-10-20',
        dueDate: '2025-10-25',
        completedDate: null,
        estimatedHours: 3,
        actualHours: 0,
        materials: [],
        equipment: ['灌溉系统'],
        weather: '多云',
        progress: 0,
        createdAt: '2025-10-18',
        createdBy: 'AI助手',
        source: 'ai',
        feedbackHistory: []
      },
      {
        id: "task-009",
        title: "C区玉米地块出现倒伏现象，请立即处理",
        type: 'pest_control',
        status: 'pending',
        priority: 'high',
        assignee: 'user-002',
        assigneeName: '李四',
        plotId: 'plot-c',
        plotName: 'C区玉米',
        description: "巡查发现C区玉米因大风出现局部倒伏，需要人工扶正并检查损失情况。",
        startDate: '2025-10-20',
        dueDate: '2025-10-22',
        completedDate: null,
        estimatedHours: 4,
        actualHours: 0,
        materials: [],
        equipment: ['扶正机'],
        weather: '大风',
        progress: 0,
        createdAt: '2025-10-19',
        createdBy: '王主管',
        source: 'manual',
        feedbackHistory: []
      },
      {
        id: "task-010",
        title: "【AI建议】E区大豆进入鼓粒期，建议补充磷钾肥",
        type: 'fertilizing',
        status: 'suggested',
        priority: 'medium',
        assignee: null,
        assigneeName: '',
        plotId: 'plot-e',
        plotName: 'E区大豆',
        description: "卫星遥感数据显示E区大豆长势良好，为提高产量和品质，AI建议进行一次叶面追肥，主要补充磷酸二氢钾。",
        startDate: '2025-10-25',
        dueDate: '2025-11-05',
        completedDate: null,
        estimatedHours: 2,
        actualHours: 0,
        materials: [],
        equipment: ['喷雾器'],
        weather: '晴朗',
        progress: 0,
        createdAt: '2025-10-23',
        createdBy: 'AI助手',
        source: 'ai',
        feedbackHistory: []
      },
      {
        id: "task-011",
        title: "完成A区小麦的收割后归档工作",
        type: 'planting',
        status: 'completed',
        priority: 'low',
        assignee: 'user-001',
        assigneeName: '张三',
        plotId: 'plot-a',
        plotName: 'A区小麦',
        description: "A区小麦已于昨日完成收割，请整理相关产量数据、成本数据并归档。",
        startDate: '2025-10-10',
        dueDate: '2025-10-15',
        completedDate: '2025-10-15',
        estimatedHours: 5,
        actualHours: 5,
        materials: [],
        equipment: ['收割机'],
        weather: '晴天',
        progress: 100,
        createdAt: '2025-10-09',
        createdBy: '李主管',
        source: 'manual',
        feedbackHistory: []
      },
      {
        id: "task-012",
        title: "无人机巡检B区水稻病虫害情况",
        type: 'pest_control',
        status: 'assigned',
        priority: 'high',
        assignee: 'user-003',
        assigneeName: '王五',
        plotId: 'plot-b',
        plotName: 'B区水稻',
        description: "安排无人机对B区水稻进行高清影像采集，重点排查稻飞虱和稻纵卷叶螟的发生迹象。",
        startDate: '2025-10-25',
        dueDate: '2025-10-28',
        completedDate: null,
        estimatedHours: 3,
        actualHours: 0,
        materials: [],
        equipment: ['无人机'],
        weather: '晴朗',
        progress: 0,
        createdAt: '2025-10-24',
        createdBy: '张经理',
        source: 'manual',
        feedbackHistory: []
      }
    ];
    allTasks.value = mockTasks;
    saveToStorage();
  };

  const fetchTasks = async () => {
    loading.value = true;
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      loadFromStorage();
      if (allTasks.value.length === 0) {
        seedMockData();
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      loading.value = false;
    }
  };

  const createTask = (taskData) => {
    const newTask = {
      id: `task-${Date.now()}`,
      ...taskData,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: '当前用户',
      progress: 0
    };
    allTasks.value.unshift(newTask);
    saveToStorage();
    return newTask;
  };

  const updateTask = (taskId, updates) => {
    const index = allTasks.value.findIndex(task => task.id === taskId);
    if (index !== -1) {
      allTasks.value[index] = { ...allTasks.value[index], ...updates };
      saveToStorage();
      return allTasks.value[index];
    }
    return null;
  };

  const moveTask = (taskId, newStatus) => {
    const task = allTasks.value.find(task => task.id === taskId);
    if (task) {
      task.status = newStatus;
      if (newStatus === 'completed') {
        task.completedDate = new Date().toISOString().split('T')[0];
        task.progress = 100;
      }
      saveToStorage();
      return task;
    }
    return null;
  };

  const deleteTask = (taskId) => {
    const index = allTasks.value.findIndex(task => task.id === taskId);
    if (index !== -1) {
      allTasks.value.splice(index, 1);
      saveToStorage();
      return true;
    }
    return false;
  };

  const getTaskById = (taskId) => {
    return allTasks.value.find(task => task.id === taskId);
  };

  const getTasksByStatus = (status) => {
    return allTasks.value.filter(task => task.status === status);
  };

  const getTasksByAssignee = (assignee) => {
    return allTasks.value.filter(task => task.assignee === assignee);
  };

  const getTasksByPlot = (plotId) => {
    return allTasks.value.filter(task => task.plotId === plotId);
  };

  return {
    // State
    allTasks,
    selectedTask,
    loading,

    // Actions
    fetchTasks,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    getTaskById,
    getTasksByStatus,
    getTasksByAssignee,
    getTasksByPlot
  };
}
