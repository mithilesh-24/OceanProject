from fastapi import APIRouter, Query
from typing import List, Optional
from app.schemas.satellite import SatelliteLayer, SatelliteMatchupResponse
from app.services.satellite_service import satellite_service

router = APIRouter()

@router.get("/layers", response_model=List[SatelliteLayer])
def get_satellite_layers():
    """List available satellite remote sensing layers (MODIS SST, Sentinel-3 SLA, OLCI Chl-a)."""
    return satellite_service.get_satellite_layers()

@router.get("/matchup", response_model=SatelliteMatchupResponse)
def get_satellite_matchup(
    satellite_id: Optional[str] = Query("sat-modis-sst", description="Satellite layer identifier")
):
    """Generate satellite vs in-situ Argo vs HYCOM matchup regression and residuals."""
    return satellite_service.generate_matchup_validation(satellite_id=satellite_id)
