import { ref, computed, watch } from 'vue';
import shandongCounties from '@/mock/shandong-counties.json';

function generateComprehensiveWeatherAdvice(alertData) {
  const { county, alertType, alertLevel, startTime, endTime, details } = alertData;

  const diagnosis = {
    summary: `【${alertType} ${alertLevel}预警】${county}气象台于 ${startTime} 发布预警，预计持续至 ${endTime}。`,
    risks: [details],
  };

  let controlTask = { type: '应急响应', detail: '' };
  let priority = '中';

  switch (alertType) {
    case '暴雨':
      controlTask.detail = '立即疏通田间沟渠，检查排水系统，准备防汛设备。';
      priority = alertLevel.includes('红色') ? '高' : '中';
      break;
    case '高温':
      controlTask.detail = '在清晨或傍晚进行灌溉，为温室大棚开启通风降温设备。';
      priority = '中';
      break;
    case '大风':
      controlTask.detail = '加固温室大棚、广告牌等设施，暂停高空作业。';
       priority = alertLevel.includes('橙色') ? '高' : '中';
      break;
    default:
      controlTask.detail = '关注当地气象部门发布的具体防范指南。';
      priority = '低';
  }

  const advice = {
    overview: {
      plotId: county, // Using county as ID
      targetCrop: '所有受影响作物',
      coreTask: `应对“${alertType}”预警`,
      executionWindow: '预警生效期间',
      priority: priority,
    },
    controlTask,
    decisionBasis: [`预警级别为“${alertLevel}”，需采取相应措施。`],
    costBenefit: {
      estimatedCost: '50.00',
      expectedBenefits: '有效降低气象灾害可能造成的作物损失和财产损失。',
    }
  };
  
  // Weather alerts don't have a complex health model like plots
  return { diagnosis, advice, healthModel: null };
}

export function useWeatherAlertData(baseMapRef, tableRef) {
  const alertData = ref([
    { id: 1, county: '历下区', alertType: '暴雨', alertLevel: '橙色', startTime: '2025-09-22 10:00', endTime: '2025-09-23 10:00', details: '预计未来24小时内，历下区将有大到暴雨，局部地区伴有雷电。' },
    { id: 2, county: '商河县', alertType: '高温', alertLevel: '黄色', startTime: '2025-09-22 11:30', endTime: '2025-09-25 18:00', details: '预计未来三天，商河县日最高气温将达到35℃以上。' },
    { id: 3, county: '长清区', alertType: '大风', alertLevel: '蓝色', startTime: '2025-09-22 09:45', endTime: '2025-09-22 22:00', details: '预计今天白天，长清区将有5~6级偏北大风，阵风可达7~8级。' },
  ].map(item => ({ ...item, ...generateComprehensiveWeatherAdvice(item) })));
  
  const currentRow = ref(null);
  const filters = ref({ alertType: '', alertLevel: '' });
  const filterFields = ref([
    { type: 'select', label: '预警类型', model: 'alertType', options: ['全部', '暴雨', '高温', '大风'] },
    { type: 'select', label: '预警等级', model: 'alertLevel', options: ['全部', '蓝色', '黄色', '橙色', '红色'] },
  ]);

  const handleCurrentChange = (row) => {
    if (row) {
      currentRow.value = row;
      if (baseMapRef.value) {
        const areaFeature = processedAlertAreas.value.features.find(f => f.properties.name === row.county);
        if (areaFeature && areaFeature.properties.center) {
          baseMapRef.value.flyTo({ center: areaFeature.properties.center, zoom: 9 });
        }
      }
    }
  };

  const diagnosisContent = computed(() => currentRow.value?.diagnosis);
  const suggestionContent = computed(() => currentRow.value?.advice);

  const processedAlertAreas = computed(() => {
    return {
      type: 'FeatureCollection',
      features: shandongCounties.features.map(feature => {
        const alertInfo = alertData.value.find(d => d.county === feature.properties.name);
        return { ...feature, properties: { ...feature.properties, ...alertInfo, hasAlert: !!alertInfo }};
      }),
    };
  });

  watch(tableRef, (newTableRef) => {
    if (newTableRef && alertData.value.length > 0) {
      const firstRow = alertData.value[0];
      newTableRef.setCurrentRow(firstRow);
      handleCurrentChange(firstRow);
    }
  }, { once: true });
  
  const alertTypeChartOptions = computed(() => {
    const typeCounts = alertData.value.reduce((acc, item) => {
      acc[item.alertType] = (acc[item.alertType] || 0) + 1;
      return acc;
    }, {});
    const chartData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
    return {
      title: { text: '预警类型分布', left: 'center', textStyle: { color: '#fff' }},
      tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' },
      legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: { color: '#fff' }
      },
      series: [{
          name: '预警数量',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: chartData,
          emphasis: {
              itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
          },
          label: {
              color: '#fff'
          }
      }]
    };
  });

  return {
    alertData, filterFields, filters, processedAlertAreas,
    handleCurrentChange, currentRow, diagnosisContent, suggestionContent,
    alertTypeChartOptions,
  };
}
