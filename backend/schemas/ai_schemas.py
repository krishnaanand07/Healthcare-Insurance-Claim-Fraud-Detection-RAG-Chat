from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class SupportingEvidence(BaseModel):
    source: str = Field(..., description="Document filename or section name")
    relevance: str = Field("High", description="Relevance rating: High, Medium, Low")
    text: str = Field(..., description="Relevant text excerpt from retrieved document")

class AIInvestigationAnalysis(BaseModel):
    summary: str = Field(..., description="Executive summary of the risk assessment")
    risk_level: str = Field("LOW", description="Risk level: LOW, MEDIUM, or HIGH")
    fraud_probability: float = Field(0.0, description="Fraud probability between 0.0 and 1.0")
    key_risk_factors: List[str] = Field(default_factory=list, description="List of identified risk factors")
    claim_analysis: str = Field(..., description="Detailed clinical and financial claim analysis")
    supporting_evidence: List[SupportingEvidence] = Field(default_factory=list, description="Retrieved evidence items")
    recommended_investigation_steps: List[str] = Field(default_factory=list, description="Actionable investigation steps")
    limitations: List[str] = Field(default_factory=list, description="Analysis limitations or missing data points")

class InvestigationRequest(BaseModel):
    claim: Dict[str, Any] = Field(..., description="Healthcare claim features and payload")

class RetrievedContextItem(BaseModel):
    document: str
    filename: str
    section: str
    score: float

class InvestigationResponse(BaseModel):
    ml_prediction: Dict[str, Any]
    retrieved_context: List[Dict[str, Any]]
    ai_analysis: AIInvestigationAnalysis
    diagnostics: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    query: str
    claim: Optional[Dict[str, Any]] = None
    investigation_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    retrieved_sources: List[Dict[str, Any]]
    investigation_id: str
