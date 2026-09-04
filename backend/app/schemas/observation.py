from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class ArgoFloatItem(BaseModel):
    wmo_id: str
    basin: str
    latitude: float
    longitude: float
    cycle_number: int
    last_transmission: datetime
    surface_temp: Optional[float] = None
    surface_sal: Optional[float] = None
    max_depth: float = 2000.0
    status: str
    battery_state: float = 95.0
    institution: str = "INCOIS"
    profile_data: Optional[Any] = None

    class Config:
        from_attributes = True

class GliderMissionItem(BaseModel):
    id: str
    platform_name: str
    mission_name: str
    latitude: float
    longitude: float
    dives_completed: int
    depth_range: str
    battery_pct: int
    sensors: Optional[str] = None
    status: str

    class Config:
        from_attributes = True

class MooredBuoyItem(BaseModel):
    station_id: str
    network: str
    location_name: str
    latitude: float
    longitude: float
    sst: float
    air_temp: Optional[float] = None
    wind_speed: Optional[float] = None
    wave_height: Optional[float] = None
    status: str
    last_update: datetime

    class Config:
        from_attributes = True

class CtdCastItem(BaseModel):
    cast_id: str
    vessel: str
    station_name: str
    latitude: float
    longitude: float
    max_depth: float
    bottles_count: int
    parameters: str
    cruise_date: datetime
    qc_status: str

    class Config:
        from_attributes = True

class AdcpStationItem(BaseModel):
    station_id: str
    mooring_array: str
    location_desc: str
    latitude: float
    longitude: float
    depth_range: str
    acoustic_freq: str
    peak_current: float
    max_shear: float
    status: str

    class Config:
        from_attributes = True
