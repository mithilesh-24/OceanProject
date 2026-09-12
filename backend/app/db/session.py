import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger("bluesphere.db")

# Attempt primary database connection (Neon PostgreSQL)
db_url = settings.DATABASE_URL
connect_args = {}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        db_url,
        connect_args=connect_args,
        echo=False,
        pool_pre_ping=True,
        pool_timeout=10,
    )
    # Test connection immediately
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    logger.info(" Successfully connected to Neon PostgreSQL Database.")
except Exception as e:
    logger.warning(f" Primary PostgreSQL connection failed ({e}). Falling back to resilient local SQLite database.")
    sqlite_url = "sqlite:///./bluesphere.db"
    engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False},
        echo=False,
    )
    logger.info(f" Switched to local SQLite database: {sqlite_url}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
