from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.schemas.export import (
    DataExportRequest,
    BulletinReportRequest,
    ExportDownloadResponse
)
from app.services.export_service import export_service

router = APIRouter()

@router.post("/data", response_model=ExportDownloadResponse)
def export_ocean_data(payload: DataExportRequest):
    """Generate structured multi-format data export (CSV, JSON, GeoJSON)."""
    return export_service.generate_data_export(payload)

@router.post("/bulletin")
def export_scientific_bulletin(payload: BulletinReportRequest):
    """Generate executive/scientific report bulletin with Taylor skill scores and anomaly alerts."""
    return export_service.generate_bulletin_report(payload)
