"""
Context builder for LLM prompts.
Combines persona config, retrieved chunks, and chat history into a prompt.
"""
from typing import Optional


def build_context(persona_config: dict, chunks: list[str], bot_name: str = "AI Mentor") -> str:
    """Build the full system prompt for the LLM from persona config and retrieved chunks.
    
    Args:
        persona_config: The bot's configuration (greeting, tone, expertise, etc.)
        chunks: Retrieved knowledge base chunks relevant to the query
        bot_name: The bot's display name
    
    Returns:
        A complete system prompt string for the LLM.
    """
    tone = persona_config.get("tone", "Professional")
    expertise = persona_config.get("expertise", [])
    greeting = persona_config.get("greeting", f"Hello! I'm {bot_name}.")

    # Build focus areas string
    focus_areas = ", ".join(expertise) if expertise else "general knowledge"

    # System persona block
    system_prompt = f"""You are {bot_name}, a specialized AI mentor.

Your personality:
- Tone: {tone}
- Focus areas: {focus_areas}
- Opening style: "{greeting}"

Behavior rules:
1. Always answer from the provided context below first.
2. If the context doesn't cover the question, say so honestly and offer what you know.
3. Keep responses clear, concise, and in character.
4. Never break character or claim to be a generic AI.
"""

    # Inject retrieved knowledge
    if chunks:
        context_block = "\n\n---\nRELEVANT KNOWLEDGE BASE CONTEXT:\n"
        for i, chunk in enumerate(chunks, 1):
            context_block += f"\n[{i}] {chunk.strip()}\n"
        context_block += "---"
        system_prompt += context_block
    else:
        system_prompt += "\n\n[No specific knowledge base context was found for this query. Answer from general knowledge.]"

    return system_prompt
