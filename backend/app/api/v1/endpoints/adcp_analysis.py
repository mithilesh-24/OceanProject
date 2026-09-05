from fastapi import APIRouter, Query
from typing import Dict, Any, Optional
from app.services.adcp_engine import adcp_engine

router = APIRouter()

@router.get("/vector-field")
def get_adcp_3d_vector_field(
    station_id: Optional[str] = Query("ADCP-EQ01", description="Station identifier")
):
    """Compute 3D velocity vectors (u, v, w), vertical shear profile, and depth transport."""
    return adcp_engine.compute_vector_field(station_id=station_id)
