-- Function: match_data_chunks
-- pgvector similarity search scoped by bot_id (multi-tenant safe).
CREATE OR REPLACE FUNCTION match_data_chunks(
    query_embedding  VECTOR(768),
    match_bot_id     UUID,
    match_count      INT DEFAULT 5,
    similarity_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
    id             UUID,
    data_source_id UUID,
    content        TEXT,
    metadata       JSONB,
    similarity     FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.data_source_id,
        dc.content,
        dc.metadata,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM data_chunks dc
    WHERE
        dc.bot_id = match_bot_id
        AND dc.embedding IS NOT NULL
        AND 1 - (dc.embedding <=> query_embedding) >= similarity_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;


-- Trigger to automatically create a profile in public.users when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name, avatar_url, role, onboarding_completed)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        'user',
        FALSE
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();





-- RPC Functions for wallet tracking and minute deduction

CREATE OR REPLACE FUNCTION increment_minutes_used(p_user_id UUID, p_minutes INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE user_wallets
    SET total_minutes_used = total_minutes_used + p_minutes,
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION consume_one_minute(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_free_limit INTEGER := 20;
    v_used INTEGER;
    v_paid INTEGER;
BEGIN
    -- Get current wallet state
    SELECT total_minutes_used, paid_balance_minutes
    INTO v_used, v_paid
    FROM user_wallets
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        -- If no wallet exists, create one with defaults (first minute consumed)
        INSERT INTO user_wallets (user_id, total_minutes_used, paid_balance_minutes)
        VALUES (p_user_id, 1, 0);
        RETURN;
    END IF;

    IF v_used >= v_free_limit THEN
        -- Exhausted free tier: increment used, decrement paid balance (min 0)
        UPDATE user_wallets
        SET total_minutes_used = total_minutes_used + 1,
            paid_balance_minutes = GREATEST(0, paid_balance_minutes - 1),
            updated_at = NOW()
        WHERE user_id = p_user_id;
    ELSE
        -- Still in free tier: just increment used
        UPDATE user_wallets
        SET total_minutes_used = total_minutes_used + 1,
            updated_at = NOW()
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


