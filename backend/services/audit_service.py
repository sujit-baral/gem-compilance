"""
Audit service.
Every meaningful action in the pipeline writes one row here via log_action().
Append-only — never update or delete existing rows.
"""
import json
from sqlalchemy.orm import Session
from models.audit_log import AuditLog


def log_action(db: Session, application_id: str, action_type: str, actor: str = "system", details: dict = None):
    entry = AuditLog(
        application_id=application_id,
        action_type=action_type,
        actor=actor,
        details=json.dumps(details) if details else None,
    )
    db.add(entry)
    db.commit()