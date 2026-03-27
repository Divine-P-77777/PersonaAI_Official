import io
import logging
import traceback
import pytesseract
from PIL import Image, UnidentifiedImageError

from backend.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()
pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_PATH


async def extract_text_from_image(file_content: bytes) -> str:
    """Extract text from image using Tesseract OCR."""
    logger.info(f"[IMAGE_OCR] Tesseract cmd = '{pytesseract.pytesseract.tesseract_cmd}'")
    logger.info(f"[IMAGE_OCR] Image bytes size = {len(file_content)}")

    # Validate Tesseract is accessible
    try:
        version = pytesseract.get_tesseract_version()
        logger.info(f"[IMAGE_OCR] Tesseract version = {version}")
    except Exception as e:
        tb = traceback.format_exc()
        logger.error(f"[IMAGE_OCR] ❌ Tesseract not found at '{pytesseract.pytesseract.tesseract_cmd}':\n{tb}")
        raise RuntimeError(
            f"Tesseract OCR is not accessible at path '{pytesseract.pytesseract.tesseract_cmd}'. "
            f"Verify the TESSERACT_PATH in your .env file. Original error: {e}"
        )

    # Open and validate image
    try:
        img = Image.open(io.BytesIO(file_content))
        img = img.convert("RGB")  # normalize format (handles RGBA, palette, etc.)
        logger.info(f"[IMAGE_OCR] Image opened: mode={img.mode}, size={img.size}")
    except UnidentifiedImageError as e:
        raise ValueError(f"Cannot identify image file — it may be corrupted or an unsupported format: {e}")
    except Exception as e:
        raise ValueError(f"Failed to open image: {e}")

    # Run OCR
    try:
        text = pytesseract.image_to_string(img)
        logger.info(f"[IMAGE_OCR] OCR extracted {len(text)} characters")
        return text
    except Exception as e:
        tb = traceback.format_exc()
        logger.error(f"[IMAGE_OCR] ❌ OCR failed:\n{tb}")
        raise RuntimeError(f"pytesseract.image_to_string failed: {e}")
