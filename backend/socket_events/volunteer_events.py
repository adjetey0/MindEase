from flask_socketio import SocketIO, emit, join_room, leave_room
from services.call_service import (
    register_volunteer,
    unregister_volunteer,
    set_volunteer_busy,
    get_next_in_queue,
    remove_from_queue
)

def register_volunteer_events(socketio: SocketIO):

    @socketio.on("volunteer_online")
    def handle_volunteer_online(data):
        volunteer_id = data.get("volunteer_id")
        name         = data.get("name", "Volunteer")

        register_volunteer(volunteer_id, name)
        join_room(volunteer_id)

        next_user = get_next_in_queue()
        if next_user:
            emit("user_waiting", {
                "session_id": next_user,
                "message":    "A user is waiting to talk. Connect when ready."
            }, room=volunteer_id)
        else:
            emit("no_users_waiting", {
                "message": "You are online. No users waiting right now."
            }, room=volunteer_id)


    @socketio.on("volunteer_offline")
    def handle_volunteer_offline(data):
        volunteer_id = data.get("volunteer_id")
        unregister_volunteer(volunteer_id)
        leave_room(volunteer_id)
        emit("volunteer_status", {"status": "offline"}, room=volunteer_id)


    @socketio.on("volunteer_accept_call")
    def handle_volunteer_accept(data):
        volunteer_id = data.get("volunteer_id")
        session_id   = data.get("session_id")

        set_volunteer_busy(volunteer_id, True)
        remove_from_queue(session_id)

        emit("call_accepted", {
            "volunteer_id": volunteer_id,
            "message":      "A volunteer has accepted your call. Connecting now..."
        }, room=session_id)