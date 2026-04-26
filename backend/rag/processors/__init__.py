"""
PersonaBot — RAG Processor Factory
====================================
Each source_type has a dedicated processor that extracts plain text.
All processors return `str` — the downstream chunker is type-agnostic.
"""

from __future__ import annotations
from typing import Optional

from backend.database.models import SourceType

from .pdf_processor   import extract_text_from_pdf
from .image_processor import extract_text_from_image
from .text_processor  import extract_text_from_text
from .web_processor   import extract_text_from_url


async def extract_text(
    source_type: SourceType,
    *,
    content:  str | None = None,
    url:      str | None = None,
    raw_bytes: bytes | None = None,
    on_progress: Optional[callable] = None,
) -> str:
    """
    Dispatch to the correct processor based on source_type.

    Args:
        source_type : One of the SourceType enum values.
        content     : Raw text (for `long_text`).
        url         : HTTP(S) URL (for `web_link` / `video_link`).
        raw_bytes   : Raw file bytes (for `pdf` / `image`).

    Returns:
        Extracted plain text, ready for chunking.
    """
    if source_type == SourceType.pdf:
        if not raw_bytes:
            raise ValueError("raw_bytes required for pdf source type")
        return await extract_text_from_pdf(raw_bytes, on_progress=on_progress)

    if source_type == SourceType.image:
        if not raw_bytes:
            raise ValueError("raw_bytes required for image source type")
        return await extract_text_from_image(raw_bytes)

    if source_type == SourceType.long_text:
        if not content:
            raise ValueError("content required for long_text source type")
        return extract_text_from_text(content)

    if source_type in (SourceType.web_link, SourceType.video_link):
        if not url:
            raise ValueError("url required for web_link / video_link source type")
        return await extract_text_from_url(url)

    raise NotImplementedError(f"No processor registered for source_type: {source_type}")
