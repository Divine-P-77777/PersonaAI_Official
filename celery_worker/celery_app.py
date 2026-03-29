import os
import time
import threading
import httpx
from celery import Celery
from celery.signals import worker_ready

# Default fallback is rabbitmq service in docker-compose
broker_url = os.environ.get("CELERY_BROKER_URL", "amqp://guest:guest@rabbitmq:5672//")

celery_app = Celery(
    "personabot_worker",
    broker=broker_url,
    include=["celery_worker.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # rpc backend allows the client (FastAPI) to poll for task results
    result_backend="rpc://"
)

# --- Render Self-Ping Mechanism (Worker Side) ---
PING_INTERVAL = 14 * 60  # 14 minutes

def get_backend_url():
    """Build the backend URL, prioritizing Render's environment variable."""
    render_url = os.environ.get("RENDER_EXTERNAL_URL")
    if render_url:
        return render_url
    
    # Fallback for local or or context-specific Docker/127.0.0.1
    host = os.environ.get("HOST", "127.0.0.1")
    port = os.environ.get("PORT", "8000")
    # If in Docker, usually the backend is just 'backend:8000' internally,
    # but for Render keep-alive, we only care about the external public domain.
    return f"http://{host}:{port}"

def self_ping_loop():
    """Threaded loop to ping the service and keep it awake on Render."""
    url = get_backend_url()

    # Only allow Render domains to prevent unnecessary pings locally
    if not url.endswith(".onrender.com"):
        print(f"[{os.getpid()}] ❌ Worker Pinger: Not a Render domain, skipping self-ping.")
        return

    print(f"[{os.getpid()}] ✅ Worker Pinger: Self-ping enabled for: {url}")

    while True:
        try:
            # We use a synchronous request here because this is a background thread
            with httpx.Client(timeout=10.0) as client:
                res = client.get(f"{url}/health")
                print(f"[{os.getpid()}] 📡 Worker Pinger: Pinged {url}/health - Status: {res.status_code}")
        except Exception as e:
            print(f"[{os.getpid()}] 📡 Worker Pinger: Ping failed: {e}")

        time.sleep(PING_INTERVAL)

@worker_ready.connect
def startup_pinger(sender, **kwargs):
    """Start the self-ping background thread when the worker is ready."""
    # Only start the pinger once per worker process
    t = threading.Thread(target=self_ping_loop, daemon=True)
    t.start()

