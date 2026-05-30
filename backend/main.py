import os
import sys

# Ensure backend package can be imported regardless of execution directory
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime

from backend.models import Base
from backend.db import engine, SessionLocal
from backend.routes import auth, patients, consultations, prescriptions, ai_service

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Doctor Assistant API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(consultations.router, prefix="/api/consultations", tags=["Consultations"])
app.include_router(prescriptions.router, prefix="/api/prescriptions", tags=["Prescriptions"])
app.include_router(ai_service.router, prefix="/api/ai", tags=["AI Service"])

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "message": "AI Doctor Assistant API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/sync/status")
def sync_status(db: Session = Depends(get_db)):
    """Endpoint for sync status checks and data retrieval"""
    return {
        "status": "ready",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    # Determine the import string based on the current working directory to support reloading
    module_name = "backend.main" if not os.getcwd().endswith("backend") else "main"
    uvicorn.run(f"{module_name}:app", host="0.0.0.0", port=8000, reload=True)
