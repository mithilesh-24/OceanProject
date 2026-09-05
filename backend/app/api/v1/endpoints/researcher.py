from fastapi import APIRouter
from app.schemas.research import (
    DensityComputationRequest,
    DensityStratificationResponse,
    QueryGeneratorRequest,
    QueryGeneratorResponse
)
from app.services.research_engine import research_engine

router = APIRouter()

@router.post("/compute/density-stratification", response_model=DensityStratificationResponse)
def compute_density_stratification(payload: DensityComputationRequest):
    """Compute potential density sigma-theta, Brunt-Vaisala frequency N2, and barrier layer thickness."""
    return research_engine.compute_density_stratification(payload)

@router.post("/query/generate", response_model=QueryGeneratorResponse)
def generate_scientific_query(payload: QueryGeneratorRequest):
    """Generate ready-to-run Python, xarray, or MATLAB queries for ERDDAP and OpenDAP datasets."""
    return research_engine.generate_research_query(payload)
