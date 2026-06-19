try:
    from flask_socketio import emit, join_room, leave_room
except ImportError:  # pragma: no cover
    emit = join_room = leave_room = None


def register_call_events(socketio):
    """Register WebRTC signalling events with a Socket.IO server."""

    @socketio.on("call-offer")
    def handle_call_offer(data):
        target = data.get("target")
        if not target:
            return
        emit("call-offer", data, room=target)

    @socketio.on("call-answer")
    def handle_call_answer(data):
        target = data.get("target")
        if not target:
            return
        emit("call-answer", data, room=target)

    @socketio.on("ice-candidate")
    def handle_ice_candidate(data):
        target = data.get("target")
        if not target:
            return
        emit("ice-candidate", data, room=target)

    @socketio.on("call-end")
    def handle_call_end(data):
        target = data.get("target")
        if target:
            emit("call-end", data, room=target)

    @socketio.on("join-call")
    def handle_join_call(data):
        call_room = data.get("call_room")
        if call_room:
            join_room(call_room)
            emit("joined-call", {"call_room": call_room}, room=call_room)

    @socketio.on("leave-call")
    def handle_leave_call(data):
        call_room = data.get("call_room")
        if call_room:
            leave_room(call_room)
            emit("left-call", {"call_room": call_room}, room=call_room)
