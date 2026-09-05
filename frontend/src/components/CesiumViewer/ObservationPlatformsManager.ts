import * as Cesium from 'cesium';

export interface PlatformItem {
  id: string;
  type: 'argo' | 'glider' | 'buoy' | 'ctd' | 'adcp' | 'residual';
  name: string;
  latitude: number;
  longitude: number;
  depth?: number;
  temperature?: number;
  salinity?: number;
  velocity?: number;
  battery?: number;
  status?: string;
  lastDate?: string;
  raw?: any;
  // For residual points
  residual?: number;
  modelVal?: number;
  obsVal?: number;
}

export class ObservationPlatformsManager {
  private viewer: Cesium.Viewer;
  private billboardCollection: Cesium.BillboardCollection;
  private polylineCollection: Cesium.PolylineCollection;
  private platforms: PlatformItem[] = [];
  private itemMap: Map<string, { billboard: Cesium.Billboard; polyline?: Cesium.Polyline; item: PlatformItem }> = new Map();
  private isEnabled: boolean = true;
  private visibleTypes: Set<string> = new Set(['argo', 'glider', 'buoy', 'ctd', 'adcp', 'residual']);

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.billboardCollection = new Cesium.BillboardCollection({ scene: this.viewer.scene });
    this.polylineCollection = new Cesium.PolylineCollection({ scene: this.viewer.scene });

    this.viewer.scene.primitives.add(this.polylineCollection);
    this.viewer.scene.primitives.add(this.billboardCollection);
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    this.billboardCollection.show = enabled;
    this.polylineCollection.show = enabled;
  }

  public setVisibleTypes(types: Set<string>) {
    this.visibleTypes = types;
    this.renderPlatforms();
  }

  public setPlatforms(platforms: PlatformItem[]) {
    this.platforms = platforms;
    this.renderPlatforms();
  }

  private getSvgForPlatform(item: PlatformItem): string {
    const isGlider = item.type === 'glider';
    const isBuoy = item.type === 'buoy';
    const isCtd = item.type === 'ctd';
    const isAdcp = item.type === 'adcp';
    const isResidual = item.type === 'residual';

    if (isGlider) {
      // Sleek autonomous glider icon (Teal & Yellow)
      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="14" fill="#0d9488" fill-opacity="0.85" stroke="#2dd4bf" stroke-width="2"/>
        <path d="M12,22 L18,10 L24,22 L18,19 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="1"/>
      </svg>`;
      return 'data:image/svg+xml;base64,' + btoa(svg);
    } else if (isBuoy) {
      // Moored Buoy icon (Amber / Gold)
      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="14" fill="#d97706" fill-opacity="0.85" stroke="#fbbf24" stroke-width="2"/>
        <circle cx="18" cy="14" r="4" fill="#ffffff"/>
        <path d="M14,24 L22,24 M18,18 L18,24" stroke="#ffffff" stroke-width="2"/>
      </svg>`;
      return 'data:image/svg+xml;base64,' + btoa(svg);
    } else if (isCtd) {
      // CTD Cast icon (Purple / Indigo)
      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
        <rect x="6" y="6" width="24" height="24" rx="6" fill="#6366f1" fill-opacity="0.85" stroke="#a5b4fc" stroke-width="2"/>
        <circle cx="18" cy="18" r="5" fill="#ffffff"/>
      </svg>`;
      return 'data:image/svg+xml;base64,' + btoa(svg);
    } else if (isAdcp) {
      // ADCP Current Mooring icon (Cyan / Blue)
      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
        <polygon points="18,4 32,28 4,28" fill="#0284c7" fill-opacity="0.85" stroke="#38bdf8" stroke-width="2"/>
        <circle cx="18" cy="20" r="3" fill="#ffffff"/>
      </svg>`;
      return 'data:image/svg+xml;base64,' + btoa(svg);
    } else if (isResidual) {
      // Model vs Obs Residual Point (Color depends on sign)
      const diff = item.residual ?? 0;
      const color = diff > 0.2 ? '#f43f5e' : (diff < -0.2 ? '#38bdf8' : '#10b981');
      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="10" fill="${color}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="16" cy="16" r="14" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="3 2"/>
      </svg>`;
      return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    // Default marker
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="10" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
    </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }

  private renderPlatforms() {
    this.billboardCollection.removeAll();
    this.polylineCollection.removeAll();
    this.itemMap.clear();

    this.platforms.forEach((p) => {
      if (!this.visibleTypes.has(p.type)) return;

      const cartesian = Cesium.Cartesian3.fromDegrees(p.longitude, p.latitude, 100);
      const svgUri = this.getSvgForPlatform(p);

      const billboard = this.billboardCollection.add({
        position: cartesian,
        image: svgUri,
        scale: 0.85,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 15000000.0),
      });

      // If glider has dive trajectory, render underwater sawtooth path
      let polyline: Cesium.Polyline | undefined;
      if (p.type === 'glider' && p.raw?.dive_depth) {
        const positions = [
          Cesium.Cartesian3.fromDegrees(p.longitude - 0.2, p.latitude - 0.2, 0),
          Cesium.Cartesian3.fromDegrees(p.longitude - 0.1, p.latitude - 0.1, -p.raw.dive_depth * 15),
          cartesian,
        ];
        polyline = this.polylineCollection.add({
          positions,
          width: 2,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString('#2dd4bf'),
            dashLength: 12.0,
          }),
        });
      }

      this.itemMap.set(p.id, { billboard, polyline, item: p });
    });
  }

  /**
   * Pick an observation platform near screen coordinate
   */
  public pickPlatform(screenPos: Cesium.Cartesian2): PlatformItem | null {
    const picked = this.viewer.scene.pick(screenPos);
    if (picked && picked.primitive) {
      for (const [id, val] of this.itemMap.entries()) {
        if (val.billboard === picked.primitive) {
          return val.item;
        }
      }
    }
    return null;
  }

  public destroy() {
    this.billboardCollection.removeAll();
    this.polylineCollection.removeAll();
    if (!this.viewer.isDestroyed()) {
      try {
        this.viewer.scene.primitives.remove(this.billboardCollection);
        this.viewer.scene.primitives.remove(this.polylineCollection);
      } catch {
        // ignore
      }
    }
  }
}
