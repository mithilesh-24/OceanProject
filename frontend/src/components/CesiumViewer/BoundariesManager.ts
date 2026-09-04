import * as Cesium from 'cesium';

export class BoundariesManager {
  private viewer: Cesium.Viewer;
  private dataSource: Cesium.GeoJsonDataSource | null = null;
  private isEnabled: boolean = true;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.loadBoundaries();
  }

  private async loadBoundaries() {
    try {
      // Load simplified world country boundaries GeoJSON
      const ds = await Cesium.GeoJsonDataSource.load(
        'https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson',
        {
          stroke: Cesium.Color.fromCssColorString('#a78bfa').withAlpha(0.6),
          fill: Cesium.Color.TRANSPARENT,
          strokeWidth: 1.5,
          clampToGround: true,
        }
      );

      this.dataSource = ds;
      if (this.viewer && !this.viewer.isDestroyed()) {
        await this.viewer.dataSources.add(ds);
        ds.show = this.isEnabled;
      }
    } catch (e) {
      console.warn('Country boundaries load notice:', e);
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (this.dataSource) {
      this.dataSource.show = enabled;
    }
  }

  public destroy() {
    if (this.dataSource && this.viewer && !this.viewer.isDestroyed()) {
      this.viewer.dataSources.remove(this.dataSource);
    }
  }
}
