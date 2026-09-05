from fastapi import APIRouter, Query
from typing import Dict, Any, Optional
from app.services.spatiotemporal_engine import SpatiotemporalEngine

router = APIRouter()

@router.get("/timeline")
def get_timeline():
    """Returns spatiotemporal timeline bounds, milestone events, and step metadata."""
    return SpatiotemporalEngine.get_timeline_metadata()

@router.get("/depth-layers")
def get_depth_layers():
    """Returns 3D depth level specifications, isosurfaces, and water mass boundaries."""
    return SpatiotemporalEngine.get_depth_layers()

@router.get("/state-at-time")
def get_state_at_time(
    timestamp: str = Query("2026-09-04T12:00:00Z", description="ISO format datetime"),
    variable: str = Query("temperature", description="Variable: temperature, salinity, currents, ssh"),
    depth: float = Query(0.0, description="Depth level in meters")
):
    """
    Returns synchronous 4D state snapshot of all observation platforms, drift trails,
    and model background values at the specified timestamp.
    """
    return SpatiotemporalEngine.get_state_at_time(
        timestamp_str=timestamp,
        variable=variable,
        depth_m=depth
    )
