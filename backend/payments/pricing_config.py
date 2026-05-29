"""
AskMentor — Centralized Pricing Configuration
==============================================

 THIS IS THE SINGLE SOURCE OF TRUTH FOR ALL PRICING.
   Change prices, credits, limits, and expiry durations HERE only.
   Both backend logic and API response schemas consume this config.

Structure:
  FREE_EXPLORATION   → limits for unauthenticated / free tier users
  PRICING_TIERS      → preset tiers mentors can choose from
  CREDIT_COSTS       → how many credits each action type consumes
  INTERACTION_PRESETS→ the ±20% slider limits per tier
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict


# ---------------------------------------------------------------------------
# Credit Costs — maps action type → credits consumed per action
# ---------------------------------------------------------------------------
# Mentors and platform both rely on this to prevent undercharging heavy ops.
# Voice and deep-reasoning use far more infra than a plain text message.

CREDIT_COSTS: Dict[str, int] = {
    "text_message":     1,   # Standard RAG-powered text reply
    "deep_reasoning":   2,   # Extended chain-of-thought / analysis prompt
    "resume_analysis":  4,   # Structured resume review (long prompt + structured output)
    "voice_interaction": 5,  # Real-time voice session (ElevenLabs/Sarvam TTS + live audio)
    #
    # NOTE: voice_session and live_session are the SAME thing.
    # "Voice Interaction" = a live, real-time voice conversation turn.
    # Aliases kept for backward compatibility:
    "voice_session":    5,   # alias → voice_interaction
    "live_session":     5,   # alias → voice_interaction
}

DEFAULT_CREDIT_COST = CREDIT_COSTS["text_message"]


# ---------------------------------------------------------------------------
# Platform Economics
# ---------------------------------------------------------------------------

# Mentor revenue share — what % of each unlock goes to the mentor
# The rest is platform fee. e.g. 70% → mentor gets ₹69.30 on ₹99 unlock
MENTOR_REVENUE_SHARE: float = 0.70   # 70%
PLATFORM_FEE_SHARE:   float = 0.30   # 30%

# Minimum wallet balance a mentor must accumulate before they can withdraw
MENTOR_WITHDRAWAL_THRESHOLD_INR: int = 500    # ₹500 minimum payout

# Minimum amount a user can top-up their wallet in one transaction
USER_WALLET_MIN_TOPUP_INR: int = 29   # ₹29 minimum deposit
USER_WALLET_MAX_TOPUP_INR: int = 5000 # ₹5000 maximum deposit


# ---------------------------------------------------------------------------
# Free Exploration Rules — enforced per user, per calendar month
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class FreeExplorationConfig:
    """Controls the free-tier discovery experience before a user unlocks a mentor."""

    # Max distinct mentor bots a user can try for FREE per calendar month
    max_mentors_per_month: int = 3

    # Free credits granted on first interaction with a new mentor
    # (each text_message costs 1 credit, so this = 40 free credits)
    free_credits_per_mentor: int = 40

    # Voice interactions always require unlock (even on free trial)
    voice_requires_unlock: bool = False


FREE_EXPLORATION = FreeExplorationConfig()


# ---------------------------------------------------------------------------
# Pricing Tiers — Platform-defined, mentor-selectable presets
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class PricingTier:
    """
    A single platform-controlled pricing tier.

    Attributes:
        tier_id       : Internal identifier (matches DB enum)
        display_name  : Human-readable label shown to mentors and users
        unlock_price  : INR amount charged to unlock access (integer paise or rupee — rupees here)
        credits       : Number of credits granted after successful unlock
        expiry_days   : How many days the unlock remains valid (prevents infinite liability)
        voice_eligible: Whether mentors in this tier can enable voice features
        min_price     : Minimum price a mentor is allowed to set (anti-race-to-bottom)
        max_price     : Maximum price a mentor can set (anti-gouging)
    """
    tier_id:        str
    display_name:   str
    unlock_price:   int          # Default/recommended price in ₹
    credits:        int          # Credits granted on unlock
    expiry_days:    int          # Days until access expires
    voice_eligible: bool
    min_price:      int          # Minimum allowed custom price
    max_price:      int          # Maximum allowed custom price


# The canonical list of tiers. Add/rename tiers here only.
PRICING_TIERS: Dict[str, PricingTier] = {
    "starter": PricingTier(
        tier_id="starter",
        display_name="Starter Access",
        unlock_price=29,
        credits=30,
        expiry_days=7,
        voice_eligible=False,
        min_price=29,
        max_price=49,
    ),
    "standard": PricingTier(
        tier_id="standard",
        display_name="Standard Access",
        unlock_price=49,
        credits=60,
        expiry_days=14,
        voice_eligible=False,
        min_price=49,
        max_price=149,
    ),
    "premium": PricingTier(
        tier_id="premium",
        display_name="Premium Access",
        unlock_price=99,
        credits=120,
        expiry_days=30,
        voice_eligible=True,
        min_price=99,
        max_price=499,
    ),
}


# ---------------------------------------------------------------------------
# Interaction Customization Rules
# ---------------------------------------------------------------------------

# Mentors can customize the credit pack size within ±N% of the tier default.
# E.g., CREDIT_CUSTOMIZATION_TOLERANCE = 0.20 means ±20% is allowed.
CREDIT_CUSTOMIZATION_TOLERANCE: float = 0.20  # 20%


def get_allowed_credit_range(tier_id: str) -> tuple[int, int]:
    """
    Returns (min_credits, max_credits) a mentor can customize for the given tier.
    Enforces the ±20% tolerance around the tier default.
    """
    tier = PRICING_TIERS.get(tier_id)
    if not tier:
        raise ValueError(f"Unknown tier: {tier_id!r}")
    base = tier.credits
    delta = int(base * CREDIT_CUSTOMIZATION_TOLERANCE)
    return (max(1, base - delta), base + delta)


# ---------------------------------------------------------------------------
# Value Score Validation
# ---------------------------------------------------------------------------
# Prevents broken economics: guards against configs like ₹29 / 500 credits.

# Minimum ₹ per credit — reject configs below this floor
MIN_RUPEES_PER_CREDIT: float = 0.30   # e.g. ₹29 / 30 credits ≈ ₹0.97  ✅  |  ₹29 / 500 = ₹0.06 ❌

# Warn if value score exceeds this ceiling (might reduce discoverability)
WARN_RUPEES_PER_CREDIT: float = 10.0  # e.g. ₹499 / 5 credits = ₹99.8  ⚠️


def validate_pricing(tier_id: str, price: int, credits: int) -> tuple[bool, str | None]:
    """
    Validates a mentor's custom pricing configuration.

    Returns:
        (is_valid, error_message)   — error_message is None when valid
    """
    tier = PRICING_TIERS.get(tier_id)
    if not tier:
        return False, f"Invalid tier '{tier_id}'. Choose from: {list(PRICING_TIERS)}"

    # Price within allowed band
    if not (tier.min_price <= price <= tier.max_price):
        return False, (
            f"Price ₹{price} is out of the allowed range "
            f"₹{tier.min_price}–₹{tier.max_price} for the '{tier.display_name}' tier."
        )

    # Credits within ±20% of tier default
    min_credits, max_credits = get_allowed_credit_range(tier_id)
    if not (min_credits <= credits <= max_credits):
        return False, (
            f"Credit pack {credits} exceeds the allowed range "
            f"{min_credits}–{max_credits} for the '{tier.display_name}' tier (±20% tolerance)."
        )

    # Value score — too cheap per credit
    value_score = price / credits
    if value_score < MIN_RUPEES_PER_CREDIT:
        return False, (
            f"Pricing rejected: ₹{price} for {credits} credits "
            f"(₹{value_score:.2f}/credit) is below the platform minimum of ₹{MIN_RUPEES_PER_CREDIT}/credit."
        )

    return True, None


def get_value_score_warning(price: int, credits: int) -> str | None:
    """Returns a warning string if value score is too high (may hurt discoverability), else None."""
    value_score = price / credits
    if value_score > WARN_RUPEES_PER_CREDIT:
        return (
            f"⚠️ This pricing (₹{price} / {credits} credits = ₹{value_score:.1f}/credit) "
            f"may reduce discoverability. Consider increasing credits."
        )
    return None
