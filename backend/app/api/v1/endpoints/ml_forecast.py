from fastapi import APIRouter, Query
from typing import Dict, Any, Optional
from app.services.ml_forecast_engine import ml_forecast_engine

router = APIRouter()

@router.get("/prediction")
def get_ml_prediction(
    variable: str = Query("temperature", description="Variable: temperature, salinity, ssh, d20_thermocline"),
    lead_time_hours: int = Query(24, description="Forecast lead time: 12, 24, 48, 72 hours")
):
    """Retrieve fast ocean state prediction or unconfigured surrogate status."""
    return ml_forecast_engine.get_prediction(variable=variable, lead_time_hours=lead_time_hours)

@router.get("/metrics")
def get_ml_metrics():
    """Retrieve surrogate architecture specifications and baseline benchmark skill."""
    return ml_forecast_engine.get_forecast_metrics()
