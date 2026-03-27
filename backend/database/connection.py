"""
Database connection manager.
Handles Supabase connections with both public and user-authenticated clients.
"""
from supabase import create_client, Client

from backend.core.config import get_settings

_supabase_client: Client | None = None
_service_client: Client | None = None


def get_supabase_client() -> Client:
    """Get or create the shared Supabase client using the anon key (for public/read ops)."""
    global _supabase_client
    if _supabase_client is None:
        settings = get_settings()
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY,
        )
    return _supabase_client


def get_authed_client(token: str) -> Client:
    """
    Create a per-request Supabase client authenticated with the user's JWT.
    
    This is the standard pattern for FastAPI + Supabase without a service role key.
    By forwarding the user's own JWT, auth.uid() resolves correctly in all RLS policies,
    so the user can only read/write their own rows — just like a direct browser request.
    """
    settings = get_settings()
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    client.postgrest.auth(token)
    return client


def get_service_client() -> Client:
    """
    Get a Supabase client authenticated with the service role key.
    
    IMPORTANT: This bypasses ALL RLS policies. Use ONLY for internal
    server-side operations (e.g., RAG similarity search, background workers)
    where no user JWT is available but data access is controlled by
    application-level bot_id filtering.
    """
    global _service_client
    if _service_client is None:
        settings = get_settings()
        _service_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return _service_client
