from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.claim import ClaimInput, ClaimResponse
from app.database import models, db
import uuid

router = APIRouter()

@router.post("/", response_model=ClaimResponse)
def create_claim(claim: ClaimInput, session: Session = Depends(db.get_db)):
    # Generate a unique claim ID
    new_claim_id = str(uuid.uuid4())
    
    # Create the database model
    db_claim = models.Claim(
        **claim.dict(),
        claim_id=new_claim_id,
        status="received"
    )
    
    session.add(db_claim)
    session.commit()
    session.refresh(db_claim)
    
    return ClaimResponse(claim_id=db_claim.claim_id, status=db_claim.status)

@router.get("/{claim_id}", response_model=ClaimResponse)
def get_claim(claim_id: str, session: Session = Depends(db.get_db)):
    db_claim = session.query(models.Claim).filter(models.Claim.claim_id == claim_id).first()
    
    if db_claim is None:
        raise HTTPException(status_code=404, detail="Claim not found")
        
    return ClaimResponse(claim_id=db_claim.claim_id, status=db_claim.status)
