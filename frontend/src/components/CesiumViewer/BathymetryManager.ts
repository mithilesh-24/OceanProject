import * as Cesium from 'cesium';

export class BathymetryManager {
  private viewer: Cesium.Viewer;
  private bathymetryLayer: Cesium.ImageryLayer | null = null;
  private isEnabled: boolean = false;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.initBathymetry();
  }

  private async initBathymetry() {
    try {
      // Load Esri Ocean Basemap with detailed bathymetry depth contours
      const provider = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
        'https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer'
      );
      
      if (this.viewer && !this.viewer.isDestroyed()) {
        this.bathymetryLayer = this.viewer.imageryLayers.addImageryProvider(provider);
        this.bathymetryLayer.alpha = 0.85;
        this.bathymetryLayer.show = this.isEnabled;
      }
    } catch (e) {
      console.warn('Bathymetry imagery load notice:', e);
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (this.bathymetryLayer) {
      this.bathymetryLayer.show = enabled;
    }
  }

  public destroy() {
    if (this.bathymetryLayer && this.viewer && !this.viewer.isDestroyed()) {
      this.viewer.imageryLayers.remove(this.bathymetryLayer);
    }
  }
}
