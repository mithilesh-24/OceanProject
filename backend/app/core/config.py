import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Bluesphere Ocean Data Platform"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    
    # Database configuration (SQLite for local dev, PostgreSQL for production)
    DATABASE_URL: str = "sqlite:///./bluesphere_v2.db"
    
    # CORS Origins
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # LLM Provider Configuration
    LLM_PROVIDER: str = "nvidia"
    NVIDIA_API_KEY: str = ""
    NVIDIA_API_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NVIDIA_MODEL: str = "openai/gpt-oss-20b"
    LOCAL_LLM_BASE_URL: str = "http://localhost:8000/v1"
    LOCAL_LLM_MODEL: str = "gpt-oss-20b"

    # Backward compatibility alias
    @property
    def NVIDIA_BASE_URL(self) -> str:
        return self.NVIDIA_API_BASE_URL

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True
    )

settings = Settings()
