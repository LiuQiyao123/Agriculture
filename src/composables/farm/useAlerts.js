import { ref, computed } from 'vue';

const STORAGE_KEY = 'agri_alerts_v1';

export function useAlerts() {
  const allAlerts = ref([]);
  const selectedAlert = ref(null);
  const loading = ref(false);

  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allAlerts.value));
    } catch (error) {
      console.error('Failed to save alerts to storage:', error);
    }
  };

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        allAlerts.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load alerts from storage:', error);
    }
  };

  const seedMockData = () => {
    const mockAlerts = [
      {
        id: 'alert_001',
        type: 'pest',
        title: 'A01地块发现蚜虫危害',
        description: 'A01地块玉米叶片出现蚜虫聚集，建议立即喷洒杀虫剂。',
        severity: 'high',
        status: 'pending',
        plotId: 'A01',
        plotName: 'A-01',
        createTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小时前
        updateTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        priority: 1
      },
      {
        id: 'alert_002',
        type: 'weather',
        title: '明日有强降雨预警',
        description: '气象部门发布强降雨预警，预计降雨量50-80mm，请注意排水防涝。',
        severity: 'urgent',
        status: 'pending',
        plotId: 'all',
        plotName: '全部地块',
        createTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30分钟前
        updateTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isRead: false,
        priority: 0
      },
      {
        id: 'alert_003',
        type: 'soil',
        title: 'B02地块土壤湿度异常',
        description: 'B02地块土壤湿度传感器检测到湿度值异常偏低，建议检查灌溉系统。',
        severity: 'medium',
        status: 'processing',
        plotId: 'B02',
        plotName: 'B-02',
        createTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4小时前
        updateTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1小时前
        isRead: true,
        priority: 2
      },
      {
        id: 'alert_004',
        type: 'device',
        title: '灌溉设备故障',
        description: 'C03地块灌溉设备出现故障，无法正常供水，需要维修。',
        severity: 'high',
        status: 'pending',
        plotId: 'C03',
        plotName: 'C-03',
        createTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6小时前
        updateTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        priority: 1
      },
      {
        id: 'alert_005',
        type: 'harvest',
        title: 'A01地块玉米即将成熟',
        description: 'A01地块玉米已达到最佳采收期，建议在3天内完成采收。',
        severity: 'medium',
        status: 'resolved',
        plotId: 'A01',
        plotName: 'A-01',
        createTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1天前
        updateTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小时前
        isRead: true,
        priority: 2
      },
      {
        id: 'alert_006',
        type: 'pest',
        title: 'D04地块发现叶斑病',
        description: 'D04地块大豆叶片出现叶斑病症状，建议及时喷洒杀菌剂。',
        severity: 'medium',
        status: 'pending',
        plotId: 'D04',
        plotName: 'D-04',
        createTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8小时前
        updateTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        priority: 2
      }
    ];

    allAlerts.value = mockAlerts;
    saveToStorage();
  };

  const fetchAlerts = async () => {
    loading.value = true;
    try {
      // 先尝试从本地存储加载
      loadFromStorage();
      
      // 如果没有数据，则使用模拟数据
      if (allAlerts.value.length === 0) {
        seedMockData();
      }
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      loading.value = false;
    }
  };

  const getAlertById = (id) => {
    return allAlerts.value.find(alert => alert.id === id);
  };

  const addAlert = (alert) => {
    const newAlert = {
      id: `alert_${Date.now()}`,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      isRead: false,
      status: 'pending',
      priority: 2,
      ...alert
    };
    
    allAlerts.value.unshift(newAlert);
    saveToStorage();
    return newAlert;
  };

  const updateAlert = (id, updates) => {
    const index = allAlerts.value.findIndex(alert => alert.id === id);
    if (index !== -1) {
      allAlerts.value[index] = {
        ...allAlerts.value[index],
        ...updates,
        updateTime: new Date().toISOString()
      };
      saveToStorage();
      return allAlerts.value[index];
    }
    return null;
  };

  const deleteAlert = (id) => {
    const index = allAlerts.value.findIndex(alert => alert.id === id);
    if (index !== -1) {
      allAlerts.value.splice(index, 1);
      saveToStorage();
      return true;
    }
    return false;
  };

  const markAsRead = (id) => {
    return updateAlert(id, { isRead: true });
  };

  const markAsUnread = (id) => {
    return updateAlert(id, { isRead: false });
  };

  const processAlert = (id) => {
    return updateAlert(id, { status: 'processing' });
  };

  const resolveAlert = (id) => {
    return updateAlert(id, { status: 'resolved' });
  };

  // 计算属性
  const unreadCount = computed(() => {
    return allAlerts.value.filter(alert => !alert.isRead).length;
  });

  const urgentAlerts = computed(() => {
    return allAlerts.value.filter(alert => alert.severity === 'urgent' && alert.status !== 'resolved');
  });

  const pendingAlerts = computed(() => {
    return allAlerts.value.filter(alert => alert.status === 'pending');
  });

  const alertsByType = computed(() => {
    const grouped = {};
    allAlerts.value.forEach(alert => {
      if (!grouped[alert.type]) {
        grouped[alert.type] = [];
      }
      grouped[alert.type].push(alert);
    });
    return grouped;
  });

  const alertsBySeverity = computed(() => {
    const grouped = {};
    allAlerts.value.forEach(alert => {
      if (!grouped[alert.severity]) {
        grouped[alert.severity] = [];
      }
      grouped[alert.severity].push(alert);
    });
    return grouped;
  });

  const recentAlerts = computed(() => {
    return allAlerts.value
      .filter(alert => alert.status !== 'resolved')
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      .slice(0, 10);
  });

  return {
    // 状态
    allAlerts,
    selectedAlert,
    loading,
    
    // 方法
    fetchAlerts,
    getAlertById,
    addAlert,
    updateAlert,
    deleteAlert,
    markAsRead,
    markAsUnread,
    processAlert,
    resolveAlert,
    
    // 计算属性
    unreadCount,
    urgentAlerts,
    pendingAlerts,
    alertsByType,
    alertsBySeverity,
    recentAlerts
  };
}
