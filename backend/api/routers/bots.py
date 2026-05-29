from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List, Dict, Any, Optional
from uuid import UUID
import uuid

from backend.core.security import get_current_user, get_optional_user, require_alumni_role
from backend.api.schemas.bot import BotCreate, BotUpdate, BotResponse
from backend.database.queries import (
    create_bot as db_create_bot,
    get_bots_by_owner,
    get_bot_by_id,
    update_bot as db_update_bot,
    delete_bot as db_delete_bot
)
from backend.core.redis_client import invalidate_cache
from backend.core.storage import upload_to_supabase
from backend.payments.pricing_config import PRICING_TIERS, validate_pricing, get_value_score_warning

router = APIRouter()

@router.post("/", response_model=BotResponse)
async def create_bot(
    bot_in: BotCreate,
    user: Dict[str, Any] = Depends(require_alumni_role)
):
    """Create a new alumni/professional persona bot."""

    # --- Pricing validation (sourced from centralized pricing_config.py) ---
    if not bot_in.is_free:
        if not bot_in.pricing_tier:
            raise HTTPException(
                status_code=400,
                detail="A pricing_tier is required for paid bots."
            )
        if bot_in.pricing_tier not in PRICING_TIERS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid pricing_tier '{bot_in.pricing_tier}'. Valid: {list(PRICING_TIERS)}"
            )

        price    = bot_in.unlock_price    or PRICING_TIERS[bot_in.pricing_tier].unlock_price
        credits  = bot_in.credits_per_pack or PRICING_TIERS[bot_in.pricing_tier].credits

        is_valid, err_msg = validate_pricing(bot_in.pricing_tier, price, credits)
        if not is_valid:
            raise HTTPException(status_code=422, detail=err_msg)

        # Non-blocking warning (returned in response header for frontend to surface)
        warning = get_value_score_warning(price, credits)
    else:
        price   = None
        credits = None
        warning = None

    bot_data = {
        "owner_id":    user["id"],
        "name":        bot_in.name,
        "description": bot_in.description,
        "persona_config": bot_in.persona_config.model_dump(mode="json") if bot_in.persona_config else {},
        "voice_gender": (bot_in.voice_gender.value if bot_in.voice_gender else "female"),
        # Monetization
        "is_free":              bot_in.is_free,
        "pricing_tier":         bot_in.pricing_tier if not bot_in.is_free else None,
        "unlock_price":         price,
        "credits_per_pack":     credits,
        "voice_enabled":        bot_in.voice_enabled,
        "subscription_enabled": bot_in.subscription_enabled,
    }
    return await db_create_bot(bot_data, token=user.get("_token"))


@router.get("/explore", response_model=List[BotResponse])
async def list_public_bots(
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """List all bots that are 'ready' — for the student explore page."""
    from backend.database.queries import get_public_bots
    token = user.get("_token") if user else None
    bots = await get_public_bots(token=token)
    
    if user:
        from backend.database.payment_queries import get_user_bot_access
        for bot in bots:
            # Check if user has active access
            access = await get_user_bot_access(user["id"], str(bot["id"]), token=token)
            if access:
                credits_remaining = access.get("credits_allowed", 0) - access.get("credits_used", 0)
                if credits_remaining > 0:
                    bot["is_unlocked"] = True
                else:
                    bot["is_unlocked"] = False
            else:
                bot["is_unlocked"] = False
    
    return bots


@router.get("/", response_model=List[BotResponse])
async def list_bots(
    user: Dict[str, Any] = Depends(get_current_user)
):
    """List all bots owned by the current user."""
    return await get_bots_by_owner(user["id"], token=user.get("_token"))

@router.get("/{bot_id}", response_model=BotResponse)
async def get_bot(
    bot_id: UUID,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """Fetch a specific bot by ID. Allows public viewing of 'ready' bots."""
    # Use service role or none if user is anonymous
    token = user.get("_token") if user else None
    bot = await get_bot_by_id(str(bot_id), token=token)
    
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
        
    # Access Control: 
    # 1. If owner, show everything
    if user and bot["owner_id"] == user["id"]:
        return bot
    
    # 2. Otherwise, only show if "ready"
    if bot["status"] != "ready":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="This persona is private or still in training"
        )
        
    return bot

@router.put("/{bot_id}", response_model=BotResponse)
async def update_bot(
    bot_id: UUID,
    bot_in: BotUpdate,
    user: Dict[str, Any] = Depends(require_alumni_role)
):
    """Update a bot's configuration/persona."""
    updates = bot_in.model_dump(exclude_unset=True, mode="json")
    if "persona_config" in updates and updates["persona_config"]:
        # Only persona_config passed through model_dump might need careful handling if it's a sub-model
        updates["persona_config"] = bot_in.persona_config.model_dump(mode="json")

    updated_bot = await db_update_bot(str(bot_id), updates, token=user.get("_token"))
    if not updated_bot:
        raise HTTPException(status_code=404, detail="Bot not found or unauthorized")
        
    # Invalidate Redis cache to ensure chat endpoint gets fresh config
    await invalidate_cache(f"bot_config:{bot_id}")
    
    return updated_bot

@router.delete("/{bot_id}")
async def delete_bot(
    bot_id: UUID,
    user: Dict[str, Any] = Depends(require_alumni_role)
):
    """Delete a bot and all its associated data (cascaded in DB)."""
    success = await db_delete_bot(str(bot_id), user["id"], token=user.get("_token"))
    if not success:
        raise HTTPException(status_code=404, detail="Bot not found or unauthorized")
        
    # Invalidate Redis cache
    await invalidate_cache(f"bot_config:{bot_id}")
    
    return {"status": "deleted", "bot_id": bot_id}

@router.post("/{bot_id}/avatar", response_model=BotResponse)
async def upload_bot_avatar(
    bot_id: UUID,
    file: UploadFile = File(...),
    user: Dict[str, Any] = Depends(require_alumni_role)
):
    """Upload an avatar image for a bot."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
        
    bot = await get_bot_by_id(str(bot_id), token=user.get("_token"))
    if not bot or bot["owner_id"] != user["id"]:
        raise HTTPException(status_code=404, detail="Bot not found or unauthorized")
        
    # Extract token
    token = user.get("_token")
        
    try:
        content = await file.read()
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        # Upload under the owner's user folder so the avatars bucket RLS passes:
        # RLS rule: storage.foldername(name)[1] = auth.uid()
        # Path = {user_id}/bot-{bot_id}.ext
        file_path = f"{user['id']}/bot-{bot_id}.{file_ext}"
        
        avatar_url = await upload_to_supabase(content, file_path, token=token)
        
        # Update bot record
        updated_bot = await db_update_bot(str(bot_id), {"avatar_url": avatar_url}, token=token)
        
        # Invalidate cache
        await invalidate_cache(f"bot_config:{bot_id}")
        
        return updated_bot
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Avatar upload failed: {str(e)}")

