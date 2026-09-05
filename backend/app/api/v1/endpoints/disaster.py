from fastapi import APIRouter, Query
from typing import Dict, Any, Optional
from app.services.disaster_engine import disaster_engine

router = APIRouter()

@router.get("/active")
def get_active_disaster_threats(
    basin: Optional[str] = Query(None, description="Optional basin filter: arabian_sea, bay_of_bengal")
):
    """Retrieve active cyclone tracks, modeled storm surge inundation, and district threat indices."""
    return disaster_engine.get_active_threats(basin=basin)

@router.get("/coastal-threats")
def get_coastal_threat_details(
    district: Optional[str] = Query(None, description="Specific coastal district name")
):
    """Retrieve district vulnerability profile and combined surge-tide levels."""
    return disaster_engine.get_coastal_threat_details(district_name=district)
