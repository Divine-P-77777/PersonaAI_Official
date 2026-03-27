import json
import logging

logger = logging.getLogger(__name__)
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File, Form
from typing import List, Dict, Any, Optional
from uuid import UUID

from backend.core.security import get_current_user, require_alumni_role
from backend.api.schemas.ingestion import (
    BatchIngestionRequest, 
    BatchStatusResponse, 
    DataSourceResponse,
    DataSourceCreate
)
from backend.database.queries import (
    create_ingestion_batch,
    create_data_sources,
    get_batch_by_id,
    get_batches_by_bot,
    get_bot_by_id
)
from backend.workers.ingestion_worker import process_batch
from backend.database.models import IngestionStatus, SourceType
from backend.core.storage import upload_to_cloudinary

router = APIRouter()

@router.post("/{bot_id}/batch", response_model=BatchStatusResponse)
async def create_ingestion_batch_endpoint(
    bot_id: UUID,
    background_tasks: BackgroundTasks,
    request: str = Form(...), # JSON string of BatchIngestionRequest
    files: List[UploadFile] = File(None),
    user: Dict[str, Any] = Depends(require_alumni_role)
):
    """Submit multiple data sources (array) for ingestion.
    
    If PDFs/Images are included, they are uploaded to Cloudinary.
    """
    # 0. Parse the JSON request metadata
    try:
        request_obj = BatchIngestionRequest.model_validate_json(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid request metadata: {str(e)}")

    # 1. Verify bot ownership
    token = user.get("_token")
    bot = await get_bot_by_id(str(bot_id), owner_id=user["id"], token=token)
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found or unauthorized")

    # 2. Create the batch record
    batch_data = {
        "bot_id": str(bot_id),
        "status": IngestionStatus.pending,
        "total_files": len(request_obj.sources),
        "processed_files": 0,
        "error_log": []
    }
    batch = await create_ingestion_batch(batch_data, token=token)
    batch_id = batch["id"]
    logger.info(f"[INGESTION] 🚀 Batch {batch_id} created for bot {bot_id} with {len(request_obj.sources)} source(s)")

    # 3. Process sources and handle file uploads
    sources_data = []
    file_payloads = {} # Map source.title -> bytes (temp) then source.id -> bytes (final)
    
    # Map files by filename for easy lookup
    file_map = {f.filename: f for f in (files or [])}

    for src in request_obj.sources:
        source_entry = {
            "bot_id": str(bot_id),
            "batch_id": batch_id,
            "type": src.type,
            "title": src.title,
            "content": src.content,
            "url": src.url,
            "status": IngestionStatus.pending,
            "metadata": {}
        }

        # If it's a file type and we have a matching file
        if src.type in (SourceType.pdf, SourceType.image):
            file_obj = file_map.get(src.title) or (files[0] if files and len(files) == 1 else None)
            
            if file_obj:
                try:
                    content = await file_obj.read()
                    # Cache the bytes in memory to avoid redundant download in the worker
                    file_payloads[src.title] = content
                    
                    secure_url = await upload_to_cloudinary(content, folder=f"bots/{bot_id}")
                    source_entry["url"] = secure_url
                    source_entry["title"] = file_obj.filename
                    source_entry["file_size"] = len(content)
                    logger.info(f"[INGESTION] ✅ File '{file_obj.filename}' uploaded to Cloudinary successfully (cached {len(content)} bytes)")
                except Exception as e:
                    source_entry["status"] = IngestionStatus.failed
                    source_entry["error_message"] = f"File upload failed: {str(e)}"
                    logger.error(f"[INGESTION] ❌ File upload failed for '{src.title}': {str(e)}")
            elif not src.url:
                source_entry["status"] = IngestionStatus.failed
                source_entry["error_message"] = "File missing in upload and no URL provided"
                logger.warning(f"[INGESTION] ⚠️  Source '{src.title}' skipped — no file or URL provided")

        sources_data.append(source_entry)
    
    created_sources = await create_data_sources(sources_data, token=token)

    # 4. Map the cached file contents to the actual database source IDs
    final_payloads = {}
    for src in created_sources:
        if src["title"] in file_payloads:
            final_payloads[src["id"]] = file_payloads[src["title"]]
    
    # 5. Trigger background processing for the whole batch
    background_tasks.add_task(process_batch, batch_id, token=token, file_payloads=final_payloads)
    logger.info(f"[INGESTION] 🔄 Background worker dispatched for batch {batch_id} with {len(final_payloads)} memory-cached file(s)")

    return {
        **batch,
        "data_sources": [] 
    }

@router.get("/{bot_id}/batches", response_model=List[BatchStatusResponse])
async def list_ingestion_batches(
    bot_id: UUID,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """List all ingestion batches for a bot."""
    token = user.get("_token")
    bot = await get_bot_by_id(str(bot_id), owner_id=user["id"], token=token)
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found or unauthorized")
    return await get_batches_by_bot(str(bot_id), token=token)

@router.get("/batch/{batch_id}", response_model=BatchStatusResponse)
async def get_batch_status(
    batch_id: UUID,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Check the status of a specific ingestion batch."""
    token = user.get("_token")
    batch = await get_batch_by_id(str(batch_id), token=token)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    bot = await get_bot_by_id(batch["bot_id"], owner_id=user["id"], token=token)
    if not bot:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return batch
