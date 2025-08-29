export const topMetrics = [
  { id: 1, title: '耕地总面积', value: '1,254,800', unit: '亩' },
  { id: 2, title: '物联网设备总数', value: 874, unit: '台' },
  { id: 3, title: '本月红色预警', value: 4, unit: '次' },
  { id: 4, title: '预计当季总产值', value: '3.85', unit: '亿元' }
]

export const alertsList = [
  { id: 1, content: '[病害预警] 城关镇发生稻飞虱病害，影响面积约200亩。', location: { lng: 116.35, lat: 39.95, zoom: 14 } },
  { id: 2, content: '[干旱预警] 高新区玉米地块土壤湿度连续3天低于30%，请及时灌溉。', location: { lng: 116.45, lat: 40.05, zoom: 15 } },
  { id: 3, content: '[设备告警] 开发区气象站离线超过2小时，请派人检查。', location: { lng: 116.30, lat: 39.85, zoom: 14 } },
  { id: 4, content: '[虫害预警] 白马乡发现草地贪夜蛾成虫，有扩散风险，请注意防范。', location: { lng: 116.50, lat: 39.90, zoom: 14 } },
  { id: 5, content: '[涝灾预警] 未来24小时内预计有强降雨，低洼地块请注意排涝。', location: null },
]

// 数据
export const plantingStructureData = [
  { value: 45, name: '水稻' },
  { value: 30, name: '玉米' },
  { value: 15, name: '蔬菜' },
  { value: 10, name: '其他' },
]

// ECharts 配置生成函数
export const getPlantingStructureOptions = (data, themeColors) => {
  return {
    title: {
      text: '全县主要农作物种植结构',
      left: 'center',
      textStyle: {
        color: themeColors.titleColor,
        fontSize: 16,
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%',
    },
    legend: {
      bottom: 10,
      textStyle: {
        color: themeColors.textColor,
      },
      data: data.map(item => item.name),
    },
    series: [
      {
        name: '种植结构',
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: '20', fontWeight: 'bold' } },
        labelLine: { show: false },
        data: data,
      },
    ],
  };
};

export const plotGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [118.3, 36.4], [118.5, 36.4], [118.5, 36.6], [118.3, 36.6], [118.3, 36.4]
          ]
        ]
      },
      properties: {
        id: 'P001', 
        name: '城关镇-01号高标准水稻田', 
        crop: '水稻', 
        areaMu: 120.5,
        soilScore: 85,
        soilMoisture: 65, 
        ndvi: 0.85,
        owner: '张三', 
        phone: '13800138000'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [118.6, 36.7], [118.8, 36.7], [118.8, 36.9], [118.6, 36.9], [118.6, 36.7]
          ]
        ]
      },
      properties: {
        id: 'P002', 
        name: '高新区-玉米种植基地', 
        crop: '玉米', 
        areaMu: 89.3,
        soilScore: 78,
        soilMoisture: 45, 
        ndvi: 0.72,
        owner: '李四', 
        phone: '13900139000'
      }
    }
  ]
};

// --- Right Panel Charts ---

// 1. Yield and Value Bar Chart
export const yieldValueData = {
  crops: ['水稻', '玉米', '蔬菜'],
  yields: [9750, 8500, 12000], // 吨
  values: [2730, 1870, 3600], // 万元
};

export const getYieldValueOptions = (data, themeColors) => ({
  title: { text: '主要农作物预估产量与产值', textStyle: { fontSize: 16, color: themeColors.titleColor } },
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: {
    data: ['预估产量(吨)', '预估产值(万元)'],
    textStyle: { color: themeColors.textColor, fontSize: 12 },
    bottom: 10,
  },
  grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
  xAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: themeColors.axisLineColor } },
    axisLabel: { color: themeColors.axisLabelColor },
  },
  yAxis: {
    type: 'category',
    data: data.crops,
    axisLine: { lineStyle: { color: themeColors.axisLineColor } },
    axisLabel: { color: themeColors.axisLabelColor },
  },
  series: [
    { name: '预估产量(吨)', type: 'bar', data: data.yields },
    { name: '预估产值(万元)', type: 'bar', data: data.values },
  ],
});

// 2. Alert Trend Line Chart
export const alertTrendData = {
  dates: Array.from({ length: 30 }, (_, i) => `7/${i + 1}`),
  critical: Array.from({ length: 30 }, () => Math.floor(Math.random() * 3)),
  major: Array.from({ length: 30 }, () => Math.floor(Math.random() * 5)),
};

export const getAlertTrendOptions = (data, themeColors) => ({
  title: { text: '近30天预警数量趋势', textStyle: { fontSize: 16, color: themeColors.titleColor } },
  tooltip: { trigger: 'axis' },
  legend: {
    data: ['红色预警', '橙色预警'],
    textStyle: { color: themeColors.textColor, fontSize: 12 },
    bottom: 10,
  },
  grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: data.dates,
    axisLine: { lineStyle: { color: themeColors.axisLineColor } },
    axisLabel: { color: themeColors.axisLabelColor },
  },
  yAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: themeColors.axisLineColor } },
    splitLine: { lineStyle: { color: themeColors.splitLineColor } },
    axisLabel: { color: themeColors.axisLabelColor },
  },
  series: [
    { name: '红色预警', type: 'line', data: data.critical, itemStyle: { color: '#ff4d4f' } },
    { name: '橙色预警', type: 'line', data: data.major, itemStyle: { color: '#ffaa00' } },
  ],
});

// New Data and Options for Device Status
export const deviceStatusData = {
  online: 82,
  offline: 8,
};

export const getDeviceStatusOptions = (data, themeColors) => ({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 10,
    top: 20,
    data: ['在线', '离线'],
    textStyle: { color: themeColors.textColor }
  },
  series: [
    {
      name: '设备状态',
      type: 'pie',
      radius: ['50%', '70%'],
      center: ['65%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: {
        label: {
          show: true,
          fontSize: '20',
          fontWeight: 'bold'
        }
      },
      labelLine: { show: false },
      data: [
        { value: data.online, name: '在线', itemStyle: { color: '#00c851' } },
        { value: data.offline, name: '离线', itemStyle: { color: '#ff4d4f' } }
      ]
    }
  ]
});

// New Data and Options for Soil Moisture
export const soilMoistureData = {
  value: 45.8, // Current soil moisture percentage
};

export const getSoilMoistureOptions = (data, themeColors) => ({
  series: [
    {
      type: 'gauge',
      center: ['50%', '60%'],
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 10,
      progress: {
        show: true,
        width: 30,
        itemStyle: { color: '#33b5e5' }
      },
      pointer: { show: false },
      axisLine: {
        lineStyle: {
          width: 30,
          color: [[1, '#2d3343']]
        }
      },
      axisTick: {
        distance: -45,
        splitNumber: 5,
        lineStyle: { width: 2, color: '#999' }
      },
      splitLine: {
        distance: -52,
        length: 14,
        lineStyle: { width: 3, color: '#999' }
      },
      axisLabel: {
        distance: -20,
        color: themeColors.textColor,
        fontSize: 14
      },
      anchor: { show: false },
      title: {
        show: false
      },
      detail: {
        valueAnimation: true,
        width: '60%',
        lineHeight: 40,
        borderRadius: 8,
        offsetCenter: [0, '-15%'],
        fontSize: 24,
        fontWeight: 'bolder',
        formatter: '{value} %',
        color: 'inherit'
      },
      data: [{ value: data.value }]
    }
  ]
});

// --- Left Panel: Crop Growth ---
export const cropGrowthData = {
  categories: ['优', '良', '中', '差'],
  values: [28000, 45000, 15000, 3500], // unit: mu (亩)
};

export const getCropGrowthOptions = (data, themeColors) => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    formatter: '{b}: {c} 亩'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '15%', // Reduce top margin
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: data.categories,
    axisLine: { lineStyle: { color: themeColors.axisLineColor } },
    axisLabel: { color: themeColors.textColor, fontSize: 13 },
    axisTick: { show: false }
  },
  yAxis: {
    type: 'value',
    name: '耕地面积(亩)',
    nameTextStyle: {
      color: themeColors.textColor,
      padding: [0, 0, 0, 50]
    },
    axisLine: { show: true, lineStyle: { color: themeColors.axisLineColor } },
    splitLine: { lineStyle: { color: themeColors.splitLineColor } },
    axisLabel: { color: themeColors.textColor, fontSize: 13 }
  },
  series: [
    {
      data: data.values.map((value, index) => ({
        value: value,
        itemStyle: {
          color: ['#52c41a', '#91cc75', '#facc14', '#f5222d'][index]
        }
      })),
      type: 'bar',
      barWidth: '40%',
    }
  ]
});

// --- Left Panel: Risk Radar ---
export const riskRadarData = {
  indicator: [
    { name: '旱灾', max: 100 },
    { name: '涝灾', max: 100 },
    { name: '病害', max: 100 },
    { name: '虫害', max: 100 },
    { name: '风灾', max: 100 },
  ],
  values: [65, 40, 85, 70, 30], // Risk probability (%)
};

export const getRiskRadarOptions = (data, themeColors) => ({
  radar: {
    indicator: data.indicator,
    center: ['50%', '55%'],
    radius: '80%',
    name: {
      textStyle: { color: themeColors.textColor, fontSize: 14 }
    },
    splitArea: {
      areaStyle: {
        color: ['rgba(0, 170, 255, 0.1)', 'rgba(0, 170, 255, 0.05)'],
      }
    },
    axisLine: { lineStyle: { color: 'rgba(0, 170, 255, 0.2)' } },
    splitLine: { lineStyle: { color: 'rgba(0, 170, 255, 0.2)' } }
  },
  series: [{
    name: '未来一周风险概率',
    type: 'radar',
    data: [{
      value: data.values,
      name: '风险概率 (%)',
      areaStyle: { color: 'rgba(255, 77, 79, 0.5)' },
      lineStyle: { color: '#ff4d4f' }
    }]
  }]
});


// --- Left Panel: Supply & Demand (Reworked) ---
export const supplyDemandData = {
  // Generate data for the last 30 days and next 30 days
  dates: Array.from({ length: 60 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 29 + i);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }),
  // Single line of data representing combined supply/demand metric (e.g., price index)
  values: [
    // Past 30 days (actual data)
    ...Array.from({ length: 30 }, () => 100 + Math.random() * 20 - 10),
    // Next 30 days (predicted data)
    ...Array.from({ length: 30 }, () => 105 + Math.random() * 25 - 12.5),
  ],
  todayIndex: 29, // Index of "today"
};

export const getSupplyDemandOptions = (data, themeColors) => {
  const historicData = data.values.slice(0, data.todayIndex + 1);
  // For the forecast, the first point must be the same as the last historic point to connect the line
  const forecastData = Array(data.todayIndex).fill(null).concat(data.values.slice(data.todayIndex));

  return {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '18%', // Reduce top margin
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.dates,
      axisLine: { lineStyle: { color: themeColors.axisLineColor } },
      axisLabel: { color: themeColors.textColor, fontSize: 13 },
    },
    yAxis: {
      type: 'value',
      name: '供需指数',
      axisLabel: { formatter: '{value}', fontSize: 13 },
      axisLine: { show: true, lineStyle: { color: themeColors.axisLineColor } },
      splitLine: { lineStyle: { color: themeColors.splitLineColor } },
    },
    series: [
      {
        name: '历史数据',
        type: 'line',
        data: historicData,
        smooth: true,
        showSymbol: false,
        itemStyle: { color: '#00ff7f' },
        lineStyle: { type: 'solid' }
      },
      {
        name: '预测数据',
        type: 'line',
        data: forecastData,
        smooth: true,
        showSymbol: false,
        itemStyle: { color: '#00ff7f' },
        lineStyle: { type: 'dashed' },
      },
    ],


  };
}; 