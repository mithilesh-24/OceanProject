from fastapi import APIRouter, Query
from typing import Dict, Any, Optional
from app.services.eddy_engine import eddy_engine

router = APIRouter()

@router.get("")
def get_active_eddies(
    region: Optional[str] = Query(None, description="Region: arabian_sea, bay_of_bengal, somali_coast, sri_lanka"),
    eddy_type: Optional[str] = Query("ALL", description="ALL, CYCLONIC, ANTICYCLONIC")
):
    """Retrieve active mesoscale eddies identified via Okubo-Weiss vortex criterion."""
    return eddy_engine.get_active_eddies(region=region, eddy_type=eddy_type)

@router.get("/tracks")
def get_eddy_tracks(
    eddy_id: Optional[str] = Query(None, description="Specific eddy ID")
):
    """Retrieve drift trajectory history for tracked vortices."""
    return eddy_engine.get_eddy_tracks(eddy_id=eddy_id)

@router.get("/{eddy_id}/kinematics")
def get_eddy_kinematics(eddy_id: str):
    """Retrieve vertical core kinematics and thermal anomaly profile."""
    return eddy_engine.get_eddy_kinematics(eddy_id=eddy_id)
