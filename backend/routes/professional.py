# routes/professional.py

from functools import wraps
from flask import Blueprint, request, jsonify, current_app, send_file
import os
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from models import get_db
from services.professional_service import (
    register_professional,
    login_professional,
    get_professional_by_id,
    set_availability,
    get_available_professionals,
    list_professionals_by_status,
    approve_professional,
    reject_professional,
    suspend_professional,
)

professional_bp = Blueprint("professional", __name__, url_prefix="/api/professional")


# ---------------------------------------------------------------------------
# Auth guards
# ---------------------------------------------------------------------------

def professional_required(fn):
    """Only accepts JWTs issued by login_professional (role claim check).
    A regular user's token will not pass this check."""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "professional":
            return jsonify({"error": "Professional account required"}), 403
        return fn(*args, **kwargs)
    return wrapper


def admin_required(fn):
    """Admins are just regular users (db.users) with is_admin=True.
    Log in via the normal /api/auth/login and use that token here."""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        db = get_db()
        user_id = get_jwt_identity()
        user = db.users.find_one({"_id": user_id})
        if not user or not user.get("is_admin"):
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper


# ---------------------------------------------------------------------------
# Signup / login
# ---------------------------------------------------------------------------

@professional_bp.route("/register", methods=["POST"])
def register():
    """
    POST /api/professional/register
    multipart/form-data:
      email, password, full_name, credential_type, license_number,
      issuing_body, years_experience, specializations (comma-separated),
      bio, credential_document (file)
    """
    form = request.form
    email    = form.get("email", "").strip().lower()
    password = form.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    specializations = [
        s.strip() for s in form.get("specializations", "").split(",") if s.strip()
    ]

    try:
        years_experience = int(form.get("years_experience", 0))
    except ValueError:
        return jsonify({"error": "years_experience must be a number"}), 400

    result = register_professional(
        email=email,
        password=password,
        full_name=form.get("full_name", "").strip(),
        credential_type=form.get("credential_type", "").strip(),
        license_number=form.get("license_number", "").strip(),
        issuing_body=form.get("issuing_body", "").strip(),
        years_experience=years_experience,
        specializations=specializations,
        bio=form.get("bio", "").strip(),
        document_file=request.files.get("credential_document"),
        upload_folder=current_app.config.get(
            "PROFESSIONAL_UPLOAD_FOLDER", "uploads/professional_credentials"
        ),
    )

    if "error" in result:
        return jsonify(result), 400

    return jsonify(result), 201


@professional_bp.route("/login", methods=["POST"])
def login():
    """
    POST /api/professional/login
    Body: { email, password }
    """
    data     = request.get_json()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    result = login_professional(email, password)
    if "error" in result:
        return jsonify(result), 401

    return jsonify(result), 200


@professional_bp.route("/me", methods=["GET"])
@professional_required
def me():
    prof_id = get_jwt_identity()
    prof = get_professional_by_id(prof_id)
    if not prof:
        return jsonify({"error": "Professional not found"}), 404
    return jsonify({"professional": prof}), 200


# ---------------------------------------------------------------------------
# Availability — gated on status == "verified" inside the service layer
# ---------------------------------------------------------------------------

@professional_bp.route("/availability", methods=["PATCH"])
@professional_required
def update_availability():
    """
    PATCH /api/professional/availability
    Body: { is_available: bool }
    """
    prof_id = get_jwt_identity()
    data = request.get_json()
    is_available = bool(data.get("is_available", False))

    result = set_availability(prof_id, is_available)
    if "error" in result:
        return jsonify(result), 403

    return jsonify(result), 200


@professional_bp.route("/directory", methods=["GET"])
def directory():
    """
    GET /api/professional/directory
    Public: verified + currently available professionals.
    This should replace the old GET /api/call/volunteers/available.
    """
    professionals = get_available_professionals()
    return jsonify({"available": len(professionals), "professionals": professionals}), 200


# ---------------------------------------------------------------------------
# Admin review queue
# ---------------------------------------------------------------------------

@professional_bp.route("/admin/pending", methods=["GET"])
@admin_required
def pending_list():
    return jsonify({"pending": list_professionals_by_status("pending")}), 200


@professional_bp.route("/admin/<prof_id>/document", methods=["GET"])
@admin_required
def view_document(prof_id):
    """
    GET /api/professional/admin/<prof_id>/document
    Serves the uploaded credential file so an admin can review it before approving.
    """
    db = get_db()
    prof = db.professionals.find_one({"_id": prof_id})
    if not prof or not prof.get("document_path"):
        return jsonify({"error": "Document not found"}), 404

    path = prof["document_path"]
    if not os.path.exists(path):
        return jsonify({"error": "Document file missing on server"}), 404

    return send_file(path)


@professional_bp.route("/admin/<prof_id>/approve", methods=["POST"])
@admin_required
def approve(prof_id):
    admin_id = get_jwt_identity()
    result = approve_professional(prof_id, admin_id)
    if "error" in result:
        return jsonify(result), 404
    return jsonify(result), 200


@professional_bp.route("/admin/<prof_id>/reject", methods=["POST"])
@admin_required
def reject(prof_id):
    admin_id = get_jwt_identity()
    data = request.get_json() or {}
    reason = data.get("reason", "Credentials could not be verified")
    result = reject_professional(prof_id, admin_id, reason)
    if "error" in result:
        return jsonify(result), 404
    return jsonify(result), 200


@professional_bp.route("/admin/<prof_id>/suspend", methods=["POST"])
@admin_required
def suspend(prof_id):
    admin_id = get_jwt_identity()
    data = request.get_json() or {}
    reason = data.get("reason", "Account suspended by admin")
    result = suspend_professional(prof_id, admin_id, reason)
    if "error" in result:
        return jsonify(result), 404
    return jsonify(result), 200
