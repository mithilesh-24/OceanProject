from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SatelliteLayer(BaseModel):
    id: str
    name: str
    sensor: str
    satellite: str
    parameter: str
    units: str
    spatial_resolution: str
    temporal_frequency: str
    latency_hours: float
    colormap: str
    min_val: float
    max_val: float
    is_active: bool = True
    description: str

class MatchupDataPoint(BaseModel):
    station_id: str
    latitude: float
    longitude: float
    satellite_val: float
    in_situ_val: float
    model_val: float
    residual: float
    date: str

class SatelliteMatchupResponse(BaseModel):
    satellite_layer: str
    in_situ_platform: str
    numerical_model: str
    variable: str
    sample_count: int
    correlation_satellite_insitu: float
    correlation_model_insitu: float
    rmse_satellite_insitu: float
    rmse_model_insitu: float
    mean_bias_satellite: float
    points: List[MatchupDataPoint]
