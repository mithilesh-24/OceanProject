export interface ArgoObservation {
  id: string;
  platformNumber: string;
  cycleNumber: number;
  time: string;
  latitude: number;
  longitude: number;
  pressure: number; // PRES in dbar
  depth: number;    // approx depth in meters
  temperature: number | null; // TEMP in °C
  salinity: number | null;    // PSAL in psu
}

export type ArgoColorVariable = 'temperature' | 'salinity' | 'pressure';

export interface ArgoFilterOptions {
  variables: {
    temperature: boolean;
    salinity: boolean;
    pressure: boolean;
  };
  colorByVariable: ArgoColorVariable;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string;   // YYYY-MM-DD
  minDepth: number; // PRES min in dbar
  maxDepth: number; // PRES max in dbar
  limit?: number;
}

export interface ArgoFetchResult {
  observations: ArgoObservation[];
  totalCount: number;
  error: string | null;
  loading: boolean;
  queryUrl?: string;
}
