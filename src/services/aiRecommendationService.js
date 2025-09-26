// AI推荐服务 - 模拟后端API调用
export class AIRecommendationService {
  static async getPlantingRecommendations(plotIds, goal) {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 根据目标生成不同的推荐方案
    const recommendations = this.generateRecommendationsByGoal(goal, plotIds.length);
    
    return {
      success: true,
      data: recommendations,
      message: 'AI推荐方案生成成功'
    };
  }
  
  static generateRecommendationsByGoal(goal, plotCount) {
    const baseRecommendations = {
      profit: [
        {
          title: '方案A: 特色经济作物',
          estimatedYield: 300,
          estimatedProfit: 180000,
          estimatedCost: 120000,
          risk: { level: 'medium' },
          summary: '种植高附加值的特色作物，单位利润高，但市场波动较大。',
          features: ['高附加值', '市场导向', '风险适中'],
          crop: '特色蔬菜',
          plantingDate: '2025-03-15',
          harvestDate: '2025-08-30'
        },
        {
          title: '方案B: 大豆-玉米轮作',
          estimatedYield: 700,
          estimatedProfit: 155000,
          estimatedCost: 100000,
          risk: { level: 'low' },
          summary: '经典的轮作模式，既能保证较高收益，又有利于土壤健康和可持续发展。',
          features: ['轮作模式', '土壤健康', '稳定收益'],
          crop: '大豆+玉米',
          plantingDate: '2025-04-01',
          harvestDate: '2025-10-15'
        },
        {
          title: '方案C: 饲料玉米',
          estimatedYield: 900,
          estimatedProfit: 140000,
          estimatedCost: 80000,
          risk: { level: 'low' },
          summary: '与本地养殖场签订订单，收益稳定，无销售压力。',
          features: ['订单农业', '稳定销售', '低风险'],
          crop: '饲料玉米',
          plantingDate: '2025-03-20',
          harvestDate: '2025-09-15'
        }
      ],
      yield: [
        {
          title: '方案A: 稳产型玉米',
          estimatedYield: 850,
          estimatedProfit: 120000,
          estimatedCost: 90000,
          risk: { level: 'low' },
          summary: '采用传统高产品种，产量稳定，市场风险较低。',
          features: ['高产品种', '技术成熟', '风险较低'],
          crop: '高产玉米',
          plantingDate: '2025-03-15',
          harvestDate: '2025-09-30'
        },
        {
          title: '方案B: 高密种植试验',
          estimatedYield: 1050,
          estimatedProfit: 135000,
          estimatedCost: 110000,
          risk: { level: 'medium' },
          summary: '增加种植密度并配合精准水肥，有望实现超高产，但对管理要求高。',
          features: ['超高产', '精准管理', '技术要求高'],
          crop: '高密玉米',
          plantingDate: '2025-03-10',
          harvestDate: '2025-09-20'
        }
      ],
      water_saving: [
        {
          title: '方案A: 节水灌溉水稻',
          estimatedYield: 600,
          estimatedProfit: 110000,
          estimatedCost: 70000,
          risk: { level: 'low' },
          summary: '采用节水灌溉技术，在保证产量的同时大幅减少用水量。',
          features: ['节水技术', '环保友好', '成本较低'],
          crop: '节水水稻',
          plantingDate: '2025-04-15',
          harvestDate: '2025-10-30'
        },
        {
          title: '方案B: 旱作农业',
          estimatedYield: 400,
          estimatedProfit: 95000,
          estimatedCost: 50000,
          risk: { level: 'medium' },
          summary: '完全依靠自然降雨，适合水资源紧缺地区，但产量相对较低。',
          features: ['完全旱作', '环保', '适应性强'],
          crop: '旱作小麦',
          plantingDate: '2025-03-01',
          harvestDate: '2025-07-15'
        }
      ],
      carbon_neutral: [
        {
          title: '方案A: 有机农业',
          estimatedYield: 350,
          estimatedProfit: 130000,
          estimatedCost: 85000,
          risk: { level: 'medium' },
          summary: '采用有机种植方式，减少化肥农药使用，实现碳中和目标。',
          features: ['有机认证', '环保', '健康食品'],
          crop: '有机蔬菜',
          plantingDate: '2025-03-20',
          harvestDate: '2025-08-15'
        },
        {
          title: '方案B: 生态农业',
          estimatedYield: 500,
          estimatedProfit: 115000,
          estimatedCost: 75000,
          risk: { level: 'low' },
          summary: '结合种植和养殖，形成生态循环，实现可持续发展。',
          features: ['生态循环', '可持续发展', '多元化'],
          crop: '生态混合',
          plantingDate: '2025-04-01',
          harvestDate: '2025-10-30'
        }
      ]
    };
    
    return baseRecommendations[goal] || baseRecommendations.profit;
  }
  
  // 模拟获取地块历史数据
  static async getPlotHistory(plotIds) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: plotIds.map(id => ({
        plotId: id,
        lastCrop: '玉米',
        lastYield: 800,
        soilHealth: '良好',
        waterAvailability: '充足'
      }))
    };
  }
  
  // 模拟获取市场行情
  static async getMarketData() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: {
        cornPrice: 2.8,
        soybeanPrice: 3.2,
        ricePrice: 3.5,
        trend: '上涨'
      }
    };
  }
  
  // 模拟获取天气预测
  static async getWeatherForecast() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      success: true,
      data: {
        temperature: '适宜',
        rainfall: '正常',
        risk: '低'
      }
    };
  }
}
