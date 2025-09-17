// This file can be expanded with more device types and icon logic
export const deviceCategories = [
  { id: 'soil-sensors', name: '土壤传感器', type: 'soil' },
  { id: 'weather-stations', name: '气象站', type: 'weather' },
  { id: 'field-monitors', name: '田间监测站', type: 'field' },
  { id: 'moth-monitors', name: '虫情测报仪', type: 'moth' },
  { id: 'spore-monitors', name: '孢子测报仪', type: 'spore' },
  { id: 'drones', name: '巡飞无人机', type: 'drone' },
];

// This function is currently unused in GisMap.vue but kept for future use.
export function getDeviceIcon(type, statusClass) {
  const cnTypeMap = {
    soil: '墒情传感器',
    weather: '气象监测站',
    field: '田间监测站',
    moth: '虫情测报仪',
    spore: '孢子测报仪',
    drone: '巡飞无人机'
  };
  const base = cnTypeMap[type] || '墒情传感器';
  let statusSuffix = '未选';
  if (statusClass === 'state-offline') statusSuffix = '离线';
  // 告警仍然用“未选”的底图
  return `/icons/devices/${base} ${statusSuffix} 地图上.svg`;
}
