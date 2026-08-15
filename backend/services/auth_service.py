from models import get_db
from flask_jwt_extended import create_access_token
from datetime import timedelta
import bcrypt
import uuid
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests


def register_user(email: str, password: str, full_name: str = "") -> dict:
    """Register a new user with email and password."""
    db = get_db()

    # Check if user already exists
    existing = db.users.find_one({"email": email})
    if existing:
        return {"error": "An account with this email already exists"}

    # Hash password
    password_hash = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    # Create user document
    user = {
        "_id":           str(uuid.uuid4()),
        "email":         email,
        "password_hash": password_hash,
        "full_name":     full_name,
        "avatar_url":    None,
        "provider":      "email",
        "provider_id":   None,
        "is_verified":   False,
        "created_at":    __import__("datetime").datetime.utcnow().isoformat()
    }

    db.users.insert_one(user)

    # Generate token
    token = create_access_token(
        identity=user["_id"],
        expires_delta=timedelta(days=30)
    )

    return {
        "message": "Account created successfully",
        "token":   token,
        "user":    _serialize_user(user)
    }


def login_user(email: str, password: str, remember_me: bool = False) -> dict:
    """Login with email and password."""
    db   = get_db()
    user = db.users.find_one({"email": email})

    if not user:
        return {"error": "Invalid email or password"}

    if user.get("provider") != "email":
        return {"error": f"Please sign in with {user.get('provider', 'Google')}"}

    # Verify password
    if not bcrypt.checkpw(
        password.encode("utf-8"),
        user["password_hash"].encode("utf-8")
    ):
        return {"error": "Invalid email or password"}

    # Generate token
    expires = timedelta(days=30) if remember_me else timedelta(days=1)
    token   = create_access_token(
        identity=user["_id"],
        expires_delta=expires
    )

    # Update last login
    db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": __import__("datetime").datetime.utcnow().isoformat()}}
    )

    return {
        "message": "Login successful",
        "token":   token,
        "user":    _serialize_user(user)
    }


def google_auth(token: str) -> dict:
    """Authenticate with Google OAuth token."""
    try:
        from flask import current_app
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request()
        )

        email      = idinfo.get("email")
        full_name  = idinfo.get("name", "")
        avatar_url = idinfo.get("picture", "")
        google_id  = idinfo.get("sub")

        if not email:
            return {"error": "Could not retrieve email from Google"}

        db   = get_db()
        user = db.users.find_one({"email": email})

        if not user:
            # Create new user
            user = {
                "_id":           str(uuid.uuid4()),
                "email":         email,
                "password_hash": None,
                "full_name":     full_name,
                "avatar_url":    avatar_url,
                "provider":      "google",
                "provider_id":   google_id,
                "is_verified":   True,
                "created_at":    __import__("datetime").datetime.utcnow().isoformat()
            }
            db.users.insert_one(user)
        else:
            # Update existing user
            db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {
                    "avatar_url":  avatar_url,
                    "provider_id": google_id,
                    "last_login":  __import__("datetime").datetime.utcnow().isoformat()
                }}
            )

        token = create_access_token(
            identity=user["_id"],
            expires_delta=timedelta(days=30)
        )

        return {
            "message": "Google login successful",
            "token":   token,
            "user":    _serialize_user(user)
        }

    except Exception as e:
        return {"error": f"Google authentication failed: {str(e)}"}


def get_user_by_id(user_id: str) -> dict | None:
    """Get user by ID."""
    db   = get_db()
    user = db.users.find_one({"_id": user_id})
    return _serialize_user(user) if user else None


def _serialize_user(user: dict) -> dict:
    """Return safe user dict without password."""
    return {
        "id":          user["_id"],
        "email":       user["email"],
        "full_name":   user.get("full_name", ""),
        "avatar_url":  user.get("avatar_url"),
        "provider":    user.get("provider", "email"),
        "is_verified": user.get("is_verified", False),
        "created_at":  user.get("created_at")
    }