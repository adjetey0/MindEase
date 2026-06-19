from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from config import config
from models import db
import os

socketio = SocketIO()

def create_app(env: str = "default") -> Flask:
    app = Flask(__name__)

    # Load Config
    app.config.from_object(config[env])

    # Extensions
    db.init_app(app)
    CORS(app, origins=app.config["CORS_ORIGINS"])
    socketio.init_app(app,
        cors_allowed_origins="*",
        async_mode="eventlet",
        logger=False,
        engineio_logger=False
    )

    # Register Blueprints
    from routes.chat   import chat_bp
    from routes.mood   import mood_bp
    from routes.report import report_bp
    from routes.call   import call_bp

    app.register_blueprint(chat_bp)
    app.register_blueprint(mood_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(call_bp)

    # Register Socket Events
    from socket_events.call_events      import register_call_events
    from socket_events.volunteer_events import register_volunteer_events

    register_call_events(socketio)
    register_volunteer_events(socketio)

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
    socketio.run(app, debug=app.config["DEBUG"], port=5000)