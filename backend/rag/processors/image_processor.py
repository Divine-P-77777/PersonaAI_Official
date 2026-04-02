import io
import logging
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
    # Use the unified fallback logic (Async Worker -> Local Failover)
    try:
        text = await perform_ocr_with_fallback(file_content, source_id="image_source", timeout=5.0)
        return text
    except Exception as e:
        logger.error(f"[IMAGE_OCR] ❌ Overall OCR failed for image: {e}")
        raise RuntimeError(f"OCR processing failed: {e}")
