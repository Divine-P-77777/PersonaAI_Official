-- Migration: Add bot_gender enum and voice_gender column to bots table.
-- Run this against your Supabase SQL editor if the bots table already exists.

-- Step 1: Create the enum type (safe — skips if it already exists)
DO $$ BEGIN
    CREATE TYPE bot_gender AS ENUM ('male', 'female', 'transgender');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Step 2: Add voice_gender column if it doesn't already exist
ALTER TABLE bots
    ADD COLUMN IF NOT EXISTS voice_gender bot_gender NOT NULL DEFAULT 'female';

-- Step 3: Backfill any existing bots with the default gender
-- (already handled by DEFAULT 'female' above, but explicit for clarity)
UPDATE bots SET voice_gender = 'female' WHERE voice_gender IS NULL;
