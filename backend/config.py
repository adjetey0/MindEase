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
