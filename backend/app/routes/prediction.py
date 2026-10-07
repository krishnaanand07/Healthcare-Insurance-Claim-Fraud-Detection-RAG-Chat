from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import json
from app.services.ml_service import ml_service
from services.llm_service import llm_service

router = APIRouter()

class ManualClaimRequest(BaseModel):
    claim_amount: float
    service_date: str
    diagnosis_code: str
    procedure_code: str
    number_of_procedures: int
    length_of_stay_days: int
    service_type: str
    provider_specialty: str
    admission_type: str
    discharge_type: str
    provider_type: str
    provider_patient_distance_miles: float
    previous_claims_patient: int
    previous_claims_provider: int
    claim_submitted_late: bool

@router.post("/manual")
def predict_fraud_manual(request: ManualClaimRequest):
    # 1. Run ML Engine
    data = request.model_dump()
    evaluation = ml_service.predict_manual(data)
    
    # 2. Run LLM Explanation via Multi-LLM Router
    explanation = f"Risk Score {evaluation['risk_score']}/100 ({evaluation['risk_level']} Risk). Model evaluation identified key indicators: {', '.join(evaluation['insights'][:2])}."
    
    try:
        explanation_prompt = (
            f"Explain why this healthcare claim is evaluated with risk level {evaluation['risk_level']} "
            f"and risk score {evaluation['risk_score']}/100 in 2-3 concise sentences. "
            f"Key factors: {', '.join(evaluation['insights'])}"
        )
        explanation = llm_service.generate_chat_reply(
            query=explanation_prompt,
            claim_data=data,
            rag_context={"documents": [], "metadata": [], "scores": []},
            history=[]
        )
    except Exception as e:
        print(f"[Prediction Route] LLM explanation notice: {e}")

    return {
        "verdict": evaluation["verdict"],
        "risk_score": evaluation["risk_score"],
        "confidence": evaluation["confidence"],
        "risk_level": evaluation["risk_level"],
        "insights": evaluation["insights"],
        "explanation": explanation
    }
