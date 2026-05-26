#   API request/response validation.
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum

from backend.database.models import BotStatus


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
    description:  Optional[str]           = None
    persona_config: Optional[PersonaConfig] = None
    voice_gender: Optional[BotGender]     = BotGender.female


class BotUpdate(BaseModel):
    """Schema for updating a bot."""
    name:         Optional[str]           = None
    description:  Optional[str]           = None
    persona_config: Optional[PersonaConfig] = None
    status:       Optional[BotStatus]     = None
    voice_gender: Optional[BotGender]    = None


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
