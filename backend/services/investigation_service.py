import sys
import os
from typing import Dict, Any

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from services.ml_service import ml_service
from services.llm_service import llm_service
from rag.retriever import retrieve_relevant_documents, construct_query_from_claim

class AIInvestigationService:
    def investigate_claim(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Full orchestration pipeline:
        1. Run ML Model prediction
        2. Construct RAG search query
        3. Retrieve relevant knowledge-base context
        4. Call NVIDIA LLM API for AI analysis report
        5. Return structured JSON payload
        """
        # Step 1: Run ML Engine
        ml_result = ml_service.predict(claim_data)

        # Step 2 & 3: Construct Query and Retrieve RAG Context
        retrieval_query = construct_query_from_claim(claim_data, ml_result)
        rag_results = retrieve_relevant_documents(retrieval_query, top_k=5)

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

        # Step 4: Call NVIDIA LLM for AI Investigation Analysis
        ai_analysis = llm_service.generate_investigation_report(
            claim_data=claim_data,
            ml_prediction=ml_result,
            rag_context=rag_results
        )

        return {
            "ml_prediction": ml_result,
            "retrieved_context": retrieved_context_items,
            "ai_analysis": ai_analysis.model_dump()
        }

investigation_service = AIInvestigationService()
