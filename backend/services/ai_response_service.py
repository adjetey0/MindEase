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
