from flask import Blueprint, request, jsonify
from services.call_service import (
    get_available_volunteers,
    match_volunteer,
    register_volunteer,
    set_volunteer_availability,
    unregister_volunteer,
)

call_bp = Blueprint("call", __name__, url_prefix="/api/call")


@call_bp.route("/volunteer/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    volunteer_id = data.get("volunteer_id", "").strip()
    available = data.get("available", True)

    if not volunteer_id:
        return jsonify({"error": "volunteer_id is required"}), 400

    volunteer = register_volunteer(volunteer_id, available)
    return jsonify({"volunteer": volunteer}), 201


@call_bp.route("/volunteer/unregister", methods=["POST"])
def unregister():
    data = request.get_json() or {}
    volunteer_id = data.get("volunteer_id", "").strip()

    if not volunteer_id:
        return jsonify({"error": "volunteer_id is required"}), 400

    if not unregister_volunteer(volunteer_id):
        return jsonify({"error": "Volunteer not found"}), 404

    return jsonify({"message": "Volunteer unregistered"}), 200


@call_bp.route("/volunteer/<volunteer_id>/availability", methods=["PATCH"])
def update_availability(volunteer_id):
    data = request.get_json() or {}
    available = data.get("available")

    if available is None:
        return jsonify({"error": "available field is required"}), 400

    volunteer = set_volunteer_availability(volunteer_id, available)
    if volunteer is None:
        return jsonify({"error": "Volunteer not found"}), 404

    return jsonify({"volunteer": volunteer}), 200


@call_bp.route("/match", methods=["GET"])
def match_call():
    volunteer = match_volunteer()
    if not volunteer:
        return jsonify({"error": "No available volunteers"}), 404

    return jsonify({"volunteer": volunteer}), 200


@call_bp.route("/volunteers", methods=["GET"])
def list_volunteers():
    volunteers = get_available_volunteers()
    return jsonify({"available_volunteers": volunteers}), 200
