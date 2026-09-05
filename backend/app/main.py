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

@app.get("/")
def root_index():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }
