import json
import logging

logger = logging.getLogger(__name__)
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File, Form, WebSocket, WebSocketDisconnect
import asyncio
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
    get_bot_by_id,
    delete_data_source,
    get_data_source_by_id
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

@router.get("/{bot_id}/sources", response_model=List[DataSourceResponse])
async def list_bot_data_sources(
    bot_id: UUID,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """List all data sources for a bot."""
    token = user.get("_token")
    bot = await get_bot_by_id(str(bot_id), owner_id=user["id"], token=token)
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found or unauthorized")
        
    from backend.database.queries import get_data_sources_by_bot
    return await get_data_sources_by_bot(str(bot_id), token=token)

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

@router.websocket("/batch/{batch_id}/ws")
async def batch_status_websocket(websocket: WebSocket, batch_id: UUID):
    """Real-time SSE-like websocket stream for batch processing status."""
    await websocket.accept()
    
    # We do a simplified auth/session fetch via websocket or just rely on UUID obscurity for reading progress
    # In a full production app we'd validate the session token.
    try:
        while True:
            batch = await get_batch_by_id(str(batch_id))
            if not batch:
                await websocket.send_json({"error": "Batch not found"})
                break
                
            await websocket.send_json({
                "status": batch["status"],
                "total_files": batch["total_files"],
                "processed_files": batch["processed_files"],
                "error_log": batch.get("error_log", [])
            })
            
            if batch["status"] in (IngestionStatus.completed, IngestionStatus.failed):
                # Send one last time then close
                break
                
            await asyncio.sleep(1.5)
            
    except WebSocketDisconnect:
        logger.info(f"[WS] Client disconnected from batch {batch_id}")
    except Exception as e:
        logger.error(f"[WS] Error streaming batch status: {e}")
        try:
            await websocket.send_json({"error": str(e)})
        except:
            pass
    finally:
        try:
            await websocket.close()
        except:
            pass

@router.delete("/source/{source_id}")
async def delete_knowledge_source(
    source_id: UUID,
    user: Dict[str, Any] = Depends(require_alumni_role)
):
    """Delete a specific data source. Postgres ON DELETE CASCADE will wipe its data chunks."""
    token = user.get("_token")
    
    # Verify ownership indirectly by fetching source -> bot -> checking bot owner
    source = await get_data_source_by_id(str(source_id), token=token)
    if not source:
        raise HTTPException(status_code=404, detail="Data source not found")
        
    bot = await get_bot_by_id(source["bot_id"], owner_id=user["id"], token=token)
    if not bot:
        raise HTTPException(status_code=403, detail="Unauthorized to delete this source")
        
    success = await delete_data_source(str(source_id), token=token)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete data source")
        
    logger.info(f"[INGESTION] 🗑️ Deleted data source {source_id} (Cascade wiped chunks)")
    return {"status": "success", "message": "Source deleted"}
