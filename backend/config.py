import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # App
    APP_NAME        = "MindEase"
    DEBUG           = os.getenv("DEBUG", "true").lower() == "true"
    SECRET_KEY      = os.getenv("SECRET_KEY", "mindease-dev-secret-key")

    # Database
    BASE_DIR        = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(BASE_DIR, '../database/mindease.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Session (Anonymous ID)
    SESSION_ID_HEADER = "X-Session-ID"

    # ML Model
    MODEL_NAME      = "distilbert-base-uncased"
    MODEL_PATH      = os.path.join(BASE_DIR, "ml/model/saved_model")
    MAX_TOKEN_LEN   = 128

    # Emotion Labels
    EMOTION_LABELS  = ["anxiety", "stress", "depression", "neutral", "positive"]

    # Crisis Keywords
    CRISIS_KEYWORDS = [
        "kill myself", "end my life", "want to die", "suicide",
        "self harm", "cut myself", "no reason to live", "give up on life"
    ]

    # Translation
    SUPPORTED_LANGUAGES = {
        "en": "English",
        "tw": "Twi",
        "fr": "French"
    }
    DEFAULT_LANGUAGE = "en"

    # Report
    REPORT_OUTPUT_DIR = os.path.join(BASE_DIR, "../database/reports")

    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config = {
    "development": DevelopmentConfig,
    "production":  ProductionConfig,
    "default":     DevelopmentConfig
}