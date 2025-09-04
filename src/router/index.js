import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/components/Layout.vue' // 导入Layout组件

const routes = [
  {
    path: '/',
    component: Layout, // 根路径渲染Layout组件
    redirect: '/dashboard', // 访问'/'时，重定向到'/dashboard'
    children: [ // 定义子路由
      {
        path: 'dashboard', // 注意这里没有'/'
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'), // 懒加载Dashboard组件
        meta: { title: '首页' } // 添加 meta 信息
      },
      {
        path: 'data-center',
        name: 'DataCenter',
        component: () => import('@/components/RouterOutlet.vue'),
        redirect: '/data-center/devices',
        meta: { title: '数据资源中心' },
        children: [
          { path: 'devices', name: 'DeviceLedger', component: () => import('@/views/DataCenter.vue'), meta: { title: '采集设备管理' } },
          { path: 'ingestion', name: 'DataIngestion', component: () => import('@/views/dataCenter/Ingestion.vue'), meta: { title: '数据管理入湖' } },
          { path: 'knowledge', name: 'KnowledgeCenter', component: () => import('@/views/dataCenter/Knowledge.vue'), meta: { title: '知识库' } },
          { path: 'manual-report', name: 'ManualReport', component: () => import('@/views/dataCenter/ManualReport.vue'), meta: { title: '人工上报管理' } },
        ]
      },
      {
        path: 'farmer-management', // Using a new path
        name: 'FarmerManagement', // Using a proper name
        component: () => import('@/views/FarmerManagement.vue'), // Pointing to the new component
        meta: { title: '农户管理' } // Correct title
      },
      {
        path: 'intelligent-analysis',
        name: 'IntelligentAnalysis',
        component: () => import('@/components/RouterOutlet.vue'), // Use the clean router outlet
        redirect: '/intelligent-analysis/moisture', // Restore redirect for better user experience
        meta: { title: '智能分析决策' },
        children: [
          { path: 'moisture', name: 'MoistureAnalysis', component: () => import('@/views/analysis/MoistureAnalysis.vue'), meta: { title: '墒情分析决策建议' } },
          { path: 'crop-growth', name: 'CropGrowthAnalysis', component: () => import('@/views/analysis/CropGrowthAnalysis.vue'), meta: { title: '作物长势分析预测' } },
          { path: 'land-use', name: 'LandUseAnalysis', component: () => import('@/views/analysis/LandUseAnalysis.vue'), meta: { title: '土地用途分析决策' } },
          { path: 'land-degredation', name: 'LandDegradationAnalysis', component: () => import('@/views/analysis/LandDegradationAnalysis.vue'), meta: { title: '耕地退化分析' } },
          { path: 'yield-prediction', name: 'YieldPrediction', component: () => import('@/views/analysis/YieldPrediction.vue'), meta: { title: '产量与产值预测' } },
          { path: 'digital-twin', name: 'DigitalTwin', component: () => import('@/views/analysis/DigitalTwin.vue'), meta: { title: '智慧灌溉数字孪生' } },
          { path: 'pest-prediction', name: 'PestPrediction', component: () => import('@/views/analysis/PestPrediction.vue'), meta: { title: '病虫害分析与预测' } },
        ]
      },
      {
        path: 'system-management',
        name: 'SystemManagement',
        component: () => import('@/views/SystemManagement.vue'),
        meta: { title: '系统管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router 