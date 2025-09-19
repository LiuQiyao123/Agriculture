import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/components/Layout.vue' // 导入Layout组件

const routes = [
  {
    path: '/',
    component: Layout, // 根路径渲染Layout组件
    redirect: '/dashboard', // 访问'/'时，重定向到'/dashboard'
    children: [ // 定义子路由
      // 模块一: 农业态势大屏
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '农业态势大屏' } // [MODIFIED] 名称更新
      },
      // 模块二: 智能分析决策 (改造)
      {
        path: 'intelligent-analysis',
        name: 'IntelligentAnalysis',
        component: () => import('@/components/RouterOutlet.vue'),
        redirect: '/intelligent-analysis/crop-growth',
        meta: { title: '智能分析决策' },
        children: [
          // [NEW] 新增模块，并按新命名和排序更新
          { path: 'weather-alert', name: 'WeatherAlert', component: () => import('@/views/analysis/WeatherAlert.vue'), meta: { title: '农业气象预警' } },
          { path: 'land-use', name: 'LandUseEvaluation', component: () => import('@/views/analysis/LandUseAnalysis.vue'), meta: { title: '地块利用评估' } },
          { path: 'land-degredation', name: 'LandDegradationEvaluation', component: () => import('@/views/analysis/LandDegradationAnalysis.vue'), meta: { title: '地力退化评估' } },
          { path: 'soil-health', name: 'SoilHealthDiagnosis', component: () => import('@/views/analysis/SoilHealthAnalysis.vue'), meta: { title: '土壤健康诊断' } },
          { path: 'moisture', name: 'MoistureMonitor', component: () => import('@/views/analysis/MoistureAnalysis.vue'), meta: { title: '土壤墒情监测' } },
          { path: 'crop-growth', name: 'CropGrowthDiagnosis', component: () => import('@/views/analysis/CropGrowthAnalysis.vue'), meta: { title: '作物长势诊断' } },
          { path: 'yield-prediction', name: 'YieldPrediction', component: () => import('@/views/analysis/YieldPrediction.vue'), meta: { title: '作物产量预测' } },
          { path: 'pest-risk', name: 'PestRiskWarning', component: () => import('@/views/analysis/PestPrediction.vue'), meta: { title: '病虫害风险预警' } },
        ]
      },
      // 模块三: 智慧农事管理 (新增)
      {
        path: 'farm-management',
        name: 'SmartFarmManagement',
        component: () => import('@/components/RouterOutlet.vue'),
        redirect: '/farm-management/plots',
        meta: { title: '智慧农事管理' },
        children: [
          { path: 'plots', name: 'PlotManagement', component: () => import('@/views/farm/PlotManagement.vue'), meta: { title: '地块管理' } },
          { path: 'plans', name: 'PlantingPlan', component: () => import('@/views/farm/PlantingPlan.vue'), meta: { title: '种植规划' } },
          { path: 'tasks', name: 'TaskKanban', component: () => import('@/views/farm/TaskKanban.vue'), meta: { title: '任务看板' } },
          { path: 'harvesting', name: 'HarvestManagement', component: () => import('@/views/farm/HarvestManagement.vue'), meta: { title: '采收任务管理' } },
          { path: 'alerts', name: 'AlertCenter', component: () => import('@/views/farm/AlertCenter.vue'), meta: { title: '农事预警中心' } },
          { path: 'statistics', name: 'DataStatistics', component: () => import('@/views/farm/DataStatistics.vue'), meta: { title: '数据统计分析' } },
        ]
      },
      // 模块四: 农资管理 (新增)
      {
        path: 'resource-management',
        name: 'ResourceManagement',
        component: () => import('@/components/RouterOutlet.vue'),
        redirect: '/resource-management/machinery',
        meta: { title: '农资管理' },
        children: [
          { path: 'machinery', name: 'MachineryDispatch', component: () => import('@/views/resource/MachineryDispatch.vue'), meta: { title: '农机调度' } },
          { path: 'supplies', name: 'SupplyManagement', component: () => import('@/views/resource/SupplyManagement.vue'), meta: { title: '农资库存管理' } },
          { path: 'staff', name: 'StaffManagement', component: () => import('@/views/FarmerManagement.vue'), meta: { title: '人员管理与调度' } },
        ]
      },
      // 模块五: 数据服务中心 (改造)
      {
        path: 'data-service',
        name: 'DataServiceCenter',
        component: () => import('@/components/RouterOutlet.vue'),
        redirect: '/data-service/devices',
        meta: { title: '数据服务中心' }, // [MODIFIED] 名称更新
        children: [
          { path: 'devices', name: 'DeviceLedger', component: () => import('@/views/DataCenter.vue'), meta: { title: '采集设备管理' } },
          { path: 'ingestion', name: 'DataIngestion', component: () => import('@/views/dataCenter/Ingestion.vue'), meta: { title: '数据管理入湖' } },
          { path: 'knowledge', name: 'KnowledgeCenter', component: () => import('@/views/dataCenter/Knowledge.vue'), meta: { title: '知识库' } },
          { path: 'manual-report', name: 'ManualReport', component: () => import('@/views/dataCenter/ManualReport.vue'), meta: { title: '人工上报管理' } },
          // [MOVED] 系统管理移入
          { path: 'system', name: 'SystemManagement', component: () => import('@/views/SystemManagement.vue'), meta: { title: '系统管理' } }
        ]
      },
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router 