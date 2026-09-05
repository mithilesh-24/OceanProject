from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DataExportRequest(BaseModel):
    export_format: str = "csv"  # "csv", "json", "geojson", "netcdf4", "geotiff"
    data_source: str = "argo"  # "argo", "hycom", "roms", "nemo", "comparison", "anomalies", "errors"
    variable: str = "temperature"
    region: str = "indian_ocean"
    depth_m: Optional[float] = 0.0
    start_date: Optional[str] = "2024-01-01"
    end_date: Optional[str] = "2024-01-10"
    lat_min: Optional[float] = -35.0
    lat_max: Optional[float] = 25.0
    lon_min: Optional[float] = 40.0
    lon_max: Optional[float] = 110.0
    include_metadata: bool = True

class BulletinReportRequest(BaseModel):
    title: str = "Indian Ocean Hydrodynamic & Thermal State Bulletin"
    report_type: str = "executive"  # "executive", "scientific", "anomaly_alert", "validation"
    model: str = "hycom"
    variable: str = "temperature"
    region: str = "indian_ocean"
    include_taylor_metrics: bool = True
    include_mhw_alerts: bool = True
    include_regional_rankings: bool = True
    format: str = "json"  # "json", "markdown", "pdf_summary"

class ExportDownloadResponse(BaseModel):
    filename: str
    content_type: str
    file_size_bytes: int
    record_count: int
    data_payload: Any
    generated_at: str
    download_url: Optional[str] = None
    checksum_sha256: str
