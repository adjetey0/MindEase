from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from services.auth_service import (
    register_user,
    login_user,
    google_auth,
    get_user_by_id
)

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    POST /api/auth/register
    Body: { email, password, full_name }
    """
    data      = request.get_json()
    email     = data.get("email", "").strip().lower()
    password  = data.get("password", "").strip()
    full_name = data.get("full_name", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    result = register_user(email, password, full_name)
    if "error" in result:
        return jsonify(result), 409

    return jsonify(result), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    POST /api/auth/login
    Body: { email, password, remember_me? }
    """
    data        = request.get_json()
    email       = data.get("email", "").strip().lower()
    password    = data.get("password", "").strip()
    remember_me = data.get("remember_me", False)

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    result = login_user(email, password, remember_me)
    if "error" in result:
        return jsonify(result), 401

    return jsonify(result), 200


@auth_bp.route("/google", methods=["POST"])
def google_login():
    """
    POST /api/auth/google
    Body: { token }  — Google ID token from frontend
    """
    data  = request.get_json()
    token = data.get("token", "").strip()

    if not token:
        return jsonify({"error": "Google token is required"}), 400

    result = google_auth(token)
    if "error" in result:
        return jsonify(result), 401

    return jsonify(result), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    """
    GET /api/auth/me
    Returns current logged in user info
    """
    user_id = get_jwt_identity()
    user    = get_user_by_id(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": user}), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """
    POST /api/auth/logout
    """
    return jsonify({"message": "Logged out successfully"}), 200