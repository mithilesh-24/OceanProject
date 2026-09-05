from fastapi import APIRouter, Query, Body
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.services.routing_engine import routing_engine

router = APIRouter()

class RouteOptimizationRequest(BaseModel):
    origin: str = "Chennai"
    destination: str = "Singapore"
    vessel_type: str = "container_ultra"
    cruise_speed_knots: float = 18.5

@router.get("/corridors")
def get_shipping_corridors():
    """Retrieve standard Indian Ocean navigation corridors."""
    return routing_engine.get_corridors()

@router.post("/optimize")
def calculate_optimal_route(payload: RouteOptimizationRequest):
    """Compute current & wave-optimized voyage track and fuel savings."""
    return routing_engine.calculate_optimal_route(
        origin=payload.origin,
        destination=payload.destination,
        vessel_type=payload.vessel_type,
        cruise_speed_knots=payload.cruise_speed_knots
    )
