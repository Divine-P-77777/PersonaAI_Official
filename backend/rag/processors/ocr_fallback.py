import base64
import logging
import pytesseract
import traceback
from typing import Optional
from celery.exceptions import TimeoutError as CeleryTimeoutError
from backend.core.celery_client import get_celery_app

logger = logging.getLogger(__name__)
celery_app = get_celery_app()

async def perform_ocr_with_fallback(
    img_bytes: bytes, 
    source_id: str = "unknown",
    timeout: float = 5.0
) -> str:
    """
    Attempt to offload OCR to the Celery worker.
    If the worker is down, times out, or fails, fallback to local Tesseract.
    """
    # 1. Try Celery Worker First (Isolated OCR)
    try:
        logger.info(f"[OCR_FALLBACK] 📤 Attempting async OCR for source {source_id} via worker...")
        
        # Encode image to Base64 for the AMQP payload
        b64_str = base64.b64encode(img_bytes).decode('utf-8')
        
        # Dispatch task to the queue
        task = celery_app.send_task(
            "tasks.extract_text_from_image", 
            args=[b64_str]
        )
        
        # Wait for the result from the worker (with timeout)
        # Using .get() for the result; task.status will be tracked
        text_result = task.get(timeout=timeout)
        
        if text_result and not text_result.startswith("ERROR:"):
            logger.info(f"[OCR_FALLBACK] ✅ Worker OCR successful for source {source_id}")
            return text_result
        else:
            logger.warning(f"[OCR_FALLBACK] ⚠️ Worker returned an error: {text_result}. Falling back...")
            
    except CeleryTimeoutError:
        logger.warning(f"[OCR_FALLBACK] ⚠️ Worker task timed out after {timeout}s for source {source_id}. Falling back...")
    except Exception as e:
        logger.warning(f"[OCR_FALLBACK] ⚠️ Worker dispatch failed (Is RabbitMQ up?): {str(e)}. Falling back locally...")

    # 2. Local Fallback (Host Tesseract)
    try:
        logger.info(f"[OCR_FALLBACK] 📥 Running LOCAL Tesseract OCR for source {source_id}...")
        
        # Import local processing logic (already in backend/rag/processors/image_processor.py)
        # We perform it directly here to ensure local extraction is synchronous and guaranteed.
        import io
        from PIL import Image
        
        img = Image.open(io.BytesIO(img_bytes))
        img = img.convert("RGB")
        text = pytesseract.image_to_string(img)
        
        if text.strip():
            logger.info(f"[OCR_FALLBACK] 🏁 LOCAL OCR successful for source {source_id}")
            return text
        else:
            logger.warning(f"[OCR_FALLBACK] ⚠️ LOCAL OCR resulted in empty text for source {source_id}")
            return ""
            
    except Exception as local_err:
        tb = traceback.format_exc()
        logger.error(f"[OCR_FALLBACK] ❌ LOCAL OCR also failed for source {source_id}: {str(local_err)}")
        logger.debug(f"Local OCR Traceback:\n{tb}")
        # If even local fails, we bubble up the error or return empty
        raise RuntimeError(f"OCR failed for source {source_id} (both Worker and Local attempts): {local_err}")
