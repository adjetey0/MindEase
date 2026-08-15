# models/professional.py
#
# No ORM class here on purpose — the rest of MindEase's auth stack talks to
# Mongo directly through get_db() (see services/auth_service.py), so this
# file mirrors that pattern instead of introducing SQLAlchemy for a second
# data source. Keep this file in models/ alongside your existing __init__.py.

from models import get_db
from datetime import datetime


VALID_STATUSES = {"pending", "verified", "rejected", "suspended"}


def serialize_professional(prof: dict) -> dict:
    """Return a safe professional dict — never expose password_hash or the
    raw file path of uploaded credential documents to non-admins."""
    return {
        "id":               prof["_id"],
        "email":            prof["email"],
        "full_name":        prof.get("full_name", ""),
        "credential_type":  prof.get("credential_type"),
        "license_number":   prof.get("license_number"),
        "issuing_body":     prof.get("issuing_body"),
        "years_experience": prof.get("years_experience"),
        "specializations":  prof.get("specializations", []),
        "bio":              prof.get("bio", ""),
        "status":           prof.get("status", "pending"),
        "is_available":     prof.get("is_available", False),
        "rejection_reason": prof.get("rejection_reason"),
        "created_at":       prof.get("created_at"),
    }


def serialize_professional_admin(prof: dict) -> dict:
    """Fuller view for admin review — includes the document path so an
    admin route can serve/download it, but still never the password hash."""
    data = serialize_professional(prof)
    data["document_path"] = prof.get("document_path")
    data["reviewed_by"]   = prof.get("reviewed_by")
    data["reviewed_at"]   = prof.get("reviewed_at")
    return data
