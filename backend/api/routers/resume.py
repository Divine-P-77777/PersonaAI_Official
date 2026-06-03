import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from backend.core.config import get_settings
from backend.core.security import get_current_user
from backend.core.redis_client import get_cache, set_cache, invalidate_cache
from backend.database.queries import get_bot_by_id, save_message
from backend.database.payment_queries import (
    get_user_bot_access,
    get_monthly_exploration,
    create_free_trial_access,
    consume_credits,
    upsert_monthly_exploration,
)
from backend.payments.pricing_config import (
    FREE_EXPLORATION,
    CREDIT_COSTS,
)
from backend.rag.processors.pdf_processor import extract_text_from_pdf
from backend.rag.processors.image_processor import extract_text_from_image
from backend.rag.context_builder import build_context

logger = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter()


@router.post("/review/{bot_id}")
async def upload_and_review_resume(
    bot_id: str,
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """
    Upload a resume (PDF/Image), extract text (highly optimized OCR fallback),
    validate and deduct 4 credits under the 'resume_analysis' action,
    query the mentor-persona Groq LLM, and persist the results in the chat timeline.
    """
    user_id = user["id"]
    token = user.get("_token")

    # 1. Fetch Bot Configuration (Cache-Optimized)
    bot_cache_key = f"bot_config:{bot_id}"
    bot = await get_cache(bot_cache_key)
    if bot is None:
        logger.info(f"[RESUME] Cache MISS for {bot_cache_key}. Querying Supabase...")
        bot = await get_bot_by_id(bot_id, token=token)
        if bot:
            await set_cache(bot_cache_key, bot, expire=3600)
    else:
        logger.info(f"[RESUME] ⚡ Cache HIT for {bot_cache_key}. Using fast Redis bot config.")

    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found or inaccessible"
        )

    if bot["status"] != "ready" and bot["owner_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This persona is currently paused by the author."
        )

    # 2. Credit-Guard boundary check & atomic consumption (Cost: 4 credits)
    is_owner = (bot["owner_id"] == user_id)
    is_free_bot = bot.get("is_free", True)
    credit_cost = CREDIT_COSTS.get("resume_analysis", 4)

    if not is_owner and not is_free_bot:
        now = datetime.now(tz=timezone.utc)
        access = await get_user_bot_access(user_id, bot_id, token=token)

        if access:
            # Check expiration
            expires_at = access.get("access_expires_at")
            if expires_at:
                from dateutil import parser as dateparser
                exp_dt = dateparser.parse(expires_at) if isinstance(expires_at, str) else expires_at
                if exp_dt < now:
                    raise HTTPException(
                        status_code=status.HTTP_402_PAYMENT_REQUIRED,
                        detail={
                            "code": "ACCESS_EXPIRED",
                            "message": "Your access to this mentor has expired.",
                            "unlock_price": bot.get("unlock_price"),
                        }
                    )

            # Check sufficient remaining credits
            credits_remaining = access["credits_allowed"] - access["credits_used"]
            if credits_remaining < credit_cost:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail={
                        "code": "INSUFFICIENT_CREDITS",
                        "message": "You've used all your credits for this mentor.",
                        "unlock_price": bot.get("unlock_price"),
                        "credits_remaining": credits_remaining,
                    }
                )
        else:
            # No existing access — check monthly trial exploration eligibility
            exploration = await get_monthly_exploration(user_id, token=token)
            explored_bots: list = (exploration or {}).get("mentors_explored", []) or []

            if bot_id not in explored_bots:
                if len(explored_bots) >= FREE_EXPLORATION.max_mentors_per_month:
                    raise HTTPException(
                        status_code=status.HTTP_402_PAYMENT_REQUIRED,
                        detail={
                            "code": "EXPLORATION_LIMIT_REACHED",
                            "message": (
                                f"You've explored your monthly limit of "
                                f"{FREE_EXPLORATION.max_mentors_per_month} mentors. "
                                f"Unlock this mentor to continue."
                            ),
                            "unlock_price": bot.get("unlock_price"),
                        }
                    )

                # Grant free trial access
                trial_expires = now + timedelta(days=7)
                access = await create_free_trial_access(
                    user_id=user_id,
                    bot_id=bot_id,
                    credits_allowed=FREE_EXPLORATION.free_credits_per_mentor,
                    expires_at=trial_expires,
                    token=token,
                )
                await upsert_monthly_exploration(user_id, bot_id, token=token)
                logger.info(
                    "[RESUME] Free trial granted | user=%s | bot=%s | credits=%d",
                    user_id, bot_id, FREE_EXPLORATION.free_credits_per_mentor,
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail={
                        "code": "TRIAL_EXHAUSTED",
                        "message": "Your free trial for this mentor has ended. Unlock to continue.",
                        "unlock_price": bot.get("unlock_price"),
                    }
                )

        # Consume the credits atomically
        if access:
            await consume_credits(access["id"], credit_cost, token=token)
            logger.info(
                "[RESUME] Credits consumed | user=%s | bot=%s | cost=%d | action=resume_analysis",
                user_id, bot_id, credit_cost,
            )

    # 3. Read and validate file uploads
    file_bytes = await file.read()
    file_size_mb = len(file_bytes) / (1024 * 1024)
    if file_size_mb > 5.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the maximum 5MB limit."
        )

    filename_lower = file.filename.lower()
    extracted_text = ""

    try:
        if filename_lower.endswith(".pdf"):
            logger.info(f"[RESUME] Extracting PDF text for {file.filename}...")
            extracted_text = await extract_text_from_pdf(file_bytes)
        elif filename_lower.endswith((".png", ".jpg", ".jpeg")):
            logger.info(f"[RESUME] Extracting Image text (OCR) for {file.filename}...")
            extracted_text = await extract_text_from_image(file_bytes)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file format. Please upload a PDF, PNG, JPG, or JPEG file."
            )
    except Exception as exc:
        logger.error(f"[RESUME] PDF/Image text extraction failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse resume: {str(exc)}"
        )

    extracted_text = extracted_text.strip()
    if len(extracted_text) < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract sufficient text from your resume. Please make sure it is a readable document."
        )

    # 4. Construct System Prompt & User Prompts
    bot_name = bot.get("name", "AI Mentor")
    persona_config = bot.get("persona_config", {})
    tone = persona_config.get("tone", "Professional")
    expertise = persona_config.get("expertise", [])
    focus_areas = ", ".join(expertise) if expertise else "general professional development"

    system_prompt = f"""You are {bot_name}, a specialized AI mentor persona.
Your personality and domain profile:
- Tone: {tone}
- Domain Expertise and Focus: {focus_areas}

You are conducting a premium, highly critical Resume Review for a mentee.
Analyze the resume through the lens of your specific domain expertise ({focus_areas}) and maintain your designated tone ({tone}).

Strict Rules:
1. Act as the professional mentor ({bot_name}). Never break character or refer to yourself as an AI assistant.
2. Structure your review clearly using markdown.
3. Be professional, highly actionable, encouraging, yet critically honest to help the mentee stand out in job applications.
"""

    user_prompt = f"""Below is the extracted text from my resume. Please perform a thorough review and provide detailed, actionable feedback.

--- EXTRACTED RESUME TEXT ---
{extracted_text}
----------------------------

Please structure your review precisely with the following sections:
1. **Resume Score & Executive Summary:** An overall score out of 100, followed by a 2-3 sentence high-level summary of your impression.
2. **Domain-Specific Alignment:** Evaluate how well the skills, projects, and experiences align with industry expectations in your field ({focus_areas}).
3. **Key Strengths:** Highlight 2-3 aspects of the resume that are written well or represent strong qualifications.
4. **Critical Areas for Improvement:** List 3-4 specific suggestions for improving the content, formatting, or clarity.
5. **STAR Accomplishment Rephrasing Examples:** Take at least 2 weak or standard bullet points from the extracted text above, and show a "Before" and "After" rephrasing utilizing the STAR (Situation, Task, Action, Result) or Google XYZ (Accomplished [X] as measured by [Y] by doing [Z]) framework to maximize impact.
6. **Actionable Next Steps:** A bulleted checklist of immediate actions to take.
7. **Engaging Follow-up Question:** End your review by explicitly mentioning specific projects, internships, or skills you noticed in their resume, and ask an open-ended question about what they are planning to do next in their career. Keep the conversation going!
"""

    # 5. Query Groq LLM (ChatGroq)
    try:
        llm = ChatGroq(
            model=settings.LLM_MODEL,
            api_key=settings.GROQ_API_KEY,
            temperature=0.4,  # lower temp for analytical precision
            max_tokens=2048,
        )
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        response = await llm.ainvoke(messages)
        ai_review_feedback = response.content if hasattr(response, "content") else str(response)
    except Exception as e:
        logger.error(f"[RESUME] Groq LLM resume analysis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate resume review: {str(e)}"
        )

    # 6. Save User message with XML Tag Wrapped OCR text (Perfect Memory Context)
    user_message_content = f"[Uploaded Resume: {file.filename}]\n\n<resume_content>\n{extracted_text}\n</resume_content>"
    await save_message(
        user_id=user_id,
        bot_id=bot_id,
        role="user",
        content=user_message_content,
        token=token
    )

    # 7. Save AI's response to Supabase messages
    if ai_review_feedback:
        await save_message(
            user_id=user_id,
            bot_id=bot_id,
            role="assistant",
            content=ai_review_feedback,
            token=token
        )

    # 8. Warm up Redis chat history and Invalidate full history cache
    cache_key = f"chat_history:{bot_id}:{user_id}"
    llm_history = await get_cache(cache_key)
    if llm_history is not None:
        # Keep Redis cache lightweight: save the file identifier, not the 5000 character OCR string
        llm_history.append({"role": "user", "content": f"[Uploaded Resume: {file.filename}]"})
        llm_history.append({"role": "assistant", "content": ai_review_feedback})
        llm_history = llm_history[-5:]
        await set_cache(cache_key, llm_history, expire=3600)

    # Invalidate full history cache so text chat displays this new interaction
    await invalidate_cache(f"full_history:{bot_id}:{user_id}")

    return {
        "status": "success",
        "bot_id": bot_id,
        "filename": file.filename,
        "review": ai_review_feedback,
    }
