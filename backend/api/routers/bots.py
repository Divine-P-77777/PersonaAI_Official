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
    
    for bot in bots:
        # Extract session count from the related chat_sessions table
        chat_sessions = bot.pop("chat_sessions", None)
        if isinstance(chat_sessions, list) and len(chat_sessions) > 0:
            bot["session_count"] = chat_sessions[0].get("count", 0)
        else:
            bot["session_count"] = 0

    if user:
        from backend.database.payment_queries import get_all_user_bot_accesses, get_monthly_exploration
        from datetime import datetime, timezone
        monthly_exp = await get_monthly_exploration(user["id"], token=token)
        free_explorations_used = len(monthly_exp.get("mentors_explored", [])) if monthly_exp else 0
        now = datetime.now(tz=timezone.utc)
        
        # Fetch ALL access records in one query to avoid N+1 issue
        access_map = await get_all_user_bot_accesses(user["id"], token=token)
        
        for bot in bots:
            bot["free_explorations_used"] = free_explorations_used
            # Check if user has active access
            access = access_map.get(str(bot["id"]))
            if access:
                credits_remaining = access.get("credits_allowed", 0) - access.get("credits_used", 0)
                # Also check expiry — expired trials must re-lock
                expires_at_raw = access.get("access_expires_at")
                if expires_at_raw:
                    try:
                        from dateutil import parser as dateparser
                        exp_dt = dateparser.parse(expires_at_raw) if isinstance(expires_at_raw, str) else expires_at_raw
                        is_expired = exp_dt < now
                    except Exception as e:
                        print(f"[DEBUG] expiry parse error: {e}")
                        is_expired = False
                else:
                    is_expired = False
                
                bot["is_unlocked"] = credits_remaining > 0 and not is_expired
                print(f"[DEBUG] bot {bot['name']}: access exists. credits_rem={credits_remaining}, is_expired={is_expired} => is_unlocked={bot['is_unlocked']}")
            else:
                bot["is_unlocked"] = False
                print(f"[DEBUG] bot {bot['name']}: no access record found.")
    
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
        
    # --- Pricing validation and sanitization for updates ---
    # If is_free is provided in the update, apply logic
    if "is_free" in updates:
        if updates["is_free"]:
            # If changing to free, force monetization fields to None
            updates["pricing_tier"] = None
            updates["unlock_price"] = None
            updates["credits_per_pack"] = None
        else:
            # If changing to paid, validate fields
            bot = await get_bot_by_id(str(bot_id), token=user.get("_token"))
            if not bot:
                raise HTTPException(status_code=404, detail="Bot not found")
                
            tier = updates.get("pricing_tier") or bot.get("pricing_tier")
            if not tier:
                raise HTTPException(status_code=400, detail="A pricing_tier is required for paid bots.")
                
            price = updates.get("unlock_price")
            if price is None:
                price = bot.get("unlock_price") or PRICING_TIERS[tier].unlock_price
                
            credits_val = updates.get("credits_per_pack")
            if credits_val is None:
                credits_val = bot.get("credits_per_pack") or PRICING_TIERS[tier].credits
                
            is_valid, err_msg = validate_pricing(tier, price, credits_val)
            if not is_valid:
                raise HTTPException(status_code=422, detail=err_msg)
                
            updates["pricing_tier"] = tier
            updates["unlock_price"] = price
            updates["credits_per_pack"] = credits_val

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

