import httpx
import time
from jose import jwt, JWTError, jwk
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any, Optional, List

from backend.core.config import get_settings
from backend.database.queries import get_user_by_id

security_scheme = HTTPBearer()
settings = get_settings()

# JWKS Cache
_jwks_cache: Optional[Dict[str, Any]] = None
_jwks_last_fetch: float = 0
JWKS_CACHE_TTL = 3600  # 1 hour

async def get_jwks() -> Dict[str, Any]:
    """Fetch and cache JWKS from Supabase."""
    global _jwks_cache, _jwks_last_fetch
    now = time.time()
    
    if _jwks_cache and (now - _jwks_last_fetch < JWKS_CACHE_TTL):
        return _jwks_cache
        
    # Use the public .well-known JWKS endpoint (no auth header needed)
    jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                jwks_url,
                headers={"apikey": settings.SUPABASE_ANON_KEY}
            )
            response.raise_for_status()
            _jwks_cache = response.json()
            _jwks_last_fetch = now
            print(f"DEBUG: Successfully fetched JWKS from {jwks_url}")
            return _jwks_cache
        except Exception as e:
            print(f"DEBUG: Failed to fetch JWKS: {str(e)}")
            # Fallback to local secret if JWKS fetch fails
            return {"keys": []}

async def verify_supabase_token(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> Dict[str, Any]:
    """Verify Supabase JWT token and return decoded payload."""
    token = credentials.credentials
    alg = "HS256"
    try:
        # 1. Peek at header to determine algorithm and key ID
        unverified_header = jwt.get_unverified_header(token)
        alg = unverified_header.get("alg", "HS256")
        kid = unverified_header.get("kid")
        
        # 2. Handle ES256 (New/ECC keys) via JWKS
        if alg == "ES256":
            jwks = await get_jwks()
            # Find the matching key in JWKS
            key_data = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
            
            if not key_data:
                print(f"DEBUG: ES256 key {kid} not found in JWKS. Falling back.")
                # We can't verify ES256 without the key
                raise JWTError("Public key not found in JWKS")
                
            payload = jwt.decode(
                token,
                key_data, # python-jose handles the JWK dict automatically
                algorithms=["ES256"],
                audience="authenticated",
            )
            return payload

        # 3. Fallback to HS256 (Shared Secret)
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except JWTError as e:
        print(f"DEBUG: JWT Verification Error ({alg}): {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user_id(
    payload: Dict[str, Any] = Depends(verify_supabase_token),
) -> str:
    """Extract user ID from verified JWT payload."""
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token",
        )
    return user_id

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    payload: Dict[str, Any] = Depends(verify_supabase_token),
) -> Dict[str, Any]:
    """
    Fetch user profile using the user's own JWT for RLS (no service role key needed).
    The raw token is stored as '_token' so routers can pass it to write operations.
    """
    token = credentials.credentials
    user_id = payload.get("sub")
    user_email = payload.get("email")
    
    # Pass the user's own JWT so auth.uid() resolves correctly in Supabase RLS
    user = await get_user_by_id(user_id, token=token)
    
    if not user:
        # Brand new user — hasn't been inserted by trigger yet
        user = {
            "id": user_id,
            "email": user_email,
            "is_new": True,
            "onboarding_completed": False
        }
    
    # Thread the raw token to the router layer for write operations
    user["_token"] = token
    return user

async def require_alumni_role(
    user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Enforce that the user must have an 'alumni' role."""
    if user.get("role") != "alumni":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires an alumni/professional account",
        )
    return user
