import * as Cesium from 'cesium';
import { CONTINENTS_AND_OCEANS, ALL_COUNTRIES, ALL_STATES, ALL_PLACES, NEItem } from '../../data/naturalEarthIndex';

/**
 * GeographicLabelsManager
 * 
 * Renders dynamic, lightweight GIS geographic labels using Cesium WebGL LabelCollection.
 * Labels are strictly synchronized with the camera:
 * 1. 3D Horizon Occlusion: Backside-of-Earth labels are filtered out instantly.
 * 2. Frustum / View Bounding Box: Off-screen labels are omitted.
 * 3. Altitude-based LOD: Clean label hierarchy (Continents -> Countries -> States -> Cities).
 * 4. Professional GIS Styling: Modern sans-serif, clean text outline, NO dark background boxes.
 */
export class GeographicLabelsManager {
  private viewer: Cesium.Viewer;
  private labelCollection: Cesium.LabelCollection;
  private isEnabled: boolean = true;
  private removeCameraListener: (() => void) | null = null;
  private updateScheduled: boolean = false;
  private scratchVec = new Cesium.Cartesian3();
  private scratchVec2 = new Cesium.Cartesian3();

  private isCameraMoving = false;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.labelCollection = new Cesium.LabelCollection({
      scene: viewer.scene,
    });
    this.viewer.scene.primitives.add(this.labelCollection);
    this.updateLabels();
  }

  public onCameraMoveStart() {
    this.isCameraMoving = true;
  }

  public onCameraMoveEnd() {
    this.isCameraMoving = false;
    this.updateLabels();
  }


  public updateLabels() {
    if (!this.viewer || this.viewer.isDestroyed() || !this.isEnabled) {
      this.labelCollection.show = false;
      return;
    }

    this.labelCollection.show = true;
    const camera = this.viewer.camera;
    const carto = camera.positionCartographic;
    if (!carto) return;

    const alt = carto.height;
    const cameraPos = camera.positionWC;
    const cameraDir = camera.direction;
    const ellipsoid = this.viewer.scene.globe.ellipsoid;

    // Get current camera view rectangle (geographic bounding box)
    let cameraRect: Cesium.Rectangle | undefined = undefined;
    try {
      cameraRect = camera.computeViewRectangle(ellipsoid);
    } catch {
      cameraRect = undefined;
    }

    // Helper: Exact 3D Horizon & Frustum Visibility Filter
    const isItemVisible = (lat: number, lon: number): boolean => {
      const cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, 100);
      const surfaceNormal = Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(cartesian);
      
      // 1. 3D Horizon Check: Dot product of surface normal and vector to camera.
      // If dot product <= 0, point is on the back side of Earth facing away from camera!
      Cesium.Cartesian3.subtract(cameraPos, cartesian, this.scratchVec);
      const isFrontSide = Cesium.Cartesian3.dot(surfaceNormal, this.scratchVec) > 0;
      if (!isFrontSide) return false;

      // 2. Frustum / View Bounding Box Check
      if (cameraRect) {
        const latRad = Cesium.Math.toRadians(lat);
        const lonRad = Cesium.Math.toRadians(lon);

        // Add 5% padding around view rectangle edge to avoid pop-in
        const latPad = (cameraRect.north - cameraRect.south) * 0.05;
        const south = cameraRect.south - latPad;
        const north = cameraRect.north + latPad;

        if (latRad < south || latRad > north) return false;

        let west = cameraRect.west;
        let east = cameraRect.east;
        if (west <= east) {
          if (lonRad < west || lonRad > east) return false;
        } else {
          // Crosses International Date Line
          if (lonRad < west && lonRad > east) return false;
        }
      } else {
        // Fallback for tilted horizon camera angles: Check angle with camera direction vector
        Cesium.Cartesian3.normalize(this.scratchVec, this.scratchVec2);
        const dotCamDir = Cesium.Cartesian3.dot(cameraDir, this.scratchVec2);
        if (dotCamDir < -0.3) return false; // Behind camera lens
      }

      return true;
    };

    // Purge previous frame labels
    this.labelCollection.removeAll();

    const itemsToRender: Array<{ item: NEItem; tier: string }> = [];

    // ── TIER 1: World View (> 9,000,000 m): Continents + Oceans only ──
    if (alt > 9000000) {
      CONTINENTS_AND_OCEANS.forEach(i => {
        if (isItemVisible(i.lat, i.lon)) {
          itemsToRender.push({ item: i, tier: i.category });
        }
      });
    }
    // ── TIER 2: Regional View (3,500,000 - 9,000,000 m): Continents + Oceans + Major Countries ──
    else if (alt > 3500000) {
      CONTINENTS_AND_OCEANS.forEach(i => {
        if (isItemVisible(i.lat, i.lon)) {
          itemsToRender.push({ item: i, tier: i.category });
        }
      });
      ALL_COUNTRIES
        .filter(c => (c.pop || 0) > 25000000 && isItemVisible(c.lat, c.lon))
        .slice(0, 30)
        .forEach(c => itemsToRender.push({ item: c, tier: 'country' }));
    }
    // ── TIER 3: Country View (800,000 - 3,500,000 m): Oceans + All Visible Countries + Capital Cities ──
    else if (alt > 800000) {
      CONTINENTS_AND_OCEANS
        .filter(i => (i.category === 'ocean' || i.category === 'sea') && isItemVisible(i.lat, i.lon))
        .forEach(i => itemsToRender.push({ item: i, tier: i.category }));
      ALL_COUNTRIES
        .filter(c => isItemVisible(c.lat, c.lon))
        .forEach(c => itemsToRender.push({ item: c, tier: 'country' }));
      ALL_PLACES
        .filter(p => ((p.pop || 0) > 2000000 || (p.rank || 10) <= 3) && isItemVisible(p.lat, p.lon))
        .sort((a, b) => (b.pop || 0) - (a.pop || 0))
        .slice(0, 40)
        .forEach(p => itemsToRender.push({ item: p, tier: 'city' }));
    }
    // ── TIER 4: State / Province View (250,000 - 800,000 m): Countries + States + Cities ──
    else if (alt > 250000) {
      ALL_COUNTRIES
        .filter(c => isItemVisible(c.lat, c.lon))
        .forEach(c => itemsToRender.push({ item: c, tier: 'country' }));
      ALL_STATES
        .filter(s => isItemVisible(s.lat, s.lon))
        .slice(0, 50)
        .forEach(s => itemsToRender.push({ item: s, tier: 'state' }));
      ALL_PLACES
        .filter(p => ((p.pop || 0) > 400000 || (p.rank || 10) <= 5) && isItemVisible(p.lat, p.lon))
        .sort((a, b) => (b.pop || 0) - (a.pop || 0))
        .slice(0, 60)
        .forEach(p => itemsToRender.push({ item: p, tier: 'city' }));
    }
    // ── TIER 5: Local Detailed View (< 250,000 m): States + All Cities / Places ──
    else {
      ALL_STATES
        .filter(s => isItemVisible(s.lat, s.lon))
        .forEach(s => itemsToRender.push({ item: s, tier: 'state' }));
      ALL_PLACES
        .filter(p => isItemVisible(p.lat, p.lon))
        .sort((a, b) => (b.pop || 0) - (a.pop || 0))
        .slice(0, 100)
        .forEach(p => itemsToRender.push({ item: p, tier: (p.pop || 0) > 150000 ? 'city' : 'place' }));
    }

    // Render WebGL Labels with modern lightweight GIS styling
    itemsToRender.forEach(({ item, tier }) => {
      const style = this.getLabelStyle(tier);

      this.labelCollection.add({
        position: Cesium.Cartesian3.fromDegrees(item.lon, item.lat, 10),
        text: style.text(item.name),
        font: style.font,
        fillColor: style.fillColor,
        outlineColor: style.outlineColor,
        outlineWidth: style.outlineWidth,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        showBackground: false,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        heightReference: Cesium.HeightReference.NONE,
        scaleByDistance: style.scaleByDistance,
        translucencyByDistance: style.translucencyByDistance,
      });
    });
  }

  private getLabelStyle(tier: string) {
    const mainFont = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    
    switch (tier) {
      case 'continent':
        return {
          font: `600 14px ${mainFont}`,
          fillColor: Cesium.Color.fromCssColorString('#f8fafc'),
          outlineColor: Cesium.Color.fromCssColorString('rgba(0, 0, 0, 0.90)'),
          outlineWidth: 2,
          text: (n: string) => n.toUpperCase(),
          scaleByDistance: new Cesium.NearFarScalar(3e6, 1.1, 2e7, 0.75),
          translucencyByDistance: new Cesium.NearFarScalar(1e6, 0.2, 5e6, 1.0),
        };
      case 'ocean':
        return {
          font: `italic 500 13px ${mainFont}`,
          fillColor: Cesium.Color.fromCssColorString('#38bdf8'),
          outlineColor: Cesium.Color.fromCssColorString('rgba(0, 15, 30, 0.85)'),
          outlineWidth: 2,
          text: (n: string) => n,
          scaleByDistance: new Cesium.NearFarScalar(2e6, 1.0, 2e7, 0.7),
          translucencyByDistance: new Cesium.NearFarScalar(5e5, 0.2, 3e6, 1.0),
        };
      case 'sea':
        return {
          font: `italic 500 12px ${mainFont}`,
          fillColor: Cesium.Color.fromCssColorString('#7dd3fc'),
          outlineColor: Cesium.Color.fromCssColorString('rgba(0, 15, 30, 0.85)'),
          outlineWidth: 2,
          text: (n: string) => n,
          scaleByDistance: new Cesium.NearFarScalar(1e6, 1.0, 1.5e7, 0.6),
          translucencyByDistance: new Cesium.NearFarScalar(3e5, 0.2, 2e6, 1.0),
        };
      case 'country':
        return {
          font: `500 12px ${mainFont}`,
          fillColor: Cesium.Color.fromCssColorString('#f8fafc'),
          outlineColor: Cesium.Color.fromCssColorString('rgba(0, 0, 0, 0.85)'),
          outlineWidth: 2,
          text: (n: string) => n,
          scaleByDistance: new Cesium.NearFarScalar(5e5, 1.05, 8e6, 0.6),
          translucencyByDistance: new Cesium.NearFarScalar(1e5, 0.2, 5e5, 1.0),
        };
      case 'state':
        return {
          font: `500 11px ${mainFont}`,
          fillColor: Cesium.Color.fromCssColorString('#e2e8f0'),
          outlineColor: Cesium.Color.fromCssColorString('rgba(0, 0, 0, 0.85)'),
          outlineWidth: 2,
          text: (n: string) => n,
          scaleByDistance: new Cesium.NearFarScalar(1e5, 1.0, 3e6, 0.5),
          translucencyByDistance: new Cesium.NearFarScalar(5e4, 0.2, 2e5, 1.0),
        };
      case 'city':
        return {
          font: `500 11px ${mainFont}`,
          fillColor: Cesium.Color.fromCssColorString('#e2e8f0'),
          outlineColor: Cesium.Color.fromCssColorString('rgba(0, 0, 0, 0.85)'),
          outlineWidth: 2,
          text: (n: string) => n,
          scaleByDistance: new Cesium.NearFarScalar(5e4, 1.0, 2e6, 0.5),
          translucencyByDistance: new Cesium.NearFarScalar(2e4, 0.2, 1e5, 1.0),
        };
      default: // place / town
        return {
          font: `400 10px ${mainFont}`,
          fillColor: Cesium.Color.fromCssColorString('#94a3b8'),
          outlineColor: Cesium.Color.fromCssColorString('rgba(0, 0, 0, 0.85)'),
          outlineWidth: 2,
          text: (n: string) => n,
          scaleByDistance: new Cesium.NearFarScalar(2e4, 1.0, 5e5, 0.4),
          translucencyByDistance: new Cesium.NearFarScalar(1e4, 0.2, 5e4, 1.0),
        };
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    this.labelCollection.show = enabled;
    if (enabled) {
      this.updateLabels();
    }
  }

  public destroy() {
    if (this.removeCameraListener) {
      this.removeCameraListener();
    }
    if (this.viewer && !this.viewer.isDestroyed()) {
      this.viewer.scene.primitives.remove(this.labelCollection);
    }
  }
}
