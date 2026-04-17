import io
import os
import base64
import logging
import pytesseract
from PIL import Image, UnidentifiedImageError

from celery_worker.celery_app import celery_app

# Configure Tesseract Path for Windows
tesseract_path = os.environ.get("TESSERACT_PATH")
if tesseract_path:
    pytesseract.pytesseract.tesseract_cmd = tesseract_path

logger = logging.getLogger(__name__)

@celery_app.task(name="tasks.extract_text_from_image")
def extract_text_from_image_task(file_content_b64: str) -> str:
    """
    Extract text from image using Tesseract OCR (Asynchronous Worker).
    The image is sent as a base64 string over robust AMQP/JSON protocol.
    """
    try:
        logger.info("[WORKER] Received image payload for OCR processing.")
        
        # Decode base64 to raw bytes
        file_bytes = base64.b64decode(file_content_b64)
        
        # Load image into Pillow
        img = Image.open(io.BytesIO(file_bytes))
        img = img.convert("RGB")
        
        # Process OCR using Tesseract natively installed in the Debian container
        text = pytesseract.image_to_string(img)
        
        logger.info(f"[WORKER] Successfully extracted {len(text)} characters of text.")
        return text

    except UnidentifiedImageError as e:
        error_msg = f"Cannot identify image file format: {e}"
        logger.error(f"[WORKER ERROR] {error_msg}")
        return f"ERROR: {error_msg}"
        
    except Exception as e:
        logger.exception("[WORKER] Unhandled exception during OCR:")
        return f"ERROR: OCR failed internally: {str(e)}"
