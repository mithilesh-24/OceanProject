from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class AnalysisFilterState(BaseModel):
    selected_model: Optional[str] = "hycom"
    comparison_model: Optional[str] = "roms"
    selected_variable: Optional[str] = "temperature"
    depth_level: Optional[float] = 0.0
    region: Optional[str] = "indian_ocean"
    time_range: Optional[Dict[str, str]] = None
    lat_bounds: Optional[List[float]] = [-40.0, 30.0]
    lon_bounds: Optional[List[float]] = [30.0, 120.0]
    active_chart_types: Optional[List[str]] = Field(default_factory=list)
    custom_parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)

class SavedWorkspaceCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    category: str = "comparison"  # "comparison", "accuracy", "error", "anomaly", "statistical", "custom"
    tags: List[str] = Field(default_factory=list)
    state: AnalysisFilterState
    author: Optional[str] = "Oceanographer"
    is_public: Optional[bool] = True

class SavedWorkspaceItem(BaseModel):
    id: str
    title: str
    description: str
    category: str
    tags: List[str]
    state: AnalysisFilterState
    author: str
    is_public: bool
    created_at: datetime
    updated_at: datetime
    view_count: int = 0
    star_count: int = 0

class WorkspaceListResponse(BaseModel):
    total: int
    workspaces: List[SavedWorkspaceItem]
