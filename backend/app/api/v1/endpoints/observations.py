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
def get_glider_missions(db: Session = Depends(get_db)):
    return db.query(GliderMission).all()

# 3. Moored Buoys
@router.get("/buoys", response_model=List[MooredBuoyItem])
def get_moored_buoys(db: Session = Depends(get_db)):
    return db.query(MooredBuoy).all()

# 4. CTD Casts
@router.get("/ctd", response_model=List[CtdCastItem])
def get_ctd_casts(db: Session = Depends(get_db)):
    return db.query(CtdCast).all()

# 5. ADCP Current Profilers
@router.get("/adcp", response_model=List[AdcpStationItem])
def get_adcp_stations(db: Session = Depends(get_db)):
    return db.query(AdcpStation).all()
