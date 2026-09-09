from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class AuditLog(Base):
    __tablename__ = "audit_log"

    log_id = Column(Integer, primary_key=True, autoincrement=True)
    application_id = Column(String, nullable=False, index=True)
    action_type = Column(String, nullable=False)
    actor = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())