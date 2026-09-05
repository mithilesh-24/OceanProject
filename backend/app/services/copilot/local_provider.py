import os
import json
import logging
from typing import List, Dict, Any, Optional
import httpx

from app.core.config import settings
from app.schemas.copilot import CopilotChatRequest, CopilotChatResponse
from app.services.copilot.nvidia_provider import NvidiaProvider

logger = logging.getLogger("copilot.local_provider")

class LocalProvider:
    """
    Self-Hosted / Local Open-Weight LLM Provider.
    Points to vLLM, Ollama, or custom OpenAI-compatible server without React modifications.
    """

    def __init__(self):
        self.base_url = (settings.LOCAL_LLM_BASE_URL or "http://localhost:8000/v1").rstrip("/")
        self.model = settings.LOCAL_LLM_MODEL or "gpt-oss-20b"

    async def process_chat(self, req: CopilotChatRequest) -> CopilotChatResponse:
        adapter = NvidiaProvider()
        res = await adapter.process_chat(req)
        res.model_provider = "local"
        res.model_name = self.model
        return res
