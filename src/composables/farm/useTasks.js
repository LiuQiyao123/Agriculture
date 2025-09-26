import { ref, computed } from 'vue';

const STORAGE_KEY = 'agri_tasks_v1';

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
      {
        id: 'task-001',
        title: 'A01地块玉米播种',
        type: 'planting',
        status: 'in_progress',
        priority: 'high',
        assignee: 'zhang',
        assigneeName: '张师傅',
        plotId: 'A01',
        plotName: '地块A01',
        description: '使用精密播种机进行玉米播种，播种密度为每亩6000株',
        startDate: '2025-03-15',
        dueDate: '2025-03-20',
        completedDate: null,
        estimatedHours: 8,
        actualHours: 0,
        materials: [
          { name: '玉米种子', quantity: 50, unit: 'kg' },
          { name: '复合肥', quantity: 200, unit: 'kg' }
        ],
        equipment: ['精密播种机', '拖拉机'],
        weather: '晴天，温度适宜',
        progress: 60,
        createdAt: '2025-03-10',
        createdBy: '李主管'
      },
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
        description: '根据土壤检测结果进行精准施肥，主要补充氮磷钾元素',
        startDate: '2025-03-22',
        dueDate: '2025-03-25',
        completedDate: null,
        estimatedHours: 6,
        actualHours: 0,
        materials: [
          { name: '尿素', quantity: 100, unit: 'kg' },
          { name: '磷酸二铵', quantity: 80, unit: 'kg' },
          { name: '硫酸钾', quantity: 60, unit: 'kg' }
        ],
        equipment: ['施肥机', '拖拉机'],
        weather: '多云，适合施肥',
        progress: 0,
        createdAt: '2025-03-18',
        createdBy: '王主任'
      },
      {
        id: 'task-003',
        title: 'C03地块病虫害防治',
        type: 'pest_control',
        status: 'pending_review',
        priority: 'high',
        assignee: 'wang',
        assigneeName: '王师傅',
        plotId: 'C03',
        plotName: '地块C03',
        description: '发现蚜虫危害，需要及时喷洒杀虫剂进行防治',
        startDate: '2025-03-12',
        dueDate: '2025-03-15',
        completedDate: '2025-03-14',
        estimatedHours: 4,
        actualHours: 4.5,
        materials: [
          { name: '吡虫啉', quantity: 2, unit: 'L' },
          { name: '助剂', quantity: 1, unit: 'L' }
        ],
        equipment: ['喷雾器', '防护服'],
        weather: '无风，适合喷药',
        progress: 100,
        createdAt: '2025-03-10',
        createdBy: '张经理',
        reviewNotes: '防治效果良好，蚜虫数量明显减少'
      },
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
        description: '根据土壤湿度监测结果进行补充灌溉',
        startDate: '2025-03-08',
        dueDate: '2025-03-10',
        completedDate: '2025-03-09',
        estimatedHours: 3,
        actualHours: 3,
        materials: [],
        equipment: ['灌溉系统'],
        weather: '晴天，蒸发量大',
        progress: 100,
        createdAt: '2025-03-05',
        createdBy: '李主管'
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
