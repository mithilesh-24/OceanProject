/**
 * Bluesphere REST API Client
 * Interfaces frontend views with the FastAPI backend (:8000) via Vite proxy (/api/v1)
 * Enforces strict backend-frontend live connection integrity with zero silent fallback mocking.
 */

const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) || '/api/v1';

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

export interface DepthLayerConfig {
  depth_m: number;
  name: string;
  desc: string;
  color: string;
  opacity: number;
  temp_range: string;
  sal_range: string;
  pressure_dbar: number;
}

export interface TimelineData {
  start_date: string;
  end_date: string;
  total_days: number;
  recommended_step_hours: number;
  milestones: Array<{
    id: string;
    date: string;
    label: string;
    type: string;
    platform: string;
  }>;
  available_variables: string[];
  depth_layers_count: number;
}

export interface TimeSnapshotData {
  timestamp: string;
  time_progress_pct: number;
  variable: string;
  depth_m: number;
  argo_floats: Array<{
    wmo_id: string;
    name: string;
    lat: number;
    lon: number;
    depth_current: number;
    cycle: number;
    temp: number;
    sal: number;
    status: string;
    trail: Array<{ lat: number; lon: number; t: number }>;
  }>;
  gliders: Array<{
    id: string;
    name: string;
    lat: number;
    lon: number;
    dive_depth: number;
    battery: number;
    temp: number;
    sal: number;
  }>;
  buoys: Array<{
    id: string;
    name: string;
    lat: number;
    lon: number;
    sst: number;
    wind: number;
    wave: number;
  }>;
  active_platforms_count: number;
  mean_basin_temp: number;
  mean_basin_sal: number;
  current_monsoon_phase: string;
  wyrtki_jet_velocity: number;
}

export interface ComparisonResults {
  model_id?: string;
  obs_type?: string;
  variable?: string;
  var_name?: string;
  units?: string;
  region?: string;
  metrics?: {
    mean_bias: number;
    mae: number;
    rmse: number;
    pearson_r: number;
    r2_score: number;
    willmott_index: number;
    taylor_skill: number;
    sample_pairs: number;
    std_ratio: number;
    regression_slope: number;
    regression_intercept: number;
  };
  scatter_points?: Array<{
    obs: number;
    model: number;
    error: number;
  }>;
  depth_profile?: {
    depths: number[];
    obs: Array<{ depth: number; value: number }>;
    model: Array<{ depth: number; value: number }>;
    error_ribbon: Array<{ depth: number; model: number; upper: number; lower: number; rmse: number }>;
  };
  time_series?: Array<{
    day: string;
    obs: number;
    model: number;
    residual: number;
  }>;
  histogram?: {
    bins: Array<{
      bin_start: number;
      bin_end: number;
      bin_mid: number;
      count: number;
      gaussian_fit: number;
      label: string;
    }>;
    p10_error: number;
    p50_error: number;
    p90_error: number;
  };
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

export interface InterComparisonResults {
  model_a: string;
  model_b: string;
  variable: string;
  units: string;
  depth_m: number;
  region: string;
  common_grid: {
    n_lat: number;
    n_lon: number;
    latitudes: number[];
    longitudes: number[];
    resolution: string;
  };
  metrics: {
    mean_bias: number;
    mad: number;
    rmsd: number;
    pattern_correlation: number;
    r2_score: number;
    variance_ratio: number;
    max_positive_diff: number;
    max_negative_diff: number;
    p10: number;
    p25: number;
    p50_median: number;
    p75: number;
    p90: number;
    valid_points_count: number;
  };
  difference_grid: (number | null)[][];
  model_a_grid: (number | null)[][];
  model_b_grid: (number | null)[][];
  depth_variance_profile: Array<{
    depth_m: number;
    model_a_val: number;
    model_b_val: number;
    difference: number;
    rmsd: number;
  }>;
  layer_strata_breakdown: Array<{
    layer: string;
    depth_m: number;
    model_a_mean: string;
    model_b_mean: string;
    bias: string;
    rmsd: string;
    status: string;
  }>;
  transect_comparison: {
    transect_name: string;
    title: string;
    coords_label: string;
    coords_points: Array<{ name: string; lat: number; lon: number; dist_km: number }>;
    depths: number[];
    diff_matrix: number[][];
    model_a_matrix: number[][];
    model_b_matrix: number[][];
  };
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}: ${response.statusText} for ${endpoint}`);
      }

      return await response.json();
    } catch (err: any) {
      console.error(`[ApiClient Connection Error] Failed to fetch ${url}:`, err);
      throw new Error(`FastAPI Backend unreachable at ${url}. Ensure the server is running on port 8000.`);
    }
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

  // Numerical Models
  async getModels(): Promise<ModelMetadata[]> {
    return this.fetchJson<ModelMetadata[]>('/models');
  }

  async getModelDetail(modelId: string): Promise<ModelMetadata> {
    return this.fetchJson<ModelMetadata>(`/models/${modelId}`);
  }

  async getModelSlice(modelId: string, params: { variable?: string; depth?: number; date?: string }): Promise<ModelSliceData> {
    const p = new URLSearchParams();
    if (params.variable) p.append('variable', params.variable);
    if (params.depth !== undefined) p.append('depth', params.depth.toString());
    if (params.date) p.append('date', params.date);
    const qs = p.toString() ? `?${p.toString()}` : '';
    return this.fetchJson<ModelSliceData>(`/models/${modelId}/slice${qs}`);
  }

  async getModelProfile(modelId: string, params: { lat: number; lon: number; variable?: string }): Promise<ModelProfileData> {
    const p = new URLSearchParams();
    p.append('lat', params.lat.toString());
    p.append('lon', params.lon.toString());
    if (params.variable) p.append('variable', params.variable);
    const qs = `?${p.toString()}`;
    return this.fetchJson<ModelProfileData>(`/models/${modelId}/profile${qs}`);
  }

  async getModelTransect(modelId: string, params: { transect?: string; variable?: string }): Promise<ModelTransectData> {
    const p = new URLSearchParams();
    if (params.transect) p.append('transect', params.transect);
    if (params.variable) p.append('variable', params.variable);
    const qs = p.toString() ? `?${p.toString()}` : '';
    return this.fetchJson<ModelTransectData>(`/models/${modelId}/transect${qs}`);
  }

  // Scientific Analysis & Validation (Phases 9–14)
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

  async runModelInterComparison(params: {
    model_a: string;
    model_b: string;
    variable: string;
    depth?: number;
    region?: string;
    transect?: string;
  }): Promise<InterComparisonResults> {
    return this.fetchJson<InterComparisonResults>('/analysis/inter-comparison', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Phase 11: Accuracy Breakdown & Taylor Coordinates
  async getAccuracyBreakdown(params: {
    model?: string;
    variable?: string;
    region?: string;
    season?: string;
  }): Promise<any> {
    return this.fetchJson<any>('/analysis/accuracy/breakdown', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Phase 12: Spatial 2D Errors, Regional Ranking & Lead-Time Curve
  async getSpatialTemporalErrors(params: {
    model?: string;
    variable?: string;
    depth?: number;
    region?: string;
    time_horizon_days?: number;
  }): Promise<any> {
    return this.fetchJson<any>('/analysis/errors/spatial-temporal', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Phase 13: Marine Heatwave & Anomaly Detection
  async detectAnomalies(params: {
    variable?: string;
    region?: string;
    depth?: number;
    category_filter?: string;
    mhw_threshold_percentile?: number;
  }): Promise<any> {
    return this.fetchJson<any>('/analysis/anomalies/detect', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Phase 14: Comprehensive Statistical Engine
  async getComprehensiveStatistics(params: {
    model?: string;
    variable?: string;
    region?: string;
    depth?: number;
  }): Promise<any> {
    return this.fetchJson<any>('/analysis/statistics/comprehensive', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Pipeline Administration
  async getPipelines(): Promise<any[]> {
    return this.fetchJson<any[]>('/admin/pipelines');
  }

  async syncPipeline(id: string): Promise<any> {
    return this.fetchJson<any>(`/admin/sync/${id}`, { method: 'POST' });
  }

  // Phase 16: Saved Analysis & Workspaces
  async getWorkspaces(params?: { category?: string; search?: string }): Promise<any> {
    const p = new URLSearchParams();
    if (params?.category && params.category !== 'all') p.append('category', params.category);
    if (params?.search) p.append('search', params.search);
    const qs = p.toString() ? `?${p.toString()}` : '';
    return this.fetchJson<any>(`/workspaces${qs}`);
  }

  async createWorkspace(data: any): Promise<any> {
    return this.fetchJson<any>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWorkspace(id: string): Promise<any> {
    return this.fetchJson<any>(`/workspaces/${id}`);
  }

  async deleteWorkspace(id: string): Promise<any> {
    return this.fetchJson<any>(`/workspaces/${id}`, { method: 'DELETE' });
  }

  async cloneWorkspace(id: string): Promise<any> {
    return this.fetchJson<any>(`/workspaces/${id}/clone`, { method: 'POST' });
  }

  // Phase 17: Multi-Format Data & Report Export Engine
  async exportOceanData(params: {
    export_format?: string;
    data_source?: string;
    variable?: string;
    region?: string;
    depth_m?: number;
    start_date?: string;
    end_date?: string;
    lat_min?: number;
    lat_max?: number;
    lon_min?: number;
    lon_max?: number;
    include_metadata?: boolean;
  }): Promise<any> {
    return this.fetchJson<any>('/export/data', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async exportScientificBulletin(params: {
    title?: string;
    report_type?: string;
    model?: string;
    variable?: string;
    region?: string;
    include_taylor_metrics?: boolean;
    include_mhw_alerts?: boolean;
    include_regional_rankings?: boolean;
    format?: string;
  }): Promise<any> {
    return this.fetchJson<any>('/export/bulletin', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Phase 18: Student Educational Oceanography Workspace
  async getEducationalModules(): Promise<any> {
    return this.fetchJson<any>('/educational/modules');
  }

  async getEducationalModule(id: string): Promise<any> {
    return this.fetchJson<any>(`/educational/modules/${id}`);
  }

  // Phase 19: Researcher Scientific Workbench
  async computeDensityStratification(params: {
    depth_m: number[];
    temperature_c: number[];
    salinity_psu: number[];
    latitude?: number;
  }): Promise<any> {
    return this.fetchJson<any>('/research/compute/density-stratification', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async generateResearchQuery(params: {
    query_type: string;
    variable: string;
    depth_range?: number[];
    time_range?: string[];
    lat_range?: number[];
    lon_range?: number[];
  }): Promise<any> {
    return this.fetchJson<any>('/research/query/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Phase 20: Admin Platform & Telemetry
  async getSystemTelemetry(): Promise<any> {
    return this.fetchJson<any>('/telemetry/health/telemetry');
  }

  async triggerPipelineSync(pipelineId: string): Promise<any> {
    return this.fetchJson<any>(`/telemetry/pipelines/${pipelineId}/trigger`, { method: 'POST' });
  }

  async flushPlatformCache(target?: string): Promise<any> {
    const qs = target ? `?target=${target}` : '';
    return this.fetchJson<any>(`/telemetry/cache/flush${qs}`, { method: 'POST' });
  }
}

export const api = new ApiClient();
