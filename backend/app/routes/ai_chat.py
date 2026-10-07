import sys
import os
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

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

@router.post("/chat/stream")
def chat_stream_endpoint(payload: ChatRequest):
    """
    POST /api/ai/chat/stream
    Task 10: Streams LLM output tokens in real-time as Server-Sent Events (SSE).
    """
    def event_generator():
        try:
            for token in chat_service.process_chat_stream(
                query=payload.query,
                claim_data=payload.claim,
                investigation_id=payload.investigation_id
            ):
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
