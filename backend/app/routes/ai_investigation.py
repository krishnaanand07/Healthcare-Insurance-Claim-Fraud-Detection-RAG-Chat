import sys
import os
from fastapi import APIRouter, HTTPException

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from schemas.ai_schemas import InvestigationRequest, InvestigationResponse
from services.investigation_service import investigation_service

router = APIRouter()

@router.post("/investigate", response_model=InvestigationResponse)
def investigate_claim_endpoint(payload: InvestigationRequest):
    """
    POST /api/ai/investigate
    Performs full AI claim investigation:
    1. Runs ML model prediction.
    2. Retrieves knowledge-base RAG evidence.
    3. Prompts NVIDIA LLM for structured JSON investigation report.
    """
    try:
        result = investigation_service.investigate_claim(payload.claim)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Investigation service error: {str(e)}")
