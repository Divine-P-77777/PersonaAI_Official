-- PersonaBot — Row Level Security (RLS) Policies
-- Run after supabase_schema.sql

-- Enable RLS on all tables
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots               ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_batches  ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources       ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_chunks        ENABLE ROW LEVEL SECURITY;

-- users
-- Users can read and update only their own profile row.
CREATE POLICY "users: read own row" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users: update own row" ON users
    FOR UPDATE USING (auth.uid() = id);

-- A trigger-based insert is preferred (see onboarding hook), but allow it:
CREATE POLICY "users: insert own row" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- bots
-- Alumni owners can fully manage their bots.
CREATE POLICY "bots: owner full access" ON bots
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.id = bots.owner_id)
    );

-- Any authenticated user can READ bots (they interact with them),
-- but we only show 'ready' (Live) bots to the public. 
-- Owners can always see their own bots (even in 'draft').
CREATE POLICY "bots: authenticated can read" ON bots
    FOR SELECT USING (
        status = 'ready' OR owner_id = auth.uid()
    );

-- ingestion_batches
-- Only the bot owner can manage batches.
CREATE POLICY "batches: owner full access" ON ingestion_batches
    FOR ALL USING (
        bot_id IN (SELECT id FROM bots WHERE owner_id = auth.uid())
    );

-- data_sources
-- Only the bot owner can manage data sources.
CREATE POLICY "data_sources: owner full access" ON data_sources
    FOR ALL USING (
        bot_id IN (SELECT id FROM bots WHERE owner_id = auth.uid())
    );

-- data_chunks
-- Only the bot owner can manage chunks (insert / delete).
CREATE POLICY "data_chunks: owner manage" ON data_chunks
    FOR ALL USING (
        bot_id IN (SELECT id FROM bots WHERE owner_id = auth.uid())
    );

-- Any authenticated user can READ chunks (needed for RAG retrieval).
CREATE POLICY "data_chunks: authenticated can read" ON data_chunks
    FOR SELECT USING (auth.role() = 'authenticated');
