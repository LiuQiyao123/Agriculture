import { ref } from 'vue'

const STORAGE_KEY = 'rm_warehouses_v1'

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

function seedWarehouses() {
  const data = [
    { id: 'W-A', name: '仓库A', region: '高新区', capacity: 1200, latlng: [117.1202, 36.6512], stock: { N: 160, NP: 280, FUN: 80 } },
    { id: 'W-B', name: '仓库B', region: '历下区', capacity: 900, latlng: [117.0301, 36.6829], stock: { N: 60, NP: 140, PEST: 70 } },
    { id: 'W-C', name: '仓库C', region: '章丘区', capacity: 700, latlng: [117.2001, 36.6760], stock: { N: 220, NP: 90, FUN: 40 } },
    { id: 'W-D', name: '仓库D', region: '长清区', capacity: 600, latlng: [116.7517, 36.5536], stock: { N: 80, PEST: 100 } },
  ]
  saveToStorage(data)
  return data
}

export function useWarehouses() {
  const warehouses = ref([])

  const fetchWarehouses = async () => {
    let list = loadFromStorage()
    if (!list) list = seedWarehouses()
    warehouses.value = list
  }

  const createWarehouse = (payload) => {
    const id = `W-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    const item = { id, capacity: 500, stock: {}, latlng: [117.15, 36.67], ...payload }
    warehouses.value = [item, ...warehouses.value]
    saveToStorage(warehouses.value)
    return id
  }

  const updateWarehouse = (id, patch) => {
    warehouses.value = warehouses.value.map(w => w.id === id ? { ...w, ...patch } : w)
    saveToStorage(warehouses.value)
  }

  const deleteWarehouse = (id) => {
    warehouses.value = warehouses.value.filter(w => w.id !== id)
    saveToStorage(warehouses.value)
  }

  return { warehouses, fetchWarehouses, createWarehouse, updateWarehouse, deleteWarehouse }
}


