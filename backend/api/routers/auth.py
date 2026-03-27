from fastapi import APIRouter, Depends
from typing import Dict, Any

from backend.core.security import get_current_user, verify_supabase_token
from backend.api.schemas.user import UserProfile

router = APIRouter()

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Get current authenticated user's profile with role and onboarding status."""
    return user

@router.get("/session")
async def get_session_info(
    payload: Dict[str, Any] = Depends(verify_supabase_token)
):
    """Get basic session info from JWT."""
    return {
        "user_id": payload.get("sub"),
        "email": payload.get("email"),
        "role": payload.get("role", "user"),
        "aud": payload.get("aud")
    }
