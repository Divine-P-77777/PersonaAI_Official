import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# ─── Logging ──────────────────────────────────────────────────────────────────
import asyncio
import logging
import httpx
from backend.core.config import get_settings

settings = get_settings()
log_level = logging.DEBUG if settings.DEBUG else logging.WARNING
logging.basicConfig(level=log_level, format="%(levelname)s:%(name)s: %(message)s")

# Suppress noisy third-party debug logs
for noisy_logger in ("hpack", "httpcore", "httpx", "h2", "urllib3"):
    logging.getLogger(noisy_logger).setLevel(logging.WARNING)

# ─── FastAPI & Middleware ──────────────────────────────────────────────────────
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from backend.core.config import get_settings
from backend.core.rate_limiter import limiter
from backend.core.redis_client import close_redis_pool
from backend.api.routers import auth, bots, ingestion, chat, voice, users, worker, live

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Human Persona AI Platform – Create and interact with personalized AI chatbots",
)

# Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/api/auth",      tags=["Authentication"])
app.include_router(users.router,     prefix="/api/users",     tags=["Users"])
app.include_router(bots.router,      prefix="/api/bots",      tags=["Bots"])
app.include_router(ingestion.router, prefix="/api/ingestion", tags=["Ingestion"])
app.include_router(chat.router,      prefix="/api/chat",      tags=["Chat"])
app.include_router(voice.router,     prefix="/api/voice",     tags=["Voice"])
app.include_router(worker.router,    prefix="/api",           tags=["Worker Queue"])
app.include_router(live.router,      prefix="/api/live",      tags=["Live Interaction"])

# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}

# ─── Render Self-Ping (keeps free-tier alive) ─────────────────────────────────
PING_INTERVAL = 14 * 60  # 14 minutes

def get_backend_url() -> str:
    render_url = os.getenv("RENDER_EXTERNAL_URL")
    if render_url:
        return render_url
    host = os.getenv("HOST", "127.0.0.1")
    port = os.getenv("PORT", "8000")
    return f"http://{host}:{port}"

async def self_ping():
    url = get_backend_url()
    if not url.endswith(".onrender.com"):
        logging.info("Not a Render domain, skipping self-ping.")
        return
    logging.info(f"Self-ping enabled for: {url}")
    async with httpx.AsyncClient() as client:
        while True:
            try:
                res = await client.get(f"{url}/health")
                logging.debug(f"Pinged {url}/health – Status: {res.status_code}")
            except Exception as e:
                logging.error(f"Ping failed to {url}: {e}")
            await asyncio.sleep(PING_INTERVAL)

# ─── Lifecycle Events ─────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(self_ping())

@app.on_event("shutdown")
async def shutdown_event():
    await close_redis_pool()
