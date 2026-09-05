import { StructuredCesiumAction, CesiumActionType } from '../services/apiClient';

const ALLOWED_ACTION_TYPES: Set<string> = new Set([
  'NAVIGATE_ROUTE',
  'OPEN_VIEW',
  'GO_TO_LOCATION',
  'GO_TO_REGION',
  'SHOW_LAYER',
  'HIDE_LAYER',
  'SET_PLATFORM_FILTER',
  'SET_MODEL',
  'SET_VARIABLE',
  'SET_DEPTH',
  'SET_TIME',
  'SELECT_PLATFORM',
  'SELECT_EDDY',
  'RUN_ANALYSIS',
  'OPEN_PANEL',
  'SHOW_RESULTS',
  'RESET_VIEW',
]);

const ALLOWED_MODELS: Set<string> = new Set(['hycom', 'roms', 'nemo']);
const ALLOWED_VARIABLES: Set<string> = new Set(['temperature', 'salinity', 'currents', 'ssh', 'wave', 'chlorophyll', 'oxygen']);

export interface ValidationResult {
  isValid: boolean;
  sanitizedAction?: StructuredCesiumAction;
  error?: string;
}

/**
 * Validates structured actions from AI Copilot against a strict whitelist schema
 * to ensure zero arbitrary JavaScript, malicious payloads, or out-of-bounds coordinates reach Cesium.
 */
export function validateCesiumAction(action: any): ValidationResult {
  if (!action || typeof action !== 'object') {
    return { isValid: false, error: 'Action payload must be an object.' };
  }

  const actionType = action.type;
  if (!actionType || !ALLOWED_ACTION_TYPES.has(actionType)) {
    return { isValid: false, error: `Unauthorized or unknown action type: "${actionType}".` };
  }

  const payload = action.payload || {};

  // 1. Coordinate Validation for GO_TO_LOCATION
  if (actionType === 'GO_TO_LOCATION') {
    const lat = Number(payload.latitude);
    const lon = Number(payload.longitude);
    const alt = Number(payload.altitude_m ?? 1500000.0);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return { isValid: false, error: `Invalid latitude coordinate: ${payload.latitude}. Must be between -90 and 90.` };
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      return { isValid: false, error: `Invalid longitude coordinate: ${payload.longitude}. Must be between -180 and 180.` };
    }
    if (isNaN(alt) || alt < 100 || alt > 50000000) {
      return { isValid: false, error: `Invalid camera altitude: ${payload.altitude_m}. Must be between 100m and 50,000km.` };
    }

    return {
      isValid: true,
      sanitizedAction: {
        type: 'GO_TO_LOCATION' as CesiumActionType,
        payload: { latitude: lat, longitude: lon, altitude_m: alt },
        description: action.description || `Fly to [${lat.toFixed(2)}°, ${lon.toFixed(2)}°]`,
      },
    };
  }

  // 2. Region Validation
  if (actionType === 'GO_TO_REGION') {
    const region = String(payload.region || '').toLowerCase().trim();
    if (!region) {
      return { isValid: false, error: 'Target region name is required for GO_TO_REGION.' };
    }
    return {
      isValid: true,
      sanitizedAction: {
        type: 'GO_TO_REGION' as CesiumActionType,
        payload: {
          region,
          latitude: Number(payload.latitude ?? 10.0),
          longitude: Number(payload.longitude ?? 75.0),
          altitude_m: Number(payload.altitude_m ?? 2500000.0),
        },
        description: action.description || `Focus region: ${region}`,
      },
    };
  }

  // 3. Model & Variable Validation
  if (actionType === 'SET_MODEL') {
    const modelId = String(payload.model_id || '').toLowerCase();
    if (!ALLOWED_MODELS.has(modelId)) {
      return { isValid: false, error: `Invalid model ID: "${payload.model_id}". Allowed models: hycom, roms, nemo.` };
    }
  }

  if (actionType === 'SET_VARIABLE') {
    const variable = String(payload.variable || '').toLowerCase();
    if (!ALLOWED_VARIABLES.has(variable)) {
      return { isValid: false, error: `Invalid variable: "${payload.variable}".` };
    }
  }

  // 4. Depth validation
  if (actionType === 'SET_DEPTH') {
    const depth = Number(payload.depth_m);
    if (isNaN(depth) || depth < 0 || depth > 6000) {
      return { isValid: false, error: `Invalid depth: ${payload.depth_m}m. Must be between 0m and 6000m.` };
    }
  }

  return {
    isValid: true,
    sanitizedAction: {
      type: actionType as CesiumActionType,
      payload,
      description: action.description,
    },
  };
}
