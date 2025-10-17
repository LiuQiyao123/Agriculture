import { ref } from 'vue'

const STORAGE_KEY = 'rm_transfers_v1'

function load() { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw) } catch {} ; return [] }
function save(list) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch {} }

function seed() {
  const list = [
    { id:'T-1001', title:'氮肥调拨（仓A→仓B）', status:'待审核', to:'仓B', eta:'', progress:0 },
    { id:'T-1002', title:'复合肥调拨（仓A→仓C）', status:'待调拨', to:'仓C', eta:'10:30', progress:0 },
    { id:'T-1003', title:'杀菌剂调拨（仓B→仓D）', status:'在途', to:'仓D', eta:'11:40', progress:45 },
  ]
  save(list)
  return list
}

export function useTransfers() {
  const transfers = ref([])

  const fetchTransfers = () => { let list = load(); if (!list.length) list = seed(); transfers.value = list }
  const createTransfer = (payload) => {
    const id = `T-${Math.floor(Math.random()*9000)+1000}`
    const item = { id, status:'待审核', progress:0, ...payload }
    transfers.value = [item, ...transfers.value]; save(transfers.value); return id
  }
  const updateTransfer = (id, patch) => { transfers.value = transfers.value.map(t=> t.id===id? { ...t, ...patch } : t); save(transfers.value) }
  const deleteTransfer = (id) => { transfers.value = transfers.value.filter(t=>t.id!==id); save(transfers.value) }

  // 地图图层（简化占位）：路线/点位
  const buildRouteLayers = (list = transfers.value) => {
    const features = []
    list.forEach(t => {
      if (t.routeLine) features.push({ type:'Feature', properties:{ id:t.id, type:'line' }, geometry:t.routeLine.geometry })
    })
    return [] // 后续与 dispatch/useDispatch 的路线生成复用
  }

  return { transfers, fetchTransfers, createTransfer, updateTransfer, deleteTransfer, buildRouteLayers }
}


