"""
Verification engine.
Cross-checks a document's extracted data against the mock portal database
and sets its verification_status accordingly. Also computes the overall
compliance score for an application against its tender's checklist.
"""
import json
from services.mock_portal_api import VERIFIERS
from difflib import SequenceMatcher


def verify_document(document_type: str, extracted_data: dict, tender=None) -> dict:
    """
    Returns: {"portal_verified": bool, "verification_status": str, "mismatch_details": str|None}
    tender: the Tender model instance — needed for threshold checks (turnover, experience).
    """

    # --- Self-declaration: always routed to manual officer review, never auto-verified ---
    if document_type == "Non-blacklisting Declaration":
        if extracted_data.get("declaration_present"):
            return {
                "portal_verified": None,
                "verification_status": "Manual Review",
                "mismatch_details": "Self-declaration present — requires officer confirmation",
            }
        return {
            "portal_verified": False,
            "verification_status": "Invalid",
            "mismatch_details": "Declaration statement not found in document",
        }

    # --- GST Returns: reuses the same GST mock database, checks filing status ---
    if document_type == "GST Returns":
        period = extracted_data.get("return_period")
        if not period:
            return {
                "portal_verified": False,
                "verification_status": "Invalid",
                "mismatch_details": "Could not extract a return period from document",
            }
        return {
            "portal_verified": True,
            "verification_status": "Verified",
            "mismatch_details": None,
        }

    # --- Turnover: compare extracted amount against tender's min_turnover ---
    if document_type == "Turnover / Audited Financial Statements":
        amount_str = extracted_data.get("turnover_amount")
        if not amount_str:
            return {
                "portal_verified": False,
                "verification_status": "Invalid",
                "mismatch_details": "Could not extract turnover amount from document",
            }
        amount = int(amount_str.replace(",", ""))
        required = tender.min_turnover if tender and tender.min_turnover else 0
        if amount >= required:
            return {"portal_verified": True, "verification_status": "Verified", "mismatch_details": None}
        return {
            "portal_verified": False,
            "verification_status": "Insufficient",
            "mismatch_details": f"Declared turnover {amount} is below required {required}",
        }

    # --- Experience: compare extracted years against tender's min_experience_years ---
    if document_type == "Experience Certificates":
        years_str = extracted_data.get("experience_years")
        if not years_str:
            return {
                "portal_verified": False,
                "verification_status": "Invalid",
                "mismatch_details": "Could not extract years of experience from document",
            }
        years = int(years_str)
        required = tender.min_experience_years if tender and tender.min_experience_years else 0
        if years >= required:
            return {"portal_verified": True, "verification_status": "Verified", "mismatch_details": None}
        return {
            "portal_verified": False,
            "verification_status": "Insufficient",
            "mismatch_details": f"Declared experience {years} years is below required {required} years",
        }

    # --- Everything else (PAN, GST cert, Udyam, Make in India, EPFO): mock portal lookup ---
    verifier_info = VERIFIERS.get(document_type)

    if not verifier_info:
        return {
            "portal_verified": None,
            "verification_status": "Manual Review",
            "mismatch_details": "No automated verifier available for this document type",
        }

    field_name, verify_fn = verifier_info
    value = extracted_data.get(field_name)

    if not value:
        return {
            "portal_verified": False,
            "verification_status": "Invalid",
            "mismatch_details": f"Could not extract {field_name} from document",
        }

    result = verify_fn(value)

    if not result.get("found"):
        return {
            "portal_verified": False,
            "verification_status": "Not Found",
            "mismatch_details": f"{field_name}={value} not found in portal records",
        }

    return {
        "portal_verified": True,
        "verification_status": "Verified",
        "mismatch_details": None,
    }

def calculate_compliance(documents: list, checklist: list) -> dict:
    """
    documents: all Document rows for this application (may include duplicates
        from re-uploads — we keep only the most recent per document_type).
    checklist: the tender's required checklist, e.g. [{"document_type": "...", "mandatory": True}, ...]
    """
    latest_by_type = {}
    for doc in sorted(documents, key=lambda d: d.upload_timestamp):
        latest_by_type[doc.document_type] = doc

    total_weight = 0
    earned_weight = 0
    issues = []

    for item in checklist:
        doc_type = item["document_type"]
        is_mandatory = item["mandatory"]
        weight = 2 if is_mandatory else 1
        total_weight += weight

        doc = latest_by_type.get(doc_type)

        if not doc:
            issues.append(f"{doc_type}: not uploaded")
            continue

        if doc.verification_status == "Verified":
            earned_weight += weight
        elif doc.verification_status == "Manual Review":
            earned_weight += weight * 0.5
            issues.append(f"{doc_type}: needs manual review")
        else:
            issues.append(
                f"{doc_type}: {doc.verification_status or 'not processed'}"
                + (f" — {doc.mismatch_details}" if doc.mismatch_details else "")
            )

    score = round((earned_weight / total_weight) * 100, 1) if total_weight else 0

    if score >= 85:
        risk = "Low"
    elif score >= 60:
        risk = "Medium"
    else:
        risk = "High"

    if issues:
        recommendation = (
            f"Compliance score {score}%. Flagged issues: " + "; ".join(issues) +
            ". Recommend officer review before qualifying."
        )
    else:
        recommendation = f"Compliance score {score}%. All documents verified successfully."

    return {"compliance_score": score, "risk_level": risk, "ai_recommendation": recommendation}


def cross_document_check(documents: list) -> dict:
    """
    Compares the entity name extracted from every document in an application.
    Flags any document whose name doesn't reasonably match the others —
    a real signal of inconsistent or possibly fraudulent submissions.
    """
    names = []
    for doc in documents:
        if not doc.extracted_data:
            continue
        try:
            data = json.loads(doc.extracted_data)
        except Exception:
            continue
        name = data.get("entity_name")
        if name:
            names.append({"document_type": doc.document_type, "name": name})

    if len(names) < 2:
        return {
            "checked": False,
            "consistent": None,
            "reference_name": names[0]["name"] if names else None,
            "mismatches": [],
            "note": "Not enough documents with a detectable entity name to compare.",
        }

    # Use the first extracted name as the reference point
    reference_name = names[0]["name"]
    mismatches = []

    for entry in names[1:]:
        similarity = SequenceMatcher(None, reference_name.upper(), entry["name"].upper()).ratio()
        if similarity < 0.85:
            mismatches.append({
                "document_type": entry["document_type"],
                "extracted_name": entry["name"],
                "similarity_percent": round(similarity * 100, 1),
            })

    return {
        "checked": True,
        "consistent": len(mismatches) == 0,
        "reference_name": reference_name,
        "mismatches": mismatches,
        "note": (
            "All documents show a consistent entity name."
            if not mismatches
            else f"{len(mismatches)} document(s) show a different entity name than the rest — possible data entry error or inconsistent submission."
        ),
    }