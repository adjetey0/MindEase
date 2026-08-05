from models import get_db
from services.emotion_service import detect_emotion
from services.crisis_service  import is_crisis, get_crisis_response
from services.ai_response_service import generate_ai_response
from datetime import datetime
import json
import uuid


def handle_message(session_id: str, user_text: str, language: str = "en") -> dict:
    """
    Core chat pipeline:
    1. Detect emotion
    2. Check for crisis  <-- hard gate, always runs, never skipped
    3. Generate bot response (real AI, unless crisis -> fixed safety response)
    4. Save both messages
    5. Return full response payload
    """
    db = get_db()

    # 1. Detect emotion
    emotion_result = detect_emotion(user_text)
    emotion        = emotion_result["emotion"]
    score          = emotion_result["score"]
    crisis         = is_crisis(user_text)

    # 2. Generate bot reply
    if crisis:
        # Crisis responses are ALWAYS the fixed, pre-written safety message —
        # never routed through the AI model. This must never change.
        bot_text = get_crisis_response(language)
    else:
        history  = get_chat_history(session_id, limit=10)
        bot_text = generate_ai_response(user_text, emotion, history)

    # 3. Save user message
    user_msg = {
        "_id":           str(uuid.uuid4()),
        "session_id":    session_id,
        "sender":        "user",
        "content":       user_text,
        "emotion":       emotion,
        "emotion_score": score,
        "is_crisis":     crisis,
        "created_at":    datetime.utcnow().isoformat()
    }
    db.messages.insert_one(user_msg)

    # 4. Save bot message
    bot_msg = {
        "_id":        str(uuid.uuid4()),
        "session_id": session_id,
        "sender":     "bot",
        "content":    bot_text,
        "is_crisis":  crisis,
        "created_at": datetime.utcnow().isoformat()
    }
    db.messages.insert_one(bot_msg)

    # 5. Bump the session's last_seen + last_preview so the sessions list stays current
    db.sessions.update_one(
        {"session_id": session_id},
        {"$set": {
            "last_seen": datetime.utcnow().isoformat(),
            "last_preview": user_text[:80]
        }}
    )

    return {
        "user_message": {**user_msg, "_id": user_msg["_id"]},
        "bot_message":  {**bot_msg,  "_id": bot_msg["_id"]},
        "emotion":      emotion,
        "score":        score,
        "is_crisis":    crisis
    }


def get_chat_history(session_id: str, limit: int = 50) -> list:
    """Fetch last N messages for a session."""
    db       = get_db()
    messages = list(
        db.messages
        .find({"session_id": session_id})
        .sort("created_at", 1)
        .limit(limit)
    )
    for msg in messages:
        msg["_id"] = str(msg["_id"])
    return messages


def log_mood_summary(session_id: str):
    """Summarise the session's emotions and save to mood_logs."""
    db       = get_db()
    messages = list(db.messages.find({
        "session_id": session_id,
        "sender":     "user"
    }))

    if not messages:
        return

    counts = {}
    for msg in messages:
        emotion = msg.get("emotion")
        if emotion:
            counts[emotion] = counts.get(emotion, 0) + 1

    if not counts:
        return

    dominant = max(counts, key=counts.get)
    db.mood_logs.insert_one({
        "_id":             str(uuid.uuid4()),
        "session_id":      session_id,
        "dominant_emotion": dominant,
        "emotion_counts":  counts,
        "message_count":   len(messages),
        "logged_at":       datetime.utcnow().isoformat()
    })


def list_sessions_for_user(user_id: str, limit: int = 20) -> list:
    """
    Return this user's chat sessions, most recently active first, each with
    a title (derived from the date) and a short preview of the last message.
    Powers the "Recent Sessions" list in the chat history drawer.
    """
    db = get_db()
    sessions = list(
        db.sessions
        .find({"user_id": user_id})
        .sort("last_seen", -1)
        .limit(limit)
    )

    results = []
    for s in sessions:
        created = s.get("created_at", "")
        try:
            date_obj = datetime.fromisoformat(created)
            date_label = date_obj.strftime("%B %d, %Y")
        except (ValueError, TypeError):
            date_label = "Unknown date"

        results.append({
            "session_id": s["session_id"],
            "title": f"Chat — {date_label}",
            "date": s.get("last_seen", created),
            "preview": s.get("last_preview", "No messages yet"),
        })

    return results


def session_belongs_to_user(session_id: str, user_id: str) -> bool:
    """Ownership check so one user can't load another user's session by
    guessing/passing a session_id that isn't theirs."""
    db = get_db()
    session = db.sessions.find_one({"session_id": session_id, "user_id": user_id})
    return session is not None