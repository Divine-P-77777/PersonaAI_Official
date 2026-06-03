"""
Live Interaction Router — WebSocket Endpoint.

Responsibility:
  - POST /api/live/session/start  : Authenticate, create Redis session, return WS URL.
  - WS   /api/live/ws/{session_id}: Full-duplex live voice conversation loop.

Message handling is deliberately thin here — heavy work is delegated to:
  - streaming.py       : RAG → LLM → TTS pipeline
  - interruption_manager.py : Interruption handling
  - session_manager.py : Redis state persistence
  - connection_manager.py   : WS connection lifecycle

"""

import json
import uuid
import asyncio
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from pydantic import BaseModel

from backend.core.security          import get_current_user, verify_supabase_token
from fastapi.security               import HTTPAuthorizationCredentials
from backend.database.queries       import get_bot_by_id, save_message, get_recent_messages
from backend.voice.connection_manager  import manager
from backend.voice.session_manager     import create_live_session, delete_live_session
from backend.voice.streaming           import process_voice_turn
from backend.voice.interruption_manager import handle_interrupt
from backend.voice.event_types         import ClientEvent, error_event
from backend.core.redis_client          import get_cache, set_cache, invalidate_cache

logger = logging.getLogger(__name__)
router = APIRouter()


# Session Start 

class SessionStartRequest(BaseModel):
    bot_id: str


class SessionStartResponse(BaseModel):
    session_id: str
    ws_url:     str


@router.post("/session/start", response_model=SessionStartResponse)
async def start_live_session(
    body: SessionStartRequest,
    user: dict = Depends(get_current_user),
):
    """
    Authenticate the user, resolve bot config, create a Redis session,
    and return the WebSocket URL the frontend should connect to.

    Why a REST call before WebSocket?
      - WS connections can't easily return HTTP 401/403 errors.
      - Auth + bot config resolution happens here (HTTP), not inside the WS loop.
    """
    # Verify bot exists and is accessible
    bot = await get_bot_by_id(body.bot_id, token=user.get("_token"))
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found or inaccessible")

    if bot["status"] != "ready" and bot["owner_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="This persona is not ready yet")

    # Create session
    session_id   = str(uuid.uuid4())
    voice_gender = bot.get("voice_gender") or "female"
    await create_live_session(
        session_id=session_id,
        user_id=user["id"],
        bot_id=body.bot_id,
        language="en",
        voice_gender=voice_gender,
    )

    # Also log it in the database so it counts towards the mentor's total session count
    from backend.database.queries import record_chat_session
    await record_chat_session(user_id=user["id"], bot_id=body.bot_id, token=user.get("_token"))

    ws_url = f"/api/live/ws/{session_id}"
    logger.debug(f"[Live] Session created: {session_id[:8]}… (bot={body.bot_id[:8]}, gender={voice_gender})")
    return {"session_id": session_id, "ws_url": ws_url}


# ── WebSocket Endpoint 

@router.websocket("/ws/{session_id}")
async def live_websocket(websocket: WebSocket, session_id: str):
    """
    Full-duplex live voice WebSocket endpoint.

    Auth: JWT token passed as query param `?token=<JWT>`.
    The token is verified before the connection is accepted.

    Message loop handles:
      config       → update language / voice_gender for this session
      user_text    → run full voice turn (RAG → LLM → TTS → audio)
      interrupt    → stop current AI audio + cancel LLM task
      session_end  → clean up Redis session and close
    """
    # Auth — verify JWT before accepting the WebSocket
    token = websocket.query_params.get("token")
    if not token:
        await websocket.accept()
        await websocket.close(code=1008, reason="Missing authentication token")
        return
    try:
        creds     = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        user_data = await verify_supabase_token(creds)
        user_id   = user_data.get("sub") or user_data.get("id")
        if not user_id:
            raise ValueError("No user ID in token")
    except Exception as e:
        logger.warning(f"[Live] Auth failed: {e}")
        await websocket.accept()
        await websocket.close(code=1008, reason="Invalid authentication token")
        return

    # ── Accept connection ─────────────────────────────────────────────────────
    await manager.connect(websocket, session_id)

    # Per-connection mutable state (not Redis — too fast-changing)
    language     = "en"
    voice_gender = "female"
    bot_id       = None
    token_str    = token

    try:
        while True:
            try:
                raw = await websocket.receive_text()
            except WebSocketDisconnect:
                logger.debug(f"[Live] Client disconnected: {session_id[:8]}")
                break

            try:
                message = json.loads(raw)
            except json.JSONDecodeError:
                await manager.send_json(session_id, error_event("Invalid JSON"))
                continue

            msg_type = message.get("type")

            # ── config ────────────────────────────────────────────────────────
            if msg_type == ClientEvent.CONFIG:
                language     = message.get("language", language)
                voice_gender = message.get("voice_gender", voice_gender)
                bot_id       = message.get("bot_id", bot_id)
                logger.debug(f"[Live] Config: lang={language}, gender={voice_gender}, bot={bot_id}")

            # ── user_text (typed or from frontend STT) ────────────────────────
            elif msg_type == ClientEvent.USER_TEXT:
                text = message.get("text", "").strip()
                if text and bot_id:
                    # Cancel any active running voice turn task first
                    manager.cancel_active_task(session_id)
                    
                    task = asyncio.create_task(
                        _run_voice_turn(
                            session_id, text, language, voice_gender, bot_id, user_id, token_str
                        )
                    )
                    manager.register_task(session_id, task)
                    # Update language from return value (auto-switch)
                    # The task updates session state internally

            # ── interrupt ─────────────────────────────────────────────────────
            elif msg_type == ClientEvent.INTERRUPT:
                await handle_interrupt(session_id)

            # ── session_end ───────────────────────────────────────────────────
            elif msg_type == ClientEvent.SESSION_END:
                logger.debug(f"[Live] Session end requested: {session_id[:8]}")
                asyncio.create_task(delete_live_session(session_id))
                break

    except Exception as exc:
        logger.error(f"[Live] Unexpected error for {session_id[:8]}: {exc}")
        await manager.send_json(session_id, error_event("Unexpected server error"))
    finally:
        manager.disconnect(session_id)


from backend.database.payment_queries import (
    get_user_bot_access,
    get_monthly_exploration,
    create_free_trial_access,
    consume_credits,
    upsert_monthly_exploration,
)
from backend.payments.pricing_config import (
    FREE_EXPLORATION,
    CREDIT_COSTS,
    DEFAULT_CREDIT_COST,
)
from datetime import datetime, timedelta, timezone

async def _run_voice_turn(
    session_id:   str,
    text:         str,
    language:     str,
    voice_gender: str,
    bot_id:       str,
    user_id:      str,
    token:        str,
) -> None:
    """Wrapper to run process_voice_turn and handle errors gracefully."""
    try:
        # Check credits (cache-optimized to prevent hitting Supabase on every single turn)
        bot_cache_key = f"bot_config:{bot_id}"
        bot = await get_cache(bot_cache_key)
        if bot is None:
            logger.info(f"[Live] Cache MISS for {bot_cache_key}. Querying Supabase...")
            bot = await get_bot_by_id(bot_id, token=token)
            if bot:
                await set_cache(bot_cache_key, bot, expire=3600)
        else:
            logger.info(f"[Live] ⚡ Cache HIT for {bot_cache_key}. Using fast Redis bot config.")

        if not bot:
            await manager.send_json(session_id, error_event("Bot not found"))
            return
            
        is_owner = (bot["owner_id"] == user_id)
        is_free_bot = bot.get("is_free", True)

        if not is_owner and not is_free_bot:
            credit_cost = CREDIT_COSTS.get("voice_session", DEFAULT_CREDIT_COST)
            now = datetime.now(tz=timezone.utc)
            access = await get_user_bot_access(user_id, bot_id, token=token)

            if access:
                expires_at = access.get("access_expires_at")
                if expires_at:
                    from dateutil import parser as dateparser
                    exp_dt = dateparser.parse(expires_at) if isinstance(expires_at, str) else expires_at
                    if exp_dt < now:
                        await manager.send_json(session_id, error_event("Your access to this mentor has expired.", "ACCESS_EXPIRED"))
                        return

                credits_remaining = access["credits_allowed"] - access["credits_used"]
                if credits_remaining < credit_cost:
                    await manager.send_json(session_id, error_event("You've used all your credits for this mentor.", "INSUFFICIENT_CREDITS"))
                    return
            else:
                exploration = await get_monthly_exploration(user_id, token=token)
                explored_bots: list = (exploration or {}).get("mentors_explored", []) or []

                if bot_id not in explored_bots:
                    if len(explored_bots) >= FREE_EXPLORATION.max_mentors_per_month:
                        await manager.send_json(session_id, error_event("You've explored your monthly limit of mentors. Unlock to continue.", "EXPLORATION_LIMIT_REACHED"))
                        return

                    trial_expires = now + timedelta(days=7)
                    access = await create_free_trial_access(
                        user_id=user_id,
                        bot_id=bot_id,
                        credits_allowed=FREE_EXPLORATION.free_credits_per_mentor,
                        expires_at=trial_expires,
                        token=token,
                    )
                    await upsert_monthly_exploration(user_id, bot_id, token=token)
                else:
                    await manager.send_json(session_id, error_event("Your free trial for this mentor has ended. Unlock to continue.", "TRIAL_EXHAUSTED"))
                    return

            if access:
                await consume_credits(access["id"], credit_cost, token=token)

        # 1. Fetch recent chat history from Upstash Redis (Key: chat_history:{bot_id}:{user_id})
        cache_key = f"chat_history:{bot_id}:{user_id}"
        llm_history = await get_cache(cache_key)
        if llm_history is None:
            logger.info(f"[Live] Cache MISS for {cache_key}. Querying Supabase...")
            llm_history = await get_recent_messages(
                user_id=user_id,
                bot_id=bot_id,
                limit=5,
                token=token
            )
            await set_cache(cache_key, llm_history, expire=3600)
        else:
            logger.info(f"[Live] ⚡ Cache HIT for {cache_key}. Using fast Redis memory.")

        # Keep a copy of previous history for the current turn prompt
        chat_history = list(llm_history)

        # 2. Asynchronously save incoming user text to Supabase (RLS compliant)
        asyncio.create_task(
            save_message(
                user_id=user_id,
                bot_id=bot_id,
                role="user",
                content=text,
                token=token
            )
        )

        # 3. Optimistically append current message to local history cache
        llm_history.append({"role": "user", "content": text})
        llm_history = llm_history[-5:]
        await set_cache(cache_key, llm_history, expire=3600)
        asyncio.create_task(invalidate_cache(f"full_history:{bot_id}:{user_id}"))

        await process_voice_turn(
            session_id=session_id,
            user_text=text,
            language=language,
            voice_gender=voice_gender,
            bot_id=bot_id,
            user_id=user_id,
            chat_history=chat_history,
            token=token,
        )
    except asyncio.CancelledError:
        logger.debug(f"[Live] Voice turn cancelled for {session_id[:8]}")
    except Exception as exc:
        logger.error(f"[Live] Voice turn error for {session_id[:8]}: {exc}")
        await manager.send_json(session_id, error_event(f"Processing error: {str(exc)}"))
