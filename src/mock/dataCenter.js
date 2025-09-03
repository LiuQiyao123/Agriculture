export const deviceList = [
  { id: 'IOT-2025-001', type: '气象站', town: '济南市-历城区', status: '在线', battery: 98, lastReport: '2025-01-21 10:00:00', coordinates: [117.12, 36.68] },
  { id: 'IOT-2025-002', type: '土壤湿度计', town: '青岛市-城阳区', status: '在线', battery: 85, lastReport: '2025-01-21 10:05:00', coordinates: [120.39, 36.31] },
  { id: 'IOT-2025-003', type: '摄像头', town: '淄博市-张店区', status: '离线', battery: 0, lastReport: '2025-01-20 18:30:00', coordinates: [118.05, 36.82] },
  { id: 'IOT-2025-004', type: '水阀控制器', town: '潍坊市-寒亭区', status: '告警', battery: 35, lastReport: '2025-01-21 09:50:00', coordinates: [119.17, 36.77] },
  { id: 'IOT-2025-005', type: '气象站', town: '烟台市-莱山区', status: '在线', battery: 100, lastReport: '2025-01-21 10:10:00', coordinates: [121.43, 37.50] },
  { id: 'IOT-2025-006', type: '土壤湿度计', town: '泰安市-泰山区', status: '在线', battery: 72, lastReport: '2025-01-21 10:12:00', coordinates: [117.12, 36.20] },
  { id: 'IOT-2025-007', type: '虫情测报仪', town: '德州市-德城区', status: '维护中', battery: 40, lastReport: '2025-01-21 09:40:00', coordinates: [116.30, 37.45] },
  { id: 'IOT-2025-008', type: '孢子测报仪', town: '滨州市-滨城区', status: '在线', battery: 65, lastReport: '2025-01-21 10:20:00', coordinates: [117.97, 37.38] },
  { id: 'IOT-2025-009', type: '田间监测站', town: '聊城市-东昌府区', status: '在线', battery: 88, lastReport: '2025-01-21 10:25:00', coordinates: [115.99, 36.45] },
  { id: 'IOT-2025-010', type: '巡飞无人机', town: '临沂市-兰山区', status: '在线', battery: 56, lastReport: '2025-01-21 10:30:00', coordinates: [118.35, 35.07] },
  // 扩充数据（使用山东内陆城市的经纬度包围盒，避免落入海域）
  ...Array.from({ length: 60 }).map((_, i) => {
    const bboxes = [
      // [minLng, minLat, maxLng, maxLat]
      [116.8, 36.4, 117.4, 36.9],   // 济南
      [118.0, 36.6, 118.3, 36.9],   // 淄博
      [116.9, 36.1, 117.3, 36.4],   // 泰安
      [116.0, 37.2, 116.6, 37.6],   // 德州
      [115.7, 36.3, 116.3, 36.8],   // 聊城
      [116.2, 35.2, 116.8, 35.6],   // 济宁
      [117.2, 34.8, 117.5, 35.2],   // 枣庄
      [118.1, 35.0, 118.7, 35.5],   // 临沂
      [115.3, 35.1, 115.9, 35.5],   // 菏泽
      [117.6, 37.2, 118.1, 37.5]    // 滨州（内陆）
    ];
    const bbox = bboxes[i % bboxes.length];
    const lng = (bbox[0] + Math.random() * (bbox[2] - bbox[0])).toFixed(4);
    const lat = (bbox[1] + Math.random() * (bbox[3] - bbox[1])).toFixed(4);
    return {
      id: `IOT-2025-${(i + 11).toString().padStart(3, '0')}`,
      type: ['气象站','土壤湿度计','田间监测站','虫情测报仪','孢子测报仪','巡飞无人机'][i % 6],
      town: ['济南市','青岛市','淄博市','潍坊市','烟台市','泰安市','德州市','滨州市','聊城市','临沂市'][i % 10],
      status: ['在线','离线','告警','维护中'][i % 4],
      battery: 20 + (i * 7) % 81,
      lastReport: '2025-01-21 09:00:00',
      coordinates: [parseFloat(lng), parseFloat(lat)]
    }
  })
]; 