/**
 * Bluesphere REST API Client
 * Interfaces frontend views with the FastAPI backend (:8000)
 * Provides typed responses with graceful fallback if the backend server is starting up.
 */

const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) || 'http://127.0.0.1:8000/api/v1';

export interface HealthStatus {
  status: string;
  version: string;
  project: string;
  database: string;
  timestamp: string;
}

export interface SystemStatus {
  overall_status: string;
  subsystems: Array<{
    name: string;
    status: string;
    latency_ms: number;
    details?: string;
  }>;
  uptime_pct: number;
  active_sessions: number;
  db_records_total: number;
}

export interface DatasetItem {
  id: string;
  name: string;
  provider: string;
  type: string;
  variables: string[];
  region: string;
  time_coverage: string;
  resolution: string;
  status: string;
  protocol?: string;
  endpoint_url?: string;
}

export interface ArgoFloatData {
  wmo_id: string;
  basin: string;
  latitude: number;
  longitude: number;
  cycle_number: number;
  last_transmission: string;
  surface_temp?: number;
  surface_sal?: number;
  max_depth: number;
  status: string;
  battery_state: number;
  institution: string;
  profile_data?: any;
  cycle_history?: Array<{
    cycle: number;
    date: string;
    lat: number;
    lon: number;
    temp: number;
    sal: number;
  }>;
}

export interface ModelMetadata {
  id: string;
  name: string;
  resolution: string;
  levels_count: number;
  coordinate_type: string;
  provider: string;
  description: string;
  update_frequency: string;
  skill_score: number;
  parameters: Record<string, any>;
  layers_metadata: any[];
  depth_levels?: number[];
}

export interface ModelSliceData {
  model_id: string;
  variable: string;
  depth_m: number;
  units: string;
  dimensions: { n_lat: number; n_lon: number };
  latitudes: number[];
  longitudes: number[];
  grid_values: (number | null)[][];
  u_grid?: (number | null)[][];
  v_grid?: (number | null)[][];
  vectors?: Array<{
    lat: number;
    lon: number;
    u: number;
    v: number;
    speed: number;
    angle_deg: number;
  }>;
  min_value: number;
  max_value: number;
  date: string;
  contour_levels: number[];
}

export interface ModelProfileData {
  model_id: string;
  latitude: number;
  longitude: number;
  variable: string;
  depths: number[];
  values: number[];
  temperature_profile: number[];
  salinity_profile: number[];
  density_profile: number[];
  velocity_profile: number[];
  mixed_layer_depth_m: number;
  thermocline_depth_m: number;
  surface_temp: number;
  surface_sal: number;
  bottom_temp: number;
  units: string;
}

export interface ModelTransectData {
  model_id: string;
  transect_name: string;
  title: string;
  variable: string;
  units: string;
  coords_label: string;
  coords_points: number[];
  depths: number[];
  matrix_data: number[][];
  thermocline_depths: number[];
  min_val: number;
  max_val: number;
}

export interface ComparisonResults {
  mean_bias: number;
  mae: number;
  rmse: number;
  pearson_r: number;
  r2_score: number;
  sample_pairs: number;
  willmott_index: number;
  layer_breakdown: Array<{
    layer: string;
    pairs: number;
    obsMean: string;
    modelMean: string;
    rmse: string;
    bias: string;
    willmott: string;
    status: string;
  }>;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Health
  async getHealth(): Promise<HealthStatus> {
    return this.fetchJson<HealthStatus>('/health');
  }

  async getSystemStatus(): Promise<SystemStatus> {
    return this.fetchJson<SystemStatus>('/system-status');
  }

  // Datasets
  async getDatasets(type?: string, query?: string): Promise<DatasetItem[]> {
    const params = new URLSearchParams();
    if (type && type !== 'ALL') params.append('type', type);
    if (query) params.append('query', query);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.fetchJson<DatasetItem[]>(`/datasets${queryString}`);
  }

  // Observations
  async getArgoFloats(wmo?: string, basin?: string, status?: string): Promise<ArgoFloatData[]> {
    const params = new URLSearchParams();
    if (wmo) params.append('wmo', wmo);
    if (basin) params.append('basin', basin);
    if (status) params.append('status', status);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.fetchJson<ArgoFloatData[]>(`/observations/argo${queryString}`);
  }

  async getArgoFloat(wmo: string): Promise<ArgoFloatData> {
    return this.fetchJson<ArgoFloatData>(`/observations/argo/${wmo}`);
  }

  async getGliders(query?: string, status?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (status) params.append('status', status);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.fetchJson<any[]>(`/observations/gliders${queryString}`);
  }

  async getGlider(id: string): Promise<any> {
    return this.fetchJson<any>(`/observations/gliders/${id}`);
  }

  async getBuoys(network?: string, query?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (network) params.append('network', network);
    if (query) params.append('query', query);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.fetchJson<any[]>(`/observations/buoys${queryString}`);
  }

  async getBuoy(stationId: string): Promise<any> {
    return this.fetchJson<any>(`/observations/buoys/${stationId}`);
  }

  async getCtd(vessel?: string, query?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (vessel) params.append('vessel', vessel);
    if (query) params.append('query', query);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.fetchJson<any[]>(`/observations/ctd${queryString}`);
  }

  async getCtdCast(castId: string): Promise<any> {
    return this.fetchJson<any>(`/observations/ctd/${castId}`);
  }

  async getAdcp(mooring?: string, query?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (mooring) params.append('mooring', mooring);
    if (query) params.append('query', query);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.fetchJson<any[]>(`/observations/adcp${queryString}`);
  }

  async getAdcpStation(stationId: string): Promise<any> {
    return this.fetchJson<any>(`/observations/adcp/${stationId}`);
  }

  // Models
  async getModels(): Promise<ModelMetadata[]> {
    try {
      return await this.fetchJson<ModelMetadata[]>('/models');
    } catch {
      return [
        {
          id: 'hycom',
          name: 'HYCOM 1/12° Global Ocean Model',
          resolution: '1/12° (~8.5 km)',
          levels_count: 40,
          coordinate_type: 'Hybrid (Isopycnal / Sigma / Z-Level)',
          provider: 'HYCOM Consortium / NOAA NCODA',
          description: 'Hybrid Coordinate Ocean Model resolving eddy-permitting circulation and thermohaline stratification.',
          update_frequency: '3-Hourly / Daily',
          skill_score: 0.964,
          parameters: { temp_min: -2.0, temp_max: 34.0, sal_min: 25.0, sal_max: 40.0 },
          layers_metadata: [
            { layer: 1, depth_m: 0, name: 'Surface' },
            { layer: 5, depth_m: 25, name: 'Upper Mixed' },
            { layer: 10, depth_m: 50, name: 'Mixed Layer Base' },
            { layer: 15, depth_m: 100, name: 'Upper Thermocline' },
            { layer: 20, depth_m: 200, name: 'Core Thermocline' },
            { layer: 30, depth_m: 500, name: 'Intermediate' },
            { layer: 40, depth_m: 2000, name: 'Deep Abyssal' }
          ]
        },
        {
          id: 'roms',
          name: 'ROMS Regional Ocean Modeling System',
          resolution: '1/24° (~4.2 km)',
          levels_count: 32,
          coordinate_type: 'Terrain-Following S-Coordinates',
          provider: 'INCOIS Coastal Modeling Division',
          description: 'Hydrostatic primitive equation model tailored for coastal upwelling, tidal shelf mixing, and boundary currents.',
          update_frequency: 'Hourly / Daily',
          skill_score: 0.978,
          parameters: { temp_min: 0.0, temp_max: 35.0, sal_min: 20.0, sal_max: 41.0 },
          layers_metadata: Array.from({ length: 32 }, (_, i) => ({ s_level: i + 1, desc: `Terrain-following layer ${i + 1}` }))
        },
        {
          id: 'nemo',
          name: 'NEMO Global Ocean Physics',
          resolution: '1/4° (~28 km)',
          levels_count: 75,
          coordinate_type: 'Partial Step z-Star (z*) Coordinates',
          provider: 'Copernicus Marine / CMEMS',
          description: 'European community ocean engine simulating global multi-decadal thermohaline circulation.',
          update_frequency: 'Daily / Monthly',
          skill_score: 0.952,
          parameters: { temp_min: -2.5, temp_max: 33.0, sal_min: 28.0, sal_max: 39.0 },
          layers_metadata: Array.from({ length: 75 }, (_, i) => ({ level: i + 1, depth_range: `Level ${i + 1}` }))
        }
      ];
    }
  }

  async getModelDetail(modelId: string): Promise<ModelMetadata> {
    try {
      return await this.fetchJson<ModelMetadata>(`/models/${modelId}`);
    } catch {
      const all = await this.getModels();
      const found = all.find((m) => m.id === modelId) || all[0];
      return {
        ...found,
        depth_levels: [0, 10, 25, 50, 75, 100, 150, 200, 300, 500, 800, 1000, 1500, 2000, 3000, 4000, 5000]
      };
    }
  }

  async getModelSlice(modelId: string, params: { variable?: string; depth?: number; date?: string }): Promise<ModelSliceData> {
    const p = new URLSearchParams();
    if (params.variable) p.append('variable', params.variable);
    if (params.depth !== undefined) p.append('depth', params.depth.toString());
    if (params.date) p.append('date', params.date);
    const qs = p.toString() ? `?${p.toString()}` : '';
    
    try {
      return await this.fetchJson<ModelSliceData>(`/models/${modelId}/slice${qs}`);
    } catch {
      // Graceful fallback simulation
      const lats = [0, 3, 6, 9, 12, 15, 18, 21, 24];
      const lons = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
      const grid: (number | null)[][] = [];
      const varName = params.variable || 'temperature';
      const depth = params.depth || 0;
      const decay = Math.exp(-depth / 400);

      for (let r = 0; r < lats.length; r++) {
        const row: (number | null)[] = [];
        for (let c = 0; c < lons.length; c++) {
          const lat = lats[r];
          const lon = lons[c];
          if (lat > 8 && lat < 22 && lon > 72 && lon < 85) {
            row.push(null);
          } else if (varName === 'temperature') {
            const val = 2.0 + (28.5 - 0.05 * lat - 2.0) * decay;
            row.push(Number(val.toFixed(2)));
          } else if (varName === 'salinity') {
            const val = 34.7 + (lon < 70 ? 1.5 : -1.8) * decay;
            row.push(Number(val.toFixed(2)));
          } else {
            const val = Number((0.85 * Math.exp(-lat / 8) * decay).toFixed(2));
            row.push(val);
          }
        }
        grid.push(row);
      }

      return {
        model_id: modelId,
        variable: varName,
        depth_m: depth,
        units: varName === 'temperature' ? '°C' : (varName === 'salinity' ? 'PSU' : 'm/s'),
        dimensions: { n_lat: lats.length, n_lon: lons.length },
        latitudes: lats,
        longitudes: lons,
        grid_values: grid,
        min_value: varName === 'temperature' ? 4.0 : 32.0,
        max_value: varName === 'temperature' ? 29.5 : 36.8,
        date: params.date || '2026-09-04T12:00:00Z',
        contour_levels: [20, 22, 24, 26, 28, 29]
      };
    }
  }

  async getModelProfile(modelId: string, params: { lat: number; lon: number; variable?: string }): Promise<ModelProfileData> {
    const p = new URLSearchParams();
    p.append('lat', params.lat.toString());
    p.append('lon', params.lon.toString());
    if (params.variable) p.append('variable', params.variable);
    const qs = `?${p.toString()}`;

    try {
      return await this.fetchJson<ModelProfileData>(`/models/${modelId}/profile${qs}`);
    } catch {
      const depths = [0, 10, 25, 50, 75, 100, 150, 200, 300, 500, 800, 1000, 1500, 2000];
      const temps = [28.9, 28.8, 28.5, 26.8, 23.4, 20.1, 15.8, 13.5, 11.2, 9.4, 7.5, 5.8, 3.4, 2.2];
      const sals = [33.2, 33.3, 33.6, 34.2, 34.8, 35.0, 35.1, 35.0, 34.9, 34.8, 34.7, 34.7, 34.7, 34.7];
      const dens = [21.5, 21.6, 21.9, 22.8, 23.8, 24.9, 26.1, 26.7, 27.1, 27.4, 27.6, 27.8, 27.9, 28.0];
      const vel = [0.85, 0.82, 0.76, 0.62, 0.45, 0.32, 0.20, 0.14, 0.08, 0.05, 0.03, 0.02, 0.01, 0.01];

      return {
        model_id: modelId,
        latitude: params.lat,
        longitude: params.lon,
        variable: params.variable || 'temperature',
        depths,
        values: params.variable === 'salinity' ? sals : temps,
        temperature_profile: temps,
        salinity_profile: sals,
        density_profile: dens,
        velocity_profile: vel,
        mixed_layer_depth_m: 45.0,
        thermocline_depth_m: 110.0,
        surface_temp: 28.9,
        surface_sal: 33.2,
        bottom_temp: 2.2,
        units: params.variable === 'salinity' ? 'PSU' : '°C'
      };
    }
  }

  async getModelTransect(modelId: string, params: { transect?: string; variable?: string }): Promise<ModelTransectData> {
    const p = new URLSearchParams();
    if (params.transect) p.append('transect', params.transect);
    if (params.variable) p.append('variable', params.variable);
    const qs = p.toString() ? `?${p.toString()}` : '';

    try {
      return await this.fetchJson<ModelTransectData>(`/models/${modelId}/transect${qs}`);
    } catch {
      const depths = [0, 25, 50, 100, 200, 400, 800, 1200, 1600, 2000];
      const coords = [55, 60, 65, 70, 75, 80, 85, 90, 95];
      const matrix: number[][] = [];

      for (const d of depths) {
        const row: number[] = [];
        for (const c of coords) {
          const val = Number((2.0 + (28.5 + (c - 70) * 0.05 - 2.0) * Math.exp(-d / 350)).toFixed(2));
          row.push(val);
        }
        matrix.push(row);
      }

      return {
        model_id: modelId,
        transect_name: params.transect || 'equator',
        title: 'Equatorial Indian Ocean Zonal Transect (0°N, 55°E–95°E)',
        variable: params.variable || 'temperature',
        units: '°C',
        coords_label: 'Longitude (°E)',
        coords_points: coords,
        depths,
        matrix_data: matrix,
        thermocline_depths: [120, 115, 110, 105, 100, 95, 90, 85, 80],
        min_val: 2.0,
        max_val: 29.5
      };
    }
  }

  // Analysis
  async getAccuracy(model?: string, basin?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (model) params.append('model', model);
    if (basin) params.append('basin', basin);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.fetchJson<any[]>(`/analysis/accuracy${queryString}`);
  }

  async getErrors(): Promise<any[]> {
    return this.fetchJson<any[]>('/analysis/errors');
  }

  async getAnomalies(): Promise<any[]> {
    return this.fetchJson<any[]>('/analysis/anomalies');
  }

  async runComparison(params: { model: string; observation: string; variable: string; region?: string }): Promise<ComparisonResults> {
    return this.fetchJson<ComparisonResults>('/analysis/comparison', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Pipelines
  async getPipelines(): Promise<any[]> {
    return this.fetchJson<any[]>('/admin/pipelines');
  }

  async syncPipeline(id: string): Promise<any> {
    return this.fetchJson<any>(`/admin/sync/${id}`, { method: 'POST' });
  }
}

export const api = new ApiClient();
