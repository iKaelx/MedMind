from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List

from backend.schemas import PrescriptionCreate, PrescriptionUpdate, PrescriptionResponse
from backend.models import Prescription, User, Patient
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

@router.post("/", response_model=PrescriptionResponse)
def create_prescription(
    prescription: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new prescription"""
    # Verify patient belongs to current doctor
    patient = db.query(Patient).filter(
        Patient.id == prescription.patient_id,
        Patient.doctor_id == current_user.id
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    db_prescription = Prescription(
        patient_id=prescription.patient_id,
        doctor_id=current_user.id,
        medication=prescription.medication,
        dosage=prescription.dosage,
        instructions=prescription.instructions,
        duration=prescription.duration,
        sync_status="synced"
    )
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    return db_prescription

@router.get("/", response_model=List[PrescriptionResponse])
def get_prescriptions(
    patient_id: int = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get prescriptions (optionally filtered by patient)"""
    query = db.query(Prescription).filter(Prescription.doctor_id == current_user.id)
    
    if patient_id:
        query = query.filter(Prescription.patient_id == patient_id)
    
    return query.all()

@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific prescription"""
    prescription = db.query(Prescription).filter(
        Prescription.id == prescription_id,
        Prescription.doctor_id == current_user.id
    ).first()
    
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    
    return prescription

@router.put("/{prescription_id}", response_model=PrescriptionResponse)
def update_prescription(
    prescription_id: int,
    prescription_update: PrescriptionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a prescription"""
    prescription = db.query(Prescription).filter(
        Prescription.id == prescription_id,
        Prescription.doctor_id == current_user.id
    ).first()
    
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    
    update_data = prescription_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(prescription, key, value)
    
    prescription.sync_status = "pending"
    db.commit()
    db.refresh(prescription)
    return prescription

@router.delete("/{prescription_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a prescription"""
    prescription = db.query(Prescription).filter(
        Prescription.id == prescription_id,
        Prescription.doctor_id == current_user.id
    ).first()
    
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    
    prescription.sync_status = "deleted"
    db.commit()
