import sys
import os
import pytest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from services.llm_service import NVIDIALLMService

def test_llm_service_json_parsing():
    service = NVIDIALLMService()
    
    raw_json = '{"summary": "Test summary", "risk_level": "HIGH", "fraud_probability": 0.85, "key_risk_factors": ["High amount"], "claim_analysis": "Detailed analysis", "supporting_evidence": [], "recommended_investigation_steps": ["Step 1"], "limitations": []}'
    parsed = service._parse_json_response(raw_json)
    assert parsed is not None
    assert parsed["risk_level"] == "HIGH"

    raw_markdown_json = '```json\n{"summary": "Test summary 2", "risk_level": "LOW", "fraud_probability": 0.1, "key_risk_factors": [], "claim_analysis": "Analysis", "supporting_evidence": [], "recommended_investigation_steps": [], "limitations": []}\n```'
    parsed_md = service._parse_json_response(raw_markdown_json)
    assert parsed_md is not None
    assert parsed_md["risk_level"] == "LOW"

def test_llm_fallback_report_generation():
    service = NVIDIALLMService()
    claim = {"claim_amount": 100000}
    ml_pred = {"risk_level": "HIGH", "fraud_probability": 0.88, "insights": ["Excessive billing"]}
    rag_ctx = {"documents": ["Sample doc content"], "metadata": [{"filename": "sample.md"}], "scores": [0.95]}

    report = service._build_fallback_report(claim, ml_pred, rag_ctx)
    assert report.risk_level == "HIGH"
    assert report.fraud_probability == 0.88
    assert len(report.recommended_investigation_steps) > 0
