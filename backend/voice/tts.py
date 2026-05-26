"""
Text-to-Speech Service — Gender-Aware Voice Router.

Responsibility: Given (language, voice_gender), select the correct TTS
engine and voice ID, then stream synthesized audio bytes.

Voice Mapping (ElevenLabs free-plan pre-made voices — best by gender):
  EN + female      → ElevenLabs "Sarah"   (voice ID: EXAVITQu4vr4xnSDxMaL) — warm, professional, natural
  EN + male        → ElevenLabs "Charlie" (voice ID: IKne3meq5aSn9XLyUdCD) — natural, conversational, clear
  EN + transgender → ElevenLabs "Aria"    (voice ID: 9BWtsMINqrJLrRacOk9x) — smooth, gender-neutral tone
  HI + male        → Sarvam AI "hi-IN-Male"
  HI + female      → Sarvam AI "hi-IN-Female"
  HI + transgender → Sarvam AI "hi-IN-Female" (female voice — inclusive default)

Does NOT contain: WebSocket logic, session state, or language detection.
"""
import logging
import os
from typing import AsyncGenerator, Iterator

import httpx

from backend.core.config import get_settings

logger   = logging.getLogger(__name__)
settings = get_settings()

# ElevenLabs free-plan pre-made voices — best quality by gender
# All IDs below are available on ElevenLabs free tier (pre-made voices)
ELEVENLABS_VOICE_MAP = {
    # Sarah — warm, professional, natural female voice (top-rated free voice)
    "female":      os.getenv("ELEVENLABS_VOICE_ID_FEMALE",      "EXAVITQu4vr4xnSDxMaL"),
    # Charlie — natural, conversational male voice (clear enunciation, great for AI mentor)
    "male":        os.getenv("ELEVENLABS_VOICE_ID_MALE",        "IKne3meq5aSn9XLyUdCD"),
    # Aria — smooth, gender-neutral tone (inclusive default for transgender)
    "transgender": os.getenv("ELEVENLABS_VOICE_ID_TRANSGENDER", "9BWtsMINqrJLrRacOk9x"),
}

ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"

# Sarvam AI Voice IDs 
SARVAM_VOICE_MAP = {
    "male":        os.getenv("SARVAM_VOICE_ID_MALE",        "shubh"),
    "female":      os.getenv("SARVAM_VOICE_ID_FEMALE",      "ritu"),
    "transgender": os.getenv("SARVAM_VOICE_ID_TRANSGENDER", "ritu"),
}

SARVAM_API_URL = "https://api.sarvam.ai/text-to-speech"


# Internal: ElevenLabs streaming

async def _stream_elevenlabs(
    text_iter: Iterator[str],
    voice_id: str,
) -> AsyncGenerator[bytes, None]:
    """
    Stream TTS audio from ElevenLabs by feeding text chunks into their
    streaming endpoint. Yields raw MP3 bytes as they arrive.

    ElevenLabs streaming API: POST /v1/text-to-speech/{voice_id}/stream
    The request body accepts the full text; for chunk streaming we buffer
    the iterator and send the complete text (ElevenLabs handles internal
    streaming with websocket-based approach in XI-API v2 — for now we
    collect and stream the response body chunks).
    """
    api_key = settings.ELEVENLABS_API_KEY or os.getenv("ELEVENLABS_API_KEY", "")
    if not api_key:
        logger.error("[TTS] ELEVENLABS_API_KEY not set.")
        return

    if hasattr(text_iter, "__aiter__"):
        full_text_chunks = []
        async for chunk in text_iter:
            full_text_chunks.append(chunk)
        full_text = "".join(full_text_chunks)
    else:
        full_text = "".join(text_iter)

    if not full_text.strip():
        return

    url = f"{ELEVENLABS_BASE_URL}/text-to-speech/{voice_id}/stream"
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }
    payload = {
        "text": full_text,
        "model_id": "eleven_turbo_v2_5",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            async with client.stream("POST", url, json=payload, headers=headers) as resp:
                # For error responses, read the body first so raise_for_status()
                # can include it — otherwise httpx raises ResponseNotRead
                if resp.status_code >= 400:
                    await resp.aread()
                resp.raise_for_status()
                async for chunk in resp.aiter_bytes(chunk_size=4096):
                    if chunk:
                        yield chunk
    except httpx.HTTPStatusError as exc:
        # Safe to read .text now because we called aread() on error responses above
        err_body = exc.response.text[:300] if exc.response.is_stream_consumed else f"(status {exc.response.status_code})"
        logger.error(f"[TTS] ElevenLabs HTTP {exc.response.status_code}: {err_body}")
    except Exception as exc:
        logger.error(f"[TTS] ElevenLabs streaming error: {exc}")


# ── Internal: Sarvam AI TTS ────────────────────────────────────────────────────

async def _stream_sarvam(
    text_iter: Iterator[str],
    voice_id: str,
) -> AsyncGenerator[bytes, None]:
    """
    Generate TTS audio from Sarvam AI for Hindi text.
    Sarvam returns a base64-encoded WAV in JSON — we decode and yield raw bytes.
    """
    import base64

    api_key = settings.SARVAM_API_KEY or os.getenv("SARVAM_API_KEY", "")
    if not api_key:
        logger.error("[TTS] SARVAM_API_KEY not set.")
        return

    if hasattr(text_iter, "__aiter__"):
        full_text_chunks = []
        async for chunk in text_iter:
            full_text_chunks.append(chunk)
        full_text = "".join(full_text_chunks)
    else:
        full_text = "".join(text_iter)

    if not full_text.strip():
        return

    headers = {
        "api-subscription-key": api_key,
        "Content-Type": "application/json",
    }
    payload = {
        "inputs":       [full_text],
        "target_language_code": "hi-IN",
        "speaker":      voice_id,
        "model":        "bulbul:v3",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(SARVAM_API_URL, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            audios = data.get("audios", [])
            for audio_b64 in audios:
                raw_bytes = base64.b64decode(audio_b64)
                # Yield in 4KB chunks to keep WS frames small
                for i in range(0, len(raw_bytes), 4096):
                    yield raw_bytes[i:i + 4096]
    except httpx.HTTPStatusError as exc:
        logger.error(f"[TTS] Sarvam HTTP error {exc.response.status_code}: {exc.response.text[:200]}")
    except Exception as exc:
        logger.error(f"[TTS] Sarvam streaming error: {exc}")


#  Public API

async def stream_tts(
    text_iter: Iterator[str],
    language: str,
    voice_gender: str,
) -> tuple[AsyncGenerator[bytes, None], str]:
    """
    Route TTS to the correct engine based on language and voice_gender.

    Args:
        text_iter:    Iterator of text chunks from the LLM stream.
        language:     'en' or 'hi'.
        voice_gender: 'male', 'female', or 'transgender'.

    Returns:
        (audio_generator, audio_format)
        audio_format is 'mp3' for ElevenLabs and 'wav' for Sarvam.
    """
    gender = voice_gender.lower() if voice_gender else "female"

    if language == "hi":
        voice_id = SARVAM_VOICE_MAP.get(gender, SARVAM_VOICE_MAP["female"])
        logger.debug(f"[TTS] Sarvam AI → voice={voice_id} (lang=hi, gender={gender})")
        return _stream_sarvam(text_iter, voice_id), "wav"
    else:
        voice_id = ELEVENLABS_VOICE_MAP.get(gender, ELEVENLABS_VOICE_MAP["female"])
        logger.debug(f"[TTS] ElevenLabs → voice={voice_id} (lang=en, gender={gender})")
        return _stream_elevenlabs(text_iter, voice_id), "mp3"
