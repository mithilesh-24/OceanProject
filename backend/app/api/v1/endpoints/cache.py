from fastapi import APIRouter, Query
from typing import Dict, Any, Optional
from app.services.cache_service import cache_service

router = APIRouter()

@router.get("/stats")
def get_cache_statistics():
    """Retrieve live multi-tier memory caching statistics, hit ratios, and key counts."""
    return cache_service.get_cache_metrics()

@router.post("/invalidate")
def invalidate_cache(target: Optional[str] = Query("all", description="Target cache subpool to invalidate")):
    """Selectively invalidate memory cache keys and buffers."""
    return cache_service.invalidate_cache(target)
