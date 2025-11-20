-- Simple Storage Policies for game-builds bucket (No file extension restrictions)
-- Run this in Supabase SQL Editor if you want to allow any file type

-- ============================================
-- Policy 1: Allow authenticated users to upload any files
-- ============================================
CREATE POLICY "Allow authenticated users to upload game files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'game-builds'
  AND auth.role() = 'authenticated'
);

-- ============================================
-- Policy 2: Allow authenticated users to read files
-- ============================================
CREATE POLICY "Allow authenticated users to read game files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'game-builds'
  AND auth.role() = 'authenticated'
);

-- ============================================
-- Policy 3: Allow authenticated users to update files
-- ============================================
CREATE POLICY "Allow authenticated users to update game files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'game-builds'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'game-builds'
  AND auth.role() = 'authenticated'
);

-- ============================================
-- Policy 4: Allow authenticated users to delete files
-- ============================================
CREATE POLICY "Allow authenticated users to delete game files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'game-builds'
  AND auth.role() = 'authenticated'
);

