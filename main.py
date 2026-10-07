import sys
import os
import uvicorn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(BASE_DIR, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from backend.app.main import app

# Mount root /predict endpoint for backwards compatibility
from backend.services.ml_service import ml_service
from pydantic import BaseModel
from fastapi import HTTPException
import pandas as pd

class ClaimFeatures(BaseModel):
    Claim_Amount: float
    Patient_Age: int
    Patient_Gender: int
    Patient_City: int
    Patient_State: int
    Provider_City: int
    Provider_State: int
    Diagnosis_Code: int
    Procedure_Code: int
    Number_of_Procedures: int
    Admission_Type: int
    Length_of_Stay_Days: int
    Service_Type: int
    Deductible_Amount: float
    CoPay_Amount: float
    Number_of_Previous_Claims_Patient: int
    Number_of_Previous_Claims_Provider: int
    Provider_Patient_Distance_Miles: float
    Claim_Submitted_Late: int
    Provider_Type_Hospital: int
    Provider_Type_Laboratory: int
    Provider_Type_Pharmacy: int
    Provider_Type_Specialist_Office: int
    Provider_Type_Urgent_Care: int
    Provider_Specialty_Dermatology: int
    Provider_Specialty_General_Practice: int
    Provider_Specialty_Neurology: int
    Provider_Specialty_Oncology: int
    Provider_Specialty_Orthopedics: int
    Provider_Specialty_Pediatrics: int
    Provider_Specialty_Physical_Therapy: int
    Provider_Specialty_Psychiatry: int
    Provider_Specialty_Radiology: int
    Discharge_Type_Deceased: int
    Discharge_Type_Home: int
    Discharge_Type_Rehab_Skilled_Nursing: int
    Discharge_Type_Transfer_to_another_facility: int
    Claim_Year: int
    Claim_Month: int
    Claim_Delay_Days: int

@app.post("/predict", tags=["Prediction"])
def predict_fraud(claim: ClaimFeatures):
    result = ml_service.predict(claim.dict())
    return {
        "is_fraudulent": result.get("is_fraudulent", False),
        "fraud_probability": result.get("fraud_probability", 0.0)
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
