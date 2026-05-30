"""
Live Session State Manager (Redis-backed).

Responsibility: CRUD operations for per-session live state stored in Redis.
Redis is used instead of Supabase because:
  - Session state changes every few hundred milliseconds (interruption flags).
  - Redis reads/writes are < 1ms vs 50–200ms for a Postgres round-trip.
  - Sessions are ephemeral (4 hour TTL) and don't need long-term persistence.


"""
import json
import logging
from typing import Optional
from backend.core.redis_client import init_redis_pool

logger = logging.getLogger(__name__)

# Redis TTL: 4 hours. Sessions abandoned without explicit session_end are
# garbage-collected automatically when the TTL expires.
SESSION_TTL_SECONDS = 4 * 60 * 60


def _key(session_id: str) -> str:
    return f"live_session:{session_id}"


async def create_live_session(session_id: str,user_id: str,bot_id: str,language: str = "en",voice_gender: str = "female") -> None:
    """
    Create a new live session record in Redis.

    Fields stored:
      user_id      — authenticated user
      bot_id       — which persona they're talking to
      language     — current active language (en | hi)
      voice_gender — bot's configured gender (male | female | transgender)
      is_speaking  — True while AI audio is streaming
      interrupted  — True when user interrupts (used as safety flag)
    """
    redis = await init_redis_pool()
    if not redis:
        logger.warning(f"[Session] Redis unavailable — session {session_id[:8]} not persisted.")
        return

    payload = json.dumps({
        "user_id":      user_id,
        "bot_id":       bot_id,
        "language":     language,
        "voice_gender": voice_gender,
        "is_speaking":  False,
        "interrupted":  False,
    })
    try:
        await redis.setex(_key(session_id), SESSION_TTL_SECONDS, payload)
        logger.debug(f"[Session] Created: {session_id[:8]}… (lang={language}, gender={voice_gender})")
    except Exception as exc:
        logger.warning(f"[Session] Redis write failed for {session_id[:8]}: {exc} — session not persisted, continuing anyway.")


async def get_live_session(session_id: str) -> Optional[dict]:
    """Retrieve full session state. Returns None if session not found."""
    redis = await init_redis_pool()
    if not redis:
        return None
    try:
        raw = await redis.get(_key(session_id))
        return json.loads(raw) if raw else None
    except Exception as exc:
        logger.warning(f"[Session] Redis read failed for {session_id[:8]}: {exc}")
        return None


async def update_session_field(session_id: str, **kwargs) -> None:
    """
    Patch one or more fields in the session record without overwriting others.

    Example:
        await update_session_field(session_id, language="hi", is_speaking=True)
    """
    redis = await init_redis_pool()
    if not redis:
        return
    try:
        raw = await redis.get(_key(session_id))
        if not raw:
            logger.warning(f"[Session] update_session_field: session {session_id[:8]} not found.")
            return
        state = json.loads(raw)
        state.update(kwargs)
        await redis.setex(_key(session_id), SESSION_TTL_SECONDS, json.dumps(state))
    except Exception as exc:
        logger.warning(f"[Session] Redis update failed for {session_id[:8]}: {exc}")


async def delete_live_session(session_id: str) -> None:
    """Delete a session explicitly (called on session_end or clean disconnect)."""
    redis = await init_redis_pool()
    if not redis:
        return
    try:
        await redis.delete(_key(session_id))
        logger.debug(f"[Session] Deleted: {session_id[:8]}…")
    except Exception as exc:
        logger.warning(f"[Session] Redis delete failed for {session_id[:8]}: {exc}")
