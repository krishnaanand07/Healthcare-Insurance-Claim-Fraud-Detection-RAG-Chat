from sqlalchemy import Column, Integer, String, Float
from app.database.db import Base

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(String, unique=True, index=True)
    patient_id = Column(Integer, index=True)
    policy_number = Column(String)
    hospital_id = Column(Integer)
    age = Column(Integer)
    gender = Column(String)
    claim_amount = Column(Float)
    deductible_amount = Column(Float)
    copay_amount = Column(Float)
    claim_submitted_late = Column(Integer)
    num_previous_claims_patient = Column(Integer)
    num_previous_claims_provider = Column(Integer)
    provider_patient_distance = Column(Float)
    diagnosis_code = Column(String)
    procedure_code = Column(String)
    num_procedures = Column(Integer)
    admission_type = Column(String)
    discharge_type = Column(String)
    length_of_stay = Column(Integer)
    service_type = Column(String)
    status = Column(String, default="received")
    fraud_probability = Column(Float, nullable=True)
