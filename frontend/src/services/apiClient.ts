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
  async getArgoFloats(wmo?: string, basin?: string): Promise<ArgoFloatData[]> {
    const params = new URLSearchParams();
    if (wmo) params.append('wmo', wmo);
    if (basin) params.append('basin', basin);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.fetchJson<ArgoFloatData[]>(`/observations/argo${queryString}`);
  }

  async getGliders(): Promise<any[]> {
    return this.fetchJson<any[]>('/observations/gliders');
  }

  async getBuoys(): Promise<any[]> {
    return this.fetchJson<any[]>('/observations/buoys');
  }

  async getCtd(): Promise<any[]> {
    return this.fetchJson<any[]>('/observations/ctd');
  }

  async getAdcp(): Promise<any[]> {
    return this.fetchJson<any[]>('/observations/adcp');
  }

  // Models
  async getModels(): Promise<any[]> {
    return this.fetchJson<any[]>('/models');
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
