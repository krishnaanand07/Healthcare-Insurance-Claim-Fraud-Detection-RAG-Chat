import sys
import os
from typing import Dict, Any, List

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from rag.embeddings import embedding_service
from rag.vectorstore import vector_store

def retrieve_relevant_documents(query: str, top_k: int = 5) -> Dict[str, Any]:
    """
    Retrieve top-k relevant knowledge base chunks for a given query string.
    Returns dict formatted as:
    {
      "documents": [...],
      "metadata": [...],
      "scores": [...]
    }
    """
    if not query or not query.strip():
        return {"documents": [], "metadata": [], "scores": []}

    query_vector = embedding_service.embed_query(query)
    results = vector_store.similarity_search(query_vector, top_k=top_k)

    documents = []
    metadata = []
    scores = []

    for doc, meta, score in results:
        documents.append(doc)
        metadata.append(meta)
        scores.append(score)

    return {
        "documents": documents,
        "metadata": metadata,
        "scores": scores
    }

def construct_query_from_claim(claim_data: Dict[str, Any], ml_prediction: Dict[str, Any] = None) -> str:
    """
    Helper function to construct a dense search query from claim details and ML prediction.
    """
    query_parts = []
    
    amount = claim_data.get("claim_amount") or claim_data.get("Claim_Amount")
    if amount:
        query_parts.append(f"Claim Amount: ${amount}")

    diag = claim_data.get("diagnosis_code") or claim_data.get("Diagnosis_Code")
    proc = claim_data.get("procedure_code") or claim_data.get("Procedure_Code")
    if diag or proc:
        query_parts.append(f"Diagnosis code {diag} Procedure code {proc}")

    svc_type = claim_data.get("service_type") or claim_data.get("Service_Type")
    los = claim_data.get("length_of_stay_days") or claim_data.get("Length_of_Stay_Days")
    if svc_type or los is not None:
        query_parts.append(f"Service Type: {svc_type}, Length of Stay: {los} days")

    prov_type = claim_data.get("provider_type") or claim_data.get("Provider_Type_Hospital")
    specialty = claim_data.get("provider_specialty")
    if prov_type or specialty:
        query_parts.append(f"Provider Type: {prov_type}, Specialty: {specialty}")

    dist = claim_data.get("provider_patient_distance_miles") or claim_data.get("Provider_Patient_Distance_Miles")
    if dist is not None:
        query_parts.append(f"Distance: {dist} miles")

    late = claim_data.get("claim_submitted_late") or claim_data.get("Claim_Submitted_Late")
    if late:
        query_parts.append("Late submission billing anomaly")

    if ml_prediction:
        risk_lvl = ml_prediction.get("risk_level")
        probability = ml_prediction.get("fraud_probability") or (ml_prediction.get("risk_score", 0) / 100.0)
        insights = ml_prediction.get("insights", [])
        query_parts.append(f"ML Fraud Risk Level: {risk_lvl}, Probability: {probability}")
        if insights:
            query_parts.append("Anomalies: " + "; ".join(insights))

    return ". ".join(query_parts) if query_parts else "Healthcare insurance claim fraud risk factors and guidelines"
