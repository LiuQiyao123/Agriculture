export const topMetrics = [
  { id: 1, title: '耕地总面积', value: '1,254,800', unit: '亩' },
  { id: 2, title: '物联网设备总数', value: 874, unit: '台' },
  { id: 3, title: '本月红色预警', value: 4, unit: '次' },
  { id: 4, title: '预计当季总产值', value: '3.85', unit: '亿元' }
]

export const alertsList = [
  { id: 1, content: '[橙色预警] 城关镇发生稻飞虱病害，影响面积约200亩。', location: { lng: 116.35, lat: 39.95, zoom: 14 } },
  { id: 2, content: '[红色预警] 高新区玉米地块出现严重干旱，相对湿度低于20%。', location: { lng: 116.45, lat: 40.05, zoom: 15 } },
  { id: 3, content: '[橙色预警] 开发区发现草地贪夜蛾，请注意防范。', location: { lng: 116.30, lat: 39.85, zoom: 14 } },
  { id: 4, content: '[普通通知] 新一批农业补贴已下发，请各农户查收。', location: null }, // No location for this one
  { id: 5, content: '[橙色预警] 城关镇发生稻飞虱病害，影响面积约200亩。', location: { lng: 116.35, lat: 39.95, zoom: 14 } },
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
            [116.3, 39.9], [116.4, 39.9], [116.4, 40.0], [116.3, 40.0], [116.3, 39.9]
          ]
        ]
      },
      properties: {
        id: 'P001', name: '城关镇-01号高标准水稻田', crop: '水稻', area: 120.5,
        manager: '张三', phone: '13800138000',
        realtime_moisture: 65, realtime_ndvi: 0.85
      }
    },
    // We can add more features here later
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