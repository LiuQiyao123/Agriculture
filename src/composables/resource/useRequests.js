import { ref } from 'vue'

const STORAGE_KEY = 'rm_requests_v2'

function loadFromStorage() {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw) } catch {}
  return null
}
function saveToStorage(list) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch {} }

function seedRequests() {
  const data = [
    { id:'r-001', plotId:'plot-a', plotName:'A区小麦', crop:'小麦', area:120, windowStart:'2025-10-22', windowEnd:'2025-10-28', standard:'收割标准A级', priority:'高', status:'待审核', location:[117.12,36.70] },
    { id:'r-002', plotId:'plot-b', plotName:'B区玉米', crop:'玉米', area:85,  windowStart:'2025-10-25', windowEnd:'2025-11-02', standard:'播种密度6000/亩', priority:'中', status:'待调度', location:[117.18,36.66] },
    { id:'r-003', plotId:'plot-c', plotName:'C区大豆', crop:'大豆', area:60,  windowStart:'2025-10-26', windowEnd:'2025-10-30', standard:'深耕25cm', priority:'中', status:'已调度', location:[117.11,36.63] },
    { id:'r-004', plotId:'plot-d', plotName:'D区玉米', crop:'玉米', area:95,  windowStart:'2025-10-24', windowEnd:'2025-10-29', standard:'精准播种', priority:'高', status:'待调度', location:[117.10,36.72] },
    { id:'r-005', plotId:'plot-e', plotName:'E区小麦', crop:'小麦', area:150, windowStart:'2025-10-23', windowEnd:'2025-10-31', standard:'收割标准B级', priority:'高', status:'待调度', location:[117.16,36.68] },
    { id:'r-006', plotId:'plot-f', plotName:'F区水稻', crop:'水稻', area:110, windowStart:'2025-10-27', windowEnd:'2025-11-03', standard:'插秧标准', priority:'中', status:'待审核', location:[117.20,36.64] },
    { id:'r-007', plotId:'plot-g', plotName:'G区大豆', crop:'大豆', area:70,  windowStart:'2025-10-26', windowEnd:'2025-10-30', standard:'收割标准A级', priority:'中', status:'待调度', location:[117.14,36.67] },
    { id:'r-008', plotId:'plot-h', plotName:'H区玉米', crop:'玉米', area:90,  windowStart:'2025-10-25', windowEnd:'2025-10-28', standard:'喷药+收割', priority:'高', status:'待调度', location:[117.08,36.66] },
    { id:'r-009', plotId:'plot-i', plotName:'I区小麦', crop:'小麦', area:130, windowStart:'2025-10-22', windowEnd:'2025-10-27', standard:'烘干入仓', priority:'高', status:'待调度', location:[117.19,36.70] },
    { id:'r-010', plotId:'plot-j', plotName:'J区油菜', crop:'油菜', area:55,  windowStart:'2025-10-29', windowEnd:'2025-11-05', standard:'整地+施肥', priority:'中', status:'待审核', location:[117.22,36.62] },
  ]
  saveToStorage(data); return data
}

export function useRequests() {
  const requests = ref([])

  const fetchRequests = async ()=>{
    let list = loadFromStorage(); if (!list) list = seedRequests(); requests.value = list
  }

  const createRequest = (payload)=>{
    const id = `r-${Math.random().toString(36).slice(2,7)}`
    const item = { id, status:'待审核', ...payload }
    requests.value = [item, ...requests.value]; saveToStorage(requests.value); return id
  }

  const updateRequest = (id, patch)=>{
    requests.value = requests.value.map(r => r.id===id ? { ...r, ...patch } : r)
    saveToStorage(requests.value)
  }

  const deleteRequest = (id)=>{
    requests.value = requests.value.filter(r=> r.id!==id); saveToStorage(requests.value)
  }

  const auditToPending = (id)=>{ updateRequest(id, { status:'待调度' }) }

  return { requests, fetchRequests, createRequest, updateRequest, deleteRequest, auditToPending }
}
