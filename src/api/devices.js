// src/api/devices.js

// 模拟设备数据
export const devices = [
  { id: 'S001', name: '土壤湿度计-01', type: 'soil', coordinates: [117.1, 36.6], status: '在线', value: '45%' },
  { id: 'W001', name: '微型气象站-A', type: 'weather', coordinates: [118.0, 37.0], status: '在线', value: '22°C' },
  { id: 'F001', name: '智能摄像头-东', type: 'field', coordinates: [117.5, 36.8], status: '在线', value: '正常' },
  { id: 'M001', name: '虫情测报灯-北', type: 'moth', coordinates: [118.2, 36.5], status: '离线', value: 'N/A' },
  { id: 'SP01', name: '孢子捕捉仪-西', type: 'spore', coordinates: [117.8, 37.2], status: '在线', value: '低风险' },
  { id: 'D001', name: '无人机停机坪', type: 'drone', coordinates: [117.3, 37.1], status: '空闲', value: '可用' },
  { id: 'S002', name: '土壤PH值传感器', type: 'soil', coordinates: [118.5, 36.9], status: '在线', value: '6.8' },
];
