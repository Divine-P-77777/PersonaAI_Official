"""
Interruption Manager for Live Voice Sessions.

Responsibility: Provide a clean, named interface over the ConnectionManager's
cancellation primitives. Called by the WS message loop when an 'interrupt'
event arrives from the frontend.

Why a separate module?
  Interruption logic will grow (e.g., graceful partial-response saving,
  analytics events). Isolating it here means the main WS loop stays clean.
"""
import logging
from backend.voice.connection_manager import manager

logger = logging.getLogger(__name__)


async def handle_interrupt(session_id: str) -> None:
    """
    Handle a user interruption during AI speech.

    Steps:
    1. Set the cancellation event → TTS streaming loop will exit on next chunk.
    2. Cancel the active asyncio.Task → kills any in-flight LLM/TTS coroutine.

    The frontend is responsible for flushing its own audio queue when it
    sends the 'interrupt' event (it doesn't wait for the server to confirm).
    """
    logger.debug(f"[Interrupt] User interrupted session {session_id[:8]}…")

    # Signal the audio streaming loop to stop sending chunks
    manager.set_cancel(session_id)

    # Hard-cancel the running coroutine (LLM + TTS pipeline)
    manager.cancel_active_task(session_id)


def clear_interrupt(session_id: str) -> None:
    """
    Clear interruption state before starting a new voice turn.
    Must be called at the start of every process_voice_turn().
    """
    manager.clear_cancel(session_id)
