import sys
import os
from fastapi import APIRouter, HTTPException

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from schemas.ai_schemas import ChatRequest, ChatResponse
from services.chat_service import chat_service

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest):
    """
    POST /api/ai/chat
    Interacts with the RAG Assistant for Q&A grounded in retrieved knowledge base context.
    """
    try:
        result = chat_service.process_chat(
            query=payload.query,
            claim_data=payload.claim,
            investigation_id=payload.investigation_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")
