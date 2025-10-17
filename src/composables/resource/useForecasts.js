import { ref } from 'vue'

const STORAGE_KEY = 'rm_forecasts_v1'

function load() { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw) } catch {} ; return [] }
function save(list) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch {} }

function seed() {
  const list = [
    { id:'F-001', scenario:'baseline', period:'2025-10', region:'高新区', demand:{ N:120, NP:80, FUN:40 }, confidence:0.86, explain:'基线预测' },
    { id:'F-002', scenario:'pest', period:'2025-10', region:'章丘区', demand:{ PEST:70, FUN:60 }, confidence:0.66, explain:'病虫暴发情景' },
  ]
  save(list)
  return list
}

export function useForecasts() {
  const forecasts = ref([])

  const fetchForecasts = () => {
    let list = load(); if (!list || !list.length) list = seed(); forecasts.value = list
  }

  const createForecast = (payload) => {
    const id = `F-${Math.floor(Math.random()*900)+100}`
    const item = { id, confidence: 0.7, explain: '规则生成', ...payload }
    forecasts.value = [item, ...forecasts.value]
    save(forecasts.value)
    return id
  }

  const updateForecast = (id, patch) => {
    forecasts.value = forecasts.value.map(f => f.id===id ? { ...f, ...patch } : f)
    save(forecasts.value)
  }

  const deleteForecast = (id) => {
    forecasts.value = forecasts.value.filter(f => f.id!==id)
    save(forecasts.value)
  }

  return { forecasts, fetchForecasts, createForecast, updateForecast, deleteForecast }
}


