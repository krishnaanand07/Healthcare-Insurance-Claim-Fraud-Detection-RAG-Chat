from pydantic import BaseModel, Field
from typing import List, Optional

class ClaimInput(BaseModel):
    patient_id: int
    policy_number: str
    hospital_id: int
    age: int
    gender: str
    claim_amount: float
    deductible_amount: float
    copay_amount: float
    claim_submitted_late: int
    num_previous_claims_patient: int
    num_previous_claims_provider: int
    provider_patient_distance: float
    diagnosis_code: str
    procedure_code: str
    num_procedures: int
    admission_type: str
    discharge_type: str
    length_of_stay: int
    service_type: str

class ClaimResponse(BaseModel):
    claim_id: str
    status: str
