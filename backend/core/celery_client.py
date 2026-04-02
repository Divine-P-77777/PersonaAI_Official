import logging
from celery import Celery
from backend.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Initialize the Celery client for FastAPI to dispatch async OCR tasks.
#
# NOTE: This is ONLY used by the experimental /api/worker/test-ocr-async endpoint.
# The main ingestion pipeline (ingestion_worker.py) uses FastAPI BackgroundTasks
# and does NOT require Celery, RabbitMQ, or this client in any way.
#
# broker_connection_retry_on_startup=True ensures the backend doesn't crash on
# startup when RabbitMQ is unavailable (local dev without Docker).
celery_app = Celery(
    "personabot_worker",
    broker=settings.CELERY_BROKER_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    result_backend="rpc://",
    broker_connection_retry_on_startup=True,  # Silences startup crash if broker is down
    broker_transport_options={"max_retries": 0},  # Don't retry in local dev
    task_time_limit=60,
    task_soft_time_limit=50,
)


def get_celery_app() -> Celery:
    """Return the shared Celery app instance.
    
    The broker connection is lazy — it only actually connects when
    send_task() is called. The ocr_fallback.py already catches connection
    errors and falls back to local Tesseract, so this is safe without RabbitMQ.
    """
    return celery_app
