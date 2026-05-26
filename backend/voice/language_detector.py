"""
Language Detection Utility.

Responsibility: Detect whether user text is English or Hindi.
This is called on every user_text message to support automatic language
switching — if the user switches to Hindi mid-conversation, the next
response is automatically generated in Hindi using Sarvam AI TTS.

Why a separate file?
  - Pure utility: no state, no side effects, no imports from voice layer.
  - Keeps streaming.py clean and testable.
  - Easy to swap detection library (langdetect → fastText) without touching orchestration.

Supported languages: 'en' (English) and 'hi' (Hindi).
All other detected languages fall back to 'en' for now.
"""
import logging

logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────

SUPPORTED_LANGUAGES = {"en", "hi"}
DEFAULT_LANGUAGE    = "en"

# Common Hindi Unicode script range (Devanagari: U+0900–U+097F)
# Fast heuristic before calling langdetect, which has ~200ms cold start.
_DEVANAGARI_START = 0x0900
_DEVANAGARI_END   = 0x097F
_DEVANAGARI_THRESHOLD = 0.15  # If >15% chars are Devanagari → Hindi


def _devanagari_ratio(text: str) -> float:
    """Fast O(n) check: what fraction of characters are Devanagari script?"""
    if not text:
        return 0.0
    count = sum(1 for ch in text if _DEVANAGARI_START <= ord(ch) <= _DEVANAGARI_END)
    return count / len(text)


def detect_language(text: str) -> str:
    """
    Detect whether `text` is English ('en') or Hindi ('hi').

    Strategy (two-tier for speed + accuracy):
    1. Fast heuristic: if >15% chars are Devanagari script → Hindi immediately.
       Most Hindi text typed in Devanagari will pass this threshold with no
       library overhead.
    2. Fallback: use `langdetect` for Roman-script Hindi (Hinglish edge cases).
       langdetect is probabilistic and may mis-classify short Hinglish phrases,
       so we keep English as the safe fallback.

    Args:
        text: The user's transcribed or typed message.

    Returns:
        'en' or 'hi'
    """
    if not text or not text.strip():
        return DEFAULT_LANGUAGE

    # Tier 1: Devanagari script heuristic (fast, no library)
    if _devanagari_ratio(text) > _DEVANAGARI_THRESHOLD:
        logger.debug(f"[LangDetect] Devanagari heuristic → 'hi' for text: {text[:40]!r}")
        return "hi"

    # Tier 2: langdetect library (handles Roman-script Hindi / Hinglish)
    try:
        from langdetect import detect, LangDetectException
        lang = detect(text)
        result = "hi" if lang == "hi" else "en"
        logger.debug(f"[LangDetect] langdetect={lang!r} → '{result}' for text: {text[:40]!r}")
        return result
    except Exception as exc:
        logger.warning(f"[LangDetect] langdetect failed ({exc}), defaulting to '{DEFAULT_LANGUAGE}'")
        return DEFAULT_LANGUAGE
