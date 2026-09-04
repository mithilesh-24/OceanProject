import * as Cesium from 'cesium';

export class CloudsManager {
  private viewer: Cesium.Viewer;
  private cloudEntity: Cesium.Entity | null = null;
  private isEnabled: boolean = true;
  private removePostUpdate: (() => void) | null = null;
  private rotationAngle: number = 0;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.initCloudLayer();
  }

  private initCloudLayer() {
    // Create an atmospheric cloud sphere entity slightly above Earth radius
    this.cloudEntity = this.viewer.entities.add({
      name: 'Earth Atmospheric Cloud Layer',
      position: Cesium.Cartesian3.ZERO,
      ellipsoid: {
        radii: new Cesium.Cartesian3(6378137 + 15000, 6378137 + 15000, 6356752 + 15000),
        material: new Cesium.GridMaterialProperty({
          color: Cesium.Color.WHITE.withAlpha(0.12),
          cellAlpha: 0.05,
          lineCount: new Cesium.Cartesian2(12, 12),
          lineThickness: new Cesium.Cartesian2(2.0, 2.0),
        }),
        show: this.isEnabled,
      },
    });

    // Animate subtle cloud rotation
    this.removePostUpdate = this.viewer.scene.postUpdate.addEventListener(() => {
      if (!this.cloudEntity || !this.isEnabled) return;
      this.rotationAngle += 0.0001;
      const heading = this.rotationAngle;
      const hpr = new Cesium.HeadingPitchRoll(heading, 0, 0);
      const orientation = Cesium.Transforms.headingPitchRollQuaternion(
        Cesium.Cartesian3.ZERO,
        hpr
      );
      this.cloudEntity.orientation = new Cesium.ConstantProperty(orientation);
    });
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (this.cloudEntity && this.cloudEntity.ellipsoid) {
      this.cloudEntity.ellipsoid.show = new Cesium.ConstantProperty(enabled);
    }
  }

  public destroy() {
    if (this.removePostUpdate) {
      this.removePostUpdate();
    }
    if (this.cloudEntity && this.viewer && !this.viewer.isDestroyed()) {
      this.viewer.entities.remove(this.cloudEntity);
    }
  }
}
