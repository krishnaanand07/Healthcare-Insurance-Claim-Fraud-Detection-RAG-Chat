from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import os
import json
from app.database import models, db
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
    
    # 2. Run LLM Explanation
    explanation = f"Risk Score {evaluation['risk_score']}/100 ({evaluation['risk_level']} Risk). Model evaluation identified key indicators: {', '.join(evaluation['insights'][:2])}."
    
    try:
        # If NVIDIA API is configured, use it for generating concise explanation
        if os.environ.get("NVIDIA_API_KEY"):
            report = llm_service.generate_investigation_report(data, evaluation, {"documents": [], "metadata": [], "scores": []})
            explanation = report.summary
        elif os.environ.get("GROQ_API_KEY"):
            from openai import OpenAI
            client = OpenAI(
                base_url="https://api.groq.com/openai/v1",
                api_key=os.environ.get("GROQ_API_KEY")
            )
            response = client.chat.completions.create(
                model=os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile"),
                messages=[
                    {"role": "system", "content": "Explain risk factors of claim data concisely."},
                    {"role": "user", "content": f"Claim Data: {json.dumps(data)}\nVerdict: {evaluation['verdict']}"}
                ],
                max_tokens=256
            )
            explanation = response.choices[0].message.content
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
