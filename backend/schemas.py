from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Patient Schemas
class PatientBase(BaseModel):
    full_name: str
    birth_date: str
    gender: str
    phone: str
    email: str
    allergies: Optional[str] = ""
    chronic_diseases: Optional[str] = ""

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    birth_date: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    allergies: Optional[str] = None
    chronic_diseases: Optional[str] = None

class PatientResponse(PatientBase):
    id: int
    doctor_id: int
    created_at: datetime
    updated_at: datetime
    sync_status: str
    
    class Config:
        from_attributes = True

# Consultation Schemas
class ConsultationBase(BaseModel):
    patient_id: int
    symptoms: str
    diagnosis: str
    notes: Optional[str] = ""

class ConsultationCreate(ConsultationBase):
    pass

class ConsultationUpdate(BaseModel):
    symptoms: Optional[str] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None

class ConsultationResponse(ConsultationBase):
    id: int
    doctor_id: int
    consultation_date: datetime
    created_at: datetime
    updated_at: datetime
    sync_status: str
    
    class Config:
        from_attributes = True

# Prescription Schemas
class PrescriptionBase(BaseModel):
    patient_id: int
    medication: str
    dosage: str
    instructions: str
    duration: str

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionUpdate(BaseModel):
    medication: Optional[str] = None
    dosage: Optional[str] = None
    instructions: Optional[str] = None
    duration: Optional[str] = None

class PrescriptionResponse(PrescriptionBase):
    id: int
    doctor_id: int
    created_at: datetime
    updated_at: datetime
    sync_status: str
    
    class Config:
        from_attributes = True

# Sync Schemas
class SyncRequest(BaseModel):
    table_name: str
    record_id: int
    action: str  # create, update, delete
    data: Optional[dict] = None

class SyncResponse(BaseModel):
    status: str
    message: str
    data: Optional[dict] = None

# AI Service Schemas
class PatientSummaryRequest(BaseModel):
    patient_id: int

class PatientSummaryResponse(BaseModel):
    summary: str
    key_insights: List[str]
    recommendations: List[str]

class AIQueryRequest(BaseModel):
    patient_id: int
    question: str

class AIQueryResponse(BaseModel):
    answer: str
    sources: Optional[List[str]] = None
