from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import SessionLocal
from app.services.seeder import init_db

# API Routers
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.datasets import router as datasets_router
from app.api.v1.endpoints.observations import router as observations_router
from app.api.v1.endpoints.models import router as models_router
from app.api.v1.endpoints.analysis import router as analysis_router
from app.api.v1.endpoints.pipelines import router as pipelines_router
from app.api.v1.endpoints.visualization import router as visualization_router
from app.api.v1.endpoints.workspace import router as workspaces_router
from app.api.v1.endpoints.export import router as export_router
from app.api.v1.endpoints.educational import router as educational_router
from app.api.v1.endpoints.researcher import router as researcher_router
from app.api.v1.endpoints.admin_telemetry import router as admin_telemetry_router
from app.api.v1.endpoints.alerts import router as alerts_router
from app.api.v1.endpoints.cache import router as cache_router
from app.api.v1.endpoints.adcp_analysis import router as adcp_analysis_router
from app.api.v1.endpoints.satellite import router as satellite_router
from app.api.v1.endpoints.copilot import router as copilot_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize and seed database on startup
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Bluesphere Scientific Ocean GIS, 3D Earth Exploration, and Hydrodynamic Modeling REST API.",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 Routers
app.include_router(health_router, prefix=f"{settings.API_V1_STR}", tags=["System Health"])
app.include_router(datasets_router, prefix=f"{settings.API_V1_STR}/datasets", tags=["Dataset Catalog"])
app.include_router(observations_router, prefix=f"{settings.API_V1_STR}/observations", tags=["In-Situ Observations"])
app.include_router(models_router, prefix=f"{settings.API_V1_STR}/models", tags=["Numerical Models"])
app.include_router(analysis_router, prefix=f"{settings.API_V1_STR}/analysis", tags=["Scientific Analytics"])
app.include_router(pipelines_router, prefix=f"{settings.API_V1_STR}/admin", tags=["Pipeline Administration"])
app.include_router(visualization_router, prefix=f"{settings.API_V1_STR}/visualization", tags=["3D & 4D Visualization"])
app.include_router(workspaces_router, prefix=f"{settings.API_V1_STR}/workspaces", tags=["Saved Workspaces"])
app.include_router(export_router, prefix=f"{settings.API_V1_STR}/export", tags=["Data & Report Export"])
app.include_router(educational_router, prefix=f"{settings.API_V1_STR}/educational", tags=["Educational Oceanography"])
app.include_router(researcher_router, prefix=f"{settings.API_V1_STR}/research", tags=["Researcher Workbench"])
app.include_router(admin_telemetry_router, prefix=f"{settings.API_V1_STR}/telemetry", tags=["Admin Telemetry"])
app.include_router(alerts_router, prefix=f"{settings.API_V1_STR}/alerts", tags=["Real-Time Alerts"])
app.include_router(cache_router, prefix=f"{settings.API_V1_STR}/cache", tags=["Caching Grid"])
app.include_router(adcp_analysis_router, prefix=f"{settings.API_V1_STR}/adcp", tags=["ADCP 3D Vector Fields"])
app.include_router(satellite_router, prefix=f"{settings.API_V1_STR}/satellite", tags=["Satellite Remote Sensing"])
app.include_router(copilot_router, prefix=f"{settings.API_V1_STR}/copilot", tags=["AI Ocean Copilot"])

@app.get("/")
def root_index():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }
