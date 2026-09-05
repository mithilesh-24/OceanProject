import * as Cesium from 'cesium';
import { DepthLayerConfig } from '../../services/apiClient';

export class DepthLayerVisualizationManager {
  private viewer: Cesium.Viewer;
  private planeEntities: Map<number, Cesium.Entity> = new Map();
  private trajectoryEntities: Cesium.Entity[] = [];

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  /**
   * Updates 3D Subsurface Depth Planes across the Indian Ocean basin (45°E-100°E, 10°S-25°N)
   */
  public updateDepthPlanes(
    layers: DepthLayerConfig[],
    visibleDepths: Set<number>,
    opacity: number
  ) {
    // Clear old planes that are no longer present or visible
    this.planeEntities.forEach((entity, depth) => {
      if (!visibleDepths.has(depth)) {
        this.viewer.entities.remove(entity);
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
        const entity = this.viewer.entities.add({
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
          }
        });
        this.planeEntities.set(layer.depth_m, entity);
      }
    });
  }

  /**
   * Renders 3D vertical descent/ascent water column tracks for active Argo floats
   */
  public updateVerticalColumnProfiles(
    floats: Array<{ lat: number; lon: number; depth_current: number; name: string }>
  ) {
    // Clear old trajectory lines
    this.trajectoryEntities.forEach((ent) => this.viewer.entities.remove(ent));
    this.trajectoryEntities = [];

    floats.forEach((f) => {
      const surfacePos = Cesium.Cartesian3.fromDegrees(f.lon, f.lat, 0);
      const deepPos = Cesium.Cartesian3.fromDegrees(f.lon, f.lat, -f.depth_current * 25.0);

      const lineEntity = this.viewer.entities.add({
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
      const pointEntity = this.viewer.entities.add({
        position: deepPos,
        point: {
          pixelSize: 8,
          color: Cesium.Color.fromCssColorString('#ec4899'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
        },
      });
      this.trajectoryEntities.push(pointEntity);
    });
  }

  public destroy() {
    this.planeEntities.forEach((ent) => this.viewer.entities.remove(ent));
    this.planeEntities.clear();
    this.trajectoryEntities.forEach((ent) => this.viewer.entities.remove(ent));
    this.trajectoryEntities = [];
  }
}
