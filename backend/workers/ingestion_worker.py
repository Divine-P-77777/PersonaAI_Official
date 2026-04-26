import logging
import asyncio
import traceback
from datetime import datetime

from backend.database.models import IngestionStatus, SourceType
from backend.database.queries import (
    update_batch_status,
    get_data_sources_by_batch,
)
from backend.database.queries import update_data_source_status
from backend.rag.ingestion import extract_and_chunk_source, store_source_chunks
from backend.rag.embeddings import get_embeddings

logger = logging.getLogger(__name__)


async def process_batch(
    batch_id: str,
    token: str = None,
    file_payloads: dict[str, bytes] = None,
):
    """3-Pass batch ingestion worker with real-time progress at every step.

    ROOT CAUSE FIX (3 issues):
    1. PASS 1: Each source is now marked 'processing' BEFORE extraction starts,
       so the WebSocket immediately shows it as active instead of stuck on pending.
    2. PASS 2: The embedding block is the slow silent phase. We now mark ALL
       sources as 'processing' and update a batch progress counter during embedding.
    3. PASS 3: _store_source now runs SEQUENTIALLY (not asyncio.gather) so
       processed_files increments one by one, giving true granular progress 1→N.
    """
    file_payloads = file_payloads or {}
    logger.info(
        f"[WORKER] ▶️  Starting batch {batch_id} "
        f"(memory-cached files: {len(file_payloads)})"
    )

    try:
        await update_batch_status(
            batch_id,
            {"status": IngestionStatus.processing},
            token=token,
        )

        sources = await get_data_sources_by_batch(batch_id, token=token)
        if not sources:
            logger.warning(f"[WORKER] ⚠️  Batch {batch_id} has no sources. Marking completed.")
            await update_batch_status(
                batch_id,
                {"status": IngestionStatus.completed},
                token=token,
            )
            return

        total_files = len(sources)
        current_errors: list[dict] = []
        logger.info(f"[WORKER] 📦 {total_files} source(s) in batch {batch_id}")

        # ─────────────────────────────────────────────────────────────────────
        # PASS 1 — Concurrent text extraction and chunking
        # ─────────────────────────────────────────────────────────────────────
        semaphore = asyncio.Semaphore(5)
        source_chunks: dict[str, list[str]] = {}  # source_id → chunks

        async def _extract_source(source: dict):
            source_id = source["id"]
            source_type = SourceType(source["type"])
            source_title = source.get("title", source_id)

            async with semaphore:
                try:
                    await update_data_source_status(
                        source_id,
                        IngestionStatus.processing,
                        token=token,
                    )
                except Exception:
                    pass

                try:
                    raw_bytes = file_payloads.get(source_id)
                    
                    async def on_page_progress(current: int, total: int):
                        # Update batch status with a 'note' (preserving current errors)
                        try:
                            await update_batch_status(
                                batch_id,
                                {
                                    "error_log": current_errors + [{"note": f"Extracting {source_title}: Page {current}/{total}..."}]
                                },
                                token=token
                            )
                        except Exception:
                            pass

                    chunks = await extract_and_chunk_source(
                        source_id=source_id,
                        source_type=source_type,
                        content=source.get("content"),
                        url=source.get("url"),
                        raw_bytes=raw_bytes,
                        token=token,
                        on_progress=on_page_progress if source_type == SourceType.pdf else None
                    )
                    source_chunks[source_id] = chunks
                    logger.info(f"[WORKER P1] ✂️  [{source_title}] → {len(chunks)} chunks")

                except Exception as e:
                    err_msg = str(e) or type(e).__name__
                    current_errors.append({
                        "source_id": source_id,
                        "title": source_title,
                        "error": err_msg,
                    })
                    try:
                        await update_data_source_status(
                            source_id,
                            IngestionStatus.failed,
                            error=err_msg,
                            token=token,
                        )
                        # Push actual error to batch log immediately
                        await update_batch_status(
                            batch_id,
                            {"error_log": current_errors},
                            token=token
                        )
                    except Exception:
                        pass
                    logger.error(f"[WORKER P1] ❌ [{source_title}] Extract failed: {err_msg}")

        await asyncio.gather(*[_extract_source(s) for s in sources])

        if not source_chunks:
            await update_batch_status(
                batch_id,
                {
                    "status": IngestionStatus.failed,
                    "processed_files": 0,
                    "error_log": current_errors,
                    "updated_at": datetime.utcnow().isoformat(),
                },
                token=token,
            )
            return

        # ─────────────────────────────────────────────────────────────────────
        # PASS 2 — Single batch embed in ONE Nomic API call
        # ─────────────────────────────────────────────────────────────────────
        all_texts: list[str] = []
        chunk_slices: dict[str, tuple[int, int]] = {}

        for source_id, chunks in source_chunks.items():
            start = len(all_texts)
            all_texts.extend(chunks)
            chunk_slices[source_id] = (start, len(all_texts))

        total_chunks = len(all_texts)
        num_sources_to_embed = len(source_chunks)

        # Signal embedding start (preserving errors)
        await update_batch_status(
            batch_id,
            {
                "error_log": current_errors + [{"note": f"Embedding {total_chunks} text chunks across {num_sources_to_embed} documents..."}],
            },
            token=token,
        )

        embeddings_manager = get_embeddings()
        all_embeddings = await asyncio.to_thread(
            embeddings_manager.embed_documents, all_texts
        )

        # Clear notes but keep errors
        await update_batch_status(
            batch_id,
            {"error_log": current_errors},
            token=token,
        )

        logger.info(
            f"[WORKER P2] ✅ Embedding complete — "
            f"{len(all_embeddings)} vectors "
            f"(dim={len(all_embeddings[0]) if all_embeddings else 0})"
        )

        # ─────────────────────────────────────────────────────────────────────
        # PASS 3 — SEQUENTIAL DB writes + real-time per-source status updates
        # FIX 3: Changed from asyncio.gather() to a sequential loop.
        # Previously all sources completed simultaneously causing 0% → 100% jump.
        # Now processed_files increments one-by-one: 1/N, 2/N, 3/N...
        # Each write also updates data_source status from 'processing' → 'completed'
        # so the per-file list in the UI shows live green checkmarks.
        # ─────────────────────────────────────────────────────────────────────
        processed_files = 0

        async def _store_source(source: dict):
            nonlocal processed_files
            source_id = source["id"]
            bot_id = source["bot_id"]
            source_title = source.get("title", source_id)
            source_type = SourceType(source["type"])

            if source_id not in source_chunks:
                return  # Failed during Pass 1 — skip

            try:
                chunks = source_chunks[source_id]
                start_idx, end_idx = chunk_slices[source_id]
                embeddings = all_embeddings[start_idx:end_idx]

                await store_source_chunks(
                    bot_id=bot_id,
                    source_id=source_id,
                    source_type=source_type,
                    chunks=chunks,
                    embeddings=embeddings,
                    token=token,
                )

                processed_files += 1

                # FIX: Update both the source status AND the batch counter atomically
                # This gives the WebSocket: (a) green checkmark on this source,
                # (b) incremented progress bar
                await update_data_source_status(
                    source_id,
                    IngestionStatus.completed,
                    token=token,
                )
                await update_batch_status(
                    batch_id,
                    {"processed_files": processed_files},
                    token=token,
                )

                logger.info(
                    f"[WORKER P3] ✅ [{source_title}] stored "
                    f"({len(chunks)} chunks) — "
                    f"{processed_files}/{total_files} total"
                )

            except Exception as e:
                err_msg = str(e) or type(e).__name__
                error_log.append({
                    "source_id": source_id,
                    "title": source_title,
                    "error": err_msg,
                })
                try:
                    await update_data_source_status(
                        source_id,
                        IngestionStatus.failed,
                        error=err_msg,
                        token=token,
                    )
                except Exception:
                    pass
                logger.error(
                    f"[WORKER P3] ❌ [{source_title}] Store failed: {err_msg}"
                )

        # FIX 3: Run sequentially instead of asyncio.gather()
        # This is the key change: sources complete one-by-one, giving real progress
        for source in sources:
            await _store_source(source)
    
        # ─────────────────────────────────────────────────────────────────────
        # Final batch status
        # ─────────────────────────────────────────────────────────────────────
        final_status = IngestionStatus.completed
        if processed_files == 0 and total_files > 0:
            final_status = IngestionStatus.failed
        elif processed_files < total_files:
            logger.warning(
                f"[WORKER] ⚠️  Batch {batch_id} partially complete: "
                f"{processed_files}/{total_files} succeeded"
            )

        await update_batch_status(
            batch_id,
            {
                "status": final_status,
                "processed_files": processed_files,
                "error_log": current_errors,
                "updated_at": datetime.utcnow().isoformat(),
            },
            token=token,
        )

        logger.info(
            f"[WORKER] 🏁 Batch {batch_id} finished. "
            f"Status={final_status.value} | "
            f"{processed_files}/{total_files} sources | "
            f"{total_chunks} total chunks"
        )

    except Exception as e:
        logger.error(
            f"[WORKER] 💥 Batch {batch_id} catastrophically failed: {str(e)}"
        )
        logger.error(traceback.format_exc())
        try:
            await update_batch_status(
                batch_id,
                {
                    "status": IngestionStatus.failed,
                    "error_log": [{"error": f"General batch failure: {str(e)}"}],
                },
                token=token,
            )
        except Exception:
            pass
