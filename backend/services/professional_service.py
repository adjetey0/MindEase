# services/professional_service.py

import os
import uuid
import bcrypt
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from flask_jwt_extended import create_access_token, decode_token

from models import get_db
from models.professional import serialize_professional, serialize_professional_admin

ALLOWED_DOC_EXTENSIONS = {"pdf", "jpg", "jpeg", "png"}
VALID_CREDENTIAL_TYPES = {
    "Licensed Clinical Psychologist",
    "Licensed Counsellor",
    "Psychiatrist",
    "Licensed Social Worker",
    "Marriage and Family Therapist",
    "Other",
}


def _allowed_file(filename: str) -> bool:
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_DOC_EXTENSIONS
    )


def _now_iso() -> str:
    return datetime.utcnow().isoformat()


# ---------------------------------------------------------------------------
# Registration / login
# ---------------------------------------------------------------------------

def register_professional(
    email: str,
    password: str,
    full_name: str,
    credential_type: str,
    license_number: str,
    issuing_body: str,
    years_experience: int,
    specializations: list,
    bio: str,
    document_file,           # werkzeug FileStorage or None
    upload_folder: str,
) -> dict:
    db = get_db()

    if db.professionals.find_one({"email": email}):
        return {"error": "An account with this email already exists"}

    if credential_type not in VALID_CREDENTIAL_TYPES:
        return {"error": f"credential_type must be one of {sorted(VALID_CREDENTIAL_TYPES)}"}

    if not license_number or not issuing_body:
        return {"error": "license_number and issuing_body are required"}

    document_path = None
    if document_file and document_file.filename:
        if not _allowed_file(document_file.filename):
            return {"error": "Credential document must be PDF, JPG, or PNG"}
        os.makedirs(upload_folder, exist_ok=True)
        safe_name = f"{uuid.uuid4()}_{secure_filename(document_file.filename)}"
        document_path = os.path.join(upload_folder, safe_name)
        document_file.save(document_path)
    else:
        return {"error": "A credential document (license/certification) is required"}

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    professional = {
        "_id":               str(uuid.uuid4()),
        "email":             email,
        "password_hash":     password_hash,
        "full_name":         full_name,
        "credential_type":   credential_type,
        "license_number":    license_number,
        "issuing_body":      issuing_body,
        "years_experience":  years_experience,
        "specializations":   specializations,
        "bio":               bio,
        "document_path":     document_path,
        "status":            "pending",     # pending | verified | rejected | suspended
        "is_available":      False,
        "is_busy":           False,         # true while on an active call
        "rejection_reason":  None,
        "reviewed_by":       None,
        "reviewed_at":       None,
        "created_at":        _now_iso(),
    }

    db.professionals.insert_one(professional)

    return {
        "message": "Application submitted. Your account will be reviewed before you can go live.",
        "professional": serialize_professional(professional),
    }


def login_professional(email: str, password: str) -> dict:
    db = get_db()
    prof = db.professionals.find_one({"email": email})

    if not prof:
        return {"error": "Invalid email or password"}

    if not bcrypt.checkpw(password.encode("utf-8"), prof["password_hash"].encode("utf-8")):
        return {"error": "Invalid email or password"}

    if prof["status"] == "rejected":
        return {"error": "Your application was rejected. Contact support to resubmit.",
                 "rejection_reason": prof.get("rejection_reason")}

    if prof["status"] == "suspended":
        return {"error": "Your account is suspended. Contact support."}

    token = create_access_token(
        identity=prof["_id"],
        expires_delta=timedelta(days=30),
        additional_claims={"role": "professional"},
    )

    return {
        "message": "Login successful",
        "token": token,
        "professional": serialize_professional(prof),
    }


def get_professional_by_id(prof_id: str) -> dict | None:
    db = get_db()
    prof = db.professionals.find_one({"_id": prof_id})
    return serialize_professional(prof) if prof else None


def verify_professional_token(token: str) -> dict:
    """
    Decode a JWT and confirm it belongs to a real, verified professional.
    Used by socket_events instead of trusting a client-supplied professional_id —
    this is what actually closes the "anyone can impersonate any volunteer" hole.

    Returns {"professional": {...}} on success, or {"error": "..."} on failure.
    """
    try:
        decoded = decode_token(token)
    except Exception:
        return {"error": "Invalid or expired token"}

    if decoded.get("role") != "professional":
        return {"error": "This token does not belong to a professional account"}

    prof_id = decoded.get("sub")  # flask_jwt_extended stores identity under "sub"
    db = get_db()
    prof = db.professionals.find_one({"_id": prof_id})

    if not prof:
        return {"error": "Professional not found"}

    if prof["status"] != "verified":
        return {"error": "Only verified professionals can go online"}

    return {"professional": serialize_professional(prof)}


# ---------------------------------------------------------------------------
# Availability (only meaningful once verified)
# ---------------------------------------------------------------------------

def set_availability(prof_id: str, is_available: bool) -> dict:
    db = get_db()
    prof = db.professionals.find_one({"_id": prof_id})

    if not prof:
        return {"error": "Professional not found"}

    if prof["status"] != "verified":
        return {"error": "Only verified professionals can go online"}

    db.professionals.update_one(
        {"_id": prof_id},
        {"$set": {"is_available": is_available}},
    )
    return {"message": "Availability updated", "is_available": is_available}


def set_busy(prof_id: str, is_busy: bool) -> dict:
    """Marks a professional busy (on an active call) or free again.
    Distinct from is_available: a professional can be online (available=True)
    but currently on a call (busy=True), in which case they shouldn't show
    up in the directory or receive a second call."""
    db = get_db()
    prof = db.professionals.find_one({"_id": prof_id})

    if not prof:
        return {"error": "Professional not found"}

    db.professionals.update_one(
        {"_id": prof_id},
        {"$set": {"is_busy": is_busy}},
    )
    return {"message": "Busy status updated", "is_busy": is_busy}


def get_available_professionals() -> list:
    """Verified, online, AND not currently on another call — this is what
    the call feature should show users, replacing the old in-memory volunteer pool."""
    db = get_db()
    cursor = db.professionals.find({
        "status": "verified",
        "is_available": True,
        "is_busy": {"$ne": True},
    })
    return [
        {
            "id": p["_id"],
            "full_name": p.get("full_name"),
            "credential_type": p.get("credential_type"),
            "specializations": p.get("specializations", []),
        }
        for p in cursor
    ]


# ---------------------------------------------------------------------------
# Admin review
# ---------------------------------------------------------------------------

def list_professionals_by_status(status: str) -> list:
    db = get_db()
    cursor = db.professionals.find({"status": status})
    return [serialize_professional_admin(p) for p in cursor]


def approve_professional(prof_id: str, admin_id: str) -> dict:
    db = get_db()
    prof = db.professionals.find_one({"_id": prof_id})
    if not prof:
        return {"error": "Professional not found"}

    db.professionals.update_one(
        {"_id": prof_id},
        {"$set": {
            "status": "verified",
            "reviewed_by": admin_id,
            "reviewed_at": _now_iso(),
            "rejection_reason": None,
        }},
    )
    return {"message": f"{prof.get('full_name')} approved and verified"}


def reject_professional(prof_id: str, admin_id: str, reason: str) -> dict:
    db = get_db()
    prof = db.professionals.find_one({"_id": prof_id})
    if not prof:
        return {"error": "Professional not found"}

    db.professionals.update_one(
        {"_id": prof_id},
        {"$set": {
            "status": "rejected",
            "is_available": False,
            "reviewed_by": admin_id,
            "reviewed_at": _now_iso(),
            "rejection_reason": reason,
        }},
    )
    return {"message": "Professional application rejected", "reason": reason}


def suspend_professional(prof_id: str, admin_id: str, reason: str) -> dict:
    db = get_db()
    prof = db.professionals.find_one({"_id": prof_id})
    if not prof:
        return {"error": "Professional not found"}

    db.professionals.update_one(
        {"_id": prof_id},
        {"$set": {
            "status": "suspended",
            "is_available": False,
            "reviewed_by": admin_id,
            "reviewed_at": _now_iso(),
            "rejection_reason": reason,
        }},
    )
    return {"message": "Professional suspended", "reason": reason}
