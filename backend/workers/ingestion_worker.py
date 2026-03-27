import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from backend.database.models import IngestionStatus, SourceType
from backend.database.queries import (
    get_batch_by_id,
    get_data_source_by_id,  # I'll add this to queries.py if missing, or use get_data_sources_by_batch
    update_batch_status,
    get_data_sources_by_batch
)
from backend.rag.ingestion import ingest_source

logger = logging.getLogger(__name__)

async def process_batch(batch_id: str, token: str = None, file_payloads: dict[str, bytes] = None):
    """Background worker to process all data sources in a batch.
    
    1. Fetch all data sources in the batch.
    2. Sequentially (or in parallel) ingest each source.
    3. Update the batch status (total vs. processed).
    4. Handle errors and update the batch error log.
    """
    file_payloads = file_payloads or {}
    logger.info(f"[WORKER] ▶️  Starting batch {batch_id} (cached files: {len(file_payloads)})")
    try:
        # Update batch status to processing
        await update_batch_status(batch_id, {"status": IngestionStatus.processing}, token=token)
        
        # Get data sources
        sources = await get_data_sources_by_batch(batch_id, token=token)
        if not sources:
            logger.warning(f"[WORKER] ⚠️  Batch {batch_id} has no sources. Marking as completed.")
            await update_batch_status(batch_id, {"status": IngestionStatus.completed}, token=token)
            return

        total_files = len(sources)
        processed_files = 0
        error_log = []

        logger.info(f"[WORKER] 📦 Processing {total_files} source(s) in batch {batch_id}")

        for i, source in enumerate(sources):
            source_id = source["id"]
            bot_id = source["bot_id"]
            source_type = SourceType(source["type"])
            source_title = source.get("title", source_id)
            
            logger.info(f"[WORKER] [{i+1}/{total_files}] Processing source '{source_title}' (type={source_type.value})")
            
            try:
                # Ingest source (it handles chunks and embeddings)
                # Pass raw_bytes from memory if available to bypass Cloudinary download
                cached_bytes = file_payloads.get(source_id)
                if cached_bytes:
                    logger.info(f"[WORKER] [{i+1}/{total_files}] Processing '{source_title}' using memory-cached bytes ({len(cached_bytes)} bytes)")
                
                chunk_count = await ingest_source(
                    bot_id=bot_id,
                    source_id=source_id,
                    source_type=source_type,
                    content=source.get("content"),
                    url=source.get("url"),
                    raw_bytes=cached_bytes,
                    token=token
                )
                processed_files += 1
                logger.info(f"[WORKER] ✅ Source '{source_title}' processed successfully → {chunk_count} chunks stored")

                # Update processed count in real time
                await update_batch_status(batch_id, {
                    "processed_files": processed_files,
                }, token=token)

            except Exception as e:
                import traceback
                err_msg = str(e) or type(e).__name__
                full_tb = traceback.format_exc()
                error_item = {"source_id": source_id, "error": err_msg}
                error_log.append(error_item)
                logger.error(f"[WORKER] ❌ Source '{source_title}' failed: {err_msg}")
                logger.debug(f"[WORKER] Full traceback for '{source_title}':\n{full_tb}")

        # Update batch final status
        final_status = IngestionStatus.completed
        if processed_files == 0 and total_files > 0:
            final_status = IngestionStatus.failed
        elif processed_files < total_files:
            logger.warning(f"[WORKER] ⚠️  Batch {batch_id} partially complete: {processed_files}/{total_files} succeeded")

        await update_batch_status(batch_id, {
            "status": final_status,
            "processed_files": processed_files,
            "error_log": error_log,
            "updated_at": datetime.utcnow().isoformat()
        }, token=token)

        logger.info(f"[WORKER] 🏁 Batch {batch_id} finished. Status={final_status.value} ({processed_files}/{total_files} processed)")

    except Exception as e:
        logger.error(f"[WORKER] 💥 Batch {batch_id} catastrophically failed: {str(e)}")
        await update_batch_status(batch_id, {
            "status": IngestionStatus.failed,
            "error_log": [{"error": f"General batch failure: {str(e)}"}]
        }, token=token)
