from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import get_db
from services.chat_service import (
    handle_message,
    get_chat_history,
    log_mood_summary,
    list_sessions_for_user,
    session_belongs_to_user,
)
from utils.validators import validate_session_id, validate_message
from datetime import datetime

chat_bp = Blueprint("chat", __name__, url_prefix="/api/chat")


def get_or_create_session(session_id: str, language: str = "en", user_id: str | None = None):
    """Get existing session or create a new one in MongoDB. Tags the session
    with the owning user_id so it can show up in that user's session list."""
    db = get_db()
    session = db.sessions.find_one({"session_id": session_id})
    if not session:
        db.sessions.insert_one({
            "session_id": session_id,
            "language":   language,
            "user_id":    user_id,
            "created_at": datetime.utcnow().isoformat(),
            "last_seen":  datetime.utcnow().isoformat()
        })
    else:
        updates = {"last_seen": datetime.utcnow().isoformat()}
        # Backfill user_id on older sessions created before this field existed
        if user_id and not session.get("user_id"):
            updates["user_id"] = user_id
        db.sessions.update_one({"session_id": session_id}, {"$set": updates})


@chat_bp.route("/message", methods=["POST"])
@jwt_required()
def send_message():
    data       = request.get_json()
    session_id = data.get("session_id", "").strip()
    message    = data.get("message", "").strip()
    language   = data.get("language", "en")
    user_id    = get_jwt_identity()

    if not validate_session_id(session_id):
        return jsonify({"error": "Invalid or missing session_id"}), 400
    if not validate_message(message):
        return jsonify({"error": "Message cannot be empty"}), 400

    get_or_create_session(session_id, language, user_id)

    if not session_belongs_to_user(session_id, user_id):
        return jsonify({"error": "Session not found"}), 404

    result = handle_message(session_id, message, language)
    return jsonify(result), 200


@chat_bp.route("/history/<session_id>", methods=["GET"])
@jwt_required()
def get_history(session_id):
    user_id = get_jwt_identity()

    if not validate_session_id(session_id):
        return jsonify({"error": "Invalid session_id"}), 400

    # Ownership check: don't let a user load a session that isn't theirs
    if not session_belongs_to_user(session_id, user_id):
        db = get_db()
        session = db.sessions.find_one({"session_id": session_id})
        if session is not None:
            # session exists but belongs to someone else
            return jsonify({"error": "Session not found"}), 404
        # session doesn't exist yet at all — that's fine, it'll be created
        # on first message; just return empty history rather than erroring

    limit    = request.args.get("limit", 50, type=int)
    messages = get_chat_history(session_id, limit)
    return jsonify({"messages": messages}), 200


@chat_bp.route("/sessions", methods=["GET"])
@jwt_required()
def get_sessions():
    """
    GET /api/chat/sessions
    Returns this user's recent chat sessions for the history drawer.
    """
    user_id = get_jwt_identity()
    sessions = list_sessions_for_user(user_id)
    return jsonify({"sessions": sessions}), 200


@chat_bp.route("/end", methods=["POST"])
@jwt_required()
def end_session():
    data       = request.get_json()
    session_id = data.get("session_id", "").strip()

    if not validate_session_id(session_id):
        return jsonify({"error": "Invalid session_id"}), 400

    log_mood_summary(session_id)
    return jsonify({"message": "Session ended and mood logged"}), 200


@chat_bp.route("/reaction", methods=["POST"])
@jwt_required()
def add_reaction():
    data       = request.get_json()
    message_id = data.get("message_id")
    reaction   = data.get("reaction")

    if reaction not in ("up", "down"):
        return jsonify({"error": "Reaction must be 'up' or 'down'"}), 400

    db  = get_db()
    msg = db.messages.find_one({"_id": message_id})
    if not msg:
        return jsonify({"error": "Message not found"}), 404

    db.reactions.insert_one({
        "message_id": message_id,
        "reaction":   reaction,
        "created_at": datetime.utcnow().isoformat()
    })
    return jsonify({"message": "Reaction saved"}), 201