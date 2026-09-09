from sqlalchemy import Column, String, Boolean, Float, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class Document(Base):
    __tablename__ = "documents"

    document_id = Column(String, primary_key=True, index=True)
    application_id = Column(String, nullable=False, index=True)

    document_type = Column(String, nullable=False)
    is_mandatory = Column(Boolean, default=True)
    file_path = Column(String, nullable=False)

    format_valid = Column(Boolean, nullable=True)
    format_error = Column(Text, nullable=True)

    extracted_data = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)

    portal_verified = Column(Boolean, nullable=True)
    verification_status = Column(String, nullable=True)
    mismatch_details = Column(Text, nullable=True)

    file_hash = Column(String, nullable=True)
    is_duplicate = Column(Boolean, nullable=True)
    duplicate_of = Column(String, nullable=True)
    
    upload_timestamp = Column(DateTime(timezone=True), server_default=func.now())