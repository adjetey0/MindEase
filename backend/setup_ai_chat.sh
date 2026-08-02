#!/usr/bin/env bash
# Run this from your Flask backend root (the folder with services/, config.py, etc.)
set -e

mkdir -p services

cat > services/ai_response_service.py << 'PYEOF_services_ai_response_service_py'
# services/ai_response_service.py
#
# Generates real, contextual chat replies via OpenRouter instead of picking
# from canned templates. Crisis detection stays OUTSIDE this file on purpose —
# chat_service.py checks is_crisis() BEFORE calling this, and returns the
# fixed crisis response instead. That safety gate must never depend on an
# LLM's judgment call.

import os
from flask import current_app
from openai import OpenAI
from services.coping_service import format_bot_message  # fallback only

SYSTEM_PROMPT = """You are the AI companion inside MindEase, a mental health support app.

WHO YOU'RE TALKING TO: someone who opened a mental health app, so treat every
conversation with warmth and care — even when they ask something unrelated to
mental health.

WHAT YOU DO:
- Answer questions accurately and helpfully, on any topic the user brings up —
  mental health, general knowledge, everyday advice, anything.
- Educate clearly. Explain concepts (e.g. what CBT is, how anxiety works,
  why sleep affects mood) in plain, accessible language, not clinical jargon.
- Stay warm and conversational, not robotic or lecture-like.
- Keep replies reasonably concise (a few short paragraphs at most) unless the
  user is asking for something that genuinely needs more detail.

WHAT YOU DON'T DO:
- You are not a licensed therapist, doctor, or crisis counselor, and you never
  claim to be one. Don't diagnose any mental health or medical condition.
- Don't give specific medication names, dosages, or medical treatment plans —
  point the person to a doctor or pharmacist for that.
- Don't give specific guidance on self-harm methods, means, or logistics,
  even if the user frames the question innocently or academically.
- Don't discourage someone from seeking professional help — if a topic sounds
  like it needs a therapist, doctor, or the platform's counsellor call
  feature, say so plainly and encourage it, without being pushy about it
  every single message.

TONE: Genuine and human, not scripted. Avoid starting every reply with
"I hear you" or similar stock phrases. Vary how you acknowledge what someone
shared. If the user's detected emotional state is provided to you, let it
inform your tone, but don't announce it back to them clinically (avoid
"I can see you are experiencing anxiety" — just respond like a person would).

If a message contains signs of crisis or self-harm intent, you will not be
the one responding — a separate safety system handles that. Trust that and
just focus on being a genuinely helpful, honest, educational companion for
everything else.
"""


def _get_client() -> OpenAI:
    api_key = current_app.config.get("OPENROUTER_API_KEY")
    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )


def generate_ai_response(user_text: str, emotion: str, history: list) -> str:
    """
    Generate a real, contextual reply via OpenRouter.

    history: list of {"sender": "user"|"bot", "content": str} from most
    recent messages in the session, oldest first. Used so the AI has
    conversational context instead of responding to each message in isolation.

    Falls back to the old canned coping_service response if the API call
    fails for any reason (network issue, rate limit, model temporarily
    pulled) — the chat should never just break.
    """
    try:
        client = _get_client()
        model = current_app.config.get("OPENROUTER_MODEL")

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Include recent history for context (cap it to keep requests small
        # and cheap — free-tier models have tight rate limits)
        for msg in history[-10:]:
            role = "user" if msg.get("sender") == "user" else "assistant"
            messages.append({"role": role, "content": msg.get("content", "")})

        messages.append({
            "role": "user",
            "content": (
                f"[Detected emotional tone: {emotion}. Use this to inform "
                f"your tone, don't state it back clinically.]\n\n{user_text}"
            ),
        })

        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=500,
            temperature=0.7,
        )

        reply = response.choices[0].message.content.strip()
        if not reply:
            raise ValueError("Empty response from model")

        return reply

    except Exception as e:
        current_app.logger.error(f"AI response generation failed: {e}")
        # Graceful fallback — old canned response, better than a broken chat
        return format_bot_message(emotion)
PYEOF_services_ai_response_service_py
echo "Updated services/ai_response_service.py"

cat > services/chat_service.py << 'PYEOF_services_chat_service_py'
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
PYEOF_services_chat_service_py
echo "Updated services/chat_service.py"

cat > config.py << 'PYEOF_config_py'
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    APP_NAME        = "MindEase"
    DEBUG           = os.getenv("DEBUG", "true").lower() == "true"
    SECRET_KEY      = os.getenv("SECRET_KEY", "mindease-dev-secret-key")
    MONGO_URI       = os.getenv("MONGO_URI")
    JWT_SECRET_KEY          = os.getenv("SECRET_KEY", "mindease-dev-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES  = 30 * 24 * 60 * 60
    SESSION_ID_HEADER = "X-Session-ID"
    MODEL_NAME      = "distilbert-base-uncased"
    MODEL_PATH      = os.path.join(os.path.abspath(os.path.dirname(__file__)), "ml/model/saved_model")
    MAX_TOKEN_LEN   = 128
    EMOTION_LABELS  = ["anxiety", "stress", "depression", "neutral", "positive"]
    CRISIS_KEYWORDS = [
        "kill myself", "end my life", "want to die", "suicide",
        "self harm", "cut myself", "no reason to live", "give up on life"
    ]
    SUPPORTED_LANGUAGES = {"en": "English", "tw": "Twi", "fr": "French"}
    DEFAULT_LANGUAGE = "en"
    REPORT_OUTPUT_DIR = os.path.join(os.path.abspath(os.path.dirname(__file__)), "../database/reports")
    CORS_ORIGINS = "*"

    # --- Professional credential uploads ---
    PROFESSIONAL_UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), "uploads", "professional_credentials")
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB max upload size

    # --- AI chat responses (OpenRouter) ---
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    OPENROUTER_MODEL   = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free")


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config = {
    "development": DevelopmentConfig,
    "production":  ProductionConfig,
    "default":     DevelopmentConfig
}
PYEOF_config_py
echo "Updated config.py"

echo "Done. Run: pip install openai"
echo "Then add OPENROUTER_API_KEY and OPENROUTER_MODEL to your .env file."
echo "Then restart your backend: python app.py"