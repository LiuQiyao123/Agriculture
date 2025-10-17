import { ref } from 'vue'

const STORAGE_KEY = 'rm_machines_v2'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveToStorage(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch {}
}

function seedMachines() {
  const data = [
    { id: 'm-001', name: '收割机-01', type: '收割机', brand: '久保田', capability: '小麦/玉米收割', status: '空闲', operator: '王五', location: [117.1202, 36.6512] },
    { id: 'm-002', name: '播种机-02', type: '播种机', brand: '雷沃', capability: '玉米播种', status: '作业中', operator: '李四', location: [117.0301, 36.6829] },
    { id: 'm-003', name: '拖拉机-03', type: '拖拉机', brand: '东风', capability: '耕整/运输', status: '保养', operator: '张三', location: [117.2001, 36.6760] },
    { id: 'm-004', name: '收割机-04', type: '收割机', brand: '约翰迪尔', capability: '小麦/大豆收割', status: '空闲', operator: '赵六', location: [117.1560, 36.7002] },
    { id: 'm-005', name: '播种机-05', type: '播种机', brand: '中联', capability: '小麦/玉米播种', status: '维修', operator: '钱七', location: [117.0850, 36.6400] },
    { id: 'm-006', name: '无人机-06', type: '无人机', brand: '大疆', capability: '植保/巡检', status: '空闲', operator: '孙八', location: [117.1805, 36.6650] },
    { id: 'm-007', name: '拖拉机-07', type: '拖拉机', brand: '东方红', capability: '深耕/运输', status: '空闲', operator: '周九', location: [117.1400, 36.6900] },
    { id: 'm-008', name: '收割机-08', type: '收割机', brand: '久保田', capability: '玉米收割', status: '作业中', operator: '吴十', location: [117.1100, 36.6750] },
    { id: 'm-009', name: '播种机-09', type: '播种机', brand: '雷沃', capability: '小麦播种', status: '空闲', operator: '郑十一', location: [117.0950, 36.7200] },
    { id: 'm-010', name: '拖拉机-10', type: '拖拉机', brand: '东风', capability: '旋耕/运输', status: '空闲', operator: '冯十二', location: [117.2100, 36.6400] },
  ]
  saveToStorage(data)
  return data
}

export function useMachines() {
  const machines = ref([])

  const fetchMachines = async () => {
    let list = loadFromStorage()
    if (!list) list = seedMachines()
    machines.value = list
  }

  const createMachine = (payload) => {
    const id = `m-${Math.random().toString(36).slice(2, 7)}`
    const item = { id, status: '空闲', location: [117.15, 36.67], ...payload }
    machines.value = [item, ...machines.value]
    saveToStorage(machines.value)
    return id
  }

  const updateMachine = (id, patch) => {
    machines.value = machines.value.map(m => m.id === id ? { ...m, ...patch } : m)
    saveToStorage(machines.value)
  }

  const deleteMachine = (id) => {
    machines.value = machines.value.filter(m => m.id !== id)
    saveToStorage(machines.value)
  }

  return { machines, fetchMachines, createMachine, updateMachine, deleteMachine }
}
