from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from uuid import UUID

from backend.core.security import get_current_user, require_alumni_role
from backend.api.schemas.bot import BotCreate, BotUpdate, BotResponse
from backend.database.queries import (
    create_bot as db_create_bot,
    get_bots_by_owner,
    get_bot_by_id,
    update_bot as db_update_bot,
    delete_bot as db_delete_bot
)

router = APIRouter()

@router.post("/", response_model=BotResponse)
async def create_bot(
    bot_in: BotCreate,
    user: Dict[str, Any] = Depends(require_alumni_role)
):
    """Create a new alumni/professional persona bot."""
    bot_data = {
        "owner_id": user["id"],
        "name": bot_in.name,
        "description": bot_in.description,
        "persona_config": bot_in.persona_config.model_dump() if bot_in.persona_config else {},
    }
    return await db_create_bot(bot_data, token=user.get("_token"))


@router.get("/explore", response_model=List[BotResponse])
async def list_public_bots():
    """List all bots that are 'ready' — for the student explore page."""
    from backend.database.queries import get_public_bots
    return await get_public_bots()


@router.get("/", response_model=List[BotResponse])
async def list_bots(
    user: Dict[str, Any] = Depends(get_current_user)
):
    """List all bots owned by the current user."""
    return await get_bots_by_owner(user["id"], token=user.get("_token"))

@router.get("/{bot_id}", response_model=BotResponse)
async def get_bot(
    bot_id: UUID,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Fetch a specific bot by ID. Allows public viewing of 'ready' bots."""
    bot = await get_bot_by_id(str(bot_id), token=user.get("_token"))
    
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
        
    # Access Control: Owner can see any status; others can only see "ready"
    if bot["owner_id"] != user["id"] and bot["status"] != "ready":
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
    updates = bot_in.model_dump(exclude_unset=True)
    if "persona_config" in updates and updates["persona_config"]:
        # Only persona_config passed through model_dump might need careful handling if it's a sub-model
        updates["persona_config"] = bot_in.persona_config.model_dump()

    updated_bot = await db_update_bot(str(bot_id), updates, token=user.get("_token"))
    if not updated_bot:
        raise HTTPException(status_code=404, detail="Bot not found or unauthorized")
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
    return {"status": "deleted", "bot_id": bot_id}
