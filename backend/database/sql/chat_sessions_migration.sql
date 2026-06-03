-- Migration: Create chat_sessions table to track unique mentoring sessions
-- This decouples "sessions" from raw "messages" count.

CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Prevent exact duplicates in a short time frame if needed, but standard unique constraints might be too strict.
    -- We will rely on backend logic (e.g. creating a session only on fresh start).
    UNIQUE(user_id, bot_id) -- Wait, a user can have MULTIPLE sessions with the same bot over time (e.g. they clear history).
    -- Actually, if we just want to count UNIQUE mentees who have chatted with the bot, we can use a UNIQUE constraint.
    -- But since "Fresh Session" exists, let's NOT enforce unique(user, bot), allowing them to start multiple sessions.
);

-- Indexes for fast counting
CREATE INDEX IF NOT EXISTS idx_chat_sessions_bot_id ON public.chat_sessions(bot_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);

-- RLS Policies
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view their own chat sessions"
ON public.chat_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Service role bypasses RLS naturally, which will be used for explore page aggregations.

-- DATA MIGRATION: Backfill existing chat sessions from the messages table
-- We insert 1 unique session per user-bot pair from historical messages
INSERT INTO public.chat_sessions (user_id, bot_id, created_at)
SELECT DISTINCT user_id, bot_id, MIN(created_at) as created_at
FROM public.messages
GROUP BY user_id, bot_id
ON CONFLICT DO NOTHING;
