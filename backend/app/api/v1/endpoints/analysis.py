from fastapi import APIRouter, Depends, Query, Body
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.analysis import AccuracyMetric, ErrorHotspot, AnomalyAlert, SavedWorkspace
from app.schemas.analysis import (
    AccuracyMetricItem, ErrorHotspotItem, AnomalyAlertItem,
    ComparisonRequest, ComparisonMetricResponse
)
from app.services.ocean_math import compute_ocean_metrics
from app.services.comparison_engine import ComparisonEngine

router = APIRouter()

# 1. Accuracy metrics
@router.get("/accuracy", response_model=List[AccuracyMetricItem])
def get_accuracy_metrics(
    model: Optional[str] = None,
    basin: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(AccuracyMetric)
    if model and model != "all":
        q = q.filter(AccuracyMetric.model_name.ilike(f"%{model}%"))
    if basin and basin != "all":
        q = q.filter(AccuracyMetric.basin.ilike(f"%{basin}%"))
    return q.all()

# 2. Error Hotspots
@router.get("/errors", response_model=List[ErrorHotspotItem])
def get_error_hotspots(db: Session = Depends(get_db)):
    return db.query(ErrorHotspot).all()

# 3. Anomaly Alerts
@router.get("/anomalies", response_model=List[AnomalyAlertItem])
def get_anomalies(db: Session = Depends(get_db)):
    return db.query(AnomalyAlert).all()

# 4. Saved Workspaces
@router.get("/saved")
def get_saved_workspaces(db: Session = Depends(get_db)):
    workspaces = db.query(SavedWorkspace).all()
    return [
        {
            "id": w.id,
            "name": w.name,
            "model": w.model,
            "obs": w.observation,
            "variables": w.variables,
            "region": w.region,
            "depth": w.depth_band,
            "samples": w.sample_count,
            "date": w.saved_date,
            "rmse": w.computed_rmse,
            "bias": w.computed_bias
        }
        for w in workspaces
    ]

# 5. Live Model vs In-Situ Comparison Execution
@router.post("/comparison")
def run_comparison(req: ComparisonRequest = Body(...), db: Session = Depends(get_db)):
    """
    Runs spatial, temporal, and depth matching between selected model and in-situ observations.
    Calculates statistical validation metrics, scatter pairs, depth curves, and error histograms.
    """
    results = ComparisonEngine.run_comparison_pipeline(
        model_id=req.model,
        obs_type=req.observation,
        variable=req.variable,
        region=req.region or "indian_ocean",
        db=db
    )
    return results

