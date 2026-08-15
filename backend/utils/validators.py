import re

def validate_session_id(session_id: str) -> bool:
    """Check session_id is a valid UUID or custom session format."""
    if not session_id:
        return False
    # Accept standard UUID format
    uuid_pattern = re.compile(
        r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
        re.IGNORECASE
    )
    if uuid_pattern.match(session_id):
        return True
    # Also accept custom session format: sess_timestamp_random
    custom_pattern = re.compile(r'^sess_\d+_[a-z0-9]+$')
    if custom_pattern.match(session_id):
        return True
    return False


def validate_message(message: str) -> bool:
    """Check message is not empty and not too long."""
    if not message or not message.strip():
        return False
    if len(message) > 2000:
        return False
    return True