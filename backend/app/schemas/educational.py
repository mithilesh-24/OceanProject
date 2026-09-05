from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TourStep(BaseModel):
    step_number: int
    title: str
    description: str
    target_lat: float
    target_lon: float
    camera_altitude_m: float
    camera_pitch_deg: float
    highlight_layer: str
    phenomenon_explained: str
    interactive_prompt: Optional[str] = None

class EducationalModule(BaseModel):
    id: str
    title: str
    subtitle: str
    difficulty_level: str  # "Beginner", "Intermediate", "Advanced"
    duration_minutes: int
    category: str
    cover_gradient: str
    summary: str
    key_takeaways: List[str]
    tour_steps: List[TourStep]
    interactive_simulation_type: Optional[str] = None
    quiz_questions: List[Dict[str, Any]] = Field(default_factory=list)

class EducationalModulesResponse(BaseModel):
    total: int
    modules: List[EducationalModule]
