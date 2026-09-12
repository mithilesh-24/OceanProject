from sqlalchemy import Column, String, Boolean, DateTime
from datetime import datetime
import uuid
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(128), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    name = Column(String(128), nullable=False)
    role = Column(String(32), nullable=False, default="student") # student, researcher, admin
    organization = Column(String(128), default="Oceanographic Institute")
    department = Column(String(128), nullable=True)
    course = Column(String(128), nullable=True)
    year = Column(String(64), nullable=True)
    research_area = Column(String(128), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
