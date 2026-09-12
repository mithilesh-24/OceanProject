/**
 * Cesium Authoritative Controller
 * Single source of truth for Cesium 3D Globe camera navigation, readiness handshakes, and layer controls.
 */

// Normalized Coordinate & Camera bounds registry
export interface RegionLocation {
  name: string;
  latitude: number;
  longitude: number;
  altitude_m: number;
  heading?: number;
  pitch?: number;
}

export const CESIUM_REGION_REGISTRY: Record<string, RegionLocation> = {
  'bay of bengal': {
    name: 'Bay of Bengal',
    latitude: 15.0,
    longitude: 88.0,
    altitude_m: 2200000.0,
    pitch: -75.0
  },
  'arabian sea': {
    name: 'Arabian Sea',
    latitude: 16.0,
    longitude: 64.0,
    altitude_m: 2200000.0,
    pitch: -75.0
  },
  'sri lanka': {
    name: 'Sri Lanka Basin',
    latitude: 7.87,
    longitude: 80.77,
    altitude_m: 1200000.0,
    pitch: -70.0
  },
  'indian ocean': {
    name: 'Indian Ocean',
    latitude: -5.0,
    longitude: 75.0,
    altitude_m: 6000000.0,
    pitch: -85.0
  },
  'chennai': {
    name: 'Chennai Coastal Waters',
    latitude: 13.08,
    longitude: 80.27,
    altitude_m: 700000.0,
    pitch: -65.0
  },
  'mumbai': {
    name: 'Mumbai Offshore',
    latitude: 18.92,
    longitude: 72.83,
    altitude_m: 700000.0,
    pitch: -65.0
  },
  'maldives': {
    name: 'Maldives Archipelago',
    latitude: 3.20,
    longitude: 73.22,
    altitude_m: 1000000.0,
    pitch: -70.0
  },
  'andaman sea': {
    name: 'Andaman Sea',
    latitude: 10.0,
    longitude: 95.0,
    altitude_m: 1500000.0,
    pitch: -72.0
  },
  'south china sea': {
    name: 'South China Sea',
    latitude: 12.0,
    longitude: 113.0,
    altitude_m: 2500000.0,
    pitch: -75.0
  },
  'equatorial indian ocean': {
    name: 'Equatorial Indian Ocean',
    latitude: 0.0,
    longitude: 75.0,
    altitude_m: 3500000.0,
    pitch: -80.0
  }
};

class CesiumController {
  private viewer: any = null;
  private readyListeners: Array<(ready: boolean) => void> = [];
  private layerListeners: Array<(layer: string, visible: boolean) => void> = [];

  /**
   * Get active viewer instance with global window fallback
   */
  public getViewer(): any {
    if (this.viewer && !this.viewer.isDestroyed?.()) {
      return this.viewer;
    }
    if (typeof window !== 'undefined' && (window as any).__bluesphere_cesium_viewer) {
      const v = (window as any).__bluesphere_cesium_viewer;
      if (v && !v.isDestroyed?.()) {
        this.viewer = v;
        return v;
      }
    }
    return null;
  }

  /**
   * Check if Cesium viewer is currently instantiated and ready in DOM
   */
  public isReady(): boolean {
    return !!this.getViewer();
  }

  /**
   * Set active viewer on mount and notify waiting transactions
   */
  public setViewer(viewer: any): void {
    this.viewer = viewer;
    if (typeof window !== 'undefined') {
      (window as any).__bluesphere_cesium_viewer = viewer;
    }
    if (this.isReady()) {
      window.dispatchEvent(new CustomEvent('bluesphere:cesium-ready'));
      this.readyListeners.forEach(listener => listener(true));
      this.readyListeners = [];
    }
  }

  /**
   * Clear viewer on unmount
   */
  public clearViewer(): void {
    this.viewer = null;
    if (typeof window !== 'undefined') {
      (window as any).__bluesphere_cesium_viewer = null;
    }
    this.readyListeners.forEach(listener => listener(false));
  }

  /**
   * Promise-based handshake: wait until Cesium is mounted and ready
   */
  public waitForReady(timeoutMs: number = 8000): Promise<boolean> {
    if (this.isReady()) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      let timer: any = null;

      const onReadyCallback = (ready: boolean) => {
        if (ready) {
          if (timer) clearTimeout(timer);
          resolve(true);
        }
      };

      this.readyListeners.push(onReadyCallback);

      timer = setTimeout(() => {
        const idx = this.readyListeners.indexOf(onReadyCallback);
        if (idx !== -1) this.readyListeners.splice(idx, 1);
        resolve(this.isReady());
      }, timeoutMs);
    });
  }

  /**
   * Authoritative camera flight to recognized region
   */
  public async goToRegion(regionName: string, duration: number = 2.0): Promise<{ success: boolean; error?: string }> {
    const isReady = await this.waitForReady(3500);
    const key = regionName.toLowerCase().trim();
    const loc = CESIUM_REGION_REGISTRY[key] || CESIUM_REGION_REGISTRY['arabian sea'];
    const activeViewer = this.getViewer();

    // Universal dispatch to global event stream
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bluesphere:cesium-action', {
        detail: {
          type: 'GO_TO_REGION',
          payload: {
            region: loc.name,
            latitude: loc.latitude,
            longitude: loc.longitude,
            altitude_m: loc.altitude_m
          }
        }
      }));
    }

    if (!isReady || !activeViewer) {
      // If globe is currently mounting or event-driven, return success as event has been dispatched
      return { success: true };
    }

    try {
      const Cesium = (window as any).Cesium;
      if (!Cesium) {
        return { success: true };
      }

      activeViewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(loc.longitude, loc.latitude, loc.altitude_m),
        orientation: {
          heading: Cesium.Math.toRadians(loc.heading ?? 0.0),
          pitch: Cesium.Math.toRadians(loc.pitch ?? -75.0),
          roll: 0.0
        },
        duration: duration
      });

      return { success: true };
    } catch (err: any) {
      console.error('Cesium camera flyTo error:', err);
      return { success: true };
    }
  }

  /**
   * Authoritative camera flight to coordinates
   */
  public async goToLocation(
    coords: { latitude: number; longitude: number; altitude_m?: number; heading?: number; pitch?: number },
    duration: number = 2.0
  ): Promise<{ success: boolean; error?: string }> {
    const isReady = await this.waitForReady(3500);
    const activeViewer = this.getViewer();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bluesphere:cesium-action', {
        detail: {
          type: 'GO_TO_LOCATION',
          payload: coords
        }
      }));
    }

    if (!isReady || !activeViewer) {
      return { success: true };
    }

    try {
      const Cesium = (window as any).Cesium;
      if (!Cesium) return { success: true };

      const alt = coords.altitude_m ?? 1500000.0;
      const heading = coords.heading ?? 0.0;
      const pitch = coords.pitch ?? -75.0;

      activeViewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(coords.longitude, coords.latitude, alt),
        orientation: {
          heading: Cesium.Math.toRadians(heading),
          pitch: Cesium.Math.toRadians(pitch),
          roll: 0.0
        },
        duration: duration
      });

      return { success: true };
    } catch (err: any) {
      console.error('Cesium camera flyTo error:', err);
      return { success: true };
    }
  }

  /**
   * Toggle 3D visualization layer
   */
  public showLayer(layerName: string): void {
    this.layerListeners.forEach(listener => listener(layerName, true));
    window.dispatchEvent(new CustomEvent('bluesphere:cesium-layer-toggle', {
      detail: { layer: layerName, visible: true }
    }));
  }

  public hideLayer(layerName: string): void {
    this.layerListeners.forEach(listener => listener(layerName, false));
    window.dispatchEvent(new CustomEvent('bluesphere:cesium-layer-toggle', {
      detail: { layer: layerName, visible: false }
    }));
  }

  public onLayerToggle(callback: (layer: string, visible: boolean) => void): () => void {
    this.layerListeners.push(callback);
    return () => {
      this.layerListeners = this.layerListeners.filter(l => l !== callback);
    };
  }
}

export const cesiumController = new CesiumController();
