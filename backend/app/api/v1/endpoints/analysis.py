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
@router.post("/comparison", response_model=ComparisonMetricResponse)
def run_comparison(req: ComparisonRequest = Body(...)):
    # Benchmark synthetic in-situ vs model series
    obs_vals = [28.92, 28.85, 27.20, 24.10, 21.00, 16.50, 14.20, 10.10, 6.50, 2.40]
    # Model predictions with slight simulated variance
    if req.model == "hycom":
        pred_vals = [29.04, 28.95, 27.10, 23.85, 20.80, 16.30, 14.30, 10.15, 6.55, 2.45]
    elif req.model == "roms":
        pred_vals = [28.90, 28.80, 27.05, 24.00, 20.90, 16.45, 14.15, 10.05, 6.48, 2.38]
    else: # nemo
        pred_vals = [29.10, 29.00, 27.35, 24.25, 21.15, 16.65, 14.35, 10.20, 6.60, 2.50]

    metrics = compute_ocean_metrics(obs_vals, pred_vals)

    layer_breakdown = [
        {"layer": "0 – 50 m (Surface Mixed Layer)", "pairs": 1840, "obsMean": "28.92 °C", "modelMean": "29.04 °C", "rmse": "0.34 °C", "bias": "+0.12 °C", "willmott": "0.978", "status": "High Agreement"},
        {"layer": "50 – 150 m (Upper Thermocline)", "pairs": 1820, "obsMean": "24.15 °C", "modelMean": "23.88 °C", "rmse": "0.62 °C", "bias": "-0.27 °C", "willmott": "0.945", "status": "Good Agreement"},
        {"layer": "150 – 300 m (Lower Thermocline)", "pairs": 1790, "obsMean": "17.40 °C", "modelMean": "17.28 °C", "rmse": "0.48 °C", "bias": "-0.12 °C", "willmott": "0.962", "status": "High Agreement"},
        {"layer": "300 – 500 m (Intermediate Water)", "pairs": 1750, "obsMean": "11.80 °C", "modelMean": "11.84 °C", "rmse": "0.28 °C", "bias": "+0.04 °C", "willmott": "0.985", "status": "High Agreement"},
    ]

    return ComparisonMetricResponse(
        mean_bias=metrics["mean_bias"],
        mae=metrics["mae"],
        rmse=metrics["rmse"],
        pearson_r=metrics["pearson_r"],
        r2_score=metrics["r2_score"],
        sample_pairs=metrics["sample_pairs"],
        willmott_index=metrics["willmott_index"],
        layer_breakdown=layer_breakdown
    )
