from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class GlobeAction(BaseModel):
    action_type: str  # "FLY_TO", "SET_LAYER", "FILTER_VARIABLE", "OPEN_DRAWER", "SWITCH_VIEW"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    altitude_m: Optional[float] = None
    variable: Optional[str] = None
    model: Optional[str] = None
    target_path: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)

class CopilotQuery(BaseModel):
    message: str
    context_view: Optional[str] = "explorer"  # "explorer", "comparison", "accuracy", "anomalies", "statistics"
    active_model: Optional[str] = "hycom"
    active_variable: Optional[str] = "temperature"
    active_depth: Optional[float] = 0.0

class CopilotResponse(BaseModel):
    answer_markdown: str
    intent_detected: str
    confidence: float
    scientific_insights: List[str]
    suggested_followups: List[str]
    globe_actions: List[GlobeAction]
    related_metrics: Optional[Dict[str, Any]] = None
