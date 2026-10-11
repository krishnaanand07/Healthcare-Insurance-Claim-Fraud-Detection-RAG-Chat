import sys
import os
import uuid
import logging
import traceback
from fastapi import APIRouter, HTTPException, Request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from schemas.ai_schemas import InvestigationRequest, InvestigationResponse
from services.investigation_service import investigation_service

logger = logging.getLogger("ai_investigation_route")
router = APIRouter()

@router.post("/investigate", response_model=InvestigationResponse)
def investigate_claim_endpoint(payload: InvestigationRequest, request: Request):
    """
    POST /api/ai/investigate
    Performs full AI claim investigation:
    1. Runs ML model prediction (reused in-memory artifacts).
    2. Retrieves knowledge-base RAG evidence.
    3. Prompts Multi-LLM Router for structured JSON investigation report.
    """
    correlation_id = request.headers.get("x-request-id") or str(uuid.uuid4())[:8]
    try:
        result = investigation_service.investigate_claim(payload.claim, correlation_id=correlation_id)
        return result
    except Exception as e:
        logger.error(f"[AIInvestigationRoute][req={correlation_id}] Unhandled error: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"AI Investigation pipeline error: {str(e)}")
