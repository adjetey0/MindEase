from datetime import datetime

def format_datetime(dt: datetime) -> str:
    return dt.strftime("%d %B %Y, %I:%M %p") if dt else ""

def emotion_to_emoji(emotion: str) -> str:
    return {
        "anxiety":    "😰",
        "stress":     "😤",
        "depression": "😞",
        "neutral":    "😐",
        "positive":   "😊"
    }.get(emotion, "💬")

def emotion_to_color(emotion: str) -> str:
    return {
        "anxiety":    "#F59E0B",
        "stress":     "#EF4444",
        "depression": "#6366F1",
        "neutral":    "#6B7280",
        "positive":   "#10B981"
    }.get(emotion, "#6B7280")