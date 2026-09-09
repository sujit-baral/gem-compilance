"""
Bidder routes.
POST /bidders -> register a new bidder, get a permanent Bidder ID
GET  /bidders/{bidder_id} -> view bidder details
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models.bidder import Bidder

router = APIRouter(prefix="/bidders", tags=["Bidders"])


class BidderCreate(BaseModel):
    company_name: str
    pan_number: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


@router.post("")
def create_bidder(payload: BidderCreate, db: Session = Depends(get_db)):
    # If PAN is provided, check whether this bidder already exists
    if payload.pan_number:
        existing_bidder = db.query(Bidder).filter(
            Bidder.pan_number == payload.pan_number
        ).first()

        if existing_bidder:
            return existing_bidder

    # Create a new bidder only if no existing bidder was found
    bidder_id = f"BID-2026-{uuid.uuid4().hex[:6].upper()}"

    bidder = Bidder(
        bidder_id=bidder_id,
        **payload.dict()
    )

    db.add(bidder)
    db.commit()
    db.refresh(bidder)

    return bidder


@router.get("/lookup/{query}")
def lookup_bidder(query: str, db: Session = Depends(get_db)):
    bidder = (
        db.query(Bidder)
        .filter((Bidder.pan_number == query) | (Bidder.bidder_id == query))
        .first()
    )
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")
    return bidder


@router.get("/{bidder_id}")
def get_bidder(bidder_id: str, db: Session = Depends(get_db)):
    bidder = db.query(Bidder).filter(Bidder.bidder_id == bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")
    return bidder