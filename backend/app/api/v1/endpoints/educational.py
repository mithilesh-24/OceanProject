from fastapi import APIRouter, HTTPException
from typing import Optional
from app.schemas.educational import EducationalModulesResponse, EducationalModule
from app.services.educational_service import educational_service

router = APIRouter()

@router.get("/modules", response_model=EducationalModulesResponse)
def get_educational_modules():
    """Retrieve curated student learning modules and interactive 3D tour metadata."""
    return educational_service.get_all_modules()

@router.get("/modules/{module_id}", response_model=EducationalModule)
def get_module_detail(module_id: str):
    """Retrieve full detail, tour steps, and quiz for a specific educational module."""
    m = educational_service.get_module_by_id(module_id)
    if not m:
        raise HTTPException(status_code=404, detail="Educational module not found.")
    return m
