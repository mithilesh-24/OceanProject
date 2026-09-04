import * as Cesium from 'cesium';

export interface WaveDatasetParams {
  height: number;    // meters (e.g. 2.5m wave height)
  direction: number; // degrees (0-360)
  period: number;    // seconds
}

export class WaveVisualizationEngine {
  private viewer: Cesium.Viewer;
  private isEnabled: boolean = false;
  private waveParams: WaveDatasetParams = {
    height: 1.5,
    direction: 45,
    period: 6.0,
  };

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  public updateDataset(params: Partial<WaveDatasetParams>) {
    this.waveParams = { ...this.waveParams, ...params };
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (this.viewer && !this.viewer.isDestroyed()) {
      const globe = this.viewer.scene.globe;
      globe.showWaterEffect = true;
    }
  }

  public destroy() {
    // Clean up wave shader primitives if initialized
  }
}
