from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, JSON
from app.db.base import Base

class NumericalModel(Base):
    __tablename__ = "numerical_models"

    id = Column(String(32), primary_key=True) # 'hycom', 'roms', 'nemo'
    name = Column(String(128), nullable=False)
    resolution = Column(String(128), nullable=False)
    levels_count = Column(Integer, nullable=False)
    coordinate_type = Column(String(128), nullable=False)
    provider = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    update_frequency = Column(String(64), nullable=False)
    skill_score = Column(Float, default=0.95)
    parameters = Column(JSON, nullable=False, default=dict)
    layers_metadata = Column(JSON, nullable=False, default=list)
