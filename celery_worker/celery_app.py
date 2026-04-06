import os
import time
import logging
import threading
import httpx
from http.server import BaseHTTPRequestHandler, HTTPServer
from celery import Celery
from celery.signals import worker_ready

# --- Production Logging Setup ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] [PID:%(process)d] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("PersonaBot-Worker")

# Default fallback is rabbitmq service in docker-compose
broker_url = os.environ.get("CELERY_BROKER_URL", "amqp://personabot:persona_pass@rabbitmq:5672/personabot_vhost")

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
    broker_connection_retry_on_startup=True,
    result_backend="rpc://",
    # Stability fixes for CloudAMQP on Render
    broker_heartbeat=10,                      # Prevent Render from killing idle broker connection
    broker_use_ssl=True if "amqps://" in (broker_url or "") else False,
    broker_transport_options={
        "max_retries": 10,
        "interval_start": 0,
        "interval_step": 0.2,
        "interval_max": 2,
    },
)


class HealthCheckHandler(BaseHTTPRequestHandler):
    """Minimal HTTP handler — serves a 200 OK on GET /health."""
    def do_GET(self):
        if self.path in ("/health", "/"):
            body = b'{"status": "ok", "service": "celery-worker"}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Suppress default access logs to keep output clean
        pass

def start_health_server():
    """Start a lightweight HTTP server bound to Render's PORT env var."""
    port = int(os.environ.get("PORT", 10000))
    server = HTTPServer(("0.0.0.0", port), HealthCheckHandler)
    logger.info(f"🌐 Health server listening on port {port} (Render free tier compatibility)")
    server.serve_forever()

# Start the health server IMMEDIATELY at import time —
# this runs before `celery worker` CLI even tries to connect to RabbitMQ.
_health_thread = threading.Thread(target=start_health_server, daemon=True)
_health_thread.start()
logger.info("🚀 Health server thread launched (Render port satisfied)")

# --- Render Self-Ping Mechanism (Production Grade) ---
PING_INTERVAL = 14 * 60  # 14 minutes
INITIAL_DELAY = 30        # Wait 30s to let broker connection settle first

def get_backend_url():
    """Build the backend URL, prioritizing Render's environment variable."""
    render_url = os.environ.get("RENDER_EXTERNAL_URL")
    if render_url:
        return render_url.rstrip("/")
    host = os.environ.get("HOST", "127.0.0.1")
    port = os.environ.get("PORT", "8000")
    return f"http://{host}:{port}"

def self_ping_loop():
    """Optimized threaded loop to keep the service cluster awake on Render."""
    url = get_backend_url()

    # Domain check: only run on Render
    if not url.endswith(".onrender.com"):
        logger.info("❌ Worker Pinger: Not a Render domain, skipping self-ping.")
        return

    logger.info(f"✅ Worker Pinger: Initialized for {url}. Starting in {INITIAL_DELAY}s...")
    time.sleep(INITIAL_DELAY)

    headers = {"User-Agent": "PersonaBot-Worker-KeepAlive"}

    while True:
        try:
            with httpx.Client(timeout=15.0, headers=headers) as client:
                res = client.get(f"{url}/health")
                if res.status_code == 200:
                    logger.info(f"📡 Worker Pinger: Pinged {url}/health - Status: 200 OK")
                else:
                    logger.warning(f"📡 Worker Pinger: Unexpected status {res.status_code} from {url}/health")
        except httpx.ConnectError:
            logger.error(f"📡 Worker Pinger: Connection failed to {url}. Network might be down.")
        except Exception as e:
            logger.error(f"📡 Worker Pinger: Unexpected error: {str(e)}")

        time.sleep(PING_INTERVAL)

@worker_ready.connect
def on_worker_ready(sender, **kwargs):
    """Start the self-ping background thread once the worker is connected and ready."""
    ping_thread = threading.Thread(target=self_ping_loop, daemon=True)
    ping_thread.start()
