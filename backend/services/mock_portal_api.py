"""
Mock government portal APIs.
Simulates Udyam/GSTN/PAN databases with a small dummy dataset, since real
portal APIs aren't accessible for this hackathon. Swap these functions for
real API calls later without touching any other code.
"""

# Dummy "official" records, keyed by the identifier a real portal would use
MOCK_PAN_DB = {
    "ABCDE1234F": {"legal_name": "Sample Technologies Pvt Ltd", "status": "Active"},
    "BNZPM2501F": {"legal_name": "D Manikandan Duraisamy", "status": "Active"},
}

MOCK_GST_DB = {
    "27ABCDE1234F1Z5": {"legal_name": "ABC Enterprises Pvt Ltd", "filing_status": "Active"},
}

MOCK_UDYAM_DB = {
    "UDYAM-MH-00-1234567": {"enterprise_name": "ABC Enterprises Pvt Ltd", "category": "Small"},
}


MOCK_MII_DB = {
    "MII-2026-000123": {"legal_name": "ABC Enterprises Pvt Ltd", "local_content_percent": 55},
}

MOCK_EPFO_DB = {
    "EPFO-1234567890": {"establishment_name": "ABC Enterprises Pvt Ltd", "status": "Active"},
}

MOCK_STARTUP_DB = {
    "DIPP123456": {"entity_name": "ABC Enterprises Pvt Ltd", "recognition_status": "Recognized"},
}

MOCK_NSIC_DB = {
    "NSIC-27-123456": {"enterprise_name": "ABC Enterprises Pvt Ltd", "status": "Active"},
}

MOCK_OEM_DB = {
    "OEM-AUTH-123456": {"authorized_dealer": "ABC Enterprises Pvt Ltd", "oem_name": "Sample OEM Ltd"},
}


def verify_startup(dpiit_number: str) -> dict:
    record = MOCK_STARTUP_DB.get(dpiit_number)
    if not record:
        return {"found": False}
    return {"found": True, **record}


def verify_nsic(nsic_number: str) -> dict:
    record = MOCK_NSIC_DB.get(nsic_number)
    if not record:
        return {"found": False}
    return {"found": True, **record}


def verify_oem(oem_auth_number: str) -> dict:
    record = MOCK_OEM_DB.get(oem_auth_number)
    if not record:
        return {"found": False}
    return {"found": True, **record}


def verify_mii(cert_number: str) -> dict:
    record = MOCK_MII_DB.get(cert_number)
    if not record:
        return {"found": False}
    return {"found": True, **record}


def verify_epfo(epfo_number: str) -> dict:
    record = MOCK_EPFO_DB.get(epfo_number)
    if not record:
        return {"found": False}
    return {"found": True, **record}


def verify_pan(pan_number: str) -> dict:
    record = MOCK_PAN_DB.get(pan_number)
    if not record:
        return {"found": False}
    return {"found": True, **record}


def verify_gst(gstin: str) -> dict:
    record = MOCK_GST_DB.get(gstin)
    if not record:
        return {"found": False}
    return {"found": True, **record}


def verify_udyam(udyam_number: str) -> dict:
    record = MOCK_UDYAM_DB.get(udyam_number)
    if not record:
        return {"found": False}
    return {"found": True, **record}


# Maps document_type -> (extracted field name, verification function)
VERIFIERS = {
    "PAN Card": ("pan_number", verify_pan),
    "GST Registration Certificate": ("gstin", verify_gst),
    "Udyam Registration Certificate": ("udyam_number", verify_udyam),
    "Make in India / Local Content Certificate": ("mii_certificate_number", verify_mii),
    "EPFO Registration Certificate": ("epfo_number", verify_epfo),
    "Startup India (DPIIT) Certificate": ("dpiit_number", verify_startup),
    "NSIC Registration Certificate": ("nsic_number", verify_nsic),
    "OEM Authorization Letter": ("oem_auth_number", verify_oem),
}