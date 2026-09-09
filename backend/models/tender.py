from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class Tender(Base):
    __tablename__ = "tenders"

    tender_id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    estimated_value = Column(Integer, nullable=True)
    submission_deadline = Column(String, nullable=True)

    mse_only = Column(Boolean, default=False)
    make_in_india_required = Column(Boolean, default=False)
    min_local_content_percent = Column(Integer, nullable=True)
    manpower_component = Column(Boolean, default=False)
    startup_exemption_allowed = Column(Boolean, default=False)
    oem_authorization_required = Column(Boolean, default=False)
    nsic_accepted = Column(Boolean, default=False)
    min_turnover = Column(Integer, nullable=True)
    min_experience_years = Column(Integer, nullable=True)

    reference_document_path = Column(String, nullable=True)
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())