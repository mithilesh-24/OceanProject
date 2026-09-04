from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, JSON, ForeignKey
from datetime import datetime
from app.db.base import Base

class ArgoFloat(Base):
    __tablename__ = "argo_floats"

    wmo_id = Column(String(32), primary_key=True, index=True)
    basin = Column(String(128), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    cycle_number = Column(Integer, nullable=False)
    last_transmission = Column(DateTime, nullable=False)
    surface_temp = Column(Float, nullable=True)
    surface_sal = Column(Float, nullable=True)
    max_depth = Column(Float, default=2000.0)
    status = Column(String(64), default="Active (Ascending)")
    battery_state = Column(Float, default=95.0)
    institution = Column(String(64), default="INCOIS")
    profile_data = Column(JSON, nullable=True) # Vertical depth vs temp, sal arrays

class GliderMission(Base):
    __tablename__ = "glider_missions"

    id = Column(String(64), primary_key=True)
    platform_name = Column(String(128), nullable=False)
    mission_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    dives_completed = Column(Integer, default=0)
    depth_range = Column(String(64), default="0 - 1000 m")
    battery_pct = Column(Integer, default=80)
    sensors = Column(String(255), nullable=True)
    status = Column(String(64), default="Active Sawtooth Dive")
    trajectory = Column(JSON, nullable=True)

class MooredBuoy(Base):
    __tablename__ = "moored_buoys"

    station_id = Column(String(32), primary_key=True, index=True)
    network = Column(String(128), nullable=False)
    location_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    sst = Column(Float, nullable=False)
    air_temp = Column(Float, nullable=True)
    wind_speed = Column(Float, nullable=True)
    wave_height = Column(Float, nullable=True)
    status = Column(String(64), default="Online (Transmitting)")
    last_update = Column(DateTime, default=datetime.utcnow)

class CtdCast(Base):
    __tablename__ = "ctd_casts"

    cast_id = Column(String(64), primary_key=True)
    vessel = Column(String(128), nullable=False)
    station_name = Column(String(128), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    max_depth = Column(Float, nullable=False)
    bottles_count = Column(Integer, default=24)
    parameters = Column(String(255), nullable=False)
    cruise_date = Column(DateTime, nullable=False)
    qc_status = Column(String(64), default="Quality Controlled (QC-1)")

class AdcpStation(Base):
    __tablename__ = "adcp_stations"

    station_id = Column(String(64), primary_key=True)
    mooring_array = Column(String(128), nullable=False)
    location_desc = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    depth_range = Column(String(64), default="0 - 300 m")
    acoustic_freq = Column(String(64), default="75 kHz")
    peak_current = Column(Float, nullable=False)
    max_shear = Column(Float, nullable=False)
    status = Column(String(64), default="Online")
