# In-memory store — resets on server restart, private by design

_available_volunteers = {}   # { volunteer_id: { name, busy } }
_user_queue           = []   # [ session_id, ... ] in order of joining


def get_available_volunteers() -> list:
    """Return list of volunteers who are online and not busy."""
    return [
        {"volunteer_id": vid, "name": v["name"]}
        for vid, v in _available_volunteers.items()
        if not v["busy"]
    ]


def register_volunteer(volunteer_id: str, name: str):
    """Mark a volunteer as online and available."""
    _available_volunteers[volunteer_id] = {
        "name": name,
        "busy": False
    }


def unregister_volunteer(volunteer_id: str):
    """Remove a volunteer from the available pool."""
    _available_volunteers.pop(volunteer_id, None)


def set_volunteer_busy(volunteer_id: str, busy: bool):
    """Mark a volunteer as busy or free."""
    if volunteer_id in _available_volunteers:
        _available_volunteers[volunteer_id]["busy"] = busy


def get_queue_position(session_id: str) -> int:
    """Add user to queue if not already in it, return their position."""
    if session_id not in _user_queue:
        _user_queue.append(session_id)
    return _user_queue.index(session_id) + 1


def remove_from_queue(session_id: str):
    """Remove user from queue after they connect."""
    if session_id in _user_queue:
        _user_queue.remove(session_id)


def get_next_in_queue() -> str | None:
    """Get the next user waiting in queue."""
    return _user_queue[0] if _user_queue else None