"""
Dashboard routes.
GET  /dashboard/{application_id} -> compute compliance score + risk + recommendation,
    save it on the Application, return only the latest upload per document type.
POST /dashboard/{application_id}/decision -> officer submits qualify/disqualify/clarify.
GET  /dashboard/{application_id}/audit -> full audit trail for this application.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timezone
import json
import os

from database import get_db
from models.application import Application
from models.document import Document
from models.audit_log import AuditLog
from models.tender import Tender
from services.verification_engine import calculate_compliance,cross_document_check
from services.rule_engine import generate_checklist
from services.audit_service import log_action


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def to_file_url(file_path: str) -> str | None:
    """
    Converts a stored path like 'uploads/APP-XXXX/cert.pdf' (or the Windows
    equivalent with backslashes) into a URL the frontend can open directly,
    e.g. '/files/APP-XXXX/cert.pdf' — matching the StaticFiles mount in main.py.
    """
    if not file_path:
        return None
    normalized = file_path.replace("\\", "/")
    relative = normalized.split("uploads/", 1)[-1]
    return f"/files/{relative}"


@router.get("/{application_id}")
def get_dashboard(application_id: str, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.application_id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    all_documents = db.query(Document).filter(Document.application_id == application_id).all()

    tender = db.query(Tender).filter(Tender.tender_id == application.tender_id).first()
    checklist = generate_checklist(tender)

    result = calculate_compliance(all_documents, checklist)

    application.compliance_score = result["compliance_score"]
    application.risk_level = result["risk_level"]
    application.ai_recommendation = result["ai_recommendation"]
    db.commit()
    db.refresh(application)

    log_action(db, application_id, "DASHBOARD_VIEWED", actor="officer", details=result)


    # Keep only the latest upload per document_type for a clean dashboard view
    latest_by_type = {}
    for doc in sorted(all_documents, key=lambda d: d.upload_timestamp):
        latest_by_type[doc.document_type] = doc

    cross_check = cross_document_check(list(latest_by_type.values()))

    return {
        "application_id": application_id,
        "compliance_score": application.compliance_score,
        "risk_level": application.risk_level,
        "ai_recommendation": application.ai_recommendation,
        "decision": application.decision,
        "decision_reason": application.decision_reason,
        "decided_by": application.decided_by,
        "decided_at": application.decided_at,
        "documents": [
            {
                "document_id": d.document_id,
                "document_type": d.document_type,
                "is_mandatory": d.is_mandatory,
                "verification_status": d.verification_status,
                "format_valid": d.format_valid,
                "mismatch_details": d.mismatch_details,
                "is_duplicate": d.is_duplicate,
                "duplicate_of": d.duplicate_of,
                # Parsed extracted fields (PAN number, GSTIN, entity name, etc.)
                # so the officer can see exactly what was read off the document,
                # not just a pass/fail status.
                "extracted_data": json.loads(d.extracted_data) if d.extracted_data else {},
                "file_url": to_file_url(d.file_path),
            }
            for d in latest_by_type.values()
        ],
        "cross_document_check": cross_check,
    }


class DecisionInput(BaseModel):
    decision: str
    decision_reason: str | None = None
    decided_by: str = "officer_demo"


@router.post("/{application_id}/decision")
def submit_decision(application_id: str, payload: DecisionInput, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.application_id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    valid_decisions = {"Qualified", "Disqualified", "Clarification Requested"}
    if payload.decision not in valid_decisions:
        raise HTTPException(status_code=400, detail=f"decision must be one of {valid_decisions}")

    application.decision = payload.decision
    application.decision_reason = payload.decision_reason
    application.decided_by = payload.decided_by
    application.decided_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(application)

    log_action(
        db, application_id, "OFFICER_DECISION", actor=payload.decided_by,
        details={"decision": payload.decision, "reason": payload.decision_reason},
    )

    return {
        "application_id": application.application_id,
        "decision": application.decision,
        "decision_reason": application.decision_reason,
        "decided_by": application.decided_by,
        "decided_at": application.decided_at,
    }

@router.get("/{application_id}/audit")
def get_audit_trail(application_id: str, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).filter(AuditLog.application_id == application_id).order_by(AuditLog.timestamp).all()
    return logs