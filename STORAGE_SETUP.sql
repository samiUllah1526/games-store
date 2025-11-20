-- Supabase Storage Setup Instructions
-- Storage buckets and policies are managed via Dashboard UI, not SQL

-- ============================================
-- STEP 1: Create the Storage Bucket
-- ============================================
-- 1. Go to Supabase Dashboard
-- 2. Click "Storage" in the left sidebar
-- 3. Click "New bucket"
-- 4. Name: "game-builds"
-- 5. Make it PUBLIC (toggle "Public bucket" to ON)
-- 6. Click "Create bucket"

-- ============================================
-- STEP 2: Set Up Storage Policies (Optional)
-- ============================================
-- If you want RLS instead of public access:
-- 1. Go to Storage > game-builds
-- 2. Click "Policies" tab
-- 3. Click "New Policy"
-- 4. Create these policies:

-- Policy 1: Allow authenticated users to upload
--   Policy name: "Allow authenticated uploads"
--   Allowed operation: INSERT
--   Policy definition: 
--     (bucket_id = 'game-builds'::text) AND (auth.role() = 'authenticated'::text)

-- Policy 2: Allow authenticated users to read
--   Policy name: "Allow authenticated reads"
--   Allowed operation: SELECT
--   Policy definition:
--     (bucket_id = 'game-builds'::text) AND (auth.role() = 'authenticated'::text)

-- Policy 3: Allow authenticated users to update/delete their files
--   Policy name: "Allow authenticated updates"
--   Allowed operation: UPDATE, DELETE
--   Policy definition:
--     (bucket_id = 'game-builds'::text) AND (auth.role() = 'authenticated'::text)

-- ============================================
-- RECOMMENDED: Make Bucket Public (Easiest)
-- ============================================
-- For development/testing, making the bucket public is easiest:
-- 1. Go to Storage > game-builds
-- 2. Click the settings/gear icon
-- 3. Toggle "Public bucket" to ON
-- 4. Save

-- This allows any authenticated user to upload/read files without RLS policies.

-- ============================================
-- Verify Bucket Setup
-- ============================================
-- Run this query to check if bucket exists:
SELECT * FROM storage.buckets WHERE name = 'game-builds';

