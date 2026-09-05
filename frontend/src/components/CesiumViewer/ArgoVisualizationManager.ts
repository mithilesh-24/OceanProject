import * as Cesium from 'cesium';
import { ArgoColorVariable, ArgoObservation } from '../../types/argo';

export interface ArgoCluster {
  id: string;
  centroidLat: number;
  centroidLon: number;
  count: number;
  observations: ArgoObservation[];
  cartesian: Cesium.Cartesian3;
  surfaceNormal: Cesium.Cartesian3;
  billboard: Cesium.Billboard;
}

interface ArgoFloatRenderItem {
  billboard: Cesium.Billboard;
  polyline: Cesium.Polyline;
  observation: ArgoObservation;
  cartesian: Cesium.Cartesian3;
  surfaceNormal: Cesium.Cartesian3;
}

export type ArgoPickResult =
  | { type: 'float'; observation: ArgoObservation }
  | { type: 'cluster'; cluster: ArgoCluster }
  | null;

// Altitude threshold in meters for unpacking clusters into individual 3D floats
const CLUSTER_ALTITUDE_THRESHOLD = 4500000; // 4,500 km

/**
 * Creates high-DPI SVG Data URI of Euro-Argo style Cluster Badge
 */
function createClusterBadgeSvg(count: number, isSelected: boolean): string {
  const size = count >= 1000 ? 56 : count >= 100 ? 50 : count >= 10 ? 44 : 38;
  const half = size / 2;
  const outerR = half - 2;
  const innerR = half - 7.5;
  const fontSize = count >= 1000 ? 12 : count >= 100 ? 13 : 14;

  const highlightRing = isSelected
    ? `<circle cx="${half}" cy="${half}" r="${outerR + 2}" fill="none" stroke="#22d3ee" stroke-width="2.5" stroke-dasharray="4 2"/>`
    : '';

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <filter id="clusterShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
      <linearGradient id="clusterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef9c3"/>
        <stop offset="50%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#fde047"/>
      </linearGradient>
    </defs>
    <g filter="url(#clusterShadow)">
      ${highlightRing}
      
      <!-- Outer Translucent Glow Ring (Euro-Argo Style) -->
      <circle cx="${half}" cy="${half}" r="${outerR}" fill="#eab308" fill-opacity="0.45" stroke="#ca8a04" stroke-width="1.2"/>
      
      <!-- Inner High-Contrast Badge Core -->
      <circle cx="${half}" cy="${half}" r="${innerR}" fill="url(#clusterGrad)" stroke="#854d0e" stroke-width="1.6"/>
      
      <!-- Cluster Count Text -->
      <text x="${half}" y="${half + 1}" text-anchor="middle" dominant-baseline="central"
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            font-size="${fontSize}" font-weight="800" fill="#1e293b" letter-spacing="-0.3px">
        ${count}
      </text>
    </g>
  </svg>
  `;
  try {
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  } catch {
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }
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
  try {
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  } catch {
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }
}

/**
 * ArgoVisualizationManager
 * Manages 3D Argo float buoys and Euro-Argo style dynamic clusters in Cesium WebGL
 * with zoom-level dependent LOD transitions and proximity picking.
 */
export class ArgoVisualizationManager {
  private viewer: Cesium.Viewer;
  private billboardCollection: Cesium.BillboardCollection;
  private polylineCollection: Cesium.PolylineCollection;
  private observations: ArgoObservation[] = [];
  private floatItemMap: Map<string, ArgoFloatRenderItem> = new Map();
  private billboardToObsMap: Map<Cesium.Billboard, ArgoObservation> = new Map();

  private clusterItemMap: Map<string, ArgoCluster> = new Map();
  private billboardToClusterMap: Map<Cesium.Billboard, ArgoCluster> = new Map();

  private isEnabled: boolean = true;
  private currentColorVariable: ArgoColorVariable = 'temperature';
  private selectedObservationId: string | null = null;
  private currentMode: 'clusters' | 'individual' = 'clusters';
  private lastRenderedGridStep: number = 0;
  private scratchVec = new Cesium.Cartesian3();

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.billboardCollection = new Cesium.BillboardCollection({ scene: this.viewer.scene });
    this.polylineCollection = new Cesium.PolylineCollection({ scene: this.viewer.scene });
    
    this.viewer.scene.primitives.add(this.polylineCollection);
    this.viewer.scene.primitives.add(this.billboardCollection);
  }

  public setObservations(obs: ArgoObservation[], colorVar: ArgoColorVariable = 'temperature', selectedId: string | null = null) {
    this.observations = obs;
    this.currentColorVariable = colorVar;
    this.selectedObservationId = selectedId;
    this.renderByCurrentAltitude();
  }

  public setSelectedFloat(selectedId: string | null) {
    this.selectedObservationId = selectedId;
    this.renderByCurrentAltitude();
  }

  private isCameraMoving = false;

  public onCameraMoveStart() {
    this.isCameraMoving = true;
  }

  public onCameraMoveEnd() {
    this.isCameraMoving = false;
    if (this.viewer && !this.viewer.isDestroyed()) {
      const alt = this.viewer.camera.positionCartographic?.height || 15000000;
      this.updateCameraAltitude(alt);
      this.updateCameraVisibility();
    }
  }

  /**
   * Called on camera altitude change to trigger dynamic clustering / unpacking
   */
  public updateCameraAltitude(altitude: number) {
    if (this.isCameraMoving) return;
    const targetMode = altitude > CLUSTER_ALTITUDE_THRESHOLD ? 'clusters' : 'individual';
    const gridStep = altitude > 9000000 ? 4.5 : 2.5;

    if (targetMode !== this.currentMode || (targetMode === 'clusters' && Math.abs(gridStep - this.lastRenderedGridStep) > 0.5)) {
      this.renderByCurrentAltitude();
    }
  }


  private renderByCurrentAltitude() {
    if (!this.viewer || this.viewer.isDestroyed()) return;
    const altitude = this.viewer.camera.positionCartographic
      ? this.viewer.camera.positionCartographic.height
      : 15000000;

    if (altitude > CLUSTER_ALTITUDE_THRESHOLD) {
      this.currentMode = 'clusters';
      const gridStep = altitude > 9000000 ? 4.5 : 2.5;
      this.renderClusters(gridStep);
    } else {
      this.currentMode = 'individual';
      this.renderIndividualFloats();
    }
  }

  /**
   * High-Altitude / Zoomed-Out View: Spatial Grid Clustering (Euro-Argo Style)
   */
  private renderClusters(gridStep: number) {
    this.lastRenderedGridStep = gridStep;
    this.billboardCollection.removeAll();
    this.polylineCollection.removeAll();
    this.floatItemMap.clear();
    this.billboardToObsMap.clear();
    this.clusterItemMap.clear();
    this.billboardToClusterMap.clear();

    if (!this.isEnabled || this.observations.length === 0) {
      return;
    }

    // 1. Spatial Grid Bucketing
    const grid = new Map<string, ArgoObservation[]>();
    this.observations.forEach((obs) => {
      const latBucket = Math.floor(obs.latitude / gridStep);
      const lonBucket = Math.floor(obs.longitude / gridStep);
      const key = `${latBucket}_${lonBucket}`;
      let list = grid.get(key);
      if (!list) {
        list = [];
        grid.set(key, list);
      }
      list.push(obs);
    });

    // 2. Render each cluster as a high-DPI Euro-Argo style badge
    let clusterIdx = 0;
    grid.forEach((bucketObs) => {
      clusterIdx++;
      let sumLat = 0;
      let sumLon = 0;
      let hasSelected = false;

      bucketObs.forEach((o) => {
        sumLat += o.latitude;
        sumLon += o.longitude;
        if (o.id === this.selectedObservationId) {
          hasSelected = true;
        }
      });

      const count = bucketObs.length;
      const centroidLat = sumLat / count;
      const centroidLon = sumLon / count;

      const surfacePosition = Cesium.Cartesian3.fromDegrees(centroidLon, centroidLat, 15);
      const surfaceNormal = Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(surfacePosition);

      const clusterSvgUri = createClusterBadgeSvg(count, hasSelected);
      const clusterId = `cluster_${clusterIdx}`;

      const billboard = this.billboardCollection.add({
        position: surfacePosition,
        image: clusterSvgUri,
        scale: 1.0,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        scaleByDistance: new Cesium.NearFarScalar(1000000, 1.1, 20000000, 0.7),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });

      const cluster: ArgoCluster = {
        id: clusterId,
        centroidLat,
        centroidLon,
        count,
        observations: bucketObs,
        cartesian: surfacePosition,
        surfaceNormal,
        billboard,
      };

      this.clusterItemMap.set(clusterId, cluster);
      this.billboardToClusterMap.set(billboard, cluster);
    });

    this.updateCameraVisibility();
  }

  /**
   * Close-Up / Zoomed-In View: Individual 3D Argo Profiling Floats & Depth Profiles
   */
  private renderIndividualFloats() {
    this.billboardCollection.removeAll();
    this.polylineCollection.removeAll();
    this.floatItemMap.clear();
    this.billboardToObsMap.clear();
    this.clusterItemMap.clear();
    this.billboardToClusterMap.clear();

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

      // 1. 3D Vertical Subsurface Depth Profile Line
      const polyline = this.polylineCollection.add({
        positions: [surfacePosition, depthPosition],
        width: isSelected ? 3 : 1.5,
        material: Cesium.Material.fromType('Color', {
          color: isSelected
            ? Cesium.Color.fromCssColorString('#22d3ee')
            : Cesium.Color.fromCssColorString(colorHex).withAlpha(0.7),
        }),
      });

      // 2. 3D Argo Float Buoy Billboard
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

    this.updateCameraVisibility();
  }

  /**
   * Recalculates Geographic & Horizon Visibility based on current Cesium camera view.
   * Hides floats/clusters on the back side of Earth, shows active front side items.
   */
  public updateCameraVisibility(): { hiddenSelectedId: string | null } {
    if (!this.isEnabled || !this.viewer || this.viewer.isDestroyed()) {
      return { hiddenSelectedId: null };
    }

    const camera = this.viewer.camera;
    const cameraPos = camera.positionWC;
    let hiddenSelectedId: string | null = null;

    if (this.currentMode === 'clusters') {
      this.clusterItemMap.forEach((cluster) => {
        // Horizon occlusion check: dot product with surface normal
        Cesium.Cartesian3.subtract(cameraPos, cluster.cartesian, this.scratchVec);
        const isFrontSide = Cesium.Cartesian3.dot(cluster.surfaceNormal, this.scratchVec) > 0;
        cluster.billboard.show = isFrontSide;
      });
    } else {
      this.floatItemMap.forEach((item) => {
        Cesium.Cartesian3.subtract(cameraPos, item.cartesian, this.scratchVec);
        const isFrontSide = Cesium.Cartesian3.dot(item.surfaceNormal, this.scratchVec) > 0;

        item.billboard.show = isFrontSide;
        item.polyline.show = isFrontSide;

        if (!isFrontSide && item.observation.id === this.selectedObservationId) {
          hiddenSelectedId = this.selectedObservationId;
        }
      });
    }

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
   * Unified Pick Handler: Picks either an individual float or a cluster badge
   */
  public pick(pickedPrimitive: any, screenPos?: Cesium.Cartesian2): ArgoPickResult {
    if (!this.viewer || this.viewer.isDestroyed()) return null;

    if (this.currentMode === 'clusters') {
      // 1. Direct cluster billboard match
      if (pickedPrimitive) {
        const cluster = this.billboardToClusterMap.get(pickedPrimitive);
        if (cluster && cluster.billboard.show) {
          return { type: 'cluster', cluster };
        }
      }
      // 2. Proximity check for clusters
      if (screenPos) {
        let closestCluster: ArgoCluster | null = null;
        let minDistance = 32;
        this.clusterItemMap.forEach((cluster) => {
          if (!cluster.billboard.show) return;
          const windowPos = Cesium.SceneTransforms.worldToWindowCoordinates(
            this.viewer.scene,
            cluster.cartesian
          );
          if (windowPos) {
            const dist = Math.hypot(windowPos.x - screenPos.x, windowPos.y - screenPos.y);
            if (dist < minDistance) {
              minDistance = dist;
              closestCluster = cluster;
            }
          }
        });
        if (closestCluster) return { type: 'cluster', cluster: closestCluster };
      }
    } else {
      // 1. Direct float billboard match
      if (pickedPrimitive) {
        const directMatch = this.billboardToObsMap.get(pickedPrimitive);
        if (directMatch) {
          const item = this.floatItemMap.get(directMatch.id);
          if (item && item.billboard.show) {
            return { type: 'float', observation: directMatch };
          }
        }
      }
      // 2. Proximity check for individual floats
      if (screenPos) {
        let closestObs: ArgoObservation | null = null;
        let minDistance = 32;
        this.floatItemMap.forEach((item) => {
          if (!item.billboard.show) return;
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
        if (closestObs) return { type: 'float', observation: closestObs };
      }
    }

    return null;
  }

  /**
   * Backward-compatible helper for individual float picking
   */
  public pickArgoObservation(pickedPrimitive: any, screenPos?: Cesium.Cartesian2): ArgoObservation | null {
    const res = this.pick(pickedPrimitive, screenPos);
    return res && res.type === 'float' ? res.observation : null;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    this.billboardCollection.show = enabled;
    this.polylineCollection.show = enabled;
    if (!enabled) {
      this.clear();
    } else {
      this.renderByCurrentAltitude();
    }
  }

  public clear() {
    this.billboardCollection.removeAll();
    this.polylineCollection.removeAll();
    this.floatItemMap.clear();
    this.billboardToObsMap.clear();
    this.clusterItemMap.clear();
    this.billboardToClusterMap.clear();
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
