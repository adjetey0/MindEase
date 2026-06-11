from flask import current_app
import re

CRISIS_RESPONSE = {
    "en": (
        "I'm really concerned about what you just shared. You don't have to go through this alone. "
        "Please reach out to a mental health professional or call a crisis line right away.\n\n"
        "🇬🇭 Ghana Mental Health Helpline: 0800 111 222 (free, 24/7)\n"
        "💙 You matter. Help is available."
    ),
    "tw": (
        "Me hu w'asem no mu na mehia wo. Ennhyɛ wo ho nnidi. "
        "Yɛ frɛ obiara a ɔtumi boa wo: 0800 111 222"
    ),
    "fr": (
        "Je suis vraiment préoccupé par ce que vous venez de partager. "
        "Vous n'êtes pas seul(e). Appelez le: 0800 111 222"
    )
}


def is_crisis(text: str) -> bool:
    """Check if user message contains crisis/self-harm language."""
    keywords   = current_app.config.get("CRISIS_KEYWORDS", [])
    text_lower = text.lower()
    return any(re.search(rf"\b{re.escape(kw)}\b", text_lower) for kw in keywords)


def get_crisis_response(language: str = "en") -> str:
    """Return crisis response in the user's preferred language."""
    return CRISIS_RESPONSE.get(language, CRISIS_RESPONSE["en"])