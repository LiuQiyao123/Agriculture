export const gisLayers = {
  ndvi: {
    name: "作物长势(NDVI)",
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [[[116.35, 39.95], [116.45, 39.95], [116.45, 40.05], [116.35, 40.05], [116.35, 39.95]]] },
          properties: { value: 0.82 }
        }
      ]
    },
    paint: {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'value'],
        0.4, '#FFFF00', // 差 (黄色)
        0.6, '#ADFF2F', // 中 (黄绿)
        0.8, '#008000'  // 优 (深绿)
      ],
      'fill-opacity': 0.6
    }
  },
  moisture: {
    name: "土壤墒情",
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [[[116.30, 39.85], [116.40, 39.85], [116.40, 39.95], [116.30, 39.95], [116.30, 39.85]]] },
          properties: { value: 35 }
        }
      ]
    },
    paint: {
       'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'value'],
        20, '#FF4500', // 重旱 (橙红)
        40, '#FFA500', // 中旱 (橙色)
        60, '#FFFF00'  // 轻旱 (黄色)
      ],
      'fill-opacity': 0.6
    }
  }
}; 