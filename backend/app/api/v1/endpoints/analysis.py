from fastapi import APIRouter, Depends, Query, Body, HTTPException
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.analysis import AccuracyMetric, ErrorHotspot, AnomalyAlert, SavedWorkspace
from app.schemas.analysis import (
    AccuracyMetricItem, ErrorHotspotItem, AnomalyAlertItem,
    ComparisonRequest, InterComparisonRequest, ComparisonMetricResponse,
    AccuracyBreakdownRequest, SpatialErrorRequest, AnomalyDetectionRequest, StatisticalAnalysisRequest
)
from app.services.ocean_math import compute_ocean_metrics
from app.services.comparison_engine import ComparisonEngine
from app.services.inter_comparison_engine import InterComparisonEngine
from app.services.accuracy_engine import AccuracyEngine
from app.services.error_engine import ErrorAnalysisEngine
from app.services.anomaly_engine import AnomalyDetectionEngine
from app.services.statistical_engine import StatisticalAnalysisEngine

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

# 5. Live Model vs In-Situ Comparison Execution (Phase 9)
@router.post("/comparison")
def run_comparison(req: ComparisonRequest = Body(...), db: Session = Depends(get_db)):
    results = ComparisonEngine.run_comparison_pipeline(
        model_id=req.model,
        obs_type=req.observation,
        variable=req.variable,
        region=req.region or "indian_ocean",
        db=db
    )
    return results

# 6. Live Numerical Model vs Model Inter-Comparison Execution (Phase 10)
@router.post("/inter-comparison")
def run_inter_comparison(req: InterComparisonRequest = Body(...)):
    try:
        results = InterComparisonEngine.run_inter_comparison(
            model_a=req.model_a,
            model_b=req.model_b,
            variable=req.variable,
            depth_m=req.depth,
            region=req.region,
            transect_name=req.transect or "equator"
        )
        return results
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inter-comparison engine error: {str(e)}")

# 7. Phase 11: Multidimensional Accuracy Breakdown & Taylor Coordinates
@router.post("/accuracy/breakdown")
def compute_accuracy_breakdown(req: AccuracyBreakdownRequest = Body(...)):
    try:
        results = AccuracyEngine.compute_accuracy_breakdown(
            model=req.model,
            variable=req.variable,
            region=req.region,
            season=req.season or "all"
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Accuracy engine error: {str(e)}")

# 8. Phase 12: Spatial 2D Errors, Regional Ranking, Outliers & Lead-Time Degradation
@router.post("/errors/spatial-temporal")
def compute_spatial_temporal_errors(req: SpatialErrorRequest = Body(...)):
    try:
        results = ErrorAnalysisEngine.compute_spatial_temporal_errors(
            model=req.model,
            variable=req.variable,
            depth=req.depth,
            region=req.region,
            time_horizon_days=req.time_horizon_days or 10
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analysis engine error: {str(e)}")

# 9. Phase 13: Oceanographic Anomaly & Marine Heatwave Detection
@router.post("/anomalies/detect")
def detect_ocean_anomalies(req: AnomalyDetectionRequest = Body(...)):
    try:
        results = AnomalyDetectionEngine.detect_anomalies(
            variable=req.variable,
            region=req.region,
            depth=req.depth,
            category_filter=req.category_filter or "all",
            mhw_threshold_percentile=req.mhw_threshold_percentile or 90.0
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection engine error: {str(e)}")

# 10. Phase 14: Comprehensive Statistical Analysis, Trends & Correlation
@router.post("/statistics/comprehensive")
def compute_statistics(req: StatisticalAnalysisRequest = Body(...)):
    try:
        results = StatisticalAnalysisEngine.compute_comprehensive_statistics(
            model=req.model,
            variable=req.variable,
            region=req.region,
            depth=req.depth
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Statistical analysis engine error: {str(e)}")
