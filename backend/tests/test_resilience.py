import sys
import os
import pytest
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.main import app
from services.llm_service import NVIDIALLMService

client = TestClient(app)

def test_invalid_nvidia_api_key_resilience():
    # Instantiate service with bad key
    old_key = os.environ.get("NVIDIA_API_KEY")
    os.environ["NVIDIA_API_KEY"] = "invalid_nvapi_key_12345"

    try:
        service = NVIDIALLMService()
        claim = {"claim_amount": 75000}
        ml_pred = {"risk_level": "MEDIUM", "fraud_probability": 0.55}
        rag_ctx = {"documents": [], "metadata": [], "scores": []}

        # Should NOT raise exception, must return fallback structured report
        report = service.generate_investigation_report(claim, ml_pred, rag_ctx)
        assert report is not None
        assert report.risk_level == "MEDIUM"
    finally:
        if old_key:
            os.environ["NVIDIA_API_KEY"] = old_key

def test_empty_claim_resilience():
    payload = {"claim": {}}
    response = client.post("/api/ai/investigate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "ml_prediction" in data
    assert "ai_analysis" in data

def test_empty_knowledge_base_retrieval():
    from rag.vectorstore import VectorStore
    empty_store = VectorStore(storage_path="non_existent_temp.pkl")
    empty_store.clear()
    
    results = empty_store.similarity_search([0.1]*384, top_k=5)
    assert results == []
