import base64
import logging
import asyncio
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
    timeout: float = 60.0  # Increased to 60s to handle larger PDFs/Images
) -> str:
    """
    Attempt to offload OCR to the Celery worker.
    If the worker is down, times out, or fails, fallback to local Tesseract.
    """
    # 1. Try Celery Worker First (Isolated OCR)
    try:
        logger.info(f"[OCR_FALLBACK] 📤 Attempting async OCR for source {source_id} via worker (timeout={timeout}s)...")
        
        # Encode image to Base64 for the AMQP payload
        b64_str = base64.b64encode(img_bytes).decode('utf-8')
        
        # Dispatch task to the queue
        task = celery_app.send_task(
            "tasks.extract_text_from_image", 
            args=[b64_str]
        )
        
        # Wait for the result from the worker (offloaded to thread to avoid blocking event loop)
        text_result = await asyncio.to_thread(task.get, timeout=timeout)
        
        if text_result and not str(text_result).startswith("ERROR:"):
            logger.info(f"[OCR_FALLBACK] ✅ Worker OCR successful for source {source_id}")
            return text_result
        else:
            logger.warning(f"[OCR_FALLBACK] ⚠️ Worker returned empty or error result: '{text_result}'. Falling back...")
            
    except CeleryTimeoutError:
        logger.warning(f"[OCR_FALLBACK] ⚠️ Worker task TIMED OUT after {timeout}s for source {source_id}. Falling back to local...")
    except Exception as e:
        logger.warning(f"[OCR_FALLBACK] ⚠️ Worker dispatch/return failed: {str(e)}. Falling back locally...")

    # 2. Local Fallback (Host Tesseract)
    try:
        logger.info(f"[OCR_FALLBACK] 📥 Running LOCAL Tesseract OCR for source {source_id}...")
        
        # ── Cross-Platform Binary Path Correction ──
        # If the path in settings doesn't exist, it's likely a Windows path in a Linux env (or vice versa).
        # We try to use the system 'tesseract' command instead.
        import os
        from backend.core.config import get_settings
        settings = get_settings()
        
        current_cmd = pytesseract.pytesseract.tesseract_cmd
        if not os.path.exists(current_cmd) and current_cmd != "tesseract":
            logger.warning(f"[OCR_FALLBACK] ⚠️ Configured Tesseract path '{current_cmd}' NOT FOUND. Trying system default 'tesseract'...")
            pytesseract.pytesseract.tesseract_cmd = "tesseract"

        import io
        from PIL import Image
        
        img = Image.open(io.BytesIO(img_bytes))
        img = img.convert("RGB")
        # Offload CPU-intensive Tesseract call to thread pool
        text = await asyncio.to_thread(pytesseract.image_to_string, img)
        
        if text.strip():
            logger.info(f"[OCR_FALLBACK] 🏁 LOCAL OCR successful for source {source_id} ({len(text)} chars)")
            return text
        else:
            logger.warning(f"[OCR_FALLBACK] ⚠️ LOCAL OCR resulted in empty text for source {source_id}")
            return ""
            
    except Exception as local_err:
        tb = traceback.format_exc()
        logger.error(f"[OCR_FALLBACK] ❌ LOCAL OCR also failed for source {source_id}: {str(local_err)}")
        # Restore the original command if we changed it, just in case
        pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_PATH
        raise RuntimeError(f"OCR failed for source {source_id} (both Worker and Local attempts): {local_err}")
