import sys
import os
import pytest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from rag.ingest import ingest_knowledge_base
from rag.retriever import retrieve_relevant_documents, construct_query_from_claim

def test_rag_ingestion_and_retrieval():
    # Test document ingestion
    count = ingest_knowledge_base()
    assert count > 0

    # Test retrieval with relevant query
    results = retrieve_relevant_documents("upcoding and unbundling duplicate billing", top_k=3)
    assert "documents" in results
    assert "metadata" in results
    assert "scores" in results
    assert len(results["documents"]) > 0
    assert len(results["metadata"]) == len(results["documents"])
    assert len(results["scores"]) == len(results["documents"])

def test_construct_query_from_claim():
    claim = {
        "claim_amount": 150000,
        "diagnosis_code": "I10",
        "procedure_code": "99213",
        "service_type": "Outpatient",
        "length_of_stay_days": 2
    }
    ml_res = {"risk_level": "HIGH", "fraud_probability": 0.85, "insights": ["Outpatient stay > 0"]}
    query = construct_query_from_claim(claim, ml_res)
    assert "150000" in query
    assert "Outpatient" in query
    assert "HIGH" in query
