from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.model_data import NumericalModel

router = APIRouter()

@router.get("")
def get_numerical_models(db: Session = Depends(get_db)):
    models = db.query(NumericalModel).all()
    return [
        {
            "id": m.id,
            "name": m.name,
            "resolution": m.resolution,
            "levels_count": m.levels_count,
            "coordinate_type": m.coordinate_type,
            "provider": m.provider,
            "description": m.description,
            "update_frequency": m.update_frequency,
            "skill_score": m.skill_score,
            "parameters": m.parameters,
            "layers_metadata": m.layers_metadata
        }
        for m in models
    ]

@router.get("/{model_id}")
def get_model_detail(model_id: str, db: Session = Depends(get_db)):
    m = db.query(NumericalModel).filter(NumericalModel.id == model_id).first()
    if not m:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found")
    return {
        "id": m.id,
        "name": m.name,
        "resolution": m.resolution,
        "levels_count": m.levels_count,
        "coordinate_type": m.coordinate_type,
        "provider": m.provider,
        "description": m.description,
        "update_frequency": m.update_frequency,
        "skill_score": m.skill_score,
        "parameters": m.parameters,
        "layers_metadata": m.layers_metadata
    }
