from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from backend.database.models import BotStatus

class PersonaConfig(BaseModel):
    """Structured form data for the alumni persona."""
    greeting: Optional[str] = None
    tone: Optional[str] = "professional"  # e.g., "friendly", "formal", "casual"
    expertise: Optional[List[str]] = []
    experience: Optional[List[Dict[str, Any]]] = []
    education: Optional[List[Dict[str, Any]]] = []
    links: Optional[Dict[str, str]] = {}

class BotCreate(BaseModel):
    """Schema for creating a new bot."""
    name: str
    description: Optional[str] = None
    persona_config: Optional[PersonaConfig] = None

class BotUpdate(BaseModel):
    """Schema for updating a bot."""
    name: Optional[str] = None
    description: Optional[str] = None
    persona_config: Optional[PersonaConfig] = None
    status: Optional[BotStatus] = None

class BotResponse(BaseModel):
    """Schema for bot response."""
    id: UUID
    owner_id: UUID
    name: str
    description: Optional[str] = None
    persona_config: Dict[str, Any]
    status: BotStatus
    created_at: datetime
    updated_at: datetime
    owner: Optional[Dict[str, Any]] = None  # Added for Explore page context
