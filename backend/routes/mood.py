from flask import Blueprint, jsonify
from models import get_db
from utils.validators import validate_session_id
from collections import Counter
import json

mood_bp = Blueprint("mood", __name__, url_prefix="/api/mood")


@mood_bp.route("/history/<session_id>", methods=["GET"])
def mood_history(session_id):
    if not validate_session_id(session_id):
        return jsonify({"error": "Invalid session_id"}), 400

    db   = get_db()
    logs = list(
        db.mood_logs
        .find({"session_id": session_id})
        .sort("logged_at", 1)
    )

    # Convert ObjectId to string for JSON serialization
    for log in logs:
        log["_id"] = str(log["_id"])

    return jsonify({"mood_logs": logs}), 200


@mood_bp.route("/summary/<session_id>", methods=["GET"])
def mood_summary(session_id):
    if not validate_session_id(session_id):
        return jsonify({"error": "Invalid session_id"}), 400

    db    = get_db()
    logs  = list(db.mood_logs.find({"session_id": session_id}))
    total = Counter()

    for log in logs:
        counts = log.get("emotion_counts", {})
        if isinstance(counts, str):
            counts = json.loads(counts)
        total.update(counts)

    return jsonify({
        "total_sessions":   len(logs),
        "emotion_totals":   dict(total),
        "dominant_overall": total.most_common(1)[0][0] if total else None
    }), 200