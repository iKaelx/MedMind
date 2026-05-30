from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.orm import Session

from backend.schemas import PatientSummaryRequest, PatientSummaryResponse, AIQueryRequest, AIQueryResponse
from backend.models import User, Patient, Consultation, Prescription
from backend.routes.auth import verify_token

import os
from groq import Groq

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

# Initialize Groq client
groq_api_key = os.getenv("GROQ_API_KEY")
if groq_api_key:
    client = Groq(api_key=groq_api_key)
else:
    client = None

def build_patient_context(db: Session, patient_id: int, doctor_id: int) -> str:
    """Build patient context from database"""
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.doctor_id == doctor_id
    ).first()
    
    if not patient:
        return ""
    
    context = f"""
Patient Information:
- Name: {patient.full_name}
- Date of Birth: {patient.birth_date}
- Gender: {patient.gender}
- Phone: {patient.phone}
- Email: {patient.email}
- Allergies: {patient.allergies or 'None reported'}
- Chronic Diseases: {patient.chronic_diseases or 'None reported'}

Recent Consultations:
"""
    
    consultations = db.query(Consultation).filter(
        Consultation.patient_id == patient_id,
        Consultation.doctor_id == doctor_id
    ).order_by(Consultation.consultation_date.desc()).limit(5).all()
    
    for cons in consultations:
        context += f"\n- Date: {cons.consultation_date.strftime('%Y-%m-%d')}\n  Symptoms: {cons.symptoms}\n  Diagnosis: {cons.diagnosis}"
    
    context += "\n\nCurrent Prescriptions:\n"
    
    prescriptions = db.query(Prescription).filter(
        Prescription.patient_id == patient_id,
        Prescription.doctor_id == doctor_id
    ).all()
    
    for rx in prescriptions:
        context += f"\n- {rx.medication} ({rx.dosage}): {rx.instructions}"
    
    return context

@router.post("/summarize", response_model=PatientSummaryResponse)
def summarize_patient(
    request: PatientSummaryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate AI summary of patient"""
    if not client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service not configured. Set GROQ_API_KEY environment variable."
        )
    
    # Build patient context
    patient_context = build_patient_context(db, request.patient_id, current_user.id)
    
    if not patient_context:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    try:
        # Call Groq API
        message = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a medical assistant AI. Provide concise, professional summaries of patient information. Focus on key health indicators, recent diagnoses, and current treatments."
                },
                {
                    "role": "user",
                    "content": f"Please provide a concise summary of this patient's health status, key insights about their conditions, and recommendations for follow-up care:\n\n{patient_context}"
                }
            ],
            model="mixtral-8x7b-32768",
            temperature=0.7,
            max_tokens=1024
        )
        
        response_text = message.choices[0].message.content
        
        # Parse response into structured format (simple approach)
        lines = response_text.split('\n')
        summary = response_text
        key_insights = [line.strip() for line in lines if line.strip() and len(line) > 20][:3]
        recommendations = [line.strip() for line in lines if line.strip() and len(line) > 20][3:6] or ["Follow-up recommended"]
        
        return PatientSummaryResponse(
            summary=summary,
            key_insights=key_insights,
            recommendations=recommendations
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating summary: {str(e)}"
        )

@router.post("/query", response_model=AIQueryResponse)
def query_patient_data(
    request: AIQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ask AI a question about patient data"""
    if not client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service not configured. Set GROQ_API_KEY environment variable."
        )
    
    # Build patient context
    patient_context = build_patient_context(db, request.patient_id, current_user.id)
    
    if not patient_context:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    try:
        # Call Groq API
        message = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a knowledgeable medical assistant. Answer questions about patient data based on provided information. Be accurate and professional."
                },
                {
                    "role": "user",
                    "content": f"Here is patient information:\n\n{patient_context}\n\nQuestion: {request.question}"
                }
            ],
            model="mixtral-8x7b-32768",
            temperature=0.7,
            max_tokens=512
        )
        
        answer = message.choices[0].message.content
        
        return AIQueryResponse(
            answer=answer,
            sources=["Patient Medical Records", "Recent Consultations", "Current Prescriptions"]
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing query: {str(e)}"
        )
