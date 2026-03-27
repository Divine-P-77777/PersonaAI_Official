"""
Background worker for embedding generation.
Processes document chunks and generates embeddings using Nomic V2-MoE.
"""
import uuid
from datetime import datetime
from backend.rag.embeddings import get_embeddings
from backend.database.connection import get_supabase_client
from backend.database.queries import get_chunks_by_document


async def generate_embeddings_for_document(document_id: str, bot_id: str):
    """Generate and store embeddings for all chunks of a document.

    Args:
        document_id: The document ID to process
        bot_id: The bot ID for multi-tenant filtering
    """
    supabase = get_supabase_client()
    embeddings_manager = get_embeddings()

    # Get existing chunks for this document
    chunks = await get_chunks_by_document(document_id)

    if not chunks:
        return 0

    # Prepare embedding records
    embedding_records = []
    chunk_ids_to_update = []

    for chunk in chunks:
        chunk_id = chunk["id"]
        chunk_text = chunk["chunk_text"]

        # Generate embedding
        embedding = embeddings_manager.embed_documents([chunk_text])[0]

        # Check if embedding already exists
        existing = supabase.table("document_embeddings").select("id").eq("chunk_id", chunk_id).execute()

        if existing.data:
            # Update existing embedding
            supabase.table("document_embeddings").update({
                "embedding": embedding,
                "model_name": "nomic-embed-text-v2-moe",
                "created_at": datetime.utcnow().isoformat()
            }).eq("chunk_id", chunk_id).execute()
        else:
            # Insert new embedding record
            embedding_records.append({
                "id": str(uuid.uuid4()),
                "chunk_id": chunk_id,
                "bot_id": bot_id,
                "embedding": embedding,
                "model_name": "nomic-embed-text-v2-moe",
                "created_at": datetime.utcnow().isoformat()
            })

    # Batch insert new embeddings
    if embedding_records:
        supabase.table("document_embeddings").insert(embedding_records).execute()

    return len(chunks)


async def process_pending_documents():
    """Process all documents without embeddings.

    Scans for documents that have chunks but no embeddings,
    and generates embeddings for them.
    """
    supabase = get_supabase_client()

    # Find documents with chunks but no embeddings
    # This requires a query that checks document_chunks exists but document_embeddings doesn't
    # For now, fetch all documents and check manually
    result = supabase.table("documents").select("id, bot_id").execute()

    processed_count = 0
    for doc in result.data:
        document_id = doc["id"]
        bot_id = doc["bot_id"]

        # Check if embeddings exist for this document's chunks
        chunks = await get_chunks_by_document(document_id)
        if not chunks:
            continue

        # Check if any chunk has embeddings
        has_embeddings = False
        for chunk in chunks:
            embedding = supabase.table("document_embeddings").select("id").eq("chunk_id", chunk["id"]).execute()
            if embedding.data:
                has_embeddings = True
                break

        if not has_embeddings:
            await generate_embeddings_for_document(document_id, bot_id)
            processed_count += 1

    return processed_count
