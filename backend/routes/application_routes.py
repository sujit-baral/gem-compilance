"""
Application routes.
POST /applications -> bidder starts a bid on a specific tender.
   Creates the Application ID and links Bidder + Tender.
   Returns the checklist so the frontend knows what upload slots to show.
GET  /applications/{application_id} -> view application status
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.application import Application
from models.tender import Tender
from models.bidder import Bidder
from services.rule_engine import generate_checklist

router = APIRouter(prefix="/applications", tags=["Applications"])


class ApplicationCreate(BaseModel):
    tender_id: str
    bidder_id: str

@router.get("")
def list_applications(db: Session = Depends(get_db)):
    applications = db.query(Application).all()
    result = []
    for a in applications:
        bidder = db.query(Bidder).filter(Bidder.bidder_id == a.bidder_id).first()
        tender = db.query(Tender).filter(Tender.tender_id == a.tender_id).first()
        result.append({
            "application_id": a.application_id,
            "bidder_name": bidder.company_name if bidder else "Unknown",
            "tender_id": a.tender_id,
            "tender_title": tender.title if tender else "Unknown",
            "compliance_score": a.compliance_score,
            "risk_level": a.risk_level,
            "decision": a.decision,
        })
    return result

@router.post("")
def create_application(payload: ApplicationCreate, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(Tender.tender_id == payload.tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    bidder = db.query(Bidder).filter(Bidder.bidder_id == payload.bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")

    # Check if this bidder has already applied to this tender
    existing_application = db.query(Application).filter(
        Application.tender_id == payload.tender_id,
        Application.bidder_id == payload.bidder_id
    ).first()

    if existing_application:
        raise HTTPException(
            status_code=400,
            detail="This bidder has already applied to this tender."
    )

       # Extract "2026" and "002" from "CPCL/PROC/2026/002" -> "2026-002"
    tender_parts = payload.tender_id.split("/")
    tender_ref = "-".join(tender_parts[-2:]) if len(tender_parts) >= 2 else payload.tender_id.replace("/", "")

    application_id = f"APP-{tender_ref}-{payload.bidder_id[-6:]}-{uuid.uuid4().hex[:4].upper()}"

    application = Application(
        application_id=application_id,
        tender_id=payload.tender_id,
        bidder_id=payload.bidder_id,
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    checklist = generate_checklist(tender)

    return {"application": application, "checklist": checklist}


@router.get("/{application_id}")
def get_application(application_id: str, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.application_id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

@router.post("/{application_id}/submit")
def submit_application(application_id: str, db: Session = Depends(get_db)):
    from datetime import datetime, timezone
    from models.document import Document
    from models.tender import Tender
    from services.rule_engine import generate_checklist

    application = db.query(Application).filter(Application.application_id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    tender = db.query(Tender).filter(Tender.tender_id == application.tender_id).first()
    checklist = generate_checklist(tender)

    documents = db.query(Document).filter(Document.application_id == application_id).all()
    uploaded_types = {d.document_type for d in documents}

    missing_mandatory = [
        item["document_type"] for item in checklist
        if item["mandatory"] and item["document_type"] not in uploaded_types
    ]

    if missing_mandatory:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot submit — missing mandatory documents: {', '.join(missing_mandatory)}",
        )

    application.is_submitted = True
    application.submitted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(application)

    return {
        "application_id": application_id,
        "is_submitted": True,
        "submitted_at": application.submitted_at,
    }