from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from database import Base


class Bidder(Base):
    __tablename__ = "bidders"

    bidder_id = Column(String, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    pan_number = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())