import * as Cesium from 'cesium';

export interface ModelGridConfig {
  modelId: string;
  variable: string;
  depthM: number;
  units: string;
  latitudes: number[];
  longitudes: number[];
  gridValues: (number | null)[][];
  minVal?: number;
  maxVal?: number;
  opacity?: number;
  isDifferenceField?: boolean;
  modelA?: string;
  modelB?: string;
}

export class ModelGridLayerManager {
  private viewer: Cesium.Viewer;
  private currentImageryLayer: Cesium.ImageryLayer | null = null;
  private currentConfig: ModelGridConfig | null = null;
  private canvas: HTMLCanvasElement;
  private isEnabled: boolean = true;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.canvas = document.createElement('canvas');
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (this.currentImageryLayer) {
      this.currentImageryLayer.show = enabled;
    }
  }

  /**
   * Generates a smooth interpolated scientific raster on canvas and adds it to Cesium as a SingleTileImageryProvider
   */
  public updateGridLayer(config: ModelGridConfig) {
    this.currentConfig = config;
    if (!this.isEnabled) return;

    const { latitudes, longitudes, gridValues, isDifferenceField, opacity = 0.75 } = config;
    const nLat = latitudes.length;
    const nLon = longitudes.length;

    if (nLat < 2 || nLon < 2 || gridValues.length === 0) {
      this.removeLayer();
      return;
    }

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);

    // Canvas resolution (scaled for smooth interpolation)
    const renderWidth = 512;
    const renderHeight = 512;
    this.canvas.width = renderWidth;
    this.canvas.height = renderHeight;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, renderWidth, renderHeight);

    // Calculate min/max range
    let minVal = config.minVal;
    let maxVal = config.maxVal;

    if (minVal === undefined || maxVal === undefined) {
      let calcMin = Infinity;
      let calcMax = -Infinity;
      for (let r = 0; r < nLat; r++) {
        for (let c = 0; c < nLon; c++) {
          const v = gridValues[r]?.[c];
          if (v !== null && v !== undefined && !isNaN(v)) {
            if (v < calcMin) calcMin = v;
            if (v > calcMax) calcMax = v;
          }
        }
      }
      minVal = calcMin === Infinity ? 0 : calcMin;
      maxVal = calcMax === -Infinity ? 1 : calcMax;
    }

    // Color mapper
    const getColor = (v: number | null): [number, number, number, number] => {
      if (v === null || v === undefined || isNaN(v)) {
        return [0, 0, 0, 0]; // Transparent for land or missing cells
      }

      if (isDifferenceField) {
        // Divergent: Blue (Model A < Model B) -> Dark Slate (Zero) -> Crimson (Model A > Model B)
        const maxAbs = Math.max(Math.abs(minVal!), Math.abs(maxVal!), 0.5);
        const norm = Math.max(-1, Math.min(1, v / maxAbs));

        if (norm < 0) {
          const t = Math.abs(norm);
          const r = Math.round(15 + (59 - 15) * (1 - t));
          const g = Math.round(23 + (130 - 23) * t);
          const b = Math.round(42 + (246 - 42) * t);
          const a = Math.round(180 + 70 * t);
          return [r, g, b, a];
        } else {
          const t = norm;
          const r = Math.round(15 + (244 - 15) * t);
          const g = Math.round(23 + (63 - 23) * (1 - t));
          const b = Math.round(42 + (94 - 42) * (1 - t));
          const a = Math.round(180 + 70 * t);
          return [r, g, b, a];
        }
      } else {
        // Scientific Sequential Ocean Palette: Deep Blue -> Cyan -> Amber -> Coral
        const range = maxVal! - minVal! || 1.0;
        const t = Math.max(0, Math.min(1, (v - minVal!) / range));
        let r = 0, g = 0, b = 0;

        if (t < 0.33) {
          const u = t / 0.33;
          r = Math.round(10 * (1 - u) + 6 * u);
          g = Math.round(30 * (1 - u) + 182 * u);
          b = Math.round(120 * (1 - u) + 212 * u);
        } else if (t < 0.66) {
          const u = (t - 0.33) / 0.33;
          r = Math.round(6 * (1 - u) + 245 * u);
          g = Math.round(182 * (1 - u) + 158 * u);
          b = Math.round(212 * (1 - u) + 11 * u);
        } else {
          const u = (t - 0.66) / 0.34;
          r = Math.round(245 * (1 - u) + 239 * u);
          g = Math.round(158 * (1 - u) + 68 * u);
          b = Math.round(11 * (1 - u) + 68 * u);
        }
        return [r, g, b, 220];
      }
    };

    // Render smooth grid into image data
    const imgData = ctx.createImageData(renderWidth, renderHeight);
    const data = imgData.data;

    for (let py = 0; py < renderHeight; py++) {
      // py = 0 corresponds to maxLat (North)
      const latFrac = 1.0 - (py / (renderHeight - 1));
      const latIdxFloat = latFrac * (nLat - 1);
      const r0 = Math.floor(latIdxFloat);
      const r1 = Math.min(nLat - 1, r0 + 1);
      const rWeight = latIdxFloat - r0;

      for (let px = 0; px < renderWidth; px++) {
        const lonFrac = px / (renderWidth - 1);
        const lonIdxFloat = lonFrac * (nLon - 1);
        const c0 = Math.floor(lonIdxFloat);
        const c1 = Math.min(nLon - 1, c0 + 1);
        const cWeight = lonIdxFloat - c0;

        // Bilinear interpolation of grid scalar values
        const v00 = gridValues[r0]?.[c0];
        const v01 = gridValues[r0]?.[c1];
        const v10 = gridValues[r1]?.[c0];
        const v11 = gridValues[r1]?.[c1];

        let val: number | null = null;
        if (v00 !== null && v01 !== null && v10 !== null && v11 !== null &&
            v00 !== undefined && v01 !== undefined && v10 !== undefined && v11 !== undefined) {
          const top = v00 * (1 - cWeight) + v01 * cWeight;
          const bot = v10 * (1 - cWeight) + v11 * cWeight;
          val = top * (1 - rWeight) + bot * rWeight;
        } else {
          val = v00 ?? v01 ?? v10 ?? v11 ?? null;
        }

        const [cr, cg, cb, ca] = getColor(val);
        const idx = (py * renderWidth + px) * 4;
        data[idx] = cr;
        data[idx + 1] = cg;
        data[idx + 2] = cb;
        data[idx + 3] = ca;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const dataUrl = this.canvas.toDataURL('image/png');

    // Remove old layer
    this.removeLayer();

    // Create Cesium imagery layer bounded to model coordinates
    try {
      const rectangle = Cesium.Rectangle.fromDegrees(minLon, minLat, maxLon, maxLat);
      const provider = new Cesium.SingleTileImageryProvider({
        url: dataUrl,
        rectangle,
      });

      this.currentImageryLayer = this.viewer.imageryLayers.addImageryProvider(provider);
      this.currentImageryLayer.alpha = opacity;
      this.currentImageryLayer.show = this.isEnabled;
    } catch (err) {
      console.error('Failed to create Cesium model imagery layer:', err);
    }
  }

  public setOpacity(alpha: number) {
    if (this.currentImageryLayer) {
      this.currentImageryLayer.alpha = Math.max(0, Math.min(1, alpha));
    }
  }

  public removeLayer() {
    if (this.currentImageryLayer && !this.viewer.isDestroyed()) {
      try {
        this.viewer.imageryLayers.remove(this.currentImageryLayer, true);
      } catch {
        // ignore removal if viewer destroyed
      }
      this.currentImageryLayer = null;
    }
  }

  public destroy() {
    this.removeLayer();
  }
}
