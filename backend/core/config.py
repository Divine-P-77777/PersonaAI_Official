from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from functools import lru_cache


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # App
    APP_NAME: str = "AskMentor"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Supabase
    SUPABASE_URL: str = ""
    # Accept both SUPABASE_KEY (in .env) and SUPABASE_ANON_KEY
    SUPABASE_ANON_KEY: str = Field("", alias="SUPABASE_KEY", validation_alias="SUPABASE_KEY")
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    SUPABASE_AVATAR_BUCKET: str = "avatars"

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Database
    DATABASE_URL: str = ""

    # LLM & Embeddings (Groq + Nomic)
    GROQ_API_KEY: str = ""
    NOMIC_API_KEY: str = ""
    LLM_MODEL: str = "llama3-8b-8192"
    EMBEDDING_MODEL: str = "nomic-embed-text-v1.5"

    # ElevenLabs (Voice)
    ELEVENLABS_API_KEY: str = ""

    # Sarvam AI (Hindi TTS)
    SARVAM_API_KEY: str = ""

    # Cashfree Payments
    # CASHFREE_ENV must be "sandbox" (default, for testing) or "production"
    CASHFREE_ENV:        str = "sandbox"
    CASHFREE_APP_ID:     str = ""
    CASHFREE_SECRET_KEY: str = ""
    CASHFREE_WEBHOOK_SECRET: str = ""
    CASHFREE_WEBHOOK_URL: str = ""
    FRONTEND_BASE_URL: str = "http://localhost:3000"

    # RAG Config
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    TOP_K_RESULTS: int = 5
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    WEB_SCRAPER_TIMEOUT: float = 30.0
    TESSERACT_PATH: str = "tesseract"

    # Worker Queue & Redis
    CELERY_BROKER_URL: str = "amqp://guest:guest@localhost:5672//"
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://www.askmentor.online",
        "https://askmentor.online",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            import json
            v = v.strip()
            if not v:
                return [
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                    "https://www.askmentor.online",
                    "https://askmentor.online",
                ]
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            # Comma-separated values
            return [item.strip() for item in v.split(",") if item.strip()]
        elif isinstance(v, list):
            return v
        return v

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "populate_by_name": True,   # allow access by field name AND alias
        "extra": "ignore",          # ignore unknown env vars silently
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
