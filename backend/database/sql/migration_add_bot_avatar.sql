-- Migration: Add avatar_url column to bots table
-- Run this in your Supabase SQL editor

ALTER TABLE bots
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;
