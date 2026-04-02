import logging
from celery import Celery
from backend.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Initialize the Celery client for the FastAPI backend to dispatch tasks
# The broker URL points to RabbitMQ
celery_app = Celery(
    "personabot_worker",
    broker=settings.CELERY_BROKER_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    result_backend="rpc://",  # Allows querying task results
    broker_connection_retry_on_startup=True,
    task_time_limit=60,       # Max time for a task to run
    task_soft_time_limit=50
)

def get_celery_app():
    """Access the shared Celery application instance."""
    return celery_app
