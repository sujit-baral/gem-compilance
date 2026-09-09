"""
Tender routes.
POST /tenders  -> officer creates a tender, gets back the generated checklist
GET  /tenders/{tender_id} -> anyone (bidder) views tender + its checklist
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models.tender import Tender
from services.rule_engine import generate_checklist

router = APIRouter(prefix="/tenders", tags=["Tenders"])


class TenderCreate(BaseModel):
    title: str
    category: str
    description: Optional[str] = None
    estimated_value: Optional[int] = None
    mse_only: bool = False
    make_in_india_required: bool = False
    min_local_content_percent: Optional[int] = None
    manpower_component: bool = False
    startup_exemption_allowed: bool = False
    oem_authorization_required: bool = False
    nsic_accepted: bool = False
    min_turnover: Optional[int] = None
    min_experience_years: Optional[int] = None
    submission_deadline: Optional[str] = None
    created_by: Optional[str] = "officer_demo"

@router.get("")
def list_tenders(db: Session = Depends(get_db)):
    tenders = db.query(Tender).all()
    return [
        {
            "tender_id": t.tender_id,
            "title": t.title,
            "category": t.category,
            "estimated_value": t.estimated_value,
            "deadline": t.submission_deadline,
        }
        for t in tenders
    ]


@router.post("")
def create_tender(payload: TenderCreate, db: Session = Depends(get_db)):
    sequence_number = str(db.query(Tender).count() + 1).zfill(3)
    tender_id = f"CPCL/PROC/2026/{sequence_number}"

    tender = Tender(tender_id=tender_id, **payload.dict())
    db.add(tender)
    db.commit()
    db.refresh(tender)

    checklist = generate_checklist(tender)

    return {"tender_id": tender_id, "tender": payload, "checklist": checklist}


@router.get("/{tender_id}")
def get_tender(tender_id: str, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(Tender.tender_id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    checklist = generate_checklist(tender)
    return {"tender": tender, "checklist": checklist}