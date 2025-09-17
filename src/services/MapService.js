// src/services/MapService.js

/**
 * @typedef {import('@/types').GeoJSONFeature} GeoJSONFeature
 * @typedef {import('@/types').GeoJSON} GeoJSON
 */

/**
 * 根据图层关键字和地块的业务数据，为 GeoJSON 的每个 feature 计算并附加一个 layerColor 属性。
 * 
 * @param {GeoJSON} originalGeojson - 原始的、未处理的地块 GeoJSON 数据。
 * @param {string} layerKey - 当前需要激活的图层关键字, 例如 'soil-moisture'。
 * @returns {GeoJSON} - 返回一个新的 GeoJSON 对象，其 features 的 properties 中包含了 layerColor。
 */
export function getProcessedGeoJSON(originalGeojson, layerKey) {
  if (!originalGeojson || !originalGeojson.features) {
    return originalGeojson;
  }

  const newFeatures = originalGeojson.features.map(feature => {
    let color = 'rgba(0, 170, 255, 0.1)'; // Default color if no data
    const properties = feature.properties;

    if (properties) {
        switch (layerKey) {
            case 'soil-moisture':
              const moisture = properties.soilMoisture;
              if (moisture !== undefined) {
                if (moisture < 20) color = '#d73027';      // 重旱
                else if (moisture < 40) color = '#fc8d59'; // 中旱
                else if (moisture < 60) color = '#fee08b'; // 轻旱
                else if (moisture < 80) color = '#d9ef8b'; // 适宜
                else color = '#91cf60';                    // 湿润
              }
              break;
              
            case 'soil-quality':
              const organicMatter = properties.organicMatter;
              if (organicMatter !== undefined) {
                if (organicMatter < 1) color = '#d73027';      // 贫瘠
                else if (organicMatter < 2) color = '#fc8d59'; // 较差
                else if (organicMatter < 3) color = '#fee08b'; // 中等
                else if (organicMatter < 4) color = '#d9ef8b'; // 良好
                else color = '#91cf60';                    // 优
              }
              break;
              
            case 'pest-disease':
              const pestSeverity = properties.pestSeverity;
              if (pestSeverity !== undefined) {
                if (pestSeverity === 'high') color = '#d73027';
                else if (pestSeverity === 'medium') color = '#fc8d59';
                else if (pestSeverity === 'low') color = '#fee08b';
                else color = '#91cf60'; // none or other
              }
              break;

            case 'ndvi-tiles':
              const ndvi = properties.ndvi;
              if (ndvi !== undefined) {
                if (ndvi < 0.6) color = '#ffc53d';      // 长势偏弱
                else if (ndvi < 0.8) color = '#a0d911'; // 长势中等
                else color = '#00c851';                    // 长势良好
              }
              break;
              
            // 可以根据需要为其他图层添加 case
            // case 'ndvi-tiles': ...
        }
    }
    
    return {
      ...feature,
      properties: {
        ...properties,
        layerColor: color
      }
    };
  });

  return {
    ...originalGeojson,
    features: newFeatures
  };
}
