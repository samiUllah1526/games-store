-- Test Authentication and RLS Policies
-- This will return null in SQL Editor (expected - no user context)
-- But should work when called from the client with JWT token

-- Check current auth context (will be null in SQL Editor)
SELECT auth.uid() as current_user_id;

-- Test if we can see developers table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'developers';

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'developers'
ORDER BY policyname;

-- Note: To test with actual user context, you need to:
-- 1. Make a request from your app (not SQL Editor)
-- 2. The JWT token will be included automatically
-- 3. auth.uid() will return the user's ID in that context

