import { ref } from 'vue'

// 以字典维护物资元数据：名称/单位/安全库存
const META_STORAGE = 'rm_items_meta_v1'

function loadMeta() {
  try { const raw = localStorage.getItem(META_STORAGE); if (raw) return JSON.parse(raw) } catch {}
  return null
}
function saveMeta(dict) { try { localStorage.setItem(META_STORAGE, JSON.stringify(dict)) } catch {} }

function seedMeta() {
  const dict = {
    N: { id:'N', name:'氮肥', unit:'吨', safetyStock:100 },
    NP: { id:'NP', name:'复合肥', unit:'吨', safetyStock:150 },
    FUN: { id:'FUN', name:'广谱杀菌剂', unit:'箱', safetyStock:60 },
    PEST: { id:'PEST', name:'杀虫剂', unit:'箱', safetyStock:70 },
  }
  saveMeta(dict)
  return dict
}

export function useInventory() {
  const itemMeta = ref({})

  const fetchMeta = () => {
    let dict = loadMeta()
    if (!dict) dict = seedMeta()
    itemMeta.value = dict
  }

  const upsertMeta = (id, patch) => {
    itemMeta.value = { ...itemMeta.value, [id]: { ...(itemMeta.value[id]||{}), ...patch, id } }
    saveMeta(itemMeta.value)
  }

  const deleteMeta = (id) => {
    const d = { ...itemMeta.value }
    delete d[id]
    itemMeta.value = d
    saveMeta(itemMeta.value)
  }

  return { itemMeta, fetchMeta, upsertMeta, deleteMeta }
}


