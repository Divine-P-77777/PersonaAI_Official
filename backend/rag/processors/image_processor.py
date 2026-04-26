import io
import logging
import asyncio
import traceback
import pytesseract
from PIL import Image, UnidentifiedImageError

from backend.core.config import get_settings
from backend.rag.processors.ocr_fallback import perform_ocr_with_fallback

logger = logging.getLogger(__name__)
settings = get_settings()
pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_PATH


async def extract_text_from_image(file_content: bytes) -> str:
    """Extract text from image using Tesseract OCR (with Async Worker Fallback)."""
    if not file_content:
        logger.error("[IMAGE_OCR] ❌ Received empty file content")
        raise ValueError("Empty image content")

    try:
        logger.info(f"[IMAGE_OCR] 📸 Processing image ({len(file_content)} bytes)...")
        text = await perform_ocr_with_fallback(file_content, source_id="image_source", timeout=30.0)
        
        
        if not text or not text.strip():
            logger.warning("[IMAGE_OCR] ⚠️ OCR returned no text. This might be a non-text image.")
            
        return text
    except Exception as e:
        logger.error(f"[IMAGE_OCR] ❌ Overall OCR failed: {str(e)}")
        logger.error(traceback.format_exc())
        raise RuntimeError(f"OCR processing failed: {str(e)}")
