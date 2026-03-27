-- PersonaBot — Storage Configuration
-- Run this in your Supabase SQL Editor.

-- 1. Create the 'avatars' bucket (public = true means files have public URLs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS Policies for the 'avatars' bucket
-- File path structure (within the bucket): {user_id}/{filename}.ext
-- storage.foldername(name) returns: ['{user_id}'] → index [1] is the user_id

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Avatar public read" ON storage.objects;
DROP POLICY IF EXISTS "Avatar owner insert" ON storage.objects;
DROP POLICY IF EXISTS "Avatar owner update" ON storage.objects;
DROP POLICY IF EXISTS "Avatar owner delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Policy: Allow anyone to view avatars (bucket is public)
CREATE POLICY "Avatar public read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Policy: Allow authenticated users to upload into their own folder
-- Path inside bucket: {user_id}/{filename} → foldername gives ['{user_id}'] → [1]
CREATE POLICY "Avatar owner insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to update files in their own folder
CREATE POLICY "Avatar owner update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to delete their own avatar files
CREATE POLICY "Avatar owner delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
);
