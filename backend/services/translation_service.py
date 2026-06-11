from deep_translator import GoogleTranslator

def translate_text(text: str, target_lang: str) -> str:
    """Translate text to target language. Falls back to original if it fails."""
    if target_lang == "en":
        return text
    try:
        return GoogleTranslator(source="en", target=target_lang).translate(text)
    except Exception:
        return text