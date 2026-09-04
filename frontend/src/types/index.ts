export * from './argo';

export interface CoordinateInfo {
  latitude: number;
  longitude: number;
  height: number;
  cameraAltitude: number;
  heading: number;
  pitch: number;
  formattedLat?: string;
  formattedLon?: string;
}

export interface LocationDetails {
  name: string;
  category: 'continent' | 'country' | 'state' | 'city' | 'ocean' | 'sea' | 'landmark' | 'coordinate' | 'argo';
  country?: string;
  state?: string;
  elevation?: number;
}

export interface SearchResult {
  displayName: string;
  lat: number;
  lon: number;
  boundingbox?: [string, string, string, string];
  type?: string;
  category?: string;
}

export interface Placemark {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  height: number;
  createdAt: number;
}

export interface LayerState {
  satellite: boolean;
  vectorMap: boolean;
  terrain: boolean;
  terrainExaggeration: number; // e.g. 1.5x for strong 3D mountains
  buildings3D: boolean;
  borders: boolean;
  labels: boolean;
  clouds: boolean;
  bathymetry: boolean;
  lightingMode: 'realistic' | 'readable';
  
  // Argo & Ocean Data layers
  argoFloats: boolean;
  oceanCurrents: boolean;
  sst: boolean;
  salinity: boolean;
  waveHeight: boolean;
  seaLevelAnomaly: boolean;
  chlorophyll: boolean;
  oceanDepth: boolean;
}

export type SceneModeType = '3D' | '2D' | 'COLUMBUS';
export type MeasureModeType = 'none' | 'distance' | 'area';
