from flask_socketio import SocketIO, emit, join_room, leave_room
from services.call_service import get_next_in_queue, remove_from_queue
from services.professional_service import verify_professional_token, set_availability, set_busy


def register_volunteer_events(socketio: SocketIO):

    @socketio.on("volunteer_online")
    def handle_volunteer_online(data):
        """
        Payload: { token }  — the professional's JWT from /api/professional/login.
        We no longer trust a client-supplied volunteer_id/name; the token tells
        us who they actually are, and we check their real verified status
        against the database before letting them go online.
        """
        token = data.get("token")
        if not token:
            emit("volunteer_error", {"error": "Missing authentication token"})
            return

        result = verify_professional_token(token)
        if "error" in result:
            emit("volunteer_error", {"error": result["error"]})
            return

        professional = result["professional"]
        prof_id = professional["id"]

        set_availability(prof_id, True)
        join_room(prof_id)

        next_user = get_next_in_queue()
        if next_user:
            emit("user_waiting", {
                "session_id": next_user,
                "message":    "A user is waiting to talk. Connect when ready."
            }, room=prof_id)
        else:
            emit("no_users_waiting", {
                "message": "You are online. No users waiting right now."
            }, room=prof_id)


    @socketio.on("volunteer_offline")
    def handle_volunteer_offline(data):
        token = data.get("token")
        if not token:
            emit("volunteer_error", {"error": "Missing authentication token"})
            return

        result = verify_professional_token(token)
        if "error" in result:
            emit("volunteer_error", {"error": result["error"]})
            return

        prof_id = result["professional"]["id"]

        set_availability(prof_id, False)
        set_busy(prof_id, False)
        leave_room(prof_id)
        emit("volunteer_status", {"status": "offline"}, room=prof_id)


    @socketio.on("volunteer_accept_call")
    def handle_volunteer_accept(data):
        token      = data.get("token")
        session_id = data.get("session_id")

        if not token:
            emit("volunteer_error", {"error": "Missing authentication token"})
            return

        result = verify_professional_token(token)
        if "error" in result:
            emit("volunteer_error", {"error": result["error"]})
            return

        prof_id = result["professional"]["id"]

        set_busy(prof_id, True)
        remove_from_queue(session_id)

        emit("call_accepted", {
            "volunteer_id": prof_id,
            "message":      "A professional has accepted your call. Connecting now..."
        }, room=session_id)


    @socketio.on("volunteer_end_call")
    def handle_volunteer_end_call(data):
        """
        New event: call your frontend should emit when a call ends, so the
        professional becomes available for the next person instead of being
        stuck 'busy' forever. Payload: { token }
        """
        token = data.get("token")
        if not token:
            emit("volunteer_error", {"error": "Missing authentication token"})
            return

        result = verify_professional_token(token)
        if "error" in result:
            emit("volunteer_error", {"error": result["error"]})
            return

        prof_id = result["professional"]["id"]
        set_busy(prof_id, False)

        next_user = get_next_in_queue()
        if next_user:
            emit("user_waiting", {
                "session_id": next_user,
                "message":    "A user is waiting to talk. Connect when ready."
            }, room=prof_id)
        else:
            emit("no_users_waiting", {
                "message": "Call ended. No users waiting right now."
            }, room=prof_id)
