from flask import Blueprint, jsonify, send_file
from services.report_service import generate_pdf_report
from utils.validators import validate_session_id

report_bp = Blueprint("report", __name__, url_prefix="/api/report")


@report_bp.route("/generate/<session_id>", methods=["GET"])
def generate_report(session_id):
    if not validate_session_id(session_id):
        return jsonify({"error": "Invalid session_id"}), 400

    try:
        pdf_path = generate_pdf_report(session_id)
        return send_file(pdf_path, as_attachment=True, download_name="MindEase_Report.pdf")
    except Exception as e:
        return jsonify({"error": str(e)}), 500