"""
Rule engine.
Reads a tender's eligibility toggles and returns the list of documents
a bidder must upload for that specific tender.
"""

# Documents required on every tender, regardless of toggles
ALWAYS_REQUIRED = [
    {"document_type": "GST Registration Certificate", "mandatory": True},
    {"document_type": "GST Returns", "mandatory": True},
    {"document_type": "PAN Card", "mandatory": True},
    {"document_type": "Non-blacklisting Declaration", "mandatory": True},
]


def generate_checklist(tender) -> list[dict]:
    """
    tender: a Tender model instance (or anything with the same attribute names)
    Returns: list of {"document_type": str, "mandatory": bool}
    """
    checklist = list(ALWAYS_REQUIRED)

    if tender.mse_only:
        checklist.append({"document_type": "Udyam Registration Certificate", "mandatory": True})

    if tender.make_in_india_required:
        checklist.append({"document_type": "Make in India / Local Content Certificate", "mandatory": True})

    if tender.manpower_component:
        checklist.append({"document_type": "EPFO Registration Certificate", "mandatory": True})
        checklist.append({"document_type": "ESIC Registration Certificate", "mandatory": True})

    if tender.startup_exemption_allowed:
        checklist.append({"document_type": "Startup India (DPIIT) Certificate", "mandatory": False})

    if tender.oem_authorization_required:
        checklist.append({"document_type": "OEM Authorization Letter", "mandatory": True})

    if tender.nsic_accepted:
        checklist.append({"document_type": "NSIC Registration Certificate", "mandatory": False})

    if tender.min_turnover:
        checklist.append({"document_type": "Turnover / Audited Financial Statements", "mandatory": True})

    if tender.min_experience_years:
        checklist.append({"document_type": "Experience Certificates", "mandatory": True})

    return checklist