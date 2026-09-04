from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class HealthResponse(BaseModel):
    status: str
    version: str
    project: str
    database: str
    timestamp: datetime

class SubsystemStatus(BaseModel):
    name: str
    status: str
    latency_ms: float
    details: Optional[str] = None

class SystemStatusResponse(BaseModel):
    overall_status: str
    subsystems: list[SubsystemStatus]
    uptime_pct: float
    active_sessions: int
    db_records_total: int
