import { ref } from 'vue'

const STORAGE_KEY = 'rm_approvals_v1'

function load() { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw) } catch {} ; return [] }
function save(list) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch {} }

function seed() {
  const list = [
    { id:'A-9001', bizType:'transfer', title:'T-1002 复合肥调拨', status:'待审', logs:[] },
    { id:'A-9002', bizType:'forecast', title:'十月预测方案', status:'待审', logs:[] },
  ]
  save(list)
  return list
}

export function useApprovals() {
  const approvals = ref([])

  const fetchApprovals = () => { let list = load(); if (!list.length) list = seed(); approvals.value = list }
  const updateApproval = (id, patch) => { approvals.value = approvals.value.map(a=>a.id===id? { ...a, ...patch }: a); save(approvals.value) }
  const addLog = (id, log) => { approvals.value = approvals.value.map(a=> a.id===id? { ...a, logs:[...(a.logs||[]), { time: Date.now(), ...log }] }: a); save(approvals.value) }

  return { approvals, fetchApprovals, updateApproval, addLog }
}


