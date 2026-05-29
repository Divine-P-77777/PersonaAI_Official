"""
AskMentor — Payment API Schemas
================================
Pydantic request/response models for the /api/payments/* endpoints.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from backend.payments.pricing_config import PRICING_TIERS


# ---------------------------------------------------------------------------
# Request: Create Order
# ---------------------------------------------------------------------------

class CreateOrderRequest(BaseModel):
    """Body for POST /api/payments/create-order"""

    bot_id: str = Field(..., description="UUID of the bot to unlock")
    customer_phone: str = Field(
        "+910000000000",
        description="Customer phone number (required by Cashfree, use placeholder if unavailable)",
    )


# ---------------------------------------------------------------------------
# Response: Create Order
# ---------------------------------------------------------------------------

class CreateOrderResponse(BaseModel):
    """Returned after a successful order creation call to Cashfree."""

    order_id: str                     # Our internal order_id
    payment_session_id: str           # Cashfree session ID — used by JS SDK to open payment UI
    amount: int                       # ₹
    currency: str = "INR"
    bot_name: str
    tier_display_name: str


# ---------------------------------------------------------------------------
# Response: Payment Status (polling)
# ---------------------------------------------------------------------------

class PaymentStatusResponse(BaseModel):
    """
    Used by frontend to poll payment status after redirect from Cashfree.
    The frontend MUST poll this endpoint rather than trust Cashfree's return_url params.
    """

    order_id: str
    status: str          # 'pending' | 'success' | 'failed'
    bot_id: Optional[str] = None
    verified_at: Optional[datetime] = None
    message: str = ""


# ---------------------------------------------------------------------------
# Response: User Bot Access Status
# ---------------------------------------------------------------------------

class UserBotAccessResponse(BaseModel):
    """Returned by GET /api/payments/access/{bot_id} — tells the frontend if user can chat."""

    bot_id: str
    is_owner: bool = False
    is_free_bot: bool = False
    has_access: bool
    status: Optional[str] = None      # 'free_trial' | 'unlocked' | 'expired'
    credits_allowed: Optional[int] = None
    credits_used: Optional[int] = None
    credits_remaining: Optional[int] = None
    access_expires_at: Optional[datetime] = None
    free_trials_remaining_this_month: Optional[int] = None

    # Paywall info — only populated when has_access=False
    unlock_price: Optional[int] = None
    tier_display_name: Optional[str] = None
    credits_per_pack: Optional[int] = None
    expiry_days: Optional[int] = None


# ---------------------------------------------------------------------------
# Internal: Pricing Tier Info (used in explore-page bot cards)
# ---------------------------------------------------------------------------

class PricingTierInfo(BaseModel):
    """Serialized subset of a PricingTier for API responses."""

    tier_id: str
    display_name: str
    unlock_price: int
    credits: int
    expiry_days: int
    voice_eligible: bool
    min_price: int
    max_price: int

    @classmethod
    def from_tier_id(cls, tier_id: str) -> "PricingTierInfo":
        tier = PRICING_TIERS[tier_id]
        return cls(
            tier_id=tier.tier_id,
            display_name=tier.display_name,
            unlock_price=tier.unlock_price,
            credits=tier.credits,
            expiry_days=tier.expiry_days,
            voice_eligible=tier.voice_eligible,
            min_price=tier.min_price,
            max_price=tier.max_price,
        )
