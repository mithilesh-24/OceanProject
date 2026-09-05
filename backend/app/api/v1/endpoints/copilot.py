from fastapi import APIRouter
from typing import List
from app.schemas.copilot import CopilotQuery, CopilotResponse
from app.services.copilot_engine import copilot_engine

router = APIRouter()

@router.post("/query", response_model=CopilotResponse)
def ask_ocean_copilot(payload: CopilotQuery):
    """Natural language AI query processing for oceanographic analysis and 3D globe actions."""
    return copilot_engine.process_query(payload)

@router.get("/suggested-prompts", response_model=List[str])
def get_suggested_prompts():
    """Retrieve curated prompt ideas for oceanographic queries."""
    return [
        "Explain the active Marine Heatwave in the Central Arabian Sea",
        "What causes the low salinity barrier layer in the Bay of Bengal?",
        "Compare HYCOM vs ROMS skill scores across Indian Ocean depths",
        "Show latest Argo profiling floats with surface SST above 29°C",
        "What is the vertical shear profile of the Equatorial Wyrtki Jet?"
    ]
