from abc import ABC, abstractmethod
import logging

from app.core.config import settings
from app.schemas.copilot import CopilotChatRequest, CopilotChatResponse
from app.services.copilot.nvidia_provider import NvidiaProvider
from app.services.copilot.local_provider import LocalProvider

logger = logging.getLogger("copilot.provider")

class BaseLLMProvider(ABC):
    """Abstract Base Class for LLM Providers."""

    @abstractmethod
    async def process_chat(self, req: CopilotChatRequest) -> CopilotChatResponse:
        pass


def get_llm_provider():
    """
    Factory to obtain configured LLM Provider.
    Defaults to NvidiaProvider, swappable to LocalProvider via backend .env without client changes.
    """
    provider_type = (settings.LLM_PROVIDER or "nvidia").lower().strip()
    if provider_type == "local":
        return LocalProvider()
    return NvidiaProvider()
