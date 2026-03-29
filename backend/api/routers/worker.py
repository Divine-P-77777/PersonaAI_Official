import base64
from fastapi import APIRouter, UploadFile, File, HTTPException
from celery import Celery
from backend.core.config import get_settings
from backend.rag.processors.image_processor import extract_text_from_image

router = APIRouter(prefix="/worker", tags=["Worker Queue"])
settings = get_settings()

celery_client = Celery(
    "personabot_worker",
    broker=settings.CELERY_BROKER_URL
)

celery_client.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    result_backend="rpc://"
)


@router.post("/test-ocr-async")
async def test_ocr_async_endpoint(file: UploadFile = File(...)):
    """
    Experimental route: Safely push an image to the separate Docker Celery pipeline via RabbitMQ
    without polluting or breaking the native synchronous FastAPI extraction logic.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Must be an image file")

    file_bytes = await file.read()
    b64_str = base64.b64encode(file_bytes).decode('utf-8')
    
    # Publish to broker
    task = celery_client.send_task(
        "tasks.extract_text_from_image", 
        args=[b64_str]
    )
    
    # Wait for RPC result to verify end-to-end communication
    try:
        text_result = task.get(timeout=30.0)
        return {
            "status": "success",
            "worker_task_id": task.id,
            "bytes_sent": len(file_bytes),
            "extracted_text": text_result
        }
    except Exception as e:
        return {
            "status": "failed",
            "worker_task_id": task.id,
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

