"""
WebSocket event type constants for the Live Interaction system.

Single source of truth for the WS message protocol so frontend and backend
always agree on event names. Never hard-code string literals elsewhere.

Client → Server events: what the frontend sends.
Server → Client events: what the backend sends back.
"""
from dataclasses import dataclass, field
from typing import Any, Optional


# Client → Server

class ClientEvent:
    """Message types the frontend sends over WebSocket."""
    CONFIG       = "config"        # Set language / voice_gender for this session
    USER_TEXT    = "user_text"     # Transcript text from frontend STT (or typed)
    INTERRUPT    = "interrupt"     # User spoke while AI was talking
    SESSION_END  = "session_end"   # User closed live mode


# Server → Client

class ServerEvent:
    """Message types the backend sends to the frontend over WebSocket."""
    STT_TRANSCRIPT  = "stt_transcript"  # Streaming partial speech recognition
    AI_TRANSCRIPT   = "ai_transcript"   # Full LLM text response (after audio done)
    AUDIO_STREAM    = "audio_stream"    # Base64-encoded TTS audio chunk (mp3 or wav)
    SPEAKING_DONE   = "speaking_done"   # All TTS audio chunks for this turn sent
    LANGUAGE_SWITCH = "language_switch" # Auto-detected language changed (en ↔ hi)
    ERROR           = "error"           # Something went wrong


# Payload Builders

def audio_chunk_event(data_b64: str, fmt: str) -> dict:
    """Build an audio_stream event payload."""
    return {"type": ServerEvent.AUDIO_STREAM, "data": data_b64, "format": fmt}


def ai_transcript_event(text: str) -> dict:
    """Build an ai_transcript event payload."""
    return {"type": ServerEvent.AI_TRANSCRIPT, "text": text}


def speaking_done_event() -> dict:
    return {"type": ServerEvent.SPEAKING_DONE}


def language_switch_event(language: str) -> dict:
    """Build a language_switch event payload."""
    return {"type": ServerEvent.LANGUAGE_SWITCH, "language": language}


def error_event(message: str) -> dict:
    return {"type": ServerEvent.ERROR, "message": message}


def stt_transcript_event(text: str, is_final: bool = False) -> dict:
    """Build a stt_transcript event payload."""
    return {"type": ServerEvent.STT_TRANSCRIPT, "text": text, "is_final": is_final}
