import logging
import traceback
import uuid
from datetime import datetime
from typing import List, Optional

from backend.database.models import IngestionStatus, SourceType
from backend.database.queries import (
    insert_data_chunks,
    update_data_source_status,
)
from backend.rag.processors import extract_text
from backend.rag.chunking import chunk_text
from backend.rag.embeddings import get_embeddings

logger = logging.getLogger(__name__)

async def ingest_source(
    bot_id: str,
    source_id: str,
    source_type: SourceType,
    *,
    content: Optional[str] = None,
    url: Optional[str] = None,
    raw_bytes: Optional[bytes] = None,
    token: Optional[str] = None,
) -> int:
    """Orchestrate the ingestion of a single data source.
    
    1. Extract text from the source (PDF, Image, Text, Web).
    2. Chunk the extracted text.
    3. Generate embeddings for the chunks.
    4. Store chunks and embeddings in the database.
    5. Update data source status.
    """
    try:
        # Update status to processing
        await update_data_source_status(source_id, IngestionStatus.processing, token=token)

        # 1. Fetch file bytes if it's a file type and only URL is provided
        if source_type in (SourceType.pdf, SourceType.image) and not raw_bytes and url:
            logger.info(f"[INGEST] Fetching file bytes from URL for source {source_id}")
            try:
                import httpx
                async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
                    response = await client.get(url)
                    response.raise_for_status()
                    raw_bytes = response.content
                    logger.info(f"[INGEST] Fetched {len(raw_bytes)} bytes for source {source_id} (content-type: {response.headers.get('content-type', 'unknown')})")
            except Exception as fetch_err:
                raise RuntimeError(f"Failed to download file from URL '{url}': {fetch_err}")

        if source_type in (SourceType.pdf, SourceType.image) and not raw_bytes:
            raise ValueError(f"No raw bytes available for {source_type.value} source — file was not uploaded or URL is missing")

        # 2. Extract plain text
        logger.info(f"[INGEST] Extracting text from source {source_id} (type={source_type.value})")
        extracted_text = await extract_text(
            source_type,
            content=content,
            url=url,
            raw_bytes=raw_bytes
        )

        if not extracted_text.strip():
            raise ValueError("The provided source did not contain any readable text.")
        
        logger.info(f"[INGEST] Extracted {len(extracted_text)} characters from source {source_id}")

        # 2. Chunk text
        chunks = chunk_text(extracted_text)
        logger.info(f"[INGEST] Chunked into {len(chunks)} chunk(s) for source {source_id}")
        
        if not chunks:
            raise ValueError("Text split resulted in zero chunks")

        # 3. Generate embeddings
        logger.info(f"[INGEST] Generating embeddings for {len(chunks)} chunks...")
        embeddings_manager = get_embeddings()
        embeddings = embeddings_manager.embed_documents(chunks)
        logger.info(f"[INGEST] Embeddings generated (dim={len(embeddings[0])} each)")

        # 4. Store in database (data_chunks table)
        chunk_records = []
        for i, (text_content, embedding) in enumerate(zip(chunks, embeddings)):
            chunk_records.append({
                "id": str(uuid.uuid4()),
                "data_source_id": source_id,
                "bot_id": bot_id,
                "chunk_index": i,
                "content": text_content,
                "embedding": list(embedding),
                "metadata": {
                    "source_id": source_id,
                    "type": source_type,
                    "timestamp": datetime.utcnow().isoformat()
                },
                "created_at": datetime.utcnow().isoformat()
            })

        # 4. Store in database (data_chunks table)
        logger.info(f"[INGEST] Writing {len(chunk_records)} chunks to DB for source {source_id}")
        await insert_data_chunks(chunk_records, token=token)

        # 5. Final status update
        await update_data_source_status(source_id, IngestionStatus.completed, token=token)
        logger.info(f"[INGEST] ✅ Source {source_id} ingested successfully — {len(chunks)} chunks stored")
        
        return len(chunks)

    except Exception as e:
        err_msg = str(e) or repr(e) or type(e).__name__
        full_tb = traceback.format_exc()
        logger.error(f"Ingestion failed for source {source_id}: {err_msg}")
        logger.error(f"Full traceback:\n{full_tb}")
        await update_data_source_status(source_id, IngestionStatus.failed, error=err_msg, token=token)
        raise
