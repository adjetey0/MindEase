from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_jwt_extended import JWTManager
from config import config
from models import mongo
import os
import certifi

socketio = SocketIO()
jwt      = JWTManager()

def create_app(env: str = "default") -> Flask:
    app = Flask(__name__)

    app.config.from_object(config[env])

    mongo.init_app(app, tlsCAFile=certifi.where())
    jwt.init_app(app)
    CORS(app, origins="*", supports_credentials=True)
    socketio.init_app(app,
        cors_allowed_origins="*",
        async_mode="eventlet",
        logger=False,
        engineio_logger=False
    )

    from routes.chat         import chat_bp
    from routes.mood         import mood_bp
    from routes.report       import report_bp
    from routes.call         import call_bp
    from routes.auth         import auth_bp
    from routes.professional import professional_bp

    app.register_blueprint(chat_bp)
    app.register_blueprint(mood_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(call_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(professional_bp)

    from socket_events.call_events      import register_call_events
    from socket_events.volunteer_events import register_volunteer_events

    register_call_events(socketio)
    register_volunteer_events(socketio)

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok", "app": "MindEase"}), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app


if __name__ == "__main__":
    env = os.getenv("FLASK_ENV", "development")
    app = create_app(env)
    socketio.run(app, debug=app.config["DEBUG"], port=5000, host='0.0.0.0')