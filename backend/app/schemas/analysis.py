from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class AccuracyMetricItem(BaseModel):
    basin: str
    model_name: str
    variable: str
    willmott_index: float
    rmse: float
    mae: float
    r2_score: float
    mean_bias: float
    skill_rating: str
    sample_pairs: int

    class Config:
        from_attributes = True

class ErrorHotspotItem(BaseModel):
    region_name: str
    coords_bounds: str
    model_name: str
    variable: str
    max_error: str
    rmse: float
    bias: float
    root_cause: str
    severity: str

    class Config:
        from_attributes = True

class AnomalyAlertItem(BaseModel):
    id: str
    alert_type: str
    region: str
    amplitude: str
    depth_layer: str
    sensor_origin: str
    duration: str
    severity: str

    class Config:
        from_attributes = True

class ComparisonRequest(BaseModel):
    model: str = "hycom"
    observation: str = "argo"
    variable: str = "temp"
    region: str = "indian_ocean"
    depth_layer: Optional[str] = "0-500"

class InterComparisonRequest(BaseModel):
    model_a: str = "hycom"
    model_b: str = "roms"
    variable: str = "temperature"
    depth: float = 0.0
    region: str = "indian_ocean"
    transect: Optional[str] = "equator"

class ComparisonMetricResponse(BaseModel):
    mean_bias: float
    mae: float
    rmse: float
    pearson_r: float
    r2_score: float
    sample_pairs: int
    willmott_index: float
    layer_breakdown: List[Dict[str, Any]]

