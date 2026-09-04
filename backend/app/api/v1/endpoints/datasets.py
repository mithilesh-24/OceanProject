from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.dataset import Dataset
from app.schemas.dataset import DatasetResponse

router = APIRouter()

@router.get("", response_model=List[DatasetResponse])
def get_datasets(
    type: Optional[str] = None,
    protocol: Optional[str] = None,
    query: Optional[str] = None,
    variable: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Dataset)
    if type and type != "ALL":
        q = q.filter(Dataset.type == type)
    if protocol and protocol != "ALL":
        q = q.filter(Dataset.protocol == protocol)
    if query:
        search_term = f"%{query.lower()}%"
        q = q.filter(
            (Dataset.name.ilike(search_term)) |
            (Dataset.provider.ilike(search_term)) |
            (Dataset.region.ilike(search_term))
        )
    results = q.all()

    # In-memory filter for JSON variables if requested
    if variable and variable != "ALL":
        results = [d for d in results if any(variable.lower() in v.lower() for v in (d.variables or []))]

    return results

@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found")
    return dataset

@router.get("/{dataset_id}/details")
def get_dataset_details(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found")

    # Expanded metadata specifications
    details: Dict[str, Any] = {
        "id": dataset.id,
        "name": dataset.name,
        "provider": dataset.provider,
        "type": dataset.type,
        "variables": dataset.variables,
        "region": dataset.region,
        "time_coverage": dataset.time_coverage,
        "resolution": dataset.resolution,
        "status": dataset.status,
        "protocol": dataset.protocol,
        "endpoint_url": dataset.endpoint_url,
        "datum": "EPSG:4326 (WGS 84)",
        "bounding_box": {
            "min_lat": -40.0,
            "max_lat": 30.0,
            "min_lon": 30.0,
            "max_lon": 120.0
        },
        "license": "Open Data / Ministry of Earth Sciences (MoES) Public License",
        "sample_query": f"curl -X GET 'http://localhost:8000/api/v1/datasets/{dataset.id}'"
    }

    if dataset.id == "incois_argo":
        details["depth_levels"] = "0 to 2,000 dbar continuous vertical CTD profiles"
        details["harvest_interval"] = "Every 6 Hours from INCOIS ERDDAP"
        details["qc_protocol"] = "Argo QC Manual v3.4 (Real-Time & Delayed Mode)"
    elif dataset.id == "hycom_global":
        details["depth_levels"] = "40 Hybrid isopycnal/z-level vertical coordinate strata"
        details["assimilation"] = "NCODA (Navy Coupled Ocean Data Assimilation 3D-VAR)"
    elif dataset.id == "roms_indian":
        details["depth_levels"] = "32 Terrain-following S-levels with coastal boundary refinement"
    elif dataset.id == "gebco_2023":
        details["grid_spacing"] = "15 arc-second (~450 m horizontal resolution)"
        details["format"] = "GeoTIFF, netCDF, OGC WMS 1.3.0"

    return details
