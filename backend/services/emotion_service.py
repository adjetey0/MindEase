from transformers import pipeline
from flask import current_app
import torch

# Lazy-loaded pipeline (loads once on first use)
_classifier = None

def get_classifier():
    global _classifier
    if _classifier is None:
        # Use a pretrained emotion pipeline from Hugging Face
        _classifier = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            top_k=None,
            device=0 if torch.cuda.is_available() else -1
        )
    return _classifier


def detect_emotion(text: str) -> dict:
    """
    Detect emotion from user text.
    Returns: { emotion: str, score: float, all_scores: dict }
    """
    try:
        classifier = get_classifier()
        results    = classifier(text[:512])[0]

        # Map model labels to our app labels
        label_map = {
            "joy":      "positive",
            "neutral":  "neutral",
            "anger":    "stress",
            "fear":     "anxiety",
            "sadness":  "depression",
            "disgust":  "stress",
            "surprise": "neutral"
        }

        results.sort(key=lambda x: x["score"], reverse=True)
        top        = results[0]
        emotion    = label_map.get(top["label"].lower(), "neutral")
        score      = round(top["score"], 4)
        all_scores = {
            label_map.get(r["label"].lower(), r["label"]): round(r["score"], 4)
            for r in results
        }

        return {
            "emotion":    emotion,
            "score":      score,
            "all_scores": all_scores
        }

    except Exception as e:
        current_app.logger.error(f"Emotion detection error: {e}")
        return {"emotion": "neutral", "score": 1.0, "all_scores": {}}