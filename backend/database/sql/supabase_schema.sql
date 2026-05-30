-- Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DO $$ BEGIN
    CREATE TYPE user_role       AS ENUM ('user', 'alumni');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE bot_status      AS ENUM ('draft', 'training', 'ready', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Gender enum for bot voice tone selection.
-- 'transgender' maps to a female voice tone by default.
DO $$ BEGIN
    CREATE TYPE bot_gender AS ENUM ('male', 'female', 'transgender');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



DO $$ BEGIN
    CREATE TYPE ingestion_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;



-- Table: users
-- Mirrors auth.users — stores role-based onboarding data.
CREATE TABLE IF NOT EXISTS users (
    id                   UUID PRIMARY KEY,               -- synced from auth.uid()
    email                TEXT UNIQUE NOT NULL,
    display_name         TEXT,
    avatar_url           TEXT,
    role                 user_role NOT NULL DEFAULT 'user',
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: bots
-- Each alumni / professional owns one or more bots (personas).
-- persona_config stores structured form data submitted during onboarding.
CREATE TABLE IF NOT EXISTS bots (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name           TEXT NOT NULL,
    description    TEXT,
    persona_config JSONB NOT NULL DEFAULT '{}',
    -- Example persona_config structure:
    -- {
    --   "greeting":    "Hi! I'm Alex...",
    --   "tone":        "professional",
    --   "expertise":   ["Machine Learning", "Cloud Architecture"],
    --   "experience":  [{"title": "SWE", "company": "Google", "years": 3}],
    --   "education":   [{"degree": "B.Tech", "institute": "IIT Delhi", "year": 2019}],
    --   "links":       {"linkedin": "...", "github": "...", "portfolio": "..."}
    -- }
    status         bot_status NOT NULL DEFAULT 'draft',
    -- voice_gender: drives TTS voice ID selection (male/female/transgender → female voice).
    -- Stored as a typed enum column, not inside persona_config JSONB, so it
    -- can be read cheaply without JSON parsing in the hot live-session path.
    voice_gender   bot_gender NOT NULL DEFAULT 'female',
    avatar_url     TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bots_owner_id_idx ON bots (owner_id);

-- Table: ingestion_batches
-- Groups multiple data_sources submitted together in one dashboard upload.
-- An alumni can submit N items (PDFs, links, text blocks) as one batch.
CREATE TABLE IF NOT EXISTS ingestion_batches (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id          UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    status          ingestion_status NOT NULL DEFAULT 'pending',
    total_files     INT NOT NULL DEFAULT 0,
    processed_files INT NOT NULL DEFAULT 0,
    error_log       JSONB DEFAULT '[]',    -- per-item error messages
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ingestion_batches_bot_id_idx ON ingestion_batches (bot_id);

-- Table: data_sources
-- Replaces the old `documents` table.
-- One row per uploaded item — PDF, image, text blob, URL, or video link.
-- Multiple rows of the same type are allowed per bot (arrays of uploads).
CREATE TABLE IF NOT EXISTS data_sources (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id       UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    batch_id     UUID REFERENCES ingestion_batches(id) ON DELETE SET NULL,
    type         source_type NOT NULL,
    title        TEXT NOT NULL,    -- display label: filename, URL, or first 80 chars of text
    content      TEXT,             -- populated for 'long_text'
    url          TEXT,             -- populated for 'web_link' / 'video_link'
    storage_path TEXT,             -- Supabase Storage path for 'pdf' / 'image'
    file_size    BIGINT,           -- bytes, if applicable
    status       ingestion_status NOT NULL DEFAULT 'pending',
    error_message TEXT,            -- populated if status = 'failed'
    metadata     JSONB NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
    CREATE TYPE source_type     AS ENUM (
        'pdf',          -- uploaded PDF files
        'image',        -- uploaded images (JPG/PNG)
        'long_text',    -- raw text pasted in the dashboard form
        'web_link',     -- URL to be scraped
        'video_link'    -- future: video transcript ingestion
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS data_sources_bot_id_idx    ON data_sources (bot_id);

CREATE INDEX IF NOT EXISTS data_sources_batch_id_idx  ON data_sources (batch_id);

CREATE INDEX IF NOT EXISTS data_sources_status_idx    ON data_sources (status);

-- Table: data_chunks
-- Stores processed text chunks from any data_source type.
-- Embedding is stored inline (Nomic V2-MoE — 768 dimensions).

CREATE TABLE IF NOT EXISTS data_chunks (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    bot_id         UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    chunk_index    INT NOT NULL,
    content        TEXT NOT NULL,
    embedding      VECTOR(768),
    metadata       JSONB NOT NULL DEFAULT '{}',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS data_chunks_bot_id_idx        ON data_chunks (bot_id);

CREATE INDEX IF NOT EXISTS data_chunks_data_source_id_idx ON data_chunks (data_source_id);

-- HNSW index for ultra-fast cosine similarity search
CREATE INDEX IF NOT EXISTS data_chunks_embedding_idx
    ON data_chunks USING hnsw (embedding vector_cosine_ops);

-- Table: messages
-- Stores persistent chat history between a user and a bot.
CREATE TABLE IF NOT EXISTS messages (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bot_id     UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    role       message_role NOT NULL,
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
    CREATE TYPE message_role    AS ENUM ('user', 'assistant', 'system'); --message_role is custom data type
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS messages_user_bot_idx ON messages (user_id, bot_id, created_at DESC);



-- user_wallets: one row per user, tracks free + paid entitlement
CREATE TABLE user_wallets (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    free_bots_unlocked   INTEGER NOT NULL DEFAULT 0,     -- max 2
    total_minutes_used   INTEGER NOT NULL DEFAULT 0,     -- global consumed (free + paid)
    paid_balance_minutes INTEGER NOT NULL DEFAULT 0,     -- purchased top-up minutes
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wallet" ON user_wallets FOR SELECT USING (auth.uid() = user_id);

-- bot_access: tracks which bots a user has unlocked (max 2 free)
CREATE TABLE bot_access (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bot_id      UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, bot_id)
);
ALTER TABLE bot_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bot access" ON bot_access FOR ALL USING (auth.uid() = user_id);

-- transactions: ledger of every Cashfree payment attempt
CREATE TABLE transactions (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cashfree_order_id    TEXT NOT NULL UNIQUE,
    payment_session_id   TEXT NOT NULL,
    amount               NUMERIC(10,2) NOT NULL,
    currency             TEXT NOT NULL DEFAULT 'INR',
    status               TEXT NOT NULL DEFAULT 'pending',  -- pending | paid | failed
    minutes_purchased    INTEGER NOT NULL,
    gateway_response     JSONB DEFAULT '{}',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);

