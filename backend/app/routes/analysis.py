from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import models, db

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_metrics(session: Session = Depends(db.get_db)):
    total_claims = session.query(models.Claim).count()
    
    flagged_statuses = ["Suspicious / Potential Fraud", "Requires Human Review", "flagged"]
    approved_statuses = ["Likely Genuine", "approved"]
    
    flagged_claims = session.query(models.Claim).filter(models.Claim.status.in_(flagged_statuses)).count()
    approved_claims = session.query(models.Claim).filter(models.Claim.status.in_(approved_statuses)).count()
    
    total_amount_result = session.query(func.sum(models.Claim.claim_amount)).scalar()
    total_amount = float(total_amount_result) if total_amount_result else 0.0

    flagged_amount_result = session.query(func.sum(models.Claim.claim_amount)).filter(models.Claim.status.in_(flagged_statuses)).scalar()
    flagged_amount = float(flagged_amount_result) if flagged_amount_result else 0.0
    
    approval_rate = 0.0
    flagged_rate = 0.0
    if total_claims > 0:
        approval_rate = approved_claims / total_claims
        flagged_rate = flagged_claims / total_claims
        
    return {
        "total_claims": total_claims,
        "flagged_claims": flagged_claims,
        "approval_rate": round(approval_rate, 2),
        "flagged_rate": round(flagged_rate, 2),
        "total_amount": total_amount,
        "flagged_amount": flagged_amount
    }
