-- Fix RLS Policies for Developers Table
-- Run this in Supabase SQL Editor if you're getting RLS policy violations

-- First, verify RLS is enabled
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own developer profile" ON developers;
DROP POLICY IF EXISTS "Users can insert their own developer profile" ON developers;
DROP POLICY IF EXISTS "Users can update their own developer profile" ON developers;

-- Recreate policies with explicit checks
CREATE POLICY "Users can view their own developer profile"
  ON developers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own developer profile"
  ON developers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own developer profile"
  ON developers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'developers';

