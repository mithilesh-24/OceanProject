import * as Cesium from 'cesium';
import { ArgoColorVariable, ArgoObservation } from '../../types/argo';

interface ArgoFloatRenderItem {
  billboard: Cesium.Billboard;
  polyline: Cesium.Polyline;
  observation: ArgoObservation;
  cartesian: Cesium.Cartesian3;
  surfaceNormal: Cesium.Cartesian3;
}

/**
 * Creates high-DPI SVG Data URI of a 3D Oceanographic Argo Profiling Float
 */
function create3DArgoFloatSvg(accentColorHex: string, isSelected: boolean): string {
  const highlightRing = isSelected
    ? `<circle cx="24" cy="46" r="22" fill="none" stroke="#22d3ee" stroke-width="2.5" stroke-dasharray="4 2"/>
       <circle cx="24" cy="46" r="26" fill="none" stroke="#67e8f9" stroke-width="1.5" opacity="0.8"/>`
    : '';

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="92" viewBox="0 0 48 92">
    <defs>
      <!-- Hull 3D Gradient -->
      <linearGradient id="argoHullGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#d97706"/>
        <stop offset="30%" stop-color="#fbbf24"/>
        <stop offset="70%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#92400e"/>
      </linearGradient>
      <!-- Variable Accent Ring Gradient -->
      <linearGradient id="argoAccentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${accentColorHex}"/>
        <stop offset="100%" stop-color="#ffffff"/>
      </linearGradient>
      <!-- Drop Shadow -->
      <filter id="argoShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.75"/>
      </filter>
    </defs>
    <g filter="url(#argoShadow)">
      ${highlightRing}
      
      <!-- Top Antenna Mast -->
      <line x1="24" y1="4" x2="24" y2="24" stroke="#f1f5f9" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="24" cy="4" r="3.5" fill="#38bdf8" stroke="#ffffff" stroke-width="1"/>

      <!-- Top End Cap -->
      <rect x="18" y="24" width="12" height="5" rx="1.5" fill="#1e293b" stroke="#0f172a" stroke-width="0.8"/>
      
      <!-- Main Cylindrical Float Body -->
      <rect x="15" y="29" width="18" height="36" rx="3" fill="url(#argoHullGrad)" stroke="#78350f" stroke-width="1.2"/>
      
      <!-- Variable Sensor Collar Ring -->
      <rect x="14" y="42" width="20" height="9" rx="2" fill="url(#argoAccentGrad)" stroke="#0f172a" stroke-width="1"/>
      
      <!-- Bottom Collar -->
      <rect x="17" y="65" width="14" height="4" rx="1" fill="#1e293b"/>
      
      <!-- Bottom Buoyancy Bladder -->
      <path d="M19,69 Q24,78 29,69 Z" fill="#0284c7" stroke="#0369a1" stroke-width="1"/>
      
      <!-- Surface Ripple Ring -->
      <ellipse cx="24" cy="52" rx="21" ry="4.5" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.85"/>
    </g>
  </svg>
  `;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

/**
 * ArgoVisualizationManager
 * Manages 3D Argo float buoys and depth profiles in Cesium WebGL with camera-based geographic visibility and proximity picking.
 */
export class ArgoVisualizationManager {
  private viewer: Cesium.Viewer;
  private billboardCollection: Cesium.BillboardCollection;
  private polylineCollection: Cesium.PolylineCollection;
  private observations: ArgoObservation[] = [];
  private floatItemMap: Map<string, ArgoFloatRenderItem> = new Map();
  private billboardToObsMap: Map<Cesium.Billboard, ArgoObservation> = new Map();
  private isEnabled: boolean = true;
  private currentColorVariable: ArgoColorVariable = 'temperature';
  private selectedObservationId: string | null = null;
  private scratchVec = new Cesium.Cartesian3();

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.billboardCollection = new Cesium.BillboardCollection();
    this.polylineCollection = new Cesium.PolylineCollection();
    
    this.viewer.scene.primitives.add(this.polylineCollection);
    this.viewer.scene.primitives.add(this.billboardCollection);
  }

  public setObservations(obs: ArgoObservation[], colorVar: ArgoColorVariable = 'temperature', selectedId: string | null = null) {
    this.observations = obs;
    this.currentColorVariable = colorVar;
    this.selectedObservationId = selectedId;
    this.renderFloats();
  }

  public setSelectedFloat(selectedId: string | null) {
    this.selectedObservationId = selectedId;
    this.renderFloats();
  }

  private renderFloats() {
    this.billboardCollection.removeAll();
    this.polylineCollection.removeAll();
    this.floatItemMap.clear();
    this.billboardToObsMap.clear();

    if (!this.isEnabled || this.observations.length === 0) {
      return;
    }

    this.observations.forEach((obs) => {
      const isSelected = obs.id === this.selectedObservationId;
      const colorHex = this.getHexColorForObservation(obs, this.currentColorVariable);
      const svgUri = create3DArgoFloatSvg(colorHex, isSelected);

      const surfacePosition = Cesium.Cartesian3.fromDegrees(obs.longitude, obs.latitude, 10);
      const depthPosition = Cesium.Cartesian3.fromDegrees(obs.longitude, obs.latitude, -Math.min(500, obs.depth));
      const surfaceNormal = Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(surfacePosition);

      // 1. Add 3D Vertical Subsurface Depth Profile Line
      const polyline = this.polylineCollection.add({
        positions: [surfacePosition, depthPosition],
        width: isSelected ? 3 : 1.5,
        material: Cesium.Material.fromType('Color', {
          color: isSelected
            ? Cesium.Color.fromCssColorString('#22d3ee')
            : Cesium.Color.fromCssColorString(colorHex).withAlpha(0.7),
        }),
      });

      // 2. Add 3D Argo Float Buoy Billboard
      const scale = isSelected ? 1.25 : 1.0;
      const billboard = this.billboardCollection.add({
        position: surfacePosition,
        image: svgUri,
        scale,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        scaleByDistance: new Cesium.NearFarScalar(500, 1.2, 10000000, 0.45),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });

      const item: ArgoFloatRenderItem = {
        billboard,
        polyline,
        observation: obs,
        cartesian: surfacePosition,
        surfaceNormal,
      };

      this.floatItemMap.set(obs.id, item);
      this.billboardToObsMap.set(billboard, obs);
    });

    // Immediately calculate camera geographic & horizon visibility for newly rendered items
    this.updateCameraVisibility();
  }

  /**
   * Recalculates Geographic & Horizon Visibility based on current Cesium camera view.
   * Hides floats outside view or on the back side of Earth, shows floats in current view.
   */
  public updateCameraVisibility(): { hiddenSelectedId: string | null } {
    if (!this.isEnabled || !this.viewer || this.viewer.isDestroyed() || this.floatItemMap.size === 0) {
      return { hiddenSelectedId: null };
    }

    const camera = this.viewer.camera;
    const scene = this.viewer.scene;
    const ellipsoid = scene.globe.ellipsoid;
    const cameraPos = camera.positionWC;

    // View rectangle: geographic bounding box of visible Earth surface
    let viewRect: Cesium.Rectangle | undefined = undefined;
    try {
      viewRect = camera.computeViewRectangle(ellipsoid);
    } catch {
      viewRect = undefined;
    }

    let hiddenSelectedId: string | null = null;

    this.floatItemMap.forEach((item) => {
      // 1. Horizon Occlusion Check: Vector from float position to camera dot product with surface normal
      // If dot product > 0, float is facing the camera. If <= 0, float is behind Earth curvature / horizon.
      Cesium.Cartesian3.subtract(cameraPos, item.cartesian, this.scratchVec);
      const isFrontSide = Cesium.Cartesian3.dot(item.surfaceNormal, this.scratchVec) > 0;

      if (!isFrontSide) {
        item.billboard.show = false;
        item.polyline.show = false;
        if (item.observation.id === this.selectedObservationId) {
          hiddenSelectedId = this.selectedObservationId;
        }
        return;
      }

      // 2. Frustum / View Rectangle Geographic Check
      let inFrustum = true;
      if (viewRect) {
        const latRad = Cesium.Math.toRadians(item.observation.latitude);
        const lonRad = Cesium.Math.toRadians(item.observation.longitude);

        const south = viewRect.south;
        const north = viewRect.north;
        let west = viewRect.west;
        let east = viewRect.east;

        // Check latitude bounds
        if (latRad < south || latRad > north) {
          inFrustum = false;
        } else {
          // Check longitude bounds (handling International Date Line wrapping)
          if (west <= east) {
            if (lonRad < west || lonRad > east) inFrustum = false;
          } else {
            if (lonRad < west && lonRad > east) inFrustum = false;
          }
        }
      }

      const show = isFrontSide && inFrustum;
      item.billboard.show = show;
      item.polyline.show = show;

      if (!show && item.observation.id === this.selectedObservationId) {
        hiddenSelectedId = this.selectedObservationId;
      }
    });

    return { hiddenSelectedId };
  }

  private getHexColorForObservation(obs: ArgoObservation, variable: ArgoColorVariable): string {
    if (variable === 'temperature') {
      const t = obs.temperature;
      if (t === null || isNaN(t)) return '#94a3b8';
      if (t < 12) return '#1e3a8a';
      if (t < 20) return '#06b6d4';
      if (t < 26) return '#10b981';
      if (t < 29) return '#f59e0b';
      return '#ef4444';
    } else if (variable === 'salinity') {
      const s = obs.salinity;
      if (s === null || isNaN(s)) return '#94a3b8';
      if (s < 33) return '#a5f3fc';
      if (s < 34.5) return '#3b82f6';
      if (s < 36) return '#6366f1';
      return '#a855f7';
    } else {
      const d = obs.pressure;
      if (d < 50) return '#38bdf8';
      if (d < 200) return '#34d399';
      if (d < 500) return '#818cf8';
      return '#6b21a8';
    }
  }

  /**
   * Touch & Mouse Proximity Pick Handler
   * Allows touch selection within 30px screen radius on currently visible floats!
   */
  public pickArgoObservation(pickedPrimitive: any, screenPos?: Cesium.Cartesian2): ArgoObservation | null {
    // 1. Direct WebGL primitive pick check
    if (pickedPrimitive) {
      const directMatch = this.billboardToObsMap.get(pickedPrimitive);
      if (directMatch) {
        // Verify billboard is currently visible
        const item = this.floatItemMap.get(directMatch.id);
        if (item && item.billboard.show) return directMatch;
      }
    }

    // 2. Proximity-based screen coordinate search for visible floats
    if (screenPos && this.viewer && !this.viewer.isDestroyed()) {
      let closestObs: ArgoObservation | null = null;
      let minDistance = 32; // 32px touch hit target radius

      this.floatItemMap.forEach((item) => {
        if (!item.billboard.show) return; // Skip hidden floats!

        const windowPos = Cesium.SceneTransforms.worldToWindowCoordinates(
          this.viewer.scene,
          item.cartesian
        );
        if (windowPos) {
          const dist = Math.hypot(windowPos.x - screenPos.x, windowPos.y - screenPos.y);
          if (dist < minDistance) {
            minDistance = dist;
            closestObs = item.observation;
          }
        }
      });

      if (closestObs) return closestObs;
    }

    return null;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    this.billboardCollection.show = enabled;
    this.polylineCollection.show = enabled;
    if (!enabled) {
      this.clear();
    } else {
      this.updateCameraVisibility();
    }
  }

  public clear() {
    this.billboardCollection.removeAll();
    this.polylineCollection.removeAll();
    this.floatItemMap.clear();
    this.billboardToObsMap.clear();
    this.observations = [];
    this.selectedObservationId = null;
  }

  public destroy() {
    this.clear();
    if (this.viewer && !this.viewer.isDestroyed()) {
      this.viewer.scene.primitives.remove(this.billboardCollection);
      this.viewer.scene.primitives.remove(this.polylineCollection);
    }
  }
}
