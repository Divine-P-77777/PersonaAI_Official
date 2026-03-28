"""
PersonaBot — Database Query Helpers

All queries enforce multi-tenant isolation.
Only the Supabase client (anon/service-role) is used — no raw SQLAlchemy
sessions so that RLS policies remain in effect.
"""

from __future__ import annotations

import logging
from typing import Optional
from uuid import UUID

from backend.database.connection import get_supabase_client, get_authed_client, get_service_client

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------


async def get_user_by_id(user_id: str, token: str = None) -> Optional[dict]:
    """Fetch a user profile row. Pass token to satisfy RLS via auth.uid()."""
    try:
        client = get_authed_client(token) if token else get_supabase_client()
        result = (
            client
            .table("users")
            .select("*")
            .eq("id", user_id)
            .maybe_single()
            .execute()
        )
        return result.data if result else None
    except Exception:
        return None


async def upsert_user(user_data: dict, token: str = None) -> dict:
    """Insert or update a user row. Pass token to satisfy RLS via auth.uid()."""
    client = get_authed_client(token) if token else get_supabase_client()
    result = (
        client
        .table("users")
        .upsert(user_data, on_conflict="id")
        .execute()
    )
    return result.data[0]


# ---------------------------------------------------------------------------
# Bots
# ---------------------------------------------------------------------------


async def get_bots_by_owner(owner_id: str) -> list[dict]:
    """Return all bots owned by an alumni/professional."""
    result = (
        get_supabase_client()
        .table("bots")
        .select("*")
        .eq("owner_id", owner_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


async def get_public_bots(token: str = None) -> list[dict]:
    """Return all bots that are 'ready' for the explore page."""
    client = get_authed_client(token) if token else get_supabase_client()
    result = (
        client
        .table("bots")
        .select("*, owner:users(display_name, avatar_url)")
        .eq("status", "ready")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


async def get_bots_by_owner(owner_id: str, token: str = None) -> list[dict]:
    """Fetch all bots owned by a specific alumni."""
    client = get_authed_client(token) if token else get_supabase_client()
    result = (
        client
        .table("bots")
        .select("*")
        .eq("owner_id", owner_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


async def get_bot_by_id(bot_id: str, owner_id: Optional[str] = None, token: str = None) -> Optional[dict]:
    """Fetch a single bot; optionally restrict to owner."""
    try:
        client = get_authed_client(token) if token else get_supabase_client()
        query = client.table("bots").select("*").eq("id", bot_id)
        if owner_id:
            query = query.eq("owner_id", owner_id)
        result = query.maybe_single().execute()
        return result.data if result else None
    except Exception:
        return None


async def create_bot(bot_data: dict, token: str = None) -> dict:
    """Create a new bot record. Pass token for RLS."""
    client = get_authed_client(token) if token else get_supabase_client()
    result = client.table("bots").insert(bot_data).execute()
    return result.data[0]


async def update_bot(bot_id: str, updates: dict, token: str = None) -> Optional[dict]:
    """Update an existing bot. Pass token for RLS."""
    client = get_authed_client(token) if token else get_supabase_client()
    result = (
        client
        .table("bots")
        .update(updates)
        .eq("id", bot_id)
        .execute()
    )
    return result.data[0] if result.data else None


async def delete_bot(bot_id: str, owner_id: str, token: str = None) -> bool:
    """Delete a bot. Pass token for RLS."""
    client = get_authed_client(token) if token else get_supabase_client()
    result = (
        client
        .table("bots")
        .delete()
        .eq("id", bot_id)
        .eq("owner_id", owner_id)
        .execute()
    )
    return bool(result.data)


# ---------------------------------------------------------------------------
# Ingestion Batches
# ---------------------------------------------------------------------------


async def create_ingestion_batch(batch_data: dict, token: str = None) -> dict:
    """Create a new ingestion batch."""
    client = get_authed_client(token) if token else get_supabase_client()
    result = client.table("ingestion_batches").insert(batch_data).execute()
    return result.data[0]


async def get_batch_by_id(batch_id: str, token: str = None) -> Optional[dict]:
    """Fetch a specific batch."""
    client = get_authed_client(token) if token else get_supabase_client()
    result = (
        client
        .table("ingestion_batches")
        .select("*")
        .eq("id", batch_id)
        .maybe_single()
        .execute()
    )
    return result.data


async def update_batch_status(batch_id: str, updates: dict, token: str = None) -> None:
    """Update batch status."""
    client = get_authed_client(token) if token else get_supabase_client()
    client.table("ingestion_batches").update(updates).eq("id", batch_id).execute()


async def get_batches_by_bot(bot_id: str, token: str = None) -> list[dict]:
    """List batches for a bot."""
    client = get_authed_client(token) if token else get_supabase_client()
    result = (
        client
        .table("ingestion_batches")
        .select("*, data_sources(id, type, title, status)")
        .eq("bot_id", bot_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


# ---------------------------------------------------------------------------
# Data Sources
# ---------------------------------------------------------------------------


async def create_data_sources(sources: list[dict], token: str = None) -> list[dict]:
    """Batch-insert multiple data sources (array upload)."""
    client = get_authed_client(token) if token else get_supabase_client()
    result = client.table("data_sources").insert(sources).execute()
    return result.data or []


async def get_data_sources_by_bot(bot_id: str, token: str = None) -> list[dict]:
    client = get_authed_client(token) if token else get_supabase_client()
    result = (
        client
        .table("data_sources")
        .select("*")
        .eq("bot_id", bot_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


async def get_data_sources_by_batch(batch_id: str, token: str = None) -> list[dict]:
    """Fetch all data sources associated with a specific ingestion batch."""
    client = get_authed_client(token) if token else get_supabase_client()
    result = (
        client
        .table("data_sources")
        .select("*")
        .eq("batch_id", batch_id)
        .execute()
    )
    return result.data or []


async def get_data_source_by_id(source_id: str, token: str = None) -> Optional[dict]:
    client = get_authed_client(token) if token else get_supabase_client()
    result = (
        client
        .table("data_sources")
        .select("*")
        .eq("id", source_id)
        .maybe_single()
        .execute()
    )
    return result.data

async def update_data_source_status(source_id: str, status: str, error: Optional[str] = None, token: str = None) -> None:
    client = get_authed_client(token) if token else get_supabase_client()
    updates: dict = {"status": status}
    if error:
        updates["error_message"] = error
    client.table("data_sources").update(updates).eq("id", source_id).execute()


# ---------------------------------------------------------------------------
# Data Chunks
# ---------------------------------------------------------------------------


async def insert_data_chunks(chunks: list[dict], token: str = None) -> list[dict]:
    """Batch-insert processed chunks for a data source."""
    client = get_authed_client(token) if token else get_supabase_client()
    result = client.table("data_chunks").insert(chunks).execute()
    return result.data or []


async def get_chunks_by_source(data_source_id: str) -> list[dict]:
    result = (
        get_supabase_client()
        .table("data_chunks")
        .select("*")
        .eq("data_source_id", data_source_id)
        .order("chunk_index")
        .execute()
    )
    return result.data or []


async def search_similar_chunks(
    bot_id: str,
    query_embedding: list[float],
    top_k: int = 5,
    similarity_threshold: float = 0.5,
    token: str = None,
) -> list[dict]:
    """
    pgvector cosine similarity search via the `match_data_chunks` RPC function.
    Scoped to bot_id for full multi-tenant isolation.
    """
    logger.debug(f"[DB] Similarity Search: Bot={bot_id} | k={top_k} | threshold={similarity_threshold}")
    # Use authed client if token provided (respects RLS as 'authenticated');
    # fall back to service client for internal calls (bypasses RLS, bot_id ensures isolation)
    if token:
        client = get_authed_client(token)
    else:
        try:
            client = get_service_client()
        except Exception:
            client = get_supabase_client()  # last resort anon
    result = (
        client
        .rpc(
            "match_data_chunks",
            {
                "query_embedding":      query_embedding,
                "match_bot_id":         bot_id,
                "match_count":          top_k,
                "similarity_threshold": similarity_threshold,
            },
        )
        .execute()
    )
    
    results = result.data or []
    if results:
        top_score = results[0].get("similarity", 0)
        logger.info(f"[DB] Similarity Search: Found {len(results)} matches for bot {bot_id} (Top Score: {top_score:.4f})")
    else:
        logger.info(f"[DB] Similarity Search: Found 0 matches for bot {bot_id} (threshold={similarity_threshold})")

    return results


# Chat History (Messages)

async def get_recent_messages(user_id: str, bot_id: str, limit: int = 5, token: str = None) -> list[dict]:
    """Fetch the most recent N messages for a user+bot pair (ordered ASC for LLM context)."""
    try:
        client = get_authed_client(token) if token else get_supabase_client()
        result = (
            client
            .table("messages")
            .select("role, content")
            .eq("user_id", user_id)
            .eq("bot_id", bot_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        
        # Reverse to get chronological order [oldest -> newest] for the LLM
        messages = result.data or []
        messages.reverse()
        return messages
    except Exception as e:
        logger.error(f"[DB] Failed to fetch recent messages: {e}")
        return []


async def save_message(user_id: str, bot_id: str, role: str, content: str, token: str = None) -> Optional[dict]:
    """Persist a single chat message to the history."""
    try:
        client = get_authed_client(token) if token else get_supabase_client()
        data = {
            "user_id": user_id,
            "bot_id": bot_id,
            "role":    role,
            "content": content
        }
        result = client.table("messages").insert(data).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        logger.error(f"[DB] Failed to save message: {e}")
        return None
