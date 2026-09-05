from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class OceanAlert(BaseModel):
    id: str
    title: str
    severity: str  # "CRITICAL", "WARNING", "INFO"
    category: str  # "MHW", "SALINITY", "SENSOR_OFFLINE", "MODEL_BIAS", "CYCLONE"
    basin: str
    latitude: float
    longitude: float
    trigger_value: str
    threshold_value: str
    description: str
    impact: str
    status: str  # "ACTIVE", "ACKNOWLEDGED", "RESOLVED"
    created_at: str
    duration_days: int = 1
    actions: List[Dict[str, str]] = Field(default_factory=list)

class AlertRule(BaseModel):
    rule_id: str
    name: str
    category: str
    condition: str
    threshold: float
    units: str
    is_enabled: bool = True
    cooldown_hours: int = 24

class AlertsListResponse(BaseModel):
    total_active: int
    critical_count: int
    warning_count: int
    alerts: List[OceanAlert]
    rules: List[AlertRule]
