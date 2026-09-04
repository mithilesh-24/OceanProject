from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, JSON
from datetime import datetime
from app.db.base import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    provider = Column(String(128), nullable=False)
    type = Column(String(64), nullable=False, index=True) # 'Observation', 'Model', 'Bathymetry'
    variables = Column(JSON, nullable=False, default=list) # e.g. ["Temperature", "Salinity", "Pressure"]
    region = Column(String(128), nullable=False)
    time_coverage = Column(String(128), nullable=False)
    resolution = Column(String(128), nullable=False)
    status = Column(String(32), default="Online") # 'Online', 'Syncing', 'Offline'
    protocol = Column(String(32), default="ERDDAP") # 'ERDDAP', 'NetCDF', 'OPeNDAP', 'WMS'
    endpoint_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    source_type = Column(String(64), nullable=False) # 'INCOIS ERDDAP', 'NOAA OPeNDAP', 'CMEMS WMS'
    url = Column(String(512), nullable=False)
    is_active = Column(Boolean, default=True)
    sync_frequency = Column(String(64), default="Daily")
    last_sync = Column(DateTime, nullable=True)
