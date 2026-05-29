#   API request/response validation.
from pydantic import BaseModel, HttpUrl, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum

from backend.database.models import BotStatus
from backend.payments.pricing_config import PRICING_TIERS, validate_pricing


class BotGender(str, Enum):

    male = "male"
    female = "female"
    transgender = "transgender"


class PersonaConfig(BaseModel):
    """Structured form data for the alumni persona."""
    greeting:     Optional[str]              = None
    tone:         Optional[str]              = "professional"  # friendly / formal / casual
    expertise:    Optional[List[str]]        = []
    experience:   Optional[List[Dict[str, Any]]] = []
    education:    Optional[List[Dict[str, Any]]] = []
    links:        Optional[Dict[str, str]]   = {}
    voice_gender: Optional[BotGender] = BotGender.female


class BotCreate(BaseModel):
    """Schema for creating a new bot."""
    name:         str
    description:  Optional[str]              = None
    persona_config: Optional[PersonaConfig]  = None
    voice_gender: Optional[BotGender]        = BotGender.female

    # Monetization — sourced from pricing_config.py tiers
    is_free:              bool                = True
    pricing_tier:         Optional[str]       = None   # 'starter' | 'standard' | 'premium'
    unlock_price:         Optional[int]       = None   # ₹ (must be within tier band)
    credits_per_pack:     Optional[int]       = None   # credits granted on unlock
    voice_enabled:        bool                = False
    subscription_enabled: bool                = False

    @field_validator("pricing_tier", "unlock_price", "credits_per_pack", mode="before")
    @classmethod
    def validate_pricing_fields(cls, v, info):
        """Cross-field validation is handled in the router after full model is built."""
        return v


class BotUpdate(BaseModel):
    """Schema for updating a bot."""
    name:         Optional[str]           = None
    description:  Optional[str]           = None
    persona_config: Optional[PersonaConfig] = None
    status:       Optional[BotStatus]     = None
    voice_gender: Optional[BotGender]    = None

    # Monetization updates
    is_free:              Optional[bool]  = None
    pricing_tier:         Optional[str]   = None
    unlock_price:         Optional[int]   = None
    credits_per_pack:     Optional[int]   = None
    voice_enabled:        Optional[bool]  = None
    subscription_enabled: Optional[bool]  = None


class BotResponse(BaseModel):
    """Schema for bot response — includes voice_gender for frontend TTS config."""
    id:           UUID
    owner_id:     UUID
    name:         str
    description:  Optional[str]           = None
    persona_config: Dict[str, Any]
    status:       BotStatus
    voice_gender: Optional[str]           = "female"
    avatar_url:   Optional[str]           = None
    created_at:   datetime
    updated_at:   datetime
    owner:        Optional[Dict[str, Any]] = None  # Populated for Explore page

    # Monetization fields
    is_free:              bool             = True
    is_unlocked:          Optional[bool]   = None
    pricing_tier:         Optional[str]   = None
    unlock_price:         Optional[int]   = None
    credits_per_pack:     Optional[int]   = None
    voice_enabled:        bool            = False
    subscription_enabled: bool            = False
