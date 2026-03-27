import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from backend.core.config import get_settings
from backend.core.security import get_current_user
from backend.database.queries import get_bot_by_id
from backend.rag.retrieval import retrieve_similar_chunks
from backend.rag.context_builder import build_context

logger = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter()


class ChatMessage(BaseModel):
    message: str


@router.post("/{bot_id}")
async def chat_with_bot(
    bot_id: str,
    body: ChatMessage,
    user: dict = Depends(get_current_user),
):
    """Send a message and receive a streaming RAG-powered response from a bot."""
    # 1. Verify bot access
    bot = await get_bot_by_id(bot_id, token=user.get("_token"))
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found or inaccessible")

    if bot["status"] != "ready" and bot["owner_id"] != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This persona is currently paused by the author."
        )

    user_message = body.message
    logger.info(f"[CHAT] Bot={bot_id} | User={user['id']} | Message='{user_message[:80]}'")

    # 2. Retrieve relevant chunks via pgvector
    try:
        chunks = await retrieve_similar_chunks(
            bot_id, user_message,
            top_k=settings.TOP_K_RESULTS,
            token=user.get("_token")
        )
        chunk_texts = [c.get("content", c.get("chunk_text", "")) for c in chunks]
        print(f"[CHAT-DEBUG] Retrieved {len(chunk_texts)} chunks for bot {bot_id}")
        logger.info(f"[CHAT] Retrieved {len(chunk_texts)} chunks for bot {bot_id}")
    except Exception as e:
        import traceback
        err = repr(e) or str(e) or type(e).__name__
        tb = traceback.format_exc()
        print(f"[CHAT-DEBUG] RAG FAILED: {err}")
        print(f"[CHAT-DEBUG] TRACEBACK:\n{tb}")
        logger.warning(f"[CHAT] RAG retrieval failed (answering without context): {err}")
        chunk_texts = []

    # 3. Build persona-aware system prompt
    system_prompt = build_context(
        persona_config=bot.get("persona_config", {}),
        chunks=chunk_texts,
        bot_name=bot["name"]
    )

    # 4. Stream response via langchain_groq ChatGroq
    async def generate():
        try:
            llm = ChatGroq(
                model=settings.LLM_MODEL,
                api_key=settings.GROQ_API_KEY,
                temperature=0.7,
                max_tokens=1024,
                streaming=True,
            )
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_message),
            ]
            async for chunk in llm.astream(messages):
                token = chunk.content
                if token:
                    yield f"data: {json.dumps({'token': token})}\n\n"

            yield "data: [DONE]\n\n"
            logger.info(f"[CHAT] ✅ Stream complete for bot {bot_id}")

        except Exception as e:
            logger.error(f"[CHAT] ❌ LLM streaming failed: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


@router.get("/{bot_id}/history")
async def get_chat_history(
    bot_id: str,
    user: dict = Depends(get_current_user),
):
    """Get chat history for a bot session."""
    bot = await get_bot_by_id(bot_id, token=user.get("_token"))
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found or inaccessible")

    if bot["status"] != "ready" and bot["owner_id"] != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This persona is currently paused by the author."
        )

    return {"bot_id": bot_id, "history": []}


@router.get("/{bot_id}/debug-retrieval")
async def debug_retrieval(
    bot_id: str,
    q: str = "Stanford University education",
    threshold: float = 0.0,
):
    """Direct retrieval debug — returns raw similarity scores with no threshold filtering. NO AUTH."""
    from backend.rag.embeddings import get_embeddings
    from backend.database.connection import get_supabase_client
    import traceback

    try:
        embeddings_manager = get_embeddings()
        query_embedding = embeddings_manager.embed_query(q)
        print(f"[DEBUG] Generated embedding for: '{q}' (dim={len(query_embedding)})")

        supabase = get_supabase_client()
        result = supabase.rpc("match_data_chunks", {
            "query_embedding": query_embedding,
            "match_bot_id": bot_id,
            "match_count": 10,
            "similarity_threshold": threshold
        }).execute()

        chunks = result.data or []
        print(f"[DEBUG] RPC returned {len(chunks)} chunks for bot {bot_id} at threshold={threshold}")

        return {
            "bot_id": bot_id,
            "query": q,
            "threshold_used": threshold,
            "embedding_dim": len(query_embedding),
            "total_matches": len(chunks),
            "chunks": [
                {
                    "similarity": c.get("similarity"),
                    "content_preview": c.get("content", "")[:200]
                }
                for c in chunks
            ]
        }
    except Exception as e:
        tb = traceback.format_exc()
        return {"error": repr(e), "traceback": tb}
