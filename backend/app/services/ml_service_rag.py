import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from services.llm_service import llm_service

class RAGService:
    def __init__(self):
        self.knowledge_base = [
            "Healthcare fraud costs billions of dollars every year.",
            "Common types of fraud include billing for services not rendered, upcoding, and unbundling.",
            "Flagged claims have anomalous patterns in provider-patient distance or duplicate procedures."
        ]

    def query(self, prompt: str) -> str:
        try:
            rag_context = {
                "documents": self.knowledge_base,
                "metadata": [{"filename": "general_fraud_kb.md"} for _ in self.knowledge_base],
                "scores": [0.9, 0.85, 0.8]
            }
            return llm_service.generate_chat_reply(
                query=prompt,
                claim_data=None,
                rag_context=rag_context,
                history=[]
            )
        except Exception as e:
            return f"An error occurred while calling the LLM router: {str(e)}"

rag_service = RAGService()
