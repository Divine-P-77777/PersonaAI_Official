"""
AskMentor — Payments API Router
================================

Endpoints:
  POST /api/payments/create-order      → Create Cashfree order, return session_id for JS SDK
  POST /api/payments/webhook/cashfree  → Cashfree calls this; verifies sig; grants access
  GET  /api/payments/status/{order_id} → Frontend polls this to confirm unlock after redirect
  GET  /api/payments/access/{bot_id}   → Frontend checks if user can chat (credits + expiry)
  GET  /api/payments/tiers             → Returns the pricing tier config for UI rendering

Security:
  - /webhook endpoint NEVER requires auth; Cashfree calls it server-to-server.
  - Signature is verified cryptographically before ANY state change.
  - UserBotAccess is upgraded ONLY inside the verified webhook handler.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Request, status

from backend.api.schemas.payment import (
    CreateOrderRequest,
    CreateOrderResponse,
    PaymentStatusResponse,
    PricingTierInfo,
    UserBotAccessResponse,
)
from backend.core.config import get_settings
from backend.core.security import get_current_user
from backend.database.payment_queries import (
    consume_credits,
    create_free_trial_access,
    create_payment_transaction,
    get_monthly_exploration,
    get_transaction_by_order_id,
    get_user_bot_access,
    update_transaction_status,
    upgrade_to_unlocked_access,
    upsert_monthly_exploration,
)
from backend.database.queries import get_bot_by_id, get_user_by_id
from backend.payments.cashfree import (
    create_cashfree_order,
    fetch_order_status,
    verify_webhook_signature,
)
from backend.payments.pricing_config import (
    CREDIT_COSTS,
    FREE_EXPLORATION,
    PRICING_TIERS,
    DEFAULT_CREDIT_COST,
)

logger = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter()



# Helper: Resolve credit cost for an action type

def resolve_credit_cost(action_type: str) -> int:
    """Return the credit cost for a given action type (from centralized CREDIT_COSTS)."""
    return CREDIT_COSTS.get(action_type, DEFAULT_CREDIT_COST)


# ---------------------------------------------------------------------------
# Helper: Build UserBotAccessResponse
# ---------------------------------------------------------------------------

async def _build_access_response(
    bot: dict,
    user_id: str,
    token: str = None,
) -> UserBotAccessResponse:
    """
    Core logic that determines whether a user can access a bot.
    Used by the /access/{bot_id} endpoint AND by the chat router's guard.

    Returns a fully populated UserBotAccessResponse.
    """
    bot_id = bot["id"]
    now = datetime.now(tz=timezone.utc)

    # 1. Owner always has full access
    if bot.get("owner_id") == user_id:
        return UserBotAccessResponse(
            bot_id=bot_id,
            is_owner=True,
            is_free_bot=bot.get("is_free", True),
            has_access=True,
            status="unlocked",
        )

    # 2. Free bot — always accessible
    if bot.get("is_free", True):
        return UserBotAccessResponse(
            bot_id=bot_id,
            is_free_bot=True,
            has_access=True,
            status="unlocked",
        )

    # 3. Check for existing access row
    access = await get_user_bot_access(user_id, bot_id, token=token)

    if access:
        # Check expiry
        expires_at = access.get("access_expires_at")
        if expires_at:
            # Handle both string and datetime
            if isinstance(expires_at, str):
                from dateutil import parser as dateparser
                expires_at_dt = dateparser.parse(expires_at)
            else:
                expires_at_dt = expires_at

            if expires_at_dt < now:
                # Mark as expired (lazy update)
                return UserBotAccessResponse(
                    bot_id=bot_id,
                    has_access=False,
                    status="expired",
                    unlock_price=bot.get("unlock_price"),
                    tier_display_name=_tier_display_name(bot),
                    credits_per_pack=bot.get("credits_per_pack"),
                    expiry_days=_tier_expiry_days(bot),
                )

        credits_remaining = access["credits_allowed"] - access["credits_used"]
        has_credits = credits_remaining > 0

        return UserBotAccessResponse(
            bot_id=bot_id,
            has_access=has_credits,
            status=access["status"],
            credits_allowed=access["credits_allowed"],
            credits_used=access["credits_used"],
            credits_remaining=credits_remaining,
            access_expires_at=access.get("access_expires_at"),
            unlock_price=bot.get("unlock_price") if not has_credits else None,
            tier_display_name=_tier_display_name(bot) if not has_credits else None,
            credits_per_pack=bot.get("credits_per_pack") if not has_credits else None,
            expiry_days=_tier_expiry_days(bot) if not has_credits else None,
        )

    # 4. No access row — check if user can start a free trial
    current_month = _current_month()
    exploration = await get_monthly_exploration(user_id, token=token)
    explored_bots: list = (exploration or {}).get("mentors_explored", [])
    can_explore = len(explored_bots) < FREE_EXPLORATION.max_mentors_per_month
    trials_remaining = FREE_EXPLORATION.max_mentors_per_month - len(explored_bots)

    return UserBotAccessResponse(
        bot_id=bot_id,
        has_access=False,  # No existing access; let frontend decide to start trial or pay
        status=None,
        free_trials_remaining_this_month=trials_remaining if can_explore else 0,
        unlock_price=bot.get("unlock_price"),
        tier_display_name=_tier_display_name(bot),
        credits_per_pack=bot.get("credits_per_pack"),
        expiry_days=_tier_expiry_days(bot),
    )


def _tier_display_name(bot: dict) -> str | None:
    tier_id = bot.get("pricing_tier")
    if tier_id and tier_id in PRICING_TIERS:
        return PRICING_TIERS[tier_id].display_name
    return None


def _tier_expiry_days(bot: dict) -> int | None:
    tier_id = bot.get("pricing_tier")
    if tier_id and tier_id in PRICING_TIERS:
        return PRICING_TIERS[tier_id].expiry_days
    return None


def _current_month() -> str:
    return datetime.now(tz=timezone.utc).strftime("%Y-%m")


# ---------------------------------------------------------------------------
# GET /api/payments/tiers — Pricing tier configuration for UI
# ---------------------------------------------------------------------------

@router.get("/tiers", response_model=List[PricingTierInfo])
async def get_pricing_tiers():
    """
    Return all platform-controlled pricing tiers.
    Used by the mentor's PricingConfig step and student explore page.
    Sourced from centralized pricing_config.py — no DB read needed.
    """
    return [
        PricingTierInfo.from_tier_id(tier_id)
        for tier_id in PRICING_TIERS
    ]


# ---------------------------------------------------------------------------
# GET /api/payments/access/{bot_id} — Check user's access status
# ---------------------------------------------------------------------------

@router.get("/access/{bot_id}", response_model=UserBotAccessResponse)
async def check_bot_access(
    bot_id: str,
    user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Returns the user's current access status for a bot.
    Frontend calls this before/after payment to know whether to show
    the chat UI, paywall, or trial prompt.
    """
    token = user.get("_token")
    bot = await get_bot_by_id(bot_id, token=token)
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")

    return await _build_access_response(bot, user["id"], token=token)


# ---------------------------------------------------------------------------
# POST /api/payments/create-order — Initiate Cashfree payment
# ---------------------------------------------------------------------------

@router.post("/create-order", response_model=CreateOrderResponse)
async def create_order(
    body: CreateOrderRequest,
    user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Creates a Cashfree payment order for unlocking a mentor bot.

    Flow:
      1. Validate bot is paid and user doesn't already have active access.
      2. Create a pending PaymentTransaction in our DB.
      3. Call Cashfree API to create the order.
      4. Return payment_session_id for Cashfree JS SDK.
    """
    token = user.get("_token")
    user_id = user["id"]

    # --- Validate bot ---
    bot = await get_bot_by_id(body.bot_id, token=token)
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    if bot.get("is_free", True):
        raise HTTPException(status_code=400, detail="This bot is free — no payment needed.")
    if bot.get("owner_id") == user_id:
        raise HTTPException(status_code=400, detail="You own this bot.")

    # --- Check for already active access ---
    access = await get_user_bot_access(user_id, body.bot_id, token=token)
    if access and access.get("status") == "unlocked":
        expires_at = access.get("access_expires_at")
        if expires_at:
            from dateutil import parser as dateparser
            dt = dateparser.parse(expires_at) if isinstance(expires_at, str) else expires_at
            if dt > datetime.now(tz=timezone.utc):
                credits_remaining = access["credits_allowed"] - access["credits_used"]
                if credits_remaining > 0:
                    raise HTTPException(
                        status_code=400,
                        detail="You already have active access with remaining credits.",
                    )

    # --- Gather user info for Cashfree ---
    user_profile = await get_user_by_id(user_id, token=token)
    customer_name  = (user_profile or {}).get("display_name") or "AskMentor User"
    customer_email = user.get("email") or (user_profile or {}).get("email") or "user@askmentor.online"
    customer_phone = body.customer_phone or "+910000000000"

    # --- Build order ---
    amount = bot.get("unlock_price", 0)
    if not amount:
        raise HTTPException(status_code=400, detail="Bot has no unlock price configured.")

    internal_order_id = f"AM-{uuid.uuid4().hex[:20].upper()}"
    return_url = (
        f"{settings.FRONTEND_BASE_URL}/explore/{body.bot_id}"
        f"?order_id={internal_order_id}&status=PENDING"
    )

    tier_id = bot.get("pricing_tier", "starter")
    tier = PRICING_TIERS.get(tier_id)
    tier_display_name = tier.display_name if tier else "Access"

    # --- Call Cashfree ---
    try:
        cf_response = await create_cashfree_order(
            order_id=internal_order_id,
            amount_inr=amount,
            customer_id=user_id,
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=customer_phone,
            return_url=return_url,
            order_note=f"AskMentor — Unlock {bot['name']} ({tier_display_name})",
        )
    except Exception as e:
        logger.error("[Payments] Cashfree order creation failed: %s", e)
        raise HTTPException(status_code=502, detail="Payment gateway error. Please try again.")

    cf_order_id = cf_response.get("cf_order_id") or cf_response.get("order_id")
    payment_session_id = cf_response.get("payment_session_id", "")

    # --- Persist pending transaction ---
    await create_payment_transaction(
        order_id=internal_order_id,
        user_id=user_id,
        bot_id=body.bot_id,
        amount=amount,
        cf_order_id=cf_order_id,
    )

    logger.info(
        "[Payments] Order created | user=%s | bot=%s | order=%s | amount=₹%d",
        user_id, body.bot_id, internal_order_id, amount,
    )

    return CreateOrderResponse(
        order_id=internal_order_id,
        payment_session_id=payment_session_id,
        amount=amount,
        bot_name=bot["name"],
        tier_display_name=tier_display_name,
    )


# ---------------------------------------------------------------------------
# GET /api/payments/status/{order_id} — Polling endpoint (post-redirect)
# ---------------------------------------------------------------------------

@router.get("/status/{order_id}", response_model=PaymentStatusResponse)
async def get_payment_status(
    order_id: str,
    user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Frontend polls this after Cashfree redirect to check if the webhook
    has already processed the payment and granted access.

    Do NOT trust the `status` in the Cashfree return_url query params.
    Always check our DB (which is only updated after webhook verification).
    """
    txn = await get_transaction_by_order_id(order_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Order not found.")

    # Ensure the order belongs to this user
    if txn.get("user_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied.")

    status_map = {
        "pending": "Waiting for payment confirmation...",
        "success": "Payment successful! Your mentor is now unlocked.",
        "failed":  "Payment failed. Please try again.",
    }

    return PaymentStatusResponse(
        order_id=order_id,
        status=txn["status"],
        bot_id=txn.get("bot_id"),
        verified_at=txn.get("verified_at"),
        message=status_map.get(txn["status"], ""),
    )


# ---------------------------------------------------------------------------
# POST /api/payments/webhook/cashfree — Cashfree webhook (server-to-server)
# ---------------------------------------------------------------------------

@router.post("/webhook/cashfree", status_code=status.HTTP_200_OK)
async def cashfree_webhook(request: Request):
    """
    Cashfree calls this endpoint directly after a payment event.

    Security:
      ⚠️  This endpoint has NO auth dependency (Cashfree does not send JWT).
      ⚠️  We ONLY trust the HMAC-SHA256 signature — never the raw payload alone.
      ⚠️  UserBotAccess is upgraded ONLY when signature verification passes.

    Steps:
      1. Read raw body BEFORE any JSON parsing (signature covers raw bytes).
      2. Verify HMAC-SHA256 signature.
      3. Parse payload.
      4. Update PaymentTransaction status.
      5. If payment_status == PAID, call upgrade_to_unlocked_access().
    """
    raw_body = await request.body()
    timestamp  = request.headers.get("x-webhook-timestamp", "")
    signature  = request.headers.get("x-webhook-signature", "")

    # --- 1. Verify signature ---
    if not verify_webhook_signature(raw_body, timestamp, signature):
        logger.warning("[Webhook] Rejected request with invalid signature.")
        raise HTTPException(status_code=401, detail="Invalid webhook signature.")

    # --- 2. Parse payload ---
    import json
    try:
        payload = json.loads(raw_body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload.")

    # Cashfree webhook structure (v2023-08-01):
    # { "data": { "order": {...}, "payment": {...} }, "type": "PAYMENT_SUCCESS_WEBHOOK", ... }
    event_type = payload.get("type", "")
    data       = payload.get("data", {})
    order_data = data.get("order", {})
    pay_data   = data.get("payment", {})

    order_id       = order_data.get("order_id", "")        # Our internal order_id
    payment_status = pay_data.get("payment_status", "")    # "SUCCESS" | "FAILED" | ...
    cf_payment_id  = pay_data.get("cf_payment_id", "")

    if not order_id:
        logger.warning("[Webhook] Received webhook with no order_id.")
        return {"status": "ignored"}

    logger.info(
        "[Webhook] Event=%s | order=%s | payment_status=%s",
        event_type, order_id, payment_status,
    )

    # --- 3. Fetch our transaction ---
    txn = await get_transaction_by_order_id(order_id)
    if not txn:
        logger.warning("[Webhook] Unknown order_id: %s", order_id)
        return {"status": "ignored"}

    # --- 4. Update transaction ---
    our_status = "success" if payment_status == "SUCCESS" else "failed"
    verified_at = datetime.now(tz=timezone.utc)

    await update_transaction_status(
        order_id=order_id,
        status=our_status,
        cf_payment_id=str(cf_payment_id),
        webhook_payload=payload,
        verified_at=verified_at,
    )

    # --- 5. Grant access if payment succeeded ---
    if our_status == "success":
        user_id = txn.get("user_id")
        bot_id  = txn.get("bot_id")
        amount  = txn.get("amount", 0)

        if user_id:
            if order_id.startswith("TOPUP-"):
                # Handle Wallet Top-up
                from backend.database.wallet_queries import record_wallet_transaction
                amount_paise = int(amount * 100)
                await record_wallet_transaction(
                    user_id=str(user_id),
                    txn_type="topup",
                    amount_paise=amount_paise,
                    description="Wallet Top-up via Cashfree",
                    reference_id=order_id,
                )
                logger.info("[Webhook] ✅ Wallet top-up | user=%s | amount=₹%s", user_id, amount)
            elif bot_id:
                # Handle Bot Unlock
                bot = await get_bot_by_id(str(bot_id))
                if bot:
                    credits_per_pack = bot.get("credits_per_pack") or 30
                    tier_id = bot.get("pricing_tier", "starter")
                    tier = PRICING_TIERS.get(tier_id)
                    expiry_days = tier.expiry_days if tier else 7
                    expires_at = datetime.now(tz=timezone.utc) + timedelta(days=expiry_days)

                    await upgrade_to_unlocked_access(
                        user_id=str(user_id),
                        bot_id=str(bot_id),
                        credits_allowed=credits_per_pack,
                        expires_at=expires_at,
                    )

                    # Also register this bot in the exploration list
                    await upsert_monthly_exploration(str(user_id), str(bot_id))

                    logger.info(
                        "[Webhook] ✅ Access granted | user=%s | bot=%s | credits=%d | expires=%s",
                        user_id, bot_id, credits_per_pack, expires_at.date(),
                    )

    return {"status": "processed"}


# ---------------------------------------------------------------------------
# GET /api/payments/wallet — Fetch User & Mentor Wallets
# ---------------------------------------------------------------------------

@router.get("/wallet")
async def get_wallet(user: Dict[str, Any] = Depends(get_current_user)):
    """Fetch the current user's wallet balances."""
    from backend.database.wallet_queries import get_user_wallet, get_mentor_wallet
    token = user.get("_token")
    user_id = user["id"]
    
    # Check for user wallet
    u_wallet = await get_user_wallet(user_id, token=token)
    
    # Check for mentor wallet (if they are an alumni)
    user_profile = await get_user_by_id(user_id, token=token)
    role = user_profile.get("role") if user_profile else "user"
    m_wallet = None
    if role == "alumni":
        m_wallet = await get_mentor_wallet(user_id, token=token)
        
    return {
        "user_wallet": u_wallet,
        "mentor_wallet": m_wallet
    }


# ---------------------------------------------------------------------------
# GET /api/payments/wallet/transactions — Fetch Wallet Ledger
# ---------------------------------------------------------------------------

@router.get("/wallet/transactions")
async def get_wallet_ledger(
    limit: int = 20,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Fetch wallet transaction history."""
    from backend.database.wallet_queries import get_wallet_transactions
    token = user.get("_token")
    txns = await get_wallet_transactions(user["id"], limit=limit, token=token)
    return {"transactions": txns}


# ---------------------------------------------------------------------------
# POST /api/payments/wallet/topup — Add money to wallet
# ---------------------------------------------------------------------------

from pydantic import BaseModel

class TopupRequest(BaseModel):
    amount_inr: int

@router.post("/wallet/topup")
async def wallet_topup(
    body: TopupRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a Cashfree order to add money to user's wallet."""
    token = user.get("_token")
    user_id = user["id"]
    
    from backend.payments.pricing_config import USER_WALLET_MIN_TOPUP_INR, USER_WALLET_MAX_TOPUP_INR
    if body.amount_inr < USER_WALLET_MIN_TOPUP_INR or body.amount_inr > USER_WALLET_MAX_TOPUP_INR:
        raise HTTPException(status_code=400, detail=f"Topup must be between ₹{USER_WALLET_MIN_TOPUP_INR} and ₹{USER_WALLET_MAX_TOPUP_INR}")
        
    user_profile = await get_user_by_id(user_id, token=token)
    customer_name  = (user_profile or {}).get("display_name") or "AskMentor User"
    customer_email = user.get("email") or (user_profile or {}).get("email") or "user@askmentor.online"
    
    internal_order_id = f"TOPUP-{uuid.uuid4().hex[:16].upper()}"
    return_url = f"{settings.FRONTEND_BASE_URL}/billing?order_id={internal_order_id}"
    
    try:
        cf_response = await create_cashfree_order(
            order_id=internal_order_id,
            amount_inr=body.amount_inr,
            customer_id=user_id,
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone="+910000000000",
            return_url=return_url,
            order_note="AskMentor Wallet Topup",
        )
    except Exception as e:
        logger.error("[Payments] Cashfree wallet topup creation failed: %s", e)
        raise HTTPException(status_code=502, detail="Payment gateway error.")
        
    cf_order_id = cf_response.get("cf_order_id") or cf_response.get("order_id")
    payment_session_id = cf_response.get("payment_session_id", "")
    
    # Create pending topup transaction
    await create_payment_transaction(
        order_id=internal_order_id,
        user_id=user_id,
        bot_id=None,
        amount=body.amount_inr,
        cf_order_id=cf_order_id,
    )
    
    return {
        "order_id": internal_order_id,
        "payment_session_id": payment_session_id
    }


# ---------------------------------------------------------------------------
# POST /api/payments/wallet/withdraw — Request mentor withdrawal
# ---------------------------------------------------------------------------

class UpiWithdrawalRequest(BaseModel):
    upi_id: str

@router.post("/wallet/withdraw")
async def wallet_withdraw(
    body: UpiWithdrawalRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Request withdrawal of mentor earnings."""
    # (Implementation stub for future logic)
    logger.info("[Payments] Withdrawal requested by user %s to UPI %s", user.get("id"), body.upi_id)
    return {"status": "processing", "message": "Withdrawal request received. It will be processed within 3-5 business days."}
