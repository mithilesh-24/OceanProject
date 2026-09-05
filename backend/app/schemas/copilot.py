from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from enum import Enum

class ProvenanceType(str, Enum):
    OBSERVATION = "OBSERVATION"
    MODEL_OUTPUT = "MODEL_OUTPUT"
    DERIVED_ANALYSIS = "DERIVED_ANALYSIS"
    FORECAST = "FORECAST"
    OFFICIAL_ALERT = "OFFICIAL_ALERT"
    DEMO_PLACEHOLDER = "DEMO_PLACEHOLDER"

class CesiumActionType(str, Enum):
    GO_TO_LOCATION = "GO_TO_LOCATION"
    GO_TO_REGION = "GO_TO_REGION"
    SHOW_LAYER = "SHOW_LAYER"
    HIDE_LAYER = "HIDE_LAYER"
    SET_PLATFORM_FILTER = "SET_PLATFORM_FILTER"
    SET_MODEL = "SET_MODEL"
    SET_VARIABLE = "SET_VARIABLE"
    SET_DEPTH = "SET_DEPTH"
    SET_TIME = "SET_TIME"
    SELECT_PLATFORM = "SELECT_PLATFORM"
    SELECT_EDDY = "SELECT_EDDY"
    RUN_ANALYSIS = "RUN_ANALYSIS"
    OPEN_PANEL = "OPEN_PANEL"
    SHOW_RESULTS = "SHOW_RESULTS"
    RESET_VIEW = "RESET_VIEW"
    NAVIGATE_ROUTE = "NAVIGATE_ROUTE"
    OPEN_VIEW = "OPEN_VIEW"

class StructuredCesiumAction(BaseModel):
    type: CesiumActionType
    payload: Dict[str, Any] = Field(default_factory=dict)
    description: Optional[str] = None

class ToolCallRecord(BaseModel):
    tool_name: str
    tool_args: Dict[str, Any] = Field(default_factory=dict)
    tool_result: Optional[Any] = None
    provenance: ProvenanceType = ProvenanceType.DERIVED_ANALYSIS
    status: Literal["SUCCESS", "DATA_NOT_CONFIGURED", "MODEL_NOT_CONFIGURED", "OFFICIAL_FEED_NOT_CONFIGURED", "ERROR"] = "SUCCESS"
    execution_time_ms: float = 0.0

class CopilotChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str

class CopilotClientContext(BaseModel):
    current_route: Optional[str] = "/explorer"
    selected_model: Optional[str] = "hycom"
    selected_variable: Optional[str] = "temperature"
    selected_depth: Optional[float] = 0.0
    selected_time: Optional[str] = None
    selected_platform_id: Optional[str] = None
    current_region: Optional[str] = "indian_ocean"
    enabled_layers: List[str] = Field(default_factory=list)

class CopilotChatRequest(BaseModel):
    message: str
    history: List[CopilotChatMessage] = Field(default_factory=list)
    context: CopilotClientContext = Field(default_factory=CopilotClientContext)

class CopilotChatResponse(BaseModel):
    message: str
    structured_actions: List[StructuredCesiumAction] = Field(default_factory=list)
    tool_calls: List[ToolCallRecord] = Field(default_factory=list)
    provenance: ProvenanceType = ProvenanceType.DERIVED_ANALYSIS
    model_provider: str = "nvidia"
    model_name: str = "openai/gpt-oss-20b"
    suggested_prompts: List[str] = Field(default_factory=list)

# Backward compatibility models
class GlobeAction(BaseModel):
    action_type: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    altitude_m: Optional[float] = None
    variable: Optional[str] = None
    model: Optional[str] = None
    target_path: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)

class CopilotQuery(BaseModel):
    message: str
    context_view: Optional[str] = "explorer"
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
