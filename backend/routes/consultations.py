from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List

from backend.schemas import ConsultationCreate, ConsultationUpdate, ConsultationResponse
from backend.models import Consultation, User, Patient
from backend.routes.auth import verify_token
router = APIRouter()

def get_db():
    from backend.db import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Query(...), db: Session = Depends(get_db)):
    """Get current authenticated user"""
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.post("/", response_model=ConsultationResponse)
def create_consultation(
    consultation: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new consultation"""
    # Verify patient belongs to current doctor
    patient = db.query(Patient).filter(
        Patient.id == consultation.patient_id,
        Patient.doctor_id == current_user.id
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    db_consultation = Consultation(
        patient_id=consultation.patient_id,
        doctor_id=current_user.id,
        symptoms=consultation.symptoms,
        diagnosis=consultation.diagnosis,
        notes=consultation.notes,
        sync_status="synced"
    )
    db.add(db_consultation)
    db.commit()
    db.refresh(db_consultation)
    return db_consultation

@router.get("/", response_model=List[ConsultationResponse])
def get_consultations(
    patient_id: int = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get consultations (optionally filtered by patient)"""
    query = db.query(Consultation).filter(Consultation.doctor_id == current_user.id)
    
    if patient_id:
        query = query.filter(Consultation.patient_id == patient_id)
    
    return query.all()

@router.get("/{consultation_id}", response_model=ConsultationResponse)
def get_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific consultation"""
    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id,
        Consultation.doctor_id == current_user.id
    ).first()
    
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )
    
    return consultation

@router.put("/{consultation_id}", response_model=ConsultationResponse)
def update_consultation(
    consultation_id: int,
    consultation_update: ConsultationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a consultation"""
    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id,
        Consultation.doctor_id == current_user.id
    ).first()
    
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )
    
    update_data = consultation_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(consultation, key, value)
    
    consultation.sync_status = "pending"
    db.commit()
    db.refresh(consultation)
    return consultation

@router.delete("/{consultation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a consultation"""
    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id,
        Consultation.doctor_id == current_user.id
    ).first()
    
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )
    
    consultation.sync_status = "deleted"
    db.commit()
