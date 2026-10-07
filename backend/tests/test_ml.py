import sys
import os
import pytest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from services.ml_service import ml_service

def test_ml_prediction_manual():
    sample_claim = {
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

    result = ml_service.predict(sample_claim)
    assert "verdict" in result
    assert "fraud_probability" in result
    assert "risk_score" in result
    assert isinstance(result["fraud_probability"], float)
    assert result["fraud_probability"] >= 0.0 and result["fraud_probability"] <= 1.0

def test_ml_prediction_genuine():
    genuine_claim = {
        "claim_amount": 1200,
        "service_date": "2024-03-15",
        "diagnosis_code": "J00",
        "procedure_code": "99213",
        "number_of_procedures": 1,
        "length_of_stay_days": 0,
        "service_type": "Outpatient",
        "provider_specialty": "General Practice",
        "admission_type": "Elective",
        "discharge_type": "Home",
        "provider_type": "Clinic",
        "provider_patient_distance_miles": 3,
        "previous_claims_patient": 1,
        "previous_claims_provider": 10,
        "claim_submitted_late": False
    }

    result = ml_service.predict(genuine_claim)
    assert result["risk_score"] <= 50
    assert result["verdict"] in ["LIKELY_GENUINE", "REQUIRES_HUMAN_REVIEW"]
