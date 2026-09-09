from sqlalchemy import Column, String, Float, DateTime, Text,Boolean
from sqlalchemy.sql import func
from database import Base


class Application(Base):
    __tablename__ = "applications"

    application_id = Column(String, primary_key=True, index=True)
    tender_id = Column(String, nullable=False, index=True)
    bidder_id = Column(String, nullable=False, index=True)

    compliance_score = Column(Float, nullable=True)
    risk_level = Column(String, nullable=True)
    ai_recommendation = Column(Text, nullable=True)

    decision = Column(String, nullable=True)
    decision_reason = Column(Text, nullable=True)
    decided_by = Column(String, nullable=True)
    decided_at = Column(DateTime(timezone=True), nullable=True)

    submitted_at = Column(DateTime(timezone=True), nullable=True)
    is_submitted = Column(Boolean, nullable=True, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())