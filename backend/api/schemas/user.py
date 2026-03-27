from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional
from datetime import datetime
from backend.database.models import UserRole

class UserProfile(BaseModel):
    """Schema for user profile including role."""
    id: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[UserRole] = None
    onboarding_completed: Optional[bool] = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[UserRole] = None
    onboarding_completed: Optional[bool] = None
