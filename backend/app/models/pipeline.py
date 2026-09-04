from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime
from datetime import datetime
from app.db.base import Base

class IngestionPipeline(Base):
    __tablename__ = "ingestion_pipelines"

    id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    source_protocol = Column(String(128), nullable=False)
    schedule = Column(String(64), nullable=False)
    last_sync = Column(String(64), nullable=False)
    records_count = Column(String(64), nullable=False)
    status = Column(String(32), default="Healthy")
    last_run_at = Column(DateTime, default=datetime.utcnow)

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String(64), primary_key=True)
    email = Column(String(128), unique=True, index=True)
    name = Column(String(128), nullable=False)
    role = Column(String(32), default="researcher")
    organization = Column(String(128), default="INCOIS")
    department = Column(String(128), nullable=True)
    research_area = Column(String(128), nullable=True)
