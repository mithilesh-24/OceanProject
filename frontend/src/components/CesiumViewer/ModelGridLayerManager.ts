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
        // High-contrast Divergent Oceanographic Palette:
        // Deep Azure (Model A < Model B) <-> Light Neutral (Zero) <-> Vivid Crimson Red (Model A > Model B)
        let maxAbs = Math.max(Math.abs(minVal!), Math.abs(maxVal!));
        if (maxAbs < 0.05) maxAbs = 0.05;

        const rawRatio = v / maxAbs;
        const sign = Math.sign(rawRatio);
        // Non-linear gamma boost to make subtle deep/shallow differences clearly visible
        const mag = Math.min(1.0, Math.pow(Math.abs(rawRatio), 0.75));

        if (sign > 0) {
          // Positive Difference: The Vivid Red Area (Model A > Model B)
          if (mag < 0.3) {
            const u = mag / 0.3;
            return [
              Math.round(253 * u + 30 * (1 - u)),
              Math.round(164 * u + 41 * (1 - u)),
              Math.round(175 * u + 59 * (1 - u)),
              Math.round(160 + 50 * u),
            ];
          } else if (mag < 0.7) {
            const u = (mag - 0.3) / 0.4;
            return [
              Math.round(239 * (1 - u) + 253 * u),
              Math.round(68 * (1 - u) + 164 * u),
              Math.round(68 * (1 - u) + 175 * u),
              Math.round(210 + 35 * u),
            ];
          } else {
            const u = (mag - 0.7) / 0.3;
            return [
              Math.round(220 * (1 - u) + 185 * u),
              Math.round(38 * (1 - u) + 28 * u),
              Math.round(38 * (1 - u) + 28 * u),
              245,
            ];
          }
        } else if (sign < 0) {
          // Negative Difference: Vibrant Sapphire / Azure (Model A < Model B)
          if (mag < 0.3) {
            const u = mag / 0.3;
            return [
              Math.round(147 * u + 30 * (1 - u)),
              Math.round(197 * u + 41 * (1 - u)),
              Math.round(253 * u + 59 * (1 - u)),
              Math.round(160 + 50 * u),
            ];
          } else if (mag < 0.7) {
            const u = (mag - 0.3) / 0.4;
            return [
              Math.round(37 * (1 - u) + 147 * u),
              Math.round(99 * (1 - u) + 197 * u),
              Math.round(235 * (1 - u) + 253 * u),
              Math.round(210 + 35 * u),
            ];
          } else {
            const u = (mag - 0.7) / 0.3;
            return [
              Math.round(29 * (1 - u) + 30 * u),
              Math.round(78 * (1 - u) + 58 * u),
              Math.round(216 * (1 - u) + 138 * u),
              245,
            ];
          }
        } else {
          return [30, 41, 59, 120];
        }
      } else {
        // Vivid Scientific Turbo Palette: Deep Navy -> Cyan -> Emerald -> Gold -> Fiery Scarlet Red
        const range = maxVal! - minVal! || 1.0;
        const t = Math.max(0, Math.min(1, (v - minVal!) / range));

        if (t < 0.25) {
          const u = t / 0.25;
          return [
            Math.round(15 * (1 - u) + 6 * u),
            Math.round(23 * (1 - u) + 182 * u),
            Math.round(100 * (1 - u) + 212 * u),
            Math.round(190 + 30 * u),
          ];
        } else if (t < 0.5) {
          const u = (t - 0.25) / 0.25;
          return [
            Math.round(6 * (1 - u) + 16 * u),
            Math.round(182 * (1 - u) + 185 * u),
            Math.round(212 * (1 - u) + 129 * u),
            Math.round(220 + 20 * u),
          ];
        } else if (t < 0.75) {
          const u = (t - 0.5) / 0.25;
          return [
            Math.round(16 * (1 - u) + 250 * u),
            Math.round(185 * (1 - u) + 204 * u),
            Math.round(129 * (1 - u) + 21 * u),
            240,
          ];
        } else {
          const u = (t - 0.75) / 0.25;
          return [
            Math.round(250 * (1 - u) + 220 * u),
            Math.round(204 * (1 - u) + 38 * u),
            Math.round(21 * (1 - u) + 38 * u),
            245,
          ];
        }
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
        tileWidth: renderWidth,
        tileHeight: renderHeight,
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
