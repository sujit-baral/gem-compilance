"""
Document routes.
POST /documents/upload -> bidder uploads a file. File is saved, then
   immediately run through extraction + format validation, and the
   Document row is updated with the results.
GET  /documents/application/{application_id} -> list all documents for an application.
"""
import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from database import get_db
from models.document import Document
from models.application import Application
from services.file_storage import save_uploaded_file, compute_file_hash
from services.ocr_extraction import extract_raw_text, extract_fields, document_type_matches
from services.format_validator import validate_field
from services.verification_engine import verify_document
from models.tender import Tender

MAX_FILE_SIZE_MB = 5

router = APIRouter(prefix="/documents", tags=["Documents"])

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}

# Maps document_type -> which extracted field name to run format validation on
PRIMARY_FIELD = {
    "PAN Card": "pan",
    "GST Registration Certificate": "gstin",
    "Udyam Registration Certificate": "udyam_number",
}


@router.post("/upload")
def upload_document(
    application_id: str = Form(...),
    document_type: str = Form(...),
    is_mandatory: bool = Form(True),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    application = db.query(Application).filter(Application.application_id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    ext = "." + file.filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed. Use PDF, JPG, or PNG.")

    file_bytes = file.file.read()
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"File too large ({size_mb:.1f} MB). Max allowed is {MAX_FILE_SIZE_MB} MB.")

    file.file.seek(0)  # reset pointer so save_uploaded_file can read it again

    file_path = save_uploaded_file(application_id, file)
    document_id = f"DOC-{application_id[-8:]}-{uuid.uuid4().hex[:4].upper()}"

    file_hash = compute_file_hash(file_path)

    # Get this application's bidder, so we can tell "same bidder reusing their own
    # document across tenders" (normal) apart from "different bidder submitted an
    # identical file" (suspicious).
    current_application = db.query(Application).filter(Application.application_id == application_id).first()
    current_bidder_id = current_application.bidder_id if current_application else None

    existing = None
    matching_docs = db.query(Document).filter(
        Document.file_hash == file_hash,
        Document.application_id != application_id,
    ).all()

    for match in matching_docs:
        match_application = db.query(Application).filter(Application.application_id == match.application_id).first()
        match_bidder_id = match_application.bidder_id if match_application else None

        # Only flag as suspicious if a DIFFERENT bidder used this exact same file
        if match_bidder_id and match_bidder_id != current_bidder_id:
            existing = match
            break

    document = Document(
        document_id=document_id,
        application_id=application_id,
        document_type=document_type,
        is_mandatory=is_mandatory,
        file_path=file_path,
        file_hash=file_hash,
        is_duplicate=bool(existing),
        duplicate_of=existing.application_id if existing else None,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    # --- Run extraction immediately after upload ---
    try:
        raw_text = extract_raw_text(file_path)

        if not document_type_matches(document_type, raw_text):
            document.extracted_data = json.dumps({"error": "Document content does not match selected type"})
            document.format_valid = False
            document.format_error = f"This file doesn't appear to be a {document_type}. Please check you selected the correct document type."
            document.verification_status = "Type Mismatch"
            document.mismatch_details = f"Uploaded file doesn't contain expected content for '{document_type}'."
            db.commit()
            db.refresh(document)
            return document

        extracted = extract_fields(document_type, raw_text)

        document.extracted_data = json.dumps(extracted)
        document.confidence_score = 0.0 if extracted.get("needs_manual_review") else 0.85

        # Run format validation on whichever field is the primary identifier for this doc type
        field_key = PRIMARY_FIELD.get(document_type)
        raw_field_name = list(extracted.keys())[0] if extracted else None

        if field_key and raw_field_name and raw_field_name != "raw_text_snippet":
            value = extracted.get(raw_field_name)
            is_valid, error_msg = validate_field(field_key, value or "")
            document.format_valid = is_valid
            document.format_error = error_msg if not is_valid else None
        else:
            document.format_valid = None

    except Exception as e:
        document.extracted_data = json.dumps({"error": str(e)})
        document.format_valid = False
        document.format_error = f"Extraction failed: {str(e)}"

           # --- Run mock portal verification ---
    try:
        extracted_dict = json.loads(document.extracted_data) if document.extracted_data else {}

        tender = db.query(Tender).filter(Tender.tender_id == application.tender_id).first()

        verification_result = verify_document(document_type, extracted_dict, tender=tender)
        document.portal_verified = verification_result["portal_verified"]
        document.verification_status = verification_result["verification_status"]
        document.mismatch_details = verification_result["mismatch_details"]
    except Exception as e:
        document.verification_status = "Error"
        document.mismatch_details = str(e)

    db.commit()
    db.refresh(document)

    return document


@router.get("/application/{application_id}")
def list_documents(application_id: str, db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.application_id == application_id).all()
    return docs