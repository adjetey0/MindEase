from datetime import datetime
from typing import Dict, List, Optional

# Simple in-memory volunteer availability registry.
# Replace with database-backed persistence when the model is available.
volunteer_registry: Dict[str, Dict[str, object]] = {}


def register_volunteer(volunteer_id: str, available: bool = True) -> Dict[str, object]:
    """Register or update a volunteer's availability state."""
    volunteer_registry[volunteer_id] = {
        "volunteer_id": volunteer_id,
        "available": bool(available),
        "last_seen": datetime.utcnow().isoformat() + "Z",
    }
    return volunteer_registry[volunteer_id]


def unregister_volunteer(volunteer_id: str) -> bool:
    """Remove a volunteer from the availability registry."""
    return volunteer_registry.pop(volunteer_id, None) is not None


def set_volunteer_availability(volunteer_id: str, available: bool) -> Optional[Dict[str, object]]:
    """Update volunteer availability."""
    volunteer = volunteer_registry.get(volunteer_id)
    if not volunteer:
        return None
    volunteer["available"] = bool(available)
    volunteer["last_seen"] = datetime.utcnow().isoformat() + "Z"
    return volunteer


def get_available_volunteers() -> List[Dict[str, object]]:
    """Return volunteers that are currently available to accept a call."""
    return [v for v in volunteer_registry.values() if v.get("available")]


def match_volunteer() -> Optional[Dict[str, object]]:
    """Return the next available volunteer for a call."""
    available = get_available_volunteers()
    if not available:
        return None
    return available[0]
