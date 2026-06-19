try:
    from flask_socketio import emit
except ImportError:  # pragma: no cover
    emit = None

from services.call_service import register_volunteer, set_volunteer_availability, unregister_volunteer


def register_volunteer_events(socketio):
    """Register volunteer presence events with a Socket.IO server."""

    @socketio.on("volunteer-online")
    def handle_volunteer_online(data):
        volunteer_id = data.get("volunteer_id")
        if not volunteer_id:
            return

        volunteer = register_volunteer(volunteer_id, available=True)
        emit("volunteer-status", {"volunteer": volunteer, "status": "online"}, broadcast=True)

    @socketio.on("volunteer-offline")
    def handle_volunteer_offline(data):
        volunteer_id = data.get("volunteer_id")
        if not volunteer_id:
            return

        unregister_volunteer(volunteer_id)
        emit("volunteer-status", {"volunteer_id": volunteer_id, "status": "offline"}, broadcast=True)

    @socketio.on("volunteer-availability")
    def handle_volunteer_availability(data):
        volunteer_id = data.get("volunteer_id")
        available = data.get("available")
        if not volunteer_id or available is None:
            return

        volunteer = set_volunteer_availability(volunteer_id, available)
        if volunteer:
            emit("volunteer-status", {"volunteer": volunteer}, broadcast=True)
