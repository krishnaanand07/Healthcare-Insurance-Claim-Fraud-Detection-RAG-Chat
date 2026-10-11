import sys
import os
import time
import uuid
import logging
from typing import Dict, Any, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from services.ml_service import ml_service
from services.llm_service import llm_service
from rag.retriever import retrieve_relevant_documents, construct_query_from_claim

logger = logging.getLogger("investigation_service")

class AIInvestigationService:
    def investigate_claim(self, claim_data: Dict[str, Any], correlation_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Full orchestration pipeline with structured timing diagnostics:
        1. Run ML Model prediction (reused in-memory artifacts)
        2. Construct RAG search query
        3. Retrieve relevant knowledge-base context
        4. Call Multi-LLM Router for AI analysis report
        5. Return structured JSON payload
        """
        req_id = correlation_id or str(uuid.uuid4())[:8]
        t_total_start = time.time()
        print(f"[InvestigationService][req={req_id}] Starting claim investigation...")

        # Step 1: Run ML Engine
        t_ml_start = time.time()
        ml_result = ml_service.predict(claim_data)
        ml_duration_ms = int((time.time() - t_ml_start) * 1000)
        print(f"[InvestigationService][req={req_id}] Step 1 (ML Prediction) completed in {ml_duration_ms}ms (risk={ml_result.get('risk_level')}, score={ml_result.get('risk_score')}).")

        # Step 2 & 3: Construct Query and Retrieve RAG Context
        t_rag_start = time.time()
        retrieval_query = construct_query_from_claim(claim_data, ml_result)
        rag_results = retrieve_relevant_documents(retrieval_query, top_k=5)
        rag_duration_ms = int((time.time() - t_rag_start) * 1000)
        doc_count = len(rag_results.get("documents", []))
        print(f"[InvestigationService][req={req_id}] Step 2 & 3 (RAG Retrieval) retrieved {doc_count} chunks in {rag_duration_ms}ms.")

        # Format retrieved context for API payload
        retrieved_context_items = []
        docs = rag_results.get("documents", [])
        metas = rag_results.get("metadata", [])
        scores = rag_results.get("scores", [])

        for i in range(len(docs)):
            m = metas[i] if i < len(metas) else {}
            retrieved_context_items.append({
                "document": docs[i],
                "filename": m.get("filename", "knowledge_base.md"),
                "section": m.get("section", "General"),
                "score": scores[i] if i < len(scores) else 0.0
            })

        # Step 4: Call Multi-LLM Router for AI Investigation Analysis
        t_llm_start = time.time()
        ai_analysis = llm_service.generate_investigation_report(
            claim_data=claim_data,
            ml_prediction=ml_result,
            rag_context=rag_results
        )
        llm_duration_ms = int((time.time() - t_llm_start) * 1000)
        print(f"[InvestigationService][req={req_id}] Step 4 (LLM Report Generation) completed in {llm_duration_ms}ms.")

        total_duration_ms = int((time.time() - t_total_start) * 1000)
        print(f"[InvestigationService][req={req_id}] Total investigation duration: {total_duration_ms}ms [ML={ml_duration_ms}ms, RAG={rag_duration_ms}ms, LLM={llm_duration_ms}ms].")

        return {
            "ml_prediction": ml_result,
            "retrieved_context": retrieved_context_items,
            "ai_analysis": ai_analysis.model_dump(),
            "diagnostics": {
                "correlation_id": req_id,
                "total_duration_ms": total_duration_ms,
                "ml_duration_ms": ml_duration_ms,
                "rag_duration_ms": rag_duration_ms,
                "llm_duration_ms": llm_duration_ms
            }
        }

investigation_service = AIInvestigationService()
