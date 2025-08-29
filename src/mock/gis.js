export const gisLayers = {
  ndvi: {
    name: "NDVI热力图",
    type: "raster",
    source: {
      type: "raster",
      tiles: ["static/tiles/ndvi/{z}/{x}/{y}.png"],
      tileSize: 256
    },
    paint: {
      'raster-opacity': 0.6
    }
  }
}; 