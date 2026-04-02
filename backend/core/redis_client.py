import logging
import json
from typing import Optional, Any
from redis import asyncio as aioredis
from backend.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_redis_pool = None

async def init_redis_pool() -> aioredis.Redis | None:
    """Initialize custom global Redis connection pool."""
    global _redis_pool
    if _redis_pool is None:
        try:
            _redis_pool = aioredis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_timeout=2.0,
                socket_connect_timeout=2.0
            )
            await _redis_pool.ping()
            logger.info("✅ Redis connected successfully.")
        except Exception as e:
            logger.warning(f"⚠️ Redis connection failed: {e}. Falling back to degraded mode.")
            _redis_pool = None
    return _redis_pool

async def close_redis_pool():
    """Cleanup Redis connection pool."""
    global _redis_pool
    if _redis_pool is not None:
        await _redis_pool.aclose()
        logger.info("Redis connection closed.")

async def get_cache(key: str) -> Optional[Any]:
    """Retrieve an item from Redis."""
    redis = await init_redis_pool()
    if not redis:
        return None
    try:
        val = await redis.get(key)
        return json.loads(val) if val else None
    except Exception as e:
        logger.warning(f"Redis get failed for {key}: {e}")
        return None

async def set_cache(key: str, value: Any, expire: int = 3600):
    """Store an item in Redis with an expiration time."""
    redis = await init_redis_pool()
    if not redis:
        return
    try:
        await redis.setex(key, expire, json.dumps(value))
    except Exception as e:
        logger.warning(f"Redis set failed for {key}: {e}")

async def invalidate_cache(key: str):
    """Delete an item from Redis."""
    redis = await init_redis_pool()
    if not redis:
        return
    try:
        await redis.delete(key)
    except Exception as e:
        logger.warning(f"Redis delete failed for {key}: {e}")
