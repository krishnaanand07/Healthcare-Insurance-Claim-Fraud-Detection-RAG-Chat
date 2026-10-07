import sys
import os
import pytest
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_manual_prediction_endpoint():
    payload = {
        "claim_amount": 125000,
        "service_date": "2024-03-15",
        "diagnosis_code": "I10",
        "procedure_code": "99213",
        "number_of_procedures": 1,
        "length_of_stay_days": 3,
        "service_type": "Inpatient",
        "provider_specialty": "Cardiology",
        "admission_type": "Emergency",
        "discharge_type": "Home",
        "provider_type": "Hospital",
        "provider_patient_distance_miles": 12,
        "previous_claims_patient": 2,
        "previous_claims_provider": 18,
        "claim_submitted_late": False
    }
    response = client.post("/api/predict/manual", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "verdict" in data
    assert "risk_score" in data

def test_ai_investigate_endpoint():
    payload = {
        "claim": {
            "claim_amount": 125000,
            "service_date": "2024-03-15",
            "diagnosis_code": "I10",
            "procedure_code": "99213",
            "number_of_procedures": 1,
            "length_of_stay_days": 3,
            "service_type": "Inpatient",
            "provider_specialty": "Cardiology",
            "admission_type": "Emergency",
            "discharge_type": "Home",
            "provider_type": "Hospital",
            "provider_patient_distance_miles": 12,
            "previous_claims_patient": 2,
            "previous_claims_provider": 18,
            "claim_submitted_late": False
        }
    }
    response = client.post("/api/ai/investigate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "ml_prediction" in data
    assert "retrieved_context" in data
    assert "ai_analysis" in data
    assert "summary" in data["ai_analysis"]
    assert "risk_level" in data["ai_analysis"]

def test_ai_chat_endpoint():
    payload = {
        "query": "Why was this claim flagged?",
        "claim": {
            "claim_amount": 125000,
            "diagnosis_code": "I10",
            "procedure_code": "99213"
        }
    }
    response = client.post("/api/ai/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "retrieved_sources" in data
    assert "investigation_id" in data
