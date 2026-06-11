from flask import Blueprint, jsonify
from models import MoodLog
from utils.validators import validate_session_id
from collections import Counter

mood_bp = Blueprint("mood", __name__, url_prefix="/api/mood")


@mood_bp.route("/history/<session_id>", methods=["GET"])
def mood_history(session_id):
    if not validate_session_id(session_id):
        return jsonify({"error": "Invalid session_id"}), 400

    logs = (
        MoodLog.query
        .filter_by(session_id=session_id)
        .order_by(MoodLog.logged_at.asc())
        .all()
    )
    return jsonify({"mood_logs": [log.to_dict() for log in logs]}), 200


@mood_bp.route("/summary/<session_id>", methods=["GET"])
def mood_summary(session_id):
    if not validate_session_id(session_id):
        return jsonify({"error": "Invalid session_id"}), 400

    logs  = MoodLog.query.filter_by(session_id=session_id).all()
    total = Counter()

    for log in logs:
        total.update(log.get_emotion_counts())

    return jsonify({
        "total_sessions":   len(logs),
        "emotion_totals":   dict(total),
        "dominant_overall": total.most_common(1)[0][0] if total else None
    }), 200