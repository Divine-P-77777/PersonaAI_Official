"""
AskMentor — Cashfree Payment Gateway Client
============================================

Handles:
  - Creating payment orders via Cashfree Orders API
  - Verifying webhook signatures (HMAC-SHA256)

All credentials are sourced from Settings (core/config.py).
All sensitive operations (unlock grant) happen ONLY in the webhook handler,
never from frontend callbacks.
"""

from __future__ import annotations

import hashlib
import hmac
import logging
from typing import Any

import httpx

from backend.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Cashfree API base URLs
_CF_PROD_BASE = "https://api.cashfree.com/pg"
_CF_TEST_BASE = "https://sandbox.cashfree.com/pg"

# API version header required by Cashfree
_CF_API_VERSION = "2023-08-01"


def _get_base_url() -> str:
    """Return the correct Cashfree base URL depending on environment."""
    if settings.CASHFREE_ENV == "production":
        return _CF_PROD_BASE
    return _CF_TEST_BASE


def _get_headers() -> dict[str, str]:
    """Build Cashfree auth headers."""
    return {
        "x-api-version": _CF_API_VERSION,
        "x-client-id":   settings.CASHFREE_APP_ID,
        "x-client-secret": settings.CASHFREE_SECRET_KEY,
        "Content-Type":  "application/json",
        "Accept":        "application/json",
    }


# ---------------------------------------------------------------------------
# Order Creation
# ---------------------------------------------------------------------------

async def create_cashfree_order(
    *,
    order_id: str,
    amount_inr: int,
    customer_id: str,
    customer_name: str,
    customer_email: str,
    customer_phone: str,
    return_url: str,
    order_note: str = "AskMentor Unlock",
) -> dict[str, Any]:
    """
    Create a payment order on Cashfree.

    Args:
        order_id      : Our internal order ID (UUID-based string)
        amount_inr    : Amount in Indian Rupees (integer, e.g. 99)
        customer_id   : Supabase user UUID string
        customer_name : Display name for Cashfree receipt
        customer_email: User email
        customer_phone: User phone (required by Cashfree; use a placeholder if unavailable)
        return_url    : Frontend URL Cashfree redirects to after payment
        order_note    : Short description shown to customer on payment page

    Returns:
        Cashfree response dict containing `payment_session_id` and `order_id`

    Raises:
        httpx.HTTPStatusError on non-2xx Cashfree response
    """
    payload = {
        "order_id":     order_id,
        "order_amount": float(amount_inr),
        "order_currency": "INR",
        "order_note":   order_note,
        "customer_details": {
            "customer_id":    customer_id,
            "customer_name":  customer_name,
            "customer_email": customer_email,
            "customer_phone": customer_phone,
        },
        "order_meta": {
            "return_url":  return_url,
        },
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            f"{_get_base_url()}/orders",
            headers=_get_headers(),
            json=payload,
        )

    if response.status_code not in (200, 201):
        logger.error(
            "[Cashfree] Order creation failed | order_id=%s | status=%d | body=%s",
            order_id,
            response.status_code,
            response.text[:500],
        )
        response.raise_for_status()

    data = response.json()
    logger.info("[Cashfree] Order created: order_id=%s | cf_order_id=%s", order_id, data.get("cf_order_id"))
    return data


# ---------------------------------------------------------------------------
# Webhook Signature Verification
# ---------------------------------------------------------------------------

def verify_webhook_signature(raw_body: bytes, timestamp: str, received_signature: str) -> bool:
    """
    Verify the Cashfree webhook signature using HMAC-SHA256.

    Cashfree signs webhooks as:
        signature = base64( HMAC-SHA256( timestamp + raw_body, secret_key ) )

    Args:
        raw_body            : The raw bytes of the incoming request body (do NOT parse before calling)
        timestamp           : Value of the `x-webhook-timestamp` header
        received_signature  : Value of the `x-webhook-signature` header

    Returns:
        True if signature is valid, False otherwise.

      NEVER grant access without this returning True.
    """
    import base64

    # Use the dedicated webhook secret (currently same as CASHFREE_SECRET_KEY per Cashfree spec)
    secret = (settings.CASHFREE_WEBHOOK_SECRET or settings.CASHFREE_SECRET_KEY).encode("utf-8")
    message = (timestamp + raw_body.decode("utf-8")).encode("utf-8")
    computed = base64.b64encode(
        hmac.new(secret, message, hashlib.sha256).digest()
    ).decode("utf-8")

    is_valid = hmac.compare_digest(computed, received_signature)
    if not is_valid:
        logger.warning("[Cashfree] ⚠️  Webhook signature mismatch — possible spoofing attempt.")
    return is_valid


# ---------------------------------------------------------------------------
# Order Status Query (for polling fallback)
# ---------------------------------------------------------------------------

async def fetch_order_status(order_id: str) -> dict[str, Any]:
    """
    Fetch the current status of a Cashfree order.
    Used as a fallback if webhook delivery is delayed.

    Returns Cashfree order object or raises on HTTP error.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            f"{_get_base_url()}/orders/{order_id}",
            headers=_get_headers(),
        )
    response.raise_for_status()
    return response.json()
