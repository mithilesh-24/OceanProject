from fastapi import APIRouter, Query
from typing import Dict, Any, Optional
from app.services.bgc_engine import bgc_engine

router = APIRouter()

@router.get("/parameters")
def get_bgc_parameters(
    region: Optional[str] = Query(None, description="Optional region: arabian_sea, bay_of_bengal, equatorial_io")
):
    """Retrieve basin-scale biogeochemical and ocean acidification metrics."""
    return bgc_engine.get_basin_parameters(region=region)

@router.get("/omz")
def get_omz_extent(
    basin: str = Query("arabian_sea", description="arabian_sea or bay_of_bengal"),
    depth_m: float = Query(200.0, description="Depth slice in meters")
):
    """Retrieve Oxygen Minimum Zone spatial boundaries and hypoxic volume."""
    return bgc_engine.get_omz_extent(basin=basin, depth_m=depth_m)

@router.get("/profile")
def get_bgc_depth_profile(
    latitude: float = Query(18.0, description="Latitude"),
    longitude: float = Query(65.0, description="Longitude")
):
    """Retrieve vertical depth profile of DO, pH, and Aragonite saturation."""
    return bgc_engine.get_bgc_depth_profile(latitude=latitude, longitude=longitude)
