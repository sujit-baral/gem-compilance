"""
Database connection setup.
Uses SQLite for the hackathon prototype (zero setup, single file: gem_compliance.db).
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Read DATABASE_URL from environment if available (e.g. on Render with PostgreSQL),
# otherwise fallback to local SQLite file for development.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gem_compliance.db")

# Render/SQLAlchemy compatibility for postgres URI scheme
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()