from fastapi import APIRouter, HTTPException, Path, Query
from typing import Dict, Any, Optional
from app.schemas.admin_telemetry import SystemTelemetryResponse
from app.services.admin_service import admin_service

router = APIRouter()

@router.get("/health/telemetry", response_model=SystemTelemetryResponse)
def get_system_telemetry():
    """Get live operational health, harvester cron latency, and ingestion status across all feeds."""
    return admin_service.get_system_telemetry()

@router.post("/pipelines/{pipeline_id}/trigger")
def trigger_pipeline_sync(pipeline_id: str = Path(..., description="ID of the pipeline to trigger")):
    """Manually initiate an asynchronous harvester sync for a telemetry feed."""
    return admin_service.trigger_pipeline_sync(pipeline_id)

@router.post("/cache/flush")
def flush_platform_cache(target: Optional[str] = Query("all", description="Cache target: all, tiles, profiles, models")):
    """Flush stale memory cache keys and tile buffers."""
    return admin_service.flush_cache(target)
