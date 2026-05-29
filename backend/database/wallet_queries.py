"""
AskMentor — Wallet Database Queries
=====================================
All queries for wallet-related tables:
  - user_wallets
  - mentor_wallets
  - wallet_transactions
"""

from __future__ import annotations

import logging
from typing import Optional, List

from backend.database.connection import get_authed_client, get_service_client

logger = logging.getLogger(__name__)


async def get_user_wallet(user_id: str, token: str = None) -> Optional[dict]:
    """Fetch a user's wallet by user_id."""
    try:
        client = get_authed_client(token) if token else get_service_client()
        result = (
            client
            .table("user_wallets")
            .select("*")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        return result.data
    except Exception as e:
        logger.error("[WalletDB] get_user_wallet failed: %s", e)
        return None


async def get_mentor_wallet(mentor_id: str, token: str = None) -> Optional[dict]:
    """Fetch a mentor's wallet by mentor_id."""
    try:
        client = get_authed_client(token) if token else get_service_client()
        result = (
            client
            .table("mentor_wallets")
            .select("*")
            .eq("mentor_id", mentor_id)
            .maybe_single()
            .execute()
        )
        return result.data
    except Exception as e:
        logger.error("[WalletDB] get_mentor_wallet failed: %s", e)
        return None


async def get_wallet_transactions(user_id: str, limit: int = 20, token: str = None) -> List[dict]:
    """Fetch wallet transactions for a user."""
    try:
        client = get_authed_client(token) if token else get_service_client()
        result = (
            client
            .table("wallet_transactions")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data if result.data else []
    except Exception as e:
        logger.error("[WalletDB] get_wallet_transactions failed: %s", e)
        return []


async def record_wallet_transaction(
    user_id: str,
    txn_type: str,
    amount_paise: int,
    description: str = None,
    reference_id: str = None,
    meta: dict = None,
) -> Optional[dict]:
    """Insert an immutable wallet transaction log."""
    try:
        client = get_service_client()
        result = (
            client
            .table("wallet_transactions")
            .insert({
                "user_id": user_id,
                "txn_type": txn_type,
                "amount_paise": amount_paise,
                "description": description,
                "reference_id": reference_id,
                "meta": meta or {}
            })
            .execute()
        )
        return result.data[0] if result.data else None
    except Exception as e:
        logger.error("[WalletDB] record_wallet_transaction failed: %s", e)
        return None
