from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.model_data import NumericalModel
from app.services.model_subsetter import ModelSubsetter

router = APIRouter()

@router.get("")
def get_numerical_models(db: Session = Depends(get_db)):
    """Returns list of all available numerical circulation models with metadata."""
    models = db.query(NumericalModel).all()
    return [
        {
            "id": m.id,
            "name": m.name,
            "resolution": m.resolution,
            "levels_count": m.levels_count,
            "coordinate_type": m.coordinate_type,
            "provider": m.provider,
            "description": m.description,
            "update_frequency": m.update_frequency,
            "skill_score": m.skill_score,
            "parameters": m.parameters,
            "layers_metadata": m.layers_metadata
        }
        for m in models
    ]

@router.get("/{model_id}")
def get_model_detail(model_id: str, db: Session = Depends(get_db)):
    """Returns comprehensive model metadata, coordinate scheme, and vertical layers."""
    m = db.query(NumericalModel).filter(NumericalModel.id == model_id.lower()).first()
    if not m:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found")
    return {
        "id": m.id,
        "name": m.name,
        "resolution": m.resolution,
        "levels_count": m.levels_count,
        "coordinate_type": m.coordinate_type,
        "provider": m.provider,
        "description": m.description,
        "update_frequency": m.update_frequency,
        "skill_score": m.skill_score,
        "parameters": m.parameters,
        "layers_metadata": m.layers_metadata,
        "depth_levels": ModelSubsetter.get_depth_levels(m.id)
    }

@router.get("/{model_id}/levels")
def get_model_levels(model_id: str):
    """Returns standard depth levels available for subsetting."""
    valid_models = ["hycom", "roms", "nemo"]
    if model_id.lower() not in valid_models:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not supported")
    return {
        "model_id": model_id.lower(),
        "depth_levels": ModelSubsetter.get_depth_levels(model_id.lower())
    }

@router.get("/{model_id}/slice")
def get_model_slice(
    model_id: str,
    variable: str = Query("temperature", description="Variable: temperature, salinity, velocity, ssh"),
    depth: float = Query(0.0, description="Depth level in meters (e.g. 0, 50, 100, 500, 2000)"),
    date: Optional[str] = Query(None, description="ISO timestamp date"),
    min_lat: Optional[float] = Query(None),
    min_lon: Optional[float] = Query(None),
    max_lat: Optional[float] = Query(None),
    max_lon: Optional[float] = Query(None),
):
    """
    Subsets a 2D horizontal spatial grid slice without streaming massive NetCDF files to client.
    Returns structured 2D value matrix, min/max bounds, contour levels, and current vectors.
    """
    valid_models = ["hycom", "roms", "nemo"]
    if model_id.lower() not in valid_models:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found")
    
    bbox = None
    if None not in [min_lat, min_lon, max_lat, max_lon]:
        bbox = [min_lat, min_lon, max_lat, max_lon]

    slice_data = ModelSubsetter.generate_horizontal_slice(
        model_id=model_id.lower(),
        variable=variable,
        depth_m=depth,
        date_str=date,
        bbox=bbox
    )
    return slice_data

@router.get("/{model_id}/profile")
def get_model_point_profile(
    model_id: str,
    lat: float = Query(14.28, description="Latitude (-15 to 30)"),
    lon: float = Query(87.45, description="Longitude (40 to 105)"),
    variable: str = Query("temperature", description="Variable: temperature, salinity, velocity")
):
    """
    Extracts a 1D vertical depth profile at coordinate (lat, lon) with MLD and thermocline depth.
    """
    valid_models = ["hycom", "roms", "nemo"]
    if model_id.lower() not in valid_models:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found")

    return ModelSubsetter.get_point_depth_profile(
        model_id=model_id.lower(),
        lat=lat,
        lon=lon,
        variable=variable
    )

@router.get("/{model_id}/transect")
def get_model_vertical_transect(
    model_id: str,
    transect: str = Query("equator", description="Section: 'equator', 'bob_meridional', 'arabian_zonal'"),
    variable: str = Query("temperature", description="Variable: temperature, salinity, velocity")
):
    """
    Generates 2D vertical cross-section transect (Distance vs Depth) along major oceanographic sections.
    """
    valid_models = ["hycom", "roms", "nemo"]
    if model_id.lower() not in valid_models:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found")

    return ModelSubsetter.generate_vertical_transect(
        model_id=model_id.lower(),
        transect_name=transect,
        variable=variable
    )
