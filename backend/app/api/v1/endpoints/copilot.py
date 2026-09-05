from fastapi import APIRouter
from typing import List
from app.schemas.copilot import (
    CopilotChatRequest,
    CopilotChatResponse,
    CopilotQuery,
    CopilotResponse
)
from app.services.copilot.provider import get_llm_provider
from app.services.copilot_engine import copilot_engine

router = APIRouter()

@router.post("/chat", response_model=CopilotChatResponse)
async def chat_with_copilot(payload: CopilotChatRequest):
    """
    Agentic AI Copilot Chat Endpoint.
    Orchestrates controlled tool calling, executes backend engines,
    and returns schema-validated structured Cesium actions.
    """
    provider = get_llm_provider()
    return await provider.process_chat(payload)

@router.post("/query", response_model=CopilotResponse)
def ask_ocean_copilot(payload: CopilotQuery):
    """Legacy query processing for backwards compatibility."""
    return copilot_engine.process_query(payload)

@router.get("/suggested-prompts", response_model=List[str])
def get_suggested_prompts():
    """Retrieve curated prompt suggestions."""
    return [
        "Go to Arabian Sea",
        "Show Argo near Sri Lanka",
        "Compare HYCOM and ROMS",
        "Find active eddies",
        "Show OMZ",
        "Find cyclone threats"
    ]
