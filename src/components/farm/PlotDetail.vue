<template>
  <div class="plot-detail" v-if="plot">
    <!-- 标题栏 -->
    <div class="detail-header">
      <div class="plot-title">
        <h3>{{ plot.id }}</h3>
        <span class="plot-subtitle">地块详情档案</span>
      </div>
      <div class="health-score">
        <div class="score-value">{{ plot.properties.healthScore }}</div>
        <div class="score-label">健康评分</div>
      </div>
    </div>

    <!-- 基本信息卡片 -->
    <div class="info-section">
      <div class="section-title">基本信息</div>
      <div class="info-cards">
        <div class="info-card">
          <div class="card-icon">🏞️</div>
          <div class="card-content">
            <div class="card-value">{{ plot.properties.area }} 亩</div>
            <div class="card-label">地块面积</div>
          </div>
        </div>
        <div class="info-card">
          <div class="card-icon">🌱</div>
          <div class="card-content">
            <div class="card-value">{{ plot.properties.crop }}</div>
            <div class="card-label">当前作物</div>
          </div>
        </div>
        <div class="info-card">
          <div class="card-icon">🏔️</div>
          <div class="card-content">
            <div class="card-value">{{ plot.properties.soilType }}</div>
            <div class="card-label">土壤类型</div>
          </div>
        </div>
        <div class="info-card">
          <div class="card-icon">👨‍🌾</div>
          <div class="card-content">
            <div class="card-value">{{ plot.properties.owner }}</div>
            <div class="card-label">责任人</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 当前状态 -->
    <div class="info-section">
      <div class="section-title">当前状态</div>
      <div class="status-content">
        <!-- 健康评分进度条 -->
        <div class="health-progress">
          <div class="progress-header">
            <span>健康指数</span>
            <span class="progress-value">{{ plot.properties.healthScore }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: plot.properties.healthScore + '%', backgroundColor: getHealthColor(plot.properties.healthScore) }"
            ></div>
          </div>
          <!-- AI分析解释 -->
          <div class="ai-analysis">
            <div class="analysis-header">
              <span class="ai-icon">🤖</span>
              <span>AI健康评估</span>
            </div>
            <div class="analysis-content">
              {{ getHealthAnalysis(plot.properties.healthScore) }}
            </div>
          </div>
        </div>

        <!-- 状态指标 -->
        <div class="status-indicators">
          <div class="indicator">
            <div class="indicator-dot success"></div>
            <span>土壤墒情良好</span>
          </div>
          <div class="indicator">
            <div class="indicator-dot warning"></div>
            <span>病虫害风险中等</span>
          </div>
          <div class="indicator">
            <div class="indicator-dot success"></div>
            <span>营养状况充足</span>
          </div>
        </div>

        <!-- AI状态分析 -->
        <div class="ai-status-analysis">
          <div class="analysis-header">
            <span class="ai-icon">🔍</span>
            <span>状态分析</span>
          </div>
          <div class="analysis-list">
            <div class="analysis-item">
              <strong>土壤墒情：</strong>
              <div class="analysis-details">
                <div class="data-points">
                  <span class="data-tag">传感器数据</span> 土壤含水量 {{ getSoilMoisture(plot) }}%
                  <span class="data-tag">近7日降雨</span> {{ getCurrentRainfall() }}mm
                  <span class="data-tag">蒸发量</span> {{ getEvaporation() }}mm/日
                </div>
                <div class="analysis-conclusion">
                  AI评估：当前土壤含水量{{ getSoilMoistureStatus(plot) }}，{{ getSoilMoistureAnalysis(plot) }}
                  根据作物需水规律和土壤保水能力分析，{{ getSoilMoistureRecommendation(plot) }}
                </div>
              </div>
            </div>
            <div class="analysis-item">
              <strong>病虫害风险：</strong>
              <div class="analysis-details">
                <div class="data-points">
                  <span class="data-tag">温度</span> {{ getCurrentTemp() }}°C
                  <span class="data-tag">湿度</span> {{ getCurrentHumidity() }}%
                  <span class="data-tag">历史记录</span> {{ getPestHistory(plot) }}
                  <span class="data-tag">NDVI指数</span> {{ getNDVI(plot) }}
                </div>
                <div class="analysis-conclusion">
                  AI评估：{{ getPestRiskAnalysis(plot) }}
                  基于病虫害发生模型，当前环境条件{{ getPestEnvironmentAnalysis() }}，
                  结合该地块历史数据，{{ getPestRecommendation(plot) }}
                </div>
              </div>
            </div>
            <div class="analysis-item">
              <strong>营养状况：</strong>
              <div class="analysis-details">
                <div class="data-points">
                  <span class="data-tag">有机质</span> {{ getOrganicMatter(plot) }}%
                  <span class="data-tag">土壤评分</span> {{ getSoilScore(plot) }}分
                  <span class="data-tag">叶绿素指数</span> {{ getChlorophyllIndex(plot) }}
                  <span class="data-tag">上次施肥</span> {{ getLastFertilizeDate() }}
                </div>
                <div class="analysis-conclusion">
                  AI评估：{{ getNutritionAnalysis(plot) }}
                  根据土壤养分检测和作物生长阶段分析，{{ getNutritionStatus(plot) }}
                  预测模型显示，{{ getNutritionRecommendation(plot) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 种植详情 -->
        <div class="planting-details">
          <div class="detail-row">
            <span class="detail-label">品种</span>
            <span class="detail-value">{{ plot.properties.variety || '优质品种' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">生育周期</span>
            <span class="detail-value">{{ plot.properties.growthStage || '成熟期' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">播种日期</span>
            <span class="detail-value">{{ plot.properties.plantingDate || '2024-03-15' }}</span>
          </div>
        </div>

        <!-- AI种植建议 -->
        <div class="ai-recommendations">
          <div class="analysis-header">
            <div class="header-title">
              <span class="ai-icon">💡</span>
              <span>智能建议</span>
            </div>
            <div class="header-actions-small">
              <el-button size="small" type="text" @click="createTasksFromRecommendations">
                <el-icon><Plus /></el-icon>
                批量生成任务
              </el-button>
            </div>
          </div>
          <div class="recommendation-list">
            <div class="recommendation-item priority-high">
              <div class="recommendation-header">
                <div class="priority-badge">高优先级</div>
                <el-button size="small" type="text" @click="createSingleTask('叶面施肥', 'high')">
                  <el-icon><Plus /></el-icon>
                  创建任务
                </el-button>
              </div>
              <div class="recommendation-text">建议在未来3-5天内进行叶面施肥，选择含微量元素的叶面肥，有助于提高作物抗性。</div>
            </div>
            <div class="recommendation-item priority-medium">
              <div class="recommendation-header">
                <div class="priority-badge">中优先级</div>
                <el-button size="small" type="text" @click="createSingleTask('种植驱虫植物', 'medium')">
                  <el-icon><Plus /></el-icon>
                  创建任务
                </el-button>
              </div>
              <div class="recommendation-text">考虑在地块边缘种植驱虫植物（如万寿菊），可有效降低害虫侵扰。</div>
            </div>
            <div class="recommendation-item priority-low">
              <div class="recommendation-header">
                <div class="priority-badge">低优先级</div>
                <el-button size="small" type="text" @click="createSingleTask('数据记录', 'low')">
                  <el-icon><Plus /></el-icon>
                  创建任务
                </el-button>
              </div>
              <div class="recommendation-text">建议记录每日生长观察数据，为下季种植提供参考依据。</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史记录 -->
    <div class="info-section">
      <div class="section-title">历史记录</div>
      <div class="history-content">
        <div class="history-timeline">
          <div v-for="record in mockHistoryRecords" :key="record.year" class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-year">{{ record.year }}</div>
              <div class="timeline-details">
                <div class="timeline-crop">{{ record.crop }} - {{ record.variety }}</div>
                <div class="timeline-stats">
                  <span>产量: {{ record.yield }} 吨/亩</span>
                  <span>收益: ¥{{ record.profit }}/亩</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 关联设备 -->
    <div class="info-section">
      <div class="section-title">关联设备</div>
      <div class="devices-content">
        <div v-for="device in mockDevices" :key="device.id" class="device-item">
          <div class="device-info">
            <div class="device-name">{{ device.name }}</div>
            <div class="device-status" :class="device.status">
              {{ device.status === 'online' ? '在线' : '离线' }}
            </div>
          </div>
          <div class="device-metrics">
            <div v-for="(value, key) in device.data" :key="key" class="metric">
              <span class="metric-label">{{ key }}</span>
              <span class="metric-value">{{ value }}</span>
            </div>
          </div>
          <div class="device-time">{{ device.lastUpdated }}</div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="no-selection">
    <el-empty description="请选择一个地块查看详情" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  plot: {
    type: Object,
    default: null,
  }
});

const emit = defineEmits(['task-created', 'planning-created']);

// Mock数据
const mockHistoryRecords = computed(() => [
  { year: '2023年', crop: '玉米', variety: '郑单958', yield: 0.8, profit: 1200 },
  { year: '2022年', crop: '大豆', variety: '黑农35', yield: 0.3, profit: 800 },
  { year: '2021年', crop: '玉米', variety: '先玉335', yield: 0.75, profit: 1100 }
]);

const mockActivities = computed(() => [
  { id: 1, date: '2024-08-15', type: 'success', description: '施肥 - 追施复合肥50kg/亩' },
  { id: 2, date: '2024-07-20', type: 'warning', description: '病虫害防治 - 喷洒杀虫剂' },
  { id: 3, date: '2024-06-10', type: 'primary', description: '灌溉 - 滴灌系统运行3小时' },
  { id: 4, date: '2024-05-01', type: 'info', description: '中耕除草 - 机械除草' }
]);

const mockDevices = computed(() => [
  {
    id: 1,
    name: '墒情传感器-01',
    status: 'online',
    data: {
      '土壤湿度': '65%',
      '土壤温度': '18°C',
      '电导率': '1.2mS/cm'
    },
    lastUpdated: '2024-09-22 14:30'
  },
  {
    id: 2,
    name: '气象监测站-01',
    status: 'online',
    data: {
      '气温': '25°C',
      '湿度': '72%',
      '风速': '2.3m/s',
      '降雨量': '0mm'
    },
    lastUpdated: '2024-09-22 14:25'
  },
  {
    id: 3,
    name: '虫情测报仪-01',
    status: 'offline',
    data: {
      '捕获数量': '12只',
      '主要害虫': '玉米螟',
      '风险等级': '中等'
    },
    lastUpdated: '2024-09-21 18:00'
  }
]);

const getHealthColor = (score) => {
  if (score >= 90) return '#67c23a';
  if (score >= 80) return '#e6a23c';
  if (score >= 70) return '#f56c6c';
  return '#f56c6c';
};

const getHealthAnalysis = (score) => {
  if (score >= 90) {
    return '地块健康状况优秀。AI模型基于土壤、气象、作物生长等多维数据综合评估，各项指标均处于理想范围。当前管理措施有效，建议保持现有农事操作节奏。';
  } else if (score >= 80) {
    return '地块健康状况良好。AI检测到部分指标存在轻微波动，但整体趋势稳定。建议关注土壤营养平衡和水分管理，预防性措施可有效维持高健康水平。';
  } else if (score >= 70) {
    return '地块健康状况一般。AI分析显示存在需要关注的问题，可能涉及土壤肥力、病虫害风险或水分管理。建议及时采取针对性措施，避免健康状况进一步下降。';
  } else {
    return '地块健康状况较差。AI模型识别出多个风险因素，需要立即采取干预措施。建议优先解决最紧急的问题，制定系统性的改善计划。';
  }
};

// 模拟环境数据
const getCurrentRainfall = () => Math.floor(Math.random() * 20) + 5; // 5-25mm
const getCurrentTemp = () => Math.floor(Math.random() * 10) + 20; // 20-30°C  
const getCurrentHumidity = () => Math.floor(Math.random() * 20) + 65; // 65-85%
const getEvaporation = () => (Math.random() * 2 + 3).toFixed(1); // 3-5mm/日
const getLastFertilizeDate = () => '2024-09-10';

// 从地块数据中提取具体指标
const getSoilMoisture = (plot) => plot?.properties?.soilMoisture || Math.floor(Math.random() * 40) + 40;
const getOrganicMatter = (plot) => plot?.properties?.organicMatter || (Math.random() * 2 + 1).toFixed(1);
const getSoilScore = (plot) => plot?.properties?.soilScore || plot?.properties?.healthScore || 85;
const getNDVI = (plot) => plot?.properties?.ndvi || (Math.random() * 0.3 + 0.6).toFixed(2);
const getChlorophyllIndex = (plot) => (Math.random() * 20 + 35).toFixed(1);

// AI分析函数
const getSoilMoistureStatus = (plot) => {
  const moisture = getSoilMoisture(plot);
  if (moisture > 70) return '偏高';
  if (moisture > 50) return '适中';
  if (moisture > 30) return '偏低';
  return '严重缺水';
};

const getSoilMoistureAnalysis = (plot) => {
  const moisture = getSoilMoisture(plot);
  const crop = plot?.properties?.crop || '作物';
  if (moisture > 70) return `${crop}根系周围水分充足，但需防止根部缺氧和病害发生`;
  if (moisture > 50) return `${crop}生长期所需水分得到满足，根系活力良好`;
  if (moisture > 30) return `${crop}开始出现轻微水分胁迫，影响光合作用效率`;
  return `${crop}面临严重干旱胁迫，细胞失水严重影响正常生理代谢`;
};

const getSoilMoistureRecommendation = (plot) => {
  const moisture = getSoilMoisture(plot);
  if (moisture > 70) return '建议适当控制灌溉，改善土壤通透性，预防根腐病';
  if (moisture > 50) return '维持当前水分管理策略，监测土壤蒸发情况';
  if (moisture > 30) return '建议在2-3天内进行补充灌溉，每亩灌水15-20立方米';
  return '需立即进行应急灌溉，采用少量多次的方式，避免根系损伤';
};

const getPestHistory = (plot) => {
  const severity = plot?.properties?.pestSeverity || 'medium';
  const historyMap = {
    'none': '无病虫害记录',
    'low': '轻微虫害1次',
    'medium': '中等病害2次',
    'high': '严重虫害3次'
  };
  return historyMap[severity] || '中等病害2次';
};

const getPestRiskAnalysis = (plot) => {
  const severity = plot?.properties?.pestSeverity || 'medium';
  const crop = plot?.properties?.crop || '作物';
  const riskMap = {
    'none': `${crop}病虫害风险极低，生长环境健康`,
    'low': `${crop}存在轻微病虫害风险，主要为叶面害虫`,
    'medium': `${crop}面临中等程度病虫害威胁，需重点防控`,
    'high': `${crop}病虫害风险较高，可能影响产量和品质`
  };
  return riskMap[severity] || `${crop}面临中等程度病虫害威胁`;
};

const getPestEnvironmentAnalysis = () => {
  const temp = getCurrentTemp();
  const humidity = getCurrentHumidity();
  if (temp > 25 && humidity > 75) return '高温高湿，极易滋生病菌和害虫';
  if (temp > 25 && humidity < 65) return '高温低湿，利于螨虫等害虫繁殖';
  if (temp < 22 && humidity > 75) return '低温高湿，容易引发真菌性病害';
  return '温湿度适中，病虫害发生风险可控';
};

const getPestRecommendation = (plot) => {
  const severity = plot?.properties?.pestSeverity || 'medium';
  const recommendations = {
    'none': '建议保持现有防控措施，定期监测预警',
    'low': '建议使用生物防控手段，如释放天敌昆虫',
    'medium': '建议结合物理防控和低毒农药，每7-10天巡查一次',
    'high': '建议立即采用综合防治措施，必要时使用高效低毒农药'
  };
  return recommendations[severity] || '建议结合多种防控手段';
};

const getNutritionAnalysis = (plot) => {
  const score = getSoilScore(plot);
  const organic = parseFloat(getOrganicMatter(plot));
  if (score > 90 && organic > 3) return '土壤养分状况优秀，有机质含量丰富';
  if (score > 80 && organic > 2) return '土壤养分基本充足，有机质含量适中';
  if (score > 70 && organic > 1) return '土壤养分略显不足，有机质含量偏低';
  return '土壤养分缺乏，有机质严重不足';
};

const getNutritionStatus = (plot) => {
  const chlorophyll = parseFloat(getChlorophyllIndex(plot));
  const crop = plot?.properties?.crop || '作物';
  if (chlorophyll > 45) return `${crop}叶片叶绿素含量充足，光合作用效率高`;
  if (chlorophyll > 40) return `${crop}叶片营养状况良好，生长势头正常`;
  if (chlorophyll > 35) return `${crop}叶片开始出现轻微黄化，可能缺氮`;
  return `${crop}叶片明显黄化，存在严重营养不良`;
};

const getNutritionRecommendation = (plot) => {
  const score = getSoilScore(plot);
  const organic = parseFloat(getOrganicMatter(plot));
  if (score > 90) return '当前养分状况可维持20-25天，建议制定长期培肥计划';
  if (score > 80) return '预计15-20天后需要补充养分，建议准备复合肥料';
  if (score > 70) return '建议在10-15天内追施氮磷钾肥，每亩用量25-30公斤';
  return '需立即进行土壤改良，增施有机肥和微量元素肥料';
};

// 联动功能方法（保留单个任务创建的功能）

const createTasksFromRecommendations = async () => {
  const tasks = [
    {
      title: '叶面施肥',
      priority: 'high',
      description: '进行叶面施肥，选择含微量元素的叶面肥',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3天后
    },
    {
      title: '种植驱虫植物',
      priority: 'medium', 
      description: '在地块边缘种植万寿菊等驱虫植物',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
    },
    {
      title: '数据记录',
      priority: 'low',
      description: '记录每日生长观察数据',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 明天
    }
  ];
  
  emit('task-created', { plotId: props.plot.id, tasks });
  ElMessage.success(`已创建${tasks.length}个农事任务`);
};

const createSingleTask = (taskTitle, priority) => {
  const taskMap = {
    '叶面施肥': {
      description: '进行叶面施肥，选择含微量元素的叶面肥，提高作物抗性',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    '种植驱虫植物': {
      description: '在地块边缘种植万寿菊等驱虫植物，降低害虫侵扰',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    '数据记录': {
      description: '记录每日生长观察数据，为下季种植提供参考',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    }
  };
  
  const task = {
    title: taskTitle,
    priority,
    ...taskMap[taskTitle]
  };
  
  emit('task-created', { plotId: props.plot.id, tasks: [task] });
  ElMessage.success(`已创建任务：${taskTitle}`);
};

// 生成种植规划建议
const generatePlanningRecommendations = () => {
  const crop = props.plot.properties.crop;
  const healthScore = props.plot.properties.healthScore;
  const soilType = props.plot.properties.soilType;
  
  return {
    nextSeason: {
      recommendedCrop: getRecommendedCrop(crop, healthScore),
      reason: `基于当前${crop}的健康评分${healthScore}和${soilType}土质分析`,
      expectedYield: `${(Math.random() * 0.5 + 0.8).toFixed(1)}吨/亩`,
      expectedProfit: `¥${Math.floor(Math.random() * 500 + 1000)}/亩`
    },
    improvements: [
      healthScore < 80 ? '建议进行土壤改良，提高有机质含量' : '维持当前良好的土壤状况',
      '优化灌溉系统，提高水分利用效率',
      '建立病虫害监测体系，及时防控'
    ]
  };
};

// 根据当前作物和健康状况推荐下季作物
const getRecommendedCrop = (currentCrop, healthScore) => {
  const rotationMap = {
    '玉米': healthScore > 85 ? '大豆' : '绿肥作物',
    '大豆': '玉米',
    '小麦': '玉米',
    '水稻': healthScore > 90 ? '水稻' : '休耕',
    '棉花': '玉米',
    '花生': '小麦'
  };
  return rotationMap[currentCrop] || '根据土壤检测结果确定';
};

// 生成基于分析的任务
const generateTasksFromAnalysis = () => {
  const tasks = [];
  const moisture = getSoilMoisture(props.plot);
  const healthScore = props.plot.properties.healthScore;
  const pestSeverity = props.plot.properties.pestSeverity;
  
  // 基于土壤墒情生成任务
  if (moisture < 30) {
    tasks.push({
      title: '紧急灌溉',
      priority: 'high',
      description: '土壤含水量过低，需立即进行补充灌溉',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    });
  } else if (moisture < 50) {
    tasks.push({
      title: '补充灌溉',
      priority: 'medium',
      description: '土壤含水量偏低，建议2-3天内进行灌溉',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    });
  }
  
  // 基于健康评分生成任务
  if (healthScore < 80) {
    tasks.push({
      title: '土壤改良',
      priority: 'high',
      description: '地块健康评分偏低，需要进行土壤改良和施肥',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });
  }
  
  // 基于病虫害风险生成任务
  if (pestSeverity === 'high') {
    tasks.push({
      title: '病虫害防治',
      priority: 'high',
      description: '病虫害风险较高，需立即采取防治措施',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    });
  } else if (pestSeverity === 'medium') {
    tasks.push({
      title: '病虫害监测',
      priority: 'medium',
      description: '加强病虫害监测，预防性喷药',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });
  }
  
  return tasks;
};
</script>

<style scoped lang="scss">
.plot-detail {
  height: 100%;
  padding: 0;
  background: linear-gradient(135deg, #1a1f3a 0%, #2d3561 100%);
  border-radius: 8px;
  border: 1px solid rgba(0, 170, 255, 0.3);
  overflow-y: auto;
  color: #fff;
  
  // 标题栏
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: rgba(0, 170, 255, 0.1);
    border-bottom: 1px solid rgba(0, 170, 255, 0.2);
    
    .plot-title {
      h3 {
        margin: 0 0 4px 0;
        color: #00aaff;
        font-size: 18px;
        font-weight: 600;
      }
      
      .plot-subtitle {
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
      }
    }
    
    .health-score {
      text-align: center;
      
      .score-value {
        font-size: 24px;
        font-weight: bold;
        color: #00aaff;
        line-height: 1;
      }
      
      .score-label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        margin-top: 4px;
      }
    }
  }
  
  // 信息区块
  .info-section {
    padding: 20px;
    border-bottom: 1px solid rgba(0, 170, 255, 0.1);
    
    &:last-child {
      border-bottom: none;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #00aaff;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(0, 170, 255, 0.2);
    }
  }
  
  // 基本信息卡片
  .info-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    
    .info-card {
      display: flex;
      align-items: center;
      padding: 12px;
      background: rgba(0, 170, 255, 0.05);
      border: 1px solid rgba(0, 170, 255, 0.2);
      border-radius: 6px;
      
      .card-icon {
        font-size: 20px;
        margin-right: 12px;
      }
      
      .card-content {
        .card-value {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 2px;
        }
        
        .card-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }
      }
    }
  }
  
  // 当前状态内容
  .status-content {
    .health-progress {
      margin-bottom: 20px;
      
      .progress-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
        
        .progress-value {
          color: #00aaff;
          font-weight: 600;
        }
      }
      
      .progress-bar {
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 12px;
        
        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
          border-radius: 4px;
        }
      }
      
      .ai-analysis {
        background: rgba(0, 170, 255, 0.08);
        border: 1px solid rgba(0, 170, 255, 0.2);
        border-radius: 6px;
        padding: 12px;
        
        .analysis-header {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #00aaff;
          
          .ai-icon {
            margin-right: 6px;
          }
        }
        
        .analysis-content {
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
    
    .status-indicators {
      margin-bottom: 20px;
      
      .indicator {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        font-size: 13px;
        
        .indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
          
          &.success { background: #67c23a; }
          &.warning { background: #e6a23c; }
          &.danger { background: #f56c6c; }
        }
      }
    }
    
    .planting-details {
      .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 4px;
        
        .detail-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
        }
        
        .detail-value {
          color: #fff;
          font-size: 13px;
          font-weight: 500;
        }
      }
    }
    
    // AI状态分析和建议
    .ai-status-analysis,
    .ai-recommendations {
      margin-bottom: 20px;
      background: rgba(0, 170, 255, 0.05);
      border: 1px solid rgba(0, 170, 255, 0.15);
      border-radius: 6px;
      padding: 16px;
      
      .analysis-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        
        .header-title {
          display: flex;
          align-items: center;
          font-size: 14px;
          font-weight: 600;
          color: #00aaff;
          
          .ai-icon {
            margin-right: 8px;
            font-size: 16px;
          }
        }
        
        .header-actions-small {
          .el-button {
            color: rgba(255, 255, 255, 0.8);
            
            &:hover {
              color: #00aaff;
            }
          }
        }
      }
      
      .analysis-list {
        .analysis-item {
          margin-bottom: 16px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          border-left: 3px solid rgba(0, 170, 255, 0.4);
          
          &:last-child {
            margin-bottom: 0;
          }
          
          strong {
            color: #00aaff;
            font-size: 13px;
            display: block;
            margin-bottom: 8px;
          }
          
          .analysis-details {
            .data-points {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-bottom: 10px;
              
              .data-tag {
                display: inline-flex;
                align-items: center;
                padding: 2px 6px;
                background: rgba(0, 170, 255, 0.15);
                border-radius: 10px;
                font-size: 10px;
                color: #00aaff;
                font-weight: 500;
                
                &::after {
                  content: ':';
                  margin-left: 2px;
                  margin-right: 4px;
                }
              }
              
              // 数据值样式
              span:not(.data-tag) {
                color: rgba(255, 255, 255, 0.9);
                font-size: 11px;
                font-weight: 500;
              }
            }
            
            .analysis-conclusion {
              font-size: 12px;
              line-height: 1.6;
              color: rgba(255, 255, 255, 0.85);
              padding: 8px;
              background: rgba(0, 170, 255, 0.08);
              border-radius: 4px;
              border: 1px solid rgba(0, 170, 255, 0.15);
            }
          }
        }
      }
      
      .recommendation-list {
        .recommendation-item {
          margin-bottom: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 4px;
          border-left: 3px solid;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          &.priority-high {
            border-left-color: #f56c6c;
            
            .priority-badge {
              background: rgba(245, 108, 108, 0.2);
              color: #f56c6c;
            }
          }
          
          &.priority-medium {
            border-left-color: #e6a23c;
            
            .priority-badge {
              background: rgba(230, 162, 60, 0.2);
              color: #e6a23c;
            }
          }
          
          &.priority-low {
            border-left-color: #67c23a;
            
            .priority-badge {
              background: rgba(103, 194, 58, 0.2);
              color: #67c23a;
            }
          }
          
          .recommendation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            
            .el-button {
              color: rgba(255, 255, 255, 0.6);
              font-size: 11px;
              
              &:hover {
                color: #00aaff;
              }
            }
          }
          
          .priority-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
          }
          
          .recommendation-text {
            font-size: 12px;
            line-height: 1.5;
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }
    }
  }
  
  // 历史记录
  .history-content {
    .history-timeline {
      position: relative;
      
      .timeline-item {
        position: relative;
        padding-left: 24px;
        margin-bottom: 20px;
        
        &:not(:last-child)::before {
          content: '';
          position: absolute;
          left: 7px;
          top: 20px;
          bottom: -20px;
          width: 1px;
          background: rgba(0, 170, 255, 0.3);
        }
        
        .timeline-dot {
          position: absolute;
          left: 0;
          top: 6px;
          width: 8px;
          height: 8px;
          background: #00aaff;
          border-radius: 50%;
          border: 2px solid rgba(0, 170, 255, 0.3);
        }
        
        .timeline-content {
          .timeline-year {
            color: #00aaff;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 4px;
          }
          
          .timeline-details {
            .timeline-crop {
              color: #fff;
              font-size: 14px;
              font-weight: 500;
              margin-bottom: 4px;
            }
            
            .timeline-stats {
              display: flex;
              gap: 16px;
              
              span {
                color: rgba(255, 255, 255, 0.7);
                font-size: 12px;
              }
            }
          }
        }
      }
    }
  }
  
  // 设备列表
  .devices-content {
    .device-item {
      margin-bottom: 16px;
      padding: 16px;
      background: rgba(0, 170, 255, 0.05);
      border: 1px solid rgba(0, 170, 255, 0.2);
      border-radius: 6px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .device-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        
        .device-name {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }
        
        .device-status {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 12px;
          
          &.online {
            background: rgba(103, 194, 58, 0.2);
            color: #67c23a;
          }
          
          &.offline {
            background: rgba(245, 108, 108, 0.2);
            color: #f56c6c;
          }
        }
      }
      
      .device-metrics {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin-bottom: 8px;
        
        .metric {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          
          .metric-label {
            color: rgba(255, 255, 255, 0.7);
          }
          
          .metric-value {
            color: #00aaff;
            font-weight: 500;
          }
        }
      }
      
      .device-time {
        text-align: right;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }
}

.no-selection {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1f3a 0%, #2d3561 100%);
  border-radius: 8px;
  border: 1px solid rgba(0, 170, 255, 0.3);
  
  :deep(.el-empty) {
    .el-empty__description p {
      color: rgba(255, 255, 255, 0.7);
    }
  }
}
</style>

