from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PipelineHealthItem(BaseModel):
    id: str
    name: str
    protocol: str
    source_agency: str
    cron_schedule: str
    status: str  # "OPERATIONAL", "SYNCING", "DEGRADED", "ERROR"
    last_sync: str
    next_sync: str
    latency_ms: int
    records_harvested_24h: int
    error_rate_pct: float
    health_score: float

class SystemTelemetryResponse(BaseModel):
    server_time: str
    uptime_seconds: int
    cpu_utilization_pct: float
    memory_usage_mb: float
    memory_total_mb: float
    cache_hit_ratio_pct: float
    active_connections: int
    db_profiles_count: int
    api_requests_24h: int
    pipelines: List[PipelineHealthItem]
    disk_storage_gb: Dict[str, float]
