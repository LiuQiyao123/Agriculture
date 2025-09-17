export const baseLayerConfig = {
  背景: {
    id: 'background',
    type: 'background',
    paint: { 'background-color': '#0A1929' }
  },
  卫星: {
    id: 'satellite',
    type: 'raster',
    source: 'satellite-tiles',
    layout: { visibility: 'none' }
  },
  // Note: The following layers are based on the Protomaps sample data structure.
  // They might not perfectly match our desired '水系', '道路' etc. but will show something.
  地块: {
    id: '地块',
    type: 'fill',
    source: 'vector-tiles',
    'source-layer': 'cb_2018_us_zcta510_500k',
    paint: {
      'fill-color': 'rgba(0, 170, 255, 0.1)',
      'fill-outline-color': 'rgba(0, 170, 255, 0.5)',
    }
  },
  地块边界: {
    id: '地块边界',
    type: 'line',
    source: 'vector-tiles',
    'source-layer': 'cb_2018_us_zcta510_500k',
    paint: {
      'line-color': '#00aaff',
      'line-width': 1
    }
  },
};
