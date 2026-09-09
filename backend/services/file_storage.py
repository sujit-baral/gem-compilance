"""
File storage helper.
Saves uploaded files to uploads/{application_id}/ and returns the path.
"""
import os
import hashlib

from fastapi import UploadFile

UPLOAD_ROOT = "uploads"


def save_uploaded_file(application_id: str, file: UploadFile) -> str:
    folder = os.path.join(UPLOAD_ROOT, application_id)
    os.makedirs(folder, exist_ok=True)

    file_path = os.path.join(folder, file.filename)
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    return file_path

import hashlib

def compute_file_hash(file_path: str) -> str:
    """Returns a SHA-256 hash of the file's contents — used for duplicate detection."""
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        hasher.update(f.read())
    return hasher.hexdigest()