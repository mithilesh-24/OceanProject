import * as Cesium from 'cesium';
import { DepthLayerConfig } from '../../services/apiClient';

export class DepthLayerVisualizationManager {
  private viewer: Cesium.Viewer | null;
  private planeEntities: Map<number, Cesium.Entity> = new Map();
  private trajectoryEntities: Cesium.Entity[] = [];

  constructor(viewer: Cesium.Viewer | null) {
    this.viewer = viewer;
  }

  public setViewer(viewer: Cesium.Viewer | null) {
    if (this.viewer !== viewer) {
      this.planeEntities.clear();
      this.trajectoryEntities = [];
      this.viewer = viewer;
    }
  }

  /**
   * Updates 3D Subsurface Depth Planes across the Indian Ocean basin (45°E-100°E, 10°S-25°N)
   */
  public updateDepthPlanes(
    layers: DepthLayerConfig[],
    visibleDepths: Set<number>,
    opacity: number
  ) {
    if (!this.viewer || this.viewer.isDestroyed() || !this.viewer.entities) return;

    const entities = this.viewer.entities;

    // Clear old planes that are no longer present or visible
    this.planeEntities.forEach((entity, depth) => {
      if (!visibleDepths.has(depth)) {
        try {
          entities.remove(entity);
        } catch {
          // safe remove
        }
        this.planeEntities.delete(depth);
      }
    });

    layers.forEach((layer) => {
      if (!visibleDepths.has(layer.depth_m)) return;

      const existing = this.planeEntities.get(layer.depth_m);
      const hex = layer.color || '#00f2fe';
      const cesiumColor = Cesium.Color.fromCssColorString(hex).withAlpha(opacity);

      // In Cesium, depth below sea level can be represented via negative height or scaled altitude
      const altitudeMeters = -layer.depth_m * 20.0; // Scaled for visible 3D Earth perspective

      if (existing) {
        if (existing.polygon) {
          existing.polygon.material = new Cesium.ColorMaterialProperty(cesiumColor);
        }
      } else {
        try {
          const entity = entities.add({
            name: `3D Depth Plane: ${layer.name}`,
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights([
                45.0, -10.0, altitudeMeters,
                100.0, -10.0, altitudeMeters,
                100.0, 25.0, altitudeMeters,
                45.0, 25.0, altitudeMeters,
              ]),
              material: new Cesium.ColorMaterialProperty(cesiumColor),
              height: altitudeMeters,
              extrudedHeight: altitudeMeters - 1000.0,
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString(hex).withAlpha(0.8),
              outlineWidth: 2,
            },
          });
          this.planeEntities.set(layer.depth_m, entity);
        } catch (err) {
          console.warn('Depth plane addition notice:', err);
        }
      }
    });
  }

  /**
   * Renders 3D vertical descent/ascent water column tracks for active Argo floats
   */
  public updateVerticalColumnProfiles(
    floats: Array<{ lat: number; lon: number; depth_current: number; name: string }>
  ) {
    if (!this.viewer || this.viewer.isDestroyed() || !this.viewer.entities) return;

    const entities = this.viewer.entities;

    // Clear old trajectory lines
    this.trajectoryEntities.forEach((ent) => {
      try {
        entities.remove(ent);
      } catch {
        // safe remove
      }
    });
    this.trajectoryEntities = [];

    floats.forEach((f) => {
      try {
        const surfacePos = Cesium.Cartesian3.fromDegrees(f.lon, f.lat, 0);
        const deepPos = Cesium.Cartesian3.fromDegrees(f.lon, f.lat, -f.depth_current * 25.0);

        const lineEntity = entities.add({
          name: `Profile Column: ${f.name}`,
          polyline: {
            positions: [surfacePos, deepPos],
            width: 3,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.25,
              color: Cesium.Color.fromCssColorString('#00f2fe'),
            }),
          },
        });
        this.trajectoryEntities.push(lineEntity);

        // Deep marker point
        const pointEntity = entities.add({
          position: deepPos,
          point: {
            pixelSize: 8,
            color: Cesium.Color.fromCssColorString('#ec4899'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          },
        });
        this.trajectoryEntities.push(pointEntity);
      } catch (err) {
        console.warn('Vertical column addition notice:', err);
      }
    });
  }

  public destroy() {
    if (this.viewer && !this.viewer.isDestroyed() && this.viewer.entities) {
      const entities = this.viewer.entities;
      this.planeEntities.forEach((ent) => {
        try {
          entities.remove(ent);
        } catch {
          // safe remove
        }
      });
      this.trajectoryEntities.forEach((ent) => {
        try {
          entities.remove(ent);
        } catch {
          // safe remove
        }
      });
    }
    this.planeEntities.clear();
    this.trajectoryEntities = [];
  }
}
