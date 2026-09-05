from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DensityComputationRequest(BaseModel):
    temperature_c: List[float]
    salinity_psu: List[float]
    depth_m: List[float]
    latitude: Optional[float] = 10.0

class DensityStratificationResponse(BaseModel):
    depth_m: List[float]
    potential_density_kg_m3: List[float]
    sigma_theta_kg_m3: List[float]
    buoyancy_frequency_squared_n2: List[float]
    sound_speed_m_s: List[float]
    mixed_layer_depth_m: float
    isothermal_layer_depth_m: float
    barrier_layer_thickness_m: float
    pycnocline_depth_m: float
    maximum_stability_n2: float
    maximum_stability_depth_m: float

class QueryGeneratorRequest(BaseModel):
    query_type: str = "erddap_python"  # "erddap_python", "xarray_hycom", "opendap_curl", "matlab_ctd"
    variable: str = "temp"
    depth_range: List[float] = [0.0, 500.0]
    time_range: List[str] = ["2024-01-01", "2024-01-10"]
    lat_range: List[float] = [-20.0, 25.0]
    lon_range: List[float] = [40.0, 100.0]

class QueryGeneratorResponse(BaseModel):
    language: str
    code_snippet: str
    direct_url: str
    instructions: str
