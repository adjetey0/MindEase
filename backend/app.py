from flask import Flask, jsonify
from flask_cors import CORS
from config import config
from models import db
import os


def create_app(env: str = "default") -> Flask:
    app = Flask(__name__)

    # Load Config
    app.config.from_object(config[env])

    # Extensions
    db.init_app(app)
    CORS(app, origins=app.config["CORS_ORIGINS"])

    # Register Blueprints
    from routes.chat   import chat_bp
    from routes.mood   import mood_bp
    from routes.report import report_bp

    app.register_blueprint(chat_bp)
    app.register_blueprint(mood_bp)
    app.register_blueprint(report_bp)

    # Create DB Tables
    with app.app_context():
        db.create_all()

    # Health Check
    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok", "app": "MindEase"}), 200

    # 404 Handler
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found"}), 404

    # 500 Handler
    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app


if __name__ == "__main__":
    env = os.getenv("FLASK_ENV", "development")
    app = create_app(env)
    app.run(debug=app.config["DEBUG"], port=5000)