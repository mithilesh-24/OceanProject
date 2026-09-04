from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, JSON
from datetime import datetime
from app.db.base import Base

class AccuracyMetric(Base):
    __tablename__ = "accuracy_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    basin = Column(String(128), nullable=False)
    model_name = Column(String(64), nullable=False)
    variable = Column(String(64), nullable=False)
    willmott_index = Column(Float, nullable=False)
    rmse = Column(Float, nullable=False)
    mae = Column(Float, nullable=False)
    r2_score = Column(Float, nullable=False)
    mean_bias = Column(Float, nullable=False)
    skill_rating = Column(String(32), default="High Skill")
    sample_pairs = Column(Integer, default=1000)

class ErrorHotspot(Base):
    __tablename__ = "error_hotspots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    region_name = Column(String(128), nullable=False)
    coords_bounds = Column(String(128), nullable=False)
    model_name = Column(String(64), nullable=False)
    variable = Column(String(64), nullable=False)
    max_error = Column(String(32), nullable=False)
    rmse = Column(Float, nullable=False)
    bias = Column(Float, nullable=False)
    root_cause = Column(Text, nullable=False)
    severity = Column(String(32), default="medium")

class AnomalyAlert(Base):
    __tablename__ = "anomaly_alerts"

    id = Column(String(32), primary_key=True) # e.g. MHW-2026-08
    alert_type = Column(String(128), nullable=False)
    region = Column(String(128), nullable=False)
    amplitude = Column(String(128), nullable=False)
    depth_layer = Column(String(64), nullable=False)
    sensor_origin = Column(String(128), nullable=False)
    duration = Column(String(64), nullable=False)
    severity = Column(String(32), default="moderate")
    detected_at = Column(DateTime, default=datetime.utcnow)

class SavedWorkspace(Base):
    __tablename__ = "saved_workspaces"

    id = Column(String(64), primary_key=True)
    name = Column(String(255), nullable=False)
    model = Column(String(64), nullable=False)
    observation = Column(String(64), nullable=False)
    variables = Column(JSON, nullable=False, default=list)
    region = Column(String(128), nullable=False)
    depth_band = Column(String(64), nullable=False)
    sample_count = Column(String(64), nullable=False)
    saved_date = Column(String(32), nullable=False)
    computed_rmse = Column(String(32), nullable=False)
    computed_bias = Column(String(32), nullable=False)
    parameters = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
