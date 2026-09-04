from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.observation import ArgoFloat, GliderMission, MooredBuoy, CtdCast, AdcpStation
from app.schemas.observation import (
    ArgoFloatItem, GliderMissionItem, MooredBuoyItem, CtdCastItem, AdcpStationItem
)

router = APIRouter()

# 1. Argo Floats (with spatial bounding box & depth filter)
@router.get("/argo", response_model=List[ArgoFloatItem])
def get_argo_floats(
    wmo: Optional[str] = None,
    basin: Optional[str] = None,
    status: Optional[str] = None,
    min_lat: Optional[float] = None,
    max_lat: Optional[float] = None,
    min_lon: Optional[float] = None,
    max_lon: Optional[float] = None,
    max_depth: Optional[float] = None,
    db: Session = Depends(get_db)
):
    q = db.query(ArgoFloat)
    if wmo:
        q = q.filter(ArgoFloat.wmo_id.contains(wmo))
    if basin:
        q = q.filter(ArgoFloat.basin.ilike(f"%{basin}%"))
    if status:
        q = q.filter(ArgoFloat.status.ilike(f"%{status}%"))
    if min_lat is not None:
        q = q.filter(ArgoFloat.latitude >= min_lat)
    if max_lat is not None:
        q = q.filter(ArgoFloat.latitude <= max_lat)
    if min_lon is not None:
        q = q.filter(ArgoFloat.longitude >= min_lon)
    if max_lon is not None:
        q = q.filter(ArgoFloat.longitude <= max_lon)
    if max_depth is not None:
        q = q.filter(ArgoFloat.max_depth <= max_depth)
    return q.all()

@router.get("/argo/{wmo_id}", response_model=ArgoFloatItem)
def get_argo_float_detail(wmo_id: str, db: Session = Depends(get_db)):
    float_obj = db.query(ArgoFloat).filter(ArgoFloat.wmo_id == wmo_id).first()
    if not float_obj:
        raise HTTPException(status_code=404, detail=f"Argo float #{wmo_id} not found")
    return float_obj

# 2. Gliders
@router.get("/gliders", response_model=List[GliderMissionItem])
def get_glider_missions(
    query: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(GliderMission)
    if query:
        q = q.filter((GliderMission.id.ilike(f"%{query}%")) | (GliderMission.mission_name.ilike(f"%{query}%")) | (GliderMission.platform_name.ilike(f"%{query}%")))
    if status:
        q = q.filter(GliderMission.status.ilike(f"%{status}%"))
    return q.all()

@router.get("/gliders/{glider_id}", response_model=GliderMissionItem)
def get_glider_detail(glider_id: str, db: Session = Depends(get_db)):
    glider_obj = db.query(GliderMission).filter(GliderMission.id == glider_id).first()
    if not glider_obj:
        raise HTTPException(status_code=404, detail=f"Glider mission #{glider_id} not found")
    return glider_obj

# 3. Moored Buoys
@router.get("/buoys", response_model=List[MooredBuoyItem])
def get_moored_buoys(
    network: Optional[str] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(MooredBuoy)
    if network:
        q = q.filter(MooredBuoy.network.ilike(f"%{network}%"))
    if query:
        q = q.filter((MooredBuoy.station_id.ilike(f"%{query}%")) | (MooredBuoy.location_name.ilike(f"%{query}%")))
    return q.all()

@router.get("/buoys/{station_id}", response_model=MooredBuoyItem)
def get_moored_buoy_detail(station_id: str, db: Session = Depends(get_db)):
    buoy_obj = db.query(MooredBuoy).filter(MooredBuoy.station_id == station_id).first()
    if not buoy_obj:
        raise HTTPException(status_code=404, detail=f"Moored buoy #{station_id} not found")
    return buoy_obj

# 4. CTD Casts
@router.get("/ctd", response_model=List[CtdCastItem])
def get_ctd_casts(
    vessel: Optional[str] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(CtdCast)
    if vessel:
        q = q.filter(CtdCast.vessel.ilike(f"%{vessel}%"))
    if query:
        q = q.filter((CtdCast.cast_id.ilike(f"%{query}%")) | (CtdCast.station_name.ilike(f"%{query}%")))
    return q.all()

@router.get("/ctd/{cast_id}", response_model=CtdCastItem)
def get_ctd_cast_detail(cast_id: str, db: Session = Depends(get_db)):
    cast_obj = db.query(CtdCast).filter(CtdCast.cast_id == cast_id).first()
    if not cast_obj:
        raise HTTPException(status_code=404, detail=f"CTD cast #{cast_id} not found")
    return cast_obj

# 5. ADCP Current Profilers
@router.get("/adcp", response_model=List[AdcpStationItem])
def get_adcp_stations(
    mooring: Optional[str] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(AdcpStation)
    if mooring:
        q = q.filter(AdcpStation.mooring_array.ilike(f"%{mooring}%"))
    if query:
        q = q.filter((AdcpStation.station_id.ilike(f"%{query}%")) | (AdcpStation.location_desc.ilike(f"%{query}%")))
    return q.all()

@router.get("/adcp/{station_id}", response_model=AdcpStationItem)
def get_adcp_station_detail(station_id: str, db: Session = Depends(get_db)):
    station_obj = db.query(AdcpStation).filter(AdcpStation.station_id == station_id).first()
    if not station_obj:
        raise HTTPException(status_code=404, detail=f"ADCP station #{station_id} not found")
    return station_obj

