from flask import Blueprint, request, jsonify
from services.call_service import (
    get_available_volunteers,
    register_volunteer,
    unregister_volunteer,
    get_queue_position
)
from utils.validators import validate_session_id

call_bp = Blueprint("call", __name__, url_prefix="/api/call")


@call_bp.route("/volunteers/available", methods=["GET"])
def available_volunteers():
    volunteers = get_available_volunteers()
    return jsonify({
        "available": len(volunteers),
        "online":    volunteers
    }), 200


@call_bp.route("/queue/join", methods=["POST"])
def join_queue():
    data       = request.get_json()
    session_id = data.get("session_id", "").strip()

    if not validate_session_id(session_id):
        return jsonify({"error": "Invalid session_id"}), 400

    position = get_queue_position(session_id)
    return jsonify({
        "session_id":     session_id,
        "queue_position": position,
        "message":        "You are in the queue. A volunteer will connect shortly."
    }), 200


@call_bp.route("/volunteer/register", methods=["POST"])
def volunteer_register():
    data         = request.get_json()
    volunteer_id = data.get("volunteer_id", "").strip()
    name         = data.get("name", "Anonymous Volunteer").strip()

    if not volunteer_id:
        return jsonify({"error": "volunteer_id is required"}), 400

    register_volunteer(volunteer_id, name)
    return jsonify({"message": f"{name} is now online"}), 200


@call_bp.route("/volunteer/unregister", methods=["POST"])
def volunteer_unregister():
    data         = request.get_json()
    volunteer_id = data.get("volunteer_id", "").strip()

    if not volunteer_id:
        return jsonify({"error": "volunteer_id is required"}), 400

    unregister_volunteer(volunteer_id)
    return jsonify({"message": "Volunteer is now offline"}), 200