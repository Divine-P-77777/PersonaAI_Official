import logging
from typing import Callable, Any
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request
from limits.storage import storage_from_string, MemoryStorage
from limits.storage.redis import RedisStorage
from backend.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class FallbackStorage:
    """
    A custom storage proxy for slowapi/limits.
    It attempts to use RedisStorage, and if a ConnectionError occurs,
    automatically falls back to MemoryStorage.
    """
    def __init__(self, redis_uri: str):
        self.memory = MemoryStorage()
        self.redis_uri = redis_uri
        self._redis_storage = None
        
        try:
            # Try to initialize redis storage directly
            self._redis_storage = storage_from_string(redis_uri)
            # Verify connection
            if hasattr(self._redis_storage, 'check'):
                self._redis_storage.check()
            logger.info("✅ Rate limiting configured with Redis backend.")
        except Exception as e:
            logger.warning(f"⚠️ Redis rate limiter unavailable on startup: {e}. Defaulting to Memory Storage.")
            self._redis_storage = None

    def get_storage(self):
        """Returns the active storage engine based on current availability."""
        if self._redis_storage:
            try:
                # Lightweight ping check before returning
                if hasattr(self._redis_storage, 'check'):
                     self._redis_storage.check()
                return self._redis_storage
            except Exception as e:
                logger.error(f"⚠️ Redis rate limiter dropped connection: {e}. Falling back to Memory Storage.")
                self._redis_storage = None
                return self.memory
        return self.memory

    # Delegate limits Storage API methods
    def get(self, key: str) -> int:
        return self.get_storage().get(key)
        
    def get_expiry(self, key: str) -> int:
        return self.get_storage().get_expiry(key)
        
    def check(self) -> bool:
        return self.get_storage().check()
        
    def reset(self) -> int:
        return self.get_storage().reset()
        
    def clear(self, key: str) -> None:
        self.get_storage().clear(key)
        
    def acquire_entry(self, key: str, limit: Any, amount: int = 1) -> bool:
        return self.get_storage().acquire_entry(key, limit, amount)
        
    def get_moving_window(self, key: str, limit: Any, timestamp: float) -> tuple[int, list]:
        return self.get_storage().get_moving_window(key, limit, timestamp)
        
    def inc(self, key: str, expiry: int, elastic_expiry: bool = False, amount: int = 1) -> int:
        # Some older versions of limits might use inc instead of acquire_entry natively in some scenarios
        try:
           return self.get_storage().inc(key, expiry, elastic_expiry, amount)
        except AttributeError:
             pass

def get_real_address(request: Request) -> str:
    """Extract real client IP if behind proxy."""
    return request.headers.get("X-Forwarded-For", get_remote_address(request))

# Initialize the Limiter with our custom FallbackStorage
# We pass the storage directly if limits library supports it, otherwise we inject it.
limiter = Limiter(key_func=get_real_address, strategy="fixed-window")

# Explicit injection of our custom robust storage back-end
custom_storage = FallbackStorage(settings.REDIS_URL)
limiter._storage = custom_storage

