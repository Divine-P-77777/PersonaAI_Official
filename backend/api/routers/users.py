from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import Dict, Any, Optional
import uuid

from backend.core.security import get_current_user
from backend.api.schemas.user import UserProfile, UserUpdate
from backend.database.queries import upsert_user, get_user_by_id
from backend.core.storage import upload_to_supabase

router = APIRouter()

@router.put("/me", response_model=UserProfile)
async def update_my_profile(
    user_update: UserUpdate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Update current user's profile details (handles first-time onboarding)."""
    # Extract the JWT token threaded from security layer — used for RLS
    token = user.pop("_token", None)
    updates = user_update.model_dump(exclude_unset=True)
    
    # Build the data to upsert — strip internal-only flags
    upsert_data = {**user, **updates}
    upsert_data.pop("is_new", None)
    
    # If nothing changed and user already exists, return early
    if not updates and not user.get("is_new"):
        return user
    
    saved = await upsert_user(upsert_data, token=token)
    return saved

@router.post("/me/avatar", response_model=UserProfile)
async def upload_avatar(
    file: UploadFile = File(...),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Upload a profile image to Supabase Storage and update user record."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    
    # Extract the JWT token for RLS-compliant storage upload
    token = user.pop("_token", None)
        
    try:
        content = await file.read()
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        # Path = {user_id}/{filename} (bucket 'avatars' is already in the URL)
        # DO NOT prefix with 'avatars/' — that causes a doubled path like /avatars/avatars/...
        file_path = f"{user['id']}/{uuid.uuid4()}.{file_ext}"
        
        # Pass token so auth.uid() resolves in Supabase Storage RLS
        avatar_url = await upload_to_supabase(content, file_path, token=token)
        
        # Update user record with new avatar URL
        updated_data = {**user, "avatar_url": avatar_url}
        updated_data.pop("is_new", None)
        return await upsert_user(updated_data, token=token)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Avatar upload failed: {str(e)}")
