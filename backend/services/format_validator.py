"""
Format validator.
Regex-based sanity checks on extracted fields, run before the (slower,
mock) portal cross-check. Catches obviously malformed values early.
"""
import re

FORMAT_RULES = {
    "gstin": r"^\d{2}[A-Z]{5}\d{4}[A-Z]\dZ[A-Z\d]$",
    "pan": r"^[A-Z]{5}\d{4}[A-Z]{1}$",
    "udyam_number": r"^UDYAM-[A-Z]{2}-\d{2}-\d{7}$",
}


def validate_field(field_name: str, value: str) -> tuple[bool, str]:
    """
    Returns (is_valid, error_message).
    If field_name has no registered rule, it's treated as valid (no check needed).
    """
    if not value:
        return False, f"{field_name} is missing"

    pattern = FORMAT_RULES.get(field_name)
    if not pattern:
        return True, ""

    if re.match(pattern, value.strip().upper()):
        return True, ""
    return False, f"{field_name} does not match expected format"