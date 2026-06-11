from models import db, Message, MoodLog
from services.emotion_service import detect_emotion
from services.crisis_service  import is_crisis, get_crisis_response
from services.coping_service  import format_bot_message
from datetime import datetime
import json


def handle_message(session_id: str, user_text: str, language: str = "en") -> dict:
    """
    Core chat pipeline:
    1. Detect emotion
    2. Check for crisis
    3. Generate bot response
    4. Save both messages
    5. Return full response payload
    """
    # 1. Detect emotion
    emotion_result = detect_emotion(user_text)
    emotion        = emotion_result["emotion"]
    score          = emotion_result["score"]
    crisis         = is_crisis(user_text)

    # 2. Save user message
    user_msg = Message(
        session_id    = session_id,
        sender        = "user",
        content       = user_text,
        emotion       = emotion,
        emotion_score = score,
        is_crisis     = int(crisis)
    )
    db.session.add(user_msg)
    db.session.flush()

    # 3. Generate bot reply
    if crisis:
        bot_text = get_crisis_response(language)
    else:
        bot_text = format_bot_message(emotion)

    # 4. Save bot message
    bot_msg = Message(
        session_id = session_id,
        sender     = "bot",
        content    = bot_text,
        is_crisis  = int(crisis)
    )
    db.session.add(bot_msg)
    db.session.commit()

    return {
        "user_message": user_msg.to_dict(),
        "bot_message":  bot_msg.to_dict(),
        "emotion":      emotion,
        "score":        score,
        "is_crisis":    crisis
    }


def get_chat_history(session_id: str, limit: int = 50) -> list:
    """Fetch last N messages for a session."""
    messages = (
        Message.query
        .filter_by(session_id=session_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
        .all()
    )
    return [m.to_dict() for m in messages]


def log_mood_summary(session_id: str):
    """Summarise the session's emotions and save to mood_logs."""
    messages = Message.query.filter_by(session_id=session_id, sender="user").all()
    if not messages:
        return

    counts = {}
    for msg in messages:
        if msg.emotion:
            counts[msg.emotion] = counts.get(msg.emotion, 0) + 1

    if not counts:
        return

    dominant = max(counts, key=counts.get)
    log = MoodLog(
        session_id       = session_id,
        dominant_emotion = dominant,
        emotion_counts   = json.dumps(counts),
        message_count    = len(messages)
    )
    db.session.add(log)
    db.session.commit()