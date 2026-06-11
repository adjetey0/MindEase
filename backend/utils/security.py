import uuid

def generate_session_id() -> str:
    """Generate a new UUID v4 session ID."""
    return str(uuid.uuid4())