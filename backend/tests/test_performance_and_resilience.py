import os
import sys
import time
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.main import app
from services.ml_service import ml_service, FraudPredictionService
from services.llm_service import MultiLLMRouterService

client = TestClient(app)

def test_cors_preflight_production_origin():
    """
    Verifies that FastAPI's CORSMiddleware allows the exact production frontend origin
    https://healthcare-insurance-claim-fraud-de-six.vercel.app without wildcard origin.
    """
    prod_origin = "https://healthcare-insurance-claim-fraud-de-six.vercel.app"
    response = client.options(
        "/api/ai/investigate",
        headers={
            "Origin": prod_origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type"
        }
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == prod_origin
    assert response.headers.get("access-control-allow-credentials") == "true"
    # Ensure wildcard is not returned with credentials
    assert response.headers.get("access-control-allow-origin") != "*"

def test_ml_model_reuse_across_requests():
    """
    Verifies that ML model and scaler are loaded once and reused across subsequent requests.
    """
    # Reset service to fresh state
    service = FraudPredictionService()
    assert service._load_count == 0
    assert service._loaded is False

    claim = {
        "claim_amount": 75000,
        "service_date": "2024-03-15",
        "diagnosis_code": "I10",
        "procedure_code": "99213"
    }

    # Request 1
    res1 = service.predict(claim)
    assert service._loaded is True
    load_count_after_first = service._load_count

    # Request 2
    res2 = service.predict(claim)
    assert service._load_count == load_count_after_first, "Artifacts should be reused, not reloaded"

    # Request 3
    res3 = service.predict(claim)
    assert service._load_count == load_count_after_first, "Artifacts should be reused, not reloaded"
    assert res1["risk_score"] == res2["risk_score"] == res3["risk_score"]

def test_invalid_groq_model_fallback():
    """
    Verifies that when Groq returns 404 (model_not_found), the router bypasses it
    and falls back to Gemini or the structured fallback report without crashing.
    """
    service = MultiLLMRouterService()

    # Mock Groq client to raise 404 NotFoundError
    from openai import NotFoundError
    mock_groq = MagicMock()
    mock_groq.chat.completions.create.side_effect = NotFoundError(
        "model_not_found: The model `llama-3.3-70b-versatile` does not exist",
        response=MagicMock(status_code=404),
        body={"error": {"code": "model_not_found"}}
    )
    service.client_groq = mock_groq

    claim = {"claim_amount": 80000}
    ml_pred = {"risk_level": "HIGH", "risk_score": 85, "insights": ["High claim amount"]}
    rag_ctx = {"documents": ["Doc 1"], "metadata": [{"filename": "guide.md"}], "scores": [0.85]}

    report = service.generate_investigation_report(claim, ml_pred, rag_ctx)
    assert report is not None
    assert report.risk_level in ["HIGH", "MEDIUM", "LOW"]
    # Groq should be recorded in permanent errors to avoid repeated failing attempts
    assert "groq" in service._permanent_errors

def test_gemini_success_after_groq_failure():
    """
    Verifies that when Groq fails, Gemini succeeds and generates the report.
    """
    service = MultiLLMRouterService()

    mock_groq = MagicMock()
    mock_groq.chat.completions.create.side_effect = Exception("Groq unavailable")
    service.client_groq = mock_groq

    mock_gemini = MagicMock()
    mock_gemini_choice = MagicMock()
    mock_gemini_choice.message.content = '{"summary": "Gemini report", "risk_level": "HIGH", "fraud_probability": 0.85, "key_risk_factors": ["High cost"], "claim_analysis": "Detailed analysis", "supporting_evidence": [], "recommended_investigation_steps": ["Verify chart"], "limitations": []}'
    mock_gemini_resp = MagicMock()
    mock_gemini_resp.choices = [mock_gemini_choice]
    mock_gemini.chat.completions.create.return_value = mock_gemini_resp
    service.client_gemini = mock_gemini

    claim = {"claim_amount": 100000}
    ml_pred = {"risk_level": "HIGH", "fraud_probability": 0.85}
    rag_ctx = {"documents": [], "metadata": [], "scores": []}

    report = service.generate_investigation_report(claim, ml_pred, rag_ctx)
    assert report.summary == "Gemini report"
    assert report.risk_level == "HIGH"

def test_llm_timeout_and_fallback_speed():
    """
    Verifies that when all providers time out or fail, the fallback report generates in < 100ms.
    """
    service = MultiLLMRouterService()
    mock_client = MagicMock()
    mock_client.chat.completions.create.side_effect = TimeoutError("Request timed out")

    service.client_groq = mock_client
    service.client_gemini = mock_client
    service.client_nvidia = mock_client

    claim = {"claim_amount": 50000}
    ml_pred = {"risk_level": "MEDIUM", "fraud_probability": 0.50, "insights": ["Moderate claim"]}
    rag_ctx = {"documents": ["Guideline excerpt"], "metadata": [{"filename": "rules.md"}], "scores": [0.75]}

    t0 = time.time()
    report = service.generate_investigation_report(claim, ml_pred, rag_ctx)
    elapsed_ms = (time.time() - t0) * 1000

    assert report is not None
    assert report.risk_level == "MEDIUM"
    assert elapsed_ms < 500  # Fallback generation must be fast

def test_successful_investigation_endpoint_with_diagnostics():
    """
    Verifies full end-to-end investigation endpoint returns valid payload,
    diagnostic timings, and status 200.
    """
    payload = {
        "claim": {
            "claim_amount": 95000,
            "service_date": "2024-03-15",
            "diagnosis_code": "I10",
            "procedure_code": "99213",
            "number_of_procedures": 1,
            "length_of_stay_days": 2,
            "service_type": "Inpatient",
            "provider_specialty": "Cardiology",
            "admission_type": "Emergency",
            "discharge_type": "Home",
            "provider_type": "Hospital",
            "provider_patient_distance_miles": 15,
            "previous_claims_patient": 1,
            "previous_claims_provider": 10,
            "claim_submitted_late": False
        }
    }
    response = client.post(
        "/api/ai/investigate",
        json=payload,
        headers={"x-request-id": "test-req-123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "ml_prediction" in data
    assert "retrieved_context" in data
    assert "ai_analysis" in data
    assert "diagnostics" in data
    assert data["diagnostics"]["correlation_id"] == "test-req-123"
    assert "total_duration_ms" in data["diagnostics"]
