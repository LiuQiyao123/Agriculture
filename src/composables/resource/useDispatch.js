import { ref, computed } from 'vue'

const STORAGE_KEY = 'rm_dispatches_v1'

function load(key){ try{ const raw = localStorage.getItem(key); if(raw) return JSON.parse(raw)}catch{} return null }
function save(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)) }catch{} }

function makePolyline(start, end){
  // 生成一条简单的折线（start -> mid1 -> mid2 -> end），用于更真实的展示
  const [x1,y1] = start || [117.10,36.68]
  const [x2,y2] = end   || [117.12,36.69]
  const mid1 = [ (x1*0.66 + x2*0.34) + 0.002, (y1*0.66 + y2*0.34) + 0.001 ]
  const mid2 = [ (x1*0.34 + x2*0.66) - 0.001, (y1*0.34 + y2*0.66) + 0.0015 ]
  return [ start, mid1, mid2, end ]
}

function interpOnLine(lineCoords, t){
  // 线性插值（简化）：将整条折线按比例在首末点之间插值（够用来做演示移动点）
  if (!Array.isArray(lineCoords) || lineCoords.length < 2) return lineCoords?.[0] || [117.10,36.68]
  const a = lineCoords[0]; const b = lineCoords[lineCoords.length-1]
  const x = a[0] + (b[0]-a[0]) * t
  const y = a[1] + (b[1]-a[1]) * t
  return [x,y]
}

export function useDispatch({ machines, requests }){
  const dispatches = ref(load(STORAGE_KEY) || [])
  const saveAll = ()=> save(STORAGE_KEY, dispatches.value)

  const matchScores = computed(()=>{
    const list = []
    requests.value.forEach(r => {
      machines.value.forEach(m => {
        const base = (m.status==='空闲'? 40: 10)
        const typeScore = (m.capability||'').includes(r.crop||'')? 30: 10
        const distanceScore = 20 + Math.floor(Math.random()*10)
        list.push({ requestId: r.id, machineId: m.id, score: base+typeScore+distanceScore, request: r, machine: m })
      })
    })
    return list
  })

  const calcMatchScores = ()=>{}

  const createDispatch = (requestId, machineId)=>{
    const r = requests.value.find(x=>x.id===requestId)
    const m = machines.value.find(x=>x.id===machineId)
    if (!r || !m) return null
    const id = `d-${Math.random().toString(36).slice(2,7)}`
    const coords = makePolyline(m.location || [117.10,36.68], r.location || [117.12,36.69])
    const routeLine = { type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: { color: '#00aaff', id } }
    const eta = 20 + Math.floor(Math.random()*40)
    const item = { id, requestId, machineId, routeLine, eta, progress: 0, events: [] }
    dispatches.value = [ item, ...dispatches.value ]
    saveAll(); return id
  }

  const updateDispatch = (id, patch)=>{
    dispatches.value = dispatches.value.map(d=> d.id===id? { ...d, ...patch } : d)
    saveAll()
  }

  const buildRouteLayers = (list, selectedId = '')=>{
    const lineFeatures = []
    const startFeatures = []
    const endFeatures = []
    const movingFeatures = []

    list.forEach(d => {
      if (!d.routeLine?.geometry?.coordinates) return
      const coords = d.routeLine.geometry.coordinates
      lineFeatures.push(d.routeLine)
      // start/end points
      startFeatures.push({ type:'Feature', geometry:{ type:'Point', coordinates: coords[0] }, properties:{ status:'start', id: d.id } })
      endFeatures.push({ type:'Feature', geometry:{ type:'Point', coordinates: coords[coords.length-1] }, properties:{ status:'end', id: d.id } })
      // moving point by progress
      const t = Math.max(0, Math.min(1, (d.progress||0)/100))
      const pos = interpOnLine(coords, t)
      movingFeatures.push({ type:'Feature', geometry:{ type:'Point', coordinates: pos }, properties:{ progress: d.progress||0, id: d.id } })
    })

    return {
      'dispatch-lines': { 
        data: { type:'FeatureCollection', features: lineFeatures }, 
        type:'line', 
        paint: { 
          'line-color': ['case', ['==',['get','id'], selectedId], '#FFD700', '#00aaff'],
          'line-width': ['case', ['==',['get','id'], selectedId], 6, 4]
        } 
      },
      'dispatch-start': { 
        data: { type:'FeatureCollection', features: startFeatures }, 
        type:'circle', 
        paint: { 
          'circle-radius': ['case', ['==',['get','id'], selectedId], 8, 6],
          'circle-color': ['case', ['==',['get','id'], selectedId], '#FFD700', '#67C23A'],
          'circle-stroke-width': 2, 'circle-stroke-color': '#1a2332' 
        } 
      },
      'dispatch-end':   { 
        data: { type:'FeatureCollection', features: endFeatures },   
        type:'circle', 
        paint: { 
          'circle-radius': ['case', ['==',['get','id'], selectedId], 8, 6],
          'circle-color': ['case', ['==',['get','id'], selectedId], '#FFD700', '#F56C6C'],
          'circle-stroke-width': 2, 'circle-stroke-color': '#1a2332' 
        } 
      },
      'dispatch-moving':{ 
        data: { type:'FeatureCollection', features: movingFeatures },
        type:'circle', 
        paint: { 
          'circle-radius': ['case', ['==',['get','id'], selectedId], 9, 7],
          'circle-color': ['case', ['==',['get','id'], selectedId], '#FFD700', '#E6A23C'],
          'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' 
        } 
      },
    }
  }

  return { dispatches, matchScores, calcMatchScores, createDispatch, updateDispatch, buildRouteLayers }
}
