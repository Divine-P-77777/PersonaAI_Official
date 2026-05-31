"""
Voice Turn Orchestration Pipeline.

Responsibility: Given a transcript, run the full pipeline:
  transcript → RAG retrieval → LLM stream → TTS stream → WS audio events

Also handles:
  - Automatic language detection and switching
  - Interruption checks on every audio chunk
  - Emitting language_switch events to frontend

"""

import base64
import asyncio
import logging

from backend.voice.connection_manager import manager
from backend.voice.tts               import stream_tts
from backend.voice.language_detector import detect_language
from backend.voice.interruption_manager import clear_interrupt
from backend.voice.session_manager import update_session_field
from backend.voice.event_types import (
    audio_chunk_event, ai_transcript_event,
    speaking_done_event, language_switch_event, error_event,
)
from backend.rag.retrieval import retrieve_similar_chunks
from backend.rag.context_builder import build_context
from backend.core.config import get_settings
from backend.core.redis_client import get_cache, set_cache, invalidate_cache
from backend.database.queries import save_message

logger   = logging.getLogger(__name__)
settings = get_settings()


async def _build_llm_stream(system_prompt: str, history: list, user_text: str):
    """
    Build an asynchronous Groq LLM token stream.
    Yields string tokens asynchronously.
    """
    from langchain_groq import ChatGroq
    from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

    history_msgs = []
    for msg in history:
        if msg.get("role") == "user":
            history_msgs.append(HumanMessage(content=msg["content"]))
        else:
            history_msgs.append(AIMessage(content=msg["content"]))
    
    llm = ChatGroq(
        model=settings.LLM_MODEL,
        api_key=settings.GROQ_API_KEY,
        temperature=0.7,
        max_tokens=300,   # Keep live responses short for natural TTS pacing
    )
    messages = [SystemMessage(content=system_prompt), *history_msgs, HumanMessage(content=user_text)]

    # Groq async streaming — yields chunk objects asynchronously
    async for chunk in llm.astream(messages):
        if chunk.content:
            yield chunk.content


async def process_voice_turn(
    session_id:   str,
    user_text:    str,
    language:     str,
    voice_gender: str,
    bot_id:       str,
    user_id:      str,
    chat_history: list,
    token:        str | None = None,
) -> str:
    """
    Execute one full voice interaction turn.

    Returns the detected language (may differ from input if auto-switched).

    Flow:
      1. Detect language from user text → emit language_switch if changed
      2. Retrieve relevant chunks from pgvector
      3. Build live-mode system prompt (cached and persona-aware)
      4. Stream LLM tokens through TTS
      5. Send audio chunks over WebSocket (with interruption checks)
      6. Send final ai_transcript + speaking_done events & save asynchronously
    """
    user_text = user_text.strip()
    if not user_text:
        return language

    # Step 1: Auto language detection 
    detected_lang = detect_language(user_text)
    if detected_lang != language:
        logger.debug(f"[Stream] Lang switch: {language!r} to{detected_lang!r} for session {session_id[:8]}")

        language = detected_lang
        await update_session_field(session_id, language=language)
        await manager.send_json(session_id, language_switch_event(language))

    # Step 2: Clear any stale interruption before this turn 
    clear_interrupt(session_id)

    # Step 3: RAG retrieval
    try:
        chunks = await retrieve_similar_chunks(bot_id, user_text, top_k=settings.TOP_K_RESULTS, token=token)
        chunk_texts = [c.get("content", c.get("chunk_text", "")) for c in chunks]
        logger.debug(f"[Stream] Retrieved {len(chunk_texts)} chunks for bot {bot_id[:8]}")
    except Exception as exc:
        logger.warning(f"[Stream] RAG failed (answering without context): {exc}")
        chunk_texts = []

    # Step 4: Build live-mode system prompt (Cached and Persona-Aware)
    bot_cache_key = f"bot_config:{bot_id}"
    bot = await get_cache(bot_cache_key)
    bot_name = bot.get("name", "AI Mentor") if bot else "AI Mentor"
    persona_config = bot.get("persona_config", {}) if bot else {}

    system_prompt = build_context(
        persona_config=persona_config,
        chunks=chunk_texts,
        bot_name=bot_name,
        mode="live",
    )

    # Step 5: Build LLM token stream (async)
    llm_stream = _build_llm_stream(system_prompt, chat_history, user_text)

    # Step 6: Route to TTS and stream audio 
    full_response_chunks: list[str] = []

    async def text_iterator():
        """Collect LLM tokens while yielding them to TTS asynchronously."""
        async for token_str in llm_stream:
            full_response_chunks.append(token_str)
            yield token_str

    try:
        audio_generator, audio_fmt = await stream_tts(text_iterator(), language, voice_gender)

        async for audio_chunk in audio_generator:
            # Interruption check: stop streaming if user spoke
            if manager.is_cancelled(session_id):
                logger.debug(f"[Stream] Audio interrupted for session {session_id[:8]}")
                raise asyncio.CancelledError()

            chunk_b64 = base64.b64encode(audio_chunk).decode("utf-8")
            sent = await manager.send_json(session_id, audio_chunk_event(chunk_b64, audio_fmt))
            if not sent:
                break   # Connection dropped

        # Step 7: Send transcript + done signal 
        final_text = "".join(full_response_chunks).strip()
        if final_text:
            await manager.send_json(session_id, ai_transcript_event(final_text))

        await manager.send_json(session_id, speaking_done_event())

        # Success path memory persistence: save full response asynchronously in background
        if final_text:
            # 1. Asynchronously save to Supabase
            asyncio.create_task(
                save_message(
                    user_id=user_id,
                    bot_id=bot_id,
                    role="assistant",
                    content=final_text,
                    token=token
                )
            )
            # 2. Update Redis rolling cache key
            async def _update_success_cache():
                cache_key = f"chat_history:{bot_id}:{user_id}"
                hist = await get_cache(cache_key) or []
                hist.append({"role": "assistant", "content": final_text})
                hist = hist[-5:]
                await set_cache(cache_key, hist, expire=3600)
                await invalidate_cache(f"full_history:{bot_id}:{user_id}")
            asyncio.create_task(_update_success_cache())

        logger.debug(f"[Stream] Turn complete for session {session_id[:8]} ({len(final_text)} chars)")

    except asyncio.CancelledError:
        logger.debug(f"[Stream] Task was cancelled (interrupted) for session {session_id[:8]}")
        # Interruption path memory persistence: harvest partial response spoken up to this point
        partial_text = "".join(full_response_chunks).strip()
        if partial_text:
            partial_text_marked = f"{partial_text}... [interrupted]"
            logger.info(f"[Stream] Harvesting partial response: '{partial_text_marked}'")

            # 1. Asynchronously save partial text to Supabase
            asyncio.create_task(
                save_message(
                    user_id=user_id,
                    bot_id=bot_id,
                    role="assistant",
                    content=partial_text_marked,
                    token=token
                )
            )
            # 2. Update Redis rolling cache with partial response
            async def _update_interrupted_cache():
                cache_key = f"chat_history:{bot_id}:{user_id}"
                hist = await get_cache(cache_key) or []
                hist.append({"role": "assistant", "content": partial_text_marked})
                hist = hist[-5:]
                await set_cache(cache_key, hist, expire=3600)
                await invalidate_cache(f"full_history:{bot_id}:{user_id}")
            asyncio.create_task(_update_interrupted_cache())
        raise

    return language  # Return possibly-updated language
