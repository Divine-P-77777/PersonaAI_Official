import logging
from backend.database.queries import search_similar_chunks
from backend.rag.embeddings import get_embeddings

logger = logging.getLogger(__name__)


async def retrieve_similar_chunks(
    bot_id: str,
    query_text: str,
    top_k: int = 5,
    similarity_threshold: float = 0.3,
    token: str = None,
) -> list[dict]:
    """Retrieve top-K similar chunks for a bot using pgvector.
    
    Uses the match_data_chunks RPC function via the database layer.
    Token is passed to use the user's auth context for RLS compliance.
    """
    # Generate embedding for the query
    embeddings_manager = get_embeddings()
    query_embedding = embeddings_manager.embed_query(query_text)

    # Call the database layer (search_similar_chunks)
    chunks = await search_similar_chunks(
        bot_id=bot_id,
        query_embedding=query_embedding,
        top_k=top_k,
        similarity_threshold=similarity_threshold,
        token=token,
    )

    # Diagnostic logging: what chunks did we actually get?
    if chunks:
        for i, chunk in enumerate(chunks):
            snippet = chunk.get("content", "")[:100].replace("\n", " ")
            score = chunk.get("similarity", 0)
            logger.info(f"[RETRIEVAL] Chunk {i} (Score: {score:.4f}): {snippet}...")
    else:
        logger.info(f"[RETRIEVAL] No chunks retrieved for bot {bot_id} | threshold={similarity_threshold}")

    return chunks


async def retrieve_context(bot_id: str, query_text: str, top_k: int = 5) -> str:
    """Retrieve and format context for RAG."""
    chunks = await retrieve_similar_chunks(bot_id, query_text, top_k)

    if not chunks:
        return "No relevant context found."

    context_parts = []
    for chunk in chunks:
        context_parts.append(chunk.get("content", chunk.get("chunk_text", "")))

    return "\n\n".join(context_parts)
