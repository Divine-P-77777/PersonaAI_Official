-- ============================================================================
-- AskMentor — Payment System Migration
-- ============================================================================
-- Run this against your Supabase project.
-- Adds: monetization columns to bots, and 3 new tables.
--
-- NOTE: Enum types must be created before tables that reference them.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "moddatetime" WITH SCHEMA extensions;

-- ---------------------------------------------------------------------------
-- 1. New ENUM types
-- ---------------------------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pricing_tier_enum') THEN
        CREATE TYPE pricing_tier_enum AS ENUM ('starter', 'standard', 'premium');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_status') THEN
        CREATE TYPE access_status AS ENUM ('free_trial', 'unlocked', 'expired');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
    END IF;
END$$;


-- ---------------------------------------------------------------------------
-- 2. Alter existing `bots` table — add monetization columns
-- ---------------------------------------------------------------------------

ALTER TABLE bots
    ADD COLUMN IF NOT EXISTS is_free              BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS pricing_tier         pricing_tier_enum,
    ADD COLUMN IF NOT EXISTS unlock_price         INTEGER,           -- ₹ amount
    ADD COLUMN IF NOT EXISTS credits_per_pack     INTEGER,           -- credits granted on unlock
    ADD COLUMN IF NOT EXISTS voice_enabled        BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS subscription_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- voice_gender was previously only in persona_config JSONB;
-- ensure the dedicated column exists (the app wrote it via ORM already in some deploys)
ALTER TABLE bots ADD COLUMN IF NOT EXISTS voice_gender TEXT NOT NULL DEFAULT 'female';


-- ---------------------------------------------------------------------------
-- 3. user_monthly_explorations
-- ---------------------------------------------------------------------------
-- One row per (user_id, month). Tracks which mentor bots a user tried free this month.

CREATE TABLE IF NOT EXISTS user_monthly_explorations (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month             TEXT        NOT NULL,                  -- 'YYYY-MM'
    mentors_explored  JSONB       NOT NULL DEFAULT '[]',     -- list of bot_id strings
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique per user-month
CREATE UNIQUE INDEX IF NOT EXISTS ume_user_month_idx
    ON user_monthly_explorations (user_id, month);

-- Auto-update updated_at
CREATE OR REPLACE TRIGGER ume_updated_at
    BEFORE UPDATE ON user_monthly_explorations
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);


-- ---------------------------------------------------------------------------
-- 4. user_bot_access
-- ---------------------------------------------------------------------------
-- Tracks credit-based access (free trial or paid unlock) per user/bot pair.

CREATE TABLE IF NOT EXISTS user_bot_access (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bot_id            UUID          NOT NULL REFERENCES bots(id)  ON DELETE CASCADE,
    status            access_status NOT NULL DEFAULT 'free_trial',
    credits_allowed   INTEGER       NOT NULL,
    credits_used      INTEGER       NOT NULL DEFAULT 0,
    access_expires_at TIMESTAMPTZ,                           -- NULL = no expiry
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Unique: one access row per (user, bot)
CREATE UNIQUE INDEX IF NOT EXISTS uba_user_bot_idx ON user_bot_access (user_id, bot_id);
CREATE        INDEX IF NOT EXISTS uba_status_idx   ON user_bot_access (status);

-- Auto-update updated_at
CREATE OR REPLACE TRIGGER uba_updated_at
    BEFORE UPDATE ON user_bot_access
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);


-- ---------------------------------------------------------------------------
-- 5. payment_transactions
-- ---------------------------------------------------------------------------
-- Audit log of every Cashfree payment attempt. Status only flips to 'success'
-- after server-side webhook signature verification.

CREATE TABLE IF NOT EXISTS payment_transactions (
    id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id         TEXT           UNIQUE NOT NULL,         -- Our internal ID
    cf_order_id      TEXT,                                   -- Cashfree's cf_order_id
    cf_payment_id    TEXT,                                   -- Cashfree's payment_id (from webhook)
    payment_provider TEXT           NOT NULL DEFAULT 'cashfree',
    user_id          UUID           REFERENCES users(id) ON DELETE SET NULL,
    bot_id           UUID           REFERENCES bots(id)  ON DELETE SET NULL,
    amount           INTEGER        NOT NULL,                -- ₹ (integer)
    currency         TEXT           NOT NULL DEFAULT 'INR',
    status           payment_status NOT NULL DEFAULT 'pending',
    webhook_payload  JSONB,                                  -- Full Cashfree webhook body for audit
    verified_at      TIMESTAMPTZ,                           -- Set after HMAC verification
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pt_user_id_idx  ON payment_transactions (user_id);
CREATE INDEX IF NOT EXISTS pt_bot_id_idx   ON payment_transactions (bot_id);
CREATE INDEX IF NOT EXISTS pt_status_idx   ON payment_transactions (status);

-- Auto-update updated_at
CREATE OR REPLACE TRIGGER pt_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);


-- ---------------------------------------------------------------------------
-- 6. RPC: increment_credits_used (atomic credit deduction)
-- ---------------------------------------------------------------------------
-- Called by the chat router to deduct credits without a race condition.

CREATE OR REPLACE FUNCTION increment_credits_used(
    p_access_id UUID,
    p_cost      INTEGER
)
RETURNS SETOF user_bot_access
LANGUAGE sql
AS $$
    UPDATE user_bot_access
    SET    credits_used = credits_used + p_cost,
           updated_at   = NOW()
    WHERE  id = p_access_id
    RETURNING *;
$$;


-- ---------------------------------------------------------------------------
-- 7. Row-Level Security (RLS) policies
-- ---------------------------------------------------------------------------

-- user_monthly_explorations: user can read/write their own row
ALTER TABLE user_monthly_explorations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own explorations" ON user_monthly_explorations;
CREATE POLICY "Users manage own explorations"
    ON user_monthly_explorations
    FOR ALL
    USING (user_id = auth.uid());

-- user_bot_access: user can read their own access rows
ALTER TABLE user_bot_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own access" ON user_bot_access;
CREATE POLICY "Users read own access"
    ON user_bot_access
    FOR SELECT
    USING (user_id = auth.uid());

-- payment_transactions: user can read their own transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own transactions" ON payment_transactions;
CREATE POLICY "Users read own transactions"
    ON payment_transactions
    FOR SELECT
    USING (user_id = auth.uid());

-- ✅ Service role bypasses RLS automatically (webhook handler uses service role).
