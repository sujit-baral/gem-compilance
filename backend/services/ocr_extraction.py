"""
Text extraction pipeline.

Handles:
- Text-based PDFs -> PyMuPDF
- Scanned/image PDFs -> EasyOCR
- JPG/JPEG/PNG -> EasyOCR

Includes PAN OCR correction and validation.
"""

import os
import re
import cv2
import pymupdf
import easyocr

_reader = None


# ---------------------------------------------------------
# EASY OCR
# ---------------------------------------------------------

def get_reader():
    global _reader

    if _reader is None:
        _reader = easyocr.Reader(["en"], gpu=False)

    return _reader


# ---------------------------------------------------------
# IMAGE PREPROCESSING
# ---------------------------------------------------------

def preprocess_image(image_path):
    """
    Improve the image before sending it to EasyOCR.
    """

    image = cv2.imread(image_path)

    if image is None:
        return None

    # Make the image larger
    image = cv2.resize(
        image,
        None,
        fx=2,
        fy=2,
        interpolation=cv2.INTER_CUBIC
    )

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Improve contrast
    gray = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )[1]

    return gray


# ---------------------------------------------------------
# RAW TEXT EXTRACTION
# ---------------------------------------------------------

def extract_raw_text(file_path: str) -> str:

    ext = os.path.splitext(file_path)[1].lower()

    # -----------------------------------------------------
    # PDF
    # -----------------------------------------------------

    if ext == ".pdf":

        doc = pymupdf.open(file_path)

        text = ""

        for page in doc:
            text += page.get_text()

        # Normal text-based PDF
        if len(text.strip()) > 30:
            doc.close()
            return text

        # Scanned PDF -> EasyOCR
        reader = get_reader()

        ocr_text = ""

        for page in doc:

            pix = page.get_pixmap(dpi=250)

            img_bytes = pix.tobytes("png")

            results = reader.readtext(
                img_bytes,
                detail=0
            )

            ocr_text += " ".join(results) + "\n"

        doc.close()

        return ocr_text

    # -----------------------------------------------------
    # IMAGE
    # -----------------------------------------------------

    elif ext in [".jpg", ".jpeg", ".png"]:

        reader = get_reader()

        # First try original image
        results = reader.readtext(
            file_path,
            detail=0
        )

        text = " ".join(results)

        return text

    else:

        raise ValueError(
            f"Unsupported file type: {ext}"
        )


# ---------------------------------------------------------
# PAN OCR CORRECTION
# ---------------------------------------------------------

def correct_pan_candidate(candidate: str):
    """
    Correct common OCR mistakes using the PAN format:

        AAAAA9999A

    First 5 characters -> letters
    Next 4 characters -> numbers
    Last character -> letter
    """

    candidate = candidate.upper()

    # Keep only letters and numbers
    candidate = re.sub(r"[^A-Z0-9]", "", candidate)

    if len(candidate) != 10:
        return None

    chars = list(candidate)

    # ---------------------------------------------
    # First 5 positions must be LETTERS
    # ---------------------------------------------

    letter_corrections = {
        "0": "O",
        "1": "I",
        "2": "Z",
        "5": "S",
        "8": "B"
    }

    for i in range(5):

        if chars[i] in letter_corrections:
            chars[i] = letter_corrections[chars[i]]

    # ---------------------------------------------
    # Positions 6-9 must be NUMBERS
    # ---------------------------------------------

    number_corrections = {
        "O": "0",
        "I": "1",
        "L": "1",
        "S": "5",
        "B": "8",
        "Z": "2"
    }

    for i in range(5, 9):

        if chars[i] in number_corrections:
            chars[i] = number_corrections[chars[i]]

    # ---------------------------------------------
    # Last position must be LETTER
    # ---------------------------------------------

    if chars[9] in letter_corrections:
        chars[9] = letter_corrections[chars[9]]

    corrected = "".join(chars)

    # Final validation
    if re.fullmatch(r"[A-Z]{5}\d{4}[A-Z]", corrected):
        return corrected

    return None


# ---------------------------------------------------------
# FIND PAN
# ---------------------------------------------------------

def extract_pan(raw_text: str):
    """
    Find a PAN number from OCR text.

    First tries an exact PAN.
    Then tries OCR correction.
    """

    text = raw_text.upper()

    # -----------------------------------------------------
    # 1. Exact PAN
    # -----------------------------------------------------

    exact_match = re.search(
        r"\b[A-Z]{5}\d{4}[A-Z]\b",
        text
    )

    if exact_match:
        return exact_match.group(0)

    # -----------------------------------------------------
    # 2. Look at alphanumeric words
    # -----------------------------------------------------

    candidates = re.findall(
        r"[A-Z0-9]{10}",
        text
    )

    for candidate in candidates:

        corrected = correct_pan_candidate(candidate)

        if corrected:
            return corrected

    # -----------------------------------------------------
    # 3. Try every 10-character window
    #
    # Useful when OCR joins text together.
    # -----------------------------------------------------

    cleaned = re.sub(
        r"[^A-Z0-9]",
        "",
        text
    )

    for i in range(len(cleaned) - 9):

        candidate = cleaned[i:i + 10]

        corrected = correct_pan_candidate(candidate)

        if corrected:
            return corrected

    return None


# ---------------------------------------------------------
# FIELD PATTERNS
# ---------------------------------------------------------

FIELD_PATTERNS = {
    "PAN Card": {
        "pan_number": r"[A-Z]{5}\d{4}[A-Z]"
    },
    "GST Registration Certificate": {
        "gstin": r"\d{2}[A-Z]{5}\d{4}[A-Z]\dZ[A-Z\d]"
    },
    "Udyam Registration Certificate": {
        "udyam_number": r"UDYAM-[A-Z]{2}-\d{2}-\d{7}"
    },
    "Make in India / Local Content Certificate": {
        "mii_certificate_number": r"MII-\d{4}-\d{6}"
    },
    "EPFO Registration Certificate": {
        "epfo_number": r"EPFO-\d{10}"
    },
    "GST Returns": {
        "return_period": r"GSTR-[13]\D{0,10}(20\d{2})"
    },
    "Non-blacklisting Declaration": {
        "declaration_present": r"(NOT BLACKLISTED|NO BLACKLISTING|NON[- ]BLACKLISTING)"
    },
    "Turnover / Audited Financial Statements": {
        "turnover_amount": r"(?:TURNOVER|REVENUE)[:\s]*\D{0,5}(\d[\d,]{4,})"
    },
    "Experience Certificates": {
        "experience_years": r"(\d{1,2})\s*(?:YEARS|YRS)\s*(?:OF\s*)?EXPERIENCE"
    },
    "Startup India (DPIIT) Certificate": {
        "dpiit_number": r"DIPP\d{6}"
    },
    "NSIC Registration Certificate": {
        "nsic_number": r"NSIC-\d{2}-\d{6}"
    },
    "OEM Authorization Letter": {
        "oem_auth_number": r"OEM-AUTH-\d{6}"
    }
}

# ---------------------------------------------------------
# FIELD EXTRACTION
# ---------------------------------------------------------
def extract_entity_name(raw_text: str):
    """
    Pulls out a company/entity name from any document, looking for common
    label patterns used across certificates (Legal Name, Company, Enterprise
    Name, Authorized Dealer, etc). Used for cross-document consistency checks.
    """
    labels = [
        r"LEGAL NAME",
        r"ENTERPRISE NAME",
        r"ESTABLISHMENT NAME",
        r"AUTHORIZED DEALER",
        r"ENTITY NAME",
        r"COMPANY",
    ]

    for line in raw_text.upper().split("\n"):
        line = line.strip()
        for label in labels:
            match = re.match(rf"{label}\s*[:\-]\s*(.+)", line)
            if match:
                name = match.group(1).strip()
                if 3 < len(name) < 80:
                    return name

    return None

def extract_fields(document_type: str, raw_text: str):

    patterns = FIELD_PATTERNS.get(
        document_type,
        {}
    )

    extracted = {}

    for field_name, pattern in patterns.items():

        if document_type == "PAN Card":
            extracted[field_name] = extract_pan(raw_text)

        else:
            match = re.search(
                pattern,
                raw_text.upper()
            )

            if match:
                extracted[field_name] = match.group(1) if match.groups() else match.group(0)
            else:
                extracted[field_name] = None

    extracted["entity_name"] = extract_entity_name(raw_text)

    extracted["raw_text_snippet"] = raw_text[:300]

    extracted["needs_manual_review"] = any(
        value is None
        for key, value in extracted.items()
        if key not in ("raw_text_snippet", "entity_name")
    )

    return extracted

# ---------------------------------------------------------
# DOCUMENT TYPE CHECK
# ---------------------------------------------------------

DOCUMENT_TYPE_KEYWORDS = {
    "PAN Card": [
        "PERMANENT ACCOUNT NUMBER",
        "INCOME TAX DEPARTMENT",
        "PAN",
    ],

    "GST Registration Certificate": [
        "CERTIFICATE OF REGISTRATION",
        "GOODS AND SERVICES TAX",
        "GSTIN",
    ],

    "GST Returns": [
        "GSTR-1",
        "GSTR-3B",
        "GST RETURN",
    ],

    "Udyam Registration Certificate": [
        "UDYAM REGISTRATION",
        "UDYAM REGISTRATION NUMBER",
    ],

    "Make in India / Local Content Certificate": [
        "MAKE IN INDIA",
        "LOCAL CONTENT",
    ],

    "EPFO Registration Certificate": [
        "EMPLOYEES' PROVIDENT FUND",
        "EPFO",
    ],

    "Startup India (DPIIT) Certificate": [
        "STARTUP INDIA",
        "DPIIT",
    ],

    "NSIC Registration Certificate": [
        "NSIC",
        "NATIONAL SMALL INDUSTRIES CORPORATION",
    ],

    "OEM Authorization Letter": [
        "OEM",
        "AUTHORIZATION LETTER",
    ],
}


def document_type_matches(document_type: str, raw_text: str) -> bool:
    """
    Check whether the uploaded document contains keywords
    expected for the selected document type.
    """

    # Get keywords for the selected document type
    keywords = DOCUMENT_TYPE_KEYWORDS.get(document_type)

    # No rule defined for this document type
    if not keywords:
        return True

    # Convert OCR text to uppercase
    text_upper = raw_text.upper()

    # Check whether at least one expected keyword exists
    return any(keyword in text_upper for keyword in keywords)