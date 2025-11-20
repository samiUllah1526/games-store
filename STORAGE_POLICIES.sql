-- Storage Policies for game-builds bucket
-- Run this in Supabase SQL Editor

-- ============================================
-- Policy 1: Allow authenticated users to upload game files
-- ============================================
CREATE POLICY "Allow authenticated users to upload game files"
ON storage.objects FOR INSERT
WITH CHECK (
  -- Restrict to game-builds bucket
  bucket_id = 'game-builds'
  -- Allow authenticated users only
  AND auth.role() = 'authenticated'
  -- Allow common game file extensions
  AND (
    storage."extension"(name) = 'apk' OR
    storage."extension"(name) = 'ipa' OR
    storage."extension"(name) = 'zip'
  )
);

-- ============================================
-- Policy 2: Allow authenticated users to read game files
-- ============================================
CREATE POLICY "Allow authenticated users to read game files"
ON storage.objects FOR SELECT
USING (
  -- Restrict to game-builds bucket
  bucket_id = 'game-builds'
  -- Allow authenticated users only
  AND auth.role() = 'authenticated'
);

-- ============================================
-- Policy 3: Allow authenticated users to update their game files
-- ============================================
CREATE POLICY "Allow authenticated users to update game files"
ON storage.objects FOR UPDATE
USING (
  -- Restrict to game-builds bucket
  bucket_id = 'game-builds'
  -- Allow authenticated users only
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  -- Restrict to game-builds bucket
  bucket_id = 'game-builds'
  -- Allow authenticated users only
  AND auth.role() = 'authenticated'
);

-- ============================================
-- Policy 4: Allow authenticated users to delete their game files
-- ============================================
CREATE POLICY "Allow authenticated users to delete game files"
ON storage.objects FOR DELETE
USING (
  -- Restrict to game-builds bucket
  bucket_id = 'game-builds'
  -- Allow authenticated users only
  AND auth.role() = 'authenticated'
);

-- ============================================
-- Verify policies were created
-- ============================================
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;

