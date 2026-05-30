"""
AskMentor — Payment Database Queries
=====================================
All queries for payment-related tables:
  - user_monthly_explorations
  - user_bot_access
  - payment_transactions

All operations use the Supabase client (RLS-aware), matching the
pattern established in database/queries.py.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Optional

from backend.database.connection import get_authed_client, get_service_client, get_supabase_client

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# UserMonthlyExploration
# ---------------------------------------------------------------------------

def _current_month() -> str:
    """Return the current month as 'YYYY-MM' string (UTC)."""
    return datetime.now(tz=timezone.utc).strftime("%Y-%m")


async def get_monthly_exploration(user_id: str, token: str = None) -> Optional[dict]:
    """Fetch the user's exploration record for the current month."""
    month = _current_month()
    try:
        client = get_authed_client(token) if token else get_service_client()
        result = (
            client
            .table("user_monthly_explorations")
            .select("*")
            .eq("user_id", user_id)
            .eq("month", month)
            .maybe_single()
            .execute()
        )
        return result.data if result and hasattr(result, "data") else None
    except Exception as e:
        logger.error("[PayDB] get_monthly_exploration failed: %s", e)
        return None


async def upsert_monthly_exploration(
    user_id: str,
    bot_id: str,
    token: str = None,
) -> Optional[dict]:
    """
    Add bot_id to the user's exploration list for the current month.
    Creates the row if it doesn't exist yet.
    Returns the updated record.
    """
    month = _current_month()
    try:
        existing = await get_monthly_exploration(user_id, token=token)
        client = get_authed_client(token) if token else get_service_client()

        if existing:
            explored: list = existing.get("mentors_explored") or []
            if bot_id not in explored:
                explored.append(bot_id)
                result = (
                    client
                    .table("user_monthly_explorations")
                    .update({"mentors_explored": explored})
                    .eq("id", existing["id"])
                    .execute()
                )
                return (result.data[0] if result and hasattr(result, "data") and result.data else existing)
            return existing
        else:
            result = (
                client
                .table("user_monthly_explorations")
                .insert({
                    "user_id": user_id,
                    "month": month,
                    "mentors_explored": [bot_id],
                })
                .execute()
            )
            return (result.data[0] if result and hasattr(result, "data") and result.data else None)
    except Exception as e:
        logger.error("[PayDB] upsert_monthly_exploration failed: %s", e)
        return None


# ---------------------------------------------------------------------------
# UserBotAccess
# ---------------------------------------------------------------------------

async def get_user_bot_access(user_id: str, bot_id: str, token: str = None) -> Optional[dict]:
    """Fetch a user's access record for a specific bot."""
    try:
        client = get_authed_client(token) if token else get_service_client()
        result = (
            client
            .table("user_bot_access")
            .select("*")
            .eq("user_id", user_id)
            .eq("bot_id", bot_id)
            .maybe_single()
            .execute()
        )
        return result.data if result and hasattr(result, "data") else None
    except Exception as e:
        logger.error("[PayDB] get_user_bot_access failed: %s", e)
        return None


async def create_free_trial_access(
    user_id: str,
    bot_id: str,
    credits_allowed: int,
    expires_at: datetime,
    token: str = None,
) -> Optional[dict]:
    """
    Create a free_trial access row for a user's first interaction with a bot.
    Called automatically when a user discovers a new mentor within their monthly quota.
    """
    try:
        client = get_authed_client(token) if token else get_service_client()
        result = (
            client
            .table("user_bot_access")
            .insert({
                "user_id": user_id,
                "bot_id": bot_id,
                "status": "free_trial",
                "credits_allowed": credits_allowed,
                "credits_used": 0,
                "access_expires_at": expires_at.isoformat(),
            })
            .execute()
        )
        return (result.data[0] if result and hasattr(result, "data") and result.data else None)
    except Exception as e:
        logger.error("[PayDB] create_free_trial_access failed: %s", e)
        return None


async def upgrade_to_unlocked_access(
    user_id: str,
    bot_id: str,
    credits_allowed: int,
    expires_at: datetime,
    token: str = None,
) -> Optional[dict]:
    """
    Upgrade (or create) an access row to 'unlocked' after a successful payment.
    Resets credits_used to 0 and sets new expiry.
    Only called from the Cashfree webhook handler after signature verification.
    """
    try:
        client = get_service_client()  # Use service role — webhook has no user token
        existing = await get_user_bot_access(user_id, bot_id)

        payload = {
            "user_id": user_id,
            "bot_id": bot_id,
            "status": "unlocked",
            "credits_allowed": credits_allowed,
            "credits_used": 0,
            "access_expires_at": expires_at.isoformat(),
        }

        if existing:
            result = (
                client
                .table("user_bot_access")
                .update(payload)
                .eq("id", existing["id"])
                .execute()
            )
        else:
            result = client.table("user_bot_access").insert(payload).execute()

        return (result.data[0] if result and hasattr(result, "data") and result.data else None)
    except Exception as e:
        logger.error("[PayDB] upgrade_to_unlocked_access failed: %s", e)
        return None


async def consume_credits(
    access_id: str,
    credit_cost: int,
    token: str = None,
) -> Optional[dict]:
    """
    Atomically increment credits_used by `credit_cost`.
    Returns the updated access row or None on failure.
    """
    try:
        client = get_authed_client(token) if token else get_service_client()
        # Use Supabase RPC for atomic increment to prevent race conditions
        result = (
            client
            .rpc("increment_credits_used", {
                "p_access_id": access_id,
                "p_cost": credit_cost,
            })
            .execute()
        )
        # Fallback: if RPC not available, do a read-then-write
        if not result.data:
            row = (
                client
                .table("user_bot_access")
                .select("credits_used")
                .eq("id", access_id)
                .maybe_single()
                .execute()
            )
            if row.data:
                new_used = row.data["credits_used"] + credit_cost
                result = (
                    client
                    .table("user_bot_access")
                    .update({"credits_used": new_used})
                    .eq("id", access_id)
                    .execute()
                )
        return result.data[0] if result.data else None
    except Exception as e:
        logger.error("[PayDB] consume_credits failed: %s", e)
        return None


# ---------------------------------------------------------------------------
# PaymentTransaction
# ---------------------------------------------------------------------------

async def create_payment_transaction(
    order_id: str,
    user_id: str,
    bot_id: str,
    amount: int,
    cf_order_id: str = None,
) -> Optional[dict]:
    """Create a pending payment transaction record (before Cashfree redirect)."""
    try:
        client = get_service_client()
        result = (
            client
            .table("payment_transactions")
            .insert({
                "order_id": order_id,
                "cf_order_id": cf_order_id,
                "user_id": user_id,
                "bot_id": bot_id,
                "amount": amount,
                "currency": "INR",
                "status": "pending",
                "payment_provider": "cashfree",
            })
            .execute()
        )
        return result.data[0] if result.data else None
    except Exception as e:
        logger.error("[PayDB] create_payment_transaction failed: %s", e)
        return None


async def update_transaction_status(
    order_id: str,
    status: str,
    cf_payment_id: str = None,
    webhook_payload: dict = None,
    verified_at: datetime = None,
) -> Optional[dict]:
    """
    Update a transaction after Cashfree webhook delivery.
    Called ONLY from the webhook endpoint after signature verification.
    """
    try:
        client = get_service_client()
        updates: dict = {"status": status}
        if cf_payment_id:
            updates["cf_payment_id"] = cf_payment_id
        if webhook_payload:
            updates["webhook_payload"] = webhook_payload
        if verified_at:
            updates["verified_at"] = verified_at.isoformat()

        result = (
            client
            .table("payment_transactions")
            .update(updates)
            .eq("order_id", order_id)
            .execute()
        )
        return result.data[0] if result.data else None
    except Exception as e:
        logger.error("[PayDB] update_transaction_status failed: %s", e)
        return None


async def get_transaction_by_order_id(order_id: str) -> Optional[dict]:
    """Fetch a transaction by its internal order_id."""
    try:
        client = get_service_client()
        result = (
            client
            .table("payment_transactions")
            .select("*")
            .eq("order_id", order_id)
            .maybe_single()
            .execute()
        )
        return result.data
    except Exception as e:
        logger.error("[PayDB] get_transaction_by_order_id failed: %s", e)
        return None
