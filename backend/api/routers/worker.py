import base64
from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.core.celery_client import get_celery_app
from backend.rag.processors.ocr_fallback import perform_ocr_with_fallback
from backend.rag.processors.image_processor import extract_text_from_image
from backend.core.config import get_settings

router = APIRouter(prefix="/worker", tags=["Worker Queue"])
settings = get_settings()
celery_app = get_celery_app()


@router.post("/test-ocr-async")
async def test_ocr_async_endpoint(file: UploadFile = File(...)):
    """
    Experimental route: Safely push an image to the separate Docker Celery pipeline via RabbitMQ
    without polluting or breaking the native synchronous FastAPI extraction logic.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Must be an image file")

    file_bytes = await file.read()
    # 1. Use the unified fallback logic (Async Worker -> Local Failover)
    try:
        text_result = await perform_ocr_with_fallback(file_bytes, source_id=file.filename)
        return {
            "status": "success",
            "bytes_sent": len(file_bytes),
            "extracted_text": text_result
        }
    except Exception as e:
        return {
            "status": "failed",
            "error_detail": str(e)
        }


@router.post("/test-ocr-sync")
async def test_ocr_sync_endpoint(file: UploadFile = File(...)):
    """
    Direct synchronous OCR test: Uses the Tesseract engine currently installed on the FastAPI host.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Must be an image file")

    file_bytes = await file.read()
    
    try:
        text_result = await extract_text_from_image(file_bytes)
        return {
            "status": "success",
            "engine": "local_tesseract",
            "bytes_processed": len(file_bytes),
            "extracted_text": text_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Local OCR failed: {str(e)}")

