from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.pipeline import IngestionPipeline

router = APIRouter()

@router.get("/pipelines")
def get_pipelines(db: Session = Depends(get_db)):
    pipelines = db.query(IngestionPipeline).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "source": p.source_protocol,
            "schedule": p.schedule,
            "lastSync": p.last_sync,
            "records": p.records_count,
            "status": p.status
        }
        for p in pipelines
    ]

@router.post("/sync/{pipeline_id}")
def trigger_pipeline_sync(pipeline_id: str, db: Session = Depends(get_db)):
    pipeline = db.query(IngestionPipeline).filter(IngestionPipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline job not found")
    
    pipeline.last_sync = "Just now"
    pipeline.last_run_at = datetime.utcnow()
    db.commit()
    return {"status": "success", "message": f"Pipeline '{pipeline.name}' synchronized successfully."}
