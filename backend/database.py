from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = "sqlite:///./cityassist.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(String, index=True)
    location = Column(String, index=True)
    experience = Column(Integer, default=0)
    skills = Column(String, default="")
    police_verified = Column(Boolean, default=False)
    past_employers = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    
    aadhaar_verified = Column(Boolean, default=False)
    aadhaar_name = Column(String, nullable=True)
    aadhaar_dob = Column(String, nullable=True)
    aadhaar_number = Column(String, nullable=True)
    aadhaar_address = Column(String, nullable=True)
    
    bio = Column(Text, default="")
    embedding = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_all_workers(db):
    return db.query(Worker).all()


def get_worker_by_id(db, worker_id: int):
    return db.query(Worker).filter(Worker.id == worker_id).first()


def create_worker(db, worker_data: dict):
    db_worker = Worker(**worker_data)
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker


def delete_worker(db, worker_id: int):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if worker:
        db.delete(worker)
        db.commit()
        return True
    return False


def update_worker(db, worker_id: int, update_data: dict):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if worker:
        for key, value in update_data.items():
            setattr(worker, key, value)
        db.commit()
        db.refresh(worker)
        return worker
    return None
