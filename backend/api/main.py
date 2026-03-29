from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import asyncio
import httpx

from backend.core.config import get_settings
from backend.api.routers import auth, bots, ingestion, chat, voice, users, worker

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Human Persona AI Platform – Create and interact with personalized AI chatbots",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(bots.router, prefix="/api/bots", tags=["Bots"])
app.include_router(ingestion.router, prefix="/api/ingestion", tags=["Ingestion"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(voice.router, prefix="/api/voice", tags=["Voice"])
app.include_router(worker.router, prefix="/api", tags=["Worker Queue"])


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}

# --- Render Self-Ping Mechanism ---
PING_INTERVAL = 14 * 60  # 14 minutes

def get_backend_url():
    """Build the backend URL, prioritizing Render's environment variable."""
    render_url = os.getenv("RENDER_EXTERNAL_URL")
    if render_url:
        return render_url
    
    # Fallback for local or other environments
    host = os.getenv("HOST", "127.0.0.1")
    port = os.getenv("PORT", "8000")
    return f"http://{host}:{port}"

async def self_ping():
    """Background task to ping the service and keep it awake on Render."""
    url = get_backend_url()

    # Only allow Render domains to prevent unnecessary pings on EC2/Docker/Local
    if not url.endswith(".onrender.com"):
        print("❌ Not a Render domain, skipping self-ping.")
        return

    print(f"✅ Self-ping enabled for: {url}")

    async with httpx.AsyncClient() as client:
        while True:
            try:
                # Ping the health endpoint
                res = await client.get(f"{url}/health")
                print(f" Pinged {url}/health - Status: {res.status_code}")
            except Exception as e:
                print(f" Ping failed: {e}")

            await asyncio.sleep(PING_INTERVAL)

@app.on_event("startup")
async def startup_event():
    """Start the self-ping background task on server startup."""
    asyncio.create_task(self_ping())
