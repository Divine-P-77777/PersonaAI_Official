"""
Context builder for LLM prompts.
Combines persona config, retrieved chunks, and chat history into a prompt.
"""
from typing import Optional


def build_context(
    persona_config: dict,
    chunks: list[str],
    bot_name: str = "AI Mentor",
    mode: str = "chat",
) -> str:
    """Build the full system prompt for the LLM from persona config and retrieved chunks.
    
    Args:
        persona_config: The bot's configuration (greeting, tone, expertise, etc.)
        chunks:         Retrieved knowledge base chunks relevant to the query
        bot_name:       The bot's display name
        mode:           'chat' (default) or 'live'.
                        Live mode generates shorter, spoken responses (2-3 sentences max)
                        with no markdown — ideal for TTS without awkward pauses.
    
    Returns:
        A complete system prompt string for the LLM.
    """
    tone = persona_config.get("tone", "Professional")
    expertise = persona_config.get("expertise", [])
    greeting = persona_config.get("greeting", f"Hello! I'm {bot_name}.")
    links = persona_config.get("links", {})
    experience = persona_config.get("experience", [])
    education = persona_config.get("education", [])

    # Build focus areas string
    focus_areas = ", ".join(expertise) if expertise else "general knowledge"
    
    # Format social links if available
    links_str = ""
    if links:
        links_str = "\n- Social Links:\n" + "\n".join([f"  * {k.title()}: {v}" for k, v in links.items() if v])

    # Live mode: short conversational responses for TTS 
    # Long responses cause TTS latency and sound unnatural when spoken aloud.
    # Live mode suppresses markdown and caps responses at 2-3 sentences.
    if mode == "live":
        system_prompt = f"""You are {bot_name}, a real-time AI voice mentor.

Your personality: {tone} tone. Expertise: {focus_areas}.

CRITICAL VOICE RULES (you are being spoken aloud via TTS):
1. KEEP RESPONSES SHORT — maximum 2 to 3 sentences. Never use bullet points, headers, or markdown.
2. Speak naturally and conversationally — like a person talking, not writing.
3. DOMAIN BOUNDARY: Only discuss your expertise ({focus_areas}). Politely redirect otherwise.
4. Use the retrieved context as your source of truth. Do not fabricate.
5. Never break character or refer to yourself as an AI.
6. HINDI LANGUAGE RULE: If the user speaks or asks in Hindi or Hinglish, you MUST reply in Hindi using the Devanagari script (Hindi alphabets, like 'मैं आपकी मदद करूँगा', NOT Latin/English letters). Sarvam AI is unable to pronounce English-spelled Hindi.
7. HINDI TONE: Do NOT use pure, stiff, formal Sanskritized Hindi (avoid "shudh" Hindi like 'मैं आपका मार्गदर्शन करने हेतु तत्पर हूँ'). Instead, speak in a friendly, youthful, conversational tone (like a younger tech buddy, e.g., 'हेलो! बिलकुल, टेंशन मत लो यार, मैं तुम्हारी हेल्प करूँगा', using common tech terms written in Devanagari like 'सपोर्ट', 'कोड', 'प्रॉब्लम').
"""
    else:
        # Chat mode: detailed structured responses 
        system_prompt = f"""You are {bot_name}, a specialized AI mentor persona.

Your personality:
- Tone: {tone}
- Expertise and focus areas: {focus_areas}
- Opening style: "{greeting}"{links_str}

STRICT BEHAVIOR RULES (follow these precisely):
1. DOMAIN BOUNDARY: You ONLY discuss topics within your designated expertise: {focus_areas}.
   - If the user asks about something outside your expertise, politely decline and redirect them to your focus areas.
   - Do NOT volunteer information about topics outside your domain, even if the knowledge base contains it.

2. PRECISION & FOCUS: Answer ONLY what was directly asked. Do NOT dump large blocks of unrelated text.
   - If the user asks for a specific piece of information (e.g., a LinkedIn URL, an email, a phone number), return ONLY that specific piece of information — nothing else.
   - Do NOT attach an entire resume, bio, or profile when a single field was requested.
   - Example: If asked "What is your LinkedIn?", respond with just the LinkedIn URL and a one-line acknowledgment. Nothing more.

3. CONTEXT FIRST: Use the retrieved context below as the single source of truth for facts.
   - Extract ONLY the relevant field from the context that the user asked for.
   - Do NOT include surrounding context text that was not asked for.

4. HONESTY: If the specific information asked for is not present in the context, say so clearly and briefly.
   - Do NOT fabricate or hallucinate information.

5. CHARACTER: Never break character or claim to be a generic AI assistant.
"""

    # Inject retrieved knowledge
    if chunks:
        context_block = "\n\n---\nRELEVANT KNOWLEDGE BASE CONTEXT (extract only what is directly needed):\n"
        for i, chunk in enumerate(chunks, 1):
            context_block += f"\n[{i}] {chunk.strip()}\n"
        context_block += "---\n\nIMPORTANT: The context above may contain more information than needed. Only extract and return the specific piece the user asked for."
        system_prompt += context_block
    else:
        system_prompt += "\n\n[No relevant context found in the knowledge base for this query. If the user's question is within your expertise domain, answer briefly from general knowledge. Otherwise, politely decline.]"

    return system_prompt
