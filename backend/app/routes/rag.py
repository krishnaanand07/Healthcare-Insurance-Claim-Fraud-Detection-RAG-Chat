from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ml_service_rag import rag_service

router = APIRouter()

class QueryRequest(BaseModel):
    query: str

@router.post("/query")
def query_knowledge_base(request: QueryRequest):
    response = rag_service.query(request.query)
    return {
        "query": request.query,
        "response": response
    }
